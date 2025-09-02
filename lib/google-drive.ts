import { google } from 'googleapis'

export interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink?: string
  size?: string
  modifiedTime?: string
}

export interface GoogleDriveAuth {
  accessToken: string
  refreshToken: string
  scope: string
  expiryDate: number
}

class GoogleDriveService {
  private oauth2Client: any
  private drive: any

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/api/auth/google/callback'
    )
  }

  // Generate OAuth URL for user to authorize
  generateAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/presentations.readonly'
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    })
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code: string): Promise<GoogleDriveAuth> {
    const { tokens } = await this.oauth2Client.getToken(code)
    
    return {
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      scope: tokens.scope!,
      expiryDate: tokens.expiry_date!
    }
  }

  // Set credentials and initialize Drive API
  setCredentials(auth: GoogleDriveAuth) {
    this.oauth2Client.setCredentials({
      access_token: auth.accessToken,
      refresh_token: auth.refreshToken,
      scope: auth.scope
    })
    
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client })
  }

  // List files from Google Drive
  async listFiles(pageSize: number = 10): Promise<GoogleDriveFile[]> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.')
    }

    try {
      const response = await this.drive.files.list({
        pageSize,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, size, modifiedTime)',
        orderBy: 'modifiedTime desc'
      })

      return response.data.files || []
    } catch (error) {
      console.error('Error listing Drive files:', error)
      throw error
    }
  }

  // Get file content (for text-based files)
  async getFileContent(fileId: string): Promise<string> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.')
    }

    try {
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      })

      return response.data
    } catch (error) {
      console.error('Error getting file content:', error)
      throw error
    }
  }

  // Search for specific file types
  async searchFiles(query: string, mimeType?: string): Promise<GoogleDriveFile[]> {
    if (!this.drive) {
      throw new Error('Drive API not initialized. Please authenticate first.')
    }

    try {
      let q = `name contains '${query}'`
      if (mimeType) {
        q += ` and mimeType = '${mimeType}'`
      }

      const response = await this.drive.files.list({
        q,
        pageSize: 20,
        fields: 'nextPageToken, files(id, name, mimeType, webViewLink, size, modifiedTime)'
      })

      return response.data.files || []
    } catch (error) {
      console.error('Error searching Drive files:', error)
      throw error
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.oauth2Client.credentials?.access_token
  }

  // Refresh access token if needed
  async refreshAccessToken(): Promise<string | null> {
    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      return credentials.access_token
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }
}

export const googleDriveService = new GoogleDriveService()
