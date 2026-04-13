import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { 
  Plus, 
  Users, 
  Wallet, 
  ArrowRight, 
  History,
  Calendar,
  CheckCircle2,
  PieChart,
  PenLine,
  BookOpen,
  MousePointer2,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck
} from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { formatToLunar } from "@/lib/utils"

async function getRecentEvents() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("gl_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3)

  return data || []
}

async function getYearlyStats() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: gifts } = await supabase
    .from("gl_gifts")
    .select("amount, created_at")
    .eq("user_id", user?.id)

  const currentYear = new Date().getFullYear()
  const years = [currentYear - 2, currentYear - 1, currentYear]
  
  const stats = years.map(year => {
    const yearGifts = gifts?.filter(g => new Date(g.created_at).getFullYear() === year) || []
    return {
      year: `${year}年`,
      amount: yearGifts.reduce((sum, g) => sum + Number(g.amount), 0),
      count: yearGifts.length
    }
  })

  return stats
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const recentEvents = await getRecentEvents()
  const yearlyStats = await getYearlyStats()

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 text-[#1d1b19]">
      
      {/* 模块 1：最近事件 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <History className="size-5 text-primary" /> 近期礼事
          </h2>
          <Button asChild variant="link" className="font-bold text-primary p-0 h-auto text-xs">
            <Link href="/events">管理全部 <ArrowRight className="ml-1 size-3" /></Link>
          </Button>
        </div>

        {recentEvents.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-slate-50/30">
            <Plus className="size-10 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold mb-1 text-slate-900">暂无礼事记录</h3>
            <Button asChild size="sm" className="rounded-xl px-6 h-10 bg-primary font-bold mt-4">
              <Link href="/events/new">开始新建礼事</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map((event) => (
              <div 
                key={event.id} 
                className={`group relative flex flex-col p-5 rounded-2xl border-2 transition-all hover:border-primary/30 bg-white ${
                  event.is_active ? "border-primary/20 shadow-sm shadow-primary/5" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`shrink-0 size-12 rounded-xl flex items-center justify-center ${event.is_active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Calendar className="size-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-base text-slate-900 truncate group-hover:text-primary transition-colors">{event.title}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-slate-500 font-bold">{event.event_start_date}</p>
                      {event.is_active && (
                        <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-md font-bold border border-red-100 animate-pulse">进行中</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                  <p className="text-[10px] text-slate-400 font-medium italic opacity-80">农历 {formatToLunar(event.event_start_date)}</p>
                  <Button asChild variant={event.is_active ? "default" : "secondary"} className="rounded-lg font-bold h-8 px-4 text-[10px]">
                    <Link href={event.is_active ? `/entry/${event.id}` : `/reports/${event.id}`}>
                      {event.is_active ? "去记账" : "查账目"}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 模块 2：年度汇总图表 */}
      <section className="space-y-4">
        <div className="px-2">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" /> 年度账目概览
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm h-full">
              <DashboardCharts data={yearlyStats} />
            </div>
          </div>
          <Card className="border-none shadow-sm rounded-2xl bg-slate-900 flex flex-col justify-center p-6 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <h4 className="text-[10px] font-black tracking-widest text-primary uppercase">Data Insights</h4>
              <p className="text-sm font-bold leading-relaxed text-slate-200">
                汇总了近三年的社交往来数据，帮助您清晰掌握人情流动。
              </p>
              <div className="pt-2 flex items-center gap-2 font-bold text-[10px] text-slate-500">
                <ShieldCheck className="size-3" /> 数据已加密
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* 模块 3：使用指引说明 */}
      <section className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 size-96 bg-primary/20 blur-[120px] rounded-full -mr-48 -mt-48" />
        
        <div className="relative z-10 space-y-12">
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-normal">
              数字化人情账本，<br/>让心意有迹可循。
            </h2>
            <p className="text-slate-300 font-normal leading-relaxed text-lg">
              三步即可开启智能记账，彻底告别繁琐的纸笔记录与手工对账。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 group">
              <div className="size-14 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 group-hover:rotate-6 transition-transform">
                <Plus className="size-7" />
              </div>
              <h4 className="text-lg font-bold">1. 建立礼事</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                创建新的喜事或白事，设置好时间与地点。新创建的事件将自动成为当前默认记账的礼事。
              </p>
            </div>

            <div className="space-y-4 group">
              <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <MousePointer2 className="size-7" />
              </div>
              <h4 className="text-lg font-bold">2. 开始记账</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                进入记账界面，使用向导式录入或语音播报，快速清晰记录每一笔礼金。系统会自动同步至账本。
              </p>
            </div>

            <div className="space-y-4 group">
              <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <FileSpreadsheet className="size-7" />
              </div>
              <h4 className="text-lg font-bold">3. 账目汇总</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                通过汇总中心查看整体数据，您可以一键导出对账单，作为永久保存的电子账簿。
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
