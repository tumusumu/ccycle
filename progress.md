# CCycle 开发进度记录

> 最后更新: 2026-02-03

---

## 版本历史

### v0.4.0 - 核心功能优化 (2026-02-03)

**主要更新:**

#### /dashboard 页面优化
- 营养环形图新增卡路里指标 (替换饮水)
- 实现超标预警视觉反馈 (渐变红色背景)
- 修复"第X天"动态计算逻辑

#### /stats 统计页面
- 集成 recharts 实现体重/体脂率趋势图
- 支持时间筛选 (7天/30天/全部)
- 双Y轴展示 (体重左轴/体脂右轴)
- 可折叠历史记录列表

#### /stats/record 记录页面
- 新增"补充记录"模式，支持历史数据补录
- 日期选择器
- 简化指标输入 (仅保留体重/体脂率)

#### /plan 计划页面重构
- 6天周期视图 (112113模式：低-低-中-低-低-高)
- 周期导航 (上一周期/下一周期)
- 碳水类型彩色卡片 (低碳绿/中碳黄/高碳红)
- 未来日期显示淡色碳水底色
- 点击日期查看营养详情弹窗
- 专业SVG状态图标 (达标/超标/不足)
- 周期统计卡片 (渐变背景/进度条/激励文案)

#### 工具函数增强
- `src/utils/carbon-cycle.ts` 新增周期计算函数
- `src/utils/date.ts` 修复时区日期处理问题

#### 数据库精简
- 移除 BodyMetrics 冗余字段 (muscleMass, waistCircumference, note)

**新增组件:**
- `src/components/plan/day-cell.tsx` - 日期单元格
- `src/components/plan/day-detail-modal.tsx` - 详情弹窗
- `src/components/plan/cycle-stats.tsx` - 周期统计卡片
- `src/components/ui/nutrition-status-icon.tsx` - 营养状态图标

---

### v0.3.0 - 用户认证系统 (2026-02-03)

**主要更新:**
- 实现 Cookie-based 用户认证系统
- 新增服务端认证工具 (`src/lib/auth.ts`)
- 新增客户端用户状态管理 Hook (`src/hooks/use-current-user.ts`)
- 新增登录页面 (`src/app/login/page.tsx`)
- 改造所有 API 路由使用 `getCurrentUser()` 进行身份验证
- 实现多用户数据完全隔离
- localStorage key 包含用户 ID，避免数据混淆

**相关提交:**
- `76f4a70` feat: 实现用户认证系统，修复数据隔离问题

---

### v0.2.0 - 身体指标跟踪系统 (2026-02-02)

**主要更新:**
- 实现完整的身体指标跟踪功能
- 支持记录体重、体脂率、肌肉量等数据
- 新增指标趋势 API
- 数据库 schema 扩展

**相关提交:**
- `2282f43` feat(plan2): implement complete body metrics tracking system

---

### v0.1.0 - 数据持久化 (2026-02-01)

**主要更新:**
- 实现数据库持久化存储
- 饮食摄入数据保存到 PostgreSQL
- 配置 Prisma ORM

**相关提交:**
- `3fabc97` feat: implement database persistence for intake data

---

## 功能模块状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户认证 | ✅ 完成 | Cookie-based 认证，多用户隔离 |
| 用户引导 (Onboarding) | ✅ 完成 | 体重/体脂率/性别输入 |
| 碳循环计算引擎 | ✅ 完成 | 112113 六天循环模式 |
| 每日饮食方案 | ✅ 完成 | 自动生成四餐方案 |
| 营养素搜索 | ✅ 完成 | USDA API + 中文支持 |
| 饮食摄入记录 | ✅ 完成 | 逐餐打卡记录 |
| 身体指标跟踪 | ✅ 完成 | 体重/体脂率趋势图 (recharts) |
| 主仪表板 | ✅ 完成 | 营养环形图 + 卡路里 + 超标预警 |
| 计划页面 | ✅ 完成 | 6天周期视图 + 周期统计 |
| 历史补录 | ✅ 完成 | 支持补充历史记录 |
| 运动记录 | 🚧 进行中 | 基础功能已有 |
| 导出报告 | 📅 计划中 | - |

---

## API 接口清单

### 用户相关
- `GET /api/user` - 获取当前用户信息
- `POST /api/user` - 创建新用户
- `PUT /api/user` - 更新用户信息
- `GET /api/user/check-username` - 检查用户名是否可用

### 饮食方案
- `GET /api/plan` - 获取用户饮食方案列表
- `POST /api/plan` - 创建新饮食方案
- `GET /api/plan/current` - 获取当前激活方案
- `GET /api/plan/[id]` - 获取指定方案详情
- `GET /api/daily-plan/today` - 获取今日饮食方案
- `GET /api/daily-plan/[date]` - 获取指定日期方案

### 摄入记录
- `GET /api/intake` - 获取摄入记录
- `POST /api/intake` - 添加摄入记录
- `GET /api/intake/today` - 获取今日摄入

### 身体指标
- `GET /api/body-metrics` - 获取指标记录列表
- `POST /api/body-metrics` - 添加新指标记录
- `GET /api/body-metrics/latest` - 获取最新指标
- `GET /api/body-metrics/trends` - 获取指标趋势
- `PUT /api/body-metrics/[id]` - 更新指标记录

### 其他
- `GET /api/nutrition/search` - 搜索食物营养信息
- `GET /api/goals` - 获取用户目标
- `POST /api/goals` - 创建目标
- `GET /api/exercise/today` - 获取今日运动记录
- `GET /api/summary/[cyclePlanId]` - 获取周期汇总
- `GET /api/summary/history` - 获取历史汇总

---

## 数据库模型

```
User
├── CyclePlan (饮食周期方案)
│   └── DailyMealPlan (每日饮食计划)
│       └── IntakeRecord (摄入记录)
├── BodyMetric (身体指标)
└── Goal (用户目标)
```

---

## 下一步计划

1. **运动记录增强**
   - 详细的力量训练记录 (组数/次数/重量)
   - 有氧运动心率追踪

2. **数据分析**
   - 营养摄入周报/月报
   - 周期达标率统计

3. **用户体验**
   - 深色模式支持
   - 自定义提醒功能

4. **数据导出**
   - 导出 PDF 报告
   - 数据备份/恢复

---

## 技术债务

- [ ] 考虑迁移到更完善的认证方案 (NextAuth.js)
- [ ] 添加单元测试
- [ ] 性能优化 (React Query 缓存)
- [ ] API 响应时间优化 (当前部分接口 2-3s)
- [ ] 组件懒加载优化
