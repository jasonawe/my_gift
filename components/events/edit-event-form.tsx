"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateEvent } from "@/lib/actions/events"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { VoiceSelector } from "@/components/entry/voice-selector"
import { MapPicker } from "@/components/entry/map-picker"
import { ThemeSelector } from "@/components/events/theme-selector"
import { toast } from "sonner"
import { CalendarIcon, Tag, ArrowRight, Volume2, Loader2, MapPin, Search, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { formatToLunar } from "@/lib/utils"

interface EditEventFormProps {
  event: any
}

export function EditEventForm({ event }: EditEventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [voiceEnable, setVoiceEnable] = useState(event.voice_enable || false)
  const [voiceId, setVoiceId] = useState(event.voice_id || "")
  const [themeColor, setThemeColor] = useState(event.theme_color || "auto")

  const [formData, setFormData] = useState({
    title: event.title || "",
    event_type: event.event_type || "",
    event_start_date: event.event_start_date || "",
    event_end_date: event.event_end_date || "",
    location: event.location || "",
    latitude: event.latitude?.toString() || "",
    longitude: event.longitude?.toString() || ""
  })

  const updateField = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleMapConfirm = (result: { address: string, lat: number, lng: number }) => {
    setFormData(prev => ({
      ...prev,
      location: result.address,
      latitude: result.lat.toString(),
      longitude: result.lng.toString()
    }))
    setMapOpen(false)
    toast.success("地点坐标已精确锁定")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const data = new FormData()
    data.set("title", formData.title)
    data.set("event_type", formData.event_type)
    data.set("event_start_date", formData.event_start_date)
    data.set("event_end_date", formData.event_end_date)
    data.set("location", formData.location)
    data.set("latitude", formData.latitude)
    data.set("longitude", formData.longitude)
    data.set("voice_enable", voiceEnable ? "on" : "off")
    data.set("voice_id", voiceId)
    data.set("theme_color", themeColor)
    
    const result = await updateEvent(event.id, data)
    setLoading(false)

    if (result.success) {
      toast.success("事件更新成功！")
      router.push("/events")
      router.refresh()
    } else {
      const msg = typeof result.error === 'string' ? result.error : "更新失败，请检查输入"
      toast.error(msg)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 text-[#1d1b19]">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary transition-colors mb-6 ml-2">
        <ArrowLeft className="size-4" /> 返回礼事档案
      </Link>
      
      <Card className="border-2 shadow-lg overflow-hidden rounded-[2.5rem]">
        <CardHeader className="space-y-1 pb-8 pt-12 px-10 text-center border-b bg-slate-50/50">
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">修改礼事档案</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-12 pt-10 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-gray-500 ml-2">礼事名称</Label>
                <div className="relative">
                  <Tag className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                  <Input 
                    value={formData.title}
                    onChange={e => updateField("title", e.target.value)}
                    placeholder="例如：王小明 & 李小红 婚礼" 
                    className="pl-12 h-14 bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-8 focus:ring-primary/5 rounded-2xl text-lg font-bold"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-gray-500 ml-2">礼事类型</Label>
                <Select value={formData.event_type} onValueChange={v => updateField("event_type", v)} required>
                  <SelectTrigger className="h-14 bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-8 focus:ring-primary/5 rounded-2xl text-base font-bold">
                    <SelectValue placeholder="请选择记录类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="婚礼">喜事：婚礼/订婚</SelectItem>
                    <SelectItem value="满月">喜事：满月/百日/周岁</SelectItem>
                    <SelectItem value="寿宴">喜事：寿宴/生日</SelectItem>
                    <SelectItem value="乔迁">喜事：乔迁/开业</SelectItem>
                    <SelectItem value="白事">白事：追思/吊唁</SelectItem>
                    <SelectItem value="其他">其他礼事</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-gray-500 ml-2">开始日期</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-4.5 h-4 w-4 text-slate-300" />
                  <Input 
                    type="date" 
                    value={formData.event_start_date}
                    onChange={e => updateField("event_start_date", e.target.value)}
                    className="pl-10 h-14 bg-slate-50 border-2 border-slate-100 focus:border-primary rounded-2xl font-bold"
                    required 
                  />
                </div>
                {formData.event_start_date && (
                  <p className="text-[10px] text-primary font-bold ml-2">
                    农历：{formatToLunar(formData.event_start_date)}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-[10px] text-gray-500 ml-2">结束日期</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-4.5 h-4 w-4 text-slate-300" />
                  <Input 
                    type="date" 
                    value={formData.event_end_date}
                    onChange={e => updateField("event_end_date", e.target.value)}
                    className="pl-10 h-14 bg-slate-50 border-2 border-slate-100 focus:border-primary rounded-2xl font-bold"
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="font-bold text-[10px] text-gray-500 ml-2">举办地点</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
                  <Input 
                    value={formData.location}
                    onChange={e => updateField("location", e.target.value)}
                    placeholder="请输入或点击右侧地图选择" 
                    className="pl-12 h-14 bg-slate-50 border-2 border-slate-100 focus:border-primary rounded-2xl font-bold"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={() => setMapOpen(true)}
                  className="h-14 px-5 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                >
                  <Search className="size-5 mr-2" /> 地图选点
                </Button>
              </div>
            </div>

            {/* 视觉风格选择 */}
            <div className="p-6 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <ThemeSelector value={themeColor} onChange={setThemeColor} />
            </div>

            <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold flex items-center gap-2 text-slate-700">
                    <Volume2 className="size-4 text-primary" /> 自动语音播报服务
                  </Label>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">提供清晰的语音播报与金额核对</p>
                </div>
                <Switch 
                  checked={voiceEnable} 
                  onCheckedChange={setVoiceEnable}
                />
              </div>
              
              {voiceEnable && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <VoiceSelector value={voiceId} onChange={setVoiceId} />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-10 pb-16 border-t bg-slate-50/50 px-12">
            <Button 
              type="submit" 
              className="w-full text-xl h-16 bg-primary hover:bg-primary/90 shadow-[0_20px_40px_-10px_rgba(242,13,13,0.3)] rounded-[1.5rem] font-bold transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : "保存并更新档案"}
              {!loading && <ArrowRight className="ml-3 size-6" />}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <MapPicker 
        open={mapOpen} 
        onOpenChange={setMapOpen} 
        onConfirm={handleMapConfirm} 
      />
    </div>
  )
}
