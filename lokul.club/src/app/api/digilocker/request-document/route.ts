/**
 * Merchant Document Request API
 * 
 * Request GST certificate, trade license, etc. from merchant's DigiLocker
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requestDocument, fetchDocument } from '@/lib/digilocker/client'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Get DigiLocker access token from cookie
    const cookieStore = cookies()
    const diglockerToken = cookieStore.get('digilocker_token')?.value

    if (!diglockerToken) {
      return NextResponse.json(
        { error: 'DigiLocker not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { docType, purpose } = body

    if (!docType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }

    // Request document from user's DigiLocker
    const documentRequest = await requestDocument(
      diglockerToken,
      docType,
      purpose || 'Merchant verification for lokul.club'
    )

    // Get current user
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Store document request in database
    const { data: docRecord, error: dbError } = await supabase
      .from('DigiLockerDocument')
      .insert({
        userId: session.user.id,
        docType,
        docUri: documentRequest.requestId,
        docName: `${docType} - Pending Consent`,
        requestedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      console.error('Failed to store document request:', dbError)
    }

    return NextResponse.json({
      success: true,
      requestId: documentRequest.requestId,
      consentUrl: documentRequest.consentUrl,
      message: 'Document requested. User consent required.',
    })

  } catch (error) {
    console.error('Document request error:', error)
    return NextResponse.json(
      { error: 'Failed to request document' },
      { status: 500 }
    )
  }
}

/**
 * Fetch document after user consent
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const documentUri = searchParams.get('uri')

    if (!documentUri) {
      return NextResponse.json(
        { error: 'Document URI is required' },
        { status: 400 }
      )
    }

    // Get DigiLocker access token
    const cookieStore = cookies()
    const diglockerToken = cookieStore.get('digilocker_token')?.value

    if (!diglockerToken) {
      return NextResponse.json(
        { error: 'DigiLocker not authenticated' },
        { status: 401 }
      )
    }

    // Fetch document content
    const document = await fetchDocument(diglockerToken, documentUri)

    // Get current user
    const supabase = createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Update document record in database
    await supabase
      .from('DigiLockerDocument')
      .update({
        fetchedAt: new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        metadata: document.metadata,
      })
      .eq('docUri', documentUri)
      .eq('userId', session.user.id)

    // TODO: Upload to S3/Supabase Storage and store URL

    return NextResponse.json({
      success: true,
      document: {
        content: document.content,
        format: document.format,
        metadata: document.metadata,
      },
    })

  } catch (error) {
    console.error('Document fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}
