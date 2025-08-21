"use client"
import { Plus, Eye, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

const quickActions = [
  {
    title: "New Correspondence",
    description: "Register new correspondence",
    icon: Plus,
    color: "#005826",
    href: "/correspondence/new",
  },
  {
    title: "View All",
    description: "Browse all correspondence",
    icon: Eye,
    color: "#457B9D",
    href: "/correspondence",
  },
  {
    title: "Bulk Upload",
    description: "Upload multiple files",
    icon: Upload,
    color: "#F59E0B",
    href: "/correspondence/new",
  },
  {
    title: "Export Data",
    description: "Download reports",
    icon: Download,
    color: "#10B981",
    href: "/correspondence",
  },
]

export function QuickActions() {
  const router = useRouter()

  const handleActionClick = (href: string) => {
    router.push(href)
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardHeader>
        <CardTitle className="text-[#1D3557]">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon

            return (
              <Button
                key={action.title}
                variant="outline"
                onClick={() => handleActionClick(action.href)}
                className="h-auto p-4 flex flex-col items-center gap-3 border-[#1D3557]/20 hover:border-[#005826] hover:bg-[#005826]/5 transition-all duration-200 bg-transparent"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <div className="text-center">
                  <p className="font-medium text-[#1D3557] text-sm">{action.title}</p>
                  <p className="text-xs text-[#457B9D] mt-1">{action.description}</p>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
