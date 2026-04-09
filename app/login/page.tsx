"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { LayoutDashboard, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Captcha, CaptchaHandle } from "@/components/auth/captcha"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  
  const captchaRef = useRef<CaptchaHandle>(null)
  const router = useRouter()

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError(null)

    // 验证码校验
    const actualCode = captchaRef.current?.getCode()
    if (!captchaInput || captchaInput.toUpperCase() !== actualCode) {
      setAuthError("验证码输入不正确")
      triggerShake()
      captchaRef.current?.refresh()
      setCaptchaInput("")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        setAuthError(error.message === 'Invalid login credentials' ? "邮箱或密码错误" : error.message)
        triggerShake()
        captchaRef.current?.refresh()
        return
      }
      if (data.session) {
        toast.success("登录成功")
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      setAuthError(error.message || "系统繁忙，请稍后再试")
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#f8f9fa] text-[#1d1b19]">
      <div className="w-full max-w-md">
        <AnimatePresence>
          {authError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <Alert variant="destructive" className="border-2 bg-white text-red-600 border-red-500 shadow-xl py-3 rounded-2xl">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="font-black text-sm ml-2">认证失败</AlertTitle>
                <AlertDescription className="font-bold text-xs ml-2 mt-0.5">{authError}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
          <Card className="shadow-2xl border-t-8 border-t-primary rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="space-y-1 text-center pb-6 pt-10 px-8">
              <div className="mx-auto size-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white mb-4 shadow-lg">
                <LayoutDashboard className="size-8" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-gray-900">礼簿管家登录</CardTitle>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sign In to Dashboard</p>
            </CardHeader>
            
            <form onSubmit={handleAuth} noValidate>
              <CardContent className="space-y-6 px-10 pb-10">
                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">识别码 / EMAIL</Label>
                  <Input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-primary rounded-2xl px-5 font-bold"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label className="font-black text-[10px] uppercase text-gray-400">访问密码 / PASSWORD</Label>
                    <Link href="/forgot-password" className="text-[10px] font-bold text-primary hover:underline">
                      忘记密码？
                    </Link>
                  </div>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-primary rounded-2xl px-5"
                  />
                </div>

                {/* 验证码区域 */}
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
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "立即进入系统"}
                </Button>
                
                <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  初次抵达？
                  <Link href="/signup" className="ml-3 text-primary hover:underline">免费开通账号</Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
