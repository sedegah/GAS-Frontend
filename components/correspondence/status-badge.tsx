"use client"

interface StatusBadgeProps {
  status: "Pending" | "Completed" | "Archived"
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20"
      case "Completed":
        return "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
      case "Archived":
        return "bg-[#6B7280]/10 text-[#6B7280] border-[#6B7280]/20"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  )
}
