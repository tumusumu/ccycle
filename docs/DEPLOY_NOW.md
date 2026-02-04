# 🚀 立即部署到 Vercel

> 当前状态：✅ 代码已推送，构建测试通过，准备部署 v1.0.0

---

## 方式一：Vercel 网站部署（推荐）

### 如果项目已连接 Vercel

1. **访问 Vercel 控制台**
   - 打开 https://vercel.com/dashboard
   - 找到 `ccycle` 项目

2. **检查自动部署**
   - 最新的 GitHub push 应该会自动触发部署
   - 查看 "Deployments" 标签页
   - 等待构建完成（约 2-3 分钟）

3. **手动触发重新部署**（如果需要）
   - 进入项目设置
   - 点击右上角的 "..." 菜单
   - 选择 "Redeploy"
   - 选择最新的 commit: `587418c`
   - 点击 "Redeploy" 按钮

### 如果项目未连接 Vercel

1. **导入 GitHub 项目**
   - 访问 https://vercel.com/new
   - 点击 "Import Git Repository"
   - 选择 `tumusumu/ccycle`
   - 选择分支：`chore/cursor-config`

2. **配置项目**
   ```yaml
   Project Name: ccycle
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **配置环境变量**（重要！）
   ```bash
   DATABASE_URL=postgresql://[your-neon-url]
   NEXT_PUBLIC_USDA_API_KEY=Bc4RfvN1GaNed3xpU5GvTgyR9eshhnLybTes4gBh
   NODE_ENV=production
   ```

4. **点击 Deploy**
   - Vercel 会自动构建和部署
   - 等待完成（约 2-3 分钟）

---

## 方式二：使用 Vercel CLI（本地部署）

### 1. 安装 Vercel CLI

```bash
# 如果没有全局安装权限，使用 npx
npx vercel login
```

### 2. 登录 Vercel

```bash
# 使用邮箱或 GitHub 登录
npx vercel login
```

### 3. 部署到生产环境

```bash
# 首次部署
npx vercel --prod

# 后续部署
npx vercel --prod
```

---

## 方式三：GitHub Actions 自动部署

如果你想设置 CI/CD 自动部署，可以创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel

on:
  push:
    branches:
      - chore/cursor-config
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 部署后必做检查清单

### 1. 数据库迁移（首次部署必做）

在 Vercel 项目设置中运行：

```bash
npx prisma migrate deploy
```

或者在本地连接生产数据库运行：

```bash
# 设置生产数据库 URL
export DATABASE_URL="postgresql://[production-url]"

# 运行迁移
npx prisma migrate deploy
```

### 2. 环境变量检查

确保以下环境变量已设置：

- ✅ `DATABASE_URL` - Neon PostgreSQL 连接字符串
- ✅ `NEXT_PUBLIC_USDA_API_KEY` - USDA API 密钥
- ✅ `NODE_ENV=production` - 生产环境标识

### 3. 功能测试

访问部署的 URL 并测试：

- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 创建碳循环计划
- [ ] 今日营养录入
- [ ] 历史记录补充
- [ ] 控糖打卡
- [ ] 深色模式切换
- [ ] 运动记录

### 4. 数据隔离验证

- [ ] 注册两个不同账号
- [ ] 确认各自数据独立
- [ ] 登出/登入切换正常
- [ ] 数据不会混淆

---

## 常见问题

### Q: 部署失败 "Build Error"

**A**: 检查以下内容：
1. 环境变量是否正确设置
2. 数据库是否可访问
3. Node.js 版本是否兼容（需要 18+）

### Q: 部署成功但页面报错

**A**: 可能原因：
1. 数据库迁移未运行 → 运行 `npx prisma migrate deploy`
2. 环境变量缺失 → 检查 Vercel 项目设置
3. 数据库连接失败 → 检查 Neon 数据库状态

### Q: 如何查看部署日志

**A**: 
1. 进入 Vercel 项目控制台
2. 点击 "Deployments" 标签
3. 点击具体的部署记录
4. 查看 "Build Logs" 和 "Function Logs"

### Q: 如何回滚到之前的版本

**A**:
1. 进入 "Deployments" 页面
2. 找到想要回滚的版本
3. 点击 "..." 菜单
4. 选择 "Promote to Production"

---

## 部署优化建议

### 1. 配置自定义域名

在 Vercel 项目设置中添加自定义域名，提升专业度。

### 2. 启用分析

开启 Vercel Analytics 监控应用性能：
- Page Views
- Core Web Vitals
- Real User Monitoring

### 3. 配置缓存策略

优化静态资源缓存，提升加载速度：

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/icon-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

### 4. 设置环境

创建多个环境（Preview、Production）：
- `main` 分支 → Production
- `develop` 分支 → Preview
- Pull Requests → Preview

---

## 🎉 部署成功后

访问你的应用：
- **生产环境**: https://ccycle.vercel.app
- **或自定义域名**: https://your-domain.com

分享给用户：
1. 📱 添加到主屏幕体验 PWA
2. 🌙 尝试深色模式
3. 🎯 开始你的碳循环之旅

---

## 监控与维护

### 实时监控

- **Vercel Analytics**: 查看访问量和性能
- **Neon Metrics**: 监控数据库使用情况
- **Error Tracking**: 考虑集成 Sentry

### 定期维护

- 每周检查错误日志
- 每月审查性能指标
- 及时更新依赖包

---

**准备好了吗？开始部署吧！** 🚀

**当前版本**: v1.0.0 MVP  
**最新 Commit**: 587418c  
**构建状态**: ✅ 通过  
**文档状态**: ✅ 完整
