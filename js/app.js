// public-site/js/app.js
import navbar from './components/navbar.js';
import footer from './components/footer.js';
import firestoreService from './utils/firestore.js';

class App {
    constructor() {
        this.init();
    }

    async init() {
        try {
            // Wait for navbar and footer to load
            await Promise.all([
                navbar.render(),
                footer.render()
            ]);
            
            // Check current page and load appropriate module
            const currentPage = this.getCurrentPage();
            
            if (currentPage === 'home') {
                await this.loadHomePage();
            }
            // Other pages will be loaded by their own scripts
            // since we have separate HTML files
            
            // Initialize UI components
            this.initUI();
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showError();
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('index.html') || path.endsWith('/')) return 'home';
        if (path.includes('about.html')) return 'about';
        if (path.includes('courses.html')) return 'courses';
        if (path.includes('faculty.html')) return 'faculty';
        if (path.includes('admissions.html')) return 'admissions';
        if (path.includes('notices.html')) return 'notices';
        if (path.includes('events.html')) return 'events';
        if (path.includes('gallery.html')) return 'gallery';
        if (path.includes('results.html')) return 'results';
        if (path.includes('testimonials.html')) return 'testimonials';
        if (path.includes('contact.html')) return 'contact';
        if (path.includes('faq.html')) return 'faq';
        return 'home';
    }

    async loadHomePage() {
        try {
            const HomePage = (await import('./pages/home.js')).default;
            const homePage = new HomePage();
            await homePage.render();
        } catch (error) {
            console.error('Error loading home page:', error);
        }
    }

    initUI() {
        // Initialize any global UI components
        this.initScrollToTop();
        this.initCurrentYear();
    }

    initScrollToTop() {
        const scrollToTopBtn = document.getElementById('scroll-to-top');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.remove('opacity-0', 'invisible');
                    scrollToTopBtn.classList.add('opacity-100', 'visible');
                } else {
                    scrollToTopBtn.classList.remove('opacity-100', 'visible');
                    scrollToTopBtn.classList.add('opacity-0', 'invisible');
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    initCurrentYear() {
        const yearElements = document.querySelectorAll('.current-year');
        yearElements.forEach(element => {
            element.textContent = new Date().getFullYear();
        });
    }

    showError() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="min-h-screen flex items-center justify-center">
                    <div class="text-center">
                        <div class="text-red-500 text-6xl mb-4">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <h2 class="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p class="text-gray-600 mb-6">Please try refreshing the page</p>
                        <button onclick="location.reload()" class="bg-blue-600 text-white px-6 py-2 rounded-lg">
                            Refresh Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// Make App available globally for debugging
window.App = App;