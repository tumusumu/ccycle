# 碳循112 (CCycle)

<div align="center">

**智能碳水循环饮食计算与跟踪系统**

基于科学的 112113 碳水循环方法论，帮助用户精准制定个性化饮食方案并追踪每日营养摄入。

[在线体验](https://ccycle.vercel.app) • [功能特点](#-功能特点) • [快速开始](#-快速开始) • [技术栈](#-技术栈)

</div>

---

## 📖 项目简介

**碳循112** 是一款专注于碳水循环饮食管理的 Web 应用。采用 **112113 六天循环模式**（低-低-中-低-低-高），根据用户的体重、体脂率和性别，自动计算每日所需的碳水化合物、蛋白质和脂肪摄入量。

### 什么是 112113 碳水循环？

112113 是一种优化的碳水循环模式，6天为一个完整周期：

| 天数 | 类型 | 碳水摄入 | 说明 |
|------|------|----------|------|
| 第1天 | 低碳日 | 1g/kg | 促进脂肪燃烧 |
| 第2天 | 低碳日 | 1g/kg | 延续燃脂状态 |
| 第3天 | 中碳日 | 2g/kg | 平衡代谢 |
| 第4天 | 低碳日 | 1g/kg | 继续燃脂 |
| 第5天 | 低碳日 | 1g/kg | 深度燃脂 |
| 第6天 | 高碳日 | 3g/kg | 补充糖原，防止代谢下降 |

---

## ✨ 功能特点

### 🎯 智能计算引擎
- 基于体重、体脂率、性别自动计算营养素需求
- 112113 六天循环模式
- 动态调整蛋白质和脂肪比例

### 📊 主仪表板 (Dashboard)
- 实时显示当日碳水类型（低/中/高碳日）
- 环形进度图展示营养素完成度（碳水/蛋白质/脂肪/卡路里）
- 超标预警视觉反馈
- 动态显示计划第X天

### 📅 计划页面 (Plan)
- 六天周期日历视图
- 周期导航（查看历史/未来周期）
- 彩色碳水类型卡片（低碳绿/中碳黄/高碳红）
- 点击查看每日营养详情
- 周期统计（完成/达标/超标）

### 📈 统计页面 (Stats)
- 体重/体脂率趋势图 (recharts)
- 时间筛选（7天/30天/全部）
- 历史记录列表
- 数据补录功能

### 🔐 用户系统
- Cookie-based 轻量认证
- 多用户数据完全隔离
- 用户引导页（首次设置）

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14+ (App Router) |
| 语言 | TypeScript 5 (严格模式) |
| 样式 | Tailwind CSS 4 |
| 数据库 | PostgreSQL (Neon Serverless) |
| ORM | Prisma 7 |
| 图表 | Recharts |
| 部署 | Vercel |

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库（推荐 [Neon](https://neon.tech)）

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/tumusumu/ccycle.git
cd ccycle

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入数据库连接字符串

# 4. 同步数据库
npx prisma db push

# 5. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 开始使用。

---

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── user/                 # 用户接口
│   │   ├── plan/                 # 饮食方案接口
│   │   ├── intake/               # 摄入记录接口
│   │   ├── body-metrics/         # 身体指标接口
│   │   └── goals/                # 目标接口
│   ├── dashboard/                # 主仪表板
│   ├── plan/                     # 计划页面
│   ├── stats/                    # 统计页面
│   ├── onboarding/               # 用户引导
│   └── login/                    # 登录页面
├── components/
│   ├── layout/                   # 布局组件
│   ├── ui/                       # 通用 UI 组件
│   ├── plan/                     # 计划相关组件
│   └── metrics/                  # 指标相关组件
├── lib/                          # 核心库
│   ├── prisma.ts                 # Prisma 客户端
│   ├── auth.ts                   # 认证工具
│   └── nutrition-calculator.ts   # 营养计算器
├── utils/                        # 工具函数
│   ├── carbon-cycle.ts           # 碳循环计算核心
│   ├── date.ts                   # 日期处理
│   └── bmi.ts                    # BMI 计算
├── types/                        # TypeScript 类型
├── context/                      # React Context
└── hooks/                        # 自定义 Hooks
```

---

## 🎨 设计系统

### 核心色彩
| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 | 蓝色 | `#4A90D9` |
| 碳水 | 暖黄 | `#F5C542` |
| 蛋白质 | 粉色 | `#E8A0BF` |
| 脂肪 | 薄荷绿 | `#A8D5BA` |
| 卡路里 | 橙色 | `#FF8C42` |

### 碳水类型配色
| 类型 | 背景色 | 文字色 |
|------|--------|--------|
| 低碳日 | `#E8F5E9` | `#2E7D32` |
| 中碳日 | `#FFF8E1` | `#F57C00` |
| 高碳日 | `#FFEBEE` | `#C62828` |

---

## 📋 API 接口

### 用户
- `GET /api/user` - 获取当前用户
- `POST /api/user` - 创建用户
- `PUT /api/user` - 更新用户

### 饮食方案
- `GET /api/plan/current` - 获取当前方案
- `GET /api/daily-plan/today` - 获取今日方案

### 身体指标
- `GET /api/body-metrics` - 获取指标列表
- `POST /api/body-metrics` - 添加指标记录
- `GET /api/body-metrics/trends` - 获取趋势数据

### 摄入记录
- `GET /api/intake/today` - 获取今日摄入
- `POST /api/intake` - 添加摄入记录

---

## 📝 开发规范

### 命名约定
- **组件**: PascalCase (`DayCell.tsx`)
- **文件**: kebab-case (`day-cell.tsx`)
- **类型/接口**: `I` 前缀 (`IUserProfile`)
- **常量**: UPPER_SNAKE_CASE

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
chore: 构建/配置
```

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**用科学的方法，遇见更好的自己 💪**

[GitHub](https://github.com/tumusumu/ccycle) • [在线体验](https://ccycle.vercel.app)

</div>
