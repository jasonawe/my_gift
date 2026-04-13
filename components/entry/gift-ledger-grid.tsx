"use client"

import { useState, useEffect } from "react"
import { getGiftsWithFilters, updateGift, deleteGift, GiftEntryData } from "@/lib/actions/gifts"
import { amountToChinese, cn } from "@/lib/utils"
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
import { Search, ChevronLeft, ChevronRight, Users, RefreshCw, Trash2, Loader2, Calendar } from "lucide-react"
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
  theme?: string
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

  const [editingGift, setEditingGift] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<Partial<GiftEntryData>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  const isSolemn = theme === "theme-solemn"
  const labelText = isSolemn ? "帛金" : "贺礼"
  const pageSize = 12

  const fetchData = async () => {
    setLoading(true)
    const result = await getGiftsWithFilters({ eventId, ...filters, pageSize })
    setGifts(result.gifts)
    setStats({ count: result.count, totalAmount: result.totalAmount })
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filters.page, filters.giftType, filters.relationship, eventId])

  const openEditDialog = (gift: any) => {
    setEditFormData({
      donor_name: gift.donor_name,
      amount: Number(gift.amount),
      gift_type: gift.gift_type,
      relationship: gift.relationship || "",
      remark: gift.remark || ""
    })
    setEditingGift(gift)
  }

  const handleUpdate = async () => {
    if (!editingGift) return
    setIsUpdating(true)
    const result = await updateGift(editingGift.id, editFormData as GiftEntryData)
    setIsUpdating(false)
    if (result.success) {
      toast.success("已更新")
      setEditingGift(null)
      fetchData()
    } else {
      toast.error("更新失败")
    }
  }

  const handleDelete = async () => {
    if (!editingGift || !confirm("确定删除吗？")) return
    setIsUpdating(true)
    const result = await deleteGift(editingGift.id)
    setIsUpdating(false)
    if (result.success) {
      toast.success("已删除")
      setEditingGift(null)
      fetchData()
    }
  }

  const relationshipPresets = ["长辈", "平辈", "晚辈", "挚友", "同事", "同学", "同乡", "其他"]
  const totalPages = Math.ceil(stats.count / pageSize)
  const currentPageTotal = gifts.reduce((sum, g) => sum + Number(g.amount), 0)

  return (
    <div className={`space-y-6 ${theme}`}>
      {/* 搜索与工具栏 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="搜索姓名..." 
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && setFilters(f => ({ ...f, page: 1 }))}
            className="h-10 md:w-64"
          />
          <Button variant="outline" onClick={fetchData}><RefreshCw className={loading ? "animate-spin" : ""} /></Button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-primary">共 {stats.count} 笔</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}><ChevronLeft /></Button>
            <span className="text-xs font-bold">{filters.page}/{totalPages || 1}</span>
            <Button variant="ghost" size="icon" disabled={filters.page >= totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}><ChevronRight /></Button>
          </div>
        </div>
      </div>

      {/* 还原仿真账本布局 */}
      <div className="relative rounded-lg border-[12px] border-white shadow-2xl overflow-hidden p-8 min-h-[700px] flex flex-col bg-[#fefaf6]">
        <CornerDecoration className="absolute top-2 left-2 size-12 text-primary opacity-60" />
        <CornerDecoration className="absolute top-2 right-2 size-12 text-primary opacity-80 rotate-90" />
        <CornerDecoration className="absolute bottom-2 left-2 size-12 text-primary opacity-80 -rotate-90" />
        <CornerDecoration className="absolute bottom-2 right-2 size-12 text-primary opacity-80 rotate-180" />

        <div className="flex-1 flex border-2 border-primary/40 divide-x-2 divide-primary/40 bg-white/80">
          {loading ? (
            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : (
            <>
              {gifts.map((gift) => (
                <div 
                  key={gift.id} 
                  className="flex-1 flex flex-col group min-w-[80px] cursor-pointer hover:bg-primary/5 transition-colors relative"
                  onClick={() => openEditDialog(gift)}
                >
                  <div className="flex-[4] flex flex-col items-center justify-start pt-8 pb-2 px-2 border-b-2 border-primary/40">
                    <span className="text-3xl font-bold tracking-[0.2em] text-[#1a1a1a] font-serif leading-none" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                      {gift.donor_name}
                    </span>
                  </div>
                  <div className="flex-[1] flex items-center justify-center border-b-2 border-primary/40 bg-primary/5">
                    <span className="text-lg font-bold text-primary tracking-widest" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                      {labelText}
                    </span>
                  </div>
                  <div className="flex-[4] flex items-center justify-center p-2">
                    <span className="text-base font-bold text-[#333] tracking-[0.1em] font-serif leading-tight" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                      {amountToChinese(gift.amount)}
                    </span>
                  </div>
                  <div className="flex-[1] flex items-center justify-center bg-white/40 border-t border-primary/10">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">¥{gift.amount}</span>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, pageSize - gifts.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="flex-1 flex flex-col bg-transparent opacity-[0.03] bg-primary" />
              ))}
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between px-2 text-[11px] font-bold text-slate-500 font-mono">
          <div>日期: {new Date().toLocaleDateString()}</div>
          <div className="text-primary flex items-center gap-2">
            <span className="text-slate-500">合计:</span>
            <span className="text-base font-bold">¥{currentPageTotal.toLocaleString()}.00</span>
          </div>
        </div>
      </div>

      {/* 修改对话框 (纯净版) */}
      <Dialog open={!!editingGift} onOpenChange={(open) => !open && setEditingGift(null)}>
        <DialogContent className="bg-white p-0 rounded-2xl shadow-2xl overflow-hidden sm:max-w-[450px]">
          <DialogHeader className="pt-8 pb-4 px-8 border-b bg-slate-50">
            <DialogTitle className="text-xl font-bold">修改礼金信息</DialogTitle>
            <DialogDescription>校正已录入的内容</DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div>
              <Label className="text-xs text-slate-400 font-bold mb-2 block">姓名</Label>
              <Input value={editFormData.donor_name || ''} onChange={e => setEditFormData({...editFormData, donor_name: e.target.value})} className="h-11" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-slate-400 font-bold mb-2 block">金额 (¥)</Label>
                <Input type="number" value={editFormData.amount || ''} onChange={e => setEditFormData({...editFormData, amount: Number(e.target.value)})} className="h-11 font-bold text-primary" />
              </div>
              <div>
                <Label className="text-xs text-slate-400 font-bold mb-2 block">支付方式</Label>
                <Select value={editFormData.gift_type} onValueChange={v => setEditFormData({...editFormData, gift_type: v})}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="现金">现金</SelectItem>
                    <SelectItem value="微信转账">微信转账</SelectItem>
                    <SelectItem value="支付宝">支付宝</SelectItem>
                    <SelectItem value="实物礼品">实物礼品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-400 font-bold mb-3 block">关系标签</Label>
              <div className="flex flex-wrap gap-2">
                {relationshipPresets.map(tag => (
                  <Button 
                    key={tag} 
                    type="button"
                    variant={editFormData.relationship === tag ? "default" : "outline"}
                    size="sm"
                    className="rounded-lg h-8 px-3 text-[11px] font-bold"
                    onClick={() => setEditFormData({...editFormData, relationship: tag})}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
              <Input 
                className="mt-3 h-9 text-xs" 
                placeholder="或手动输入具体称呼" 
                value={editFormData.relationship || ''} 
                onChange={e => setEditFormData({...editFormData, relationship: e.target.value})} 
              />
            </div>

            <div>
              <Label className="text-xs text-slate-400 font-bold mb-2 block">备注说明</Label>
              <Input value={editFormData.remark || ''} onChange={e => setEditFormData({...editFormData, remark: e.target.value})} className="h-11 text-sm" placeholder="可选补充..." />
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-slate-50/50 flex flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleDelete} 
              className="flex-1 h-12 rounded-xl font-bold border-2 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
            >
              <Trash2 className="mr-2 size-4" /> 删除记录
            </Button>
            <Button 
              className="flex-[2] h-12 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all" 
              onClick={handleUpdate} 
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <RefreshCw className="mr-2 size-4" />}
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
