"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Volume2, LogOut, ShieldAlert, Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
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

  if (!mounted) return null

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="space-y-1 px-2">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">系统设置</h1>
        <p className="text-sm text-muted-foreground font-bold">偏好设定与账户管理</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm card-paper border-2 border-border/50">
          <CardHeader className="pb-4 pt-10 px-10 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-xl font-bold flex items-center gap-3 text-foreground">
              <SettingsIcon className="size-5 text-primary" /> 基础偏好设定
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 py-10 space-y-8">
            {/* 语音总开关 */}
            <div className="flex items-center justify-between group">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Volume2 className="size-4 text-primary group-hover:scale-110 transition-transform" />
                  <Label className="text-lg font-bold text-foreground">全局语音播报</Label>
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-md">
                  开启后，系统在礼金录入环节将自动为您朗读姓名与金额，方便实时核对。
                </p>
              </div>
              <Switch 
                checked={voiceGlobal} 
                onCheckedChange={handleVoiceChange}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-red-50/10 border-2 border-red-100/50">
          <CardHeader className="pb-4 pt-10 px-10 border-b border-red-100/30 bg-red-50/30">
            <CardTitle className="text-xl font-bold text-red-900 flex items-center gap-3">
              <ShieldAlert className="size-5" /> 账户与安全
            </CardTitle>
          </CardHeader>
          <CardContent className="px-10 py-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-lg font-bold text-red-900">注销登录</p>
                <p className="text-sm text-red-700/60 font-medium">退出后将安全清除本次浏览器会话，下次访问需重新登录。</p>
              </div>
              <form action="/auth/signout" method="post" className="shrink-0">
                <Button type="submit" className="h-14 px-10 rounded-[1.25rem] bg-red-600 hover:bg-red-700 font-bold shadow-xl shadow-red-200 text-white transition-all active:scale-95">
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
