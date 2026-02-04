# CCycle 碳循112

> 碳循环饮食计算与跟踪APP，移动端优先设计，帮助用户制定个人碳水循环饮食方案，并追踪每日营养摄入。

---

## 项目信息
- **中文名:** 碳循112
- **英文名:** CCycle
- **英文域名/包名:** ccycle
- **设计理念:** 移动端优先，PWA 支持，简洁直观

---

## 技术栈
- **框架:** Next.js 14+ (App Router, src目录结构)
- **语言:** TypeScript (严格模式, 不允许 any)
- **样式:** Tailwind CSS 4
- **数据库:** PostgreSQL (Neon Serverless) + Prisma ORM
- **认证:** bcrypt + Cookie-based (30天有效期)
- **状态管理:** React Context
- **图表:** Recharts
- **PWA:** Service Worker + Web App Manifest
- **图标:** lucide-react
- **部署:** Vercel

---

## 目录结构规范
```
src/
├── app/                      # Next.js App Router 页面
│   ├── api/                  # API 路由
│   │   ├── auth/             # 认证接口
│   │   │   ├── login/        # 登录
│   │   │   └── register/     # 注册
│   │   ├── user/             # 用户相关接口
│   │   ├── plan/             # 饮食方案接口
│   │   ├── intake/           # 摄入记录接口
│   │   ├── body-metrics/     # 身体指标接口
│   │   └── goals/            # 目标接口
│   ├── register/             # 注册页面
│   ├── login/                # 登录页面
│   ├── onboarding/           # 用户引导（个人信息完善）
│   ├── dashboard/            # 主仪表板
│   ├── plan/                 # 计划页面
│   ├── stats/                # 统计页面
│   └── layout.tsx            # 根布局（包含PWA配置）
├── components/               # 组件
│   ├── layout/               # 布局组件
│   │   ├── header.tsx        # 顶部导航
│   │   ├── bottom-nav.tsx    # 底部Tab导航（移动端）
│   │   └── page-container.tsx # 页面容器
│   ├── ui/                   # 通用UI组件 (Button, Card, Input...)
│   ├── plan/                 # 计划相关组件
│   ├── metrics/              # 指标相关组件
│   └── nutrition/            # 营养追踪组件
├── context/                  # React Context (全局状态)
├── utils/                    # 工具函数
│   ├── carbon-cycle.ts       # 核心：碳循环计算逻辑
│   ├── nutrition.ts          # 营养素计算
│   └── date.ts               # 日期处理工具
├── lib/                      # 核心库
│   ├── prisma.ts             # Prisma 客户端
│   ├── auth.ts               # 认证工具
│   └── nutrition-calculator.ts # 营养计算器
├── types/                    # TypeScript 类型定义
│   ├── user.ts               # 用户类型
│   ├── nutrition.ts          # 营养素类型
│   └── plan.ts               # 饮食方案类型
└── hooks/                    # 自定义 Hooks
    └── use-current-user.ts   # 用户状态管理

public/
├── manifest.json             # PWA Manifest
├── sw.js                     # Service Worker
├── icon-192.png              # PWA 图标 192x192
└── icon-512.png              # PWA 图标 512x512
```

---

## 编码规范

### 命名约定
- **组件**：函数组件 + Hooks，命名用 PascalCase (`BottomNav`)
- **文件名**：kebab-case (如 `bottom-nav.tsx`)
- **接口/类型名**：PascalCase，以 `I` 开头 (如 `IUserProfile`)
- **工具函数**：camelCase (`formatDate`)
- **常量**：UPPER\_SNAKE\_CASE (`CYCLE_LENGTH`)
- **CSS类名**：kebab-case, 使用 Tailwind 工具类

### TypeScript 规范
- 严格使用 TypeScript 类型，禁止 `any`
- 组件必须导出类型清晰的 props 接口
- API 响应使用明确的类型定义
- 使用 `interface` 定义对象类型，`type` 定义联合类型

### React 规范
- 使用函数组件，不使用 class 组件
- 优先使用 React Hooks
- 使用 `'use client'` 标记客户端组件
- 避免在组件内部定义组件

### 移动端开发规范
- **触摸区域**：所有可交互元素最小 44x44px
- **字体大小**：基础 16px，标题 18-24px，不小于 14px
- **间距系统**：使用 Tailwind 的间距（4px 基准）
- **响应式**：默认移动端布局，使用 `sm:` `md:` `lg:` 适配大屏
- **性能优化**：避免过度使用阴影和透明度，影响滚动性能

