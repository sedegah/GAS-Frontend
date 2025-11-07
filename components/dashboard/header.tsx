"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export function Header({ title }: { title: string }) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Get first letter of email or fallback to "U"
  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6 ml-64">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor and manage all correspondence activities</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.email || "Staff"}</p>
          </div>
          <div className="w-10 h-10 bg-[#1D3557] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{getUserInitial()}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
