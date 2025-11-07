"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  LogOut, 
  Building,
  ChevronRight
} from "lucide-react"

const navigationItems = [
  { 
    label: "Dashboard", 
    href: "/dashboard", 
    icon: LayoutDashboard 
  },
  { 
    label: "Search Correspondence", 
    href: "/correspondence", 
    icon: Search 
  },
  { 
    label: "New Correspondence", 
    href: "/correspondence/new", 
    icon: FileText 
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      {/* Company Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#1D3557] to-[#2D4A7F]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Ghana Audit Service</h2>
            <p className="text-white/80 text-sm">Correspondence System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="py-6 px-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#1D3557] text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#1D3557]"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-white/80" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* User Section & Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3 mb-4 px-3 py-2">
          <div className="w-8 h-8 bg-[#1D3557] rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">User Account</p>
            <p className="text-xs text-gray-500 truncate">Administrator</p>
          </div>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-gray-700 hover:bg-white hover:text-red-600 rounded-lg border border-gray-300 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}
