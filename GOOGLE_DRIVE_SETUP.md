# Google Drive Integration Setup Guide

## Overview
This guide explains how to set up and use Google Drive authentication in your Debatica application.

## What's Implemented

### 1. **Google OAuth 2.0 Flow**
- ✅ OAuth 2.0 authentication with Google
- ✅ Access to Google Drive, Docs, Sheets, and Slides
- ✅ Secure token management
- ✅ Read-only access (for security)

### 2. **API Endpoints**
- `/api/google-drive/auth-url` - Generates OAuth URL
- `/api/auth/google/callback` - Handles OAuth callback
- `/api/google-drive/files` - Lists and searches Drive files

### 3. **Features**
- 🔐 **Connect Google Drive** - Authenticate with Google
- 📁 **Browse Drive Files** - View files from your Drive
- 📄 **Add Google Docs/Sheets/Slides** - Link specific documents
- 📤 **Upload Local Files** - Add local files for context

## How to Use

### Step 1: Connect Google Drive
1. Click the **"Connect Google Drive"** button
2. A new window will open with Google's OAuth consent screen
3. Sign in with your Google account
4. Grant permissions for Drive access
5. You'll be redirected back and see "Connected" status

### Step 2: Browse Your Files
1. After connecting, click **"Browse Drive Files"**
2. Your recent Google Drive files will appear
3. Click the **"+"** button to add any file to your project

### Step 3: Add Specific Documents
1. Click **"Add Google Doc"** button
2. Paste a Google Docs/Sheets/Slides URL
3. The document will be linked to your current feature

### Step 4: Use with AI Features
- Connected files provide context for AI analysis
- The AI can reference content from your Google Drive
- Works with all features: Rebuttal Maker, Card Cutter, etc.

## Technical Details

### OAuth Scopes
- `https://www.googleapis.com/auth/drive.readonly` - Read Drive files
- `https://www.googleapis.com/auth/documents.readonly` - Read Google Docs
- `https://www.googleapis.com/auth/spreadsheets.readonly` - Read Google Sheets
- `https://www.googleapis.com/auth/presentations.readonly` - Read Google Slides

### Security Features
- Read-only access (no file modification)
- Secure token storage
- Automatic token refresh
- No data is stored on our servers

## Troubleshooting

### Common Issues

1. **"Not authenticated" error**
   - Reconnect to Google Drive
   - Check if cookies are enabled

2. **Files not loading**
   - Ensure you have files in Google Drive
   - Check internet connection
   - Try refreshing the page

3. **Permission denied**
   - Check if you granted all required permissions
   - Try reconnecting

### Support
If you encounter issues:
1. Check the browser console for error messages
2. Ensure your Google account has Drive enabled
3. Try disconnecting and reconnecting

## Future Enhancements
- File content extraction for AI analysis
- Real-time file synchronization
- Advanced search and filtering
- File organization by project
