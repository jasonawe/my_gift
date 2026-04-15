"use client"

import { 
  ComposedChart, 
  Bar, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts'

interface YearlyData {
  year: string
  amount: number
  count: number
}

export function DashboardCharts({ data }: { data: YearlyData[] }) {
  return (
    <div className="h-[400px] w-full bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 relative overflow-hidden group">
      {/* 装饰性背景 */}
      <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 opacity-50" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">年度礼金趋势</h4>
            <p className="text-[10px] text-slate-300 font-bold mt-1">对比过去三年的礼金总额与社交广度</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'black' }}
              dy={15}
            />
            <YAxis 
              yAxisId="left"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
              tickFormatter={(value) => `¥${value/1000}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#cbd5e1', fontSize: 10 }}
              tickFormatter={(value) => `${value}人`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ 
                borderRadius: '1.5rem', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                padding: '16px'
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingTop: '0', paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
            />
            <Bar 
              yAxisId="left"
              name="礼金金额"
              dataKey="amount" 
              radius={[12, 12, 0, 0]} 
              barSize={45}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#f20d0d' : '#cbd5e1'} 
                  fillOpacity={index === data.length - 1 ? 1 : 0.5}
                />
              ))}
            </Bar>
            <Line 
              yAxisId="right"
              name="往来人数"
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={4}
              dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
