// 家庭成员管理模块

// 成员数据缓存
let membersCache = [];
let currentFamilyId = null;

// 初始化成员管理
async function initializeMembers() {
    try {
        currentFamilyId = await getUserFamilyId();
        if (currentFamilyId) {
            await loadMembers();
            updateMemberCount();
        }
    } catch (error) {
        console.error('初始化成员管理失败:', error);
        Utils.showNotification('加载成员信息失败', 'danger');
    }
}

// 加载家庭成员
async function loadMembers() {
    if (!currentFamilyId) return;
    
    try {
        const snapshot = await db.collection(APP_CONFIG.collections.members)
            .where('familyId', '==', currentFamilyId)
            .orderBy('createdAt', 'desc')
            .get();
        
        membersCache = [];
        snapshot.forEach(doc => {
            membersCache.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderMembersList();
        console.log('成员列表加载完成:', membersCache.length);
        
    } catch (error) {
        console.error('加载成员列表失败:', error);
        Utils.showNotification('加载成员列表失败', 'danger');
    }
}

// 渲染成员列表
function renderMembersList() {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    if (membersCache.length === 0) {
        membersList.innerHTML = `
            <div class="col-12">
                <div class="card text-center">
                    <div class="card-body py-5">
                        <i class="fas fa-users fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">还没有添加家庭成员</h5>
                        <p class="text-muted">点击上方的"添加成员"按钮开始添加您的家庭成员信息</p>
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addMemberModal">
                            <i class="fas fa-plus me-2"></i>添加第一个成员
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    membersCache.forEach(member => {
        html += createMemberCard(member);
    });
    
    membersList.innerHTML = html;
}

// 创建成员卡片
function createMemberCard(member) {
    const age = member.birthdate ? calculateAge(member.birthdate.toDate()) : '';
    const ageText = age ? `${age}岁` : '';
    
    return `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="card member-card h-100">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="member-avatar me-3">
                            ${member.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="card-title mb-1">${member.name}</h5>
                            <p class="text-muted mb-0">${member.relation}</p>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="editMember('${member.id}')"><i class="fas fa-edit me-2"></i>编辑</a></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deleteMember('${member.id}')"><i class="fas fa-trash me-2"></i>删除</a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="member-info">
                        ${member.birthdate ? `
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-birthday-cake text-primary me-2"></i>
                                <small>${Utils.formatDate(member.birthdate.toDate())} ${ageText}</small>
                            </div>
                        ` : ''}
                        
                        ${member.phone ? `
                            <div class="d-flex align-items-center mb-2">
                                <i class="fas fa-phone text-primary me-2"></i>
                                <small>${member.phone}</small>
                            </div>
                        ` : ''}
                        
                        ${member.notes ? `
                            <div class="d-flex align-items-start mb-2">
                                <i class="fas fa-sticky-note text-primary me-2 mt-1"></i>
                                <small class="text-muted">${member.notes}</small>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="text-muted">
                        <small>添加于 ${Utils.formatDate(member.createdAt.toDate())}</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 添加成员
async function addMember() {
    const form = document.getElementById('addMemberForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const memberData = {
        name: document.getElementById('memberName').value.trim(),
        relation: document.getElementById('memberRelation').value,
        birthdate: document.getElementById('memberBirthdate').value ? 
            new Date(document.getElementById('memberBirthdate').value) : null,
        phone: document.getElementById('memberPhone').value.trim(),
        notes: document.getElementById('memberNotes').value.trim(),
        familyId: currentFamilyId,
        createdBy: getCurrentUser().uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        Utils.showLoading(true);
        
        // 验证数据
        if (!memberData.name) {
            throw new Error('请输入成员姓名');
        }
        
        if (!memberData.relation) {
            throw new Error('请选择成员关系');
        }
        
        if (memberData.phone && !Utils.isValidPhone(memberData.phone)) {
            throw new Error('请输入正确的手机号码');
        }
        
        // 检查是否已存在同名成员
        const existingMember = membersCache.find(m => 
            m.name.toLowerCase() === memberData.name.toLowerCase() && 
            m.relation === memberData.relation
        );
        
        if (existingMember) {
            throw new Error('已存在相同姓名和关系的成员');
        }
        
        // 添加到数据库
        const docRef = await db.collection(APP_CONFIG.collections.members).add(memberData);
        
        // 记录活动
        await recordActivity('member_added', {
            memberId: docRef.id,
            memberName: memberData.name,
            relation: memberData.relation
        });
        
        Utils.showNotification('成员添加成功！', 'success');
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMemberModal'));
        modal.hide();
        
        // 清空表单
        form.reset();
        
        // 重新加载成员列表
        await loadMembers();
        updateMemberCount();
        
    } catch (error) {
        console.error('添加成员失败:', error);
        Utils.showNotification(error.message || '添加成员失败', 'danger');
    } finally {
        Utils.showLoading(false);
    }
}

// 编辑成员
function editMember(memberId) {
    const member = membersCache.find(m => m.id === memberId);
    if (!member) {
        Utils.showNotification('成员信息不存在', 'danger');
        return;
    }
    
    // 填充表单
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberRelation').value = member.relation;
    document.getElementById('memberBirthdate').value = member.birthdate ? 
        Utils.formatDate(member.birthdate.toDate()) : '';
    document.getElementById('memberPhone').value = member.phone || '';
    document.getElementById('memberNotes').value = member.notes || '';
    
    // 修改模态框标题和按钮
    document.querySelector('#addMemberModal .modal-title').textContent = '编辑家庭成员';
    const submitBtn = document.querySelector('#addMemberModal .btn-primary');
    submitBtn.textContent = '保存';
    submitBtn.onclick = () => updateMember(memberId);
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
    modal.show();
}

// 更新成员
async function updateMember(memberId) {
    const form = document.getElementById('addMemberForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const updateData = {
        name: document.getElementById('memberName').value.trim(),
        relation: document.getElementById('memberRelation').value,
        birthdate: document.getElementById('memberBirthdate').value ? 
            new Date(document.getElementById('memberBirthdate').value) : null,
        phone: document.getElementById('memberPhone').value.trim(),
        notes: document.getElementById('memberNotes').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        Utils.showLoading(true);
        
        // 验证数据
        if (!updateData.name) {
            throw new Error('请输入成员姓名');
        }
        
        if (!updateData.relation) {
            throw new Error('请选择成员关系');
        }
        
        if (updateData.phone && !Utils.isValidPhone(updateData.phone)) {
            throw new Error('请输入正确的手机号码');
        }
        
        // 更新数据库
        await db.collection(APP_CONFIG.collections.members).doc(memberId).update(updateData);
        
        // 记录活动
        await recordActivity('member_updated', {
            memberId: memberId,
            memberName: updateData.name
        });
        
        Utils.showNotification('成员信息更新成功！', 'success');
        
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMemberModal'));
        modal.hide();
        
        // 重置模态框
        resetMemberModal();
        
        // 重新加载成员列表
        await loadMembers();
        
    } catch (error) {
        console.error('更新成员失败:', error);
        Utils.showNotification(error.message || '更新成员失败', 'danger');
    } finally {
        Utils.showLoading(false);
    }
}

// 删除成员
async function deleteMember(memberId) {
    const member = membersCache.find(m => m.id === memberId);
    if (!member) {
        Utils.showNotification('成员信息不存在', 'danger');
        return;
    }
    
    if (!confirm(`确定要删除成员"${member.name}"吗？此操作不可撤销。`)) {
        return;
    }
    
    try {
        Utils.showLoading(true);
        
        // 删除数据库记录
        await db.collection(APP_CONFIG.collections.members).doc(memberId).delete();
        
        // 记录活动
        await recordActivity('member_deleted', {
            memberId: memberId,
            memberName: member.name,
            relation: member.relation
        });
        
        Utils.showNotification('成员删除成功', 'success');
        
        // 重新加载成员列表
        await loadMembers();
        updateMemberCount();
        
    } catch (error) {
        console.error('删除成员失败:', error);
        Utils.showNotification('删除成员失败', 'danger');
    } finally {
        Utils.showLoading(false);
    }
}

// 重置成员模态框
function resetMemberModal() {
    document.querySelector('#addMemberModal .modal-title').textContent = '添加家庭成员';
    const submitBtn = document.querySelector('#addMemberModal .btn-primary');
    submitBtn.textContent = '添加';
    submitBtn.onclick = addMember;
    
    // 清空表单
    document.getElementById('addMemberForm').reset();
}

// 计算年龄
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// 更新成员数量
function updateMemberCount() {
    const memberCountElement = document.getElementById('memberCount');
    if (memberCountElement) {
        memberCountElement.textContent = membersCache.length;
    }
}

// 搜索成员
function searchMembers(query) {
    if (!query) {
        renderMembersList();
        return;
    }
    
    const filteredMembers = membersCache.filter(member => 
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.relation.toLowerCase().includes(query.toLowerCase()) ||
        (member.phone && member.phone.includes(query))
    );
    
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    if (filteredMembers.length === 0) {
        membersList.innerHTML = `
            <div class="col-12">
                <div class="card text-center">
                    <div class="card-body py-5">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h5 class="text-muted">没有找到匹配的成员</h5>
                        <p class="text-muted">尝试使用其他关键词搜索</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredMembers.forEach(member => {
        html += createMemberCard(member);
    });
    
    membersList.innerHTML = html;
}

// 导出成员数据
function exportMembers() {
    if (membersCache.length === 0) {
        Utils.showNotification('没有成员数据可导出', 'warning');
        return;
    }
    
    const csvData = convertMembersToCSV(membersCache);
    downloadCSV(csvData, '家庭成员信息.csv');
    
    // 记录活动
    recordActivity('members_exported', {
        count: membersCache.length
    });
}

// 转换成员数据为CSV格式
function convertMembersToCSV(members) {
    const headers = ['姓名', '关系', '出生日期', '年龄', '联系电话', '备注', '添加时间'];
    const rows = members.map(member => {
        const age = member.birthdate ? calculateAge(member.birthdate.toDate()) : '';
        return [
            member.name,
            member.relation,
            member.birthdate ? Utils.formatDate(member.birthdate.toDate()) : '',
            age,
            member.phone || '',
            member.notes || '',
            Utils.formatDate(member.createdAt.toDate())
        ];
    });
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    return csvContent;
}

// 下载CSV文件
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 模态框事件监听
document.addEventListener('DOMContentLoaded', function() {
    const addMemberModal = document.getElementById('addMemberModal');
    if (addMemberModal) {
        addMemberModal.addEventListener('hidden.bs.modal', function() {
            resetMemberModal();
        });
    }
});

// 导出函数
window.addMember = addMember;
window.editMember = editMember;
window.deleteMember = deleteMember;
window.searchMembers = searchMembers;
window.exportMembers = exportMembers;
window.initializeMembers = initializeMembers;

console.log('成员管理模块加载完成');