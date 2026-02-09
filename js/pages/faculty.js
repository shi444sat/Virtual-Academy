import firestoreService from '../utils/firestore.js';

class FacultyPage {
    constructor() {
        this.facultyContainer = document.getElementById('faculty-container');
        this.facultyLoading = document.getElementById('faculty-loading');
        this.noFaculty = document.getElementById('no-faculty');
        this.allFaculty = [];
        this.init();
    }

    async init() {
        await this.loadFaculty();
        this.setupEventListeners();
    }

    async loadFaculty() {
        try {
            this.allFaculty = await firestoreService.getDocuments('faculty', [], { field: 'order', direction: 'asc' });
            this.renderFaculty(this.allFaculty);
            this.hideLoading();
        } catch (error) {
            console.error('Error loading faculty:', error);
            this.showNoFaculty();
        }
    }

    renderFaculty(facultyList) {
        if (!facultyList || facultyList.length === 0) {
            this.showNoFaculty();
            return;
        }

        this.facultyContainer.innerHTML = facultyList.map(member => this.createFacultyCard(member)).join('');
    }

    createFacultyCard(member) {
        return `
            <div class="faculty-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition" data-department="${member.specialization?.toLowerCase() || 'general'}">
                <div class="p-6">
                    <div class="flex items-start mb-6">
                        <div class="flex-shrink-0 mr-4">
                            <div class="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                ${member.imageUrl ? `
                                    <img src="${member.imageUrl}" alt="${member.name}" class="w-full h-full object-cover">
                                ` : `
                                    <i class="fas fa-user text-white text-3xl"></i>
                                `}
                            </div>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold">${member.name}</h3>
                            <p class="text-blue-600 font-semibold">${member.qualification || 'Qualified Educator'}</p>
                            ${member.experience ? `
                                <p class="text-sm text-gray-600 mt-1">
                                    <i class="fas fa-briefcase mr-1"></i> ${member.experience}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        ${member.specialization ? `
                            <span class="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full mb-2">
                                ${member.specialization}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="mb-6">
                        <h4 class="font-bold text-gray-700 mb-2">About</h4>
                        <p class="text-gray-600 text-sm">${this.truncateBio(member.bio)}</p>
                    </div>
                    
                    <button class="view-profile-btn text-blue-600 hover:text-blue-800 font-semibold text-sm w-full text-center py-2 border-t border-gray-100" data-member-id="${member.id}">
                        <i class="fas fa-user-circle mr-2"></i> View Full Profile
                    </button>
                </div>
            </div>
        `;
    }

    truncateBio(bio) {
        if (!bio) return 'Bio information coming soon...';
        if (bio.length <= 120) return bio;
        return bio.substring(0, 120) + '...';
    }

    showFacultyProfile(memberId) {
        const member = this.allFaculty.find(m => m.id === memberId);
        if (!member) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <h2 class="text-2xl font-bold">${member.name}</h2>
                            <p class="text-blue-600 font-semibold">${member.qualification || 'Qualified Educator'}</p>
                        </div>
                        <button class="close-modal text-gray-500 hover:text-gray-700 text-2xl">
                            &times;
                        </button>
                    </div>
                    
                    <div class="flex flex-col md:flex-row gap-6 mb-6">
                        <div class="md:w-1/3">
                            <div class="w-40 h-40 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                ${member.imageUrl ? `
                                    <img src="${member.imageUrl}" alt="${member.name}" class="w-full h-full object-cover">
                                ` : `
                                    <i class="fas fa-user text-white text-5xl"></i>
                                `}
                            </div>
                        </div>
                        
                        <div class="md:w-2/3">
                            <div class="space-y-4">
                                ${member.experience ? `
                                    <div>
                                        <h3 class="font-bold text-gray-700">Experience</h3>
                                        <p class="text-gray-600">${member.experience}</p>
                                    </div>
                                ` : ''}
                                
                                ${member.specialization ? `
                                    <div>
                                        <h3 class="font-bold text-gray-700">Specialization</h3>
                                        <p class="text-gray-600">${member.specialization}</p>
                                    </div>
                                ` : ''}
                                
                                ${member.subjects ? `
                                    <div>
                                        <h3 class="font-bold text-gray-700">Subjects Taught</h3>
                                        <p class="text-gray-600">${member.subjects}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-6">
                        <h3 class="text-xl font-bold mb-3">Biography</h3>
                        <div class="prose max-w-none">
                            ${member.bio || 'Bio information coming soon...'}
                        </div>
                    </div>
                    
                    <div class="border-t pt-6">
                        <div class="flex justify-center">
                            <a href="contact.html" class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                                <i class="fas fa-calendar-alt mr-2"></i> Schedule Consultation
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    filterFaculty(department) {
        if (department === 'all') {
            this.renderFaculty(this.allFaculty);
        } else {
            const filtered = this.allFaculty.filter(member => {
                const memberDept = member.specialization?.toLowerCase() || '';
                return memberDept.includes(department.toLowerCase());
            });
            this.renderFaculty(filtered);
        }
    }

    hideLoading() {
        if (this.facultyLoading) {
            this.facultyLoading.style.display = 'none';
        }
        if (this.facultyContainer) {
            this.facultyContainer.classList.remove('hidden');
        }
    }

    showNoFaculty() {
        this.hideLoading();
        if (this.noFaculty) {
            this.noFaculty.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        // Department tabs
        const deptTabs = document.querySelectorAll('.dept-tab');
        deptTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                deptTabs.forEach(t => t.classList.remove('active', 'bg-purple-600', 'text-white'));
                deptTabs.forEach(t => t.classList.add('bg-gray-200'));
                tab.classList.add('active', 'bg-purple-600', 'text-white');
                tab.classList.remove('bg-gray-200');
                
                const department = tab.dataset.department;
                this.filterFaculty(department);
            });
        });

        // View profile buttons (delegated)
        this.facultyContainer.addEventListener('click', (e) => {
            if (e.target.closest('.view-profile-btn')) {
                const memberId = e.target.closest('.view-profile-btn').dataset.memberId;
                this.showFacultyProfile(memberId);
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FacultyPage();
});

export default FacultyPage;