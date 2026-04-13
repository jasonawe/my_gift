"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Download, History, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Gift {
  id: string
  donor_name: string
  amount: number
  gift_type: string
  relationship: string | null
  remark: string | null
  created_at: string
}

const ITEMS_PER_PAGE = 10

export function GiftTable({ gifts }: { gifts: Gift[] }) {
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // 搜索时重置到第一页
  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const filteredGifts = useMemo(() => {
    return gifts.filter(g => 
      g.donor_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.relationship && g.relationship.toLowerCase().includes(search.toLowerCase())) ||
      (g.remark && g.remark.toLowerCase().includes(search.toLowerCase()))
    )
  }, [gifts, search])

  const totalPages = Math.ceil(filteredGifts.length / ITEMS_PER_PAGE)
  
  const paginatedGifts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredGifts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredGifts, currentPage])

  const downloadCSV = () => {
    const headers = ["日期", "姓名", "金额", "支付方式", "关系", "备注"]
    const rows = filteredGifts.map(g => [
      new Date(g.created_at).toLocaleDateString(),
      g.donor_name,
      g.amount, 
      g.gift_type,
      g.relationship || "",
      g.remark || ""
    ])
    
    const totalAmount = filteredGifts.reduce((sum, g) => sum + Number(g.amount), 0)
    const totalCount = filteredGifts.length
    
    const statsByType: Record<string, { amount: number, count: number }> = {}
    filteredGifts.forEach(g => {
      if (!statsByType[g.gift_type]) {
        statsByType[g.gift_type] = { amount: 0, count: 0 }
      }
      statsByType[g.gift_type].amount += Number(g.amount)
      statsByType[g.gift_type].count += 1
    })

    const emptyRow = ["", "", "", "", "", ""]
    const summaryHeader = ["【数据汇总统计】", "", "", "", "", ""]
    const totalRow = ["总计", `${totalCount}人`, totalAmount, "", "", ""]
    
    const typeRows = Object.entries(statsByType).map(([type, data]) => [
      `支付方式: ${type}`,
      `${data.count}人`,
      data.amount,
      "",
      "",
      ""
    ])
    
    const csvContent = [
      headers, 
      ...rows, 
      emptyRow, 
      summaryHeader, 
      totalRow, 
      ...typeRows
    ].map(row => 
      row.map(cell => {
        const cellStr = String(cell).replace(/"/g, '""');
        return `"${cellStr}"`;
      }).join(",")
    ).join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `礼金账目明细统计_${new Date().toLocaleDateString()}.csv`)
    link.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="搜索赠送者姓名、关系或备注..."
            className="pl-11 h-14 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary focus:ring-8 focus:ring-primary/5 rounded-[1.25rem] shadow-sm transition-all text-base dark:text-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          onClick={downloadCSV} 
          size="lg"
          className="h-14 px-8 rounded-[1.25rem] font-black bg-slate-900 dark:bg-primary shadow-xl shadow-slate-200 dark:shadow-none hover:bg-slate-800 transition-all w-full md:w-auto shrink-0"
        >
          <Download className="mr-2 h-5 w-5" />
          导出明细统计 (CSV)
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-2 border-slate-50 dark:border-slate-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-16 px-8 text-xs font-black uppercase tracking-widest text-slate-400">录入时间</TableHead>
              <TableHead className="h-16 px-6 text-xs font-black uppercase tracking-widest text-slate-400">赠送者</TableHead>
              <TableHead className="h-16 px-6 text-xs font-black uppercase tracking-widest text-slate-400">关系</TableHead>
              <TableHead className="h-16 px-6 text-xs font-black uppercase tracking-widest text-slate-400 text-right">金额 (¥)</TableHead>
              <TableHead className="h-16 px-6 text-xs font-black uppercase tracking-widest text-slate-400">支付方式</TableHead>
              <TableHead className="h-16 px-8 text-xs font-black uppercase tracking-widest text-slate-400">备注说明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGifts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-60 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <History className="size-8 text-slate-200 dark:text-slate-700" />
                    </div>
                    <p className="text-slate-400 font-bold">未找到匹配的存档记录</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedGifts.map((gift) => (
                <TableRow key={gift.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-slate-50 dark:border-slate-800">
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                        <Calendar className="size-3 text-slate-300" />
                        {new Date(gift.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium ml-4.5">
                        {new Date(gift.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <span className="text-lg font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors italic">
                      {gift.donor_name}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-bold rounded-lg px-2.5 py-1">
                      {gift.relationship || "礼客"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-right">
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                      <small className="text-xs mr-0.5 text-slate-300">¥</small>
                      {gift.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-primary/20" />
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{gift.gift_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 max-w-[200px]">
                      {gift.remark || "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <p className="text-sm font-bold text-slate-400">
            显示第 <span className="text-slate-900 dark:text-slate-200">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> 至 <span className="text-slate-900 dark:text-slate-200">{Math.min(currentPage * ITEMS_PER_PAGE, filteredGifts.length)}</span> 条，共 <span className="text-slate-900 dark:text-slate-200">{filteredGifts.length}</span> 条
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-5" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  className={`size-10 rounded-xl font-black text-sm transition-all ${
                    currentPage === page 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-600 dark:text-slate-400 disabled:opacity-30 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
