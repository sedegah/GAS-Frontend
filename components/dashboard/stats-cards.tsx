"use client"
import { FileText, Clock, CheckCircle, Building } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const statsData = [
  {
    title: "Total Correspondences",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: FileText,
    color: "#005826",
  },
  {
    title: "Pending",
    value: "89",
    change: "-5%",
    changeType: "negative" as const,
    icon: Clock,
    color: "#F59E0B",
  },
  {
    title: "Completed",
    value: "1,158",
    change: "+18%",
    changeType: "positive" as const,
    icon: CheckCircle,
    color: "#10B981",
  },
  {
    title: "Departments",
    value: "12",
    change: "0%",
    changeType: "neutral" as const,
    icon: Building,
    color: "#457B9D",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.title} className="border-[#1D3557]/10 hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D] mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-[#1D3557]">{stat.value}</p>
                  <p
                    className={`text-sm mt-2 ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                          ? "text-red-600"
                          : "text-[#457B9D]"
                    }`}
                  >
                    {stat.change} from last month
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
