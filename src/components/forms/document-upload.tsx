'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface DocumentUploadProps {
  vendorId: string
  onUploadComplete?: (fileUrl: string, fileName: string, fileSize: number, mimeType: string) => void
  disabled?: boolean
}

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/msword': ['.doc'],
  'application/vnd.ms-excel': ['.xls'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function DocumentUpload({ vendorId, onUploadComplete, disabled }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return

    setUploading(true)
    const file = acceptedFiles[0]

    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filePath = `${profile.organization_id}/${vendorId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setProgress(Math.round((progress.loaded / progress.total) * 100))
          }
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath)

      toast.success('File uploaded successfully')
      onUploadComplete?.(publicUrl, file.name, file.size, file.type)
    } catch (error: any) {
      toast.error(error.message || 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [vendorId, supabase, onUploadComplete, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    disabled: uploading || disabled
  })

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading || disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <File className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading document...</p>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
              <p className="text-xs text-gray-500">{progress}%</p>
            </div>
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-blue-500" />
            <p className="text-blue-600">Drop the file here</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-600">
              Drag & drop a document here, or click to select
            </p>
            <p className="text-xs text-gray-500">
              PDF, DOCX, XLSX, JPG, PNG (max 10MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
