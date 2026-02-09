import firestoreService from '../utils/firestore.js';
import { formatDate } from '../utils/formatters.js';

class ResultsPage {
    constructor() {
        this.resultsContainer = document.getElementById('results-container');
        this.resultsLoading = document.getElementById('results-loading');
        this.noResults = document.getElementById('no-results');
        
        this.allResults = [];
        this.currentYearFilter = 'all';
        this.currentTypeFilter = 'all';
        
        this.init();
    }

    async init() {
        await this.loadResults();
        this.setupEventListeners();
    }

    async loadResults() {
        try {
            this.allResults = await firestoreService.getDocuments('results', [], { field: 'year', direction: 'desc' });
            this.filterResults();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading results:', error);
            this.showNoResults();
        }
    }

    filterResults() {
        let filtered = this.allResults;
        
        // Apply year filter
        if (this.currentYearFilter !== 'all') {
            filtered = filtered.filter(result => 
                result.year?.toString() === this.currentYearFilter
            );
        }
        
        // Apply type filter
        if (this.currentTypeFilter !== 'all') {
            filtered = filtered.filter(result => 
                result.examType?.toLowerCase() === this.currentTypeFilter.toLowerCase()
            );
        }
        
        this.renderResults(filtered);
    }

    renderResults(results) {
        if (!results || results.length === 0) {
            this.showNoResults();
            return;
        }

        this.resultsContainer.innerHTML = results.map(result => this.createResultCard(result)).join('');
    }

