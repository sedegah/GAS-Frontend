"use client"

import { useState, useEffect, useCallback } from "react"
import { Upload, X, FileText, File, ImageIcon, Eye, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { StatusBadge } from "./status-badge"
import { useRouter } from "next/navigation"

interface Correspondence {
  id: string
  registry_number: string
  subject: string
  sender: string
  recipient: string | null
  department: string | null
  created_at: string
  status: string
  file_path: string | null
}

interface FileUploadProps {
  files: { name: string; size: number; path: string }[]
  onFilesChange: (files: { name: string; size: number; path: string }[]) => void
}

function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files))
  }

  const handleFiles = async (newFiles: File[]) => {
    const uploadedFiles: { name: string; size: number; path: string }[] = []

    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB`,
          variant: "destructive",
        })
        continue
      }
      const path = `${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from("gas_correspondence").upload(path, file)
      if (error) {
        toast({ title: "Upload failed", description: error.message, variant: "destructive" })
      } else {
        uploadedFiles.push({ name: file.name, size: file.size, path })
        toast({ title: "File uploaded", description: file.name })
      }
    }

    if (uploadedFiles.length > 0) onFilesChange([...files, ...uploadedFiles])
  }

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    onFilesChange(newFiles)
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext && ["jpg", "jpeg", "png", "gif"].includes(ext)) return ImageIcon
    if (ext && ext === "pdf") return FileText
    return File
  }

  return (
    <div className="space-y-4">
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
            <p className="text-[#457B9D] mb-4">Drag & drop or click to browse</p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <Button type="button" variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
              Browse Files
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-[#1D3557]">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file, index) => {
              const FileIcon = getFileIcon(file.name)
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#005826]/10 rounded-lg flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-[#005826]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1D3557] text-sm">{file.name}</p>
                      <p className="text-xs text-[#457B9D]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => removeFile(index)}>
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

export function CorrespondenceTable() {
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 10
  const router = useRouter()

  useEffect(() => {
    fetchCorrespondences()
  }, [])

  const fetchCorrespondences = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from<Correspondence>("correspondence")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    setCorrespondences(data || [])
    setLoading(false)
  }

  const handleView = (id: string) => router.push(`/correspondence/${id}`)

  const handleDownload = async (filePath: string | null) => {
    if (!filePath) return alert("No file attached.")
    const { data, error } = await supabase.storage.from("gas_correspondence").download(filePath)
    if (error || !data) return alert(error?.message || "Download failed.")
    const url = URL.createObjectURL(data)
    const link = document.createElement("a")
    link.href = url
    link.download = filePath.split("/").pop() || "file"
    link.click()
    URL.revokeObjectURL(url)
  }

  const paginatedData = correspondences.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(correspondences.length / itemsPerPage)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#1D3557]/10">
              <tr>
                <th className="p-4 text-left">Registry Number</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Sender</th>
                <th className="p-4 text-left">Recipient</th>
                <th className="p-4 text-left">Department</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">Loading...</td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-4">No correspondence found.</td>
                </tr>
              ) : (
                paginatedData.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]/30"}>
                    <td className="p-4">{c.registry_number}</td>
                    <td className="p-4">{c.subject}</td>
                    <td className="p-4">{c.sender}</td>
                    <td className="p-4">{c.recipient}</td>
                    <td className="p-4">{c.department}</td>
                    <td className="p-4">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="p-4"><StatusBadge status={c.status} /></td>
                    <td className="p-4 flex gap-2">
                      <Button size="sm" onClick={() => handleView(c.id)}><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" onClick={() => handleDownload(c.file_path)}><Download className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between p-4 border-t border-[#1D3557]/10">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, correspondences.length)} of {correspondences.length}
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /> Prev</Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next <ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CorrespondenceManager() {
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; path: string }[]>([])

  return (
    <div className="space-y-6">
      <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
      <CorrespondenceTable />
    </div>
  )
}
