import firestoreService from '../utils/firestore.js';
import { formatDate, formatTime, formatRelativeTime } from '../utils/formatters.js';

class EventsPage {
    constructor() {
        this.eventsContainer = document.getElementById('events-container');
        this.eventsLoading = document.getElementById('events-loading');
        this.noEvents = document.getElementById('no-events');
        this.allEvents = [];
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.setupEventListeners();
        this.initCalendar();
    }

    async loadEvents() {
        try {
            const now = new Date().toISOString();
            
            // Load upcoming events
            const upcomingEvents = await firestoreService.getDocuments('events', [
                { field: 'date', operator: '>=', value: now }
            ], { field: 'date', direction: 'asc' });
            
            // Load past events
            const pastEvents = await firestoreService.getDocuments('events', [
                { field: 'date', operator: '<', value: now }
            ], { field: 'date', direction: 'desc' }, 20);
            
            this.allEvents = [...upcomingEvents, ...pastEvents];
            this.filterEvents('upcoming');
            this.hideLoading();
        } catch (error) {
            console.error('Error loading events:', error);
            this.showNoEvents();
        }
    }

    filterEvents(type) {
        const now = new Date().toISOString();
        let filteredEvents;

        switch(type) {
            case 'upcoming':
                filteredEvents = this.allEvents.filter(event => event.date >= now);
                break;
            case 'past':
                filteredEvents = this.allEvents.filter(event => event.date < now);
                break;
            case 'workshop':
            case 'seminar':
            case 'cultural':
            case 'sports':
                filteredEvents = this.allEvents.filter(event => 
                    event.type?.toLowerCase() === type.toLowerCase()
                );
                break;
            default:
                filteredEvents = this.allEvents;
        }

        this.renderEvents(filteredEvents);
    }

    renderEvents(events) {
        if (!events || events.length === 0) {
            this.showNoEvents();
            return;
        }

        this.eventsContainer.innerHTML = events.map(event => this.createEventCard(event)).join('');
    }

