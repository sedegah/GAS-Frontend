"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { ThemeSettings } from "@/components/settings/theme-settings"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const { session, loading: authLoading } = useAuth()

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1D3557]">Settings</h1>
          <p className="text-[#457B9D]">Customize your system preferences and notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Settings */}
          <NotificationSettings />

          {/* Theme Settings */}
          <ThemeSettings />
        </div>
      </div>
    </DashboardLayout>
  )
}
