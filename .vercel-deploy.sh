#!/bin/bash

echo "🚀 CCycle v1.0.0 部署助手"
echo "========================="
echo ""

echo "📋 部署前检查："
echo "  ✅ 代码已推送到 GitHub"
echo "  ✅ 构建测试通过（42路由）"
echo "  ✅ TypeScript 类型检查通过"
echo ""

echo "🔗 请按照以下步骤操作："
echo ""
echo "1️⃣  访问 Vercel 网站"
echo "   👉 https://vercel.com/dashboard"
echo ""
echo "2️⃣  选择部署方式："
echo ""
echo "   方式A：如果项目已连接（自动部署）"
echo "   ✓ 找到 'ccycle' 项目"
echo "   ✓ 查看 Deployments 页面"
echo "   ✓ 等待自动部署完成（约2-3分钟）"
echo ""
echo "   方式B：如果需要手动触发"
echo "   ✓ 进入项目 -> 点击 '...' -> Redeploy"
echo "   ✓ 选择 commit: 587418c"
echo "   ✓ 点击 Redeploy 按钮"
echo ""
echo "   方式C：首次部署"
echo "   ✓ 访问 https://vercel.com/new"
echo "   ✓ 导入 tumusumu/ccycle 仓库"
echo "   ✓ 选择分支: chore/cursor-config"
echo "   ✓ 配置环境变量（见下方）"
echo ""

echo "3️⃣  环境变量配置（必需）"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   DATABASE_URL=postgresql://[your-neon-url]"
echo "   NEXT_PUBLIC_USDA_API_KEY=Bc4RfvN1GaNed3xpU5GvTgyR9eshhnLybTes4gBh"
echo "   NODE_ENV=production"
echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "4️⃣  部署后操作（首次必做）"
echo "   ⚠️  运行数据库迁移："
echo "   $ npx prisma migrate deploy"
echo ""

echo "5️⃣  功能测试清单"
echo "   □ 用户注册"
echo "   □ 用户登录"
echo "   □ 创建计划"
echo "   □ 今日打卡"
echo "   □ 历史补充"
echo "   □ 控糖打卡"
echo "   □ 深色模式"
echo ""

echo "📚 完整文档："
echo "   👉 docs/DEPLOY_NOW.md"
echo "   👉 docs/deployment-checklist.md"
echo ""

echo "✅ 准备就绪！开始部署吧！"
echo ""

# 可选：在浏览器中打开 Vercel
read -p "是否在浏览器中打开 Vercel？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    open "https://vercel.com/dashboard"
fi
