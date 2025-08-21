"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

const navigationItems = [
  { label: "DASHBOARD", href: "/dashboard" },
  { label: "SEARCH", href: "/correspondence" },
  { label: "NEW FORM", href: "/correspondence/new" },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="fixed left-0 top-0 h-full w-48 bg-[#1e3a5f] text-white">
      {/* Company Name */}
      <div className="p-4 border-b border-white/10">
        <h2 className="text-sm font-medium text-white">Ghana Audit Service</h2>
      </div>

      {/* Navigation */}
      <nav className="py-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`block px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white border-r-2 border-white"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-3 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition-colors"
        >
          LOGOUT
        </button>
      </div>
    </div>
  )
}
