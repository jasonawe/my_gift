"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Volume2, Moon, Sun, LogOut, ShieldAlert, Laptop, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [voiceGlobal, setVoiceGlobal] = useState(true)
  const [mounted, setIsMounted] = useState(false)

  // 解决 hydration 不匹配问题
  useEffect(() => {
    setIsMounted(true)
    const savedVoice = localStorage.getItem("setting_voice_global")
    if (savedVoice !== null) setVoiceGlobal(savedVoice === "true")
  }, [])

  const handleVoiceChange = (checked: boolean) => {
    setVoiceGlobal(checked)
    localStorage.setItem("setting_voice_global", String(checked))
    toast.success(checked ? "全局语音播报已开启" : "全局语音播报已禁用")
  }

  const handleThemeChange = (value: string) => {
    setTheme(value)
    toast.success(`视觉模式已切换`)
  }

  if (!mounted) return null

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="space-y-2 px-2">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">系统设置</h1>
        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">System Preferences</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/50 dark:border dark:border-slate-800">
          <CardHeader className="pb-4 pt-10 px-10 border-b border-slate-50 dark:border-slate-800">
            <CardTitle className="text-xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
              <SettingsIcon className="size-5 text-primary" /> 基础偏好设定
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 py-8 space-y-8">
            {/* 语音总开关 */}
            <div className="flex items-center justify-between group">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
                  <Label className="text-lg font-black text-slate-900 dark:text-slate-200">全局语音播报</Label>
                </div>
                <p className="text-sm text-slate-400 font-medium max-w-md">
                  开启后，系统在录入环节将允许发声。
                </p>
              </div>
              <Switch 
                checked={voiceGlobal} 
                onCheckedChange={handleVoiceChange}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            
            <div className="h-px bg-slate-50 dark:bg-slate-800 w-full" />

            {/* 视觉模式切换 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Moon className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
                  <Label className="text-lg font-black text-slate-900 dark:text-slate-200">视觉界面模式</Label>
                </div>
                <p className="text-sm text-slate-400 font-medium max-w-md">
                  调整系统整体配色方案，支持深色模式。
                </p>
              </div>
              <div className="w-full sm:w-48">
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-2">
                    <SelectItem value="light" className="font-bold py-2.5">
                      <div className="flex items-center gap-2"><Sun className="size-4 opacity-60" /> 亮色模式</div>
                    </SelectItem>
                    <SelectItem value="dark" className="font-bold py-2.5">
                      <div className="flex items-center gap-2"><Moon className="size-4 opacity-60" /> 深色模式</div>
                    </SelectItem>
                    <SelectItem value="system" className="font-bold py-2.5">
                      <div className="flex items-center gap-2"><Laptop className="size-4 opacity-60" /> 随系统自动</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-red-50/20 border-2 border-red-50 dark:bg-red-950/10 dark:border-red-900/20">
          <CardHeader className="pb-4 pt-10 px-10 border-b border-red-100/50 dark:border-red-900/30">
            <CardTitle className="text-xl font-black text-red-900 dark:text-red-400 flex items-center gap-3">
              <ShieldAlert className="size-5" /> 账户与安全
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-lg font-black text-red-900 dark:text-red-400">注销登录</p>
                <p className="text-sm text-red-700/60 dark:text-red-400/60 font-medium">退出后将清除本次浏览器会话。</p>
              </div>
              <form action="/auth/signout" method="post" className="shrink-0">
                <Button type="submit" className="h-14 px-10 rounded-[1.25rem] bg-red-600 hover:bg-red-700 font-black shadow-xl shadow-red-200 dark:shadow-none">
                  <LogOut className="mr-2 size-5" /> 立即安全退出
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
