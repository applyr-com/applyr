// ScholarshipCard.tsx
// Requires: npx shadcn@latest add card badge button tooltip

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { StatusBadge, ScholarshipStatus } from "./Statusbadge"
import { CalendarDays, RefreshCw, Pencil, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScholarshipCardProps {
  name: string
  org: string
  amount: number
  deadline: string          // ISO date string e.g. "2025-03-01"
  renewable: boolean
  tags: string[]
  matchScore: number        // 0–100
  status: ScholarshipStatus
  isCustom?: boolean
  onOpen?: () => void
  onEdit?: () => void       // only shown when isCustom
}

function MatchScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-emerald-600" :
    score >= 60 ? "text-amber-500" :
    "text-slate-400"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn("flex flex-col items-center gap-0.5 cursor-default", color)}>
          <span className="text-lg font-bold leading-none">{score}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide opacity-70">match</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {score >= 80
          ? "Strong match based on your profile"
          : score >= 60
          ? "Moderate match — worth applying"
          : "Low match — review requirements"}
      </TooltipContent>
    </Tooltip>
  )
}

function formatDeadline(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  return { formatted, diffDays }
}

function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
}

export function ScholarshipCard({
  name,
  org,
  amount,
  deadline,
  renewable,
  tags,
  matchScore,
  status,
  isCustom = false,
  onOpen,
  onEdit,
}: ScholarshipCardProps) {
  const { formatted, diffDays } = formatDeadline(deadline)
  const deadlineUrgent = diffDays <= 14 && diffDays > 0
  const deadlinePassed = diffDays <= 0

  return (
    <Card className="flex flex-col gap-0 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">

          {/* Name + org */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              {isCustom && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Pencil className="w-3 h-3 text-muted-foreground shrink-0" />
                  </TooltipTrigger>
                  <TooltipContent>Added by you</TooltipContent>
                </Tooltip>
              )}
              <h3 className="font-semibold text-sm leading-snug truncate">{name}</h3>
            </div>
            <p className="text-xs text-muted-foreground truncate">{org}</p>
          </div>

          {/* Match score */}
          <MatchScoreRing score={matchScore} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-3">

        {/* Amount + renewable */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">{formatAmount(amount)}</span>
          {renewable && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium cursor-default">
                  <RefreshCw className="w-3 h-3" />
                  Renewable
                </span>
              </TooltipTrigger>
              <TooltipContent>This scholarship can be renewed each year</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5">
          <CalendarDays className={cn(
            "w-3.5 h-3.5 shrink-0",
            deadlinePassed ? "text-red-400" :
            deadlineUrgent ? "text-amber-500" :
            "text-muted-foreground"
          )} />
          <span className={cn(
            "text-xs",
            deadlinePassed ? "text-red-500 font-medium" :
            deadlineUrgent ? "text-amber-600 font-medium" :
            "text-muted-foreground"
          )}>
            {deadlinePassed
              ? "Deadline passed"
              : deadlineUrgent
              ? `Due ${formatted} · ${diffDays}d left`
              : `Due ${formatted}`}
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[11px] px-2 py-0 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-2 border-t">
        <StatusBadge status={status} />

        <div className="flex items-center gap-2">
          {isCustom && onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 text-xs">
              Edit
            </Button>
          )}
          <Button size="sm" onClick={onOpen} className="h-7 text-xs gap-1">
            <Sparkles className="w-3 h-3" />
            View
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
