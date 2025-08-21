"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Github, Mail } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

type OAuthProvider = "google" | "github"

export function SocialLogin() {
  const { toast } = useToast()

  const handleSocialLogin = async (provider: OAuthProvider) => {
    try {
      // Start OAuth login flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Optional: redirect back to your app after login
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        toast({
          title: "OAuth Login Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // This usually redirects immediately, but show toast just in case
      toast({
        title: "Redirecting...",
        description: `Continue login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
      })
    } catch (err) {
      console.error("Social login error:", err)
      toast({
        title: "OAuth Error",
        description: "Unexpected error during social login.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Separator */}
      <div className="relative">
        <Separator className="bg-[#3a3a3c]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-[#1c1c1e] px-4 text-sm text-[#8e8e93] font-medium tracking-wide font-sans">
            OR CONTINUE WITH
          </span>
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          className="bg-[#2c2c2e] border border-[#3a3a3c] text-white hover:bg-[#3a3a3c] rounded-2xl h-14 flex items-center justify-center"
          onClick={() => handleSocialLogin("google")}
        >
          <Mail className="w-5 h-5 mr-2" />
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="bg-[#2c2c2e] border border-[#3a3a3c] text-white hover:bg-[#3a3a3c] rounded-2xl h-14 flex items-center justify-center"
          onClick={() => handleSocialLogin("github")}
        >
          <Github className="w-5 h-5 mr-2" />
          GitHub
        </Button>
      </div>
    </div>
  )
}
