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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1D3557] mb-2">Create New Correspondence</h1>
        <p className="text-[#457B9D]">Fill in the details below to register new correspondence</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="border-[#1D3557]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#1D3557]/5 to-[#005826]/5 border-b border-[#1D3557]/10">
            <CardTitle className="text-[#1D3557] flex items-center gap-3 text-xl">
              <div className="p-2 bg-[#1D3557] rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="text-sm font-semibold text-[#1D3557] mb-3 block">Subject <span className="text-red-500">*</span></label>
              <Input value={formData.subject} onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Enter correspondence subject"
                className="border-2 border-[#1D3557]/20 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 h-12 text-lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#1D3557] mb-3 block flex items-center gap-2">
                  <User className="w-4 h-4" /> Sender <span className="text-red-500">*</span>
                </label>
                <Input value={formData.sender} onChange={(e) => handleInputChange("sender", e.target.value)}
                  placeholder="Enter sender name/organization"
                  className="border-2 border-[#1D3557]/20 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 h-12"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1D3557] mb-3 block flex items-center gap-2">
                  <User className="w-4 h-4" /> Recipient <span className="text-red-500">*</span>
                </label>
                <Input value={formData.recipient} onChange={(e) => handleInputChange("recipient", e.target.value)}
                  placeholder="Enter recipient name/organization"
                  className="border-2 border-[#1D3557]/20 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 h-12"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-semibold text-[#1D3557] mb-3 block">Registry Number</label>
                <Input value={formData.registryNumber} onChange={(e) => handleInputChange("registryNumber", e.target.value)}
                  placeholder="Auto-generated if left empty"
                  className="border-2 border-[#1D3557]/20 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 h-12"
                />
                <p className="text-sm text-[#457B9D] mt-2 bg-[#F9FAFB] p-2 rounded border border-[#1D3557]/10">Leave empty for auto-generation</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1D3557] mb-3 block flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date
                </label>
                <Input type="date" value={formData.date} onChange={(e) => handleInputChange("date", e.target.value)}
                  className="border-2 border-[#1D3557]/20 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 h-12"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#1D3557] mb-3 block">Description</label>
              <Textarea value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter additional details or description (optional)"
                className="border-2 border-[#1D3557]/20 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 min-h-[120px] text-lg"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="border-[#1D3557]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#1D3557]/5 to-[#005826]/5 border-b border-[#1D3557]/10">
            <CardTitle className="text-[#1D3557] text-xl">File Upload</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 pt-6">
          <Button type="submit" disabled={isLoading} className="bg-[#005826] hover:bg-[#005826]/90 text-white px-8 py-3 h-12 text-lg min-w-[200px] shadow-lg hover:shadow-xl transition-all">
            <Save className="w-5 h-5 mr-2" /> {isLoading ? "Creating..." : "Create Correspondence"}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}
            className="border-2 border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 hover:border-[#1D3557]/30 bg-white px-8 py-3 h-12 text-lg min-w-[140px] transition-all"
          >
            <RotateCcw className="w-5 h-5 mr-2" /> Reset Form
          </Button>
        </div>
      </form>
    </div>
  )
}