    createEventCard(event) {
        const isPast = new Date(event.date) < new Date();
        const eventType = event.type || 'general';
        const typeClass = this.getEventTypeClass(eventType);
        
        return `
            <div class="event-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition ${isPast ? 'opacity-80' : ''}" data-type="${eventType}">
                <div class="md:flex">
                    <!-- Date Section -->
                    <div class="md:w-1/4 ${isPast ? 'bg-gray-100' : typeClass.bg} p-6 flex flex-col items-center justify-center">
                        <div class="text-4xl font-bold ${isPast ? 'text-gray-600' : typeClass.text}">
                            ${new Date(event.date).getDate()}
                        </div>
                        <div class="text-lg ${isPast ? 'text-gray-500' : typeClass.text} font-semibold">
                            ${new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </div>
                        <div class="text-sm ${isPast ? 'text-gray-500' : typeClass.text} mt-2">
                            ${new Date(event.date).getFullYear()}
                        </div>
                        ${isPast ? `
                            <div class="mt-4 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                <i class="far fa-check-circle mr-1"></i> Completed
                            </div>
                        ` : `
                            <div class="mt-4 text-xs bg-white ${typeClass.text} px-2 py-1 rounded-full font-bold">
                                <i class="far fa-clock mr-1"></i> Upcoming
                            </div>
                        `}
                    </div>
                    
                    <!-- Event Details -->
                    <div class="md:w-3/4 p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <span class="inline-block ${typeClass.bg} ${typeClass.text} text-sm font-semibold px-3 py-1 rounded-full mb-2">
                                    ${this.getEventTypeLabel(eventType)}
                                </span>
                                <h3 class="text-xl font-bold">${event.title}</h3>
                            </div>
                            ${event.registrationLink && !isPast ? `
                                <a href="${event.registrationLink}" target="_blank" 
                                   class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
                                    <i class="fas fa-user-plus mr-1"></i> Register
                                </a>
                            ` : ''}
                        </div>
                        
                        <p class="text-gray-600 mb-4">${event.description || 'No description available.'}</p>
                        
                        <div class="grid md:grid-cols-3 gap-4 mb-6">
                            <div class="flex items-center text-gray-700">
                                <i class="far fa-clock text-blue-500 mr-3"></i>
                                <div>
                                    <div class="font-semibold">Time</div>
                                    <div>${formatTime(event.time) || 'To be announced'}</div>
                                </div>
                            </div>
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-map-marker-alt text-green-500 mr-3"></i>
                                <div>
                                    <div class="font-semibold">Venue</div>
                                    <div>${event.venue || 'Main Campus'}</div>
                                </div>
                            </div>
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-users text-purple-500 mr-3"></i>
                                <div>
                                    <div class="font-semibold">Audience</div>
                                    <div>${event.audience || 'All Students'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100">
                            <div class="text-sm text-gray-500">
                                <i class="far fa-calendar mr-1"></i> ${formatDate(event.date)}
                                ${event.time ? ` • ${formatTime(event.time)}` : ''}
                            </div>
                            
                            <div class="flex space-x-2 mt-2 md:mt-0">
                                <button class="view-event-btn text-blue-600 hover:text-blue-800 text-sm font-semibold" data-event-id="${event.id}">
                                    <i class="fas fa-info-circle mr-1"></i> More Details
                                </button>
                                ${event.gallery && event.gallery.length > 0 ? `
                                    <button class="view-gallery-btn text-purple-600 hover:text-purple-800 text-sm font-semibold" data-event-id="${event.id}">
                                        <i class="fas fa-images mr-1"></i> Gallery
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getEventTypeClass(type) {
        const types = {
            'workshop': { bg: 'bg-blue-100', text: 'text-blue-600' },
            'seminar': { bg: 'bg-green-100', text: 'text-green-600' },
            'cultural': { bg: 'bg-purple-100', text: 'text-purple-600' },
            'sports': { bg: 'bg-red-100', text: 'text-red-600' },
            'academic': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            'general': { bg: 'bg-gray-100', text: 'text-gray-600' }
        };
        return types[type.toLowerCase()] || types.general;
    }

    getEventTypeLabel(type) {
        const labels = {
            'workshop': 'Workshop',
            'seminar': 'Seminar',
            'cultural': 'Cultural Event',
            'sports': 'Sports Event',
            'academic': 'Academic Event',
            'general': 'General Event'
        };
        return labels[type.toLowerCase()] || 'Event';
    }

    showEventDetails(eventId) {
        const event = this.allEvents.find(e => e.id === eventId);
        if (!event) return;

        const isPast = new Date(event.date) < new Date();
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl font-bold">${event.title}</h2>
                            <div class="flex items-center text-sm text-gray-500 mt-2">
                                <i class="far fa-calendar mr-2"></i>
                                <span>${formatDate(event.date)}</span>
                                ${event.time ? `
                                    <span class="mx-2">•</span>
                                    <i class="far fa-clock mr-2"></i>
                                    <span>${formatTime(event.time)}</span>
                                ` : ''}
                            </div>
                        </div>
                        <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">
                            &times;
                        </button>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div class="space-y-4">
                            ${event.venue ? `
                                <div>
                                    <h3 class="font-bold text-gray-700 mb-1">Venue</h3>
                                    <p class="text-gray-600">${event.venue}</p>
                                </div>
                            ` : ''}
                            
                            ${event.audience ? `
                                <div>
                                    <h3 class="font-bold text-gray-700 mb-1">Audience</h3>
                                    <p class="text-gray-600">${event.audience}</p>
                                </div>
                            ` : ''}
                            
                            ${event.type ? `
                                <div>
                                    <h3 class="font-bold text-gray-700 mb-1">Event Type</h3>
                                    <span class="inline-block ${this.getEventTypeClass(event.type).bg} ${this.getEventTypeClass(event.type).text} text-sm font-semibold px-3 py-1 rounded-full">
                                        ${this.getEventTypeLabel(event.type)}
                                    </span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div>
                            <h3 class="font-bold text-gray-700 mb-2">Event Description</h3>
                            <div class="prose max-w-none">
                                ${event.description || 'No description available.'}
                            </div>
                        </div>
                    </div>
                    
                    ${event.gallery && event.gallery.length > 0 ? `
                        <div class="mb-6">
                            <h3 class="font-bold text-gray-700 mb-3">Event Gallery</h3>
                            <div class="grid grid-cols-4 gap-2">
                                ${event.gallery.slice(0, 4).map((img, index) => `
                                    <img src="${img}" alt="Event image ${index + 1}" 
                                         class="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                                         onclick="window.open('${img}', '_blank')">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="border-t pt-6">
                        <div class="flex flex-wrap gap-4">
                            ${!isPast && event.registrationLink ? `
                                <a href="${event.registrationLink}" target="_blank" 
                                   class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                                    <i class="fas fa-user-plus mr-2"></i> Register Now
                                </a>
                            ` : ''}
                            
                            <button class="close-modal border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-semibold">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.remove();
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    initCalendar() {
        // Basic calendar implementation
        const calendarEl = document.getElementById('calendar');
        if (!calendarEl) return;

        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();

        calendarEl.innerHTML = `
            <h3 class="font-bold mb-4">${month} ${year}</h3>
            <p class="text-gray-600">Calendar integration coming soon. Events will be displayed here.</p>
        `;
    }

    hideLoading() {
        if (this.eventsLoading) {
            this.eventsLoading.style.display = 'none';
        }
    }

    showNoEvents() {
        this.hideLoading();
        if (this.noEvents) {
            this.noEvents.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Event type filters
        const eventFilters = document.querySelectorAll('.event-filter');
        eventFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                eventFilters.forEach(f => {
                    f.classList.remove('active', 'bg-teal-600', 'text-white');
                    f.classList.add('bg-gray-200');
                });
                filter.classList.add('active', 'bg-teal-600', 'text-white');
                filter.classList.remove('bg-gray-200');
                
                this.filterEvents(filter.dataset.type);
            });
        });

        // View event buttons (delegated)
        this.eventsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.view-event-btn')) {
                const eventId = e.target.closest('.view-event-btn').dataset.eventId;
                this.showEventDetails(eventId);
            }
            
            if (e.target.closest('.view-gallery-btn')) {
                const eventId = e.target.closest('.view-gallery-btn').dataset.eventId;
                // Navigate to gallery page with event filter
                window.location.href = `gallery.html?event=${eventId}`;
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventsPage();
});

export default EventsPage;