    createResultCard(result) {
        const year = result.year || new Date().getFullYear();
        const examType = result.examType || 'General';
        const typeClass = this.getExamTypeClass(examType);
        
        return `
            <div class="result-card bg-white rounded-xl shadow-lg hover:shadow-xl transition p-6" data-year="${year}" data-type="${examType.toLowerCase()}">
                <div class="flex flex-col md:flex-row md:items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <span class="${typeClass.bg} ${typeClass.text} text-sm font-bold px-3 py-1 rounded-full mr-3">
                                ${examType}
                            </span>
                            <span class="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1 rounded-full">
                                ${year}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-2">${result.title}</h3>
                    </div>
                    <div class="md:text-right mt-2 md:mt-0">
                        <div class="text-sm text-gray-500">
                            <i class="far fa-calendar mr-1"></i> ${formatDate(result.date || `${year}-06-01`)}
                        </div>
                    </div>
                </div>
                
                <div class="prose max-w-none mb-4">
                    ${result.description || 'Results information coming soon.'}
                </div>
                
                ${result.highlights && result.highlights.length > 0 ? `
                    <div class="mb-4">
                        <h4 class="font-bold text-gray-700 mb-2">Highlights:</h4>
                        <ul class="list-disc list-inside text-gray-600 space-y-1">
                            ${result.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                    <div class="text-sm text-gray-500">
                        <i class="fas fa-chart-line mr-1"></i> ${this.getResultStatus(result)}
                    </div>
                    
                    <div class="flex items-center space-x-4 mt-2 md:mt-0">
                        ${result.documentUrl ? `
                            <a href="${result.documentUrl}" target="_blank" 
                               class="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                                <i class="fas fa-file-pdf mr-1"></i> Download PDF
                            </a>
                        ` : ''}
                        
                        <button class="view-result-btn text-blue-600 hover:text-blue-800 font-semibold text-sm" data-result-id="${result.id}">
                            <i class="fas fa-expand-alt mr-1"></i> View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getExamTypeClass(type) {
        const types = {
            'board': { bg: 'bg-blue-100', text: 'text-blue-600' },
            'jee': { bg: 'bg-purple-100', text: 'text-purple-600' },
            'neet': { bg: 'bg-green-100', text: 'text-green-600' },
            'olympiad': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            'other': { bg: 'bg-gray-100', text: 'text-gray-600' }
        };
        
        const lowerType = type.toLowerCase();
        if (types[lowerType]) {
            return types[lowerType];
        }
        
        // Check if type contains keywords
        for (const [key, value] of Object.entries(types)) {
            if (lowerType.includes(key)) {
                return value;
            }
        }
        
        return types.other;
    }

    getResultStatus(result) {
        if (result.percentage) {
            return `${result.percentage}% Overall`;
        } else if (result.passPercentage) {
            return `${result.passPercentage}% Pass Rate`;
        } else {
            return 'Results Declared';
        }
    }

    showResultDetails(resultId) {
        const result = this.allResults.find(r => r.id === resultId);
        if (!result) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl font-bold">${result.title}</h2>
                            <div class="flex items-center text-sm text-gray-500 mt-2">
                                <i class="fas fa-graduation-cap mr-2"></i>
                                <span>${result.examType || 'Examination'}</span>
                                <span class="mx-2">•</span>
                                <i class="far fa-calendar mr-2"></i>
                                <span>${result.year || 'N/A'}</span>
                            </div>
                        </div>
                        <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">
                            &times;
                        </button>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 class="font-bold text-gray-700 mb-3">Result Overview</h3>
                            <div class="prose max-w-none">
                                ${result.description || 'No description available.'}
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-bold text-gray-700 mb-3">Key Statistics</h3>
                            <div class="space-y-4">
                                ${result.totalStudents ? `
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Total Students</span>
                                        <span class="font-bold">${result.totalStudents}</span>
                                    </div>
                                ` : ''}
                                
                                ${result.passPercentage ? `
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Pass Percentage</span>
                                        <span class="font-bold text-green-600">${result.passPercentage}%</span>
                                    </div>
                                ` : ''}
                                
                                ${result.topperPercentage ? `
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">90% and Above</span>
                                        <span class="font-bold text-blue-600">${result.topperPercentage}%</span>
                                    </div>
                                ` : ''}
                                
                                ${result.distinctions ? `
                                    <div class="flex justify-between items-center">
                                        <span class="text-gray-600">Distinctions</span>
                                        <span class="font-bold text-purple-600">${result.distinctions}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    ${result.highlights && result.highlights.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-gray-700 mb-3">Achievement Highlights</h3>
                            <ul class="list-disc list-inside text-gray-600 space-y-2 pl-4">
                                ${result.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${result.toppers && result.toppers.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-gray-700 mb-3">Top Performers</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${result.toppers.slice(0, 4).map((topper, index) => `
                                    <div class="bg-gray-50 p-4 rounded-lg">
                                        <div class="flex items-center">
                                            <div class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold mr-3">
                                                ${index + 1}
                                            </div>
                                            <div>
                                                <h4 class="font-bold">${topper.name}</h4>
                                                <p class="text-sm text-gray-600">${topper.score || ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="border-t pt-6">
                        <div class="flex flex-wrap gap-4">
                            ${result.documentUrl ? `
                                <a href="${result.documentUrl}" target="_blank" 
                                   class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                                    <i class="fas fa-download mr-2"></i> Download Full Results
                                </a>
                            ` : ''}
                            
                            <button class="close-modal border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">
                                Close
                            </button>
                        </div>
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
        if (this.resultsLoading) {
            this.resultsLoading.style.display = 'none';
        }
    }

    showNoResults() {
        this.hideLoading();
        if (this.noResults) {
            this.noResults.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Year filters
        const yearFilters = document.querySelectorAll('.year-filter');
        yearFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                yearFilters.forEach(f => {
                    f.classList.remove('active', 'bg-amber-600', 'text-white');
                    f.classList.add('bg-gray-200');
                });
                filter.classList.add('active', 'bg-amber-600', 'text-white');
                filter.classList.remove('bg-gray-200');
                
                this.currentYearFilter = filter.dataset.year;
                this.filterResults();
            });
        });

        // Type filters
        const typeFilters = document.querySelectorAll('.type-filter');
        typeFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                typeFilters.forEach(f => {
                    f.classList.remove('active', 'bg-blue-600', 'text-white');
                    f.classList.add('bg-gray-200');
                });
                filter.classList.add('active', 'bg-blue-600', 'text-white');
                filter.classList.remove('bg-gray-200');
                
                this.currentTypeFilter = filter.dataset.type;
                this.filterResults();
            });
        });

        // View result buttons (delegated)
        this.resultsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.view-result-btn')) {
                const resultId = e.target.closest('.view-result-btn').dataset.resultId;
                this.showResultDetails(resultId);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ResultsPage();
});

export default ResultsPage;