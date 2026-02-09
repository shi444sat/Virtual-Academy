import firestoreService from '../utils/firestore.js';

class ContactPage {
    constructor() {
        this.contactForm = document.getElementById('contact-form');
        this.contactMessage = document.getElementById('contact-message');
        this.init();
    }

    async init() {
        await this.loadContactInfo();
        this.setupEventListeners();
        this.initMap();
    }

    async loadContactInfo() {
        try {
            const contactSettings = await firestoreService.getDocument('pages', 'contact');
            const siteSettings = await firestoreService.getDocument('config', 'siteSettings');
            
            // Update contact information if available
            if (contactSettings || siteSettings) {
                this.updateContactDetails(contactSettings, siteSettings);
            }
        } catch (error) {
            console.error('Error loading contact info:', error);
        }
    }

    updateContactDetails(contactSettings, siteSettings) {
        // Update phone numbers
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        if (siteSettings?.phone) {
            phoneLinks.forEach(link => {
                link.href = `tel:${siteSettings.phone}`;
                link.textContent = siteSettings.phone;
            });
        }
        
        // Update emails
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        if (siteSettings?.contactEmail) {
            emailLinks.forEach(link => {
                if (link.href.includes('info@') || link.textContent.includes('info')) {
                    link.href = `mailto:${siteSettings.contactEmail}`;
                    link.textContent = siteSettings.contactEmail;
                }
            });
        }
        
        // Update address
        const addressElements = document.querySelectorAll('.address-text');
        if (siteSettings?.address) {
            addressElements.forEach(el => {
                el.textContent = siteSettings.address;
            });
        }
        
        // Update office hours
        if (contactSettings?.officeHours) {
            const officeHoursEl = document.querySelector('.office-hours');
            if (officeHoursEl) {
                officeHoursEl.innerHTML = contactSettings.officeHours
                    .split('\n')
                    .map(line => `<p>${line}</p>`)
                    .join('');
            }
        }
    }

    initMap() {
        // This is a placeholder for Google Maps integration
        // In production, you would initialize Google Maps with your API key
        const mapContainer = document.querySelector('.map-placeholder');
        if (!mapContainer) return;
        
        // Example of how to integrate Google Maps
        // const map = new google.maps.Map(mapContainer, {
        //     center: { lat: -34.397, lng: 150.644 },
        //     zoom: 8
        // });
        
        mapContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-map-marked-alt text-gray-400 text-6xl mb-4"></i>
                <h3 class="text-xl font-bold text-gray-600 mb-2">Map Location</h3>
                <p class="text-gray-500 mb-4">Google Maps integration can be added here</p>
                <a href="https://maps.google.com/?q=Virtual+Academy+Bangalore" 
                   target="_blank" 
                   class="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-external-link-alt mr-2"></i> Open in Google Maps
                </a>
            </div>
        `;
    }

    async submitContactForm(formData) {
        // Validate form
        if (!this.validateForm(formData)) {
            return false;
        }

        try {
            // Prepare data for Firestore
            const contactData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone') || '',
                subject: formData.get('subject'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                status: 'unread',
                source: 'contact_page'
            };

            // Submit to Firestore
            const result = await firestoreService.submitContactMessage(contactData);
            
            if (result.success) {
                this.showMessage('Thank you for your message! We will get back to you soon.', 'success');
                this.contactForm.reset();
                
                // Show reference number
                this.showMessage(`Reference: ${result.id.slice(0, 8).toUpperCase()}`, 'info');
                
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again or call us directly.', 'error');
            return false;
        }
    }

    validateForm(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Validate name
        if (!name || name.trim().length < 2) {
            this.showMessage('Please enter a valid name (minimum 2 characters)', 'error');
            return false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            this.showMessage('Please enter a valid email address', 'error');
            return false;
        }
        
        // Validate subject
        if (!subject) {
            this.showMessage('Please select a subject', 'error');
            return false;
        }
        
        // Validate message
        if (!message || message.trim().length < 10) {
            this.showMessage('Please enter a message (minimum 10 characters)', 'error');
            return false;
        }
        
        // Validate phone if provided
        const phone = formData.get('phone');
        if (phone && phone.trim() !== '') {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                this.showMessage('Please enter a valid phone number', 'error');
                return false;
            }
        }
        
        return true;
    }

    showMessage(message, type = 'info') {
        if (!this.contactMessage) return;
        
        const typeClasses = {
            success: 'bg-green-100 text-green-800 border-green-300',
            error: 'bg-red-100 text-red-800 border-red-300',
            info: 'bg-blue-100 text-blue-800 border-blue-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
        
        this.contactMessage.className = `p-4 rounded-lg mb-6 ${typeClasses[type] || typeClasses.info}`;
        this.contactMessage.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-3"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.classList.add('hidden')" 
                        class="ml-auto text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        this.contactMessage.classList.remove('hidden');
        
        // Auto-hide after 10 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                this.contactMessage.classList.add('hidden');
            }, 10000);
        }
    }

    setupEventListeners() {
        // Contact form submission
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = this.contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                // Show loading state
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
                submitBtn.disabled = true;
                
                const formData = new FormData(this.contactForm);
                await this.submitContactForm(formData);
                
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        }

        // Emergency contact button
        const emergencyBtn = document.querySelector('.emergency-btn');
        if (emergencyBtn) {
            emergencyBtn.addEventListener('click', (e) => {
                if (!confirm('Are you sure you want to call the emergency number?')) {
                    e.preventDefault();
                }
            });
        }

        // Social media links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = link.querySelector('i').className.match(/fa-([\w-]+)/)[1];
                window.open(link.href, '_blank');
                
                // Track social click (analytics placeholder)
                console.log(`Social media click: ${platform}`);
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactPage();
});

export default ContactPage;