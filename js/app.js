// 主应用程序模块

// 应用状态
let appState = {
    isInitialized: false,
    currentUser: null,
    currentPage: 'dashboard',
    isLoading: false
};

// 应用初始化
async function initializeApp() {
    try {
        console.log('开始初始化应用...');
        
        // 显示加载状态
        showAppLoading(true);
        
        // Firebase 已在 config.js 中初始化
        
        // 认证状态监听器已在 auth.js 中设置，避免重复
        // 等待认证状态初始化
        setTimeout(() => {
            appState.isInitialized = true;
            showAppLoading(false);
        }, 1000);
        
        // 初始化页面特定功能
        initializePageSpecificFeatures();
        
        console.log('应用初始化完成');
        
    } catch (error) {
        console.error('应用初始化失败:', error);
        Utils.showNotification('应用初始化失败，请刷新页面重试', 'danger');
        showAppLoading(false);
    }
}

// 初始化仪表板
async function initializeDashboard() {
    try {
        console.log('初始化仪表板...');
        
        // 更新用户界面
        updateUserInterface();
        
        // 初始化各个模块
        await Promise.all([
            initializeMembers(),
            initializeDocuments()
        ]);
        
        // 加载仪表板统计数据
        await loadDashboardStats();
        
        // 设置事件监听器
        setupEventListeners();
        
        console.log('仪表板初始化完成');
        
    } catch (error) {
        console.error('仪表板初始化失败:', error);
        Utils.showNotification('仪表板加载失败', 'danger');
    }
}

// 加载仪表板统计数据
async function loadDashboardStats() {
    try {
        const familyId = await getUserFamilyId();
        if (!familyId) return;
        
        // 获取统计数据
        const [membersCount, documentsCount] = await Promise.all([
            getMembersCount(familyId),
            getDocumentsCount(familyId)
        ]);
        
        // 更新统计显示
        updateStatsDisplay({
            members: membersCount,
            documents: documentsCount
        });
        
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// 获取成员数量
async function getMembersCount(familyId) {
    try {
        const snapshot = await db.collection(APP_CONFIG.collections.members)
            .where('familyId', '==', familyId)
            .get();
        return snapshot.size;
    } catch (error) {
        console.error('获取成员数量失败:', error);
        return 0;
    }
}

// 获取文档数量
async function getDocumentsCount(familyId) {
    try {
        const snapshot = await db.collection(APP_CONFIG.collections.documents)
            .where('familyId', '==', familyId)
            .get();
        return snapshot.size;
    } catch (error) {
        console.error('获取文档数量失败:', error);
        return 0;
    }
}

// 更新统计显示
function updateStatsDisplay(stats) {
    const memberCountElement = document.getElementById('memberCount');
    const documentCountElement = document.getElementById('documentCount');
    
    if (memberCountElement) {
        memberCountElement.textContent = stats.members;
    }
    
    if (documentCountElement) {
        documentCountElement.textContent = stats.documents;
    }
}

// 初始化页面特定功能
function initializePageSpecificFeatures() {
    const currentPage = getCurrentPage();
    
    switch (currentPage) {
        case 'index':
            initializeIndexPage();
            break;
        case 'login':
            initializeLoginPage();
            break;
        case 'dashboard':
            // 仪表板初始化在认证状态改变时处理
            break;
        default:
            console.log('未知页面:', currentPage);
    }
}

// 获取当前页面
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path === '/') {
        return 'index';
    } else if (path.includes('login.html')) {
        return 'login';
    } else if (path.includes('dashboard.html')) {
        return 'dashboard';
    }
    return 'unknown';
}

// 初始化首页
function initializeIndexPage() {
    console.log('初始化首页');
    
    // 用户登录状态检查已在auth.js中统一处理
}

// 初始化登录页面
function initializeLoginPage() {
    console.log('初始化登录页面');
    
    // 用户登录状态检查已在auth.js中统一处理
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                handleSearch(e.target.value);
            }, 300);
        });
    }
    
    // 分类筛选
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function(e) {
            handleCategoryFilter(e.target.value);
        });
    }
    
    // 导航菜单
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // 用户资料
    const userProfileBtn = document.getElementById('userProfileBtn');
    if (userProfileBtn) {
        userProfileBtn.addEventListener('click', showUserProfile);
    }
}

