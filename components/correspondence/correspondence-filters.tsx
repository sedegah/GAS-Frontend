"use client"

import { useState } from "react"
import { Search, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

const statuses = ["All Status", "Pending", "Completed", "Archived"]

export function CorrespondenceFilters() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("All Status")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedStatus("All Status")
    setDateFrom("")
    setDateTo("")
  }

  return (
    <Card className="border-[#1D3557]/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#457B9D]" />
            <Input
              placeholder="Search by subject, sender, or registry number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D3557] flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D3557] flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                From Date
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1D3557]">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border-[#1D3557]/20 focus:border-[#005826] focus:ring-[#005826]/20"
              />
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-transparent">Actions</label>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="w-full border-[#1D3557]/20 text-[#457B9D] hover:bg-[#1D3557]/5 bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
