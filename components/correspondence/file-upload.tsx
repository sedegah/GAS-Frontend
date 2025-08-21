"use client"

import { useState, useCallback } from "react"
import type React from "react"
import { Upload, X, FileText, File, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface FileUploadProps {
  files: { name: string; size: number; url: string }[]
  onFilesChange: (files: { name: string; size: number; url: string }[]) => void
}

export function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      handleFiles(Array.from(e.dataTransfer.files))
    },
    []
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(Array.from(e.target.files))
    },
    []
  )

  const handleFiles = async (newFiles: File[]) => {
    const validFiles = newFiles.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB and skipped.`,
          variant: "destructive",
        })
        return false
      }
      if (files.some((f) => f.name === file.name)) {
        toast({
          title: "Duplicate file",
          description: `${file.name} is already uploaded.`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    if (!validFiles.length) return

    const uploadedFiles: { name: string; size: number; url: string }[] = []

    for (const file of validFiles) {
      const filePath = `${Date.now()}-${file.name}`

      // Upload file to private bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from("gas_correspondence")
        .upload(filePath, file)

      if (storageError) {
        toast({
          title: "Upload failed",
          description: `${file.name} could not be uploaded.`,
          variant: "destructive",
        })
        continue
      }

      // Insert metadata (RLS-safe)
      const { data: metaData, error: metaError } = await supabase
        .from("correspondence_files_metadata")
        .insert({
          file_name: file.name,
          file_path: filePath,
          uploaded_by: supabase.auth.getUser().data.user.id,
        })

      if (metaError) {
        toast({
          title: "Metadata failed",
          description: `${file.name} metadata could not be saved.`,
          variant: "destructive",
        })
        continue
      }

      const { publicUrl } = supabase.storage
        .from("gas_correspondence")
        .getPublicUrl(filePath)

      uploadedFiles.push({ name: file.name, size: file.size, url: publicUrl })
      toast({ title: "Uploaded", description: `${file.name} uploaded successfully.` })
    }

    onFilesChange([...files, ...uploadedFiles])
  }

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext && ["jpg", "jpeg", "png", "gif"].includes(ext)) return ImageIcon
    if (ext === "pdf") return FileText
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver ? "border-[#005826] bg-[#005826]/5" : "border-[#1D3557]/20 hover:border-[#005826]/50 hover:bg-[#005826]/5"
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-[#005826]/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-[#005826]" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-[#1D3557] mb-2">Upload Files</h3>
            <p className="text-[#457B9D] mb-4">Drag and drop files here, or click to browse</p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="border-[#005826] text-[#005826] hover:bg-[#005826] hover:text-white"
            >
              Browse Files
            </Button>
          </div>
          <p className="text-xs text-[#457B9D]">Supported: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)</p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-[#1D3557]">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.name)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#005826]/10 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-[#005826]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1D3557] text-sm">{file.name}</p>
                      <p className="text-xs text-[#457B9D]">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeFile(index)}
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
