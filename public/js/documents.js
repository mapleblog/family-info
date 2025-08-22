// 文档管理模块

// 文档数据缓存
let documentsCache = [];
let documentsFamilyId = null;
let uploadProgress = {};

// 初始化文档管理
async function initializeDocuments() {
    try {
        documentsFamilyId = await getUserFamilyId();
        if (documentsFamilyId) {
            await loadDocuments();
            updateDocumentCount();
        }
    } catch (error) {
        console.error('初始化文档管理失败:', error);
        Utils.showNotification('加载文档信息失败', 'danger');
    }
}

// 加载文档列表
async function loadDocuments() {
    if (!documentsFamilyId) return;
    
    try {
        const snapshot = await db.collection(APP_CONFIG.collections.documents)
            .where('familyId', '==', documentsFamilyId)
            .orderBy('createdAt', 'desc')
            .get();
        
        documentsCache = [];
        snapshot.forEach(doc => {
            documentsCache.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        renderDocumentsList();
        console.log('文档列表加载完成:', documentsCache.length);
        
    } catch (error) {
        console.error('加载文档列表失败:', error);
        Utils.showNotification('加载文档列表失败', 'danger');
    }
}

// 渲染文档列表
function renderDocumentsList() {
    const documentsList = document.getElementById('documentsList');
    if (!documentsList) return;
    
    if (documentsCache.length === 0) {
        documentsList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">还没有上传任何文档</h5>
                <p class="text-muted">点击上方的"上传文档"按钮开始上传您的家庭文档</p>
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#uploadDocumentModal">
                    <i class="fas fa-upload me-2"></i>上传第一个文档
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    documentsCache.forEach(doc => {
        html += createDocumentItem(doc);
    });
    
    documentsList.innerHTML = html;
}

// 创建文档项
function createDocumentItem(doc) {
    const fileIcon = getFileIcon(doc.type);
    const fileSize = Utils.formatFileSize(doc.size);
    const uploadDate = Utils.formatDate(doc.createdAt.toDate());
    
    return `
        <div class="document-item border rounded p-3 mb-3">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="file-icon">
                        <i class="${fileIcon} fa-2x"></i>
                    </div>
                </div>
                <div class="col">
                    <h6 class="mb-1">${doc.name}</h6>
                    <div class="text-muted small">
                        <span class="me-3">
                            <i class="fas fa-tag me-1"></i>${doc.category}
                        </span>
                        <span class="me-3">
                            <i class="fas fa-hdd me-1"></i>${fileSize}
                        </span>
                        <span>
                            <i class="fas fa-calendar me-1"></i>${uploadDate}
                        </span>
                    </div>
                    ${doc.description ? `<p class="text-muted small mb-0 mt-1">${doc.description}</p>` : ''}
                </div>
                <div class="col-auto">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="downloadDocument('${doc.id}')" title="下载">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="viewDocument('${doc.id}')" title="预览">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="editDocument('${doc.id}')" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument('${doc.id}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 获取文件图标
function getFileIcon(fileType) {
    const iconMap = {
        'application/pdf': 'fas fa-file-pdf text-danger',
        'application/msword': 'fas fa-file-word text-primary',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word text-primary',
        'application/vnd.ms-excel': 'fas fa-file-excel text-success',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel text-success',
        'application/vnd.ms-powerpoint': 'fas fa-file-powerpoint text-warning',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint text-warning',
        'text/plain': 'fas fa-file-alt text-secondary',
        'image/jpeg': 'fas fa-file-image text-info',
        'image/png': 'fas fa-file-image text-info',
        'image/gif': 'fas fa-file-image text-info',
        'image/webp': 'fas fa-file-image text-info'
    };
    
    return iconMap[fileType] || 'fas fa-file text-secondary';
}

// 上传文档
async function uploadDocument() {
    const fileInput = document.getElementById('documentFile');
    const nameInput = document.getElementById('documentName');
    const categorySelect = document.getElementById('documentCategory');
    const descriptionInput = document.getElementById('documentDescription');
    
    if (!fileInput.files[0]) {
        Utils.showNotification('请选择要上传的文件', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    const fileName = nameInput.value.trim() || file.name;
    const category = categorySelect.value;
    const description = descriptionInput.value.trim();
    
    // 验证文件
    if (!Utils.isValidFileType(file.name)) {
        Utils.showNotification('不支持的文件类型', 'danger');
        return;
    }
    
    const maxFileSizeBytes = APP_CONFIG.maxFileSize * 1024 * 1024; // 转换为字节
    if (file.size > maxFileSizeBytes) {
        Utils.showNotification(`文件大小不能超过 ${APP_CONFIG.maxFileSize}MB`, 'danger');
        return;
    }
    
    try {
        Utils.showLoading(true);
        
        // 生成文件路径
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${Utils.generateId()}.${fileExtension}`;
        const filePath = `${APP_CONFIG.storagePaths.documents}/${documentsFamilyId}/${uniqueFileName}`;
        
        // 检查 Storage 是否可用
        if (!storage) {
            Utils.showNotification('文件存储服务不可用，请联系管理员', 'danger');
            Utils.showLoading(false);
            return;
        }
        
        // 上传文件到 Firebase Storage
        const storageRef = storage.ref(filePath);
        const uploadTask = storageRef.put(file);
        
        // 监听上传进度
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                updateUploadProgress(progress);
            },
            (error) => {
                console.error('文件上传失败:', error);
                Utils.showNotification('文件上传失败', 'danger');
                Utils.showLoading(false);
            },
            async () => {
                try {
                    // 获取下载URL
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    
                    // 保存文档信息到数据库
                    const documentData = {
                        name: fileName,
                        originalName: file.name,
                        category: category,
                        description: description,
                        type: file.type,
                        size: file.size,
                        url: downloadURL,
                        storagePath: filePath,
                        familyId: documentsFamilyId,
                        uploadedBy: getCurrentUser().uid,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    const docRef = await db.collection(APP_CONFIG.collections.documents).add(documentData);
                    
                    // 记录活动
                    await recordActivity('document_uploaded', {
                        documentId: docRef.id,
                        documentName: fileName,
                        category: category,
                        fileSize: file.size
                    });
                    
                    Utils.showNotification('文档上传成功！', 'success');
                    
                    // 关闭模态框
                    const modal = bootstrap.Modal.getInstance(document.getElementById('uploadDocumentModal'));
                    modal.hide();
                    
                    // 清空表单
                    resetUploadForm();
                    
                    // 重新加载文档列表
                    await loadDocuments();
                    updateDocumentCount();
                    
                } catch (error) {
                    console.error('保存文档信息失败:', error);
                    Utils.showNotification('保存文档信息失败', 'danger');
                }
                
                Utils.showLoading(false);
            }
        );
        
    } catch (error) {
        console.error('上传文档失败:', error);
        Utils.showNotification('上传文档失败', 'danger');
        Utils.showLoading(false);
    }
}

// 更新上传进度
function updateUploadProgress(progress) {
    const progressBar = document.querySelector('#uploadDocumentModal .progress-bar');
    const progressText = document.querySelector('#uploadDocumentModal .progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
    
    if (progressText) {
        progressText.textContent = `上传中... ${Math.round(progress)}%`;
    }
}

// 重置上传表单
function resetUploadForm() {
    document.getElementById('uploadDocumentForm').reset();
    const progressBar = document.querySelector('#uploadDocumentModal .progress-bar');
    const progressText = document.querySelector('#uploadDocumentModal .progress-text');
    
    if (progressBar) {
        progressBar.style.width = '0%';
        progressBar.setAttribute('aria-valuenow', 0);
    }
    
    if (progressText) {
        progressText.textContent = '';
    }
}

// 下载文档
async function downloadDocument(documentId) {
    const doc = documentsCache.find(d => d.id === documentId);
    if (!doc) {
        Utils.showNotification('文档不存在', 'danger');
        return;
    }
    
    try {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.originalName || doc.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 记录活动
        await recordActivity('document_downloaded', {
            documentId: documentId,
            documentName: doc.name
        });
        
    } catch (error) {
        console.error('下载文档失败:', error);
        Utils.showNotification('下载文档失败', 'danger');
    }
}

// 预览文档
function viewDocument(documentId) {
    const doc = documentsCache.find(d => d.id === documentId);
    if (!doc) {
        Utils.showNotification('文档不存在', 'danger');
        return;
    }
    
    // 在新窗口中打开文档
    window.open(doc.url, '_blank');
    
    // 记录活动
    recordActivity('document_viewed', {
        documentId: documentId,
        documentName: doc.name
    });
}

// 编辑文档信息
function editDocument(documentId) {
    const doc = documentsCache.find(d => d.id === documentId);
    if (!doc) {
        Utils.showNotification('文档不存在', 'danger');
        return;
    }
    
    // 填充编辑表单
    document.getElementById('editDocumentName').value = doc.name;
    document.getElementById('editDocumentCategory').value = doc.category;
    document.getElementById('editDocumentDescription').value = doc.description || '';
    
    // 设置当前编辑的文档ID
    document.getElementById('editDocumentModal').setAttribute('data-document-id', documentId);
    
    // 显示编辑模态框
    const modal = new bootstrap.Modal(document.getElementById('editDocumentModal'));
    modal.show();
}

// 更新文档信息
async function updateDocument() {
    const modal = document.getElementById('editDocumentModal');
    const documentId = modal.getAttribute('data-document-id');
    
    if (!documentId) {
        Utils.showNotification('文档ID不存在', 'danger');
        return;
    }
    
    const updateData = {
        name: document.getElementById('editDocumentName').value.trim(),
        category: document.getElementById('editDocumentCategory').value,
        description: document.getElementById('editDocumentDescription').value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (!updateData.name) {
        Utils.showNotification('请输入文档名称', 'warning');
        return;
    }
    
    try {
        Utils.showLoading(true);
        
        // 更新数据库
        await db.collection(APP_CONFIG.collections.documents).doc(documentId).update(updateData);
        
        // 记录活动
        await recordActivity('document_updated', {
            documentId: documentId,
            documentName: updateData.name
        });
        
        Utils.showNotification('文档信息更新成功！', 'success');
        
        // 关闭模态框
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        
        // 重新加载文档列表
        await loadDocuments();
        
    } catch (error) {
        console.error('更新文档失败:', error);
        Utils.showNotification('更新文档失败', 'danger');
    } finally {
        Utils.showLoading(false);
    }
}

// 删除文档
async function deleteDocument(documentId) {
    const doc = documentsCache.find(d => d.id === documentId);
    if (!doc) {
        Utils.showNotification('文档不存在', 'danger');
        return;
    }
    
    if (!confirm(`确定要删除文档"${doc.name}"吗？此操作不可撤销。`)) {
        return;
    }
    
    try {
        Utils.showLoading(true);
        
        // 删除 Storage 中的文件
        if (doc.storagePath && storage) {
            try {
                await storage.ref(doc.storagePath).delete();
            } catch (storageError) {
                console.warn('删除存储文件失败:', storageError);
                // 继续删除数据库记录，即使存储文件删除失败
            }
        } else if (doc.storagePath && !storage) {
            console.warn('Storage 服务不可用，无法删除存储文件');
        }
        
        // 删除数据库记录
        await db.collection(APP_CONFIG.collections.documents).doc(documentId).delete();
        
        // 记录活动
        await recordActivity('document_deleted', {
            documentId: documentId,
            documentName: doc.name,
            category: doc.category
        });
        
        Utils.showNotification('文档删除成功', 'success');
        
        // 重新加载文档列表
        await loadDocuments();
        updateDocumentCount();
        
    } catch (error) {
        console.error('删除文档失败:', error);
        Utils.showNotification('删除文档失败', 'danger');
    } finally {
        Utils.showLoading(false);
    }
}

// 搜索文档
function searchDocuments(query) {
    if (!query) {
        renderDocumentsList();
        return;
    }
    
    const filteredDocs = documentsCache.filter(doc => 
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        doc.category.toLowerCase().includes(query.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    const documentsList = document.getElementById('documentsList');
    if (!documentsList) return;
    
    if (filteredDocs.length === 0) {
        documentsList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">没有找到匹配的文档</h5>
                <p class="text-muted">尝试使用其他关键词搜索</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredDocs.forEach(doc => {
        html += createDocumentItem(doc);
    });
    
    documentsList.innerHTML = html;
}

// 按分类筛选文档
function filterDocumentsByCategory(category) {
    if (!category || category === 'all') {
        renderDocumentsList();
        return;
    }
    
    const filteredDocs = documentsCache.filter(doc => doc.category === category);
    
    const documentsList = document.getElementById('documentsList');
    if (!documentsList) return;
    
    if (filteredDocs.length === 0) {
        documentsList.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">该分类下没有文档</h5>
                <p class="text-muted">尝试选择其他分类或上传新文档</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredDocs.forEach(doc => {
        html += createDocumentItem(doc);
    });
    
    documentsList.innerHTML = html;
}

// 更新文档数量
function updateDocumentCount() {
    const documentCountElement = document.getElementById('documentCount');
    if (documentCountElement) {
        documentCountElement.textContent = documentsCache.length;
    }
}

// 文件选择事件处理
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 自动填充文档名称
    const nameInput = document.getElementById('documentName');
    if (nameInput && !nameInput.value) {
        nameInput.value = file.name.split('.')[0];
    }
    
    // 显示文件信息
    const fileInfo = document.getElementById('fileInfo');
    if (fileInfo) {
        fileInfo.innerHTML = `
            <div class="alert alert-info">
                <strong>选择的文件:</strong> ${file.name}<br>
                <strong>文件大小:</strong> ${Utils.formatFileSize(file.size)}<br>
                <strong>文件类型:</strong> ${file.type || '未知'}
            </div>
        `;
    }
    
    // 验证文件
    if (!Utils.isValidFileType(file.type)) {
        Utils.showNotification('不支持的文件类型', 'warning');
        return;
    }
    
    if (file.size > APP_CONFIG.maxFileSize) {
        Utils.showNotification(`文件大小不能超过 ${Utils.formatFileSize(APP_CONFIG.maxFileSize)}`, 'warning');
        return;
    }
}

// 模态框事件监听
document.addEventListener('DOMContentLoaded', function() {
    const uploadModal = document.getElementById('uploadDocumentModal');
    if (uploadModal) {
        uploadModal.addEventListener('hidden.bs.modal', function() {
            resetUploadForm();
        });
    }
    
    const fileInput = document.getElementById('documentFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
});

// 导出函数
window.uploadDocument = uploadDocument;
window.downloadDocument = downloadDocument;
window.viewDocument = viewDocument;
window.editDocument = editDocument;
window.updateDocument = updateDocument;
window.deleteDocument = deleteDocument;
window.searchDocuments = searchDocuments;
window.filterDocumentsByCategory = filterDocumentsByCategory;
window.initializeDocuments = initializeDocuments;

console.log('文档管理模块加载完成');