// 处理搜索
function handleSearch(query) {
    const currentSection = getCurrentSection();
    
    switch (currentSection) {
        case 'members':
            if (typeof searchMembers === 'function') {
                searchMembers(query);
            }
            break;
        case 'documents':
            if (typeof searchDocuments === 'function') {
                searchDocuments(query);
            }
            break;
        default:
            console.log('当前页面不支持搜索');
    }
}

// 处理分类筛选
function handleCategoryFilter(category) {
    const currentSection = getCurrentSection();
    
    if (currentSection === 'documents' && typeof filterDocumentsByCategory === 'function') {
        filterDocumentsByCategory(category);
    }
}

// 获取当前显示的部分
function getCurrentSection() {
    const activeSection = document.querySelector('.content-section.active');
    return activeSection ? activeSection.id : 'overview';
}

// 显示指定部分
function showSection(sectionId) {
    // 隐藏所有部分
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示指定部分
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 更新导航状态
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeNavLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    // 更新页面标题
    updatePageTitle(sectionId);
    
    // 清空搜索
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
}

// 更新页面标题
function updatePageTitle(sectionId) {
    const titles = {
        'overview': '概览',
        'members': '家庭成员',
        'documents': '文档管理'
    };
    
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = titles[sectionId] || '家庭信息储存平台';
    }
}

// 处理退出登录
async function handleLogout() {
    if (!confirm('确定要退出登录吗？')) {
        return;
    }
    
    try {
        await signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('退出登录失败:', error);
        Utils.showNotification('退出登录失败', 'danger');
    }
}

// 显示用户资料
function showUserProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    // 填充用户信息
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileName').textContent = user.displayName || '未设置';
    document.getElementById('profilePhoto').src = user.photoURL || 'https://via.placeholder.com/100';
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('userProfileModal'));
    modal.show();
}

// 显示应用加载状态
function showAppLoading(show) {
    const loadingElement = document.getElementById('appLoading');
    if (loadingElement) {
        loadingElement.style.display = show ? 'flex' : 'none';
    }
    
    appState.isLoading = show;
}

// 更新用户界面
function updateUserInterface() {
    const user = getCurrentUser();
    if (!user) return;
    
    // 更新用户头像
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        if (user.photoURL) {
            userAvatar.innerHTML = `<img src="${user.photoURL}" alt="用户头像" class="rounded-circle" width="32" height="32">`;
        } else {
            const initial = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
            userAvatar.innerHTML = `<div class="user-avatar">${initial}</div>`;
        }
    }
    
    // 更新用户名
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = user.displayName || user.email;
    }
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
    
    // 不显示所有错误给用户，只显示关键错误
    if (event.error && event.error.message) {
        const message = event.error.message;
        if (message.includes('Firebase') || message.includes('auth') || message.includes('firestore')) {
            Utils.showNotification('系统错误，请刷新页面重试', 'danger');
        }
    }
});

// 未处理的 Promise 拒绝
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的 Promise 拒绝:', event.reason);
    
    // 防止默认的错误处理
    event.preventDefault();
    
    // 显示用户友好的错误信息
    if (event.reason && event.reason.code) {
        const errorCode = event.reason.code;
        let message = '操作失败，请重试';
        
        switch (errorCode) {
            case 'permission-denied':
                message = '权限不足，请检查您的访问权限';
                break;
            case 'unavailable':
                message = '服务暂时不可用，请稍后重试';
                break;
            case 'unauthenticated':
                message = '身份验证失败，请重新登录';
                break;
        }
        
        Utils.showNotification(message, 'danger');
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && appState.currentUser) {
        // 页面重新可见时，刷新数据
        console.log('页面重新可见，刷新数据');
        
        if (getCurrentPage() === 'dashboard') {
            loadDashboardStats();
        }
    }
});

// 在线状态监听
window.addEventListener('online', function() {
    console.log('网络连接恢复');
    Utils.showNotification('网络连接已恢复', 'success');
    
    // 重新初始化应用
    if (appState.currentUser && getCurrentPage() === 'dashboard') {
        loadDashboardStats();
    }
});

window.addEventListener('offline', function() {
    console.log('网络连接断开');
    Utils.showNotification('网络连接已断开，部分功能可能不可用', 'warning');
});

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加载完成，开始初始化应用');
    initializeApp();
});

// 导出函数
window.initializeApp = initializeApp;
window.showSection = showSection;
window.handleLogout = handleLogout;
window.showUserProfile = showUserProfile;

console.log('主应用程序模块加载完成');