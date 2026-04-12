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

        {/* 2. 核心概览卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "合计礼金", value: `¥ ${totalAmount.toLocaleString()}`, icon: Wallet, color: "text-primary" },
            { label: "礼单总数", value: `${gifts.length} 笔`, icon: Users, color: "text-muted-foreground" },
            { label: "平均金额", value: `¥ ${avgAmount.toLocaleString()}`, icon: TrendingUp, color: "text-muted-foreground" },
            { label: "最高单笔", value: `¥ ${maxGift.toLocaleString()}`, icon: ChartIcon, color: "text-muted-foreground" }
          ].map((item, idx) => (
            <Card key={idx} className="shadow-sm border-2 border-border/50 rounded-[2rem] overflow-hidden bg-card/80 backdrop-blur-sm card-paper">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-8 space-y-0">
                <CardTitle className="text-xs font-bold text-muted-foreground">{item.label}</CardTitle>
                <item.icon className={cn("size-4", item.color)} />
              </CardHeader>
              <CardContent className="pb-10 px-8">
                <div className="text-3xl font-bold tracking-tight text-foreground">{item.value}</div>
              </CardContent>
            </Card>
          ))}
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
