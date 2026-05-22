// AppLayout.tsx
// Requires: npx shadcn@latest add avatar separator tooltip

import { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Search,
  BookMarked,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Dashboard",         href: "/",                icon: LayoutDashboard },
  { label: "Find Scholarships", href: "/find",            icon: Search },
  { label: "My Scholarships",   href: "/my-scholarships", icon: BookMarked },
  { label: "Experiences",       href: "/experiences",     icon: Lightbulb },
]

interface AppLayoutProps {
  children: ReactNode
  currentPath?: string
  user?: {
    name: string
    email: string
    avatarUrl?: string
  }
}

export function AppLayout({
  children,
  currentPath = "/",
  user = { name: "Jane Doe", email: "jane@example.com" },
}: AppLayoutProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <aside className="flex flex-col w-60 border-r bg-card shrink-0">

          {/* Logo */}
          <div className="flex items-center gap-2 px-4 h-16">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-base tracking-tight">ScholarPath</span>
          </div>

          <Separator />

          {/* Nav links */}
          <nav className="flex flex-col gap-1 px-2 py-3 flex-1">
            {navLinks.map(({ label, href, icon: Icon }) => {
              const active = currentPath === href
              return (
                <a
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </a>
              )
            })}
          </nav>

          <Separator />

          {/* User avatar */}
          <div className="px-3 py-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-3 w-full rounded-md px-2 py-2 hover:bg-muted transition-colors text-left">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Profile & Settings</TooltipContent>
            </Tooltip>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </TooltipProvider>
  )
}