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
  Settings
} from "lucide-react"
import { formatToLunar, getThemeByEventType } from "@/lib/utils"

async function getAllEvents() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("gl_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export default async function EventsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const allEvents = await getAllEvents()

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
        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border-2 border-dashed">
          <p className="text-slate-400 font-bold">暂无任何礼事记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allEvents.map((event) => {
            const themeClass = getThemeByEventType(event.event_type, (event as any).theme_color);
            return (
              <div 
                key={event.id} 
                className={`${themeClass} group relative flex flex-col p-8 rounded-[3rem] border-4 transition-all hover:shadow-2xl bg-background border-border ${
                  event.is_active ? "ring-[12px] ring-primary/[0.03]" : "hover:border-primary/20"
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-[1.5rem] shadow-sm ${event.is_active ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                    <Calendar className="size-7" />
                  </div>
                  {event.is_active && (
                    <span className="text-[10px] bg-primary/10 text-primary px-3 py-1 rounded-full font-bold shadow-sm border border-primary/20">进行中</span>
                  )}
                </div>
                
                <div className="flex-1 space-y-2 mb-10">
                  <h4 className="font-bold text-2xl text-foreground leading-tight group-hover:text-primary transition-colors">{event.title}</h4>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-muted-foreground font-bold">{event.event_start_date} ~ {event.event_end_date}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-medium italic">农历 {formatToLunar(event.event_start_date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-6 border-t border-border/50">
                  <Button asChild variant="ghost" className="rounded-xl font-bold text-[11px] h-10 px-0 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
                    <Link href={`/reports/${event.id}`}>
                      <PieChart className="mr-1.5 size-3.5" /> 账目
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="rounded-xl font-bold text-[11px] h-10 px-0 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors">
                    <Link href={`/events/${event.id}/edit`}>
                      <Settings className="mr-1.5 size-3.5" /> 修改
                    </Link>
                  </Button>
                  <Button asChild className="rounded-xl font-bold text-[11px] h-10 px-0 shadow-lg bg-primary text-primary-foreground hover:opacity-90">
                    <Link href={`/entry/${event.id}`}>
                      <PenLine className="mr-1.5 size-3.5" /> 记账
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}
