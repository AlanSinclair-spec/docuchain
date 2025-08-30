import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { DocumentList } from '@/components/dashboard/document-list'

export default async function DocumentsPage() {
  const supabase = await createClient()
  
  const { data: documents, error } = await supabase
    .from('documents')
    .select(`
      *,
      vendors (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
  }

  const documentStats = {
    total: documents?.length || 0,
    active: documents?.filter(d => d.status === 'active').length || 0,
    expiring: documents?.filter(d => d.status === 'expiring_soon').length || 0,
    expired: documents?.filter(d => d.status === 'expired').length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage vendor documents and track expiration dates
          </p>
        </div>
        <Link href="/documents/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All uploaded documents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{documentStats.active}</div>
            <p className="text-xs text-muted-foreground">
              Valid documents
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{documentStats.expiring}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{documentStats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Require renewal
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Documents</CardTitle>
          <CardDescription>
            {documents?.length ? 'View and manage all vendor documents' : 'No documents found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents?.length ? (
            <DocumentList documents={documents} />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No documents yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Get started by uploading your first vendor document. You can track expiration dates and compliance status.
                </p>
              </div>
              <Link href="/documents/upload">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Your First Document
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
