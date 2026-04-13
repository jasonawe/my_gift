"use client"

import { useState, useEffect } from "react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Volume2 } from "lucide-react"

interface VoiceSelectorProps {
  value?: string
  onChange: (value: string) => void
}

export function VoiceSelector({ value, onChange }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const loadVoices = () => {
      // 过滤中文语音
      const allVoices = window.speechSynthesis.getVoices()
      const zhVoices = allVoices.filter(v => v.lang.includes("zh"))
      setVoices(zhVoices)
      
      // 如果没有默认值且有可用语音，选第一个
      if (!value && zhVoices.length > 0) {
        onChange(zhVoices[0].name)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [value, onChange])

  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 rounded-lg bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:ring-0 focus:border-primary/20 text-[10px] font-bold px-2.5">
          <SelectValue placeholder="选择音色..." />
        </SelectTrigger>
        <SelectContent className="rounded-xl border-2">
          {voices.length === 0 && (
            <SelectItem value="default" disabled className="text-[10px]">未发现中文语音</SelectItem>
          )}
          {voices.map((voice) => (
            <SelectItem key={voice.name} value={voice.name} className="text-[10px] font-bold py-2.5">
              {voice.name.split(' ')[0]} {/* 简化显示名称 */}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
