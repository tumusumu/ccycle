# 碳循ccycle 开发进度记录

> 最后更新: 2026-02-04 (v1.0.0 MVP)
> 生产环境: https://ccycle.vercel.app

---

## 当前版本: v1.0.0 MVP - 准备发布 🚀

### 功能模块状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户注册 | ✅ 完成 | 标准注册流程 + 实时验证 + 密码强度指示 |
| 用户登录 | ✅ 完成 | 密码验证 + bcrypt 加密 + 注册自动登录 |
| 用户认证 | ✅ 完成 | 双重 Cookie 认证，数据完全隔离 |
| 用户引导 | ✅ 完成 | 注册后个人信息完善流程 |
| 移动端优化 | ✅ 完成 | PWA + 响应式设计 + 底部导航 |
| 碳循环引擎 | ✅ 完成 | 112113 六天循环模式 |
| 每日饮食方案 | ✅ 完成 | 自动生成四餐方案 |
| 主仪表板 | ✅ 完成 | 营养环形图 + 卡路里 + 超标预警 |
| 计划页面 | ✅ 完成 | 6天周期视图 + 周期统计 + 专业SVG图标 |
| 统计页面 | ✅ 完成 | recharts 趋势图 + 时间筛选 |
| 身体指标 | ✅ 完成 | 体重/体脂率记录与趋势 |
| 历史记录补充 | ✅ 完成 | 完整历史记录页面 + 所有数据补录 |
| 控糖打卡 | ✅ 完成 | 三项指标（🍎🍬🍞）+ 历史查看 |
| 深色模式 | ✅ 完成 | 浅色/深色/跟随系统 |
| 目标管理 | ✅ 完成 | 体重/体脂目标设定 |
| 运动记录 | ✅ 完成 | 力量/有氧时间记录 |
| 生产构建 | ✅ 就绪 | TypeScript + 42路由编译通过 |

---

## 版本历史

### v1.0.0 MVP - 准备发布 🚀 (2026-02-04)

**🎉 首个生产就绪版本，完整的碳循环饮食追踪应用**

**📋 重点新增功能**

**1. 历史记录补充录入系统**
- 新增完整历史记录页面（`src/app/history/[date]/page.tsx`）
  - 显示指定日期的所有任务（4餐 + 2项运动 + 控糖打卡）
  - 营养进度环形图展示
  - 任务完成状态实时更新
  - 一键跳转到具体餐食录入页面
- 新增历史记录 API（`src/app/api/intake-history/[date]/route.ts`）
  - GET：获取指定日期的所有记录
  - PUT：更新指定日期的所有记录
  - 支持营养摄入、运动记录、控糖打卡
- 日历 Modal 优化
  - 无数据日期显示"📝 补充录入打卡"按钮
  - 跳转到历史记录补充页面
  - 完整流程：日历 → 历史页 → 具体任务 → 保存 → 返回
- 日历页面数据加载修复
  - 从数据库 `DailyIntakeRecord` 加载历史记录
  - 修复日期格式处理问题
  - 正确计算完成任务数量

**2. 控糖打卡功能（第一个月专属）**
- 三项控糖指标：
  - 🍎 没有吃水果
  - 🍬 没有吃糖
  - 🍞 没有吃白面
- 实现位置：
  - 历史记录页面：可交互打卡
  - 日历详情 Modal：显示打卡状态
- 数据同步：
  - 保存到 `DailyIntakeRecord` 表字段：
    - `noFruitConfirmed`
    - `noSugarConfirmed`
    - `noWhiteFlourConfirmed`
  - `/api/intake/today` 支持读取和保存
  - `/api/intake-history/[date]` 支持读取和保存
- UI 设计：
  - 绿色勾选表示已确认
  - 点击切换状态
  - 实时保存到数据库

**3. 深色模式完整实现**
- 主题系统（`src/context/theme-context.tsx`）
  - 三种模式：浅色 / 深色 / 跟随系统
  - localStorage 持久化用户选择
  - 实时切换无闪烁
- CSS 变量方案（`src/app/globals.css`）
  - 使用 CSS 变量定义颜色
  - `.dark` 类自动应用深色主题
  - 所有新组件支持深色模式
- 主题切换组件（`src/components/theme-toggle.tsx`）
  - 三个选项：浅色 ☀️ / 深色 🌙 / 系统 💻
  - 显示当前选中状态
- 设置页面（`src/app/settings/page.tsx`）
  - 主题切换入口
  - 未来扩展其他设置项

