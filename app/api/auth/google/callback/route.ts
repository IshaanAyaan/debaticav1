import { NextRequest, NextResponse } from 'next/server'
import { googleDriveService } from '@/lib/google-drive'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/?error=google_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_auth_code', request.url))
  }

  try {
    // Exchange the authorization code for access tokens using our service
    const auth = await googleDriveService.getTokensFromCode(code)
    
    // Store tokens securely (in production, use a proper database)
    // For now, we'll redirect back with success and store in session
    return NextResponse.redirect(new URL('/?google_connected=true&auth=success', request.url))
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
  }
}
