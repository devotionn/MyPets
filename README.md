# MyPets Platform

现代化宠物领养平台MVP，使用 Next.js 14、Tailwind CSS 和 Supabase 构建。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env.local.example` 到 `.env.local` 并填写 Supabase 配置：
```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 设置 Supabase 数据库
在 Supabase SQL Editor 中依次运行以下迁移文件：
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`

### 4. 配置 Storage
在 Supabase Dashboard > Storage 中：
1. 创建名为 `pet-photos` 的公开 bucket
2. 设置最大文件大小为 5MB
3. 允许的 MIME 类型：`image/jpeg`, `image/png`, `image/webp`

### 5. 配置 OAuth
在 Supabase Dashboard > Authentication > Providers 中启用：
- Google OAuth
- GitHub OAuth

设置回调地址为：`http://localhost:3000/auth/callback`

### 6. 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 📦 技术栈

- **框架**: Next.js 15 (App Router)
- **样式**: Tailwind CSS 3.x
- **后端**: Supabase (PostgreSQL + Auth + Storage)
- **语言**: TypeScript
- **图标**: Lucide React

## 🎯 核心功能

- ✅ 用户认证 (Google/GitHub OAuth)
- ✅ 宠物列表与搜索筛选
- ✅ 宠物详情页（照片轮播）
- ✅ 领养申请流程
- ✅ 宠物发布与管理
- ✅ 收藏功能
- ✅ 用户控制台
- ✅ 暗色模式支持
- ✅ 响应式设计

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── auth/               # 认证相关页面
│   ├── dashboard/          # 用户控制台
│   ├── pets/               # 宠物浏览和详情
│   ├── publish/            # 发布宠物
│   └── stories/            # 成功案例
├── components/             # React 组件
│   ├── auth/               # 认证组件
│   ├── layout/             # 布局组件
│   ├── pets/               # 宠物相关组件
│   └── publish/            # 发布相关组件
├── lib/                    # 工具函数和配置
│   └── supabase/           # Supabase 客户端
└── types/                  # TypeScript 类型定义
```

## 📝 开发命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 运行生产服务器
npm run lint     # 运行 ESLint
```

## 📄 License

MIT
