# 家庭信息储存平台 - 简化版

> 轻量级家庭信息管理系统，易于个人维护

![项目状态](https://img.shields.io/badge/状态-开发中-yellow)
![技术栈](https://img.shields.io/badge/技术栈-HTML%2BCSS%2BJS%2BFirebase-blue)
![维护难度](https://img.shields.io/badge/维护难度-简单-green)

---

## 📖 项目简介

这是一个专为家庭设计的轻量级信息管理系统，使用简单易懂的技术栈，方便个人开发和维护。无需复杂的框架和构建工具，专注于核心功能的实现。

### 🎯 设计理念
- **简单实用**: 使用基础Web技术，学习成本低
- **快速开发**: 无需复杂配置，开箱即用
- **易于维护**: 代码结构清晰，便于长期维护
- **成本可控**: 主要使用免费服务，运营成本低

---

## ✨ 核心功能

### 👥 家庭成员管理
- **基本信息**: 姓名、生日、电话、家庭关系
- **健康档案**: 过敏史、用药记录、体检信息
- **重要文档**: 身份证、护照等证件的数字化存储

### 📅 重要日期提醒
- **生日提醒**: 家庭成员生日自动提醒
- **纪念日**: 结婚纪念日、重要节日记录
- **日历视图**: 简单的月历显示

### 📁 文档管理
- **文件上传**: 支持图片、PDF等常见格式
- **分类存储**: 按家庭成员分类管理
- **在线预览**: 基础的文件预览功能

### 🔐 安全认证
- **Google登录**: 使用Google账号快速登录
- **数据隔离**: 每个家庭的数据完全隔离
- **访问控制**: 简单的权限管理

---

## 🛠 技术栈

### 前端技术
```
基础技术: HTML5 + CSS3 + JavaScript (ES6+)
├── UI框架: Bootstrap 5 (CDN)
├── 图标库: Bootstrap Icons
├── 工具库: jQuery + Day.js
└── 开发工具: VS Code + Live Server
```

### 后端服务
```
云服务: Firebase (Google)
├── 数据库: Cloud Firestore
├── 认证: Firebase Auth
├── 存储: Firebase Storage
└── 托管: Firebase Hosting
```

---

## 📁 项目结构

```
family-info-platform/
├── 📁 public/                 # 网页文件
│   ├── index.html            # 主页
│   ├── login.html            # 登录页
│   ├── dashboard.html        # 仪表板
│   ├── members.html          # 成员管理
│   ├── documents.html        # 文档管理
│   └── calendar.html         # 日历页面
├── 📁 css/                   # 样式文件
│   ├── bootstrap.min.css     # Bootstrap样式
│   └── custom.css            # 自定义样式
├── 📁 js/                    # JavaScript文件
│   ├── firebase-config.js    # Firebase配置
│   ├── auth.js              # 认证逻辑
│   ├── database.js          # 数据库操作
│   ├── members.js           # 成员管理
│   ├── documents.js         # 文档管理
│   ├── calendar.js          # 日历功能
│   └── utils.js             # 工具函数
├── 📁 images/                # 图片资源
├── 📄 firebase.json          # Firebase配置
├── 📄 .firebaserc            # Firebase项目
└── 📄 README.md              # 项目说明
```

---

## 🚀 快速开始

### 环境要求
- 现代浏览器 (Chrome/Firefox/Safari)
- 文本编辑器 (推荐VS Code)
- Git (版本控制)
- Firebase账号 (免费)

### 安装步骤

#### 1. 获取项目代码
```bash
# 克隆项目
git clone https://github.com/your-username/family-info-platform.git
cd family-info-platform
```

#### 2. Firebase 设置

**创建Firebase项目**:
1. 访问 [Firebase控制台](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称，如"family-info-platform"
4. 启用Google Analytics (可选)

**配置认证**:
1. 在Firebase控制台，进入"Authentication"
2. 点击"开始使用"
3. 在"Sign-in method"中启用"Google"

**配置Firestore**:
1. 进入"Firestore Database"
2. 点击"创建数据库"
3. 选择"以测试模式启动"

**配置Storage**:
1. 进入"Storage"
2. 点击"开始使用"
3. 选择默认规则

#### 3. 获取Firebase配置
1. 在Firebase控制台，点击项目设置⚙️
2. 滚动到"您的应用"部分
3. 点击"</>"
4. 复制配置对象

#### 4. 配置项目
编辑 `js/firebase-config.js` 文件：
```javascript
// Firebase配置
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// 初始化Firebase
firebase.initializeApp(firebaseConfig);
```

#### 5. 本地开发

**使用VS Code Live Server**:
1. 安装VS Code的"Live Server"插件
2. 右键点击`public/index.html`
3. 选择"Open with Live Server"

**或使用Python服务器**:
```bash
# 在项目根目录运行
cd public
python -m http.server 8000
# 访问 http://localhost:8000
```

#### 6. 部署到Firebase
```bash
# 安装Firebase CLI
npm install -g firebase-tools

# 登录Firebase
firebase login

# 初始化项目
firebase init hosting

# 部署
firebase deploy
```

---

## 📝 使用指南

### 首次使用
1. 访问网站首页
2. 点击"使用Google账号登录"
3. 完成Google授权
4. 开始添加家庭成员信息

### 添加家庭成员
1. 进入"成员管理"页面
2. 点击"添加成员"
3. 填写基本信息
4. 保存成员信息

### 上传文档
1. 选择对应的家庭成员
2. 进入"文档管理"
3. 点击"上传文档"
4. 选择文件并添加描述

### 设置提醒
1. 进入"日历"页面
2. 点击"添加提醒"
3. 设置提醒日期和内容
4. 保存提醒事项

---

## 🔒 安全特性

### 认证安全
- **Google OAuth**: 使用Google的安全认证
- **会话管理**: 自动会话超时保护
- **访问控制**: 用户只能访问自己的数据

### 数据安全
- **HTTPS传输**: 所有数据传输加密
- **Firebase规则**: 服务器端数据访问控制
- **数据隔离**: 不同用户数据完全隔离

### 隐私保护
- **最小化收集**: 只收集必要的信息
- **用户控制**: 用户可以删除自己的数据
- **透明度**: 清楚说明数据使用方式

---

## 💰 成本说明

### Firebase免费套餐限制
- **Firestore**: 1GB存储，50,000次读取/天
- **Storage**: 5GB存储，1GB下载/天
- **Hosting**: 10GB存储，360MB传输/天
- **Auth**: 无限制认证

### 预估使用量（5人家庭）
- **数据存储**: < 100MB
- **文件存储**: < 2GB
- **日访问量**: < 1,000次
- **结论**: 完全在免费范围内

---

## 🛠 开发指南

### 代码规范
- 使用ES6+语法
- 函数和变量使用驼峰命名
- 添加必要的注释
- 保持代码简洁易读

### 文件组织
```javascript
// 每个功能模块独立文件
// 使用命名空间避免冲突

const MemberManager = {
  // 成员管理相关功能
};

const DocumentManager = {
  // 文档管理相关功能
};
```

### 数据结构
```javascript
// 家庭成员数据结构
const member = {
  id: 'auto-generated-id',
  name: '张三',
  birthday: '1990-01-01',
  phone: '13800138000',
  relationship: '父亲',
  healthInfo: {
    allergies: ['花生', '海鲜'],
    medications: ['高血压药'],
    lastCheckup: '2024-01-01'
  },
  documents: [
    {
      name: '身份证',
      url: 'storage-url',
      uploadDate: '2024-01-01'
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

---

## 🔧 常见问题

### Q: 如何备份数据？
A: 在设置页面点击"导出数据"，会下载JSON格式的备份文件。

### Q: 忘记密码怎么办？
A: 使用Google登录，密码由Google管理，可以通过Google重置。

### Q: 可以添加多少个家庭成员？
A: 理论上无限制，但建议控制在20人以内以保证性能。

### Q: 支持哪些文件格式？
A: 支持图片(jpg, png, gif)、PDF、Word文档等常见格式。

### Q: 数据存储在哪里？
A: 数据存储在Google Firebase云服务器，安全可靠。

---

## 📈 功能路线图

### 已完成 ✅
- 基础认证系统
- 成员信息管理
- 文档上传存储

### 开发中 🚧
- 日期提醒功能
- 健康记录管理
- 数据导出功能

### 计划中 📋
- 移动端适配
- 搜索功能
- 数据统计
- 多语言支持

---

## 🤝 贡献指南

欢迎提交问题和建议！

### 报告问题
1. 在GitHub上创建Issue
2. 详细描述问题和重现步骤
3. 提供浏览器和系统信息

### 提交代码
1. Fork项目
2. 创建功能分支
3. 提交代码并写清楚说明
4. 创建Pull Request

---

## 📞 联系方式

- 📧 邮箱: your-email@example.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-username/family-info-platform/issues)
- 💬 讨论: [GitHub Discussions](https://github.com/your-username/family-info-platform/discussions)

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

感谢以下开源项目和服务：
- [Firebase](https://firebase.google.com/) - 后端服务
- [Bootstrap](https://getbootstrap.com/) - UI框架
- [jQuery](https://jquery.com/) - JavaScript库
- [Day.js](https://day.js.org/) - 日期处理库

---

<div align="center">
  <p>💝 为家庭而生，用爱心维护</p>
  <p>© 2024 家庭信息储存平台. 保留所有权利.</p>
</div>