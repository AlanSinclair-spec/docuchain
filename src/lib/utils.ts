import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatFileSize(bytes: number = 0) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function getFileExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase()
}

export function getFileType(mimeType: string) {
  if (!mimeType) return 'File'
  
  const type = mimeType.split('/')[0]
  switch (type) {
    case 'image':
      return 'Image'
    case 'application':
      if (mimeType.includes('pdf')) return 'PDF'
      if (mimeType.includes('word')) return 'Word Document'
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'Spreadsheet'
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation'
      return 'Document'
    case 'text':
      return 'Text File'
    default:
      return 'File'
  }
}

export function calculateDaysUntil(expiryDate: string | Date) {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getComplianceStatus(expiryDate: string | Date) {
  const daysUntil = calculateDaysUntil(expiryDate)
  
  if (daysUntil < 0) return 'expired'
  if (daysUntil <= 30) return 'expiring_soon'
  return 'active'
}

export function truncateString(str: string, maxLength: number = 50) {
  if (!str) return ''
  return str.length > maxLength ? `${str.substring(0, maxLength)}...` : str
}

export function generateSlug(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function getInitials(name: string) {
  if (!name) return ''
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}
