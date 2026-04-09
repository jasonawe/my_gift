"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { 
  LayoutDashboard, 
  BookText,
  Settings,
  User as UserIcon,
  LogOut,
  Mail,
  Plus,
  HelpCircle,
  FolderHeart
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const navItems = [
  { name: "总览中心", href: "/dashboard", icon: LayoutDashboard },
  { name: "礼事管理", href: "/events", icon: FolderHeart },
  { name: "使用指引", href: "/guide", icon: HelpCircle },
  { name: "设置", href: "/settings", icon: Settings },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      toast.success("已注销")
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:rotate-3 transition-all font-black text-xl">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight leading-tight text-slate-900 dark:text-white">礼簿管家</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Smart Archive</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-2xl border dark:border-slate-700">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                    isActive 
                      ? "bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <item.icon className={cn("size-3.5", isActive ? "text-primary dark:text-white" : "text-slate-400 dark:text-slate-500")} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="hidden md:flex rounded-xl font-black h-9 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all">
              <Link href="/events/new">
                <Plus className="mr-1.5 size-4" /> 新建礼事
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border dark:border-slate-700 group">
                  <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 border-2 border-white dark:border-slate-600 transition-all overflow-hidden">
                    <UserIcon className="size-4" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-[1.5rem] p-2 shadow-2xl border-2 dark:bg-slate-900 dark:border-slate-800">
                <DropdownMenuLabel className="px-4 py-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-slate-800" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 rounded-xl py-3 font-black cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> 安全退出
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
