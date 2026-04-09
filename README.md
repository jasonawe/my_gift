# 礼簿管家 (Gift Ledger) - 专业电子礼簿录入与分析系统

「礼簿管家」是一款专为中式宴请场景（婚礼、寿宴、满月、丧礼等）设计的现代化电子礼簿管理系统。它结合了传统礼簿的视觉美感与现代云端的高效，支持全端响应式操作、实时语音播报及多维度数据分析。

---

## 📸 页面效果展示

### 1. 数字化决策仪表盘 (Dashboard)
提供全局视角，查看近期活动、年度人情往来统计以及新手指引。
> **展示重点**：大字号金额汇总、近三年趋势图、沉浸式黑色指引卡片。
*(建议截图位置：`/docs/screenshots/dashboard.png`)*

### 2. 传统仿真礼簿 (Ledger View)
业界领先的排版还原，支持宣纸质感底纹、大写金额自动转换。
> **展示重点**：姓名置顶竖排、贺礼/帛金印章效果、底部页码统计、格纸背景。
*(建议截图位置：`/docs/screenshots/ledger_grid.png`)*

### 3. 高效心意录入 (Gift Entry)
左侧表单录入，右侧实时刷新账本，支持高德地图选点与语音播报。
> **展示重点**：分栏布局、语音开关、高德地图弹窗、重名校验提示。
*(建议截图位置：`/docs/screenshots/entry_page.png`)*

### 4. 红白喜事主题切换 (Dynamic Themes)
根据事件类型一键变换，从“喜庆红”到“庄重黑白”。
> **展示重点**：同一页面在不同事件类型下的配色差异。
*(建议截图位置：`/docs/screenshots/themes_compare.png`)*

### 5. 专业数据报表 (Reports)
多维度汇总统计，支持 CSV 导出，导出文件包含自动化小计。
> **展示重点**：报表卡片、搜索过滤功能、导出的 Excel 格式。
*(建议截图位置：`/docs/screenshots/reports.png`)*

---

## ✨ 核心特性

- **仿真竖排礼簿**：深度复刻传统纸质礼簿排版，支持大写金额自动转换、格纸视觉风格。
- **红白双主题**：根据事件类型（喜事/白事）一键切换 UI 风格，自动适配文案（贺礼/帛金）。
- **智能地点搜索**：集成高德地图 (AMap) JS API，支持地图选点与精准 POI 搜索。
- **实时语音播报**：录入成功后自动朗读姓名与金额，适合繁忙的签到现场。
- **全功能管理**：
  - 多用户系统：基于 Supabase Auth 的安全认证与数据隔离。
  - 安全防护：全流程集成图形验证码，支持密码找回。
  - 数据导出：一键导出包含完整汇总信息的 CSV (Excel) 报表。

## 🛠️ 技术栈

- **Frontend**: Next.js 14+ (App Router), Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth)
- **Maps**: AMap (高德地图) JS API v2.0
- **Guide**: Driver.js (交互式操作指引)

## 🚀 快速开始

### 1. 环境准备
在项目根目录创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=您的_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的_SUPABASE_ANON_KEY
NEXT_PUBLIC_AMAP_KEY=您的_高德地图_KEY
NEXT_PUBLIC_AMAP_SECRET=您的_高德地图_安全密钥
```

### 2. 数据库初始化
登录 Supabase SQL Editor，运行 `supabase/migrations/` 下的 SQL。

### 3. 运行项目
```bash
npm install
npm run dev
```

## 📜 许可证
MIT License
