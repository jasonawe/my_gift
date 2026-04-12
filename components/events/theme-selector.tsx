"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Palette, Check } from "lucide-react"

const THEMES = [
  { id: "auto", name: "智能推荐", description: "根据礼事类型自动匹配", color: "bg-slate-200" },
  { id: "theme-festive", name: "朱砂红", description: "喜庆 · 庄重", color: "bg-[#b22222]" },
  { id: "theme-celadon", name: "天青色", description: "温润 · 高雅", color: "bg-[#7ba2a8]" },
  { id: "theme-ink", name: "水墨黑", description: "极简 · 文雅", color: "bg-[#333333]" },
  { id: "theme-solemn", name: "玄青蓝", description: "肃穆 · 稳重", color: "bg-[#2c3e50]" },
]

interface ThemeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-bold flex items-center gap-2 text-slate-700">
        <Palette className="size-4 text-primary" /> 视觉风格定制
      </Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            onClick={() => onChange(theme.id)}
            className={cn(
              "relative flex flex-col items-start p-3 rounded-2xl border-2 transition-all text-left group",
              value === theme.id 
                ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                : "border-slate-100 bg-white hover:border-primary/30"
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className={cn("size-6 rounded-full shadow-inner", theme.color)} />
              {value === theme.id && (
                <div className="size-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="size-3 text-white" />
                </div>
              )}
            </div>
            <p className="font-bold text-sm text-slate-900">{theme.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{theme.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
