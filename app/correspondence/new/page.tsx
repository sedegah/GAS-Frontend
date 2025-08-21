"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

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
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title="Correspondence System" />

      <main className="ml-48 p-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">New Correspondence</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sender:</label>
              <input
                type="text"
                placeholder="Enter name"
                value={formData.sender}
                onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient:</label>
              <input
                type="text"
                placeholder="Enter name"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachment (PDF/Image, Max 5MB):</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <textarea
                placeholder="Message content..."
                value={formData.message_content}
                onChange={(e) => setFormData({ ...formData, message_content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Correspondence"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
