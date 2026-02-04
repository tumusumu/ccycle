# 碳循112 (ccycle)

<div align="center">

**智能碳水循环饮食计算与跟踪系统**

基于科学的 112113 碳水循环方法论，帮助用户精准制定个性化饮食方案并追踪每日营养摄入。

📱 **移动端优化** | 🔐 **完整认证系统** | 🎯 **精准营养计算**

[在线体验](https://ccycle.vercel.app) • [功能特点](#-功能特点) • [快速开始](#-快速开始) • [技术栈](#-技术栈)

</div>

---

## 📖 项目简介

**碳循112** 是一款专注于碳水循环饮食管理的移动端优先 Web 应用。采用 **112113 六天循环模式**（低-低-中-低-低-高），根据用户的体重、体脂率和性别，自动计算每日所需的碳水化合物、蛋白质和脂肪摄入量。

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

### 📱 移动端优化（PWA）
- **渐进式 Web 应用**：支持添加到主屏幕，离线访问
- **响应式设计**：完美适配各种移动设备屏幕
- **触摸优化**：所有可点击元素最小 44x44px 触摸区域
- **iOS 安全区域支持**：适配刘海屏和底部指示器
- **底部导航栏**：符合移动端习惯的 Tab 导航
- **流畅动画**：原生级的交互体验
- **深色模式**：支持浅色/深色/跟随系统三种模式

### 🔐 完整认证系统
- **标准注册流程**：用户名 + 密码 + 确认密码
- **实时验证**：
  - 用户名格式检查和可用性实时检测
  - 密码强度指示器（弱/中等/强）
  - 密码一致性检查
- **安全存储**：bcrypt 加密存储密码（10轮盐值）
- **双重 Cookie 认证**：HttpOnly + 客户端可读，30天有效期
- **数据完全隔离**：每个用户数据独立存储，安全可靠
- **用户引导**：注册后自动进入个人信息完善流程

### 🎯 智能计算引擎
- 基于体重、体脂率、性别自动计算营养素需求
- 112113 六天循环模式
- 动态调整蛋白质和脂肪比例

### 📊 主仪表板 (Dashboard)
- 实时显示当日碳水类型（低/中/高碳日）
- 环形进度图展示营养素完成度（碳水/蛋白质/脂肪/卡路里）
- 超标预警视觉反馈
- 动态显示计划第X天
- 快速访问今日餐食和运动记录

### 📅 计划页面 (Plan)
- 六天周期日历视图
- 周期导航（查看历史/未来周期）
- 彩色碳水类型卡片（低碳绿/中碳黄/高碳红）
- 专业 SVG 营养状态图标（达标/超标/不足）
- 点击查看每日营养详情弹窗（含控糖打卡状态）
- 周期统计卡片（渐变背景/进度条/激励文案）
- 未记录日期智能识别（灰色无数据状态）
- **历史记录补充**：一键跳转补充过往任何一天的完整记录

### 📈 统计页面 (Stats)
- 体重/体脂率趋势图 (recharts)
- 时间筛选（7天/30天/全部）
- 历史记录列表
- 数据补录功能

### 👤 个人中心
- 用户信息展示
- 目标管理
- 数据统计概览
- 主题切换（深色模式）

### 🎯 控糖打卡（第一个月专属）
- **三项控糖指标**：
  - 🍎 没有吃水果
  - 🍬 没有吃糖
  - 🍞 没有吃白面
- 每日打卡记录，培养健康饮食习惯
- 历史记录可查看和补充
- 视觉化打卡状态展示

---

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14+ (App Router) |
| 语言 | TypeScript 5 (严格模式) |
| 样式 | Tailwind CSS 4 |
| 数据库 | PostgreSQL (Neon Serverless) |
| ORM | Prisma 7 |
| 认证 | bcrypt + Cookie-based |
| 图表 | Recharts |
| 部署 | Vercel |
| PWA | Service Worker + Manifest |

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

# 4. 添加密码字段到数据库
# 确保 prisma/schema.prisma 中 User 模型包含 password 字段

# 5. 同步数据库
npx prisma migrate reset  # 重置数据库（开发环境）
# 或
npx prisma migrate dev --name add_password  # 生产环境

# 6. 生成 Prisma Client
npx prisma generate

# 7. 启动开发服务器
npm run dev
```

打开 http://localhost:3000 开始使用。

---

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证接口
│   │   │   ├── login/            # 登录
│   │   │   └── register/         # 注册
│   │   ├── user/                 # 用户接口
│   │   ├── plan/                 # 饮食方案接口
│   │   ├── intake/               # 摄入记录接口
│   │   ├── body-metrics/         # 身体指标接口
│   │   └── goals/                # 目标接口
│   ├── dashboard/                # 主仪表板
│   ├── plan/                     # 计划页面
│   ├── stats/                    # 统计页面
│   ├── register/                 # 注册页面（新增）
│   ├── login/                    # 登录页面
│   ├── onboarding/               # 个人信息完善
│   ├── layout.tsx                # 根布局（PWA 配置）
│   └── page.tsx                  # 首页重定向
├── components/
│   ├── layout/                   # 布局组件
│   │   ├── header.tsx            # 顶部导航
│   │   ├── bottom-nav.tsx        # 底部导航栏
│   │   └── page-container.tsx    # 页面容器
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
├── hooks/                        # 自定义 Hooks
└── public/                       # 静态资源
    ├── manifest.json             # PWA Manifest
    ├── sw.js                     # Service Worker
    ├── icon-192.png              # PWA 图标
    └── icon-512.png              # PWA 图标
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

### 移动端设计原则
- **触摸优先**：所有交互元素至少 44x44px
- **清晰层级**：使用阴影和间距区分内容层级
- **简洁直观**：单列布局，避免横向滚动
- **快速加载**：优化图片和资源加载
- **流畅动画**：使用 CSS transitions，避免卡顿

---

## 📋 API 接口

### 认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 用户
- `GET /api/user` - 获取当前用户
- `POST /api/user` - 创建用户（已弃用，使用注册接口）
- `PUT /api/user` - 更新用户信息

### 饮食方案
- `GET /api/plan/current` - 获取当前方案
- `GET /api/daily-plan/today` - 获取今日方案

### 身体指标
- `GET /api/body-metrics` - 获取指标列表
- `POST /api/body-metrics` - 添加指标记录
- `GET /api/body-metrics/trends` - 获取趋势数据

### 摄入记录
- `GET /api/intake/today` - 获取今日摄入
- `PUT /api/intake/today` - 更新今日摄入
- `GET /api/intake-history/[date]` - 获取历史记录
- `PUT /api/intake-history/[date]` - 更新历史记录（含控糖打卡）
- `POST /api/intake` - 添加摄入记录

---

## 🔐 安全特性

### 密码安全
- **bcrypt 加密**：使用 10 轮盐值
- **强度验证**：前端实时提示密码强度
- **最小长度**：密码至少 6 个字符
- **确认机制**：注册时需要确认密码

### 认证机制
- **双重 Cookie 策略**：
  - `ccycle_user_id` (HttpOnly)：服务端认证，防止 XSS 攻击
  - `ccycle_user_id_client`：客户端 localStorage key 生成
- **SameSite Lax**：防止 CSRF 攻击
- **30 天有效期**：长期保持登录状态
- **服务端验证**：所有 API 使用 `getCurrentUser()` 验证
- **注册自动登录**：注册成功后自动设置认证 cookie

### 用户隐私
- **数据完全隔离**：
  - 营养摄入记录按用户隔离
  - 运动记录按用户隔离
  - 控糖打卡按用户隔离
  - 所有数据通过 userId 关联
- **Cookie-based**：轻量级认证，无需 JWT
- **密码不可逆**：使用 bcrypt 单向加密算法
- **级联删除**：删除用户时自动清理所有关联数据

---

## 📱 PWA 特性

### 安装体验
- **添加到主屏幕**：支持 iOS 和 Android
- **全屏显示**：standalone 模式
- **自定义图标**：192x192 和 512x512 尺寸
- **主题色**：统一品牌色 `#4F46E5`

### 离线能力
- **Service Worker**：缓存关键资源
- **离线页面**：网络断开时显示友好提示
- **渐进增强**：核心功能优先加载

### 性能优化
- **图片懒加载**：使用 Next.js Image 组件
- **代码分割**：按路由自动分割
- **缓存策略**：静态资源长期缓存
- **压缩优化**：Vercel 自动压缩

---

## 📝 开发规范

### 命名约定
- **组件**: PascalCase (`BottomNav.tsx`)
- **文件**: kebab-case (`bottom-nav.tsx`)
- **类型/接口**: `I` 前缀 (`IUserProfile`)
- **常量**: UPPER_SNAKE_CASE

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
chore: 构建/配置
```

### 移动端开发注意事项
1. **测试多设备**：iPhone SE、iPhone 12 Pro、Pixel 5
2. **触摸区域**：确保最小 44x44px
3. **字体大小**：基础字号 16px，避免小于 14px
4. **滚动性能**：避免过度使用阴影和透明度
5. **输入体验**：使用正确的 inputMode 和 autoComplete

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

**用科学的方法，遇见更好的自己 💪**

[GitHub](https://github.com/tumusumu/ccycle) • [在线体验](https://ccycle.vercel.app)

</div>
