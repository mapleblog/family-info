# 家庭信息储存平台

一个基于Firebase的轻量级家庭信息管理系统，帮助家庭成员安全地存储和管理重要文档及家庭信息。

## 功能特性

- 🔐 **安全认证**：Google账号登录，确保数据安全
- 👨‍👩‍👧‍👦 **家庭成员管理**：添加、编辑、删除家庭成员信息
- 📄 **文档存储**：上传、下载、预览各类重要文档
- 🏷️ **分类管理**：按类别组织文档，便于查找
- 📱 **响应式设计**：支持桌面和移动设备
- 🔍 **搜索功能**：快速查找成员和文档

## 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **UI框架**：Bootstrap 5
- **后端服务**：Firebase (Auth, Firestore, Storage, Hosting)
- **图标**：Font Awesome

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd family_info
```

### 2. 配置Firebase

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下服务：
   - Authentication (Google登录)
   - Firestore Database
   - Storage
   - Hosting

4. 获取Firebase配置信息并更新 `js/config.js` 文件：

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 3. 部署Security Rules

将 `firestore.rules` 和 `storage.rules` 文件中的规则部署到Firebase：

```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 登录Firebase
firebase login

# 初始化项目
firebase init

# 部署规则
firebase deploy --only firestore:rules,storage
```

### 4. 本地开发

使用任何HTTP服务器运行项目，例如：

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 使用Live Server (VS Code扩展)
# 右键点击index.html -> Open with Live Server
```

### 5. 部署到Firebase Hosting

```bash
# 构建和部署
firebase deploy --only hosting
```

## 项目结构

```
family_info/
├── index.html              # 首页
├── login.html              # 登录页面
├── dashboard.html          # 主工作界面
├── css/
│   └── style.css          # 自定义样式
├── js/
│   ├── config.js          # Firebase配置和工具函数
│   ├── auth.js            # 认证功能
│   ├── members.js         # 家庭成员管理
│   ├── documents.js       # 文档管理
│   └── app.js             # 主应用逻辑
├── images/                 # 图片资源
├── firestore.rules        # Firestore安全规则
├── storage.rules          # Storage安全规则
└── README.md              # 项目说明
```

## 使用指南

### 首次使用

1. 访问应用首页
2. 点击"开始使用"按钮
3. 使用Google账号登录
4. 系统会自动创建您的家庭档案

### 管理家庭成员

1. 在仪表板中点击"添加成员"
2. 填写成员信息（姓名、关系、出生日期等）
3. 保存后可以编辑或删除成员信息

### 管理文档

1. 点击"上传文档"按钮
2. 选择文件并填写相关信息
3. 选择适当的分类
4. 上传后可以预览、下载或编辑文档信息

## 安全特性

- **身份验证**：仅允许Google认证用户访问
- **数据隔离**：每个家庭的数据完全隔离
- **权限控制**：用户只能访问自己家庭的数据
- **文件验证**：限制文件类型和大小
- **安全规则**：Firebase规则确保数据安全

## 支持的文件类型

- **文档**：PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx)
- **文本**：TXT
- **图片**：JPG, JPEG, PNG, GIF, WebP
- **大小限制**：单个文件最大10MB

## 成本说明

Firebase免费套餐包含：
- **Firestore**：每日50,000次读取，20,000次写入
- **Storage**：5GB存储空间，1GB/天下载
- **Authentication**：无限制
- **Hosting**：10GB存储，每月10GB传输

对于个人和小家庭使用，免费套餐通常足够。

## 开发指南

### 添加新功能

1. 在相应的JS模块中添加功能函数
2. 更新HTML界面（如需要）
3. 添加相应的CSS样式
4. 更新Firestore规则（如涉及新数据结构）

### 代码规范

- 使用ES6+语法
- 函数和变量使用驼峰命名
- 添加适当的注释
- 保持代码简洁和可读性

## 常见问题

**Q: 如何重置密码？**
A: 本应用使用Google登录，密码管理由Google处理。

**Q: 可以添加多少个家庭成员？**
A: 没有硬性限制，但建议保持在合理数量以确保性能。

**Q: 文档存储有时间限制吗？**
A: 没有时间限制，文档会永久保存（除非手动删除）。

**Q: 如何备份数据？**
A: 可以使用导出功能下载成员信息，文档可以逐个下载。

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题或建议，请通过GitHub Issues联系。
