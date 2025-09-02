# Google Cloud Console Setup Guide

## 🚨 **IMPORTANT: Fix the OAuth Error**

You're getting "Error 401: invalid_client" because the OAuth client isn't properly configured. Follow these steps:

## 📋 **Step-by-Step Setup**

### 1. **Go to Google Cloud Console**
- Visit: https://console.cloud.google.com/
- Sign in with your Google account 

### 2. **Create or Select Project**
- Click on the project dropdown at the top
- Click "New Project" or select existing project
- Name it something like "Debatica App"

### 3. **Enable Google Drive API**
- In the left sidebar, click "APIs & Services" → "Library"
- Search for "Google Drive API"
- Click on it and click "Enable"

### 4. **Configure OAuth Consent Screen**
- Go to "APIs & Services" → "OAuth consent screen"
- Choose "External" user type
- Fill in required fields:
  - App name: "Debatica"
  - User support email: your email
  - Developer contact email: your email
- Click "Save and Continue"
- Skip scopes for now, click "Save and Continue"
- Add test users (your email), click "Save and Continue"

### 5. **Create OAuth 2.0 Credentials**
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth 2.0 Client IDs"
- Choose "Web application"
- Name: "Debatica Web Client"
- **Authorized redirect URIs:**
  - `http://localhost:3000/api/auth/google/callback`
  - `http://localhost:3000/api/auth/callback/google`
- Click "Create"

### 6. **Copy Your New Credentials**
- You'll get a new Client ID and Client Secret
- **IMPORTANT:** These are different from what you have now!

### 7. **Update Your Environment Variables**
Replace the old credentials with the new ones in your `.env` file.

## 🔑 **What You'll Get**

After setup, you'll have:
- ✅ **New Client ID** (different from current one)
- ✅ **New Client Secret** 
- ✅ **Properly configured OAuth consent screen**
- ✅ **Enabled Google Drive API**

## 🧪 **Test the Fix**

1. Update your `.env` with new credentials
2. Restart your server
3. Try connecting to Google Drive again

## 📞 **Need Help?**

If you still get errors:
1. Check that the redirect URI exactly matches
2. Ensure you're using the new Client ID (not the old one)
3. Make sure the Google Drive API is enabled
4. Verify your email is added as a test user

## 🎯 **Quick Fix Command**

Once you have new credentials, run:
```bash
# Update your .env file with new credentials
echo 'GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID' > .env
echo 'GOOGLE_CLIENT_SECRET=YOUR_NEW_CLIENT_SECRET' >> .env
echo 'GOOGLE_REDIRECT_URL=http://localhost:3000/api/auth/google/callback' >> .env
```
