"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase, type Correspondence } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Search, Filter, Download, Eye, FileText, Calendar, User, ArrowUpDown, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CorrespondencePage() {
  const { session, loading: authLoading } = useAuth()
  const [correspondences, setCorrespondences] = useState<Correspondence[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    if (!authLoading && session) {
      fetchCorrespondences()
    }
  }, [authLoading, session])

  const fetchCorrespondences = async () => {
    let query = supabase.from("correspondence").select("*")

    // Apply search filter
    if (searchQuery) {
      query = query.or(
        `subject.ilike.%${searchQuery}%,sender.ilike.%${searchQuery}%,recipient.ilike.%${searchQuery}%,registry_number.ilike.%${searchQuery}%`
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

    // Apply sorting
    if (sortBy === "newest") {
      query = query.order("created_at", { ascending: false })
    } else if (sortBy === "oldest") {
      query = query.order("created_at", { ascending: true })
    } else if (sortBy === "subject") {
      query = query.order("subject", { ascending: true })
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching correspondences:", error)
    } else {
      setCorrespondences(data || [])
    }
    setLoading(false)
  }

  const handleSearch = () => {
    setLoading(true)
    fetchCorrespondences()
  }

  const handleReset = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSortBy("newest")
    setLoading(true)
    fetchCorrespondences()
  }

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
          <p className="text-[#457B9D]">Loading correspondence...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#F1F5F9]">
      <Sidebar />
      <Header title="Correspondence Management" />

      <main className="ml-48 p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#1D3557] mb-3">Correspondence Records</h1>
          <p className="text-lg text-[#457B9D]">Search and manage all correspondence in the system</p>
        </div>

        {/* Search Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4 border-b border-[#1D3557]/10">
            <CardTitle className="text-2xl font-bold text-[#1D3557] flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#1D3557] to-[#005826] rounded-lg">
                <Search className="w-6 h-6 text-white" />
              </div>
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <label className="text-sm font-semibold text-[#1D3557] mb-2 block">Search Correspondence</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#457B9D]" />
                  <Input
                    placeholder="Search by subject, sender, recipient, or registry number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 text-lg rounded-xl"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-semibold text-[#1D3557] mb-2 block">Status Filter</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 rounded-xl">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-semibold text-[#1D3557] mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 border-2 border-[#1D3557]/15 focus:border-[#005826] focus:ring-2 focus:ring-[#005826]/20 rounded-xl">
                    <SelectValue placeholder="Newest First" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="subject">Subject A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-[#457B9D] bg-[#F1F5F9] px-4 py-2 rounded-lg border border-[#1D3557]/10">
                Found {correspondences.length} correspondence records
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 border-2 border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 hover:text-[#1D3557] rounded-xl px-6"
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={handleSearch}
                  className="h-12 bg-gradient-to-r from-[#005826] to-[#1D3557] hover:from-[#005826]/90 hover:to-[#1D3557]/90 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-[#1D3557]/10">
            <CardTitle className="text-2xl font-bold text-[#1D3557] flex items-center gap-3">
              <div className="p-2 bg-[#1D3557] rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              Correspondence Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1D3557] mx-auto mb-4"></div>
                <p className="text-[#457B9D] text-lg">Loading correspondence records...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#1D3557]/5 to-[#005826]/5">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-bold text-[#1D3557] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Registry Details
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-[#1D3557] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-[#1D3557] uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Parties
                        </div>
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-[#1D3557] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-6 text-left text-sm font-bold text-[#1D3557] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D3557]/10">
                    {correspondences.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1D3557]/3 transition-colors duration-200 group">
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-semibold text-[#1D3557] text-lg leading-tight group-hover:text-[#005826] transition-colors">
                              {item.subject}
                            </p>
                            <p className="text-sm text-[#457B9D] font-mono mt-1">
                              #{item.registry_number || "N/A"}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#457B9D]" />
                            <span className="text-sm font-medium text-[#1D3557]">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-[#1D3557]">
                                <span className="font-medium">From:</span> {item.sender}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-[#1D3557]">
                                <span className="font-medium">To:</span> {item.recipient}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              className="h-10 bg-[#1D3557] hover:bg-[#1D3557]/90 text-white rounded-lg px-4 shadow-lg transition-all"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              className="h-10 border-2 border-[#1D3557]/20 text-[#1D3557] hover:bg-[#1D3557] hover:text-white rounded-lg px-4 transition-all"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {correspondences.length === 0 && (
                  <div className="text-center py-20">
                    <FileText className="w-24 h-24 text-[#457B9D] opacity-30 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-[#457B9D] mb-2">No correspondence found</p>
                    <p className="text-[#457B9D]">
                      {searchQuery || statusFilter !== "all" 
                        ? "Try adjusting your search criteria or filters" 
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