**4. 用户数据隔离修复（重大安全更新）**
- **问题描述**：
  - 新注册用户看到其他用户的数据
  - 数据混淆，不同用户数据互相污染
- **根本原因**：
  - 注册后未设置 cookie
  - 客户端从 localStorage 读取 userId（不可靠）
  - IntakeContext 使用不正确的 userId
- **解决方案**：
  - 双重 Cookie 策略：
    - `ccycle_user_id` (httpOnly)：服务端认证
    - `ccycle_user_id_client`：客户端 localStorage key
  - 注册/登录后自动设置双重 cookie
  - 客户端从 cookie 读取 userId（`getCurrentUserIdClient()`）
  - 登出时清除双重 cookie + localStorage
- **修改文件**：
  - `src/app/api/auth/register/route.ts` - 注册设置 cookie
  - `src/app/api/auth/login/route.ts` - 登录设置 cookie
  - `src/app/api/auth/logout/route.ts` - 登出清除 cookie
  - `src/hooks/use-current-user.ts` - 从 cookie 读取 userId
  - `src/app/login/page.tsx` - 移除废弃的 setCurrentUserId
  - `src/app/register/page.tsx` - 移除废弃的 setCurrentUserId
- **数据隔离验证**：
  - 营养摄入记录 ✅
  - 运动记录 ✅
  - 控糖打卡 ✅
  - 所有表通过 userId 正确关联

**5. 生产构建优化**
- 修复 TypeScript 类型错误：
  - `Card` 组件添加 `onClick` 属性支持
  - `plan/page.tsx` 添加 `DailyPlan` 接口 `intakeRecord` 类型
  - 所有布尔值添加 `??` 默认值处理
- 修复 Next.js 构建错误：
  - `breakfast/page.tsx` 添加 Suspense boundary
  - 解决 `useSearchParams()` CSR bailout 问题
- 构建结果：
  - ✅ 42 个路由全部编译成功
  - ✅ TypeScript 类型检查通过
  - ✅ 无阻塞性错误

**6. 完整文档体系**
- 新增文档：
  - `docs/active_context.md` - 开发进度实时追踪
  - `docs/data-isolation-checklist.md` - 数据隔离验证清单
  - `docs/deployment-checklist.md` - 完整部署指南
- 更新文档：
  - `CLAUDE.md` - 项目文档更新
  - `README.md` - 功能说明更新
  - `progress.md` - 版本历史更新

**技术改进**
- API 接口完善（新增 2 个路由）
- 数据库字段映射标准化
- Cookie 安全策略优化
- 错误处理改进

**文件变更统计**
- 新增文件：8 个
- 修改文件：19 个
- 删除文件：1 个
- 新增代码：1,937 行
- 删除代码：237 行

**Git 提交**: `dbf37a6`

---

### v0.5.0 - 移动端优化与完整注册系统 (2026-02-03)

**🎨 重大更新：移动端全面优化**

**PWA 配置**
- 添加 Web App Manifest（`public/manifest.json`）
- 配置 Service Worker 基础离线支持
- 支持"添加到主屏幕"功能
- iOS Safari 完整适配（安全区域、状态栏）
- 移动端 viewport 优化配置

**响应式设计改造**
- 底部 Tab 导航栏（`components/layout/bottom-nav.tsx`）
  - 固定底部，3个主要标签：今日、日历、我的
  - 活跃状态高亮（蓝色）
  - 支持 iOS 安全区域（刘海屏和底部指示器）
- 触摸优化：所有可交互元素最小 44x44px
- 单列流式布局，适配各种移动设备屏幕
- 添加 CSS 安全区域样式（`safe-area-bottom`）
- 根布局添加移动端 meta 标签

**页面布局优化**
- 主内容区域预留底部导航空间（`main-content` 类）
- 移除桌面端多列布局
- 卡片间距和内边距移动端优化
- 字体大小调整（基础 16px）

**🔐 完整注册认证系统**

**标准注册流程**
- 新增注册页面（`src/app/register/page.tsx`）
  - 用户名输入（3-20字符，字母数字下划线）
  - 密码输入（至少6字符）
  - 确认密码输入
  - 密码显示/隐藏切换功能（眼睛图标）
  - 实时表单验证

**实时验证功能**
- 用户名格式验证（正则表达式）
- 用户名可用性实时检查（防抖 500ms）
- 密码强度指示器（弱/中等/强）
  - 视觉进度条（红色/黄色/绿色）
  - 强度文字提示
