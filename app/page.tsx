import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <h1 className="text-4xl font-bold text-primary">礼簿管家</h1>
      <p className="text-muted-foreground">欢迎使用专业电子礼簿录入系统</p>
      <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        进入仪表盘
      </Link>
    </div>
  )
}
