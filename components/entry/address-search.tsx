"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Loader2, Navigation2 } from "lucide-react"

interface AddressSearchProps {
  onSelect: (result: { name: string, lat: number, lng: number }) => void
  defaultValue?: string
}

export function AddressSearch({ onSelect, defaultValue = "" }: AddressSearchProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const autoCompleteRef = useRef<any>(null)

  useEffect(() => {
    // 动态加载高德地图脚本
    const key = process.env.NEXT_PUBLIC_AMAP_KEY
    if (!key) return

    window._AMapSecurityConfig = {
      securityJsCode: '', // 建议后期配置安全密钥以防被封
    }

    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.AutoComplete,AMap.PlaceSearch`
    script.async = true
    document.head.appendChild(script)

    script.onload = () => {
      // @ts-ignore
      autoCompleteRef.current = new window.AMap.Autocomplete({
        city: '全国'
      })
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  // 处理输入联想
  useEffect(() => {
    if (!query || query.length < 2 || !autoCompleteRef.current) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = () => {
      setLoading(true)
      autoCompleteRef.current.search(query, (status: string, result: any) => {
        setLoading(false)
        if (status === 'complete' && result.tips) {
          // 过滤掉没有坐标的提示项
          setSuggestions(result.tips.filter((tip: any) => tip.location))
          setShowDropdown(true)
        }
      })
    }

    const timer = setTimeout(fetchSuggestions, 500)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="relative space-y-3">
      <Label className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 ml-2">举办地点搜索 (高德数据) / SEARCH</Label>
      <div className="relative">
        <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-300" />
        <Input 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          placeholder="搜索具体的酒店、宴会厅或地址..." 
          className="pl-12 h-14 bg-slate-50 border-2 border-slate-100 focus:border-primary focus:ring-8 focus:ring-primary/5 rounded-2xl font-bold"
        />
        {loading && (
          <div className="absolute right-4 top-4">
            <Loader2 className="size-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* 高德搜索结果列表 */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setQuery(item.name)
                  setShowDropdown(false)
                  onSelect({
                    name: `${item.district}${item.address}${item.name}`,
                    lat: item.location.lat,
                    lng: item.location.lng
                  })
                }}
                className="w-full px-5 py-4 text-left hover:bg-red-50 flex items-start gap-3 border-b border-slate-50 last:border-none transition-colors group"
              >
                <Navigation2 className="size-4 text-primary mt-1 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="text-sm font-bold text-slate-900 line-clamp-1">{item.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{item.district}{item.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

declare global {
  interface Window {
    _AMapSecurityConfig: any;
    AMap: any;
  }
}
