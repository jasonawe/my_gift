"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { 
  LayoutDashboard, 
  Settings,
  User as UserIcon,
  LogOut,
  Plus,
  HelpCircle,
  FolderHeart,
  Palette
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ThemeSwitcher } from "./theme-switcher"
import { useTheme } from "next-themes"

const navItems = [
  { name: "总览中心", href: "/dashboard", icon: LayoutDashboard },
  { name: "礼事管理", href: "/events", icon: FolderHeart },
  { name: "使用指引", href: "/guide", icon: HelpCircle },
  { name: "设置", href: "/settings", icon: Settings },
]

const themes = [
  { id: "theme-festive", name: "朱砂红", color: "bg-[#b22222]" },
  { id: "theme-celadon", name: "天青色", color: "bg-[#7ba2a8]" },
  { id: "theme-ink", name: "水墨黑", color: "bg-[#333333]" },
  { id: "theme-solemn", name: "玄青蓝", color: "bg-[#2c3e50]" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      setUser(null)
      await supabase.auth.signOut()
      toast.success("已安全注销")
      window.location.href = "/login"
    } catch (error) {
      window.location.href = "/login"
    }
  }

  // 处于登录/注册等鉴权页面时不显示复杂的导航
  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/signup') || 
                     pathname.startsWith('/forgot-password') || 
                     pathname.startsWith('/reset-password')

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:rotate-3 transition-all font-bold text-xl">
              G
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight leading-tight text-foreground">礼簿管家</span>
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Smart Archive</span>
            </div>
          </Link>

          {/* 只有登录且不在鉴权页时显示导航 */}
          {!loading && user && !isAuthPage && (
            <nav className="hidden lg:flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                      isActive 
                        ? "bg-background text-primary shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("size-3.5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          )}

          {/* 右侧动作区 */}
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                <ThemeSwitcher />

                {user && !isAuthPage && (                  <>
                    <Button asChild size="sm" className="hidden md:flex rounded-xl font-bold h-9 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all text-primary-foreground">
                      <Link href="/events/new">
                        <Plus className="mr-1.5 size-4" /> 新建礼事
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors border group">
                          <div className="size-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-2 border-background transition-all overflow-hidden">
                            <UserIcon className="size-4" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-2xl border-2 bg-background">
                        <DropdownMenuLabel className="px-4 py-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">当前登录账号</p>
                          <p className="text-sm font-bold text-foreground truncate">{user?.email}</p>
                        </DropdownMenuLabel>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:bg-red-50 rounded-xl py-3 font-bold cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" /> 安全退出
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}

                {/* 未登录时显示登录按钮 */}
                {!user && !isAuthPage && (
                  <Button asChild size="sm" className="rounded-xl font-bold h-9 bg-primary text-primary-foreground">
                    <Link href="/login">立即登录</Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
