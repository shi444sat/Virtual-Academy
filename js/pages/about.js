import firestoreService from '../utils/firestore.js';
import { formatDate } from '../utils/formatters.js';

class AboutPage {
    constructor() {
        this.aboutContent = document.getElementById('about-content');
        this.init();
    }

    async init() {
        await this.render();
        this.attachEventListeners();
    }

    async render() {
        try {
            const aboutData = await firestoreService.getDocument('pages', 'about');
            this.aboutContent.innerHTML = this.generateHTML(aboutData);
            await this.updateStats();
        } catch (error) {
            console.error('Error loading about page:', error);
            this.showError();
        }
    }

    generateHTML(data) {
        if (!data) {
            return this.getDefaultContent();
        }

        return `
            <div class="max-w-4xl mx-auto">
                <!-- Mission & Vision -->
                <div class="grid md:grid-cols-2 gap-8 mb-12">
                    <div class="bg-blue-50 p-6 rounded-xl">
                        <div class="text-blue-600 text-3xl mb-4">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <h2 class="text-2xl font-bold mb-4">Our Mission</h2>
                        <p class="text-gray-700">${data.mission || 'To provide quality education that empowers students to achieve their full potential and become responsible global citizens.'}</p>
                    </div>
                    <div class="bg-purple-50 p-6 rounded-xl">
                        <div class="text-purple-600 text-3xl mb-4">
                            <i class="fas fa-eye"></i>
                        </div>
                        <h2 class="text-2xl font-bold mb-4">Our Vision</h2>
                        <p class="text-gray-700">${data.vision || 'To be a premier educational institution recognized for excellence in holistic education and innovation.'}</p>
                    </div>
                </div>

                <!-- About Content -->
                <div class="prose max-w-none mb-12">
                    ${data.content || this.getDefaultAboutContent()}
                </div>

                <!-- Values -->
                ${data.values && data.values.length > 0 ? this.renderValues(data.values) : this.renderDefaultValues()}

                <!-- History -->
                ${data.history ? `
                    <div class="mb-12">
                        <h2 class="text-3xl font-bold mb-6">Our Journey</h2>
                        <div class="bg-gray-50 p-6 rounded-xl">
                            <p class="text-gray-700">${data.history}</p>
                        </div>
                    </div>
                ` : ''}

                <!-- Image if available -->
                ${data.imageUrl ? `
                    <div class="mb-12">
                        <img src="${data.imageUrl}" alt="About ${data.title || 'Virtual Academy'}" 
                             class="w-full h-96 object-cover rounded-xl shadow-lg">
                    </div>
                ` : ''}

                <!-- Leadership Team -->
                <div class="mb-12">
                    <h2 class="text-3xl font-bold mb-6">Leadership Team</h2>
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-user-tie text-white text-4xl"></i>
                            </div>
                            <h3 class="text-xl font-bold">Er. Chandan jha</h3>
                            <p class="text-gray-600">Principal & Director</p>
                            <p class="text-sm text-gray-500 mt-2">Mtech, 25+ years experience</p>
                        </div>
                        <div class="text-center">
                            <div class="w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-teal-500 mx-auto mb-4 flex items-center justify-center">
                                <i class="fas fa-chalkboard-teacher text-white text-4xl"></i>
                            </div>
                            <h3 class="text-xl font-bold">Ms. Deeksha Priya</h3>
                            <p class="text-gray-600">Academic Head</p>
                            <p class="text-sm text-gray-500 mt-2">, 15+ years in curriculum design</p>
                        </div>
                        
                            
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultContent() {
        return `
            <div class="max-w-4xl mx-auto">
                <div class="text-center py-12">
                    <div class="text-gray-400 text-6xl mb-4">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-600 mb-2">About Content Coming Soon</h2>
                    <p class="text-gray-500">Information about our institution will be added shortly.</p>
                </div>
            </div>
        `;
    }

    getDefaultAboutContent() {
        return `
            <h2 class="text-3xl font-bold mb-6">Welcome to Virtual Academy</h2>
            <p class="text-lg text-gray-700 mb-4">
                Established in 2005, Virtual Academy has been at the forefront of providing quality education 
                that combines traditional schooling with modern coaching techniques. Our institution was founded 
                with a vision to create a learning environment that nurtures both academic excellence and 
                personal growth.
            </p>
            <p class="text-lg text-gray-700 mb-4">
                Over the years, we have grown from a small coaching center to a comprehensive educational 
                institution offering school programs from grades 1-12 along with specialized coaching for 
                competitive examinations like JEE, NEET, and foundation courses.
            </p>
            <p class="text-lg text-gray-700 mb-6">
                Our campus spans over 5 acres with state-of-the-art facilities including smart classrooms, 
                science and computer laboratories, a well-stocked library, and sports facilities. We believe 
                in holistic education that develops students intellectually, physically, and emotionally.
            </p>
        `;
    }

    renderValues(values) {
        return `
            <div class="mb-12">
                <h2 class="text-3xl font-bold mb-6">Our Core Values</h2>
                <div class="grid md:grid-cols-3 gap-6">
                    ${values.map((value, index) => `
                        <div class="bg-white p-6 rounded-xl shadow border border-gray-100">
                            <div class="text-3xl text-blue-600 mb-4">
                                ${this.getValueIcon(index)}
                            </div>
                            <h3 class="text-xl font-bold mb-3">${value.title || `Value ${index + 1}`}</h3>
                            <p class="text-gray-600">${value.description || ''}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderDefaultValues() {
        const defaultValues = [
            {
                title: 'Excellence',
                description: 'Striving for the highest standards in education and student development'
            },
            {
                title: 'Integrity',
                description: 'Upholding ethical standards and honesty in all our actions'
            },
            {
                title: 'Innovation',
                description: 'Embracing new teaching methodologies and technologies'
            },
            {
                title: 'Inclusivity',
                description: 'Providing equal opportunities for all students'
            },
            {
                title: 'Collaboration',
                description: 'Working together with parents and community'
            },
            {
                title: 'Respect',
                description: 'Valuing diversity and individual differences'
            }
        ];

        return this.renderValues(defaultValues);
    }

    getValueIcon(index) {
        const icons = [
            '<i class="fas fa-trophy"></i>',
            '<i class="fas fa-shield-alt"></i>',
            '<i class="fas fa-lightbulb"></i>',
            '<i class="fas fa-users"></i>',
            '<i class="fas fa-handshake"></i>',
            '<i class="fas fa-heart"></i>'
        ];
        return icons[index] || '<i class="fas fa-star"></i>';
    }

    async updateStats() {
        try {
            // Get counts for stats
            const [courses, faculty, notices, events] = await Promise.all([
                firestoreService.getDocuments('courses'),
                firestoreService.getDocuments('faculty'),
                firestoreService.getActiveNotices(),
                firestoreService.getUpcomingEvents()
            ]);

            // Animate stats counter
            this.animateCounter('courses-count', courses.length);
            this.animateCounter('faculty-count', faculty.length);
            this.animateCounter('notices-count', notices.length);
            this.animateCounter('events-count', events.length);

        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const duration = 2000; // 2 seconds
        const steps = 60;
        const increment = (targetValue - currentValue) / steps;
        let current = currentValue;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            
            if (step >= steps) {
                element.textContent = targetValue + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, duration / steps);
    }

    showError() {
        this.aboutContent.innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-500 text-6xl mb-4">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="text-2xl font-bold text-gray-600 mb-2">Unable to Load Content</h2>
                <p class="text-gray-500 mb-6">Please check your internet connection and try again.</p>
                <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">
                    <i class="fas fa-redo mr-2"></i> Reload Page
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        // Add any about page specific event listeners here
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const aboutPage = new AboutPage();
});

export default AboutPage;