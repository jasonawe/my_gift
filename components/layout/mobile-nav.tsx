"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Settings,
  HelpCircle,
  FolderHeart,
  Plus
} from "lucide-react"

const navItems = [
  { name: "总览", href: "/dashboard", icon: LayoutDashboard },
  { name: "管理", href: "/events", icon: FolderHeart },
  { name: "新建", href: "/events/new", icon: Plus, highlight: true },
  { name: "指引", href: "/guide", icon: HelpCircle },
  { name: "设置", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 z-50 h-20 w-full border-t bg-white/90 backdrop-blur-xl lg:hidden pb-safe">
      <div className="flex h-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          
          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/40 border-4 border-white active:scale-95 transition-all">
                  <item.icon className="size-7" />
                </div>
                <span className="text-[10px] font-black text-primary mt-1 uppercase tracking-tighter">{item.name}</span>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[3.5rem] h-full transition-all",
                isActive 
                  ? "text-primary scale-110" 
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className={cn("size-5 transition-colors", isActive ? "stroke-[3px]" : "stroke-[2px]")} />
              <span className={cn("text-[10px] font-black uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-60")}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
