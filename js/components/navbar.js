// public-site/js/components/navbar.js
import firestoreService from '../../js/utils/firestore.js';

class Navbar {
    constructor() {
        this.navbarContainer = document.getElementById('navbar');
    }

     async render() {
        const siteSettings = await firestoreService.getDocument('config', 'siteSettings');
        
        const html = `
            <nav class="bg-white shadow-lg sticky top-0 z-50">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center h-16">
                        <!-- Logo -->
                        <div class="flex items-center">
                            <a href="index.html" class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span class="text-white font-bold text-xl">VA</span>
                                </div>
                                <div>
                                    <h1 class="text-xl font-bold text-gray-800">${siteSettings?.siteName || 'Virtual Academy'}</h1>
                                    <p class="text-xs text-gray-600">Coaching Institute</p>
                                </div>
                            </a>
                        </div>

                        <!-- Desktop Menu -->
                        <div class="hidden md:flex items-center space-x-8">
                            <a href="index.html" class="nav-link">Home</a>
                            <a href="about.html" class="nav-link">About</a>
                            <div class="relative group">
                                <a href="courses.html" class="nav-link">Courses </a>
                                
                            </div>
                            <a href="faculty.html" class="nav-link">Faculty</a>
                            
                           
                            <a href="contact.html" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Enquire Now</a>
                        </div>

                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-button" class="md:hidden text-gray-700">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                    </div>

                    <!-- Mobile Menu -->
                    <div id="mobile-menu" class="hidden md:hidden py-4 border-t">
                        <a href="index.html" class="block py-2 hover:text-blue-600">Home</a>
                        <a href="about.html" class="block py-2 hover:text-blue-600">About</a>
                        <a href="courses.html" class="block py-2 hover:text-blue-600">Courses</a>
                        <a href="faculty.html" class="block py-2 hover:text-blue-600">Faculty</a>
                        <a href="notices.html" class="block py-2 hover:text-blue-600">Notices</a>
                        <a href="events.html" class="block py-2 hover:text-blue-600">Events</a>
                        <a href="contact.html" class="block py-2 mt-4 bg-blue-600 text-white text-center py-2 rounded-lg">Enquire Now</a>
                    </div>
                </div>
            </nav>
        `;
        
        this.navbarContainer.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }
    }
}

// Auto-initialize when imported
const navbar = new Navbar();
navbar.render();

export default navbar;