"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface AuthCardProps {
  isLoading: boolean
  onSignInSuccess: () => void
}

export function AuthCard({ isLoading, onSignInSuccess }: AuthCardProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  // Sign-in state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [showSignInPassword, setShowSignInPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // Sign-up state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSignUpPassword, setShowSignUpPassword] = useState(false)

  // --- Sign In handler ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInEmail || !signInPassword) return alert("Please enter email and password")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      })

      if (error) return alert(error.message)
      if (!data.session || !data.user) return alert("Authentication failed")

      if (!data.user.email_confirmed_at) {
        alert("Please verify your email before logging in")
        await supabase.auth.signOut()
        return
      }

      localStorage.setItem("auth", "true")
      localStorage.setItem("userFullName", data.user.user_metadata?.full_name || "")
      if (rememberMe) localStorage.setItem("supabaseToken", data.session.access_token)

      onSignInSuccess()
    } catch (err) {
      console.error(err)
      alert("Unexpected error during sign in")
    }
  }

  // --- Sign Up handler ---
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signUpPassword !== confirmPassword) return alert("Passwords do not match")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            phone: phoneNumber,
          },
          redirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      if (error) return alert(error.message)
      if (!data.user) return alert("Registration failed")

      alert("Registration successful! Check your email to verify your account")
      setActiveTab("signin")

      // Clear form
      setSignUpEmail("")
      setSignUpPassword("")
      setConfirmPassword("")
      setFirstName("")
      setLastName("")
      setPhoneNumber("")
    } catch (err) {
      console.error(err)
      alert("Unexpected error during registration")
    }
  }

  // --- Forgot password ---
  const handleForgotPassword = async () => {
    if (!signInEmail) return alert("Enter your email first")
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(signInEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) return alert(error.message)
      alert("Password reset email sent! Check your inbox.")
    } catch (err) {
      console.error(err)
      alert("Failed to send reset email")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#F1FAEE] border border-[#1D3557]/20 rounded-[24px] p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-6 relative bg-white rounded-full p-2 shadow-lg border border-[#1D3557]/10">
            <Image src="/gas-logo.png" alt="GAS Logo" width={88} height={88} className="object-contain w-full h-full" />
          </div>
          <h2 className="text-[#1D3557] font-bold text-xl mb-1 text-center">Ghana Audit Service</h2>
          <p className="text-[#457B9D] text-sm font-medium text-center">Correspondence Management System</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex bg-[#1D3557]/10 rounded-full p-1 border border-[#1D3557]/20">
            <button
              onClick={() => setActiveTab("signin")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === "signin" ? "bg-[#1D3557] text-white shadow-lg" : "text-[#457B9D] hover:text-[#1D3557] hover:bg-[#1D3557]/5"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === "signup" ? "bg-[#1D3557] text-white shadow-lg" : "text-[#457B9D] hover:text-[#1D3557] hover:bg-[#1D3557]/5"
              }`}
            >
              Register
            </button>
          </div>
          <button
            className="w-10 h-10 bg-[#1D3557]/10 rounded-full flex items-center justify-center border border-[#1D3557]/20 hover:bg-[#1D3557]/20 transition-all duration-200 hover:scale-110 hover:rotate-90"
            onClick={() => window.location.href = "/"}
          >
            <X className="w-5 h-5 text-[#457B9D]" />
          </button>
        </div>

        {/* Forms */}
        <div className="relative overflow-hidden">
          {/* Sign In */}
          <div className={`${activeTab === "signin" ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 absolute inset-0"} transition-all duration-500 ease-in-out`}>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                <Input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Enter your staff email"
                  className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pl-12 text-[#2C2C2C] placeholder:text-[#457B9D]/60"
                  required
                />
              </div>
              <div className="relative">
                <Input
                  type={showSignInPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pr-12 text-[#2C2C2C] placeholder:text-[#457B9D]/60"
                  required
                />
                <button type="button" onClick={() => setShowSignInPassword(!showSignInPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]">
                  {showSignInPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border border-[#1D3557]/30 bg-white text-[#1D3557] focus:ring-[#457B9D] focus:ring-2" />
                  <span className="text-[#457B9D] text-sm">Remember me</span>
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-[#457B9D] hover:text-[#1D3557] text-sm">Forgot password?</button>
              </div>

              <Button type="submit" className="w-full bg-[#1D3557] hover:bg-[#457B9D] text-white h-14 rounded-2xl mt-8" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Access CMS Dashboard"}
              </Button>
            </form>
          </div>

          {/* Sign Up */}
          <div className={`${activeTab === "signup" ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0 absolute inset-0"} transition-all duration-500 ease-in-out`}>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" required className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pl-4" />
                <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" required className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pl-4" />
              </div>
              <Input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Phone number (optional)" className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pl-4" />
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                <Input type="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} placeholder="Official GAS email" className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pl-12" required />
              </div>
              <div className="relative">
                <Input type={showSignUpPassword ? "text" : "password"} value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} placeholder="Create password" className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pr-12" required />
                <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]">
                  {showSignUpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="bg-white border border-[#1D3557]/20 rounded-2xl h-14 pl-4" required />
              {confirmPassword && signUpPassword !== confirmPassword && <p className="text-red-500 text-sm">Passwords do not match</p>}

              <Button type="submit" className="w-full bg-[#1D3557] hover:bg-[#457B9D] text-white h-14 rounded-2xl mt-8" disabled={isLoading || signUpPassword !== confirmPassword}>
                {isLoading ? "Creating account..." : "Register Staff Account"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-[#457B9D] text-sm mt-8">
          {activeTab === "signup"
            ? "By registering, you agree to GAS Terms of Service and Privacy Policy"
            : "Authorized staff access only. All activities are logged and monitored."}
        </p>

        <div className="text-center mt-6 pt-4 border-t border-[#1D3557]/20">
          <p className="text-[#457B9D]/70 text-xs">Ghana Audit Service - Correspondence Management System v1.0</p>
        </div>
      </div>
    </div>
  )
}