---

## 核心业务逻辑（碳循环方法论）

### 1. 碳水循环模式
- **循环模式:** "112113" 六天循环
  - 第1天：低碳日（1g/kg）
  - 第2天：低碳日（1g/kg）
  - 第3天：中碳日（2g/kg）
  - 第4天：低碳日（1g/kg）
  - 第5天：低碳日（1g/kg）
  - 第6天：高碳日（3g/kg）
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

## 用户认证系统

### 注册流程
1. 用户访问 `/register` 页面
2. 填写表单：
   - 用户名（3-20字符，字母数字下划线）
   - 密码（至少6字符）
   - 确认密码
3. 实时验证：
   - 用户名格式和可用性检查
   - 密码强度指示器
   - 确认密码一致性
4. 提交注册 → 调用 `/api/auth/register`
5. 密码使用 bcrypt 加密（10轮盐值）
6. 创建用户记录（临时默认值）
7. 设置用户ID到客户端状态
8. 自动跳转到 `/onboarding` 完善个人信息

### 登录流程
1. 用户访问 `/login` 页面
2. 填写用户名和密码
3. 提交登录 → 调用 `/api/auth/login`
4. 服务端验证：
   - 查找用户
   - bcrypt 比对密码
5. 验证成功 → 设置 HttpOnly Cookie（30天）
6. 跳转到 `/dashboard`

### Cookie 配置
```typescript
{
  httpOnly: true,                          // 防止 XSS
  secure: process.env.NODE_ENV === 'production',  // HTTPS only
  sameSite: 'lax',                         // 防止 CSRF
  maxAge: 60 * 60 * 24 * 30,               // 30天
}
```

### 个人信息完善流程
1. 注册后自动进入 `/onboarding`
2. 显示"欢迎，[用户名]！"
3. 填写：出生年份、性别、体重、体脂率
4. 提交 → 调用 `PUT /api/user` 更新信息
5. 跳转到 `/plan/new` 创建碳循环计划

---

## PWA 配置

### Manifest.json 配置
```json
{
  "name": "CCycle - 碳水循环追踪",
  "short_name": "CCycle",
  "description": "智能碳水循环营养追踪应用",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Layout.tsx PWA Meta 标签
```tsx
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="theme-color" content="#4F46E5" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="CCycle" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
</head>
```

### Service Worker 策略
- 缓存关键资源（/、/login、/dashboard）
- 网络优先策略
- 离线页面支持

---

## 移动端设计系统

### 布局组件

#### BottomNav（底部导航栏）
```tsx
// 固定在底部的Tab导航
// 3个主要入口：今日、日历、我的
// 支持iOS安全区域（safe-area-inset-bottom）
// 活跃状态用主色高亮

<BottomNav />
```

#### PageContainer（页面容器）
```tsx
// 预留底部导航空间
// 统一的内边距和最大宽度
// 移动端优化的滚动性能

<PageContainer>
  {children}
</PageContainer>
```

### CSS 工具类

```css
/* iOS 安全区域支持 */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 主内容区域（预留底部导航空间） */
.main-content {
  padding-bottom: calc(4rem + env(safe-area-inset-bottom));
}
```

### 触摸优化规范
- 按钮最小尺寸：`min-w-[60px] min-h-[48px]`
- 列表项最小高度：`min-h-[44px]`
- 图标可点击区域：`p-2`（至少8px内边距）
- 间距系统：4px 基准（使用 Tailwind 的 `space-*` 和 `gap-*`）

---

## 命令手册
```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run lint         # 代码检查
npm run start        # 启动生产服务器

# 数据库
npx prisma generate  # 生成 Prisma Client
npx prisma migrate dev --name <name>  # 创建迁移
npx prisma migrate reset  # 重置数据库（开发）
npx prisma studio    # 打开数据库 GUI
npx prisma db push   # 快速同步（开发）

