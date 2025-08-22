"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function VerifyEmail() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const verifyEmail = async () => {
      const hash = window.location.hash
      if (!hash) {
        setError("Invalid verification link.")
        setLoading(false)
        return
      }

      const params = new URLSearchParams(hash.slice(1))
      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (!access_token || !refresh_token) {
        setError("Invalid verification link. Missing tokens.")
        setLoading(false)
        return
      }

      try {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        })

        if (sessionError) {
          console.error("Error setting session:", sessionError.message)
          setError("Email verification failed. Please log in manually.")
          setLoading(false)
          return
        }

        if (data?.session) {
          router.push("/dashboard")
        } else {
          setError("Unexpected error during email verification.")
        }
      } catch (err) {
        console.error(err)
        setError("An unexpected error occurred.")
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [router])

  return (
    <div className="text-center mt-20 text-[#1D3557]">
      {loading && <p>Verifying your email...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
