# CCycle 开发进度记录

> 最后更新: 2026-02-03
> 生产环境: https://ccycle.vercel.app

---

## 当前版本: v0.4.0

### 功能模块状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户认证 | ✅ 完成 | Cookie-based 认证，多用户隔离 |
| 用户引导 | ✅ 完成 | 体重/体脂率/性别输入 |
| 碳循环引擎 | ✅ 完成 | 112113 六天循环模式 |
| 每日饮食方案 | ✅ 完成 | 自动生成四餐方案 |
| 主仪表板 | ✅ 完成 | 营养环形图 + 卡路里 + 超标预警 |
| 计划页面 | ✅ 完成 | 6天周期视图 + 周期统计 |
| 统计页面 | ✅ 完成 | recharts 趋势图 + 时间筛选 |
| 身体指标 | ✅ 完成 | 体重/体脂率记录与趋势 |
| 历史补录 | ✅ 完成 | 支持补充历史数据 |
| 目标管理 | ✅ 完成 | 体重/体脂目标设定 |
| 运动记录 | 🚧 基础 | 力量/有氧时间记录 |

---

## 版本历史

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
- 点击日期查看营养详情弹窗
- 专业 SVG 状态图标（达标/超标/不足）
- 周期统计卡片（渐变背景/进度条/激励文案）

**Stats 统计页面**
- 集成 recharts 实现体重/体脂率趋势图
- 支持时间筛选（7天/30天/全部）
- 双Y轴展示（体重左轴/体脂右轴）
- 可折叠历史记录列表
- 新增"补充记录"模式，支持历史数据补录

**技术优化**
- 修复时区日期处理问题
- 精简 BodyMetrics 字段（移除 muscleMass 等冗余字段）
- 修复 TypeScript 类型错误

**新增组件**
- `src/components/plan/day-cell.tsx` - 日期单元格
- `src/components/plan/day-detail-modal.tsx` - 详情弹窗
- `src/components/plan/cycle-stats.tsx` - 周期统计卡片
- `src/components/ui/nutrition-status-icon.tsx` - 营养状态图标
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

### 用户
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/user` | 获取当前用户 |
| POST | `/api/user` | 创建用户 |
| PUT | `/api/user` | 更新用户 |

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
├── CyclePlan (饮食周期方案)
│   └── DailyMealPlan (每日饮食计划)
│       └── DailyIntakeRecord (摄入记录)
├── BodyMetrics (身体指标)
├── MetricGoal (目标)
└── ExerciseRecord (运动记录)
```

---

## 下一步计划

### 短期
- [ ] 运动记录功能增强（组数/次数/重量）
- [ ] 营养摄入周报统计
- [ ] 深色模式支持

### 中期
- [ ] 食物数据库搜索
- [ ] 自定义提醒通知
- [ ] 数据导出 (PDF/CSV)

### 长期
- [ ] 迁移到 NextAuth.js 认证
- [ ] React Query 缓存优化
- [ ] 单元测试覆盖

---

## 部署信息

| 环境 | URL | 状态 |
|------|-----|------|
| 生产 | https://ccycle.vercel.app | ✅ 运行中 |
| 数据库 | Neon PostgreSQL | ✅ 连接正常 |

---

## 命令手册

```bash
# 开发
npm run dev           # 启动开发服务器
npm run build         # 生产构建
npm run lint          # 代码检查

# 数据库
npx prisma generate   # 生成 Prisma Client
npx prisma db push    # 同步数据库结构
npx prisma studio     # 打开数据库 GUI

# Git
git status            # 查看状态
git add .             # 暂存所有
git commit -m "msg"   # 提交
git push              # 推送
```
