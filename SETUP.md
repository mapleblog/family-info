# 家庭信息储存平台 - 环境配置指南

## 环境变量配置

### 1. 创建环境变量文件

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cp .env.example .env
```

### 2. 获取 Firebase 配置

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择您的项目（或创建新项目）
3. 点击项目设置 ⚙️ > 常规
4. 在 "您的应用" 部分，选择 Web 应用
5. 在 "Firebase SDK snippet" 中选择 "配置"
6. 复制配置对象中的值

### 3. 填写环境变量

编辑 `.env` 文件，填入您的 Firebase 配置：

```env
FIREBASE_API_KEY=your_actual_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Firebase 服务配置

### 1. 启用必要的服务

在 Firebase Console 中启用以下服务：

- **Authentication**：启用 Google 登录
- **Firestore Database**：创建数据库（生产模式）
- **Storage**：启用文件存储
- **Hosting**：用于部署（可选）

### 2. 配置安全规则

项目已包含以下安全规则文件：
- `firestore.rules` - Firestore 安全规则
- `storage.rules` - Storage 安全规则

部署安全规则：
```bash
firebase deploy --only firestore:rules,storage
```

### 3. 部署索引

部署 Firestore 索引：
```bash
firebase deploy --only firestore:indexes
```

## 本地开发

### 1. 安装 Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. 登录 Firebase

```bash
firebase login
```

### 3. 初始化项目

```bash
firebase use --add
```

选择您的 Firebase 项目 ID。

### 4. 启动本地服务器

```bash
firebase serve --only hosting
```

访问 `http://localhost:5000` 查看应用。

## 部署到生产环境

### 1. 部署到 Firebase Hosting

```bash
firebase deploy
```

### 2. 环境变量管理

对于生产环境，建议使用 Firebase Hosting 的环境变量功能或其他安全的配置管理服务。

## 安全注意事项

1. **永远不要**将 `.env` 文件提交到版本控制系统
2. **定期轮换** API 密钥和其他敏感信息
3. **限制** Firebase 项目的 API 密钥使用范围
4. **监控** Firebase 使用情况和安全日志

## 故障排除

### 常见问题

1. **Firebase 初始化失败**
   - 检查 `.env` 文件中的配置是否正确
   - 确认 Firebase 项目已正确设置

2. **认证失败**
   - 确认已在 Firebase Console 中启用 Google 认证
   - 检查授权域名设置

3. **数据库查询失败**
   - 确认已部署 Firestore 索引
   - 检查安全规则配置

如有其他问题，请查看 Firebase Console 中的日志和错误信息。