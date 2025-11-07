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
      try {
        setIsLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Session check error:", error)
          // Continue to login page even if there's an error
        } else if (session) {
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Unexpected error during session check:", error)
      } finally {
        setSessionChecked(true)
        setIsLoading(false)
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast({ 
        title: "Invalid email", 
        description: "Please enter a valid email address.", 
        variant: "destructive" 
      })
      return
    }
    if (!password || password.length < 6) {
      toast({ 
        title: "Invalid password", 
        description: "Password must be at least 6 characters.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      })

      if (error) {
        toast({ 
          title: "Login failed", 
          description: error.message, 
          variant: "destructive" 
        })
        return
      }

      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "Please check your email for verification.",
          variant: "destructive",
        })
        return
      }

      // Simple session storage without sensitive data
      localStorage.setItem("auth", "true")
      localStorage.setItem("userEmail", email)

      toast({ 
        title: "Welcome!", 
        description: "Successfully signed in." 
      })
      
      // Add a small delay to ensure session is properly set
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
      
    } catch (err: any) {
      console.error("Sign in error:", err)
      toast({ 
        title: "Unexpected error", 
        description: err?.message || "Failed to sign in. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      toast({ 
        title: "Invalid email", 
        description: "Please enter a valid email address.", 
        variant: "destructive" 
      })
      return
    }
    if (password.length < 6) {
      toast({ 
        title: "Password too short", 
        description: "Password must be at least 6 characters.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { 
          data: { full_name: "" },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      })

      if (error) {
        toast({ 
          title: "Sign-up failed", 
          description: error.message, 
          variant: "destructive" 
        })
        return
      }

      if (data.user && !data.session) {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        })
        // Clear form after successful signup
        setEmail("")
        setPassword("")
      } else if (data.session) {
        // Auto-logged in (if email confirmation is disabled)
        toast({ 
          title: "Welcome!", 
          description: "Successfully signed in." 
        })
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Sign up error:", err)
      toast({ 
        title: "Unexpected error", 
        description: err?.message || "Failed to create account. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email || !validateEmail(email)) {
      toast({ 
        title: "Enter email", 
        description: "Please provide a valid email address.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        toast({ 
          title: "Error", 
          description: error.message, 
          variant: "destructive" 
        })
      } else {
        toast({ 
          title: "Password reset sent", 
          description: "Check your email for reset instructions." 
        })
      }
    } catch (err: any) {
      console.error("Password reset error:", err)
      toast({ 
        title: "Unexpected error", 
        description: err?.message || "Failed to send reset email.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Wait until session check completes before rendering
  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D3557] mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-[#005826]/5"></div>
      <div className="relative z-10 w-full max-w-md">
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
          onSocialLogin={(provider) => {
            toast({
              title: "Feature not available",
              description: `${provider} login is not implemented yet.`,
            })
          }}
          onForgotPassword={handleForgotPassword}
        />
      </div>
      <Toaster />
    </div>
  )
}
