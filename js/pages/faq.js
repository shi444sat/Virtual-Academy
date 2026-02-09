import firestoreService from '../utils/firestore.js';

class FAQPage {
    constructor() {
        this.faqsContainer = document.getElementById('faqs-container');
        this.faqsLoading = document.getElementById('faqs-loading');
        this.noFaqs = document.getElementById('no-faqs');
        this.searchInput = document.getElementById('search-faq');
        
        this.allFAQs = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        
        this.init();
    }

    async init() {
        await this.loadFAQs();
        this.setupEventListeners();
    }

    async loadFAQs() {
        try {
            this.allFAQs = await firestoreService.getDocuments('faqs', [], { field: 'order', direction: 'asc' });
            this.filterFAQs('all');
            this.hideLoading();
        } catch (error) {
            console.error('Error loading FAQs:', error);
            this.showNoFAQs();
        }
    }

    filterFAQs(category) {
        this.currentFilter = category;
        
        let filteredFAQs = this.allFAQs;
        
        if (category !== 'all') {
            filteredFAQs = this.allFAQs.filter(faq => 
                faq.category?.toLowerCase() === category.toLowerCase()
            );
        }
        
        // Apply search filter if any
        if (this.currentSearch) {
            filteredFAQs = filteredFAQs.filter(faq =>
                this.searchFAQ(faq, this.currentSearch)
            );
        }
        
        this.renderFAQs(filteredFAQs);
    }

    searchFAQ(faq, query) {
        const searchText = query.toLowerCase();
        return (
            (faq.question && faq.question.toLowerCase().includes(searchText)) ||
            (faq.answer && faq.answer.toLowerCase().includes(searchText)) ||
            (faq.category && faq.category.toLowerCase().includes(searchText))
        );
    }

    renderFAQs(faqs) {
        if (!faqs || faqs.length === 0) {
            this.showNoFAQs();
            return;
        }

        this.faqsContainer.innerHTML = faqs.map(faq => this.createFAQItem(faq)).join('');
        
        // Initialize accordion behavior
        this.initAccordions();
    }

    createFAQItem(faq) {
        const categoryClass = this.getCategoryClass(faq.category);
        
        return `
            <div class="faq-item bg-white rounded-xl shadow border border-gray-100 overflow-hidden" data-category="${faq.category || 'general'}">
                <button class="faq-question w-full text-left p-6 hover:bg-gray-50 transition flex justify-between items-center">
                    <div class="flex items-center">
                        <span class="${categoryClass.bg} ${categoryClass.text} text-xs font-semibold px-3 py-1 rounded-full mr-4">
                            ${faq.category || 'General'}
                        </span>
                        <span class="text-lg font-semibold text-gray-800">${faq.question}</span>
                    </div>
                    <i class="fas fa-chevron-down text-gray-400 transition-transform"></i>
                </button>
                <div class="faq-answer overflow-hidden max-h-0 transition-all duration-300">
                    <div class="p-6 pt-0">
                        <div class="prose max-w-none text-gray-600">
                            ${faq.answer || 'Answer coming soon...'}
                        </div>
                        ${faq.relatedLinks && faq.relatedLinks.length > 0 ? `
                            <div class="mt-4">
                                <h4 class="font-bold text-gray-700 mb-2">Related Links:</h4>
                                <ul class="space-y-1">
                                    ${faq.relatedLinks.map(link => `
                                        <li>
                                            <a href="${link.url}" class="text-blue-600 hover:text-blue-800">
                                                <i class="fas fa-external-link-alt mr-2"></i> ${link.text}
                                            </a>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryClass(category) {
        const categories = {
            'admission': { bg: 'bg-blue-100', text: 'text-blue-600' },
            'academic': { bg: 'bg-green-100', text: 'text-green-600' },
            'fee': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            'facility': { bg: 'bg-purple-100', text: 'text-purple-600' },
            'examination': { bg: 'bg-red-100', text: 'text-red-600' },
            'other': { bg: 'bg-gray-100', text: 'text-gray-600' }
        };
        
        const lowerCategory = category?.toLowerCase();
        return categories[lowerCategory] || categories.other;
    }

    initAccordions() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const answer = question.nextElementSibling;
                const icon = question.querySelector('i');
                
                // Close other open FAQs
                faqQuestions.forEach(otherQuestion => {
                    if (otherQuestion !== question) {
                        const otherAnswer = otherQuestion.nextElementSibling;
                        const otherIcon = otherQuestion.querySelector('i');
                        
                        if (otherAnswer.style.maxHeight) {
                            otherAnswer.style.maxHeight = null;
                            otherIcon.classList.remove('rotate-180');
                            otherQuestion.classList.remove('bg-gray-50');
                        }
                    }
                });
                
                // Toggle current FAQ
                if (answer.style.maxHeight) {
                    answer.style.maxHeight = null;
                    icon.classList.remove('rotate-180');
                    question.classList.remove('bg-gray-50');
                } else {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    icon.classList.add('rotate-180');
                    question.classList.add('bg-gray-50');
                }
            });
        });
        
        // Open first FAQ by default
        if (faqQuestions.length > 0) {
            faqQuestions[0].click();
        }
    }

    hideLoading() {
        if (this.faqsLoading) {
            this.faqsLoading.style.display = 'none';
        }
    }

    showNoFAQs() {
        this.hideLoading();
        if (this.noFaqs) {
            this.noFaqs.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Category filters
        const categoryFilters = document.querySelectorAll('.faq-category');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                categoryFilters.forEach(f => {
                    f.classList.remove('active', 'bg-violet-600', 'text-white');
                    f.classList.add('bg-gray-200');
                });
                filter.classList.add('active', 'bg-violet-600', 'text-white');
                filter.classList.remove('bg-gray-200');
                
                this.filterFAQs(filter.dataset.category);
            });
        });

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.filterFAQs(this.currentFilter);
            });
            
            // Add clear search button
            const searchContainer = this.searchInput.parentElement;
            const clearButton = document.createElement('button');
            clearButton.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600';
            clearButton.innerHTML = '<i class="fas fa-times"></i>';
            clearButton.style.display = 'none';
            
            clearButton.addEventListener('click', () => {
                this.searchInput.value = '';
                this.currentSearch = '';
                this.filterFAQs(this.currentFilter);
                clearButton.style.display = 'none';
            });
            
            searchContainer.appendChild(clearButton);
            
            this.searchInput.addEventListener('input', () => {
                clearButton.style.display = this.searchInput.value ? 'block' : 'none';
            });
        }

        // Quick links
        const quickLinks = document.querySelectorAll('.quick-link');
        quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    this.scrollToCategory(targetId);
                }
            });
        });
    }

    scrollToCategory(category) {
        const targetFilter = document.querySelector(`[data-category="${category}"]`);
        if (targetFilter) {
            // Update active filter
            const categoryFilters = document.querySelectorAll('.faq-category');
            categoryFilters.forEach(f => {
                f.classList.remove('active', 'bg-violet-600', 'text-white');
                f.classList.add('bg-gray-200');
            });
            
            const correspondingFilter = document.querySelector(`[data-category="${category}"]`);
            if (correspondingFilter) {
                correspondingFilter.classList.add('active', 'bg-violet-600', 'text-white');
                correspondingFilter.classList.remove('bg-gray-200');
            }
            
            // Filter and scroll
            this.filterFAQs(category);
            setTimeout(() => {
                this.faqsContainer.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FAQPage();
});

export default FAQPage;