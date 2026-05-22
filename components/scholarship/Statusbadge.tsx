// StatusBadge.tsx
// Requires: npx shadcn@latest add badge

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type ScholarshipStatus =
  | "saved"
  | "inprogress"
  | "submitted"
  | "won"
  | "rejected"

interface StatusBadgeProps {
  status: ScholarshipStatus
  className?: string
}

const statusConfig: Record<
  ScholarshipStatus,
  { label: string; className: string }
> = {
  saved: {
    label: "Saved",
    className: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  },
  inprogress: {
    label: "In Progress",
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
  },
  won: {
    label: "Won 🎉",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-500 border-red-200 hover:bg-red-50",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClassName } = statusConfig[status]

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium px-2 py-0.5", statusClassName, className)}
    >
      {label}
    </Badge>
  )
}