"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react"
import { PasswordStrengthIndicator } from "./password-strength"
import { SocialLogin } from "./social-login"
import { supabase } from "@/lib/supabase"

export default function AuthForm() {
  const router = useRouter()
  const [view, setView] = useState<"signin" | "signup">("signin")

  // --- Sign In States ---
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showSignInPassword, setShowSignInPassword] = useState(false)

  // --- Sign Up States ---
  const [signUpFullName, setSignUpFullName] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  // --- Handle Sign In ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })

      if (error) {
        alert(error.message)
        return
      }

      if (!data.user) {
        alert("Authentication failed. Please try again.")
        return
      }

      // Optional email confirmation check
      if (data.user.email_confirmed_at === null) {
        alert("Please confirm your email before logging in. Check your inbox.")
        return
      }

      // Save session if "Remember Me" is checked
      if (rememberMe && data.session?.access_token) {
        localStorage.setItem("supabaseToken", data.session.access_token)
      }

      localStorage.setItem("auth", "true")
      localStorage.setItem("userFullName", data.user.user_metadata?.full_name || "")

      router.push("/dashboard")
    } catch (err) {
      console.error(err)
      alert("Unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Handle Sign Up ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signUpPassword !== confirmPassword) {
      alert("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: { full_name: signUpFullName },
          redirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      if (error) {
        alert(error.message)
        return
      }

      alert(
        "Registration successful! Please check your email and confirm your account before signing in."
      )
      setView("signin")

      // Clear form
      setSignUpEmail("")
      setSignUpFullName("")
      setSignUpPassword("")
      setConfirmPassword("")
    } catch (err) {
      console.error(err)
      alert("Unexpected error during registration. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Handle Forgot Password ---
  const handleForgotPassword = async () => {
    if (!signInEmail) {
      alert("Please enter your email first")
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(signInEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        alert(`Failed to send reset email: ${error.message}`)
      } else {
        alert("Password reset email sent! Check your inbox.")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to send reset email. Please try again.")
    }
  }

  return (
    <Tabs value={view} onValueChange={setView} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm">
        <TabsTrigger
          value="signin"
          className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger
          value="signup"
          className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
        >
          Sign Up
        </TabsTrigger>
      </TabsList>

      {/* Sign In */}
      <TabsContent value="signin" className="mt-6 space-y-4">
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-10 h-4 w-4 text-white/50" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-10 h-4 w-4 text-white/50" />
            <Input
              type={showSignInPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowSignInPassword(!showSignInPassword)}
              className="absolute right-3 top-10 text-white/50 hover:text-white/70"
            >
              {showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={setRememberMe}
              className="border-white/20 data-[state=checked]:bg-white/20"
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-white/70 hover:text-white underline"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> : "Sign In"}
          </Button>
        </form>

        <SocialLogin onSocialLogin={() => {}} isLoading={isLoading} />
      </TabsContent>

      {/* Sign Up */}
      <TabsContent value="signup" className="mt-6 space-y-4">
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-10 h-4 w-4 text-white/50" />
            <Input
              type="text"
              placeholder="Full Name"
              value={signUpFullName}
              onChange={(e) => setSignUpFullName(e.target.value)}
              required
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-10 h-4 w-4 text-white/50" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 backdrop-blur-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-10 h-4 w-4 text-white/50" />
            <Input
              type={showSignUpPassword ? "text" : "password"}
              placeholder="Create a password"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
              className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowSignUpPassword(!showSignUpPassword)}
              className="absolute right-3 top-10 text-white/50 hover:text-white/70"
            >
              {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <PasswordStrengthIndicator password={signUpPassword} />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-10 h-4 w-4 text-white/50" />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 backdrop-blur-sm"
            />
            {confirmPassword && signUpPassword !== confirmPassword && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm"
            disabled={isLoading || signUpPassword !== confirmPassword}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" /> : "Create Account"}
          </Button>
        </form>

        <SocialLogin onSocialLogin={() => {}} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  )
}
