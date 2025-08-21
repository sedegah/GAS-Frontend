"use client"

import { useState } from "react"
import type React from "react"
import { Lock, Eye, EyeOff, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export function PasswordChange() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const { toast } = useToast()

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Attempt to update password with Supabase
    const { error } = await supabase.auth.updateUser({
      password: passwords.new,
    })

    if (error) {
      toast({
        title: "Error Updating Password",
        description: error.message,
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
    })

    // Reset form
    setPasswords({ current: "", new: "", confirm: "" })
    setIsLoading(false)
  }

  const handlePasswordReset = async () => {
    const user = supabase.auth.getUser() // get current user
    if (!user) return

    const { error } = await supabase.auth.resetPasswordForEmail(user.email || "")
    if (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for password reset instructions.",
    })
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardHeader>
        <CardTitle className="text-[#1D3557] flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Current Password</label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => handlePasswordChange("current", e.target.value)}
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 pr-12"
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">New Password</label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => handlePasswordChange("new", e.target.value)}
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 pr-12"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-[#1D3557] mb-2 block">Confirm New Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20 pr-12"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#457B9D] hover:text-[#1D3557]"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-[#005826] hover:bg-[#005826]/90 text-white">
            <Lock className="w-4 h-4 mr-2" />
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        {/* Password Reset Option */}
        <div className="pt-4 border-t border-[#1D3557]/10">
          <div className="text-center">
            <p className="text-sm text-[#457B9D] mb-3">Forgot your current password?</p>
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordReset}
              className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent"
            >
              Send Reset Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
