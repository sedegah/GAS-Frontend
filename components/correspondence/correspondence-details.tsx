"use client"

import { useState, useEffect } from "react"
import { Download, Edit, Save, X } from "lucide-react"
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

      // Fetch attachments URLs from the new Supabase Storage bucket
      const { data: files } = await supabase.storage
        .from("gas_correspondence") // <-- new bucket name
        .list(correspondenceId)

      const attachments: Attachment[] = files
        ? files.map((f) => ({
            name: f.name,
            size: (f.size / 1024).toFixed(2) + " KB",
            type: f.name.split(".").pop()?.toUpperCase() || "FILE",
            url: supabase.storage
              .from("gas_correspondence") // <-- new bucket name
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

  if (!correspondence) return <p>Loading correspondence...</p>

  return (
    <div className="space-y-6">
      {/* Main Information Card */}
      <Card className="border-[#1D3557]/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-[#1D3557]">Correspondence Information</CardTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleStatusUpdate}
                    className="bg-[#005826] hover:bg-[#005826]/90 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Status
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block">Registry Number</label>
              <p className="font-mono text-lg text-[#1D3557] bg-[#F9FAFB] p-3 rounded-lg border border-[#1D3557]/10">
                {correspondence.registry_number}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block">Status</label>
              {isEditing ? (
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3">
                  <StatusBadge status={currentStatus} />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Subject</label>
            <p className="text-[#1D3557] bg-[#F9FAFB] p-3 rounded-lg border border-[#1D3557]/10">
              {correspondence.subject}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block">Sender</label>
              <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded-lg border border-[#1D3557]/10">
                {correspondence.sender}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block">Recipient</label>
              <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded-lg border border-[#1D3557]/10">
                {correspondence.recipient}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block">Department</label>
              <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded-lg border border-[#1D3557]/10">
                {correspondence.department}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#1D3557] mb-2 block">Date</label>
              <p className="text-[#457B9D] bg-[#F9FAFB] p-3 rounded-lg border border-[#1D3557]/10">
                {new Date(correspondence.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Description</label>
            <p className="text-[#457B9D] bg-[#F9FAFB] p-4 rounded-lg border border-[#1D3557]/10 leading-relaxed">
              {correspondence.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Attachments Card */}
      <Card className="border-[#1D3557]/10">
        <CardHeader>
          <CardTitle className="text-[#1D3557]">Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {correspondence.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#005826]/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-[#005826]">{attachment.type}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1D3557]">{attachment.name}</p>
                    <p className="text-sm text-[#457B9D]">{attachment.size}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(attachment.url, attachment.name)}
                  className="bg-[#005826] hover:bg-[#005826]/90 text-white"
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
