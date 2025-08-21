"use client"

import { useEffect, useState } from "react"
import { User, Mail, Building, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface ProfileData {
  full_name: string
  email: string
  department?: string
  position?: string
  join_date?: string
  last_login?: string
}

export function ProfileCard() {
  const [user, setUser] = useState<ProfileData | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from("users") // replace with your users table
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profile) {
        setUser({
          full_name: profile.full_name,
          email: session.user.email || "",
          department: profile.department,
          position: profile.position,
          join_date: profile.join_date,
          last_login: profile.last_login,
        })
      }
    }

    fetchUser()
  }, [])

  if (!user) return <p>Loading profile...</p>

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardHeader>
        <CardTitle className="text-[#1D3557] flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-[#005826] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{getInitials(user.full_name)}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1D3557]">{user.full_name}</h3>
            <p className="text-[#457B9D]">{user.position || "N/A"}</p>
          </div>
        </div>

        {/* Information Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
            <Mail className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="text-sm font-medium text-[#1D3557]">Email Address</p>
              <p className="text-[#457B9D]">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
            <Building className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="text-sm font-medium text-[#1D3557]">Department</p>
              <p className="text-[#457B9D]">{user.department || "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
            <Calendar className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="text-sm font-medium text-[#1D3557]">Join Date</p>
              <p className="text-[#457B9D]">{user.join_date ? new Date(user.join_date).toLocaleDateString() : "N/A"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[#F9FAFB] rounded-lg border border-[#1D3557]/10">
            <User className="w-5 h-5 text-[#457B9D]" />
            <div>
              <p className="text-sm font-medium text-[#1D3557]">Last Login</p>
              <p className="text-[#457B9D]">{user.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
