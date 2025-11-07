"use client"
import { useEffect, useState } from "react"
import { Header } from "@/components/dashboard/header"
import { Sidebar } from "@/components/dashboard/sidebar"
import { supabase, type Correspondence } from "@/lib/supabase"
import { useAuth } from "@/hooks/useAuth"
import { Search, Filter, Download, Eye, FileText, Calendar, User, ChevronDown } from "lucide-react"
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

    if (searchQuery) {
      query = query.or(
        `subject.ilike.%${searchQuery}%,sender.ilike.%${searchQuery}%,recipient.ilike.%${searchQuery}%,registry_number.ilike.%${searchQuery}%`
      )
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter)
    }

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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header title="Correspondence Management" />

      <main className="ml-64 p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Correspondence Records</h1>
          <p className="text-gray-600">Search and manage organizational correspondence</p>
        </div>

        {/* Search and Filters Card */}
        <Card className="bg-white border border-gray-200 shadow-sm mb-6">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Search & Filters</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
              {/* Search Input */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search correspondence..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]">
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-300 focus:border-[#1D3557] focus:ring-[#1D3557]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="subject">Subject A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between lg:justify-end">
                <span className="text-sm text-gray-500 lg:text-right">
                  {correspondences.length} records
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between items-center">
              <Button
                onClick={handleReset}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Reset
              </Button>
              <div className="flex gap-3">
                <Button
                  onClick={handleSearch}
                  className="bg-[#1D3557] hover:bg-[#1D3557]/90 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold text-gray-900">Correspondence</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1D3557] border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading records...</p>
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
                    {correspondences.map((item) => (
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
                
                {correspondences.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium mb-1">No correspondence found</p>
                    <p className="text-sm text-gray-400">
                      {searchQuery || statusFilter !== "all" 
                        ? "Try adjusting your search criteria" 
                        : "No records available"
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
