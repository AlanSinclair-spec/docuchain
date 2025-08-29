import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { VendorGrid } from '@/components/dashboard/vendor-grid'

export default async function VendorsPage() {
  const supabase = createClient()
  
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select(`
      *,
      documents (
        id,
        document_type,
        status,
        expiry_date
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vendors:', error)
  }

  const vendorStats = {
    total: vendors?.length || 0,
    compliant: vendors?.filter(v => v.compliance_status === 'approved').length || 0,
    pending: vendors?.filter(v => v.compliance_status === 'pending').length || 0,
    expired: vendors?.filter(v => v.compliance_status === 'expired').length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your vendor relationships and compliance status
          </p>
        </div>
        <Link href="/vendors/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendorStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Active vendor relationships
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{vendorStats.compliant}</div>
            <p className="text-xs text-muted-foreground">
              Fully compliant vendors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{vendorStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting compliance review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{vendorStats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors</CardTitle>
          <CardDescription>
            {vendors?.length ? 'Manage your vendor relationships and documents' : 'No vendors found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vendors?.length ? (
            <VendorGrid vendors={vendors} />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No vendors yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Get started by adding your first vendor. You can manage their documents and track compliance status.
                </p>
              </div>
              <Link href="/vendors/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Vendor
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
