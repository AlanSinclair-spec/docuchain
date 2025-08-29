'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface VendorFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  initialData?: any
}

export function VendorForm({ onSubmit, initialData }: VendorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Vendor Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter vendor name"
            defaultValue={initialData?.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor_type">Vendor Type</Label>
          <Select name="vendor_type" defaultValue={initialData?.vendor_type}>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supplier">Supplier</SelectItem>
              <SelectItem value="contractor">Contractor</SelectItem>
              <SelectItem value="consultant">Consultant</SelectItem>
              <SelectItem value="service_provider">Service Provider</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            placeholder="vendor@example.com"
            defaultValue={initialData?.contact_email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            defaultValue={initialData?.contact_phone}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax_id">Tax ID / EIN</Label>
        <Input
          id="tax_id"
          name="tax_id"
          placeholder="12-3456789"
          defaultValue={initialData?.tax_id}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Address Information</CardTitle>
          <CardDescription>
            Enter the vendor's business address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street"
              placeholder="123 Main Street"
              defaultValue={initialData?.address?.street}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="New York"
                defaultValue={initialData?.address?.city}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                name="state"
                placeholder="NY"
                defaultValue={initialData?.address?.state}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP/Postal Code</Label>
              <Input
                id="zip"
                name="zip"
                placeholder="10001"
                defaultValue={initialData?.address?.zip}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="United States"
                defaultValue={initialData?.address?.country || 'United States'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Vendor'}
        </Button>
      </div>
    </form>
  )
}
