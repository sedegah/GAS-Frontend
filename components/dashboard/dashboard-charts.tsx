"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts"

const departmentData = [
  { name: "Finance", correspondences: 245, color: "#005826" },
  { name: "HR", correspondences: 189, color: "#457B9D" },
  { name: "Operations", correspondences: 167, color: "#F59E0B" },
  { name: "Legal", correspondences: 134, color: "#10B981" },
  { name: "IT", correspondences: 98, color: "#E63946" },
  { name: "Admin", correspondences: 87, color: "#FFD700" },
]

const trendData = [
  { month: "Jan", correspondences: 186 },
  { month: "Feb", correspondences: 205 },
  { month: "Mar", correspondences: 237 },
  { month: "Apr", correspondences: 198 },
  { month: "May", correspondences: 289 },
  { month: "Jun", correspondences: 312 },
]

const chartConfig = {
  correspondences: {
    label: "Correspondences",
    color: "#005826",
  },
}

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Department Activity Bar Chart */}
      <Card className="border-[#1D3557]/10">
        <CardHeader>
          <CardTitle className="text-[#1D3557]">Department Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#457B9D", fontSize: 12 }}
                  axisLine={{ stroke: "#1D3557", strokeOpacity: 0.2 }}
                />
                <YAxis tick={{ fill: "#457B9D", fontSize: 12 }} axisLine={{ stroke: "#1D3557", strokeOpacity: 0.2 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="correspondences" fill="#005826" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends Line Chart */}
      <Card className="border-[#1D3557]/10">
        <CardHeader>
          <CardTitle className="text-[#1D3557]">Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#457B9D", fontSize: 12 }}
                  axisLine={{ stroke: "#1D3557", strokeOpacity: 0.2 }}
                />
                <YAxis tick={{ fill: "#457B9D", fontSize: 12 }} axisLine={{ stroke: "#1D3557", strokeOpacity: 0.2 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="correspondences"
                  stroke="#005826"
                  strokeWidth={3}
                  dot={{ fill: "#005826", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#005826" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
