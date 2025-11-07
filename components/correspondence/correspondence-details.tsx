"use client"

import { useState, useEffect } from "react"
import { Download, Edit, Save, X, Calendar, User, Building, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "./status-badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface Attachment {
  name: string
  size: string
  url: string
  type: string
}

interface Correspondence {
  id: string
  registry_number: string
  subject: string
  sender: string
  recipient: string
  department: string
  date: string
  status: string
  description: string
  attachments: Attachment[]
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
}

interface CorrespondenceDetailsProps {
  correspondenceId: string
}

export function CorrespondenceDetails({ correspondenceId }: CorrespondenceDetailsProps) {
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentStatus, setCurrentStatus] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchCorrespondence = async () => {
      const { data, error } = await supabase
        .from("correspondence")
        .select("*")
        .eq("id", correspondenceId)
        .single()

      if (error) {
        toast({
          title: "Error fetching data",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      const { data: files } = await supabase.storage
        .from("gas_correspondence")
        .list(correspondenceId)

      const attachments: Attachment[] = files
        ? files.map((f) => ({
            name: f.name,
            size: (f.size / 1024).toFixed(2) + " KB",
            type: f.name.split(".").pop()?.toUpperCase() || "FILE",
            url: supabase.storage
              .from("gas_correspondence")
              .getPublicUrl(`${correspondenceId}/${f.name}`).publicUrl,
          }))
        : []

      setCorrespondence({ ...data, attachments })
      setCurrentStatus(data.status)
    }

    fetchCorrespondence()
  }, [correspondenceId, toast])

  const handleStatusUpdate = async () => {
    if (!correspondence) return

    const { error } = await supabase
      .from("correspondence")
      .update({ status: currentStatus, updated_at: new Date().toISOString() })
      .eq("id", correspondence.id)

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setCorrespondence({ ...correspondence, status: currentStatus })
      setIsEditing(false)
      toast({
        title: "Status Updated",
        description: `Correspondence status has been updated to ${currentStatus}.`,
      })
    }
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download Started",
      description: `Downloading ${fileName}...`,
    })
  }

  if (!correspondence) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D3557] mx-auto mb-4"></div>
        <p className="text-[#457B9D]">Loading correspondence...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D3557]">Correspondence Details</h1>
          <p className="text-[#457B9D] mt-1">Registry #{correspondence.registry_number}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                onClick={handleStatusUpdate}
                className="bg-[#005826] hover:bg-[#005826]/90 text-white shadow-sm transition-all duration-200"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-white transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-white transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Status
            </Button>
          )}
        </div>
      </div>

      {/* Main Information Card */}
      <Card className="border-[#1D3557]/10 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#1D3557] flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Correspondence Information
            </CardTitle>
            <StatusBadge status={currentStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Section */}
          <div className="bg-gradient-to-r from-[#F9FAFB] to-[#F1F5F9] p-4 rounded-lg border border-[#1D3557]/10">
            <label className="text-sm font-semibold text-[#1D3557] mb-3 block uppercase tracking-wide">
              Subject
            </label>
            <p className="text-[#1D3557] text-lg leading-relaxed font-medium">
              {correspondence.subject}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Registry Number */}
              <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
                <label className="text-sm font-medium text-[#1D3557] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#005826] rounded-full"></span>
                  Registry Number
                </label>
                <p className="font-mono text-lg text-[#1D3557] bg-[#F9FAFB] p-3 rounded border border-[#1D3557]/5">
                  {correspondence.registry_number}
                </p>
              </div>

              {/* Status */}
              <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
                <label className="text-sm font-medium text-[#1D3557] mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#457B9D] rounded-full"></span>
                  Status
                </label>
                {isEditing ? (
                  <Select value={currentStatus} onValueChange={setCurrentStatus}>
                    <SelectTrigger className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 bg-[#F9FAFB]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 bg-[#F9FAFB] rounded border border-[#1D3557]/5">
                    <StatusBadge status={currentStatus} />
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
                <label className="text-sm font-medium text-[#1D3557] mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded border border-[#1D3557]/5">
                  {new Date(correspondence.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Sender & Recipient */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
                  <label className="text-sm font-medium text-[#1D3557] mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sender
                  </label>
                  <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded border border-[#1D3557]/5">
                    {correspondence.sender}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
                  <label className="text-sm font-medium text-[#1D3557] mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recipient
                  </label>
                  <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded border border-[#1D3557]/5">
                    {correspondence.recipient}
                  </p>
                </div>
              </div>

              {/* Department */}
              <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
                <label className="text-sm font-medium text-[#1D3557] mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Department
                </label>
                <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded border border-[#1D3557]/5">
                  {correspondence.department}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-4 rounded-lg border border-[#1D3557]/10 shadow-xs">
            <label className="text-sm font-semibold text-[#1D3557] mb-3 block uppercase tracking-wide">
              Description
            </label>
            <p className="text-[#457B9D] bg-[#F9FAFB] p-4 rounded border border-[#1D3557]/5 leading-relaxed whitespace-pre-wrap">
              {correspondence.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Card */}
      <Card className="border-[#1D3557]/10 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-[#1D3557] flex items-center gap-2">
            <Download className="w-5 h-5" />
            Attachments
            <span className="text-sm font-normal text-[#457B9D] bg-[#F1F5F9] px-2 py-1 rounded-full">
              {correspondence.attachments.length} files
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {correspondence.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-[#1D3557]/10 hover:border-[#005826]/30 hover:shadow-xs transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#005826]/10 to-[#1D3557]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <span className="text-xs font-bold text-[#005826]">{attachment.type}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1D3557] group-hover:text-[#005826] transition-colors duration-200">
                      {attachment.name}
                    </p>
                    <p className="text-sm text-[#457B9D]">{attachment.size}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                  className="bg-[#005826] hover:bg-[#005826]/90 text-white shadow-sm transition-all duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
