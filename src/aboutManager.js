/**
 * ============================
 * ABOUT MANAGER MODULE
 * ============================
 * Handles the About section content and interactions
 * Exports as ES6 module
 */

import { soundManager } from './soundManager.js';

class AboutManager {
    constructor() {
        this.initialized = false;
        this.profileData = {
            name: "Skye",
            role: "Creative Developer & Designer",
            avatar: "https://dl.dropbox.com/scl/fi/nrgsz0vtcnwgd9msz1nzh/puppy.JPG?rlkey=jen8najj04sih3gw2pxeymq35&st=hvyte78j&dl=0",
            bio: `I'm Skye, a web development, game development, and web design enthusiast based in Venezuela. I've always loved creating things. Making hand-coded websites with HTML/CSS/JS is my latest obsession. Growing up, my parents repeatedly told me to get off the computer and go outside. The OG Touch Grassâ„¢ lol. That's how I learned how to code (thanks, <a href="https://neocities.org/" target="_blank" class="neocities-link"><strong>Neocities â†—</strong></a>), and from that, I'm never able to stop doing it. Officially coding since 2023, so be nice to me, waa.<br><br>

 I always had an obsession with video games! So it is pretty normal that I'm always trying to play some during my free time. Especially Nintendo 3DS games. Currently interested in game dev, so I learned how to use Godot Engine. My love for all of this started a long time ago, but I didn't start coding right away; it was more like "experimenting and doing random things until something works or not!", so yeah, more than coding, I always went more down the path of hardware, cybersecurity, and OS at the beginning. Linux lover, btw, I started with Arch and then Debian. Now I'm just a boring macOS user. Some days I miss Linux, tho.<br><br>

Honestly, I don't think I'm a professional coder, an artist, or a designer. Everything I do as a student is more for entertainment, you know? creating, expressing myself. Sometimes life gets so boring that I need to make something.<br><br>

Today, when I'm not working or sleeping all day after studying, you can usually find me maybe eating in some place, walking around the street, or hanging out with my family and friends.`,
            stats: [
                { number: "2+", label: "Projects" },
                { number: "2", label: "Years Experience" }
            ]
        };

        this.interests = [
            {
                name: "UI/UX Design",
                description: "Creating intuitive and beautiful user interfaces with focus on user experience.",
                icon: "/src/assets/attach.png"
            },
            {
                name: "Game Development",
                description: "Building interactive experiences and game mechanics using Godot.",
                icon: "/src/assets/writing.svg"
            },
            {
                name: "Digital Art",
                description: "Crafting digital illustrations and concept art for various media.",
                icon: "/src/assets/color.svg"
            },
            {
                name: "Web Development",
                description: "Creating responsive and interactive websites using modern technologies.",
                icon: "/src/assets/icons.svg"
            }
        ];

        this.locationData = {
            city: "Minecraft coordinates unavailable",
            country: "Venezuela",
            timezone: "PST",
            status: "Happy! Working remotely from my cozy home."
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.profileContainer = document.getElementById('profileContainer');
        this.interestsContainer = document.getElementById('interestsContainer');
        this.locationContainer = document.getElementById('locationContainer');

        this.renderProfile();
        this.renderInterests();
        this.renderLocation();

        this.initialized = true;
    }

    renderProfile() {
        if (!this.profileContainer) return;

        this.profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${this.profileData.avatar}" alt="${this.profileData.name}">
                </div>
                <div class="profile-info">
                    <div class="profile-name">${this.profileData.name}</div>
                    <div class="profile-role">${this.profileData.role}</div>
                </div>
            </div>
            <div class="profile-bio">
                <p>${this.profileData.bio}</p>
            </div>
            <div class="profile-stats">
                ${this.profileData.stats.map(stat => `
                    <div class="stat-item">
                        <span class="stat-number">${stat.number}</span>
                        <span class="stat-label">${stat.label}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderInterests() {
        if (!this.interestsContainer) return;

        this.interestsContainer.innerHTML = this.interests.map(interest => `
            <div class="interest-card">
                <div class="interest-icon">
                    <img src="${interest.icon}" alt="${interest.name}">
                </div>
                <div class="interest-name">${interest.name}</div>
                <div class="interest-description">${interest.description}</div>
            </div>
        `).join('');

        this.interestsContainer.querySelectorAll('.interest-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                soundManager?.play('hover', 0.15);
            });
        });
    }

    renderLocation() {
        if (!this.locationContainer) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'America/Caracas'
        });

        this.locationContainer.innerHTML = `
            <div class="location-header">
                <div class="location-icon">ðŸ“</div>
                <div class="location-info">
                    <h3>Current Location</h3>
                    <p>${this.locationData.city}, ${this.locationData.country}</p>
                </div>
            </div>
            <div class="location-details">
                <div class="location-time">
                    <span class="time-label">Local Time</span>
                    <span class="time-value">${timeString}</span>
                </div>
                <div class="location-status">
                    <div class="status-indicator"></div>
                    <span>${this.locationData.status}</span>
                </div>
            </div>
        `;

        setInterval(() => this.updateLocationTime(), 60000);
    }

    updateLocationTime() {
        const timeElement = this.locationContainer?.querySelector('.time-value');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'America/Caracas'
            });
            timeElement.textContent = timeString;
        }
    }

    updateProfile(newData) {
        this.profileData = { ...this.profileData, ...newData };
        this.renderProfile();
    }

    addInterest(interest) {
        this.interests.push(interest);
        this.renderInterests();
    }

    updateLocation(newData) {
        this.locationData = { ...this.locationData, ...newData };
        this.renderLocation();
    }

    destroy() {
        // Cleanup
    }
}

export const aboutManager = new AboutManager();
window.aboutManager = aboutManager;
export default aboutManager;