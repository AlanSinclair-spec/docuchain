'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Trash2, FileText, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Vendor {
  id: string
  name: string
  vendor_type: string | null
  contact_email: string | null
  compliance_status: 'pending' | 'approved' | 'expired' | 'rejected'
  risk_score: number
  created_at: string
  documents?: Array<{
    id: string
    document_type: string
    status: string
    expiry_date: string | null
  }>
}

interface VendorGridProps {
  vendors: Vendor[]
}

export function VendorGrid({ vendors }: VendorGridProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-blue-600'
    return 'text-green-600'
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => {
        const documentCount = vendor.documents?.length || 0
        const expiringDocs = vendor.documents?.filter(doc => 
          doc.status === 'expiring_soon' || doc.status === 'expired'
        ).length || 0

        return (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{vendor.name}</CardTitle>
                  <CardDescription>
                    {vendor.vendor_type || 'General Vendor'}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/vendors/${vendor.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/vendors/${vendor.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Vendor
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Vendor
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(vendor.compliance_status)}>
                  {vendor.compliance_status.charAt(0).toUpperCase() + vendor.compliance_status.slice(1)}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Risk: <span className={getRiskColor(vendor.risk_score)}>{vendor.risk_score}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{documentCount} documents</span>
                </div>
                {expiringDocs > 0 && (
                  <div className="flex items-center space-x-1 text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{expiringDocs} expiring</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                Added {formatDate(vendor.created_at)}
              </div>

              <div className="flex space-x-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href={`/vendors/${vendor.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/vendors/${vendor.id}/documents`}>
                    <FileText className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
