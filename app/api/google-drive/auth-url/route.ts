import { NextResponse } from 'next/server'
import { googleDriveService } from '@/lib/google-drive'

export async function GET() {
  try {
    const authUrl = googleDriveService.generateAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating auth URL:', error)
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 })
  }
}
