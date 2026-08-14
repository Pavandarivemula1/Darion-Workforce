import { google } from 'googleapis'
import { Readable } from 'stream'

export interface GoogleDriveUploadResult {
  success: boolean
  fileId?: string
  webViewLink?: string
  webContentLink?: string
  error?: string
}

/**
 * Gets an authenticated Google Drive client using either:
 * 1. Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL & GOOGLE_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_JSON)
 * 2. OAuth2 Refresh Token (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
 */
function getGoogleDriveClient() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  // Option 3: OAuth2 Refresh Token (Prioritized)
  if (clientId && clientSecret && refreshToken) {
    const auth = new google.auth.OAuth2(clientId, clientSecret)
    auth.setCredentials({ refresh_token: refreshToken })
    return google.drive({ version: 'v3', auth })
  }

  // Option 1: Full Service Account JSON string
  if (serviceAccountJson) {
    try {
      const credentials = JSON.parse(serviceAccountJson)
      const auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
      })
      return google.drive({ version: 'v3', auth })
    } catch (e) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', e)
    }
  }

  // Option 2: Individual Service Account Email + Private Key
  if (clientEmail && rawPrivateKey) {
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n')
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
    })
    return google.drive({ version: 'v3', auth })
  }

  return null
}

/**
 * Uploads a video buffer directly to Google Drive
 */
export async function uploadBufferToGoogleDrive(params: {
  buffer: Buffer
  fileName: string
  mimeType?: string
  folderId?: string
}): Promise<GoogleDriveUploadResult> {
  const drive = getGoogleDriveClient()

  if (!drive) {
    return {
      success: false,
      error: 'Google Drive credentials not found in environment variables (GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_CLIENT_ID/REFRESH_TOKEN).',
    }
  }

  try {
    const folderId = params.folderId || process.env.GOOGLE_DRIVE_FOLDER_ID || undefined
    const mimeType = params.mimeType || 'video/webm'

    const fileMetadata: { name: string; parents?: string[]; mimeType: string } = {
      name: params.fileName,
      mimeType,
    }

    if (folderId) {
      fileMetadata.parents = [folderId]
    }

    const stream = Readable.from(params.buffer)

    // 1. Upload the file to Google Drive
    const response = await drive.files.create({
      supportsAllDrives: true,
      requestBody: fileMetadata,
      media: {
        mimeType,
        body: stream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    })

    const fileId = response.data.id
    if (!fileId) {
      return { success: false, error: 'Google Drive did not return a file ID.' }
    }

    // 2. Set file permissions so anyone with the link can view
    try {
      await drive.permissions.create({
        fileId,
        supportsAllDrives: true,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      })
    } catch (permErr) {
      console.warn('Could not set public permission on Google Drive file:', permErr)
    }

    return {
      success: true,
      fileId,
      webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
      webContentLink: response.data.webContentLink || undefined,
    }
  } catch (err: any) {
    console.error('Google Drive Upload Error:', err)
    return {
      success: false,
      error: err?.message || 'Failed to upload file to Google Drive.',
    }
  }
}
