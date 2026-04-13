"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const themes = [
  { id: "theme-festive", name: "朱砂红", color: "bg-[#b22222]" },
  { id: "theme-celadon", name: "天青色", color: "bg-[#7ba2a8]" },
  { id: "theme-ink", name: "水墨黑", color: "bg-[#333333]" },
  { id: "theme-solemn", name: "玄青蓝", color: "bg-[#2c3e50]" },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="size-9 p-0 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/30 transition-all group"
        >
          <Palette className="size-4.5 text-slate-400 group-hover:text-primary transition-colors" />
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-2 bg-background">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer hover:bg-muted group"
          >
            <div className="flex items-center gap-3">
              <div className={cn("size-3.5 rounded-full ring-2 ring-offset-2 ring-transparent transition-all", t.color, theme === t.id && "ring-primary/40")} />
              <span className={cn("text-sm font-bold transition-colors", theme === t.id ? "text-primary" : "text-slate-600 dark:text-slate-400")}>
                {t.name}
              </span>
            </div>
            {theme === t.id && <Check className="size-4 text-primary animate-in zoom-in-50 duration-300" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
