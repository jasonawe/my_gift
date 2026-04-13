import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { 
  Calendar,
  CheckCircle2,
  PieChart,
  PenLine,
  Plus,
  ArrowLeft,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { formatToLunar, getThemeByEventType } from "@/lib/utils"

const PAGE_SIZE = 12

async function getAllEvents(page: number = 1) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { events: [], count: 0 }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count } = await supabase
    .from("gl_events")
    .select(`
      *,
      gl_gifts(amount)
    `, { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to)

  if (!data) return { events: [], count: 0 }

  const events = data.map(event => {
    const totalAmount = (event.gl_gifts as any[] || []).reduce((sum, gift) => sum + Number(gift.amount), 0)
    return { ...event, totalAmount }
  })

  return { events, count: count || 0 }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { events: allEvents, count } = await getAllEvents(currentPage)
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <Link href="/dashboard" className="text-xs font-bold text-primary flex items-center gap-1 mb-2 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="size-3" /> 返回仪表盘
          </Link>
          <h1 className="text-4xl font-bold tracking-tighter text-slate-900">礼事档案库</h1>
        </div>
        <Button asChild size="lg" className="rounded-2xl h-14 px-8 bg-primary shadow-xl shadow-primary/20 font-bold">
          <Link href="/events/new">
            <Plus className="mr-2 size-5" /> 新建礼事
          </Link>
        </Button>
      </div>

      {allEvents.length === 0 ? (
        <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed">
          <p className="text-slate-400 font-bold">暂无任何礼事记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allEvents.map((event: any) => {
            const themeClass = getThemeByEventType(event.event_type, (event as any).theme_color);
            return (
              <div 
                key={event.id} 
                className={`${themeClass} group relative flex flex-col p-5 rounded-2xl border-2 transition-all hover:border-primary/30 bg-background border-border ${
                  event.is_active ? "shadow-sm shadow-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${event.is_active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                        {event.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{event.event_start_date}</p>
                    </div>
                  </div>
                  {event.is_active && (
                    <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-100">进行中</span>
                  )}
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-xl mb-4">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">累计礼金</p>
                    <p className="text-xl font-black text-foreground tabular-nums leading-none">
                      <small className="text-xs mr-0.5 opacity-40">¥</small>
                      {event.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">日期</p>
                    <p className="text-[10px] text-muted-foreground font-bold italic">
                      农历 {formatToLunar(event.event_start_date)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-auto">
                  <Button asChild variant="ghost" className="rounded-lg font-bold text-[10px] h-8 px-0 hover:bg-primary/5 text-muted-foreground hover:text-primary">
                    <Link href={`/reports/${event.id}`}>账目</Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-lg font-bold text-[10px] h-8 px-0 hover:bg-primary/5 text-muted-foreground hover:text-primary">
                    <Link href={`/events/${event.id}/edit`}>修改</Link>
                  </Button>
                  <Button asChild className="rounded-lg font-bold text-[10px] h-8 px-0 shadow-sm bg-primary text-primary-foreground hover:opacity-90">
                    <Link href={`/entry/${event.id}`}>记账</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-10">
          <Button
            asChild
            variant="outline"
            className={`rounded-xl font-bold ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Link href={`/events?page=${currentPage - 1}`}>
              <ChevronLeft className="mr-1 size-4" /> 上一页
            </Link>
          </Button>
          
          <div className="flex items-center gap-1 mx-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                asChild
                variant={p === currentPage ? "default" : "ghost"}
                className={`size-10 rounded-xl font-bold ${p === currentPage ? "shadow-lg shadow-primary/20" : ""}`}
              >
                <Link href={`/events?page=${p}`}>{p}</Link>
              </Button>
            ))}
          </div>

          <Button
            asChild
            variant="outline"
            className={`rounded-xl font-bold ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Link href={`/events?page=${currentPage + 1}`}>
              下一页 <ChevronRight className="ml-1 size-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