# Git
git status           # 查看状态
git add .            # 暂存所有
git commit -m "msg"  # 提交
git push             # 推送
```

---

## 当前开发状态

### ✅ v1.0.0 MVP - 已完成并准备发布

#### 核心功能
- [x] 项目初始化
- [x] 数据库设计与迁移
- [x] 用户注册系统（标准流程 + 实时验证）
- [x] 用户登录系统（密码验证 + bcrypt 加密）
- [x] **用户数据完全隔离**（双重 cookie 机制 + 注册自动登录）
- [x] 用户引导页（个人信息完善）
- [x] 碳循环计算核心逻辑（112113模式）
- [x] 每日饮食方案生成
- [x] 饮食摄入记录与追踪（4餐）
- [x] 仪表板与数据展示
- [x] 身体指标追踪
- [x] 目标管理系统
- [x] 运动记录（力量训练 + 有氧训练）
- [x] 移动端PWA优化
- [x] 底部Tab导航
- [x] iOS安全区域适配
- [x] 响应式设计
- [x] 营养搜索功能（USDA API）
- [x] 深色模式支持（浅色/深色/跟随系统）

#### v1.0.0 重点新增
- [x] **历史记录补充录入**
  - 完整的历史记录页面（`/history/[date]`）
  - 历史记录 API（`/api/intake-history/[date]`）
  - 支持补充所有餐食和运动记录
  - 日历页面正确加载和显示历史数据
- [x] **控糖打卡（第一个月专属）**
  - 三项控糖指标：🍎 没有吃水果 / 🍬 没有吃糖 / 🍞 没有吃白面
  - 数据同步到 DailyIntakeRecord 表
  - 日历 Modal 显示打卡状态
  - 历史记录页面可打卡
- [x] **数据隔离修复**
  - 双重 cookie 策略（httpOnly + 客户端可读）
  - 注册后自动登录
  - 客户端从 cookie 读取 userId
  - 登出清除所有 cookie 和 localStorage
  - 所有 API 正确验证用户

#### 生产就绪
- [x] 生产构建测试通过（42个路由）
- [x] TypeScript 类型检查通过
- [x] Card 组件类型修复（onClick 支持）
- [x] Suspense boundary 修复
- [x] 代码已推送到 GitHub（commit: dbf37a6）
- [x] 完整文档（部署清单、数据隔离验证）
- 🚀 **准备部署到 Vercel**

### 进行中 🚧
- [ ] 其他餐食页面历史日期支持（午餐/加餐/晚餐）
- [ ] 营养搜索功能增强

### 计划中 📋（v1.1.0+）
- [ ] 消息推送功能
- [ ] 社交分享功能
- [ ] 多语言支持（英文）
- [ ] 数据导出（CSV/PDF）
- [ ] 单元测试覆盖
- [ ] E2E 测试

---

## 安全注意事项

### 密码安全
- ✅ 使用 bcrypt 加密（10轮盐值）
- ✅ 密码最小长度验证（6字符）
- ✅ 前端密码强度提示
- ✅ 密码不以明文传输或存储
- ❌ 不要在日志中记录密码
- ❌ 不要在错误信息中暴露密码

### Cookie 安全
- ✅ HttpOnly：防止 XSS 攻击
- ✅ SameSite=Lax：防止 CSRF 攻击
- ✅ Secure（生产环境）：仅 HTTPS 传输
- ❌ 不要在 Cookie 中存储敏感信息
- ❌ 定期检查 Cookie 过期时间

### API 安全
- ✅ 所有 API 都进行身份验证
- ✅ 输入验证和清理
- ✅ 错误信息不暴露系统细节
- ❌ 不要在客户端存储 API 密钥
- ❌ 避免在 URL 中传递敏感参数

---

## 常见问题

### Q: 如何重置数据库？
```bash
npx prisma migrate reset
```

### Q: 如何创建新的数据库迁移？
```bash
# 1. 修改 prisma/schema.prisma
# 2. 运行迁移命令
npx prisma migrate dev --name <迁移名称>
```

### Q: 如何测试移动端？
1. 使用 Chrome DevTools 设备模拟器
2. 或在真实移动设备上访问开发服务器
3. 确保电脑和手机在同一网络

### Q: 忘记密码怎么办？
当前版本暂无找回密码功能，可以：
1. 直接在数据库中更新密码（使用 bcrypt.hash 生成）
2. 或重新注册新账号

---

## 性能优化清单

- [x] Next.js Image 组件优化图片
- [x] 按路由代码分割
- [x] Tailwind CSS JIT 模式
- [x] Service Worker 缓存
- [ ] React.memo 优化重渲染
- [ ] useMemo/useCallback 优化计算
- [ ] 虚拟滚动（长列表）
- [ ] 图片懒加载

---

## 参考文档
- UI设计规范参考 `UI_DESIGN.md`
- 开发进度参考 `progress.md`
- 项目说明参考 `README.md`
