import firestoreService from '../utils/firestore.js';
import { formatDate, formatRelativeTime } from '../utils/formatters.js';

class NoticesPage {
    constructor() {
        this.noticesContainer = document.getElementById('notices-container');
        this.noticesLoading = document.getElementById('notices-loading');
        this.noNotices = document.getElementById('no-notices');
        this.loadMoreBtn = document.getElementById('load-more');
        this.searchInput = document.getElementById('search-notices');
        
        this.allNotices = [];
        this.filteredNotices = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.batchSize = 10;
        this.displayedCount = 0;
        
        this.init();
    }

    async init() {
        await this.loadNotices();
        this.setupEventListeners();
    }

    async loadNotices() {
        try {
            this.allNotices = await firestoreService.getActiveNotices(100); // Load more for pagination
            this.filteredNotices = [...this.allNotices];
            this.displayNotices();
            this.hideLoading();
            this.updateLoadMoreButton();
        } catch (error) {
            console.error('Error loading notices:', error);
            this.showNoNotices();
        }
    }

    displayNotices() {
        const noticesToShow = this.filteredNotices.slice(0, this.displayedCount + this.batchSize);
        this.displayedCount = noticesToShow.length;
        
        if (noticesToShow.length === 0) {
            this.showNoNotices();
            return;
        }
        
        this.noticesContainer.innerHTML = noticesToShow.map(notice => this.createNoticeCard(notice)).join('');
        
        if (this.displayedCount >= this.filteredNotices.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
        }
    }

    createNoticeCard(notice) {
        const isImportant = notice.important;
        const categoryClass = this.getCategoryClass(notice.category);
        
        return `
            <div class="notice-card bg-white rounded-xl shadow border-l-4 ${isImportant ? 'border-red-500' : categoryClass.border} p-6 hover:shadow-md transition" data-category="${notice.category || 'general'}">
                <div class="flex flex-col md:flex-row md:items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            ${isImportant ? `
                                <span class="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full mr-3">
                                    <i class="fas fa-exclamation-circle mr-1"></i> IMPORTANT
                                </span>
                            ` : ''}
                            <span class="${categoryClass.text} bg-gray-100 text-xs font-semibold px-3 py-1 rounded-full">
                                ${notice.category || 'General'}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${notice.title}</h3>
                    </div>
                    <div class="md:text-right mt-2 md:mt-0">
                        <div class="text-sm text-gray-500">
                            <i class="far fa-calendar mr-1"></i> ${formatDate(notice.publishDate)}
                        </div>
                        ${notice.expiryDate ? `
                            <div class="text-sm text-gray-500 mt-1">
                                <i class="far fa-clock mr-1"></i> Valid until: ${formatDate(notice.expiryDate)}
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="prose max-w-none mb-4">
                    ${notice.content || ''}
                </div>
                
                <div class="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                    <div class="text-sm text-gray-500">
                        <i class="far fa-clock mr-1"></i> ${formatRelativeTime(notice.publishDate)}
                    </div>
                    
                    <div class="flex items-center space-x-4 mt-2 md:mt-0">
                        ${notice.attachmentUrl ? `
                            <a href="${notice.attachmentUrl}" target="_blank" 
                               class="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                                <i class="fas fa-paperclip mr-1"></i> Attachment
                            </a>
                        ` : ''}
                        
                        <button class="view-notice-btn text-blue-600 hover:text-blue-800 text-sm font-semibold" data-notice-id="${notice.id}">
                            <i class="fas fa-expand-alt mr-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryClass(category) {
        const categories = {
            'academic': { border: 'border-blue-500', text: 'text-blue-600' },
            'examination': { border: 'border-green-500', text: 'text-green-600' },
            'holiday': { border: 'border-yellow-500', text: 'text-yellow-600' },
            'important': { border: 'border-red-500', text: 'text-red-600' },
            'general': { border: 'border-gray-500', text: 'text-gray-600' }
        };
        return categories[category?.toLowerCase()] || categories.general;
    }

