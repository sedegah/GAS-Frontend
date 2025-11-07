"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase, type Correspondence } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { FileText, Calendar, User, Search, Filter, Download, Eye } from "lucide-react"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Archived":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D3557] mx-auto mb-4"></div>
          <p className="text-[#457B9D]">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
      <Sidebar />
      <Header title="Correspondence System" />

      <main className="ml-48 p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D]">Total Correspondence</p>
                  <p className="text-2xl font-bold text-[#1D3557] mt-1">{correspondences.length}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#1D3557] to-[#005826] rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D]">Pending</p>
                  <p className="text-2xl font-bold text-[#1D3557] mt-1">
                    {correspondences.filter(item => item.status === "Pending").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D]">Completed</p>
                  <p className="text-2xl font-bold text-[#1D3557] mt-1">
                    {correspondences.filter(item => item.status === "Completed").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#457B9D]">Archived</p>
                  <p className="text-2xl font-bold text-[#1D3557] mt-1">
                    {correspondences.filter(item => item.status === "Archived").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-[#1D3557]/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl font-bold text-[#1D3557]">Correspondence Overview</CardTitle>
                <p className="text-[#457B9D] mt-1">Manage and track all correspondence records</p>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#457B9D]" />
                  <Input
                    placeholder="Search correspondence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 rounded-xl w-full sm:w-64"
                  />
                </div>
                <Button variant="outline" className="h-10 border-2 border-[#1D3557]/15 text-[#457B9D] hover:bg-[#1D3557]/5 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1D3557] mx-auto mb-4"></div>
                <p className="text-[#457B9D]">Loading correspondences...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#1D3557]/5 to-[#005826]/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Registry Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Sender
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#1D3557] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D3557]/10">
                    {filteredCorrespondences.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1D3557]/3 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm font-medium text-[#1D3557] font-mono">
                              {item.registry_number || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm text-[#457B9D]">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm text-[#1D3557]">{item.sender}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm text-[#1D3557]">{item.recipient}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1D3557] line-clamp-2 max-w-xs">{item.subject}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 hover:text-[#1D3557]"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 hover:text-[#1D3557]"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCorrespondences.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-[#457B9D] mx-auto mb-4 opacity-50" />
                    <p className="text-[#457B9D]">No correspondence records found</p>
                    {searchTerm && (
                      <p className="text-sm text-[#457B9D] mt-1">Try adjusting your search terms</p>
                    )}
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
