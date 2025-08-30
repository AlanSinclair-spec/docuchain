import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch data for the dashboard
  const { data: vendors } = await supabase
    .from('vendors')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: documents } = await supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .order('expiry_date', { ascending: true })
    .limit(5)

  const { data: alerts } = await supabase
    .from('alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your vendors.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/vendors/new">
            <Button>Add Vendor</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {vendors && vendors.length > 0 ? `+${vendors.length} from last month` : 'No vendors yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {documents?.some(doc => doc.status === 'expiring_soon') 
                ? `${documents.filter(doc => doc.status === 'expiring_soon').length} expiring soon` 
                : 'All documents up to date'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {alerts?.length ? 'Action required' : 'No active alerts'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vendors?.length ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {vendors?.length ? 'All vendors compliant' : 'No vendors to monitor'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>
              {documents?.length ? 'Recently added or updated documents' : 'No documents found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {documents?.length ? (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.document_type} • Expires {new Date(doc.expiry_date || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {doc.status === 'expiring_soon' ? (
                        <span className="text-amber-500">Expiring soon</span>
                      ) : doc.status === 'expired' ? (
                        <span className="text-red-500">Expired</span>
                      ) : (
                        <span className="text-green-500">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No documents found</p>
                <Link href="/documents/upload">
                  <Button size="sm" variant="outline" className="mt-2">
                    Upload Document
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>
              {alerts?.length ? 'Latest alerts that require your attention' : 'No active alerts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts?.length ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No active alerts</p>
                <p className="text-xs text-muted-foreground">You're all caught up!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
