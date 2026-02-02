# 碳循112 (CCycle)

<div align="center">

**智能碳水循环饮食计算与跟踪系统**

一款基于科学碳水循环方法论的营养管理应用，帮助用户精准制定个性化饮食方案并追踪每日营养摄入。

[功能特点](#功能特点) • [快速开始](#快速开始) • [技术栈](#技术栈) • [项目结构](#项目结构) • [开发路线图](#开发路线图)

</div>

---

## 📖 项目简介

**碳循112** 是一款专注于碳水循环饮食管理的 Web 应用。基于"112/113"碳循环模式，根据用户的体重、体脂率和性别，自动计算每日所需的碳水化合物、蛋白质和脂肪摄入量，并提供详细的饮食方案和营养追踪功能。

### 什么是碳水循环？

碳水循环是一种通过周期性调整碳水化合物摄入量来优化身体代谢的饮食策略：
- **低碳日 (1g/kg)**: 促进脂肪燃烧
- **中碳日 (2g/kg)**: 平衡代谢
- **高碳日 (3g/kg)**: 补充糖原，防止代谢下降

---

## ✨ 功能特点

### 🎯 智能计算引擎
- 基于体重、体脂率、性别自动计算营养素需求
- 支持 112/113 两种碳循环模式
- 动态调整蛋白质和脂肪比例

### 📊 每日饮食方案
- 自动生成 4 餐食谱（早/午/加餐/晚）
- 实时显示当日碳水类型（低/中/高碳日）
- 智能标注限制食物（水果、白面等）

### 📈 营养追踪系统
- 可视化环形图展示营养素完成度
- 逐餐打卡记录
- 饮水量追踪（4L+ 目标）

### 🏋️ 运动指导
- 根据碳水日类型提供运动建议
- 有氧与力量训练时间规划

### 📱 友好的用户体验
- 温和柔美的色彩系统
- 卡片化布局
- 移动端适配

---

## 🛠️ 技术栈

### 核心框架
- **Next.js 14+** - App Router + 服务端组件
- **TypeScript 5** - 严格模式，类型安全
- **React 19** - 最新特性支持

### 样式与UI
- **Tailwind CSS 4** - 原子化CSS
- **响应式设计** - 移动优先

### 数据层
- **PostgreSQL** - 关系型数据库
- **Prisma ORM** - 类型安全的数据访问
- **Neon Serverless** - 云端 PostgreSQL

### 部署
- **Vercel** - 零配置部署

---

## 🔐 用户认证机制

项目采用轻量级的 Cookie-based 用户认证方案，实现多用户数据隔离。

### 认证流程

```
用户注册 → 设置 Cookie (ccycle_user_id) → 后续请求自动携带 → 服务端验证
```

### 核心组件

| 组件 | 路径 | 说明 |
|------|------|------|
| 认证工具 | `src/lib/auth.ts` | 服务端认证函数 |
| 用户 Hook | `src/hooks/use-current-user.ts` | 客户端用户状态管理 |
| 登录页面 | `src/app/login/page.tsx` | 用户名登录入口 |

### 认证函数

```typescript
// 服务端获取当前用户
import { getCurrentUser, getCurrentUserId } from '@/lib/auth';

// 在 API 路由中使用
const user = await getCurrentUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 数据隔离

- 所有 API 路由通过 `getCurrentUser()` 获取当前用户
- 数据查询自动绑定 `userId` 条件
- localStorage key 包含用户 ID，避免数据混淆
- 不同用户之间数据完全隔离

### Cookie 配置

```typescript
{
  name: 'ccycle_user_id',
  path: '/',
  maxAge: 365 * 24 * 60 * 60,  // 1 年有效期
  sameSite: 'lax'
}
```

---

## 🚀 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 数据库（或 Neon Serverless）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/tumusumu/ccycle.git
cd ccycle
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

复制 `.env.example` 为 `.env` 并填入实际值：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/ccycle"

# 应用配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **初始化数据库**
```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# (可选) 填充测试数据
npx prisma db seed
```

5. **启动开发服务器**
```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 📁 项目结构

```
ccycle/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 路由
│   │   │   ├── user/           # 用户接口
│   │   │   ├── plan/           # 饮食方案接口
│   │   │   └── intake/         # 摄入记录接口
│   │   ├── onboarding/         # 用户引导
│   │   ├── dashboard/          # 主仪表板
│   │   ├── plan/               # 饮食方案页
│   │   └── log/                # 饮食记录页
│   ├── components/             # React 组件
│   │   ├── layout/             # 布局组件
│   │   ├── ui/                 # 通用 UI 组件
│   │   ├── user-profile/       # 用户信息组件
│   │   ├── daily-plan/         # 饮食方案组件
│   │   └── nutrition-tracker/  # 营养追踪组件
│   ├── context/                # React Context
│   ├── utils/                  # 工具函数
│   │   ├── carbon-cycle.ts     # 碳循环计算核心
│   │   ├── nutrition.ts        # 营养素计算
│   │   └── date.ts             # 日期处理
│   └── types/                  # TypeScript 类型
├── prisma/
│   └── schema.prisma           # 数据库 Schema
├── public/                     # 静态资源
├── CLAUDE.md                   # AI 开发文档
├── UI_DESIGN.md                # UI 设计规范
└── README.md                   # 本文件
```

---

## 🎨 设计系统

项目采用温和友好的健康类 APP 风格，详细设计规范请查看 [UI_DESIGN.md](./UI_DESIGN.md)。

### 核心色彩
- **主色**: `#4A90D9` (蓝色)
- **碳水**: `#F5C542` (暖黄)
- **蛋白质**: `#E8A0BF` (粉色)
- **脂肪**: `#A8D5BA` (薄荷绿)
- **饮水**: `#7EC8E3` (天蓝)

---

## 📋 开发路线图

### ✅ 已完成
- [x] 项目初始化
- [x] 技术栈选型
- [x] UI 设计规范
- [x] 数据库设计
- [x] 用户认证系统 (Cookie-based)
- [x] 多用户数据隔离
- [x] 用户引导页（体重/体脂率/性别输入）
- [x] 碳循环计算核心逻辑 (112113 六天循环)
- [x] 每日饮食方案生成
- [x] 饮食摄入记录与追踪
- [x] 身体指标跟踪系统 (体重/体脂率)
- [x] 主仪表板营养环形图 (含卡路里、超标预警)
- [x] /stats 统计页面 (recharts 趋势图)
- [x] /plan 计划页面 (六天周期视图)
- [x] 历史数据补录功能

### 🚧 进行中
- [ ] 运动记录功能增强

### 📅 计划中
- [ ] 用户偏好设置
- [ ] 导出报告功能
- [ ] 深色模式支持

---

## 📝 开发规范

### 编码约定
- **组件**: 函数组件 + Hooks，PascalCase 命名
- **文件名**: kebab-case (如 `daily-plan.tsx`)
- **类型/接口**: PascalCase，以 `I` 开头 (如 `IUserProfile`)
- **工具函数**: camelCase
- **常量**: UPPER_SNAKE_CASE
- **严格 TypeScript**: 禁止使用 `any`

### 提交规范
```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/配置相关
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- **项目地址**: [https://github.com/tumusumu/ccycle](https://github.com/tumusumu/ccycle)
- **问题反馈**: [GitHub Issues](https://github.com/tumusumu/ccycle/issues)

---

<div align="center">

**用科学的方法，遇见更好的自己 💪**

Made with ❤️ by CCycle Team

</div>
