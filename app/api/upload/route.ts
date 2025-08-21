import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // unique file path in bucket
    const filePath = `correspondences/${Date.now()}-${file.name}`

    // upload into private bucket
    const { error } = await supabase.storage
      .from("correspondence_files") // your bucket name
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // generate signed URL (valid for 1 hour)
    const { data: signedUrlData } = await supabase.storage
      .from("correspondence_files")
      .createSignedUrl(filePath, 60 * 60)

    return NextResponse.json({
      path: filePath,
      signedUrl: signedUrlData?.signedUrl,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
