// Firebase 配置文件
// 请将以下配置替换为您的 Firebase 项目配置

// Firebase 项目配置
const firebaseConfig = {
    // 请在 Firebase Console 中获取您的配置信息
    // https://console.firebase.google.com/
    
    apiKey: "AIzaSyBgKTwqkFPVNTqypHPfL-7GdyPjfuRwaqM",
    authDomain: "family-info-a7dd1.firebaseapp.com",
    projectId: "family-info-a7dd1",
    storageBucket: "family-info-a7dd1.firebasestorage.app",
    messagingSenderId: "173335844935",
    appId: "1:173335844935:web:4f866284cddb82af453962",
    measurementId: "G-P8P8N6GRDP"
    
    // 示例配置（请替换为实际配置）:
    // apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    // authDomain: "family-info-12345.firebaseapp.com",
    // projectId: "family-info-12345",
    // storageBucket: "family-info-12345.appspot.com",
    // messagingSenderId: "123456789012",
    // appId: "1:123456789012:web:abcdef123456789012345"
};

// 初始化 Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase 初始化成功');
} catch (error) {
    console.error('Firebase 初始化失败:', error);
}

// Firebase 服务实例
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Google 认证提供者
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Firestore 设置（新版本Firebase中timestampsInSnapshots已默认为true）

// 应用配置
const APP_CONFIG = {
    // 应用名称
    appName: '家庭信息储存平台',
    
    // 版本信息
    version: '1.0.0',
    
    // 支持的文件类型
    supportedFileTypes: {
        images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        documents: ['pdf', 'doc', 'docx', 'txt', 'rtf'],
        spreadsheets: ['xls', 'xlsx', 'csv'],
        presentations: ['ppt', 'pptx'],
        archives: ['zip', 'rar', '7z']
    },
    
    // 文件大小限制 (MB)
    maxFileSize: 10,
    
    // 存储路径
    storagePaths: {
        documents: 'documents/',
        avatars: 'avatars/',
        temp: 'temp/'
    },
    
    // Firestore 集合名称
    collections: {
        users: 'users',
        families: 'families',
        members: 'members',
        documents: 'documents',
        activities: 'activities'
    },
    
    // 默认设置
    defaults: {
        language: 'zh-CN',
        theme: 'light',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss'
    },
    
    // 安全设置
    security: {
        sessionTimeout: 24 * 60 * 60 * 1000, // 24小时
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15分钟
    }
};

// 工具函数
const Utils = {
    // 生成唯一ID
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // 格式化日期
    formatDate: function(date, format = APP_CONFIG.defaults.dateFormat) {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    },
    
    // 格式化文件大小
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 获取文件扩展名
    getFileExtension: function(filename) {
        return filename.split('.').pop().toLowerCase();
    },
    
    // 检查文件类型
    isValidFileType: function(filename) {
        const ext = this.getFileExtension(filename);
        const allTypes = Object.values(APP_CONFIG.supportedFileTypes).flat();
        return allTypes.includes(ext);
    },
    
    // 获取文件类型图标
    getFileIcon: function(filename) {
        const ext = this.getFileExtension(filename);
        
        if (APP_CONFIG.supportedFileTypes.images.includes(ext)) {
            return 'fas fa-image file-image';
        } else if (APP_CONFIG.supportedFileTypes.documents.includes(ext)) {
            if (ext === 'pdf') return 'fas fa-file-pdf file-pdf';
            return 'fas fa-file-word file-doc';
        } else if (APP_CONFIG.supportedFileTypes.spreadsheets.includes(ext)) {
            return 'fas fa-file-excel file-excel';
        } else if (APP_CONFIG.supportedFileTypes.presentations.includes(ext)) {
            return 'fas fa-file-powerpoint file-ppt';
        } else if (APP_CONFIG.supportedFileTypes.archives.includes(ext)) {
            return 'fas fa-file-archive file-archive';
        } else {
            return 'fas fa-file file-default';
        }
    },
    
    // 显示通知
    showNotification: function(message, type = 'info', duration = 3000) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
    },
    
    // 显示加载状态
    showLoading: function(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('d-none');
            } else {
                overlay.classList.add('d-none');
            }
        }
    },
    
    // 验证邮箱格式
    isValidEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // 验证手机号格式
    isValidPhone: function(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }
};

// 错误处理
window.addEventListener('error', function(e) {
    console.error('应用错误:', e.error);
    Utils.showNotification('应用发生错误，请刷新页面重试', 'danger');
});

// 导出配置和工具
window.APP_CONFIG = APP_CONFIG;
window.Utils = Utils;
window.auth = auth;
window.db = db;
window.storage = storage;
window.googleProvider = googleProvider;

console.log('配置文件加载完成');