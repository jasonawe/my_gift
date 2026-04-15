import { createServerSupabaseClient } from "@/lib/supabase/server"
import { GiftTable } from "@/components/reports/gift-table"
import { ReportAnalytics } from "@/components/reports/report-analytics"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Wallet, Users, TrendingUp, PieChart as ChartIcon, Calendar, ArrowLeft } from "lucide-react"
import { getThemeByEventType, cn } from "@/lib/utils"
import Link from "next/link"

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
      <h2 className="text-xl font-bold">礼事档案未找到</h2>
      <p className="text-muted-foreground">请确认该礼事是否已被删除。</p>
    </div>
  )

  const themeClass = getThemeByEventType(event.event_type, (event as any).theme_color)
  
  const totalAmount = gifts.reduce((sum, g) => sum + Number(g.amount), 0)
  const avgAmount = gifts.length > 0 ? (totalAmount / gifts.length).toFixed(0) : 0
  const maxGift = gifts.length > 0 ? Math.max(...gifts.map(g => Number(g.amount))) : 0

  return (
    <div className={`${themeClass} min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-10 bg-background transition-colors duration-700`}>
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* 1. 顶部标题 */}
        <div className="space-y-4">
          <Link href="/events" className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> 返回礼事档案库
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter text-foreground">账目汇总中心</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1.5 rounded-xl border border-border/50">
                <Calendar className="size-3.5 text-primary/60" />
                {event.title}
              </div>
              <div className="flex items-center gap-1.5 bg-card/50 px-3 py-1.5 rounded-xl border border-border/50">
                {event.event_start_date} ~ {event.event_end_date}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 核心合计总览 */}
        <div className="bg-card/80 backdrop-blur-md border-2 border-border/50 rounded-[2.5rem] p-8 lg:p-12 shadow-xl card-paper relative overflow-hidden">
          <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-20">
            {/* 主核心数据 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                <Wallet className="size-4" /> 合计礼金总额
              </div>
              <div className="text-6xl font-black tracking-tighter text-foreground tabular-nums flex items-baseline gap-2">
                <small className="text-2xl opacity-30 italic font-medium">¥</small>
                {totalAmount.toLocaleString()}
              </div>
            </div>

            {/* 次要数据网格 */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 py-2 lg:border-l lg:border-border/50 lg:pl-16">
              <div className="flex items-center justify-between lg:justify-start lg:gap-6 border-b border-border/30 pb-3 lg:border-none lg:pb-0">
                <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-wider shrink-0">
                  <Users className="size-3 text-primary/40" /> 礼单总数
                </div>
                <div className="text-2xl font-black text-foreground tabular-nums">
                  {gifts.length} <small className="text-xs font-bold opacity-40 ml-0.5">笔</small>
                </div>
              </div>
              
              <div className="flex items-center justify-between lg:justify-start lg:gap-6 border-b border-border/30 pb-3 lg:border-none lg:pb-0">
                <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-wider shrink-0">
                  <TrendingUp className="size-3 text-primary/40" /> 平均金额
                </div>
                <div className="text-2xl font-black text-foreground tabular-nums">
                  <small className="text-xs font-bold opacity-40 mr-0.5">¥</small>
                  {Number(avgAmount).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-start lg:gap-6">
                <div className="flex items-center gap-2 text-muted-foreground font-black text-[10px] uppercase tracking-wider shrink-0">
                  <ChartIcon className="size-3 text-primary/40" /> 最高单笔
                </div>
                <div className="text-2xl font-black text-primary tabular-nums">
                  <small className="text-xs font-bold opacity-40 mr-0.5">¥</small>
                  {maxGift.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 可视化分析图表 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground shrink-0">汇总分析</h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-border/50 p-6">
            <ReportAnalytics gifts={gifts} />
          </div>
        </section>

        {/* 4. 账目明细存档 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground shrink-0">账目明细</h3>
            <div className="h-px flex-1 bg-border/50" />
          </div>
          <div className="bg-card/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-border/50 p-2">
            <GiftTable gifts={gifts as any} />
          </div>
        </section>

      </div>
    </div>
  )
}
