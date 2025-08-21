"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { AuthCard } from "@/components/auth/auth-card"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true)
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        router.push("/dashboard")
      }
      setSessionChecked(true)
      setIsLoading(false)
    }
    checkSession()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast({ title: "Invalid email", description: "Enter a valid GAS email.", variant: "destructive" })
      return
    }
    if (!password || password.length < 6) {
      toast({ title: "Invalid password", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" })
        return
      }

      if (!data.session) {
        toast({
          title: "Email not confirmed",
          description: "Please confirm your email before signing in.",
          variant: "destructive",
        })
        return
      }

      // Save session locally
      localStorage.setItem("auth", "true")
      localStorage.setItem("userEmail", email)
      if (rememberMe) localStorage.setItem("supabaseToken", data.session.access_token || "")

      toast({ title: "Welcome!", description: "Successfully signed in." })
      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      toast({ title: "Unexpected error", description: "Failed to sign in. Try again later.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast({ title: "Invalid email", description: "Enter a valid GAS email.", variant: "destructive" })
      return
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: "" } }, // add full name if needed
      })

      if (error) {
        toast({ title: "Sign-up failed", description: error.message, variant: "destructive" })
        return
      }

      toast({
        title: "Account created!",
        description: "Check your email and confirm it before signing in.",
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Unexpected error", description: "Failed to sign up. Try again later.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      toast({ title: "Enter email", description: "Provide your email to reset password.", variant: "destructive" })
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Password reset", description: "Check your email for instructions." })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Unexpected error", description: "Failed to request password reset.", variant: "destructive" })
    }
  }

  // Wait until session check completes before rendering
  if (!sessionChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-[#005826]/5"></div>
      <div className="relative z-10">
        <AuthCard
          isLoading={isLoading}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onSocialLogin={(provider) => console.log(`${provider} login not implemented`)}
          onForgotPassword={handleForgotPassword}
        />
      </div>
      <Toaster />
    </div>
  )
}
