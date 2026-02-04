# 🚀 快速部署指南

## ✅ 当前状态
- 代码已推送到 GitHub ✓
- 构建测试通过（42路由）✓
- 版本：v1.0.0 MVP ✓
- Commit: 587418c ✓

---

## 📦 立即部署（3步完成）

### 第1步：访问 Vercel

打开浏览器访问：**https://vercel.com/dashboard**

### 第2步：选择你的部署方式

#### 🔥 情况A：项目已连接 Vercel（自动部署）

1. 在 Dashboard 找到 `ccycle` 项目
2. 点击项目进入
3. 查看 "Deployments" 标签
4. ✨ **GitHub 推送会自动触发部署**
5. 等待 2-3 分钟完成

#### 🔄 情况B：需要手动重新部署

1. 进入 `ccycle` 项目
2. 点击右上角 **"..."** 菜单
3. 选择 **"Redeploy"**
4. 确认 commit: `587418c`
5. 点击 **"Redeploy"** 按钮

#### ✨ 情况C：首次部署

1. 访问：**https://vercel.com/new**
2. 点击 **"Import Git Repository"**
3. 选择 `tumusumu/ccycle`
4. 配置：
   - Branch: `chore/cursor-config`
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. **配置环境变量**（见下方）
6. 点击 **"Deploy"**

### 第3步：配置环境变量（必需！）

在 Vercel 项目设置 → Environment Variables 中添加：

```bash
DATABASE_URL=postgresql://[你的Neon数据库URL]
NEXT_PUBLIC_USDA_API_KEY=Bc4RfvN1GaNed3xpU5GvTgyR9eshhnLybTes4gBh
NODE_ENV=production
```

---

## ⚠️ 首次部署必做

### 运行数据库迁移

部署成功后，在 Vercel 项目设置中运行：

```bash
npx prisma migrate deploy
```

或本地连接生产数据库运行：

```bash
export DATABASE_URL="postgresql://[生产URL]"
npx prisma migrate deploy
```

---

## ✅ 部署后测试

访问 https://ccycle.vercel.app 测试以下功能：

- [ ] 用户注册
- [ ] 用户登录  
- [ ] 创建碳循环计划
- [ ] 今日营养录入
- [ ] 历史记录补充
- [ ] 控糖打卡（🍎🍬🍞）
- [ ] 深色模式切换
- [ ] 运动记录

---

## 🔗 快速链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **新建项目**: https://vercel.com/new
- **GitHub 仓库**: https://github.com/tumusumu/ccycle
- **详细文档**: [docs/DEPLOY_NOW.md](docs/DEPLOY_NOW.md)

---

## 💡 提示

- 如果项目已连接 GitHub，推送代码会自动部署
- 部署大约需要 2-3 分钟
- 首次部署后记得运行数据库迁移
- 测试多用户数据隔离功能

---

**准备好了吗？立即开始部署！** 🎉
