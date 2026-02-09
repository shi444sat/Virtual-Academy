import firestoreService from '../utils/firestore.js';
import { formatDate } from '../utils/formatters.js';

class TestimonialsPage {
    constructor() {
        this.testimonialsContainer = document.getElementById('testimonials-container');
        this.testimonialsLoading = document.getElementById('testimonials-loading');
        this.noTestimonials = document.getElementById('no-testimonials');
        this.testimonialForm = document.getElementById('testimonial-form');
        this.testimonialMessage = document.getElementById('testimonial-message');
        
        this.allTestimonials = [];
        this.currentFilter = 'all';
        this.currentRating = 5;
        
        this.init();
    }

    async init() {
        await this.loadTestimonials();
        this.setupEventListeners();
        this.setupStarRating();
    }

    async loadTestimonials() {
        try {
            this.allTestimonials = await firestoreService.getDocuments('testimonials', [], { field: 'date', direction: 'desc' });
            this.filterTestimonials('all');
            this.hideLoading();
        } catch (error) {
            console.error('Error loading testimonials:', error);
            this.showNoTestimonials();
        }
    }

    filterTestimonials(filter) {
        this.currentFilter = filter;
        
        let filteredTestimonials = this.allTestimonials;
        
        if (filter !== 'all') {
            filteredTestimonials = this.allTestimonials.filter(testimonial => {
                if (filter === 'verified') {
                    return testimonial.verified === true;
                }
                return testimonial.role?.toLowerCase() === filter.toLowerCase();
            });
        }
        
        this.renderTestimonials(filteredTestimonials);
    }

    renderTestimonials(testimonials) {
        if (!testimonials || testimonials.length === 0) {
            this.showNoTestimonials();
            return;
        }

        this.testimonialsContainer.innerHTML = testimonials.map(testimonial => this.createTestimonialCard(testimonial)).join('');
    }