    filterNotices(filter) {
        this.currentFilter = filter;
        this.displayedCount = 0;
        
        if (filter === 'all') {
            this.filteredNotices = [...this.allNotices];
        } else if (filter === 'important') {
            this.filteredNotices = this.allNotices.filter(notice => notice.important === true);
        } else {
            this.filteredNotices = this.allNotices.filter(notice => 
                notice.category?.toLowerCase() === filter.toLowerCase()
            );
        }
        
        // Apply search filter if any
        if (this.currentSearch) {
            this.filteredNotices = this.filteredNotices.filter(notice =>
                this.searchNotice(notice, this.currentSearch)
            );
        }
        
        // Sort by date (newest first)
        this.filteredNotices.sort((a, b) => 
            new Date(b.publishDate) - new Date(a.publishDate)
        );
        
        this.displayNotices();
    }

    searchNotice(notice, query) {
        const searchText = query.toLowerCase();
        return (
            (notice.title && notice.title.toLowerCase().includes(searchText)) ||
            (notice.content && notice.content.toLowerCase().includes(searchText)) ||
            (notice.category && notice.category.toLowerCase().includes(searchText))
        );
    }

    showNoticeDetails(noticeId) {
        const notice = this.allNotices.find(n => n.id === noticeId);
        if (!notice) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            ${notice.important ? `
                                <span class="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full mr-3">
                                    <i class="fas fa-exclamation-circle mr-1"></i> IMPORTANT NOTICE
                                </span>
                            ` : ''}
                            <span class="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                                ${notice.category || 'General'}
                            </span>
                        </div>
                        <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">
                            &times;
                        </button>
                    </div>
                    
                    <h2 class="text-2xl font-bold mb-4">${notice.title}</h2>
                    
                    <div class="flex flex-wrap items-center text-sm text-gray-500 mb-6 space-x-4">
                        <div>
                            <i class="far fa-calendar mr-1"></i> Published: ${formatDate(notice.publishDate)}
                        </div>
                        ${notice.expiryDate ? `
                            <div>
                                <i class="far fa-clock mr-1"></i> Valid until: ${formatDate(notice.expiryDate)}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="prose max-w-none mb-6">
                        ${notice.content || 'No content available.'}
                    </div>
                    
                    ${notice.attachmentUrl ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-gray-700 mb-2">Attachments</h3>
                            <a href="${notice.attachmentUrl}" target="_blank" 
                               class="inline-flex items-center bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">
                                <i class="fas fa-paperclip mr-2"></i> Download Attachment
                            </a>
                        </div>
                    ` : ''}
                    
                    <div class="border-t pt-6 text-center">
                        <button class="close-modal bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    hideLoading() {
        if (this.noticesLoading) {
            this.noticesLoading.style.display = 'none';
        }
    }

    showNoNotices() {
        this.hideLoading();
        if (this.noNotices) {
            this.noNotices.classList.remove('hidden');
        }
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = 'none';
        }
    }

    updateLoadMoreButton() {
        if (this.displayedCount >= this.filteredNotices.length) {
            this.loadMoreBtn.style.display = 'none';
        } else {
            this.loadMoreBtn.style.display = 'block';
        }
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-red-600', 'text-white');
                    btn.classList.add('bg-gray-200');
                });
                button.classList.add('active', 'bg-red-600', 'text-white');
                button.classList.remove('bg-gray-200');
                
                this.filterNotices(button.dataset.filter);
            });
        });

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.filterNotices(this.currentFilter);
            });
        }

        // Load more button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.displayedCount += this.batchSize;
                this.displayNotices();
            });
        }

        // View notice buttons (delegated)
        this.noticesContainer.addEventListener('click', (e) => {
            if (e.target.closest('.view-notice-btn')) {
                const noticeId = e.target.closest('.view-notice-btn').dataset.noticeId;
                this.showNoticeDetails(noticeId);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NoticesPage();
});

export default NoticesPage;