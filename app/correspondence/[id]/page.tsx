"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CorrespondenceDetails } from "@/components/correspondence/correspondence-details"
import { ActivityLog } from "@/components/correspondence/activity-log"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

interface CorrespondenceDetailPageProps {
  params: {
    id: string
  }
}

export default function CorrespondenceDetailPage({ params }: CorrespondenceDetailPageProps) {
  const { session, loading: authLoading } = useAuth()
  const router = useRouter()

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#1D3557]">Correspondence Details</h1>
            <p className="text-[#457B9D]">View and manage correspondence information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2">
            <CorrespondenceDetails correspondenceId={params.id} />
          </div>

          {/* Activity Log */}
          <div className="lg:col-span-1">
            <ActivityLog correspondenceId={params.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
