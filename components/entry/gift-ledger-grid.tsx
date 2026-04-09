"use client"

import { useState, useEffect } from "react"
import { getGiftsWithFilters, updateGift, deleteGift, GiftEntryData } from "@/lib/actions/gifts"
import { amountToChinese } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, ChevronLeft, ChevronRight, Users, RefreshCw, Trash2, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

const CornerDecoration = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M0 0 v30 c0 -15 15 -30 30 -30 h-30 M10 10 c0 5 5 10 10 10 M0 0 l15 15" />
    <circle cx="5" cy="5" r="2" />
  </svg>
)

interface GiftLedgerGridProps {
  eventId: string
  theme?: "theme-festive" | "theme-solemn"
}

export function GiftLedgerGrid({ eventId, theme = "theme-festive" }: GiftLedgerGridProps) {
  const [gifts, setGifts] = useState<any[]>([])
  const [stats, setStats] = useState({ count: 0, totalAmount: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    giftType: "all",
    relationship: "all",
    page: 1
  })

  // 编辑相关的状态
  const [editingGift, setEditingGift] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<Partial<GiftEntryData>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  const isSolemn = theme === "theme-solemn"
  const labelText = isSolemn ? "帛金" : "贺礼"
  const pageSize = 12

  const fetchData = async () => {
    setLoading(true)
    const result = await getGiftsWithFilters({
      eventId,
      ...filters,
      pageSize
    })
    setGifts(result.gifts)
    setStats({ count: result.count, totalAmount: result.totalAmount })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filters.page, filters.giftType, filters.relationship, eventId])

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setFilters(f => ({ ...filters, page: 1 }))
      fetchData()
    }
  }

  const openEditDialog = (gift: any) => {
    setEditFormData({
      donor_name: gift.donor_name,
      amount: Number(gift.amount),
      gift_type: gift.gift_type, // 已经在这里设值了
      relationship: gift.relationship || "",
      remark: gift.remark || ""
    })
    setEditingGift(gift) // 设值后再打开，确保初始化
  }

  const handleUpdate = async () => {
    if (!editingGift) return
    setIsUpdating(true)
    const result = await updateGift(editingGift.id, editFormData as GiftEntryData)
    setIsUpdating(false)
    if (result.success) {
      toast.success("记录已更新")
      setEditingGift(null)
      fetchData()
    } else {
      toast.error("更新失败")
    }
  }

  const handleDelete = async () => {
    if (!editingGift || !confirm("确定要永久删除这笔记录吗？")) return
    setIsUpdating(true)
    const result = await deleteGift(editingGift.id)
    setIsUpdating(false)
    if (result.success) {
      toast.success("记录已删除")
      setEditingGift(null)
      fetchData()
    } else {
      toast.error("删除失败")
    }
  }

  const totalPages = Math.ceil(stats.count / pageSize)
  const currentPageTotal = gifts.reduce((sum, g) => sum + Number(g.amount), 0)

  return (
    <div className={`space-y-6 ${theme}`}>
      {/* 工具栏 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={`搜索人员或备注...`} 
              className="pl-9 rounded-xl border-none bg-muted/50 focus:bg-white transition-all"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              onKeyDown={handleSearch}
            />
          </div>
          <Button variant="ghost" size="icon" onClick={fetchData}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
            <Users className="size-3.5 text-primary" />
            <span className="text-xs font-black text-primary">{stats.count} 条记录</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft className="size-5" />
            </Button>
            <span className="text-xs font-black w-12 text-center">{filters.page}/{totalPages || 1}</span>
            <Button variant="ghost" size="icon" disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 仿真礼簿主区域 */}
      <div className={`relative rounded-sm border-[12px] border-white shadow-2xl overflow-hidden p-8 min-h-[700px] flex flex-col transition-colors duration-700 ${isSolemn ? 'bg-slate-50' : 'bg-[#fef2f2]'}`}>
        <CornerDecoration className="absolute top-2 left-2 size-12 text-primary opacity-80" />
        <CornerDecoration className="absolute top-2 right-2 size-12 text-primary opacity-80 rotate-90" />
        <CornerDecoration className="absolute bottom-2 left-2 size-12 text-primary opacity-80 -rotate-90" />
        <CornerDecoration className="absolute bottom-2 right-2 size-12 text-primary opacity-80 rotate-180" />

        <div className={`flex-1 flex border-2 border-primary/40 divide-x-2 divide-primary/40 transition-colors duration-700 ${isSolemn ? 'bg-white' : 'bg-[#fefaf6]'}`}>
          {loading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <div key={i} className="flex-1 p-4"><Skeleton className="h-full w-full opacity-10 bg-primary" /></div>
            ))
          ) : (
            <>
              {gifts.map((gift) => (
                <div 
                  key={gift.id} 
                  className="flex-1 flex flex-col group min-w-[80px] cursor-pointer hover:bg-primary/5 transition-colors relative"
                  onClick={() => openEditDialog(gift)}
                >
                  <div className="flex-[4] flex flex-col items-center justify-start pt-8 pb-2 px-2 border-b-2 border-primary/40 bg-white/20">
                    <span className="text-3xl font-black tracking-[0.2em] text-[#1a1a1a] font-serif leading-none" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                      {gift.donor_name}
                    </span>
                  </div>
                  <div className="flex-[1] flex items-center justify-center border-b-2 border-primary/40 bg-primary/5">
                    <span className="text-lg font-black text-primary tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                      {labelText}
                    </span>
                  </div>
                  <div className="flex-[4] flex items-center justify-center p-2">
                    <span className="text-base font-bold text-[#333] tracking-[0.1em] font-serif leading-tight" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                      {amountToChinese(gift.amount)}
                    </span>
                  </div>
                  <div className="flex-[1] flex items-center justify-center bg-white/40 border-t border-primary/10">
                    <span className="text-[10px] font-black text-slate-400 font-mono">¥{gift.amount}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, pageSize - gifts.length) }).map((_, i) => (
                <div key={`empty-${i}`} className={`flex-1 flex flex-col bg-transparent opacity-[0.03] ${isSolemn ? 'bg-slate-200' : 'bg-primary'}`} />
              ))}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between px-2 text-[11px] font-bold text-slate-500 font-mono">
          <div>RECORD DATE: {new Date().toLocaleDateString()}</div>
          <div className="text-primary flex items-center gap-2">
            <span className="text-slate-500 uppercase">Subtotal:</span>
            <span className="text-base font-black">¥{currentPageTotal.toLocaleString()}.00</span>
          </div>
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={!!editingGift} onOpenChange={(open) => !open && setEditingGift(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">修改礼金信息</DialogTitle>
            <DialogDescription className="font-medium text-slate-400 uppercase tracking-widest text-[10px]">Correction Interface</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">赠送者姓名</Label>
              <Input value={editFormData.donor_name || ''} onChange={e => setEditFormData({...editFormData, donor_name: e.target.value})} className="h-12 rounded-xl bg-muted/20 border-none font-bold text-base" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">礼金金额 (¥)</Label>
                <Input type="number" step="0.01" value={editFormData.amount || ''} onChange={e => setEditFormData({...editFormData, amount: Number(e.target.value)})} className="h-12 rounded-xl bg-muted/20 border-none font-black text-xl text-primary" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">支付方式</Label>
                <Select key={editingGift?.id} value={editFormData.gift_type} onValueChange={v => setEditFormData({...editFormData, gift_type: v})}>
                  <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none font-bold">
                    <SelectValue placeholder="请选择" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="现金">现金</SelectItem>
                    <SelectItem value="微信转账">微信转账</SelectItem>
                    <SelectItem value="支付宝">支付宝</SelectItem>
                    <SelectItem value="实物礼品">实物礼品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 关系标签编辑 */}
            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">关系标签</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {["亲戚", "同学", "同事", "朋友"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setEditFormData({...editFormData, relationship: tag})}
                    className={`px-3 py-1.5 rounded-lg text-[10px] border transition-all font-bold ${
                      editFormData.relationship === tag 
                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                        : "bg-muted/30 hover:border-primary/30 text-muted-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <Input value={editFormData.relationship || ''} onChange={e => setEditFormData({...editFormData, relationship: e.target.value})} placeholder="或自定义关系" className="h-10 rounded-xl bg-muted/20 border-none text-sm font-medium" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                备注信息
              </Label>
              <Input value={editFormData.remark || ''} onChange={e => setEditFormData({...editFormData, remark: e.target.value})} className="h-12 rounded-xl bg-muted/20 border-none text-sm font-medium" placeholder="可选补充说明..." />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:gap-0 pt-4">
            <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:bg-red-50 font-black px-6 rounded-xl text-xs">
              <Trash2 className="size-4 mr-2" /> 删除此笔记录
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating} className="flex-1 bg-primary shadow-2xl shadow-primary/30 font-black h-12 rounded-xl">
              {isUpdating ? <Loader2 className="animate-spin" /> : "同步更新至云端"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