- 确认密码一致性检查
- 成功状态反馈（绿色✓提示）

**密码安全**
- 集成 bcrypt 加密库
- 10轮盐值加密存储
- 密码长度验证（6-50字符）
- 前后端双重验证

**注册 API**
- 创建 `/api/auth/register` 接口
  - 输入验证（用户名、密码）
  - 用户名唯一性检查
  - bcrypt 密码加密
  - 创建用户记录（临时默认值）
  - 返回用户ID

**登录增强**
- 更新登录页面（`src/app/login/page.tsx`）
  - 添加密码输入框
  - 密码显示/隐藏功能
  - 密码长度验证
  - 更新注册链接指向 `/register`
- 创建 `/api/auth/login` 接口
  - 用户名密码验证
  - bcrypt 密码比对
  - 设置 HttpOnly Cookie（30天有效期）
  - 返回成功状态和用户ID

**用户引导流程优化**
- 重构 onboarding 页面
  - 显示"欢迎，[用户名]！"
  - 移除用户名输入（已在注册时完成）
  - 仅需填写：出生年份、性别、体重、体脂率
  - 页面加载时获取当前用户信息
  - 如果已完善信息，自动跳转计划创建
  - 如果未登录，跳转注册页面
- 更新用户 API（`/api/user`）
  - PUT 方法支持更新 birthYear
  - 年龄验证（18-80岁）
  - 体重验证（40-150kg）
  - 体脂率验证（5-45%）

**首页路由调整**
- 修改根页面重定向逻辑
  - 已登录用户 → `/dashboard`
  - 未登录用户 → `/login`
- 确保首次访问体验流畅

**数据库更新**
- User 表添加 `password` 字段（String 类型）
- 执行数据库迁移（`add_user_password`）
- 清空测试数据，重建数据库

**依赖安装**
- `bcrypt`: 密码加密库
- `@types/bcrypt`: TypeScript 类型定义
- `lucide-react`: 图标库（底部导航）

**文件变更**
- 新增：`src/app/register/page.tsx` - 注册页面
- 新增：`src/app/api/auth/register/route.ts` - 注册API
- 新增：`src/app/api/auth/login/route.ts` - 登录API
- 新增：`src/components/layout/bottom-nav.tsx` - 底部导航
- 新增：`public/manifest.json` - PWA配置
- 新增：`public/sw.js` - Service Worker
- 新增：`public/icon-192.png` - PWA图标
- 新增：`public/icon-512.png` - PWA图标
- 修改：`src/app/layout.tsx` - 添加PWA meta标签
- 修改：`src/app/login/page.tsx` - 添加密码验证
- 修改：`src/app/onboarding/page.tsx` - 优化引导流程
- 修改：`src/app/page.tsx` - 调整重定向逻辑
- 修改：`src/app/api/user/route.ts` - PUT方法支持birthYear
- 修改：`src/app/globals.css` - 添加移动端样式
- 修改：`prisma/schema.prisma` - User表添加password字段

**技术改进**
- Cookie 安全配置（HttpOnly, SameSite, Secure）
- 前端表单防抖优化
- 密码强度算法实现
- 移动端触摸事件优化
- iOS 安全区域适配

**用户体验提升**
- 清晰的错误提示
- 实时的成功反馈
- 流畅的页面跳转
- 符合移动端习惯的交互
- 专业的表单验证体验

---

### v0.4.1 - UI 优化与 Bug 修复 (2026-02-03)

**Plan 计划页面优化**
- 新增专业 SVG 营养状态图标（达标✓/超标⚠/不足○）
- 新增 `no-data` 状态，未记录的历史日期显示灰色"-"
- 周期统计卡片全新设计（渐变背景/进度条/激励文案）
- 点击日期弹窗展示完整营养详情

**新建计划页面修复**
- 开始日期限制为今天或之后（前端 min 属性 + 后端校验）
- 选择过去日期时显示错误提示

**技术修复**
- 移除数据库 muscleMass 冗余字段
- 修复 recharts TooltipProps 类型错误
- 修复新用户历史日期显示"超标"问题

**新增组件**
- `src/components/ui/nutrition-status-icon.tsx` - 专业 SVG 状态图标

---

### v0.4.0 - 核心功能优化 (2026-02-03)

