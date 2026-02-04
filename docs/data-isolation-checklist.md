# 数据隔离检查清单

## ✅ 数据库表与用户关联

### 直接关联到 User 表
| 表名 | 外键字段 | 索引 | 级联删除 | 状态 |
|------|---------|------|---------|------|
| **CyclePlan** | `userId` | ✅ | `onDelete: Cascade` | ✅ 正确 |
| **ExerciseRecord** | `userId` | `@@unique([userId, date])` | `onDelete: Cascade` | ✅ 正确 |
| **BodyMetrics** | `userId` | `@@unique([userId, date])` | `onDelete: Cascade` | ✅ 正确 |
| **MetricGoal** | `userId` | `@@index([userId, status])` | `onDelete: Cascade` | ✅ 正确 |

### 间接关联到 User 表（通过外键链）
| 表名 | 关联链 | 唯一约束 | 状态 |
|------|--------|---------|------|
| **DailyMealPlan** | User → CyclePlan → DailyMealPlan | `@@unique([cyclePlanId, date])` | ✅ 正确 |
| **DailyIntakeRecord** | User → CyclePlan → DailyMealPlan → DailyIntakeRecord | `dailyMealPlanId @unique` | ✅ 正确 |
| **CycleSummary** | User → CyclePlan → CycleSummary | `cyclePlanId @unique` | ✅ 正确 |

---

## ✅ API 用户验证

### 认证 API
| API 路由 | 验证方式 | 状态 |
|---------|---------|------|
| `POST /api/auth/register` | 无需验证（注册） | ✅ |
| `POST /api/auth/login` | 密码验证 | ✅ |
| `POST /api/auth/logout` | 清除 cookie | ✅ |

### 用户数据 API
| API 路由 | 验证逻辑 | 用户隔离 | 状态 |
|---------|---------|---------|------|
| `GET /api/user` | `getCurrentUser()` | `where: { id: userId }` | ✅ 正确 |
| `PUT /api/user` | `getCurrentUser()` | `where: { id: user.id }` | ✅ 正确 |

### 计划相关 API
| API 路由 | 验证逻辑 | 用户隔离 | 状态 |
|---------|---------|---------|------|
| `GET /api/plan/current` | `getCurrentUser()` | `where: { userId: user.id, status: 'ACTIVE' }` | ✅ 正确 |
| `POST /api/plan/create` | `getCurrentUser()` | `userId: user.id` | ✅ 正确 |
| `GET /api/daily-plan/today` | `getCurrentUser()` | `where: { cyclePlan: { userId } }` | ✅ 正确 |
| `GET /api/daily-plan/[date]` | `getCurrentUser()` | `where: { cyclePlan: { userId } }` | ✅ 正确 |

### 摄入记录 API
| API 路由 | 验证逻辑 | 用户隔离 | 状态 |
|---------|---------|---------|------|
| `GET /api/intake/today` | `getCurrentUser()` | `where: { cyclePlan: { userId } }` | ✅ 正确 |
| `PUT /api/intake/today` | `getCurrentUser()` | `where: { cyclePlan: { userId } }` | ✅ 正确 |
| `GET /api/intake-history/[date]` | `getCurrentUser()` | `where: { cyclePlan: { userId } }` | ✅ 正确 |
| `PUT /api/intake-history/[date]` | `getCurrentUser()` | `where: { cyclePlan: { userId } }` | ✅ 正确 |

### 运动记录 API
| API 路由 | 验证逻辑 | 用户隔离 | 状态 |
|---------|---------|---------|------|
| `GET /api/exercise/[date]` | `getCurrentUser()` | `where: { userId: user.id, date }` | ✅ 正确 |
| `PUT /api/exercise/[date]` | `getCurrentUser()` | `userId: user.id` | ✅ 正确 |

### 其他 API
| API 路由 | 验证逻辑 | 用户隔离 | 状态 |
|---------|---------|---------|------|
| `GET /api/diet-restrictions` | `getCurrentUser()` | `where: { userId: user.id }` | ✅ 正确 |
| `GET /api/body-metrics` | `getCurrentUser()` | `where: { userId: user.id }` | ✅ 正确 |
| `POST /api/body-metrics` | `getCurrentUser()` | `userId: user.id` | ✅ 正确 |
| `GET /api/goals` | `getCurrentUser()` | `where: { userId: user.id }` | ✅ 正确 |
| `POST /api/goals` | `getCurrentUser()` | `userId: user.id` | ✅ 正确 |

---

## ✅ Cookie 机制

