"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

interface SignInFormProps {
  onLoginSuccess?: () => void
  onForgotPassword?: () => void
}

export function SignInForm({ onLoginSuccess, onForgotPassword }: SignInFormProps) {
  const router = useRouter()
  const { toast } = useToast() || { toast: undefined }

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if a session already exists on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth", "true")
          localStorage.setItem("userFullName", data.session.user.user_metadata?.full_name || "")
          localStorage.setItem("supabaseToken", data.session.access_token)
        }
        router.push("/dashboard")
      } else {
        // Clear any leftover token
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth")
          localStorage.removeItem("userFullName")
          localStorage.removeItem("supabaseToken")
        }
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      toast?.({ title: "Login Failed", description: "Email and password cannot be empty.", variant: "destructive" }) || alert("Email and password cannot be empty.")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword })

      if (error) {
        toast?.({ title: "Login Failed", description: error.message, variant: "destructive" }) || alert(error.message)
        return
      }

      if (!data.session || !data.user) {
        alert("Authentication failed")
        return
      }

      if (!data.user.email_confirmed_at) {
        alert("Please verify your email before logging in")
        await supabase.auth.signOut()
        return
      }

      const userFullName = data.user.user_metadata?.full_name || ""

      localStorage.setItem("auth", "true")
      localStorage.setItem("userFullName", userFullName)
      if (rememberMe && data.session?.access_token) {
        localStorage.setItem("supabaseToken", data.session.access_token)
      }

      toast?.({ title: "Login Successful", description: `Welcome back${userFullName ? `, ${userFullName}` : ""}!` }) || alert(`Welcome back${userFullName ? `, ${userFullName}` : ""}!`)

      onLoginSuccess?.()
      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      alert("Unexpected error during sign in")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {/* Email Input */}
      <div className="space-y-3">
        <Label htmlFor="email" className="text-white font-medium flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#8e8e93]" />
          Email
        </Label>
        <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      {/* Password Input */}
      <div className="space-y-3">
        <Label htmlFor="password" className="text-white font-medium flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#8e8e93]" />
          Password
        </Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-4" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Checkbox id="remember" checked={rememberMe} onCheckedChange={setRememberMe} />
          <Label htmlFor="remember">Remember me</Label>
        </div>
        {onForgotPassword && <Button type="button" variant="link" onClick={onForgotPassword}>Forgot password?</Button>}
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button>
    </form>
  )
}
