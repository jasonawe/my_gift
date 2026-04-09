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
  ArrowLeft
} from "lucide-react"

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
          <Link href="/dashboard" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 mb-2 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft className="size-3" /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">礼事档案库</h1>
          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Complete Event Archives</p>
        </div>
        <Button asChild size="lg" className="rounded-2xl h-14 px-8 bg-primary shadow-xl shadow-primary/20 font-black">
          <Link href="/events/new">
            <Plus className="mr-2 size-5" /> 新建档案
          </Link>
        </Button>
      </div>

      {allEvents.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed">
          <p className="text-slate-400 font-bold">暂无任何档案记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {allEvents.map((event) => (
            <div 
              key={event.id} 
              className={`group relative flex flex-col p-8 rounded-[3rem] border-4 transition-all hover:shadow-2xl bg-white ${
                event.is_active ? "border-primary/20 ring-[12px] ring-primary/[0.03]" : "border-slate-50 hover:border-slate-200"
              }`}
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-[1.5rem] shadow-sm ${event.is_active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                  <Calendar className="size-7" />
                </div>
                {event.is_active && (
                  <span className="text-[10px] bg-green-500 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-lg">Active</span>
                )}
              </div>
              
              <div className="flex-1 space-y-2 mb-10">
                <h4 className="font-black text-2xl text-slate-900">{event.title}</h4>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{event.event_start_date} ~ {event.event_end_date}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                <Button asChild variant="secondary" className="rounded-2xl font-black text-xs h-12 bg-slate-50 hover:bg-slate-100">
                  <Link href={`/reports/${event.id}`}>
                    <PieChart className="mr-2 size-4" /> 报表分析
                  </Link>
                </Button>
                <Button asChild className="rounded-2xl font-black text-xs h-12 shadow-lg">
                  <Link href={`/entry/${event.id}`}>
                    <PenLine className="mr-2 size-4" /> 录入数据
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