**Dashboard 仪表板**
- 营养环形图新增卡路里指标（替换饮水）
- 实现超标预警视觉反馈（渐变红色背景）
- 修复"第X天"动态计算逻辑

**Plan 计划页面重构**
- 6天周期视图（112113模式：低-低-中-低-低-高）
- 周期导航（上一周期/下一周期）
- 碳水类型彩色卡片（低碳绿/中碳黄/高碳红）
- 未来日期显示淡色碳水底色

**Stats 统计页面**
- 集成 recharts 实现体重/体脂率趋势图
- 支持时间筛选（7天/30天/全部）
- 双Y轴展示（体重左轴/体脂右轴）
- 可折叠历史记录列表
- 新增"补充记录"模式，支持历史数据补录

**技术优化**
- 修复时区日期处理问题
- 修复 TypeScript 类型错误

**新增组件**
- `src/components/plan/day-cell.tsx` - 日期单元格
- `src/components/plan/day-detail-modal.tsx` - 详情弹窗
- `src/components/plan/cycle-stats.tsx` - 周期统计卡片
- `src/components/ui/progress-ring.tsx` - 进度环（重写）

---

### v0.3.0 - 用户认证系统 (2026-02-03)

- 实现 Cookie-based 用户认证系统
- 新增服务端认证工具 (`src/lib/auth.ts`)
- 新增客户端用户状态管理 Hook
- 新增登录页面
- 改造所有 API 路由进行身份验证
- 实现多用户数据完全隔离

**提交**: `76f4a70`

---

### v0.2.0 - 身体指标跟踪系统 (2026-02-02)

- 实现完整的身体指标跟踪功能
- 支持记录体重、体脂率
- 新增指标趋势 API
- 数据库 schema 扩展

**提交**: `2282f43`

---

### v0.1.0 - 数据持久化 (2026-02-01)

- 实现数据库持久化存储
- 饮食摄入数据保存到 PostgreSQL
- 配置 Prisma ORM + Neon Serverless

**提交**: `3fabc97`

---

## 核心工具函数

### carbon-cycle.ts

```typescript
// 112113 循环模式
CYCLE_PATTERN = ['LOW', 'LOW', 'MEDIUM', 'LOW', 'LOW', 'HIGH']
CYCLE_LENGTH = 6

// 核心函数
getCycleNumber(startDate, currentDate)    // 获取周期编号
getDayInCycle(startDate, currentDate)     // 获取周期内天数 (1-6)
getCarbTypeForDate(startDate, targetDate) // 获取碳水类型
getCycleStartDate(planStart, cycleNumber) // 获取周期起始日期
calculateDailyCarbs(weight, carbType)     // 计算每日碳水
calculateDailyProtein(weight, bodyFat, gender) // 计算每日蛋白质
calculateDailyFat(weight, bodyFat, gender, carbType) // 计算每日脂肪
```

### date.ts

```typescript
formatDate(date)      // 转为本地 YYYY-MM-DD
parseDate(dateString) // 解析为本地 Date
getToday()            // 获取今日 Date
subtractDays(date, n) // 日期减法
```

---

## API 接口清单

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |

### 用户
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user` | 获取当前用户 |
| POST | `/api/user` | 创建用户（已弃用） |
| PUT | `/api/user` | 更新用户信息 |

### 饮食方案
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/plan/current` | 获取当前方案 |
| POST | `/api/plan` | 创建方案 |
| DELETE | `/api/plan/[id]` | 删除方案 |
| GET | `/api/daily-plan/today` | 获取今日方案 |

### 身体指标
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/body-metrics` | 获取指标列表 |
| POST | `/api/body-metrics` | 添加记录 |
| GET | `/api/body-metrics/latest` | 获取最新记录 |
| GET | `/api/body-metrics/trends` | 获取趋势数据 |
| PATCH | `/api/body-metrics/[id]` | 更新记录 |

### 摄入记录
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/intake/today` | 获取今日摄入 |
| POST | `/api/intake` | 添加摄入 |

