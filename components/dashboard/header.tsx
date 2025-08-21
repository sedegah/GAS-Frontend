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

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 ml-48">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user?.email || "Staff"}</p>
        </div>
      </div>
    </header>
  )
}
