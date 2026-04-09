"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { LayoutDashboard, Loader2, Check, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Captcha, CaptchaHandle } from "@/components/auth/captcha"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [captchaInput, setCaptchaInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  
  const captchaRef = useRef<CaptchaHandle>(null)
  const router = useRouter()

  const passwordRequirements = {
    length: password.length >= 8,
    complexity: /^(?=.*[a-zA-Z])(?=.*[0-9!@#$%^&*])/.test(password)
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSignUp = async (e: React.FormEvent) => {
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

    if (!passwordRequirements.length || !passwordRequirements.complexity) {
      setAuthError("密码强度不足：需8位以上且含字母+数字/符号")
      triggerShake()
      return
    }
    if (password !== confirmPassword) {
      setAuthError("两次输入的密码不一致")
      triggerShake()
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) throw error

      if (data.user && !data.session) {
        toast.success("注册请求已提交，请检查邮箱确认链接。")
      } else if (data.session) {
        toast.success("账号创建成功")
        window.location.href = "/dashboard"
      }
    } catch (error: any) {
      setAuthError(error.message.includes("already registered") ? "该邮箱已被注册，请尝试直接登录" : error.message)
      triggerShake()
      captchaRef.current?.refresh()
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
                <AlertTitle className="font-black text-sm ml-2">注册拦截</AlertTitle>
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
              <CardTitle className="text-2xl font-black tracking-tight text-gray-900">开启新礼簿</CardTitle>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Create New Account</p>
            </CardHeader>
            
            <form onSubmit={handleSignUp} noValidate>
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
                  <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">安全密钥 / PASSWORD</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 focus:border-primary rounded-2xl px-5"
                  />
                  <div className="pt-1 space-y-1 px-1">
                    <div className={`flex items-center text-[10px] font-bold ${passwordRequirements.length ? 'text-green-600' : 'text-gray-300'}`}>
                      <Check className="size-3 mr-2" /> 至少 8 位
                    </div>
                    <div className={`flex items-center text-[10px] font-bold ${passwordRequirements.complexity ? 'text-green-600' : 'text-gray-300'}`}>
                      <Check className="size-3 mr-2" /> 含字母+数字/符号
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-black text-[10px] uppercase text-gray-400 ml-1">重复密钥 / CONFIRM</Label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`h-12 bg-gray-50 border-2 transition-all rounded-2xl px-5 ${confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
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
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "立即注册并开启"}
                </Button>
                
                <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  已有通行证？
                  <Link href="/login" className="ml-3 text-primary hover:underline">立即登录</Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
