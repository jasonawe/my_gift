import { createServerSupabaseClient } from "@/lib/supabase/server"
import { GiftTable } from "@/components/reports/gift-table"
import { ReportAnalytics } from "@/components/reports/report-analytics"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wallet, Users, TrendingUp, PieChart as ChartIcon, Calendar } from "lucide-react"
import { getThemeByEventType } from "@/lib/utils"

async function getReportData(eventId: string) {
  const supabase = await createServerSupabaseClient()
  
  const { data: event } = await supabase
    .from("gl_events")
    .select("*")
    .eq("id", eventId)
    .single()

  const { data: gifts } = await supabase
    .from("gl_gifts")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })

  return { 
    event, 
    gifts: gifts || [] 
  }
}

export default async function ReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { event, gifts } = await getReportData(id)

  if (!event) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 text-slate-300">
        <ChartIcon className="size-8" />
      </div>
      <h2 className="text-xl font-bold">档案未找到</h2>
      <p className="text-muted-foreground">请确认事件 ID 是否正确。</p>
    </div>
  )

  const themeClass = getThemeByEventType(event.event_type)
  const isSolemn = themeClass === "theme-solemn"

  const totalAmount = gifts.reduce((sum, g) => sum + Number(g.amount), 0)
  const avgAmount = gifts.length > 0 ? (totalAmount / gifts.length).toFixed(0) : 0
  const maxGift = gifts.length > 0 ? Math.max(...gifts.map(g => Number(g.amount))) : 0

  return (
    <div className={`${themeClass} min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-10 text-[#1d1b19]`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. 顶部标题 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">数据报表中心</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-xl border-2 border-slate-50">
              <Calendar className="size-3.5 opacity-60 text-primary" />
              {event.title}
            </div>
            <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-xl border-2 border-slate-50">
              {event.event_start_date} ~ {event.event_end_date}
            </div>
          </div>
        </div>

        {/* 2. 核心概览卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "合计金额", value: `¥ ${totalAmount.toLocaleString()}`, icon: Wallet, color: isSolemn ? "text-slate-600" : "text-primary" },
            { label: "到客人数", value: `${gifts.length} 人`, icon: Users, color: "text-slate-400" },
            { label: "平均金额", value: `¥ ${avgAmount.toLocaleString()}`, icon: TrendingUp, color: "text-slate-400" },
            { label: "最高单笔", value: `¥ ${maxGift.toLocaleString()}`, icon: ChartIcon, color: "text-slate-400" }
          ].map((item, idx) => (
            <Card key={idx} className="shadow-sm border-2 rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-8 space-y-0">
                <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</CardTitle>
                <item.icon className={cn("size-4", item.color)} />
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <div className="text-3xl font-black tracking-tighter text-slate-900">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 3. 可视化分析图表 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 shrink-0">可视化分析</h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <ReportAnalytics gifts={gifts} />
        </section>

        {/* 4. 账目明细存档 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 shrink-0">账目明细存档</h3>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <GiftTable gifts={gifts as any} />
        </section>

      </div>
    </div>
  )
}

import { cn } from "@/lib/utils"
