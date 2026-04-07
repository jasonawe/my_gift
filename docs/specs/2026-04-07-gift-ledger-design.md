# 电子礼簿管家 (Gift Ledger) 技术设计方案

## 1. 项目概述
本系统是一个专门用于仪式、宴请场景的礼金管理应用。通过全端响应式的界面，支持从事件创建、礼金向导式录入到实时数据报表的完整业务闭环。

### 核心目标
*   **极致录入体验**：采用向导式表单，降低录入错误率，支持手机/平板快速操作。
*   **实时数据汇总**：录入后即刻更新总额和分布情况。
*   **全端响应式**：适配签到台大屏与移动端单手操作。

---

## 2. 技术栈架构
*   **框架**: Next.js 14+ (App Router)
*   **样式**: Tailwind CSS + shadcn/ui
*   **动画**: framer-motion (向导切换动画)
*   **表单验证**: react-hook-form + zod
*   **后端/数据库**: Supabase (PostgreSQL + Auth + Realtime)
*   **图标**: lucide-react

---

## 3. 数据库设计 (Supabase)
所有表均使用 `gl_` 前缀以区分命名空间。

### 3.1 `gl_events` (事件表)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | UUID (PK) | 唯一标识符 |
| title | TEXT | 事件名称 (例：张三 & 李四 婚礼) |
| event_type | TEXT | 类型 (婚礼、满月、寿宴等) |
| event_date | DATE | 举办日期 |
| location | TEXT | 举办地点 |
| is_active | BOOLEAN | 是否为当前活动 |
| created_at | TIMESTAMPTZ | 创建时间 |

### 3.2 `gl_gifts` (礼金明细表)
| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | UUID (PK) | 唯一标识符 |
| event_id | UUID (FK) | 关联 gl_events.id |
| donor_name | TEXT | 赠送者姓名 |
| amount | NUMERIC | 礼金金额 (精确到分) |
| gift_type | TEXT | 支付方式 (现金、微信、支付宝等) |
| relationship | TEXT | 与主人的关系 |
| remark | TEXT | 备注 |
| created_at | TIMESTAMPTZ | 录入时间 |

---

## 4. 功能模块与交互设计

### 4.1 仪表盘首页 (`/dashboard`)
*   **概览**: 展示当前活跃事件的总礼金、到客数、最新 5 笔动态。
*   **操作**: “创建新事件”和“开始录入”的醒目入口。

### 4.2 向导式录入 (`/entry/[id]`)
采用分步表单 (Step-by-step Wizard)：
1.  **Step 1: 人员** - 输入赠送者姓名（支持联想）。
2.  **Step 2: 金额** - 输入金额并选择礼品/支付类型。
3.  **Step 3: 关系** - 选择或输入关系标签与备注。
4.  **Step 4: 确认** - 汇总信息并提交。提交后自动重置为 Step 1。

### 4.3 数据中心 (`/reports/[id]`)
*   **明细表**: 支持按姓名搜索、金额排序、分页。
*   **统计图表**: 金额区间分布、关系分布饼图、录入频率趋势图。
*   **导出**: 支持导出 CSV/Excel 格式账单。

---

## 5. 响应式与体验优化
*   **Breakpoint First**: 
    *   **Desktop**: 侧边常驻导航，录入页采用左右分栏（录入+实时动态）。
    *   **Mobile**: 底部 Tab Bar 导航，录入页采用全屏 Drawer 交互，金额输入自动唤起 `decimal` 键盘。
*   **性能**: 关键页面使用 Server Components 预渲染。
*   **反馈**: 所有录入操作均有 Toast 即时反馈。

---

## 6. 开发计划 (MVP)
1.  **Phase 1**: 环境搭建，Supabase 表结构初始化。
2.  **Phase 2**: 首页仪表盘与事件创建功能实现。
3.  **Phase 3**: 核心“向导式录入”页面开发（含全端适配）。
4.  **Phase 4**: 数据报表与导出功能实现。
