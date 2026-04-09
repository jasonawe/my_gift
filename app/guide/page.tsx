import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { 
  Plus, 
  MousePointer2, 
  FileSpreadsheet, 
  Volume2, 
  ShieldCheck, 
  Search,
  PenLine,
  PieChart,
  ArrowRight
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GuidePage() {
  const steps = [
    {
      icon: Plus,
      title: "1. 建立礼事档案",
      desc: "点击顶部的“新建礼事”按钮。填写事件名称（如：王小明婚礼）、日期、地点，并选择是否开启“语音播报”。保存后，该事件会自动设为当前活跃焦点。",
      color: "bg-blue-500"
    },
    {
      icon: PenLine,
      title: "2. 开始录入心意",
      desc: "在仪表盘或事件列表中进入“继续录入”。输入赠送者姓名和金额。系统会自动检查重名，并根据您的设置进行实时语音朗读，确保录入无误。",
      color: "bg-primary"
    },
    {
      icon: PieChart,
      title: "3. 实时账本管理",
      desc: "录入时，右侧仿真格纸会实时同步。您可以随时点击任何一个格子来修正信息或删除记录。点击“报表分析”可查看各支付方式的汇总及人数统计。",
      color: "bg-purple-500"
    },
    {
      icon: FileSpreadsheet,
      title: "4. 数据存档与导出",
      desc: "活动结束后，进入报表中心。点击“导出 Excel (CSV)”即可获得一份带自动化汇总、格式工整的财务报表，方便永久保存或打印。",
      color: "bg-green-600"
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 py-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 italic">操作流程指南</h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">User Operation Guide</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {steps.map((step, idx) => (
          <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:scale-[1.01] transition-transform">
            <div className="flex flex-col md:flex-row items-stretch">
              <div className={cn("w-full md:w-48 flex items-center justify-center p-8 text-white", step.color)}>
                <step.icon className="size-16 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <CardContent className="flex-1 p-10 space-y-4 bg-white">
                <h3 className="text-2xl font-black text-slate-900">{step.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  {step.desc}
                </p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {/* 底部 FAQ */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-white space-y-8">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <ShieldCheck className="size-6 text-primary" /> 安全与隐私说明
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200">数据隔离保护</h4>
            <p className="text-sm text-slate-400">系统采用严格的 RLS (行级安全) 策略，您的礼金数据仅您本人可见，其他用户无法通过任何手段访问您的私密账目。</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-slate-200">云端实时同步</h4>
            <p className="text-sm text-slate-400">所有操作即刻保存至云端加密数据库。即使更换设备或清除浏览器缓存，只要登录账号，数据即可瞬间找回。</p>
          </div>
        </div>
        <div className="pt-6 border-t border-white/10 text-center">
          <Button asChild size="lg" className="rounded-2xl h-14 px-10 bg-primary font-black shadow-2xl">
            <Link href="/dashboard">我已了解，立即去操作</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

import { cn } from "@/lib/utils"
