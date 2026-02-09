// public-site/js/pages/home.js
import firestoreService from '../utils/firestore.js';
import { formatDate, truncateText } from '../utils/formatters.js';

class HomePage {
    constructor() {
        this.mainContent = document.getElementById('main-content');
    }

  async render() {
    try {
        const [
            homeContent,
            courses,
            notices,
            events,
            testimonials
        ] = await Promise.all([
            firestoreService.getDocument('pages', 'home'),
            firestoreService.getDocuments('courses'),
            firestoreService.getDocuments('notices'),
            firestoreService.getDocuments('events'),
            firestoreService.getDocuments('testimonials')
        ]);

        // Local limiting (SAFE)
        const featuredCourses = (courses || []).slice(0, 6);
        const activeNotices = (notices || []).slice(0, 5);
        const upcomingEvents = (events || []).slice(0, 3);
        const latestTestimonials = (testimonials || []).slice(0, 4);

        this.mainContent.innerHTML = this.generateHTML(
            homeContent,
            featuredCourses,
            activeNotices,
            upcomingEvents,
            latestTestimonials
        );

        this.attachEventListeners();

    } catch (error) {
        console.error('Error loading home page:', error);
        this.mainContent.innerHTML = `
            <div class="text-center text-red-500 py-20">
                Failed to load home page content.
            </div>
        `;
    }
}


    generateHTML(home, courses, notices, events, testimonials) {
        return `
            <!-- Hero Section -->
            <section class="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
                <div class="absolute inset-0 bg-black opacity-50"></div>
                <div class="container mx-auto px-4 py-24 relative z-10">
                    <div class="max-w-3xl">
                        <h1 class="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">${home?.heroTitle || 'Excellence in Education'}</h1>
                        <p class="text-xl mb-8 opacity-90">${home?.heroSubtitle || 'Combining traditional schooling with modern coaching techniques'}</p>
                        <div class="flex flex-wrap gap-4">
                            
                            <a href="courses.html" class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition">
                                Explore Courses
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Highlights -->
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-center mb-12">Why Choose Virtual Academy?</h2>
                    <div class="grid md:grid-cols-3 gap-8">
                        ${this.renderHighlights(home?.highlights || [])}
                    </div>
                </div>
            </section>

            <!-- Featured Courses -->
            <section class="py-16 bg-gray-50">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center mb-12">
                        <h2 class="text-3xl font-bold">Featured Courses</h2>
                        <a href="courses.html" class="text-blue-600 hover:text-blue-800 font-semibold">
                            View All <i class="fas fa-arrow-right ml-2"></i>
                        </a>
                    </div>
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${this.renderCourses(courses)}
                    </div>
                </div>
            </section>

            <!-- Notices & Events -->
            <section class="py-16 bg-white">
                <div class="container mx-auto px-4">
                    <div class="grid lg:grid-cols-2 gap-12">
                        <!-- Notices -->
                        <div>
                            <h3 class="text-2xl font-bold mb-6 flex items-center">
                                <i class="fas fa-bullhorn text-blue-600 mr-3"></i>
                                Latest Notices
                            </h3>
                            <div class="space-y-4">
                                ${this.renderNotices(notices)}
                            </div>
                             
                        </div>

                        <!-- Upcoming Events -->
                        <div>
                            <h3 class="text-2xl font-bold mb-6 flex items-center">
                                <i class="fas fa-calendar-alt text-purple-600 mr-3"></i>
                                Upcoming Events
                            </h3>
                            <div class="space-y-6">
                                ${this.renderEvents(events)}
                            </div>
                            
                        </div>
                    </div>
                </div>
            </section>

            <!-- Testimonials -->
            <section class="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
                <div class="container mx-auto px-4">
                    <h2 class="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
                    <div class="grid md:grid-cols-2 gap-8">
                        ${this.renderTestimonials(testimonials)}
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 bg-blue-600 text-white">
                <div class="container mx-auto px-4 text-center">
                    <h2 class="text-4xl font-bold mb-6">Ready to Begin Your Journey?</h2>
                    <p class="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                        ${home?.ctaText || 'Join thousands of successful students who started their journey with us.'}
                    </p>
                   <div class="flex flex-wrap justify-center gap-6">
                         
                        <a href="contact.html" class="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-blue-600 transition">
                            Schedule a Visit
                        </a>
                    </div>
                </div>
            </section>
        `;
    }

