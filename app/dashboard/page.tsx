"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase, type Correspondence } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { FileText, Calendar, User, Search, Filter, Download, Eye, TrendingUp, Clock, CheckCircle, Archive } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const { session, loading: authLoading } = useAuth()
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredCorrespondences = correspondences.filter(item =>
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.registry_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: correspondences.length,
    pending: correspondences.filter(item => item.status === "Pending").length,
    completed: correspondences.filter(item => item.status === "Completed").length,
    archived: correspondences.filter(item => item.status === "Archived").length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "Archived":
        return "bg-slate-100 text-slate-700 border border-slate-300"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1D3557] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title="Correspondence Management" />

      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor and manage all correspondence activities</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">Correspondence</p>
                </div>
                <div className="w-12 h-12 bg-[#1D3557] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-amber-600 mt-1">{stats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">{stats.completed}</p>
                  <p className="text-xs text-gray-500 mt-1">Processed</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Archived</p>
                  <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.archived}</p>
                  <p className="text-xs text-gray-500 mt-1">Stored records</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Archive className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Correspondence</CardTitle>
                <p className="text-gray-600 text-sm mt-1">Latest correspondence records</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search correspondence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557] w-full lg:w-64"
                  />
                </div>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1D3557] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading correspondence...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Subject & ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Sender/Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCorrespondences.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm mb-1">{item.subject}</p>
                            <p className="text-xs text-gray-500 font-mono">#{item.registry_number || "N/A"}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">From: {item.sender}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">To: {item.recipient}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-8 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Export
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCorrespondences.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-1">No correspondence found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm 
                        ? "Try adjusting your search criteria" 
                        : "No correspondence records available"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
