import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vendorId = formData.get('vendorId') as string
    const documentType = formData.get('documentType') as string
    const expiryDate = formData.get('expiryDate') as string

    if (!file || !vendorId || !documentType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = `${profile.organization_id}/${vendorId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    // Create document record
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        organization_id: profile.organization_id,
        vendor_id: vendorId,
        name: file.name,
        document_type: documentType,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        expiry_date: expiryDate || null,
        status: 'active',
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('documents').remove([filePath])
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ document })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
