// public-site/js/components/footer.js
import firestoreService from '../utils/firestore.js';

class Footer {
    constructor() {
        this.footerContainer = document.getElementById('footer');
    }

    async render() {
        const siteSettings = await firestoreService.getDocument('config', 'siteSettings');
        const contactSettings = await firestoreService.getDocument('pages', 'contact');
        
        const currentYear = new Date().getFullYear();
        
        const html = `
            <footer class="bg-gray-800 text-white">
                <div class="container mx-auto px-4 py-12">
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        <!-- About Column -->
                        <div>
                            <div class="flex items-center mb-6">
                                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                    <span class="text-white font-bold text-xl">VA</span>
                                </div>
                                <div>
                                    <h2 class="text-xl font-bold">${siteSettings?.siteName || 'Virtual Academy'}</h2>
                                    <p class="text-sm text-gray-400">Coaching Institute</p>
                                </div>
                            </div>
                            <p class="text-gray-400 mb-6">
                                Excellence in education since 2012. We nurture future leaders through quality education and holistic development.
                            </p>
                            <div class="flex space-x-4">
                                <a href="${siteSettings?.socialLinks?.facebook || '#'}" class="text-gray-400 hover:text-white">
                                    <i class="fab fa-facebook-f text-lg"></i>
                                </a>
                                <a href="${siteSettings?.socialLinks?.twitter || '#'}" class="text-gray-400 hover:text-white">
                                    <i class="fab fa-twitter text-lg"></i>
                                </a>
                                <a href="${siteSettings?.socialLinks?.instagram || '#'}" class="text-gray-400 hover:text-white">
                                    <i class="fab fa-instagram text-lg"></i>
                                </a>
                                <a href="${siteSettings?.socialLinks?.youtube || '#'}" class="text-gray-400 hover:text-white">
                                    <i class="fab fa-youtube text-lg"></i>
                                </a>
                                <a href="${siteSettings?.socialLinks?.linkedin || '#'}" class="text-gray-400 hover:text-white">
                                    <i class="fab fa-linkedin-in text-lg"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div>
                            <h3 class="text-lg font-bold mb-6">Quick Links</h3>
                            <ul class="space-y-3">
                                <li><a href="index.html" class="text-gray-400 hover:text-white">Home</a></li>
                                <li><a href="about.html" class="text-gray-400 hover:text-white">About Us</a></li>
                                <li><a href="courses.html" class="text-gray-400 hover:text-white">Courses</a></li>
                                <li><a href="faculty.html" class="text-gray-400 hover:text-white">Faculty</a></li>
                                
                            </ul>
                        </div>

                        <!-- Contact Info -->
                        <div>
                            <h3 class="text-lg font-bold mb-6">Contact Info</h3>
                            <ul class="space-y-4">
                                <li class="flex items-start">
                                    <i class="fas fa-map-marker-alt text-blue-400 mt-1 mr-3"></i>
                                    <span class="text-gray-400">${siteSettings?.address || 'Rambagh Purnea Bihar 854301'}</span>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-phone text-green-400 mt-1 mr-3"></i>
                                    <div>
                                        <a href="tel:${siteSettings?.phone || '+917545864977'}" class="text-gray-400 hover:text-white block">
                                            ${siteSettings?.phone || '+91 7545864977'}
                                        </a>
                                        <p class="text-sm text-gray-500">Mon-Sat: 8AM-6PM</p>
                                    </div>
                                </li>
                                <li class="flex items-start">
                                    <i class="fas fa-envelope text-purple-400 mt-1 mr-3"></i>
                                    <a href="mailto:${siteSettings?.contactEmail || 'info@Virtualacademygroup.com'}" class="text-gray-400 hover:text-white">
                                        ${siteSettings?.contactEmail || 'info@Virtualacademygroup.com'}
                                    </a>
                                </li>
                            </ul>
                        </div>

                        

                    <!-- Copyright -->
                    <div class="border-t border-gray-700 mt-12 pt-8 text-center">
                        <div class="flex flex-col md:flex-row justify-between items-center">
                            <p class="text-gray-400">
                                &copy;  2014</span> ${siteSettings?.siteName || 'Virtual Academy'}. All rights reserved.
                            </p>
                            <div class="mt-4 md:mt-0">
                                <a href="privacy.html" class="text-gray-400 hover:text-white mx-4">Privacy Policy</a>
                                <a href="terms.html" class="text-gray-400 hover:text-white mx-4">Terms of Use</a>
                                <a href="sitemap.html" class="text-gray-400 hover:text-white mx-4">Sitemap</a>
                            </div>
                        </div>
                        <p class="text-gray-500 text-sm mt-4">
                            
                            Made With ❤️ in India By S.Satyam 
                        </p>
                    </div>
                </div>

                <!-- Scroll to Top -->
                <button id="scroll-to-top" 
                        class="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition opacity-0 invisible">
                    <i class="fas fa-arrow-up"></i>
                </button>
            </footer>
        `;
        
        this.footerContainer.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = newsletterForm.querySelector('input[type="email"]').value;
                
                // Simple validation
                if (email && email.includes('@')) {
                    // In a real app, you would save this to Firestore
                    newsletterForm.innerHTML = `
                        <div class="bg-green-100 text-green-800 p-3 rounded-lg">
                            <i class="fas fa-check-circle mr-2"></i>
                            Thank you for subscribing!
                        </div>
                    `;
                }
            });
        }
    }
}

// Auto-initialize when imported
const footer = new Footer();
footer.render();

export default footer;