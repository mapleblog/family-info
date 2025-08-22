// 认证功能模块

// 当前用户信息
let currentUser = null;

// 认证状态监听器
let authStateInitialized = false;
auth.onAuthStateChanged(async function(user) {
    // 防止重复处理认证状态变化
    if (authStateInitialized && ((user && currentUser && user.uid === currentUser.uid) || (!user && !currentUser))) {
        return;
    }
    
    currentUser = user;
    
    if (user) {
        console.log('用户已登录:', user.email);
        
        // 更新用户界面
        updateUserUI(user);
        
        // 只在登录页面时重定向，避免循环
        if (window.location.pathname.includes('login.html')) {
            authStateInitialized = true;
            window.location.href = 'dashboard.html';
            return;
        }
        
        // 在dashboard页面时，异步初始化用户数据（不阻塞认证状态处理）
        if (window.location.pathname.includes('dashboard.html')) {
            // 异步初始化，不等待完成
            initializeUserDataAsync(user);
        }
    } else {
        console.log('用户未登录');
        
        // 隐藏加载状态
        Utils.showLoading(false);
        
        // 只在dashboard页面时重定向到登录页，避免循环
        if (window.location.pathname.includes('dashboard.html')) {
            authStateInitialized = true;
            window.location.href = 'login.html';
            return;
        }
    }
    
    authStateInitialized = true;
});

// Google 登录
function signInWithGoogle() {
    Utils.showLoading(true);
    
    auth.signInWithPopup(googleProvider)
        .then(function(result) {
            const user = result.user;
            console.log('Google 登录成功:', user.email);
            
            Utils.showNotification('登录成功！', 'success');
            Utils.showLoading(false);
            
            // 记录登录活动
            recordActivity('login', {
                method: 'google',
                timestamp: new Date(),
                userAgent: navigator.userAgent
            });
            
        })
        .catch(function(error) {
            console.error('Google 登录失败:', error);
            
            let errorMessage = '登录失败，请重试';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = '登录窗口被关闭';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = '登录窗口被浏览器阻止，请允许弹窗';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = '网络连接失败，请检查网络';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '登录尝试次数过多，请稍后再试';
                    break;
            }
            
            Utils.showNotification(errorMessage, 'danger');
        })
        .finally(function() {
            Utils.showLoading(false);
        });
}

// 退出登录
function signOut() {
    if (confirm('确定要退出登录吗？')) {
        Utils.showLoading(true);
        
        auth.signOut()
            .then(function() {
                console.log('退出登录成功');
                Utils.showNotification('已退出登录', 'info');
                
                // 清除本地数据
                clearLocalData();
                
                // 重定向到首页
                window.location.href = 'index.html';
            })
            .catch(function(error) {
                console.error('退出登录失败:', error);
                Utils.showNotification('退出登录失败', 'danger');
            })
            .finally(function() {
                Utils.showLoading(false);
            });
    }
}

// 更新用户界面
function updateUserUI(user) {
    // 更新用户名
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email;
    }
    
    // 更新用户头像
    const userAvatarElement = document.getElementById('userAvatar');
    if (userAvatarElement) {
        if (user.photoURL) {
            userAvatarElement.src = user.photoURL;
        } else {
            // 使用默认头像
            userAvatarElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=0d6efd&color=fff`;
        }
    }
}

// 初始化用户数据（同步版本，用于认证状态监听器）
async function initializeUserData(user) {
    try {
        // 检查用户是否已存在
        const userDoc = await db.collection(APP_CONFIG.collections.users).doc(user.uid).get();
        
        if (!userDoc.exists) {
            // 创建新用户记录
            await createUserProfile(user);
        } else {
            // 更新最后登录时间
            await db.collection(APP_CONFIG.collections.users).doc(user.uid).update({
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginIP: await getUserIP()
            });
        }
        
        // 初始化家庭数据
        await initializeFamilyData(user);
        
    } catch (error) {
        console.error('初始化用户数据失败:', error);
    }
}

// 异步初始化用户数据（不阻塞认证状态处理）
function initializeUserDataAsync(user) {
    initializeUserData(user).catch(error => {
        console.error('异步初始化用户数据失败:', error);
        Utils.showNotification('数据加载失败，请刷新页面重试', 'danger');
    });
}

// 创建用户档案
async function createUserProfile(user) {
    const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLoginIP: await getUserIP(),
        settings: APP_CONFIG.defaults,
        familyId: null
    };
    
    await db.collection(APP_CONFIG.collections.users).doc(user.uid).set(userProfile);
    
    console.log('用户档案创建成功');
    Utils.showNotification('欢迎使用家庭信息储存平台！', 'success');
}

// 初始化家庭数据
async function initializeFamilyData(user) {
    try {
        const userDoc = await db.collection(APP_CONFIG.collections.users).doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData.familyId) {
            // 创建新的家庭
            const familyData = {
                name: `${user.displayName || user.email.split('@')[0]}的家庭`,
                createdBy: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                members: [user.uid],
                settings: {
                    privacy: 'private',
                    allowInvites: true
                }
            };
            
            const familyRef = await db.collection(APP_CONFIG.collections.families).add(familyData);
            
            // 更新用户的家庭ID
            await db.collection(APP_CONFIG.collections.users).doc(user.uid).update({
                familyId: familyRef.id
            });
            
            console.log('家庭创建成功:', familyRef.id);
        }
    } catch (error) {
        console.error('初始化家庭数据失败:', error);
    }
}

// 获取用户IP地址
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('获取IP地址失败:', error);
        return 'unknown';
    }
}

// 记录用户活动
async function recordActivity(type, data) {
    if (!currentUser) return;
    
    try {
        const activity = {
            userId: currentUser.uid,
            type: type,
            data: data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent,
            ip: await getUserIP()
        };
        
        await db.collection(APP_CONFIG.collections.activities).add(activity);
    } catch (error) {
        console.error('记录活动失败:', error);
    }
}

// 清除本地数据
function clearLocalData() {
    // 清除localStorage
    localStorage.clear();
    
    // 清除sessionStorage
    sessionStorage.clear();
    
    // 清除当前用户信息
    currentUser = null;
}

// 检查用户权限
function checkUserPermission(permission) {
    if (!currentUser) return false;
    
    // 这里可以根据需要实现更复杂的权限检查逻辑
    return true;
}

// 获取当前用户信息
function getCurrentUser() {
    return currentUser;
}

// 获取用户家庭ID
async function getUserFamilyId() {
    if (!currentUser) return null;
    
    try {
        const userDoc = await db.collection(APP_CONFIG.collections.users).doc(currentUser.uid).get();
        return userDoc.data()?.familyId || null;
    } catch (error) {
        console.error('获取家庭ID失败:', error);
        return null;
    }
}

// 验证用户会话
function validateSession() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    
    // 检查会话是否过期
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
        const timeDiff = Date.now() - parseInt(lastActivity);
        if (timeDiff > APP_CONFIG.security.sessionTimeout) {
            signOut();
            return false;
        }
    }
    
    // 更新最后活动时间
    localStorage.setItem('lastActivity', Date.now().toString());
    return true;
}

// 页面加载时验证会话 - 已移至认证状态监听器中处理
document.addEventListener('DOMContentLoaded', function() {
    // 会话验证已在认证状态监听器中统一处理，避免重复调用
});

// 定期验证会话
setInterval(validateSession, 5 * 60 * 1000); // 每5分钟检查一次

// 导出函数
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.getCurrentUser = getCurrentUser;
window.getUserFamilyId = getUserFamilyId;
window.recordActivity = recordActivity;
window.checkUserPermission = checkUserPermission;

console.log('认证模块加载完成');