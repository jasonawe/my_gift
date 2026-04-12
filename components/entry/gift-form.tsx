"use client"

import { useState, useEffect } from "react"
import { createGift, GiftEntryData } from "@/lib/actions/gifts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { VoiceSelector } from "@/components/entry/voice-selector"
import { toast } from "sonner"
import { 
  User, 
  Banknote, 
  MessageSquare, 
  Plus,
  Loader2,
  CreditCard,
  Volume2
} from "lucide-react"
import { formatToLunar, amountToChinese } from "@/lib/utils"

interface GiftFormProps {
  eventId: string
  voiceEnable?: boolean
  voiceId?: string
  onSuccess?: () => void
}

export function GiftForm({ eventId, voiceEnable: initialVoiceEnable, voiceId: initialVoiceId, onSuccess }: GiftFormProps) {
  const [loading, setLoading] = useState(false)
  
  // 本地临时语音状态 (不保存到数据库)
  const [localVoiceEnable, setLocalVoiceEnable] = useState(false)
  const [localVoiceId, setLocalVoiceId] = useState("")

  const [formData, setFormData] = useState<Partial<GiftEntryData>>({
    donor_name: "",
    amount: undefined,
    gift_type: "现金",
    relationship: "",
    remark: "",
  })

  // 同步事件初始配置
  useEffect(() => {
    if (initialVoiceEnable !== undefined) setLocalVoiceEnable(Boolean(initialVoiceEnable))
    if (initialVoiceId) setLocalVoiceId(initialVoiceId)
  }, [initialVoiceEnable, initialVoiceId])

  // 语音播报逻辑
  const speak = (name: string, amount: number) => {
    if (!localVoiceEnable || typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported or disabled");
      return
    }

    // 停止当前正在进行的播报
    window.speechSynthesis.cancel()

    const text = `${name}，金额${amount}元。`
    const utterance = new SpeechSynthesisUtterance(text)
    
    // 设置基础参数
    utterance.lang = "zh-CN"
    utterance.rate = 1.0 // 语速
    utterance.pitch = 1.0 // 音调
    utterance.volume = 1.0 // 音量

    // 寻找匹配的音色
    const voices = window.speechSynthesis.getVoices()
    if (localVoiceId && voices.length > 0) {
      const selectedVoice = voices.find(v => v.name === localVoiceId)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    } else if (voices.length > 0) {
      // 自动寻找第一个中文语音作为兜底
      const zhVoice = voices.find(v => v.lang.includes("zh"))
      if (zhVoice) utterance.voice = zhVoice
    }
    
    console.log("LOG: Attempting to speak:", text)
    window.speechSynthesis.speak(utterance)
  }

  const resetForm = () => {
    setFormData({
      donor_name: "",
      amount: undefined,
      gift_type: "现金",
      relationship: "",
      remark: "",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.donor_name || !formData.amount) {
      toast.error("请填写姓名和金额")
      return
    }

    setLoading(true)
    
    const submissionData: GiftEntryData = {
      event_id: eventId,
      donor_name: formData.donor_name,
      amount: formData.amount,
      gift_type: formData.gift_type || "现金",
      relationship: formData.relationship || "",
      remark: formData.remark || "",
    }

    const result = await createGift(submissionData)
    setLoading(false)

    if (result.success) {
      toast.success(`成功录入: ${formData.donor_name} ¥${formData.amount}`)
      
      // 执行播报
      speak(formData.donor_name, formData.amount)
      
      resetForm()
      if (onSuccess) onSuccess()
    } else {
      const errorMessage = typeof result.error === 'string' ? result.error : "提交失败，请重试"
      toast.error(errorMessage)
    }
  }

  return (
    <Card className="border-2 shadow-lg w-full mx-auto lg:mx-0 overflow-hidden">
      <CardHeader className="pb-4 border-b bg-muted/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="size-4 text-primary" />
          新增礼金记录
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pb-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 录入字段 */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="donor_name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="size-3" /> 赠送者姓名
              </Label>
              <Input
                id="donor_name"
                placeholder="姓名或称呼"
                className="h-10 bg-muted/20 focus:bg-background"
                value={formData.donor_name}
                onChange={e => setFormData(prev => ({ ...prev, donor_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="amount" className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Banknote className="size-3" /> 礼金金额 (¥)
              </Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  placeholder="0.00"
                  className="h-12 font-bold text-xl bg-muted/20 pl-8 pr-4 rounded-xl border-2 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                  value={formData.amount || ""}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData(prev => ({ ...prev, amount: val === "" ? undefined : Number(val) }));
                  }}
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">¥</span>
              </div>
              
              {/* 大写预览 */}
              {formData.amount !== undefined && formData.amount > 0 && (
                <div className="px-3 py-1.5 bg-primary/5 border border-primary/10 rounded-lg animate-in fade-in slide-in-from-top-1">
                  <p className="text-[10px] text-primary font-bold">
                    大写：{amountToChinese(formData.amount)}
                  </p>
                </div>
              )}

              {/* 快捷金额 */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[200, 500, 600, 800, 1000, 2000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, amount: amt }))}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold border bg-white hover:border-primary/50 hover:text-primary transition-all shadow-sm active:scale-95"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CreditCard className="size-3" /> 支付方式
              </Label>
              <Select value={formData.gift_type} onValueChange={v => setFormData(prev => ({ ...prev, gift_type: v }))}>
                <SelectTrigger className="h-10 bg-muted/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="现金">现金</SelectItem>
                  <SelectItem value="微信转账">微信转账</SelectItem>
                  <SelectItem value="支付宝">支付宝</SelectItem>
                  <SelectItem value="实物礼品">实物礼品</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                <span>关系标签</span>
                {formData.relationship && (
                  <button 
                    type="button" 
                    onClick={() => setFormData(prev => ({ ...prev, relationship: "" }))}
                    className="text-[10px] text-primary hover:underline"
                  >
                    清除
                  </button>
                )}
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "长辈", color: "bg-red-50 text-red-700 border-red-100" },
                  { label: "平辈", color: "bg-orange-50 text-orange-700 border-orange-100" },
                  { label: "晚辈", color: "bg-amber-50 text-amber-700 border-amber-100" },
                  { label: "挚友", color: "bg-blue-50 text-blue-700 border-blue-100" },
                  { label: "同事", color: "bg-slate-50 text-slate-700 border-slate-100" },
                  { label: "同学", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
                  { label: "同乡", color: "bg-teal-50 text-teal-700 border-teal-100" },
                  { label: "其他", color: "bg-gray-50 text-gray-700 border-gray-100" }
                ].map(tag => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, relationship: tag.label }))}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all ${
                      formData.relationship === tag.label 
                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                        : `${tag.color} hover:shadow-sm`
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
              <Input
                placeholder="或手动输入具体关系（如：舅舅、二叔）"
                className="h-9 text-xs bg-muted/10 border-dashed focus:border-solid"
                value={formData.relationship && !["长辈", "平辈", "晚辈", "挚友", "同事", "同学", "同乡", "其他"].includes(formData.relationship) ? formData.relationship : ""}
                onChange={e => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remark" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare className="size-3" /> 备注说明
              </Label>
              <Input
                id="remark"
                placeholder="可选信息..."
                className="h-10 text-sm bg-muted/20"
                value={formData.remark}
                onChange={e => setFormData(prev => ({ ...prev, remark: e.target.value }))}
              />
            </div>
          </div>

          {/* 实时语音控制 (仅限本次会话) */}
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className={`size-4 ${localVoiceEnable ? 'text-primary' : 'text-slate-400'}`} />
                <Label className="text-xs font-bold text-slate-600">实时语音播报</Label>
              </div>
              <Switch 
                checked={localVoiceEnable} 
                onCheckedChange={setLocalVoiceEnable}
                className="scale-75"
              />
            </div>
            {Boolean(localVoiceEnable) && (
              <div className="animate-in fade-in slide-in-from-top-1">
                <VoiceSelector value={localVoiceId} onChange={setLocalVoiceId} />
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 font-bold shadow-lg shadow-primary/20 bg-primary rounded-xl"
              disabled={loading}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "确认录入"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
