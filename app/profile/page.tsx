"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProfileCard } from "@/components/profile/profile-card"
import { PasswordChange } from "@/components/profile/password-change"
import { useAuth } from "@/hooks/useAuth"

export default function ProfilePage() {
  const { session, loading: authLoading } = useAuth()

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-[#1D3557]">Profile</h1>
          <p className="text-[#457B9D]">Manage your account information and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <ProfileCard />

          {/* Password Management */}
          <PasswordChange />
        </div>
      </div>
    </DashboardLayout>
  )
}
