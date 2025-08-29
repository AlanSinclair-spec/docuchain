import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentUploadForm } from '@/components/forms/document-upload-form'

export default async function DocumentUploadPage() {
  const supabase = createClient()
  
  // Get vendors for the dropdown
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, name')
    .order('name')

  // Get document types
  const { data: documentTypes } = await supabase
    .from('document_types')
    .select('*')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Document</h1>
        <p className="text-muted-foreground">
          Upload a new vendor document and set its expiration date
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
          <CardDescription>
            Select a vendor and upload their document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm 
            vendors={vendors || []} 
            documentTypes={documentTypes || []}
          />
        </CardContent>
      </Card>
    </div>
  )
}
