"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase, type Correspondence } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth()
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCorrespondences = async () => {
      if (!session) return

      const { data, error } = await supabase
        .from("correspondence")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching correspondences:", error)
      } else {
        setCorrespondences(data || [])
      }
      setLoading(false)
    }

    if (!authLoading) {
      fetchCorrespondences()
    }
  }, [session, authLoading])

  if (authLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title="Correspondence System" />

      <main className="ml-48 p-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard Overview</h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading correspondences...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attachment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {correspondences.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.registry_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.recipient}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                        <button>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
