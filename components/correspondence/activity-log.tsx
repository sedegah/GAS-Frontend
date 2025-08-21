"use client"

import { useEffect, useState } from "react"
import { Clock, User, Edit, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface ActivityLogProps {
  correspondenceId: string
}

interface Activity {
  id: string
  action: string
  description: string
  user: string
  timestamp: string
  icon?: "edit" | "file" | "user"
}

export function ActivityLog({ correspondenceId }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .eq("correspondence_id", correspondenceId)
        .order("timestamp", { ascending: false })

      if (error) {
        console.error("Error fetching activity log:", error)
      } else if (data) {
        setActivities(data as Activity[])
      }

      setLoading(false)
    }

    if (correspondenceId) fetchActivities()
  }, [correspondenceId])

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "edit":
        return Edit
      case "file":
        return FileText
      default:
        return User
    }
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardHeader>
        <CardTitle className="text-[#1D3557] flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-[#457B9D]">Loading activity...</p>
        ) : activities.length === 0 ? (
          <p className="text-[#457B9D]">No activity found for this correspondence.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getIcon(activity.icon)

              return (
                <div key={activity.id} className="relative">
                  {index < activities.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-[#1D3557]/20"></div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#005826]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#005826]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#1D3557]/10">
                        <h4 className="font-medium text-[#1D3557] mb-1">{activity.action}</h4>
                        <p className="text-sm text-[#457B9D] mb-2">{activity.description}</p>
                        <div className="flex items-center gap-2 text-xs text-[#457B9D]">
                          <User className="w-3 h-3" />
                          <span>{activity.user}</span>
                          <span>•</span>
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
