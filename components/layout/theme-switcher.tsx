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
          className="h-9 px-3 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary transition-all flex items-center gap-2"
        >
          <Palette className="size-4" />
          <span className="text-xs font-bold">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-2 shadow-xl bg-background">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer focus:bg-primary/5 group"
          >
            <div className="flex items-center gap-3">
              <div className={cn("size-4 rounded-full shadow-inner", t.color)} />
              <span className={cn(
                "text-sm font-bold transition-colors",
                theme === t.id ? "text-primary" : "text-foreground"
              )}>
                {t.name}
              </span>
            </div>
            {theme === t.id && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
