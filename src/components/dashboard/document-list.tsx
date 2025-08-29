'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Download, Eye, Edit, Trash2, Calendar, User } from 'lucide-react'
import { formatDate, formatFileSize, getFileType, calculateDaysUntil } from '@/lib/utils'

interface Document {
  id: string
  name: string
  document_type: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  expiry_date: string | null
  status: 'active' | 'expired' | 'expiring_soon' | 'archived'
  created_at: string
  vendors?: {
    id: string
    name: string
  }
}

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getExpiryInfo = (expiryDate: string | null, status: string) => {
    if (!expiryDate) return null
    
    const daysUntil = calculateDaysUntil(expiryDate)
    
    if (status === 'expired') {
      return `Expired ${Math.abs(daysUntil)} days ago`
    } else if (status === 'expiring_soon') {
      return `Expires in ${daysUntil} days`
    } else {
      return `Expires ${formatDate(expiryDate)}`
    }
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {document.name}
                </h3>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    {document.vendors?.name || 'Unknown Vendor'}
                  </span>
                  <span>{document.document_type}</span>
                  <span>{getFileType(document.mime_type || '')}</span>
                  {document.file_size && (
                    <span>{formatFileSize(document.file_size)}</span>
                  )}
                </div>
                {document.expiry_date && (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {getExpiryInfo(document.expiry_date, document.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(document.status)}>
              {document.status.replace('_', ' ')}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" />
                    View Document
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={document.file_url} download>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/documents/${document.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}
