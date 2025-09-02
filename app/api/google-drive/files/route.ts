import { NextRequest, NextResponse } from 'next/server'
import { googleDriveService } from '@/lib/google-drive'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated with Google Drive
    if (!googleDriveService.isAuthenticated()) {
      return NextResponse.json({ error: 'Not authenticated with Google Drive' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const mimeType = searchParams.get('mimeType') || ''
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    let files
    if (query) {
      files = await googleDriveService.searchFiles(query, mimeType || undefined)
    } else {
      files = await googleDriveService.listFiles(pageSize)
    }

    return NextResponse.json({ files })
  } catch (error) {
    console.error('Error fetching Google Drive files:', error)
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { auth } = await request.json()
    
    if (!auth) {
      return NextResponse.json({ error: 'Authentication data required' }, { status: 400 })
    }

    // Set credentials for the service
    googleDriveService.setCredentials(auth)
    
    return NextResponse.json({ success: true, message: 'Google Drive connected successfully' })
  } catch (error) {
    console.error('Error setting Google Drive credentials:', error)
    return NextResponse.json({ error: 'Failed to set credentials' }, { status: 500 })
  }
}
