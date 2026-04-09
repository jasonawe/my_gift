"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent } from "@/lib/actions/events"
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
import { toast } from "sonner"
import { CalendarIcon, Tag, ArrowRight, Volume2, Loader2, MapPin, Search } from "lucide-react"

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [voiceEnable, setVoiceEnable] = useState(false)
  const [voiceId, setVoiceId] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    event_type: "",
    event_start_date: "",
    event_end_date: "",
    location: "",
    latitude: "",
    longitude: ""
  })

  const updateField = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 地图确认回调
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
    
    const result = await createEvent(data)
    setLoading(false)

    if (result.success) {
      toast.success("事件创建成功！")
      router.push("/dashboard")
    } else {
      const msg = typeof result.error === 'string' ? result.error : "提交失败，请检查输入"
      toast.error(msg)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 text-[#1d1b19]">
      <Card className="border-2 shadow-lg overflow-hidden rounded-[2.5rem]">
        <CardHeader className="space-y-1 pb-8 pt-12 px-10 text-center">
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900">建立新礼事档案</CardTitle>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Initialize New Event</p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 px-12 pb-6">
            <div className="space-y-3">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-2">事件名称 / EVENT TITLE</Label>
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
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-2">事件类型 / TYPE</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-2">开始日期 / START</Label>
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
              </div>

              <div className="space-y-3">
                <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-2">结束日期 / END</Label>
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

            {/* 举办地点 - 增加地图按钮 */}
            <div className="space-y-3">
              <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-2">举办地点 / LOCATION</Label>
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

            {/* 语音播报配置 */}
            <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-black flex items-center gap-2 text-slate-700">
                    <Volume2 className="size-4 text-primary" /> 自动语音播报服务
                  </Label>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">Automated Voice Service</p>
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
              className="w-full text-xl h-16 bg-primary hover:bg-primary/90 shadow-[0_20px_40px_-10px_rgba(242,13,13,0.3)] rounded-[1.5rem] font-black transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : "立即创建并开启礼簿"}
              {!loading && <ArrowRight className="ml-3 size-6" />}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 地图拾取弹窗 */}
      <MapPicker 
        open={mapOpen} 
        onOpenChange={setMapOpen} 
        onConfirm={handleMapConfirm} 
      />
    </div>
  )
}
