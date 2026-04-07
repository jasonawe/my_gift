# 电子礼簿管家 (Gift Ledger) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个包含“创建事件 -> 向导式礼金录入 -> 数据报表”完整闭环的全端响应式应用。

**Architecture:** 采用 Next.js 14 App Router 架构，利用 Server Actions 进行数据处理，Supabase 作为后端存储，shadcn/ui 提供原子组件。

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, Supabase, Framer Motion, react-hook-form, zod.

---

### Task 1: 项目初始化与基础环境搭建

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `components.json`
- Modify: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: 初始化 Next.js 项目并安装核心依赖**
  Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
  Add: `npm install @supabase/supabase-js lucide-react framer-motion clsx tailwind-merge zod react-hook-form @hookform/resolvers`

- [ ] **Step 2: 初始化 shadcn/ui**
  Run: `npx shadcn-ui@latest init` (选择默认配置，颜色设为 Red 以匹配设计稿)

- [ ] **Step 3: 安装基础组件**
  Run: `npx shadcn-ui@latest add button card input label tabs dialog drawer toast scroll-area select`

- [ ] **Step 4: 验证项目运行**
  Run: `npm run dev`
  Expected: 默认页面正常显示。

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "chore: project initialization with nextjs and shadcn/ui"
  ```

---

### Task 2: Supabase 集成与数据库初始化

**Files:**
- Create: `lib/supabase.ts`, `types/database.ts`, `supabase/migrations/20260407000000_init_schema.sql`

- [ ] **Step 1: 创建 Supabase 客户端配置**
  Create `lib/supabase.ts`:
  ```typescript
  import { createClient } from '@supabase/supabase-js'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
  ```

- [ ] **Step 2: 编写数据库初始化 SQL**
  Create `supabase/migrations/20260407000000_init_schema.sql`:
  ```sql
  CREATE TABLE gl_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE TABLE gl_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES gl_events(id) ON DELETE CASCADE,
    donor_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    gift_type TEXT DEFAULT '现金',
    relationship TEXT,
    remark TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );
  ```

- [ ] **Step 3: 运行 SQL 并验证连接**
  (指导用户在 Supabase SQL Editor 运行 SQL)

- [ ] **Step 4: Commit**
  ```bash
  git add lib/supabase.ts supabase/
  git commit -m "feat: supabase integration and database schema"
  ```

---

### Task 3: 全端响应式布局与导航开发

**Files:**
- Create: `components/layout/navbar.tsx`, `components/layout/sidebar.tsx`, `components/layout/mobile-nav.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: 创建桌面端侧边导航**
  Create `components/layout/sidebar.tsx` (使用 `gl_` 前缀相关路由)。

- [ ] **Step 2: 创建移动端底部标签栏**
  Create `components/layout/mobile-nav.tsx` (在 `sm:hidden` 下显示)。

- [ ] **Step 3: 集成到 RootLayout**
  Modify `app/layout.tsx` 引入导航组件，实现全端自适应布局。

- [ ] **Step 4: Commit**
  ```bash
  git add components/layout/ app/layout.tsx
  git commit -m "feat: responsive layout with sidebar and mobile nav"
  ```

---

### Task 4: 事件管理模块实现

**Files:**
- Create: `app/dashboard/page.tsx`, `app/events/new/page.tsx`, `lib/actions/events.ts`

- [ ] **Step 1: 实现创建事件的 Server Action**
  Create `lib/actions/events.ts` (使用 zod 验证字段)。

- [ ] **Step 2: 创建事件设置页面**
  Create `app/events/new/page.tsx` (表单页面)。

- [ ] **Step 3: 仪表盘概览展示**
  Create `app/dashboard/page.tsx` (从 Supabase 读取当前活动事件并展示汇总卡片)。

- [ ] **Step 4: Commit**
  ```bash
  git add app/dashboard/ app/events/ lib/actions/
  git commit -m "feat: event management and dashboard overview"
  ```

---

### Task 5: 核心：向导式礼金录入开发

**Files:**
- Create: `app/entry/[id]/page.tsx`, `components/entry/wizard-form.tsx`, `lib/actions/gifts.ts`

- [ ] **Step 1: 实现礼金录入 Server Action**
  Create `lib/actions/gifts.ts`。

- [ ] **Step 2: 构建向导式分步表单**
  Create `components/entry/wizard-form.tsx`:
  - Step 1: 赠送者
  - Step 2: 金额 (数字键盘优化)
  - Step 3: 关系与备注
  - Step 4: 确认

- [ ] **Step 3: 集成 Framer Motion 动画**
  在步骤切换时添加滑动动画。

- [ ] **Step 4: 手机端适配**
  确保在移动端使用全屏覆盖交互。

- [ ] **Step 5: Commit**
  ```bash
  git add components/entry/ app/entry/ lib/actions/gifts.ts
  git commit -m "feat: multi-step wizard for gift entry"
  ```

---

### Task 6: 数据报表与明细导出

**Files:**
- Create: `app/reports/[id]/page.tsx`, `components/reports/gift-table.tsx`, `components/reports/stats-charts.tsx`

- [ ] **Step 1: 构建数据明细表**
  Create `components/reports/gift-table.tsx` (支持搜索和排序)。

- [ ] **Step 2: 集成统计图表**
  使用 `recharts` 展示金额分布和类型占比。

- [ ] **Step 3: 实现 Excel 导出 (简单 CSV 实现)**
  在报表页增加导出按钮。

- [ ] **Step 4: 最终集成测试**
  模拟完整流程：创建活动 -> 录入多笔礼金 -> 查看报表。

- [ ] **Step 5: Commit**
  ```bash
  git add components/reports/ app/reports/
  git commit -m "feat: reports dashboard and data export"
  ```
