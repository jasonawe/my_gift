"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Loader2, Navigation2 } from "lucide-react"

interface MapPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (result: { address: string, lat: number, lng: number }) => void
}

export function MapPicker({ open, onOpenChange, onConfirm }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedInfo, setSelectedInfo] = useState<{address: string, lat: number, lng: number} | null>(null)

  useEffect(() => {
    if (!open) return

    const key = process.env.NEXT_PUBLIC_AMAP_KEY
    if (!key) return

    // 强制同步高德安全配置 (从环境变量读取)
    if (typeof window !== 'undefined') {
      window._AMapSecurityConfig = {
        securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECRET,
      }
    }

    const initMap = () => {
      // @ts-ignore
      const AMap = window.AMap
      if (!AMap || !mapContainerRef.current) return

      try {
        if (mapRef.current) {
          mapRef.current.destroy()
        }

        mapRef.current = new AMap.Map(mapContainerRef.current, {
          zoom: 13,
          center: [116.397428, 39.90923],
        })

        markerRef.current = new AMap.Marker({
          map: mapRef.current,
          draggable: true,
          position: [116.397428, 39.90923]
        })

        mapRef.current.on('click', (e: any) => {
          const { lng, lat } = e.lnglat
          updateMarker(lng, lat)
        })

        markerRef.current.on('dragend', (e: any) => {
          const { lng, lat } = e.lnglat
          updateMarker(lng, lat)
        })
      } catch (e) {
        console.error("Map Init Error:", e)
      }
    }

    // 动态载入脚本
    if (!window.AMap) {
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.PlaceSearch,AMap.Geocoder`
      script.async = true
      script.onload = () => {
        // 给脚本加载留一点缓冲时间
        setTimeout(initMap, 300)
      }
      document.head.appendChild(script)
    } else {
      setTimeout(initMap, 200)
    }

    return () => {
      // 这里的销毁要小心处理，Dialog 切换时可能还没渲染完
    }
  }, [open])

  const updateMarker = (lng: number, lat: number) => {
    // @ts-ignore
    const AMap = window.AMap
    if (!AMap || !mapRef.current || !markerRef.current) return

    markerRef.current.setPosition([lng, lat])
    mapRef.current.setCenter([lng, lat])

    const geocoder = new AMap.Geocoder()
    geocoder.getAddress([lng, lat], (status: string, result: any) => {
      if (status === 'complete' && result.regeocode) {
        setSelectedInfo({
          address: result.regeocode.formattedAddress,
          lat,
          lng
        })
      }
    })
  }

  const handleSearch = () => {
    if (!searchQuery) return
    setLoading(true)
    // @ts-ignore
    const AMap = window.AMap
    if (!AMap) return

    const placeSearch = new AMap.PlaceSearch({
      pageSize: 1,
      pageIndex: 1,
      city: "全国",
    })

    placeSearch.search(searchQuery, (status: string, result: any) => {
      setLoading(false)
      if (status === 'complete' && result.poiList && result.poiList.pois.length > 0) {
        const poi = result.poiList.pois[0]
        updateMarker(poi.location.lng, poi.location.lat)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="输入酒店名称进行搜索..." 
                className="pl-9 h-12 rounded-xl bg-slate-50 border-none font-bold"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="rounded-xl h-12 px-8 font-black bg-primary">
              {loading ? <Loader2 className="size-4 animate-spin" /> : "查询"}
            </Button>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-100">
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
          </div>

          {selectedInfo && (
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in zoom-in-95">
              <div className="flex items-start gap-3">
                <Navigation2 className="size-4 text-primary mt-1 shrink-0" />
                <div>
                  <div className="text-sm font-black text-slate-900 line-clamp-1">{selectedInfo.address}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    POINT: {selectedInfo.lat.toFixed(6)}, {selectedInfo.lng.toFixed(6)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-0 bg-slate-50/50 flex flex-row gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl font-bold h-12">
            取消
          </Button>
          <Button 
            disabled={!selectedInfo} 
            onClick={() => selectedInfo && onConfirm(selectedInfo)}
            className="flex-[2] rounded-xl h-12 font-black shadow-lg shadow-primary/20 bg-primary"
          >
            确认此地点
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
