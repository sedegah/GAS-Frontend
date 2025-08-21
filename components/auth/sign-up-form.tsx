"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"

export function SignUpForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate password match
    if (password !== confirmPassword) {
      toast({ 
        title: "Password Mismatch", 
        description: "Passwords do not match", 
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
          data: { 
            full_name: fullName.trim() 
          } 
        },
      })

      // Use the SAME simple error handling that worked in your old React code
      if (error) {
        console.error('Sign up error:', error)
        toast({ 
          title: "Registration Failed", 
          description: error.message, 
          variant: "destructive" 
        })
        return
      }

      // Check if user was created successfully
      if (!data.user) {
        toast({ 
          title: "Registration Failed", 
          description: "Failed to create account. Please try again.", 
          variant: "destructive" 
        })
        return
      }

      // Clear sensitive form data
      setPassword("")
      setConfirmPassword("")
      
      toast({ 
        title: "Account Created Successfully", 
        description: "Please check your email and click the confirmation link before signing in.",
      })

      // Redirect to login page
      router.push("/login")
      
    } catch (err) {
      console.error('Unexpected error during sign up:', err)
      toast({ 
        title: "Registration Failed", 
        description: "An unexpected error occurred. Please try again.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="name" className="text-white flex items-center gap-2">
          <User />
          Full Name
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="email" className="text-white flex items-center gap-2">
          <Mail />
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="password" className="text-white flex items-center gap-2">
          <Lock />
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="absolute right-0 top-0 h-full px-4" 
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="confirm-password" className="text-white flex items-center gap-2">
          <Lock />
          Confirm Password
        </Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPassword && password !== confirmPassword && (
          <p className="text-red-400 text-xs">Passwords do not match</p>
        )}
      </div>

      <Button 
        type="submit" 
        disabled={isLoading || password !== confirmPassword}
        className="w-full"
      >
        {isLoading ? "Creating account..." : "Create Account"}
      </Button>

      <div className="text-center text-sm text-white/70">
        <p>By creating an account, you'll need to confirm your email address before you can sign in.</p>
      </div>
    </form>
  )
}
