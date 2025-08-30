import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle2, Clock, FileX, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { ComplianceStatus } from '@/components/dashboard/compliance-status'

export default async function CompliancePage() {
  const supabase = await createClient()
  
  // Get compliance data
  const { data: vendors } = await supabase
    .from('vendors')
    .select(`
      *,
      documents (
        id,
        document_type,
        status,
        expiry_date,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  const { data: requiredDocTypes } = await supabase
    .from('document_types')
    .select('*')
    .eq('required', true)

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  // Calculate compliance statistics
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const complianceStats = vendors?.reduce((stats, vendor) => {
    const missingDocs = requiredDocTypes?.filter(reqDoc =>
      !vendor.documents.some(doc => doc.document_type === reqDoc.name && doc.status === 'active')
    ) || []

    const expiringDocs = vendor.documents.filter(doc => {
      if (!doc.expiry_date) return false
      const expiryDate = new Date(doc.expiry_date)
      return expiryDate <= thirtyDaysFromNow && expiryDate > now
    })

    const expiredDocs = vendor.documents.filter(doc => {
      if (!doc.expiry_date) return false
      return new Date(doc.expiry_date) <= now
    })

    if (missingDocs.length === 0 && expiredDocs.length === 0) {
      stats.compliant++
    } else if (expiredDocs.length > 0) {
      stats.critical++
    } else if (expiringDocs.length > 0 || missingDocs.length > 0) {
      stats.warning++
    }

    stats.total++
    return stats
  }, { total: 0, compliant: 0, warning: 0, critical: 0 }) || { total: 0, compliant: 0, warning: 0, critical: 0 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
          <p className="text-muted-foreground">
            Monitor vendor compliance status and document requirements
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Run Compliance Check
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.total}</div>
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
            <div className="text-2xl font-bold text-green-600">{complianceStats.compliant}</div>
            <p className="text-xs text-muted-foreground">
              {complianceStats.total > 0 ? Math.round((complianceStats.compliant / complianceStats.total) * 100) : 0}% of vendors
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{complianceStats.warning}</div>
            <p className="text-xs text-muted-foreground">
              Missing or expiring documents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceStats.critical}</div>
            <p className="text-xs text-muted-foreground">
              Expired documents
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Compliance Status</CardTitle>
              <CardDescription>
                Current compliance status for all vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendors?.length ? (
                <ComplianceStatus 
                  vendors={vendors} 
                  requiredDocTypes={requiredDocTypes || []}
                />
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">No vendors to monitor</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Add vendors to start tracking their compliance status
                    </p>
                  </div>
                  <Link href="/vendors/new">
                    <Button>Add Vendor</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>
                {alerts?.length ? 'Recent compliance alerts' : 'No active alerts'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts?.length ? (
                <div className="space-y-4">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {alert.alert_type === 'expired' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : alert.alert_type === 'expiry_warning' ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <FileX className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {alerts.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{alerts.length - 5} more alerts
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <p className="text-sm text-muted-foreground">All clear!</p>
                  <p className="text-xs text-muted-foreground">No compliance issues detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