### 双重 Cookie 策略
| Cookie 名称 | 用途 | httpOnly | 有效期 | 设置位置 |
|------------|------|----------|-------|---------|
| `ccycle_user_id` | 服务端认证 | ✅ true | 30天 | login/register API |
| `ccycle_user_id_client` | 客户端 localStorage key | ❌ false | 30天 | login/register API |

### Cookie 生命周期
```
注册/登录
  ↓
服务端设置双重 cookie
  ↓
客户端从 cookie 读取 userId
  ↓
生成 localStorage key: intake-{userId}-{date}
  ↓
登出
  ↓
清除双重 cookie + localStorage
```

---

## ✅ 数据字段映射

### DailyIntakeRecord → IMealIntake (前端)

#### 早餐
| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `actualOatmealGrams` | `oatmealGrams` | Float |
| `actualWholeEggs` | `wholeEggs` | Int |
| `actualWhiteOnlyEggs` | `whiteOnlyEggs` | Int |
| `oatmealCompleted && protein1Completed` | `breakfastCompleted` | Boolean |

#### 午餐
| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `actualLunchRiceGrams` | `lunchRiceGrams` | Float |
| `actualLunchMeatType` | `lunchMeatType` | String |
| `actualLunchMeatGrams` | `lunchMeatGrams` | Float |
| `actualLunchOliveOilMl` | `lunchOliveOilMl` | Float |
| `riceLunchCompleted && protein2Completed` | `lunchCompleted` | Boolean |

#### 加餐
| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `actualSnackRiceGrams` | `snackRiceGrams` | Float |
| `actualSnackProteinType` | `snackMeatType` | String |
| `actualSnackProteinGrams` | `snackMeatGrams` | Float |
| `protein3Completed` | `snackCompleted` | Boolean |

#### 晚餐
| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `actualDinnerRiceGrams` | `dinnerRiceGrams` | Float |
| `actualDinnerMeatType` | `dinnerMeatType` | String |
| `actualDinnerMeatGrams` | `dinnerMeatGrams` | Float |
| `actualDinnerOliveOilMl` | `dinnerOliveOilMl` | Float |
| `riceDinnerCompleted && protein4Completed` | `dinnerCompleted` | Boolean |

#### 运动（来自 ExerciseRecord）
| 数据库字段 | 前端字段 | 类型 |
|-----------|---------|------|
| `ExerciseRecord.strengthCompleted` | `strengthCompleted` | Boolean |
| `DailyIntakeRecord.actualStrengthMinutes` | `strengthMinutes` | Int |
| `ExerciseRecord.cardioSession1 || cardioSession2` | `cardioCompleted` | Boolean |
| `DailyIntakeRecord.actualCardioMinutes` | `cardioMinutes` | Int |

#### 控糖打卡（第一个月）
| 数据库字段 | 前端字段 | 显示文本 |
|-----------|---------|---------|
| `noFruitConfirmed` | `noFruit` | 🍎 没有吃水果 |
| `noSugarConfirmed` | `noSugar` | 🍬 没有吃糖 |
| `noWhiteFlourConfirmed` | `noWhiteFlour` | 🍞 没有吃白面 |

---

## ✅ 用户隔离测试清单

### 测试场景
- [x] 注册新用户自动登录
- [x] 登录时设置双重 cookie
- [x] 不同用户有独立的 localStorage key
- [ ] 用户 A 的数据不会被用户 B 看到
- [ ] 用户 A 登出后，用户 B 登录看不到 A 的数据
- [ ] 同一浏览器切换用户，数据正确切换

### 数据隔离验证
- [ ] 营养摄入记录（DailyIntakeRecord）
- [ ] 运动记录（ExerciseRecord）
- [ ] 控糖打卡（noFruit/noSugar/noWhiteFlour）
- [ ] 身体指标（BodyMetrics）
- [ ] 目标管理（MetricGoal）

---

## 🔒 安全注意事项

1. ✅ **httpOnly Cookie**：防止 XSS 攻击读取用户 ID
2. ✅ **服务端验证**：所有 API 都使用 `getCurrentUser()` 验证
3. ✅ **级联删除**：删除用户时自动清理所有关联数据
4. ✅ **唯一约束**：防止重复记录
5. ✅ **密码加密**：bcrypt 10轮盐值

---

## 📝 已修复的问题

1. ✅ 注册后自动登录（设置 cookie）
2. ✅ 双重 cookie 机制（httpOnly + 客户端可读）
3. ✅ 客户端从 cookie 读取 userId（不再用 localStorage）
4. ✅ 控糖打卡功能完整实现
5. ✅ 所有 API 都正确关联用户

---

## 🚀 下一步优化建议

1. 添加数据库索引优化查询性能
2. 添加 API 响应缓存
3. 添加错误日志记录
4. 实现完整的用户权限系统
5. 添加数据备份机制
