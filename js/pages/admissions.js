import firestoreService from '../utils/firestore.js';

class AdmissionsPage {
    constructor() {
        this.admissionForm = document.getElementById('admission-form');
        this.formMessage = document.getElementById('form-message');
        this.submitBtn = document.getElementById('submit-btn');
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadCourses();
    }

    async loadCourses() {
        try {
            const courses = await firestoreService.getDocuments('courses', [], { field: 'name', direction: 'asc' });
            this.populateCourseDropdown(courses);
        } catch (error) {
            console.error('Error loading courses:', error);
        }
    }

    populateCourseDropdown(courses) {
        const select = document.querySelector('select[name="interestedCourse"]');
        if (!select || !courses.length) return;

        // Clear existing options except first
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Group courses by category
        const categories = {};
        courses.forEach(course => {
            const category = course.category || 'Other';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(course);
        });

        // Add grouped options
        Object.keys(categories).forEach(category => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${category} Courses`;
            
            categories[category].forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                if (course.fee) {
                    option.textContent += ` (${course.fee})`;
                }
                optgroup.appendChild(option);
            });
            
            select.appendChild(optgroup);
        });
    }

    setupEventListeners() {
        if (this.admissionForm) {
            this.admissionForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.submitForm();
            });
        }
    }

    async submitForm() {
        if (!this.validateForm()) return;

        const formData = this.collectFormData();
        
        // Disable submit button
        const originalText = this.submitBtn.innerHTML;
        this.submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
        this.submitBtn.disabled = true;

        try {
            const result = await firestoreService.submitAdmissionEnquiry(formData);
            
            if (result.success) {
                this.showMessage('Your admission enquiry has been submitted successfully! We will contact you soon.', 'success');
                this.admissionForm.reset();
                
                // Show confirmation number
                this.showMessage(`Reference Number: ${result.id.slice(0, 8).toUpperCase()}`, 'info');
                
                // Redirect after 5 seconds
                setTimeout(() => {
                    window.location.href = 'thank-you.html';
                }, 5000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Sorry, there was an error submitting your enquiry. Please try again or contact us directly.', 'error');
        } finally {
            // Re-enable submit button
            this.submitBtn.innerHTML = originalText;
            this.submitBtn.disabled = false;
        }
    }

    validateForm() {
        const form = this.admissionForm;
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.highlightError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !this.isValidEmail(field.value)) {
                this.highlightError(field, 'Please enter a valid email address');
                isValid = false;
            } else if (field.type === 'tel' && !this.isValidPhone(field.value)) {
                this.highlightError(field, 'Please enter a valid phone number');
                isValid = false;
            } else {
                this.removeError(field);
            }
        });

        return isValid;
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    highlightError(field, message) {
        field.classList.add('border-red-500');
        
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message text-red-500 text-sm mt-1';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    removeError(field) {
        field.classList.remove('border-red-500');
        
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
    }

    collectFormData() {
        const form = this.admissionForm;
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value.trim();
        });
        
        // Add timestamp and additional info
        data.timestamp = new Date().toISOString();
        data.pageUrl = window.location.href;
        data.userAgent = navigator.userAgent;
        
        return data;
    }

    showMessage(message, type = 'info') {
        if (!this.formMessage) return;
        
        this.formMessage.className = `p-4 rounded-lg mb-6 ${this.getMessageClass(type)}`;
        this.formMessage.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${this.getMessageIcon(type)} mr-3"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.classList.add('hidden')" 
                        class="ml-auto text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        this.formMessage.classList.remove('hidden');
        
        // Auto-hide after 10 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                this.formMessage.classList.add('hidden');
            }, 10000);
        }
    }

    getMessageClass(type) {
        const classes = {
            success: 'bg-green-100 text-green-800 border border-green-300',
            error: 'bg-red-100 text-red-800 border border-red-300',
            info: 'bg-blue-100 text-blue-800 border border-blue-300',
            warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300'
        };
        return classes[type] || classes.info;
    }

    getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            info: 'info-circle',
            warning: 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AdmissionsPage();
});

export default AdmissionsPage;