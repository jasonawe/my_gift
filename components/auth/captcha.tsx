"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { RefreshCw } from "lucide-react"

export interface CaptchaHandle {
  getCode: () => string
  refresh: () => void
}

export const Captcha = forwardRef<CaptchaHandle, { onValidate?: (isValid: boolean) => void }>((props, ref) => {
  const [code, setCode] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
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

    // 1. 背景
    ctx.fillStyle = "#f8fafc" // slate-50
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 2. 噪点
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.2)`
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI)
      ctx.fill()
    }

    // 3. 绘制文字
    ctx.font = "bold 24px monospace"
    ctx.textBaseline = "middle"
    for (let i = 0; i < newCode.length; i++) {
      ctx.save()
      const x = 20 + i * 20
      const y = canvas.height / 2
      ctx.translate(x, y)
      ctx.rotate((Math.random() * 30 - 15) * Math.PI / 180)
      ctx.fillStyle = `rgb(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100})`
      ctx.fillText(newCode[i], -10, 0)
      ctx.restore()
    }

    // 4. 干扰线
    for (let i = 0; i < 2; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.3)`
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }
  }

  const refresh = () => {
    const newCode = generateCode()
    setCode(newCode)
    // 延迟绘制确保状态生效
    setTimeout(() => draw(newCode), 0)
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
      <div className="relative group overflow-hidden rounded-xl border-2 border-slate-100 dark:border-slate-800">
        <canvas 
          ref={canvasRef} 
          width={100} 
          height={48} 
          onClick={refresh}
          className="cursor-pointer bg-slate-50 dark:bg-slate-900 block"
          title="点击刷新验证码"
        />
        <div className="absolute inset-0 pointer-events-none group-hover:bg-primary/5 transition-colors" />
      </div>
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