    renderHighlights(highlights) {
        const defaultHighlights = [
            { title: 'Expert Faculty', description: 'Experienced teachers and industry professionals' },
            { title: 'Modern Infrastructure', description: 'State-of-the-art labs and digital classrooms' },
            { title: 'Proven Results', description: 'Consistent top ranks in board and competitive exams' }
        ];

        const items = highlights.length > 0 ? highlights : defaultHighlights;
        
        return items.map(item => `
            <div class="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-star text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold mb-3">${item.title}</h3>
                <p class="text-gray-600">${item.description}</p>
            </div>
        `).join('');
    }

    renderCourses(courses) {
        if (courses.length === 0) {
            return '<p class="col-span-3 text-center text-gray-500">Courses coming soon...</p>';
        }

        return courses.map(course => `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                ${course.imageUrl ? `
                    <img src="${course.imageUrl}" alt="${course.name}" class="w-full h-48 object-cover">
                ` : `
                    <div class="w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                        <i class="fas fa-graduation-cap text-white text-5xl"></i>
                    </div>
                `}
                <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-xl font-bold">${course.name}</h3>
                        <span class="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                            ${course.category || 'General'}
                        </span>
                    </div>
                    <p class="text-gray-600 mb-4">${truncateText(course.description, 100)}</p>
                    <div class="flex justify-between items-center mt-4">
                        <span class="font-bold text-blue-600">₹${course.fee || 'Contact'}</span>
                        <a href="courses.html#${course.id}" class="text-blue-600 hover:text-blue-800 font-semibold">
                            Learn More <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderNotices(notices) {
        if (notices.length === 0) {
            return '<p class="text-gray-500">No notices at the moment.</p>';
        }

        return notices.map(notice => `
            <div class="border-l-4 ${notice.important ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'} p-4 rounded-r-lg">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-bold ${notice.important ? 'text-red-800' : 'text-gray-800'}">${notice.title}</h4>
                        <p class="text-sm text-gray-600 mt-1">${truncateText(notice.content, 80)}</p>
                    </div>
                    ${notice.important ? '<span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Important</span>' : ''}
                </div>
                <p class="text-xs text-gray-500 mt-2">${formatDate(notice.publishDate)}</p>
            </div>
        `).join('');
    }

    renderEvents(events) {
        if (events.length === 0) {
            return '<p class="text-gray-500">No upcoming events.</p>';
        }

        return events.map(event => `
            <div class="flex items-start space-x-4">
                
                <div>
                    <h4 class="font-bold text-lg">${event.title}</h4>
                    <p class="text-gray-600 text-sm mt-1">${truncateText(event.description, 60)}</p>
                    <div class="flex items-center text-sm text-gray-500 mt-2">
                        <i class="fas fa-clock mr-2"></i>
                        <span>${event.time}</span>
                        <i class="fas fa-map-marker-alt ml-4 mr-2"></i>
                        <span>${event.venue}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTestimonials(testimonials) {
        if (testimonials.length === 0) {
            return '<p class="col-span-2 text-center text-gray-500">Testimonials coming soon...</p>';
        }

        return testimonials.map(testimonial => `
            <div class="bg-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center mb-4">
                    <div class="w-12 h-12 rounded-full overflow-hidden mr-4">
                        ${testimonial.avatarUrl ? 
                            `<img src="${testimonial.avatarUrl}" alt="${testimonial.name}" class="w-full h-full object-cover">` :
                            `<div class="w-full h-full bg-blue-100 flex items-center justify-center">
                                <i class="fas fa-user text-blue-600"></i>
                             </div>`
                        }
                    </div>
                    <div>
                        <h4 class="font-bold">${testimonial.name}</h4>
                        <p class="text-sm text-gray-600">${testimonial.role || 'Student'}</p>
                    </div>
                </div>
                <div class="mb-4">
                    ${this.renderStars(testimonial.rating || 5)}
                </div>
                <p class="text-gray-700 italic">"${testimonial.content}"</p>
                ${testimonial.verified ? 
                    '<div class="mt-4 flex items-center text-green-600 text-sm"><i class="fas fa-check-circle mr-2"></i> Verified Student</div>' : 
                    ''
                }
            </div>
        `).join('');
    }

    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? 
                '<i class="fas fa-star text-yellow-500"></i>' : 
                '<i class="far fa-star text-yellow-500"></i>';
        }
        return stars;
    }

    attachEventListeners() {
        // Add any home-specific event listeners here
    }
}

// Export for use in app.js
export default HomePage;