    createTestimonialCard(testimonial) {
        const role = testimonial.role || 'Student';
        const date = testimonial.date ? formatDate(testimonial.date) : '';
        
        return `
            <div class="testimonial-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition" data-role="${role.toLowerCase()}" data-verified="${testimonial.verified || false}">
                <div class="flex items-start mb-4">
                    <div class="flex-shrink-0 mr-4">
                        <div class="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                            ${testimonial.avatarUrl ? `
                                <img src="${testimonial.avatarUrl}" alt="${testimonial.name}" class="w-full h-full object-cover">
                            ` : `
                                <i class="fas fa-user text-white text-2xl"></i>
                            `}
                        </div>
                    </div>
                    <div class="flex-1">
                        <h3 class="font-bold text-lg">${testimonial.name}</h3>
                        <p class="text-gray-600 text-sm">${role}</p>
                        ${date ? `<p class="text-gray-500 text-xs">${date}</p>` : ''}
                    </div>
                    ${testimonial.verified ? `
                        <div class="text-green-600" title="Verified Student">
                            <i class="fas fa-check-circle"></i>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mb-4">
                    ${this.renderStars(testimonial.rating || 5)}
                </div>
                
                <div class="prose max-w-none mb-4">
                    <p class="text-gray-700 italic">"${testimonial.content}"</p>
                </div>
                
                ${testimonial.achievement ? `
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <p class="text-sm text-gray-600">
                            <i class="fas fa-trophy mr-2 text-yellow-500"></i>
                            ${testimonial.achievement}
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<i class="fas fa-star text-yellow-500"></i> ';
            } else if (i - 0.5 === rating) {
                stars += '<i class="fas fa-star-half-alt text-yellow-500"></i> ';
            } else {
                stars += '<i class="far fa-star text-yellow-500"></i> ';
            }
        }
        return stars;
    }

    setupStarRating() {
        const starButtons = document.querySelectorAll('.star-rating');
        const ratingInput = document.querySelector('input[name="rating"]');
        
        starButtons.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.currentRating = rating;
                
                // Update visual stars
                starButtons.forEach((s, index) => {
                    if (index < rating) {
                        s.textContent = '★';
                        s.classList.add('text-yellow-500');
                    } else {
                        s.textContent = '☆';
                        s.classList.remove('text-yellow-500');
                    }
                });
                
                // Update hidden input
                if (ratingInput) {
                    ratingInput.value = rating;
                }
            });
            
            star.addEventListener('mouseover', () => {
                const hoverRating = parseInt(star.dataset.rating);
                starButtons.forEach((s, index) => {
                    if (index < hoverRating) {
                        s.textContent = '★';
                    } else {
                        s.textContent = '☆';
                    }
                });
            });
            
            star.addEventListener('mouseout', () => {
                starButtons.forEach((s, index) => {
                    if (index < this.currentRating) {
                        s.textContent = '★';
                    } else {
                        s.textContent = '☆';
                    }
                });
            });
        });
    }

    async submitTestimonial(formData) {
        // Validate form
        if (!this.validateForm(formData)) {
            return false;
        }

        try {
            // Prepare data for Firestore
            const testimonialData = {
                name: formData.get('name'),
                role: formData.get('role'),
                content: formData.get('content'),
                rating: parseInt(formData.get('rating')),
                date: new Date().toISOString(),
                verified: false, // Will be set to true after admin verification
                status: 'pending'
            };

            // Submit to Firestore
            const result = await firestoreService.submitTestimonial(testimonialData);
            
            if (result.success) {
                this.showMessage('Thank you for your testimonial! It will be reviewed before publishing.', 'success');
                this.testimonialForm.reset();
                this.currentRating = 5;
                
                // Reset stars
                document.querySelectorAll('.star-rating').forEach((star, index) => {
                    if (index < 5) {
                        star.textContent = '★';
                    } else {
                        star.textContent = '☆';
                    }
                });
                
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            this.showMessage('Sorry, there was an error submitting your testimonial. Please try again.', 'error');
            return false;
        }
    }

    validateForm(formData) {
        const name = formData.get('name');
        const content = formData.get('content');
        
        if (!name || name.trim().length < 2) {
            this.showMessage('Please enter a valid name (minimum 2 characters)', 'error');
            return false;
        }
        
        if (!content || content.trim().length < 10) {
            this.showMessage('Please write a testimonial (minimum 10 characters)', 'error');
            return false;
        }
        
        return true;
    }

    showMessage(message, type = 'info') {
        if (!this.testimonialMessage) return;
        
        const typeClasses = {
            success: 'bg-green-100 text-green-800 border-green-300',
            error: 'bg-red-100 text-red-800 border-red-300',
            info: 'bg-blue-100 text-blue-800 border-blue-300'
        };
        
        this.testimonialMessage.className = `p-4 rounded-lg mb-6 ${typeClasses[type] || typeClasses.info}`;
        this.testimonialMessage.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-3"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.classList.add('hidden')" 
                        class="ml-auto text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        this.testimonialMessage.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.testimonialMessage.classList.add('hidden');
        }, 5000);
    }

    hideLoading() {
        if (this.testimonialsLoading) {
            this.testimonialsLoading.style.display = 'none';
        }
    }

    showNoTestimonials() {
        this.hideLoading();
        if (this.noTestimonials) {
            this.noTestimonials.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.testimonial-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => {
                    btn.classList.remove('active', 'bg-emerald-600', 'text-white');
                    btn.classList.add('bg-gray-200');
                });
                button.classList.add('active', 'bg-emerald-600', 'text-white');
                button.classList.remove('bg-gray-200');
                
                this.filterTestimonials(button.dataset.filter);
            });
        });

        // Testimonial form submission
        if (this.testimonialForm) {
            this.testimonialForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = this.testimonialForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                // Show loading state
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
                submitBtn.disabled = true;
                
                const formData = new FormData(this.testimonialForm);
                const success = await this.submitTestimonial(formData);
                
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                if (success) {
                    // Reload testimonials to show the new one (if auto-approved)
                    await this.loadTestimonials();
                }
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestimonialsPage();
});

export default TestimonialsPage;