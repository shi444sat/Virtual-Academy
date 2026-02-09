import firestoreService from '../utils/firestore.js';
import { formatDate } from '../utils/formatters.js';

class GalleryPage {
    constructor() {
        this.galleryContainer = document.getElementById('gallery-container');
        this.galleryLoading = document.getElementById('gallery-loading');
        this.noGallery = document.getElementById('no-gallery');
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = document.getElementById('lightbox-image');
        this.lightboxCaption = document.getElementById('lightbox-caption');
        this.closeLightboxBtn = document.getElementById('close-lightbox');
        
        this.allImages = [];
        this.currentFilter = 'all';
        
        this.init();
    }

    async init() {
        await this.loadGallery();
        this.setupEventListeners();
        this.checkURLParams();
    }

    async loadGallery() {
        try {
            this.allImages = await firestoreService.getDocuments('gallery', [], { field: 'date', direction: 'desc' });
            this.filterGallery('all');
            this.hideLoading();
        } catch (error) {
            console.error('Error loading gallery:', error);
            this.showNoGallery();
        }
    }

    filterGallery(category) {
        this.currentFilter = category;
        
        let filteredImages = this.allImages;
        if (category !== 'all') {
            filteredImages = this.allImages.filter(img => 
                img.category?.toLowerCase() === category.toLowerCase()
            );
        }
        
        this.renderGallery(filteredImages);
    }

    renderGallery(images) {
        if (!images || images.length === 0) {
            this.showNoGallery();
            return;
        }

        this.galleryContainer.innerHTML = images.map((image, index) => this.createGalleryItem(image, index)).join('');
    }

    createGalleryItem(image, index) {
        return `
            <div class="gallery-item group relative overflow-hidden rounded-lg cursor-pointer" data-category="${image.category || 'general'}" data-index="${index}">
                <img src="${image.thumbnailUrl || image.imageUrl}" 
                     alt="${image.title || 'Gallery image'}"
                     class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                     loading="lazy">
                
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 class="text-white font-bold text-sm mb-1">${image.title || 'Untitled'}</h3>
                    <p class="text-gray-300 text-xs">${image.category || 'General'}</p>
                    ${image.date ? `
                        <p class="text-gray-300 text-xs mt-1">
                            <i class="far fa-calendar mr-1"></i> ${formatDate(image.date)}
                        </p>
                    ` : ''}
                </div>
                
                <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span class="bg-white/90 text-gray-800 text-xs font-semibold px-2 py-1 rounded">
                        <i class="fas fa-expand-alt mr-1"></i> View
                    </span>
                </div>
            </div>
        `;
    }

    openLightbox(imageIndex) {
        const image = this.allImages[imageIndex];
        if (!image) return;

        this.lightboxImage.src = image.imageUrl;
        this.lightboxImage.alt = image.title || 'Gallery image';
        
        this.lightboxCaption.innerHTML = `
            <h3 class="text-lg font-bold">${image.title || 'Untitled'}</h3>
            ${image.description ? `<p class="text-gray-300 mt-1">${image.description}</p>` : ''}
            ${image.date ? `<p class="text-gray-400 text-sm mt-2">${formatDate(image.date)}</p>` : ''}
        `;
        
        this.lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Store current index for navigation
        this.currentLightboxIndex = imageIndex;
    }

    closeLightbox() {
        this.lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.currentLightboxIndex = null;
    }

    navigateLightbox(direction) {
        if (this.currentLightboxIndex === null || this.currentLightboxIndex === undefined) return;
        
        let newIndex = this.currentLightboxIndex + direction;
        
        // Wrap around
        if (newIndex < 0) {
            newIndex = this.allImages.length - 1;
        } else if (newIndex >= this.allImages.length) {
            newIndex = 0;
        }
        
        this.openLightbox(newIndex);
    }

    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');
        
        if (eventId) {
            // Filter gallery by event
            this.filterGallery('events');
            
            // Scroll to gallery section
            setTimeout(() => {
                document.getElementById('gallery-container')?.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }

    hideLoading() {
        if (this.galleryLoading) {
            this.galleryLoading.style.display = 'none';
        }
    }

    showNoGallery() {
        this.hideLoading();
        if (this.noGallery) {
            this.noGallery.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Category filters
        const galleryFilters = document.querySelectorAll('.gallery-filter');
        galleryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                galleryFilters.forEach(f => {
                    f.classList.remove('active', 'bg-pink-600', 'text-white');
                    f.classList.add('bg-gray-200');
                });
                filter.classList.add('active', 'bg-pink-600', 'text-white');
                filter.classList.remove('bg-gray-200');
                
                this.filterGallery(filter.dataset.category);
            });
        });

        // Gallery item click (delegated)
        this.galleryContainer.addEventListener('click', (e) => {
            const galleryItem = e.target.closest('.gallery-item');
            if (galleryItem) {
                const index = parseInt(galleryItem.dataset.index);
                this.openLightbox(index);
            }
        });

        // Lightbox controls
        if (this.closeLightboxBtn) {
            this.closeLightboxBtn.addEventListener('click', () => this.closeLightbox());
        }

        // Close lightbox on backdrop click
        if (this.lightbox) {
            this.lightbox.addEventListener('click', (e) => {
                if (e.target === this.lightbox) {
                    this.closeLightbox();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.classList.contains('hidden')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeLightbox();
                    break;
                case 'ArrowLeft':
                    this.navigateLightbox(-1);
                    break;
                case 'ArrowRight':
                    this.navigateLightbox(1);
                    break;
            }
        });

        // Add navigation buttons to lightbox
        this.setupLightboxNavigation();
    }

    setupLightboxNavigation() {
        // Create navigation buttons
        const prevBtn = document.createElement('button');
        prevBtn.className = 'absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300';
        prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevBtn.addEventListener('click', () => this.navigateLightbox(-1));
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300';
        nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextBtn.addEventListener('click', () => this.navigateLightbox(1));
        
        // Add to lightbox
        const lightboxContent = this.lightbox.querySelector('.relative');
        if (lightboxContent) {
            lightboxContent.appendChild(prevBtn);
            lightboxContent.appendChild(nextBtn);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GalleryPage();
});

export default GalleryPage;