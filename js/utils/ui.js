// UI Utility functions

export function showToast(message, type = 'info') {
    // Remove existing toasts
    const existing = document.querySelector('.toast-container');
    if (existing) existing.remove();

    // Create toast container
    const container = document.createElement('div');
    container.className = 'toast-container fixed top-4 right-4 z-50';
    
    const toast = document.createElement('div');
    toast.className = `flex items-center p-4 mb-4 rounded-lg shadow-lg ${getToastClass(type)} animate-fade-in`;
    toast.innerHTML = `
        <i class="fas ${getToastIcon(type)} mr-3"></i>
        <span class="flex-1">${message}</span>
        <button onclick="this.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    document.body.appendChild(container);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastClass(type) {
    const classes = {
        success: 'bg-green-100 text-green-800 border border-green-300',
        error: 'bg-red-100 text-red-800 border border-red-300',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        info: 'bg-blue-100 text-blue-800 border border-blue-300'
    };
    return classes[type] || classes.info;
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        warning: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    return icons[type] || 'fa-info-circle';
}

export function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        `;
    }
}

export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container && container.querySelector('.animate-spin')) {
        container.innerHTML = '';
    }
}

export function formatPhoneNumber(phone) {
    // Format Indian phone numbers
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    } else if (cleaned.length > 10) {
        return '+' + cleaned.slice(0, -10) + ' ' + cleaned.slice(-10).replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return phone;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return re.test(cleanPhone);
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function createPagination(currentPage, totalPages, containerId) {
    const container = document.getElementById(containerId);
    if (!container || totalPages <= 1) return;
    
    let html = '<div class="flex items-center space-x-2">';
    
    // Previous button
    if (currentPage > 1) {
        html += `
            <button class="pagination-btn px-3 py-1 rounded border hover:bg-gray-100" data-page="${currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `
                <button class="pagination-btn px-3 py-1 rounded border ${i === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="px-2">...</span>';
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        html += `
            <button class="pagination-btn px-3 py-1 rounded border hover:bg-gray-100" data-page="${currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}