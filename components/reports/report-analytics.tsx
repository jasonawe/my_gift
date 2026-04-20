"use client"

import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

interface ReportAnalyticsProps {
  gifts: any[]
}

export function ReportAnalytics({ gifts }: ReportAnalyticsProps) {
  // 1. 关系分布 (雷达图数据) - 同步录入端的分类标签
  const relMap: Record<string, number> = {
    "长辈": 0, "平辈": 0, "晚辈": 0, "挚友": 0, "同事": 0, "同学": 0, "其他": 0
  }
  
  gifts.forEach(g => {
    const key = g.relationship || "其他"
    if (relMap[key] !== undefined) {
      relMap[key]++
    } else {
      relMap["其他"]++
    }
  })
  
  const radarData = Object.entries(relMap).map(([subject, A]) => ({ 
    subject, 
    A, 
    fullMark: Math.max(...Object.values(relMap), 1) 
  }))

  // 2. 金额区间分布 (柱状图数据)
  const ranges = [
    { label: '200以下', min: 0, max: 200 },
    { label: '200-500', min: 200, max: 500 },
    { label: '500-1000', min: 500, max: 1000 },
    { label: '1000-2000', min: 1000, max: 2000 },
    { label: '2000以上', min: 2000, max: Infinity },
  ]
  const rangeData = ranges.map(r => ({
    name: r.label,
    count: gifts.filter(g => Number(g.amount) >= r.min && Number(g.amount) < r.max).length
  }))

  // 3. 支付方式占比 (饼图数据)
  const typeMap: Record<string, number> = {}
  gifts.forEach(g => {
    typeMap[g.gift_type] = (typeMap[g.gift_type] || 0) + Number(g.amount)
  })
  const pieData = Object.entries(typeMap).map(([name, value]) => ({ name, value }))

  const COLORS = ['#f20d0d', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6366f1', '#94a3b8']

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* A. 关系分布透视 (雷达图) */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 flex flex-col items-center">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">关系分布透视</h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                <Radar
                  name="人数"
                  dataKey="A"
                  stroke="#f20d0d"
                  fill="#f20d0d"
                  fillOpacity={0.5}
                />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. 礼金档位分析 (精细柱状图) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 flex flex-col">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">礼金档位分析</h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rangeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* C. 资金来源构成 (横向分布) */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/3 space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">资金来源构成</h4>
            <p className="text-xl font-black text-slate-900 leading-tight">
              各支付渠道的<br/>资金贡献占比
            </p>
            <div className="pt-4 space-y-3">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-500">{d.name}</span>
                  </div>
                  <span className="text-slate-900">¥{d.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