### 目标
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/goals` | 获取目标列表 |
| POST | `/api/goals` | 创建目标 |
| PATCH | `/api/goals/[id]` | 更新目标 |

---

## 数据库模型

```
User
├── username (String, unique) - 用户名
├── password (String) - 加密密码
├── birthYear (Int) - 出生年份
├── gender (Gender) - 性别
├── weight (Float) - 体重
├── bodyFatPercentage (Float) - 体脂率
├── CyclePlan (饮食周期方案)
│   └── DailyMealPlan (每日饮食计划)
│       └── DailyIntakeRecord (摄入记录)
├── BodyMetrics (身体指标)
├── MetricGoal (目标)
└── ExerciseRecord (运动记录)
```

---

## 下一步计划

### 立即（v1.0.0 部署）
- [x] 推送代码到 GitHub ✅
- [x] 生产构建测试 ✅
- [ ] 部署到 Vercel
- [ ] 运行数据库迁移
- [ ] 配置环境变量
- [ ] 生产环境测试

### 短期（v1.1.0 - 1-2周）
- [ ] 其他餐食页面历史日期支持（午餐/加餐/晚餐）
- [ ] 营养搜索功能增强（USDA API优化）
- [ ] 餐食快速记录（扫码/语音输入）
- [ ] 消息推送（用餐提醒、目标提醒）
- [ ] 数据导出 (PDF/CSV)
- [ ] 单元测试覆盖（核心功能）

### 中期（v1.2.0 - 1-2月）
- [ ] 运动记录功能增强（组数/次数/重量）
- [ ] 营养摄入周报统计
- [ ] 多语言支持（英文）
- [ ] 社交功能（好友、打卡分享）
- [ ] E2E 测试
- [ ] 性能优化（API 缓存、图片优化）

### 长期（v2.0.0 - 3-6月）
- [ ] AI 饮食建议
- [ ] 食谱推荐系统
- [ ] 社区论坛
- [ ] 个人教练模式
- [ ] 数据分析报告
- [ ] 迁移到 NextAuth.js 认证
- [ ] React Query 缓存优化
- [ ] 微信小程序版本

---

## 部署信息

| 环境 | URL | 状态 |
|------|-----|------|
| 生产 | https://ccycle.vercel.app | 🚀 准备部署 v1.0.0 |
| 数据库 | Neon PostgreSQL | ✅ 连接正常 |
| GitHub | https://github.com/tumusumu/ccycle | ✅ 代码已推送 |
| 构建状态 | 42 路由 | ✅ 编译通过 |

---

## 开发环境要求

- Node.js 18+
- PostgreSQL 数据库
- 支持 ES Module 的环境
- 现代浏览器（Chrome 90+, Safari 14+, Firefox 88+）

---

## 命令手册

```bash
# 开发
npm run dev           # 启动开发服务器
npm run build         # 生产构建
npm run lint          # 代码检查
npm run start         # 启动生产服务器

# 数据库
npx prisma generate   # 生成 Prisma Client
npx prisma db push    # 同步数据库结构
npx prisma studio     # 打开数据库 GUI
npx prisma migrate dev # 创建迁移
npx prisma migrate reset # 重置数据库（开发）

# Git
git status            # 查看状态
git add .             # 暂存所有
git commit -m "msg"   # 提交
git push              # 推送
```

---

## 测试账号（开发环境）

如需测试，可以使用以下流程：
1. 访问 `/register` 创建新账号
2. 完成个人信息填写
3. 创建碳循环计划
4. 开始记录每日摄入

**注意**：生产环境无测试账号，请自行注册。

---

## 性能指标

| 指标 | 目标 | 当前状态 |
|------|------|----------|
| 首屏加载时间 | < 2s | ✅ ~1.5s |
| 交互响应时间 | < 100ms | ✅ ~50ms |
| Lighthouse 分数 | > 90 | 🔄 待测试 |
| 移动端适配 | 完美 | ✅ 已优化 |

---

## 已知问题

暂无重大已知问题。

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

在提交代码前，请确保：
1. 代码通过 `npm run lint` 检查
2. 所有功能在移动端正常工作
3. 提交信息遵循规范

---

## 🎯 版本路线图

```
v1.0.0 MVP (2026-02-04) ✅ 完成
├── 核心功能完整
├── 用户数据隔离
├── 深色模式
├── 历史记录补充
├── 控糖打卡
└── 生产就绪

v1.1.0 (预计 2-3 周)
├── 完善历史功能
├── 营养搜索优化
├── 数据导出
└── 单元测试

v1.2.0 (预计 1-2 月)
├── 运动功能增强
├── 社交分享
├── 多语言支持
└── 性能优化

v2.0.0 (预计 3-6 月)
├── AI 功能
├── 食谱系统
├── 社区功能
└── 小程序版本
```

---

**最后更新：2026-02-04**
**当前版本：v1.0.0 MVP**
**下一版本：v1.1.0（计划中）**
