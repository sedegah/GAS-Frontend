"use client"

import { useState } from "react"
import type React from "react"
import { Save, RotateCcw, Calendar, User, FileText, Upload, Plus } from "lucide-react"
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
          .from("gas_correspondence")
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
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg border border-[#1D3557]/10 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1D3557] to-[#005826] rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-[#1D3557] mb-3 bg-gradient-to-r from-[#1D3557] to-[#005826] bg-clip-text text-transparent">
            New Correspondence
          </h1>
          <p className="text-lg text-[#457B9D] max-w-md mx-auto">
            Create a new correspondence record with all necessary details and attachments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-[#1D3557]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1D3557] to-[#005826] rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#1D3557]">Basic Information</CardTitle>
                  <p className="text-sm text-[#457B9D] mt-1">Fill in the core details of your correspondence</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#005826] rounded-full"></div>
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input 
                  value={formData.subject} 
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="What is this correspondence about?"
                  className="h-14 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 text-lg placeholder:text-[#457B9D]/60 rounded-xl transition-all duration-200"
                  required
                />
              </div>

              {/* Sender & Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sender <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formData.sender} 
                    onChange={(e) => handleInputChange("sender", e.target.value)}
                    placeholder="Who is sending?"
                    className="h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 placeholder:text-[#457B9D]/60 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recipient <span className="text-red-500">*</span>
                  </label>
                  <Input 
                    value={formData.recipient} 
                    onChange={(e) => handleInputChange("recipient", e.target.value)}
                    placeholder="Who is receiving?"
                    className="h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 placeholder:text-[#457B9D]/60 rounded-xl transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Registry Number & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1D3557]">Registry Number</label>
                  <Input 
                    value={formData.registryNumber} 
                    onChange={(e) => handleInputChange("registryNumber", e.target.value)}
                    placeholder="Will auto-generate if empty"
                    className="h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 placeholder:text-[#457B9D]/60 rounded-xl transition-all duration-200"
                  />
                  <p className="text-xs text-[#457B9D] bg-[#F8FAFC] p-2 rounded-lg border border-[#1D3557]/10">
                    Leave blank for automatic registry number generation
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#1D3557] flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <Input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 rounded-xl transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#1D3557]">Description</label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Provide additional context or details about this correspondence..."
                  className="min-h-[140px] border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 placeholder:text-[#457B9D]/60 rounded-xl resize-none transition-all duration-200"
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-[#1D3557]/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1D3557] to-[#005826] rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-[#1D3557]">Attachments</CardTitle>
                  <p className="text-sm text-[#457B9D] mt-1">Upload relevant documents and files</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <FileUpload files={uploadedFiles} onFilesChange={setUploadedFiles} />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-14 px-12 bg-gradient-to-r from-[#005826] to-[#1D3557] hover:from-[#005826]/90 hover:to-[#1D3557]/90 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[240px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Correspondence
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleReset} 
              disabled={isLoading}
              className="h-14 px-8 border-2 border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 hover:text-[#1D3557] hover:border-[#1D3557]/30 bg-white rounded-xl text-lg font-medium transition-all duration-300 min-w-[160px]"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
