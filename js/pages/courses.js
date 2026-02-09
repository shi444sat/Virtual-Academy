import firestoreService from '../utils/firestore.js';
import { truncateText } from '../utils/formatters.js';

class CoursesPage {
    constructor() {
        this.coursesContainer = document.getElementById('courses-container');
        this.coursesLoading = document.getElementById('courses-loading');
        this.noCourses = document.getElementById('no-courses');
        this.allCourses = [];
        this.init();
    }

    async init() {
        await this.loadCourses();
        this.setupEventListeners();
    }

    async loadCourses() {
        try {
            this.allCourses = await firestoreService.getDocuments('courses', [], { field: 'order', direction: 'asc' });
            this.renderCourses(this.allCourses);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showNoCourses();
        }
    }

    renderCourses(courses) {
        if (!courses || courses.length === 0) {
            this.showNoCourses();
            return;
        }

        this.coursesContainer.innerHTML = courses.map(course => this.createCourseCard(course)).join('');
    }

    createCourseCard(course) {
        const categoryClass = this.getCategoryClass(course.category);
        
        return `
            <div class="course-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1" data-category="${course.category || 'general'}">
                <div class="relative">
                    ${course.imageUrl ? `
                        <img src="${course.imageUrl}" alt="${course.name}" 
                             class="w-full h-48 object-cover">
                    ` : `
                        <div class="w-full h-48 ${categoryClass.bg} flex items-center justify-center">
                            <i class="fas fa-graduation-cap text-white text-5xl"></i>
                        </div>
                    `}
                    ${course.featured ? `
                        <div class="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            <i class="fas fa-star mr-1"></i> Featured
                        </div>
                    ` : ''}
                    <div class="absolute top-4 right-4 ${categoryClass.text} bg-white px-3 py-1 rounded-full text-sm font-bold">
                        ${course.category || 'General'}
                    </div>
                </div>
                
                <div class="p-6">
                    <h3 class="text-xl font-bold mb-3">${course.name}</h3>
                    <p class="text-gray-600 mb-4">${truncateText(course.description, 120)}</p>
                    
                    <div class="space-y-3 mb-6">
                        ${course.duration ? `
                            <div class="flex items-center text-gray-500">
                                <i class="far fa-clock mr-3 w-5 text-center"></i>
                                <span>${course.duration}</span>
                            </div>
                        ` : ''}
                        ${course.fee ? `
                            <div class="flex items-center text-gray-500">
                                <i class="fas fa-rupee-sign mr-3 w-5 text-center"></i>
                                <span>Fee: ${course.fee}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="flex justify-between items-center">
                         
                        <button class="view-details-btn text-blue-600 hover:text-blue-800 font-semibold text-sm" data-course-id="${course.id}">
                            View Details <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryClass(category) {
        const categories = {
            'school': { bg: 'bg-blue-500', text: 'text-blue-600' },
            'coaching': { bg: 'bg-green-500', text: 'text-green-600' },
            'competitive': { bg: 'bg-purple-500', text: 'text-purple-600' },
            'foundation': { bg: 'bg-yellow-500', text: 'text-yellow-600' }
        };
        return categories[category?.toLowerCase()] || { bg: 'bg-gray-500', text: 'text-gray-600' };
    }

    filterCourses(category) {
        if (category === 'all') {
            this.renderCourses(this.allCourses);
        } else {
            const filtered = this.allCourses.filter(course => 
                course.category?.toLowerCase() === category.toLowerCase()
            );
            this.renderCourses(filtered);
        }
    }

    showCourseDetails(courseId) {
        const course = this.allCourses.find(c => c.id === courseId);
        if (!course) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <span class="px-3 py-1 rounded-full text-sm font-bold ${this.getCategoryClass(course.category).text} bg-gray-100">
                                ${course.category || 'General'}
                            </span>
                            ${course.featured ? `
                                <span class="ml-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                                    <i class="fas fa-star mr-1"></i> Featured
                                </span>
                            ` : ''}
                        </div>
                        <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">
                            &times;
                        </button>
                    </div>
                    
                    <h2 class="text-2xl font-bold mb-4">${course.name}</h2>
                    
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        ${course.duration ? `
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <div class="flex items-center mb-2">
                                    <i class="far fa-clock text-blue-600 mr-3"></i>
                                    <h3 class="font-bold">Duration</h3>
                                </div>
                                <p>${course.duration}</p>
                            </div>
                        ` : ''}
                        
                        ${course.fee ? `
                            <div class="bg-green-50 p-4 rounded-lg">
                                <div class="flex items-center mb-2">
                                    <i class="fas fa-rupee-sign text-green-600 mr-3"></i>
                                    <h3 class="font-bold">Course Fee</h3>
                                </div>
                                <p>${course.fee}</p>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-bold mb-3">Course Description</h3>
                        <div class="prose max-w-none">
                            ${course.description || 'No description available.'}
                        </div>
                    </div>
                    
                    ${course.syllabusUrl ? `
                        <div class="mb-6">
                            <h3 class="text-xl font-bold mb-3">Syllabus</h3>
                            <a href="${course.syllabusUrl}" target="_blank" 
                               class="inline-flex items-center text-blue-600 hover:text-blue-800">
                                <i class="fas fa-file-pdf mr-2"></i> Download Syllabus PDF
                            </a>
                        </div>
                    ` : ''}
                    
                     
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    hideLoading() {
        if (this.coursesLoading) {
            this.coursesLoading.style.display = 'none';
        }
        if (this.coursesContainer) {
            this.coursesContainer.classList.remove('hidden');
        }
    }

    showNoCourses() {
        this.hideLoading();
        if (this.noCourses) {
            this.noCourses.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Category tabs
        const categoryTabs = document.querySelectorAll('.category-tab');
        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                categoryTabs.forEach(t => t.classList.remove('active', 'bg-blue-600', 'text-white'));
                categoryTabs.forEach(t => t.classList.add('bg-gray-200'));
                tab.classList.add('active', 'bg-blue-600', 'text-white');
                tab.classList.remove('bg-gray-200');
                
                // Filter courses
                const category = tab.dataset.category;
                this.filterCourses(category);
            });
        });

        // View details buttons (delegated)
        this.coursesContainer.addEventListener('click', (e) => {
            if (e.target.closest('.view-details-btn')) {
                const courseId = e.target.closest('.view-details-btn').dataset.courseId;
                this.showCourseDetails(courseId);
            }
        });

        // Check URL for course ID
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('id');
        if (courseId) {
            // Scroll to course and show details
            setTimeout(() => {
                this.showCourseDetails(courseId);
            }, 1000);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CoursesPage();
});

export default CoursesPage;