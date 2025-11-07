"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Calendar, User, FileText, Upload, Save, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewCorrespondencePage() {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    sender: "",
    recipient: "",
    subject: "",
    status: "Pending",
    message_content: "",
  })
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("You must be logged in to submit.")
        setLoading(false)
        return
      }

      let file_url = null
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert("File too large (max 5MB)")
          setLoading(false)
          return
        }

        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}.${fileExt}`

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("correspondence-files")
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("correspondence-files")
          .getPublicUrl(fileName)

        file_url = publicUrlData.publicUrl
      }

      const registry_number = `CMS-${Date.now()}`

      // Insert into correspondence table
      const { error: insertError } = await supabase.from("correspondence").insert({
        registry_number,
        subject: formData.subject,
        sender: formData.sender,
        recipient: formData.recipient,
        date: formData.date,
        status: formData.status,
        message_content: formData.message_content,
        file_url,
        created_by: user.id,
        department: "General", // default
      })

      if (insertError) throw insertError

      // Log activity
      await supabase.from("activity_log").insert({
        user_id: user.id,
        action: "Created correspondence",
        correspondence_id: registry_number,
        timestamp: new Date().toISOString(),
      })

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        sender: "",
        recipient: "",
        subject: "",
        status: "Pending",
        message_content: "",
      })
      setFile(null)

      router.push("/correspondence")
    } catch (error) {
      console.error("Error saving correspondence:", error)
      alert("Error saving correspondence. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1D3557] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title="Correspondence Management" />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">New Correspondence</h1>
          <p className="text-gray-600">Create a new correspondence record</p>
        </div>

        <Card className="bg-white border border-gray-200 shadow-sm max-w-4xl">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#1D3557]" />
              Correspondence Details
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]"
                    required
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Sender
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter sender name"
                    value={formData.sender}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                    className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]"
                    required
                  />
                </div>

                {/* Recipient */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Recipient
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter recipient name"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]"
                    required
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <Input
                  type="text"
                  placeholder="Enter correspondence subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]"
                  required
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Attachment
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="border-0 focus:ring-0"
                  />
                  <p className="text-sm text-gray-500 mt-2">PDF, DOC, JPG, PNG (Max 5MB)</p>
                  {file && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      Selected: {file.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message Content</label>
                <textarea
                  placeholder="Enter message content..."
                  value={formData.message_content}
                  onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1D3557] focus:border-[#1D3557] resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1D3557] hover:bg-[#1D3557]/90 text-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Correspondence
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
