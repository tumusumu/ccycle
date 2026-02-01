# CCycle 碳循112

> 碳循环饮食计算与跟踪APP，帮助用户制定个人碳水循环饮食方案，并追踪每日营养摄入。

---

## 项目信息
- **中文名:** 碳循112
- **英文名:** CCycle
- **英文域名/包名:** ccycle

---

## 技术栈
- **框架:** Next.js 14+ (App Router, src目录结构)
- **语言:** TypeScript (严格模式, 不允许 any)
- **样式:** Tailwind CSS
- **数据库:** PostgreSQL + Prisma ORM
- **状态管理:** React Context (初期), 后期可迁移至 Zustand
- **部署:** Vercel

---

## 目录结构规范
```
src/
├── app/                      # Next.js App Router 页面
│   ├── api/                  # API 路由
│   │   ├── user/             # 用户相关接口
│   │   ├── plan/             # 饮食方案接口
│   │   └── intake/           # 摄入记录接口
│   ├── onboarding/           # 用户引导（首次设置）
│   ├── dashboard/            # 主仪表板
│   ├── plan/                 # 饮食方案页面
│   └── log/                  # 饮食记录页面
├── components/               # 组件
│   ├── layout/               # 布局组件 (Header, Sidebar, Footer)
│   ├── ui/                   # 通用UI组件 (Button, Card, Input...)
│   ├── user-profile/         # 用户信息相关组件
│   ├── daily-plan/           # 每日饮食方案组件
│   └── nutrition-tracker/    # 营养摄入跟踪组件
├── context/                  # React Context (全局状态)
├── utils/                    # 工具函数
│   ├── carbon-cycle.ts       # 核心：碳循环计算逻辑
│   ├── nutrition.ts          # 营养素计算
│   └── date.ts               # 日期处理工具
└── types/                    # TypeScript 类型定义
    ├── user.ts               # 用户类型
    ├── nutrition.ts          # 营养素类型
    └── plan.ts               # 饮食方案类型
```

---

## 编码规范
- 组件：函数组件 + Hooks，命名用 PascalCase
- 文件名：kebab-case (如 `daily-plan.tsx`)
- 接口/类型名：PascalCase，以 `I` 开头 (如 `IUserProfile`)
- 工具函数：camelCase
- 常量：UPPER_SNAKE_CASE
- 严格使用 TypeScript 类型，禁止 `any`
- 组件必须导出类型清晰的 props 接口

---

## 核心业务逻辑（碳循环方法论）

### 1. 碳水循环模式
- **循环模式:** "112" 或 "113"
  - 112 = 每周：低低中高（4低1中1高，即低碳日占主导）
  - 113 = 每周：低低中高（低碳日更少比例）
- **每公斤体重碳水摄入量:**
  - 低碳日: 1g/kg
  - 中碳日: 2g/kg
  - 高碳日: 3g/kg
- 碳水每天至少分 **3次** 摄入
- 前1-1.5月：不吃水果、不吃白面。早餐燕麦，其余米饭。

### 2. 蛋白质（全程固定，不随碳水变化）
| 体脂率 | 男性 (g/kg) | 女性 (g/kg) |
|--------|-------------|-------------|
| ≥ 30%  | 1.0         | 0.7-0.8     |
| ≈ 25%  | 1.5         | 1.5         |
| ≤ 20%  | 2.0         | 2.0         |
| ≤ 15%  | 2.5         | 2.5         |

- 每天分 **4次** 摄入

### 3. 脂肪（与碳水互补）
| 碳水类型 | 脂肪摄入 |
|----------|----------|
| 低碳日   | 体脂≥30%: 男0.7g/kg, 女0.6g/kg; 体脂20-23%: 约1g/kg |
| 中碳日   | 上限 0.5g/kg |
| 高碳日   | 尽量零脂（去皮鸡腿、蛋白可以） |

### 4. 饮食时间规则
- 餐间间隔: 最短3小时，最长4.5小时
- 不运动时可拉长至5小时
- 饮水: 85kg以下每天4升，85kg以上4升以上

### 5. 运动指南（简要）
- 力量训练: 缩短组间休息来增加强度
- 有氧: 低/中碳日每天最多2次，高碳日练后20分钟或不做
- 减脂周期: 7-13天一个小生理周期

---

## 命令手册
```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # 代码检查
npx prisma generate  # 生成 Prisma Client
npx prisma migrate   # 运行数据库迁移
```

---

## 当前开发状态
- [x] 项目初始化
- [ ] 数据库设计与迁移
- [ ] 用户引导页（输入体重/体脂率/性别）
- [ ] 碳循环计算核心逻辑
- [ ] 每日饮食方案生成
- [ ] 饮食摄入记录与追踪
- [ ] 仪表板与数据展示
