"use client"

import { useState } from "react"

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    if (data.signedUrl) {
      setFileUrl(data.signedUrl)
    } else {
      alert(data.error || "Upload failed")
    }

    setUploading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Upload Correspondence</h1>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {fileUrl && (
        <div className="mt-4">
          <p className="font-semibold">File uploaded:</p>
          <a href={fileUrl} target="_blank" className="text-blue-500 underline">
            Open File
          </a>
        </div>
      )}
    </div>
  )
}
