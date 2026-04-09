"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, ShieldCheck } from "lucide-react"

export interface CaptchaHandle {
  getCode: () => string
  refresh: () => void
}

export const Captcha = forwardRef<CaptchaHandle, { onValidate?: (isValid: boolean) => void }>((props, ref) => {
  const [code, setCode] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // 去掉易混淆的 0, O, I, 1
    let result = ""
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const draw = (newCode: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 背景
    ctx.fillStyle = "#f8fafc"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 噪点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.2)`
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
      ctx.fill()
    }

    // 干扰线
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.3)`
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // 绘制文字
    ctx.font = "bold 24px 'Courier New'"
    ctx.textBaseline = "middle"
    for (let i = 0; i < newCode.length; i++) {
      ctx.save()
      ctx.translate(20 + i * 20, canvas.height / 2)
      ctx.rotate((Math.random() * 30 - 15) * Math.PI / 180)
      ctx.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100})`
      ctx.fillText(newCode[i], -10, 0)
      ctx.restore()
    }
  }

  const refresh = () => {
    const newCode = generateCode()
    setCode(newCode)
    draw(newCode)
  }

  useImperativeHandle(ref, () => ({
    getCode: () => code,
    refresh
  }))

  useEffect(() => {
    refresh()
  }, [])

  return (
    <div className="flex items-center gap-3">
      <canvas 
        ref={canvasRef} 
        width={100} 
        height={48} 
        onClick={refresh}
        className="rounded-xl border-2 border-slate-100 cursor-pointer hover:border-primary/30 transition-all bg-white"
        title="点击刷新验证码"
      />
      <div className="flex flex-col">
        <button 
          type="button" 
          onClick={refresh}
          className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1"
        >
          <RefreshCw className="size-2.5" /> 换一张
        </button>
      </div>
    </div>
  )
})

Captcha.displayName = "Captcha"
