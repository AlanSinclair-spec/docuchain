'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, CheckCircle2, Clock, FileText, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Vendor {
  id: string
  name: string
  compliance_status: string
  documents: Array<{
    id: string
    document_type: string
    status: string
    expiry_date: string | null
    created_at: string
  }>
}

interface DocumentType {
  id: string
  name: string
  required: boolean
}

interface ComplianceStatusProps {
  vendors: Vendor[]
  requiredDocTypes: DocumentType[]
}

export function ComplianceStatus({ vendors, requiredDocTypes }: ComplianceStatusProps) {
  const calculateComplianceScore = (vendor: Vendor) => {
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const missingDocs = requiredDocTypes.filter(reqDoc =>
      !vendor.documents.some(doc => doc.document_type === reqDoc.name && doc.status === 'active')
    )

    const expiringDocs = vendor.documents.filter(doc => {
      if (!doc.expiry_date) return false
      const expiryDate = new Date(doc.expiry_date)
      return expiryDate <= thirtyDaysFromNow && expiryDate > now
    })

    const expiredDocs = vendor.documents.filter(doc => {
      if (!doc.expiry_date) return false
      return new Date(doc.expiry_date) <= now
    })

    let score = 100
    score -= missingDocs.length * 20
    score -= expiredDocs.length * 15
    score -= expiringDocs.length * 5
    
    return {
      score: Math.max(0, score),
      missing: missingDocs,
      expiring: expiringDocs,
      expired: expiredDocs,
      isCompliant: missingDocs.length === 0 && expiredDocs.length === 0
    }
  }

  const getStatusColor = (score: number, isCompliant: boolean) => {
    if (!isCompliant && score < 60) return 'text-red-600'
    if (score < 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = (score: number, isCompliant: boolean) => {
    if (!isCompliant && score < 60) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (score < 80) return <Clock className="h-4 w-4 text-yellow-600" />
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
  }

  const getStatusBadge = (score: number, isCompliant: boolean) => {
    if (!isCompliant && score < 60) return <Badge className="bg-red-100 text-red-800">Critical</Badge>
    if (score < 80) return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
    return <Badge className="bg-green-100 text-green-800">Compliant</Badge>
  }

  return (
    <div className="space-y-4">
      {vendors.map((vendor) => {
        const compliance = calculateComplianceScore(vendor)
        
        return (
          <div key={vendor.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(compliance.score, compliance.isCompliant)}
                <div>
                  <h3 className="font-medium">{vendor.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vendor.documents.length} documents
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(compliance.score, compliance.isCompliant)}
                <span className={`text-sm font-medium ${getStatusColor(compliance.score, compliance.isCompliant)}`}>
                  {compliance.score}%
                </span>
              </div>
            </div>

            <Progress value={compliance.score} className="h-2" />

            {(compliance.missing.length > 0 || compliance.expired.length > 0 || compliance.expiring.length > 0) && (
              <div className="space-y-2 text-sm">
                {compliance.missing.length > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <FileText className="h-4 w-4" />
                    <span>Missing: {compliance.missing.map(doc => doc.name).join(', ')}</span>
                  </div>
                )}
                {compliance.expired.length > 0 && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Expired: {compliance.expired.length} documents</span>
                  </div>
                )}
                {compliance.expiring.length > 0 && (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <Clock className="h-4 w-4" />
                    <span>Expiring soon: {compliance.expiring.length} documents</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/vendors/${vendor.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/vendors/${vendor.id}/documents`}>
                  <FileText className="h-4 w-4 mr-1" />
                  Manage Documents
                </Link>
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
