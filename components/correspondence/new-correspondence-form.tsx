"use client"

import { useState } from "react"
import type React from "react"
import { Save, RotateCcw, Calendar, User, FileText, Plus, Upload } from "lucide-react"
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
    toast({
      title: "Form Reset",
      description: "All fields have been cleared.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject || !formData.sender || !formData.recipient) {
      toast({ 
        title: "Missing Information", 
        description: "Please fill in all required fields.", 
        variant: "destructive" 
      })
      return
    }

    if (uploadedFiles.length === 0) {
      toast({ 
        title: "No Files Uploaded", 
        description: "Please upload at least one file.", 
        variant: "destructive" 
      })
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
          .from("gas_correspondence")
          .upload(`${correspondenceId}/${file.name}`, file, { cacheControl: "3600", upsert: true })

        if (uploadError) throw uploadError
      }

      toast({ 
        title: "Success!", 
        description: "New correspondence has been successfully registered.",
      })
      handleReset()
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Something went wrong.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#005826]/10 to-[#1D3557]/10 rounded-2xl mb-2">
          <Plus className="w-8 h-8 text-[#005826]" />
        </div>
        <h1 className="text-3xl font-bold text-[#1D3557]">New Correspondence</h1>
        <p className="text-[#457B9D] text-lg">Create a new correspondence record with attachments</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Card */}
        <Card className="border-[#1D3557]/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4 border-b border-[#1D3557]/5">
            <CardTitle className="text-[#1D3557] flex items-center gap-3 text-xl">
              <div className="p-2 bg-[#005826]/10 rounded-lg">
                <FileText className="w-5 h-5 text-[#005826]" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Subject */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <Input 
                value={formData.subject} 
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Enter correspondence subject"
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 h-12 text-[#1D3557] placeholder:text-[#457B9D]/60"
                required
              />
            </div>

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Sender <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formData.sender} 
                  onChange={(e) => handleInputChange("sender", e.target.value)}
                  placeholder="Enter sender name/organization"
                  className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 h-12 text-[#1D3557] placeholder:text-[#457B9D]/60"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Recipient <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formData.recipient} 
                  onChange={(e) => handleInputChange("recipient", e.target.value)}
                  placeholder="Enter recipient name/organization"
                  className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 h-12 text-[#1D3557] placeholder:text-[#457B9D]/60"
                  required
                />
              </div>
            </div>

            {/* Registry Number & Date */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1D3557]">Registry Number</label>
                <Input 
                  value={formData.registryNumber} 
                  onChange={(e) => handleInputChange("registryNumber", e.target.value)}
                  placeholder="Auto-generated if left empty"
                  className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 h-12 text-[#1D3557] placeholder:text-[#457B9D]/60"
                />
                <p className="text-xs text-[#457B9D] bg-[#F1F5F9] p-2 rounded border border-[#1D3557]/5">
                  Leave empty for auto-generation
                </p>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 h-12 text-[#1D3557]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-[#1D3557]">Description</label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter additional details or description (optional)"
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 min-h-[120px] text-[#1D3557] placeholder:text-[#457B9D]/60 resize-none"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload Card */}
        <Card className="border-[#1D3557]/10 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4 border-b border-[#1D3557]/5">
            <CardTitle className="text-[#1D3557] flex items-center gap-3 text-xl">
              <div className="p-2 bg-[#005826]/10 rounded-lg">
                <Upload className="w-5 h-5 text-[#005826]" />
              </div>
              File Upload
              <span className="text-sm font-normal text-[#457B9D] bg-[#F1F5F9] px-3 py-1 rounded-full">
                {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#1D3557]/5">
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="bg-[#005826] hover:bg-[#005826]/90 text-white px-8 py-3 h-12 min-w-[200px] shadow-sm hover:shadow-md transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> 
                Create Correspondence
              </>
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset} 
            disabled={isLoading}
            className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 hover:text-[#1D3557] bg-white px-8 py-3 h-12 min-w-[140px] transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> 
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  )
}
