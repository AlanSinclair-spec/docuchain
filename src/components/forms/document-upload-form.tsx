'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentUpload } from '@/components/forms/document-upload'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Vendor {
  id: string
  name: string
}

interface DocumentType {
  id: string
  name: string
  required: boolean
  expiry_required: boolean
  default_expiry_days: number | null
}

interface DocumentUploadFormProps {
  vendors: Vendor[]
  documentTypes: DocumentType[]
}

export function DocumentUploadForm({ vendors, documentTypes }: DocumentUploadFormProps) {
  const [selectedVendor, setSelectedVendor] = useState<string>('')
  const [selectedDocType, setSelectedDocType] = useState<string>('')
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = await createClient()

  const handleDocTypeChange = (docTypeName: string) => {
    setSelectedDocType(docTypeName)
    
    // Auto-set expiry date based on document type
    const docType = documentTypes.find(dt => dt.name === docTypeName)
    if (docType?.default_expiry_days) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + docType.default_expiry_days)
      setExpiryDate(expiryDate.toISOString().split('T')[0])
    }
  }

  const handleUploadComplete = async (fileUrl: string, fileName: string, fileSize: number, mimeType: string) => {
    if (!selectedVendor || !selectedDocType) {
      toast.error('Please select a vendor and document type')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      const { error } = await supabase
        .from('documents')
        .insert({
          organization_id: profile.organization_id,
          vendor_id: selectedVendor,
          name: fileName,
          document_type: selectedDocType,
          file_url: fileUrl,
          file_size: fileSize,
          mime_type: mimeType,
          expiry_date: expiryDate || null,
          status: 'active',
          uploaded_by: user.id
        })

      if (error) throw error

      toast.success('Document uploaded successfully')
      router.push('/documents')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save document')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor">Vendor *</Label>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger>
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document_type">Document Type *</Label>
          <Select value={selectedDocType} onValueChange={handleDocTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((docType) => (
                <SelectItem key={docType.id} value={docType.name}>
                  {docType.name} {docType.required && '*'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expiry_date">Expiry Date</Label>
        <Input
          id="expiry_date"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty if the document doesn't expire
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload File</CardTitle>
          <CardDescription>
            Drag and drop your document or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedVendor ? (
            <DocumentUpload
              vendorId={selectedVendor}
              onUploadComplete={handleUploadComplete}
              disabled={isSubmitting}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">Please select a vendor first</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
