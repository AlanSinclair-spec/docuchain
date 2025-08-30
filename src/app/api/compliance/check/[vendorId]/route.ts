import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const { vendorId } = await params
  try {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const supabase = createClient()
    
    // Validate API key
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('api_key', apiKey)
      .single() as { data: { id: string } | null }

    if (!org) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    // Get vendor with documents
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select(`
        *,
        documents (*)
      `)
      .eq('id', vendorId)
      .eq('organization_id', org!.id)
      .single() as { data: any | null, error: any }

    if (error || !vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Get required document types
    const { data: requiredDocs } = await supabase
      .from('document_types')
      .select('*')
      .eq('organization_id', org!.id)
      .eq('required', true) as { data: any[] | null }

    // Check compliance
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const missingDocs = requiredDocs?.filter((reqDoc: any) =>
      !vendor!.documents.some((doc: any) => doc.document_type === reqDoc.name && doc.status === 'active')
    ).map((doc: any) => doc.name) || []

    const expiringDocs = vendor!.documents
      .filter((doc: any) => {
        if (!doc.expiry_date) return false
        const expiryDate = new Date(doc.expiry_date)
        return expiryDate <= thirtyDaysFromNow && expiryDate > now
      })
      .map((doc: any) => ({
        name: doc.name,
        type: doc.document_type,
        expiresIn: Math.ceil((new Date(doc.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }))

    const expiredDocs = vendor!.documents
      .filter((doc: any) => {
        if (!doc.expiry_date) return false
        return new Date(doc.expiry_date) <= now
      })
      .map((doc: any) => ({
        name: doc.name,
        type: doc.document_type,
        expiredDaysAgo: Math.ceil((now.getTime() - new Date(doc.expiry_date).getTime()) / (1000 * 60 * 60 * 24))
      }))

    // Calculate compliance score
    let score = 100
    score -= missingDocs.length * 20
    score -= expiredDocs.length * 15
    score -= expiringDocs.length * 5
    score = Math.max(0, score)

    const compliant = missingDocs.length === 0 && expiredDocs.length === 0

    // Log the check
    await supabase
      .from('compliance_checks')
      .insert({
        organization_id: org!.id,
        vendor_id: vendorId,
        check_type: 'api_check',
        status: compliant ? 'passed' : 'failed',
        details: {
          missing: missingDocs,
          expiring: expiringDocs,
          expired: expiredDocs,
          score
        },
        api_call: true
      } as any)

    return NextResponse.json({
      vendorId: vendorId,
      vendorName: vendor!.name,
      compliant,
      score,
      missing: missingDocs,
      expiring: expiringDocs,
      expired: expiredDocs,
      lastChecked: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
