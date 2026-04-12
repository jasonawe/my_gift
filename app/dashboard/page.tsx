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
    <div className="max-w-7xl mx-auto space-y-16 pb-20 text-[#1d1b19]">
      
      {/* 模块 1：最近事件 */}
      <section className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              <History className="size-7 text-primary" /> 近期礼事
            </h2>
          </div>
          <Button asChild variant="ghost" className="font-bold text-primary hover:bg-primary/5 rounded-xl transition-all">
            <Link href="/events">查看全部礼事 <ArrowRight className="ml-1 size-4" /></Link>
          </Button>
        </div>

        {recentEvents.length === 0 ? (
          <Card className="border-4 border-dashed border-slate-100 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center bg-slate-50/30">
            <Plus className="size-16 text-slate-200 mb-6" />
            <h3 className="text-xl font-bold mb-2 text-slate-900">暂无礼事记录</h3>
            <p className="text-slate-400 max-w-xs mb-8">开启智能记账，告别纸质账本，让心意有迹可循。</p>
            <Button asChild size="lg" className="rounded-2xl px-10 h-14 bg-primary shadow-xl shadow-primary/20 font-bold">
              <Link href="/events/new">开始新建礼事</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentEvents.map((event) => (
              <div 
                key={event.id} 
                className={`group relative flex flex-col p-8 rounded-[3rem] border-4 transition-all hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] bg-white ${
                  event.is_active ? "border-primary/20 ring-[12px] ring-primary/[0.03]" : "border-slate-50 hover:border-slate-200"
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-[1.5rem] shadow-sm ${event.is_active ? 'bg-primary text-white shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                    <Calendar className="size-7" />
                  </div>
                  {event.is_active && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-bold text-[11px] shadow-sm">
                      <CheckCircle2 className="size-3" /> 进行中
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2 mb-10">
                  <h4 className="font-bold text-xl text-slate-900 leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-slate-500 font-medium">{event.event_start_date} ~ {event.event_end_date}</p>
                    <p className="text-[10px] text-slate-400 font-medium italic">农历 {formatToLunar(event.event_start_date)}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-50">
                  {event.is_active ? (
                    <Button asChild className="w-full rounded-2xl font-bold h-12 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                      <Link href={`/entry/${event.id}`}>
                        <PenLine className="mr-2 size-4" /> 记录礼金
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="secondary" className="w-full rounded-2xl font-bold h-12 bg-slate-50 text-slate-600 hover:bg-slate-100">
                      <Link href={`/reports/${event.id}`}>
                        <PieChart className="mr-2 size-4 opacity-70" /> 查看账目汇总
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 模块 2：年度汇总图表 */}
      <section className="space-y-8">
        <div className="space-y-1 px-2">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="size-7 text-primary" /> 年度账目概览
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DashboardCharts data={yearlyStats} />
          </div>
          <Card className="border-none shadow-sm rounded-[2rem] bg-primary flex flex-col justify-center p-10 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-40 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h4 className="text-sm font-bold tracking-wider opacity-80">数据洞察</h4>
              <p className="text-xl font-bold leading-relaxed">
                您近三年的礼金总账已自动汇总，帮助您清晰掌握历年社交往来。
              </p>
              <div className="pt-4 flex items-center gap-2 font-medium text-xs opacity-90">
                <ShieldCheck className="size-4" /> 数据安全加密保护中
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
