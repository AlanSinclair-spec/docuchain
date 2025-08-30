import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VendorForm } from '@/components/forms/vendor-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewVendorPage() {
  const createVendor = async (formData: FormData) => {
    'use server'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Get user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      throw new Error('Profile not found')
    }

    const vendorData = {
      organization_id: profile.organization_id,
      name: formData.get('name') as string,
      vendor_type: formData.get('vendor_type') as string,
      tax_id: formData.get('tax_id') as string,
      contact_email: formData.get('contact_email') as string,
      contact_phone: formData.get('contact_phone') as string,
      address: {
        street: formData.get('street') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zip: formData.get('zip') as string,
        country: formData.get('country') as string,
      },
      compliance_status: 'pending' as const,
      risk_score: 50, // Default risk score
    }

    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert(vendorData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    redirect(`/vendors/${vendor.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Vendor</h1>
        <p className="text-muted-foreground">
          Create a new vendor profile to manage their documents and compliance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Information</CardTitle>
          <CardDescription>
            Enter the basic information for your new vendor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VendorForm onSubmit={createVendor} />
        </CardContent>
      </Card>
    </div>
  )
}
