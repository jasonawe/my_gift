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
    <div className="space-y-2">
      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
        <Volume2 className="size-3" /> 播报音色选择
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-gray-200">
          <SelectValue placeholder="加载语音引擎中..." />
        </SelectTrigger>
        <SelectContent>
          {voices.length === 0 && (
            <SelectItem value="default" disabled>系统未发现中文语音</SelectItem>
          )}
          {voices.map((voice) => (
            <SelectItem key={voice.name} value={voice.name}>
              {voice.name} ({voice.lang})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
