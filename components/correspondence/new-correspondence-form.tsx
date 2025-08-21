"use client"

import { useState } from "react"
import type React from "react"
import { Save, RotateCcw, Calendar, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUpload } from "./file-upload"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export function NewCorrespondenceForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: "",
    sender: "",
    recipient: "",
    registryNumber: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setFormData({
      subject: "",
      sender: "",
      recipient: "",
      registryNumber: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    })
    setUploadedFiles([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject || !formData.sender || !formData.recipient) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    if (uploadedFiles.length === 0) {
      toast({ title: "No Files Uploaded", description: "Please upload at least one file.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const correspondenceId = uuidv4()

      const { error: insertError } = await supabase.from("correspondence").insert([
        {
          id: correspondenceId,
          subject: formData.subject,
          sender: formData.sender,
          recipient: formData.recipient,
          registry_number: formData.registryNumber || null,
          date: formData.date,
          description: formData.description,
          status: "Pending",
        },
      ])

      if (insertError) throw insertError

      // Upload files to the new bucket
      for (const file of uploadedFiles) {
        const { error: uploadError } = await supabase.storage
          .from("gas_correspondence") // <-- new bucket name
          .upload(`${correspondenceId}/${file.name}`, file, { cacheControl: "3600", upsert: true })

        if (uploadError) throw uploadError
      }

      toast({ title: "Correspondence Created", description: "New correspondence has been successfully registered." })
      handleReset()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="border-[#1D3557]/10">
        <CardHeader>
          <CardTitle className="text-[#1D3557] flex items-center gap-2">
            <FileText className="w-5 h-5" /> Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Subject <span className="text-red-500">*</span></label>
            <Input value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)}
              placeholder="Enter correspondence subject"
              className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" /> Sender <span className="text-red-500">*</span>
              </label>
              <Input value={formData.sender} onChange={(e) => handleInputChange("sender", e.target.value)}
                placeholder="Enter sender name/organization"
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block flex items-center gap-2">
                <User className="w-4 h-4" /> Recipient <span className="text-red-500">*</span>
              </label>
              <Input value={formData.recipient} onChange={(e) => handleInputChange("recipient", e.target.value)}
                placeholder="Enter recipient name/organization"
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Registry Number</label>
            <Input value={formData.registryNumber} onChange={(e) => handleInputChange("registryNumber", e.target.value)}
              placeholder="Auto-generated if left empty"
              className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
            />
            <p className="text-xs text-[#457B9D] mt-1">Leave empty for auto-generation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date
              </label>
              <Input type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)}
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Description</label>
            <Textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter additional details or description (optional)"
              className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 min-h-[100px]"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="border-[#1D3557]/10">
        <CardHeader>
          <CardTitle className="text-[#1D3557]">File Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="bg-[#005826] hover:bg-[#005826]/90 text-white px-8">
          <Save className="w-4 h-4 mr-2" /> {isLoading ? "Creating..." : "Create Correspondence"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}
          className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent px-8"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Reset Form
        </Button>
      </div>
    </form>
  )
}
