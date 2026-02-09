// Utility functions for formatting data

export function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}

export function formatTime(timeString) {
    if (!timeString) return '';
    
    // Check if it's already in 12-hour format
    if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
    }
    
    // Try to parse as 24-hour time
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        return timeString;
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
}

export function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return 'Invalid Date';
    }
}

export function formatRelativeTime(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) {
            return 'Just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
        } else {
            return formatDate(dateString);
        }
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return '';
    }
}

export function truncateText(text, maxLength = 100) {
    if (!text || typeof text !== 'string') return '';
    
    if (text.length <= maxLength) {
        return text;
    }
    
    // Find the last space before maxLength
    let truncated = text.substr(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > 0) {
        truncated = truncated.substr(0, lastSpace);
    }
    
    return truncated + '...';
}

export function formatCurrency(amount, currency = '₹') {
    if (!amount || isNaN(amount)) return '';
    
    // Convert to number
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
    
    if (isNaN(num)) return amount;
    
    // Format with commas
    return `${currency}${num.toLocaleString('en-IN')}`;
}

export function sanitizeHTML(html) {
    if (!html) return '';
    
    // Basic HTML sanitization
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Remove script tags
    const scripts = div.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }
    
    // Remove event handlers
    const allElements = div.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        const attributes = element.attributes;
        
        for (let j = attributes.length - 1; j >= 0; j--) {
            const attr = attributes[j].name.toLowerCase();
            if (attr.startsWith('on') || attr === 'href' && attributes[j].value.toLowerCase().startsWith('javascript:')) {
                element.removeAttribute(attr);
            }
        }
    }
    
    return div.innerHTML;
}

export function createSlug(text) {
    if (!text) return '';
    
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
        .trim();
}

export function getFileIcon(filename) {
    if (!filename) return 'file';
    
    const extension = filename.split('.').pop().toLowerCase();
    
    const icons = {
        pdf: 'file-pdf',
        doc: 'file-word',
        docx: 'file-word',
        xls: 'file-excel',
        xlsx: 'file-excel',
        ppt: 'file-powerpoint',
        pptx: 'file-powerpoint',
        jpg: 'file-image',
        jpeg: 'file-image',
        png: 'file-image',
        gif: 'file-image',
        txt: 'file-alt',
        zip: 'file-archive',
        rar: 'file-archive'
    };
    
    return icons[extension] || 'file';
}

export function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePhone(phone) {
    // Accepts international format
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

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}