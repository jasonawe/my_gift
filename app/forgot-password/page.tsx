"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { LayoutDashboard, Loader2, ArrowLeft, Mail, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Captcha, CaptchaHandle } from "@/components/auth/captcha"
import { motion, AnimatePresence } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const captchaRef = useRef<CaptchaHandle>(null)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 验证码校验
    const actualCode = captchaRef.current?.getCode()
    if (!captchaInput || captchaInput.toUpperCase() !== actualCode) {
      setError("验证码输入不正确")
      captchaRef.current?.refresh()
      setCaptchaInput("")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setSubmitted(true)
      toast.success("重置链接已发送至您的邮箱")
    } catch (error: any) {
      setError(error.message || "请求失败")
      captchaRef.current?.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#f8f9fa] text-[#1d1b19]">
      <div className="w-full max-w-md">
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <Alert variant="destructive" className="border-2 bg-white text-red-600 border-red-500 shadow-xl py-3 rounded-2xl">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-black text-sm ml-2">请求失败</AlertTitle>
                <AlertDescription className="font-bold text-xs ml-2 mt-0.5">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="shadow-2xl border-t-8 border-t-primary rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="space-y-1 text-center pb-6 pt-10 px-8">
            <div className="mx-auto size-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white mb-4 shadow-lg">
              <Mail className="size-8" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">重置安全密钥</CardTitle>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest px-6">Password Recovery</p>
          </CardHeader>
          
          {submitted ? (
            <CardContent className="py-12 px-10 text-center space-y-6">
              <div className="space-y-2">
                <p className="font-bold text-slate-600 text-lg">
                  邮件已发送
                </p>
                <p className="text-sm text-slate-400 leading-relaxed">
                  请查看 <span className="text-primary font-bold">{email}</span> 的收件箱，点击其中的链接完成重置。
                </p>
              </div>
              <Button asChild variant="outline" className="w-full h-12 rounded-xl border-2 font-bold">
                <Link href="/login">回到登录页</Link>
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handleResetRequest}>
              <CardContent className="space-y-6 px-10 pb-10">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">关联邮箱 / REGISTERED EMAIL</Label>
                  <Input
                    type="email"
                    required
                    placeholder="请输入注册时使用的邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-primary rounded-2xl px-5 font-bold"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">人机验证 / CAPTCHA</Label>
                  <div className="flex gap-3">
                    <Input
                      required
                      placeholder="验证码"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="flex-1 h-12 bg-gray-50 border-gray-200 focus:border-primary rounded-2xl px-5 font-bold tracking-widest"
                      maxLength={4}
                    />
                    <Captcha ref={captchaRef} />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-5 pt-10 pb-14 px-10 border-t bg-slate-50/50">
                <Button type="submit" className="w-full h-14 text-base font-black shadow-xl shadow-primary/20 rounded-2xl bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "发送重置链接"}
                </Button>
                
                <Link href="/login" className="flex items-center justify-center text-[11px] font-bold text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
                  <ArrowLeft className="size-3 mr-2" /> 回到登录
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
