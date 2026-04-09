"use client"

import { Suspense, useState, useEffect } from "react"
import { GiftForm } from "@/components/entry/gift-form"
import { GiftLedgerGrid } from "@/components/entry/gift-ledger-grid"
import { Badge } from "@/components/ui/badge"
import { BookOpen, PenLine, Calendar, MapPin, HelpCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getThemeByEventType } from "@/lib/utils"
import { useTour } from "@/lib/hooks/use-tour"
import { Button } from "@/components/ui/button"

export default function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [event, setEvent] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // 定义指引步骤
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
    },
    {
      element: ".search-tool-bar",
      title: "高效管理",
      description: "使用顶部的搜索框和翻页器，快速管理成百上千笔礼金记录。",
      side: "bottom"
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
        // 如果是新用户（本地存储没有标记），则自动开始指引
        if (!localStorage.getItem('tour_completed_entry_v1')) {
          setTimeout(startTour, 1000)
        }
      })
  }, [id])

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (!id) return null

  const themeClass = event ? getThemeByEventType(event.event_type) : "theme-festive"

  return (
    <div className={`${themeClass} min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8`}>
      <div className="max-w-[1600px] mx-auto space-y-8 py-4">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <aside className="w-full lg:w-[380px] lg:sticky lg:top-24 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <PenLine className="size-5" />
                  </div>
                  <h1 className="text-xl font-bold text-[#1d1b19]">心意录入</h1>
                </div>
                <Button variant="ghost" size="icon" onClick={startTour} title="重新开启操作引导">
                  <HelpCircle className="size-5 text-slate-300" />
                </Button>
              </div>
              
              {event && (
                <div className="bg-white/50 backdrop-blur-sm border rounded-2xl p-4 space-y-3">
                  <h2 className="font-bold text-slate-900 truncate">{event.title}</h2>
                  <div className="space-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
            
            <div className="p-4 rounded-xl border bg-muted/30 text-[10px] text-muted-foreground leading-relaxed">
              <p className="font-bold mb-1 uppercase tracking-wider text-primary/60">快速指南：</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>同一个礼事下，姓名不可重复录入。</li>
                <li>录入成功后，右侧仿真礼簿将实时刷新。</li>
                <li>点击右侧账本格子可快速进行纠错编辑。</li>
              </ul>
            </div>
          </aside>

          <main className="flex-1 w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1d1b19]">电子礼簿仿真系统</h2>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    Interactive Ledger · Real-time Sync
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5 font-bold rounded-lg text-[10px]">
                  实时存档模式已开启
                </Badge>
              </div>
            </div>

            <div className="relative ledger-grid-container">
              <Suspense fallback={
                <div className="h-[600px] w-full bg-muted animate-pulse rounded-3xl" />
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
