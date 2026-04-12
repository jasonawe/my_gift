"use client"

import { Suspense, useState, useEffect } from "react"
import { GiftForm } from "@/components/entry/gift-form"
import { GiftLedgerGrid } from "@/components/entry/gift-ledger-grid"
import { Badge } from "@/components/ui/badge"
import { BookOpen, PenLine, Calendar, MapPin, HelpCircle, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getThemeByEventType } from "@/lib/utils"
import { useTour } from "@/lib/hooks/use-tour"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // 定义指引步骤 - 中文化
  const { startTour } = useTour("entry_v1", [
    {
      element: ".gift-form-card",
      title: "第一步：信息录入",
      description: "在这里填写赠送者的姓名和金额。别忘了选择支付方式！",
      side: "right"
    },
    {
      element: ".voice-control-area",
      title: "语音播报控制",
      description: "您可以在这里实时开关语音播报，或者更换喜欢的发音人。",
      side: "bottom"
    },
    {
      element: ".ledger-grid-container",
      title: "第二步：仿真账本",
      description: "录入成功后，数据会实时出现在右侧的格纸账本中。",
      side: "left"
    },
    {
      element: ".ledger-cell-clickable",
      title: "点击纠错",
      description: "发现录错了？直接点击账本上的姓名或金额格，即可进行修改或删除。",
      side: "top"
    }
  ])

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [params])

  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    supabase
      .from("gl_events")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setEvent(data)
        if (!localStorage.getItem('tour_completed_entry_v1')) {
          setTimeout(startTour, 1000)
        }
      })
  }, [id, startTour])

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!id) return null

  const themeClass = event ? getThemeByEventType(event.event_type, event.theme_color) : "theme-festive"

  return (
    <div className={`${themeClass} min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-background transition-colors duration-700`}>
      <div className="max-w-[1600px] mx-auto space-y-8 py-4">
        
        {/* 顶部导航 */}
        <div className="flex items-center justify-between px-2">
          <Link href="/events" className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> 返回礼事档案库
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5 font-bold rounded-lg text-[10px]">
              实时云端同步已开启
            </Badge>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <aside className="w-full lg:w-[380px] lg:sticky lg:top-24 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <PenLine className="size-5" />
                  </div>
                  <h1 className="text-xl font-bold text-foreground">礼金录入</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={startTour} title="重新开启操作引导">
                  <HelpCircle className="size-5 text-muted-foreground/40 hover:text-primary" />
                </Button>
              </div>
              
              {event && (
                <div className="bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-3xl p-5 space-y-3 shadow-sm card-paper">
                  <h2 className="font-bold text-lg text-foreground truncate">{event.title}</h2>
                  <div className="space-y-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-primary/60" />
                      <span>{event.event_start_date} 至 {event.event_end_date}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-primary/60" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="gift-form-card">
              <GiftForm 
                eventId={id} 
                voiceEnable={event?.voice_enable} 
                voiceId={event?.voice_id} 
                onSuccess={handleSuccess}
              />
            </div>
            
            <div className="p-5 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 text-[11px] text-muted-foreground leading-relaxed">
              <p className="font-bold mb-2 text-primary/80">记账说明：</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>支持同名校验，防止重复录入。</li>
                <li>确认录入后，右侧仿真账本将实时更新。</li>
                <li>点击账本内容可直接进行修改或删除。</li>
              </ul>
            </div>
          </aside>

          <main className="flex-1 w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <BookOpen className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">电子礼簿预览</h2>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    仿真纸质账本布局 · 实时同步预览
                  </p>
                </div>
              </div>
            </div>

            {/* 增加留白高度 */}
            <div className="pt-6 relative ledger-grid-container bg-background/40 backdrop-blur-md rounded-[2.5rem] border-2 border-border/40 p-1 shadow-inner overflow-hidden">
              <Suspense fallback={
                <div className="h-[600px] w-full bg-muted/50 animate-pulse rounded-[2.5rem]" />
              }>
                <GiftLedgerGrid key={refreshKey} eventId={id} theme={themeClass as any} />
              </Suspense>
            </div>
          </main>

        </div>
      </div>
    </div>
  )
}
