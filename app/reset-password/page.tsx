"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { LayoutDashboard, Loader2, KeyRound, Check } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 8) {
      toast.error("新密码至少需要8位")
      return
    }
    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      if (error) throw error
      toast.success("密码重置成功！请使用新密码登录")
      setTimeout(() => router.push("/login"), 2000)
    } catch (error: any) {
      toast.error(error.message || "重置失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#f8f9fa] text-[#1d1b19]">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-t-8 border-t-primary rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="space-y-1 text-center pb-6 pt-10 px-8">
            <div className="mx-auto size-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white mb-4 shadow-lg">
              <KeyRound className="size-8" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">设定新密钥</CardTitle>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest px-6">New Password Setup</p>
          </CardHeader>
          
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-6 px-10 pb-10">
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">新密码 / NEW PASSWORD</Label>
                <Input
                  type="password"
                  required
                  placeholder="请输入 8 位以上新密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 focus:border-primary rounded-2xl px-5"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">确认新密码 / CONFIRM</Label>
                <Input
                  type="password"
                  required
                  placeholder="请再次输入以确认"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`h-12 bg-gray-50 border-2 transition-all rounded-2xl px-5 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-5 pt-10 pb-14 px-10 border-t bg-slate-50/50">
              <Button type="submit" className="w-full h-14 text-base font-black shadow-xl shadow-primary/20 rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "完成重置"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
