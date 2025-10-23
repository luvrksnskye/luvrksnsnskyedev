/**
 * ============================
 * DARK MODE MANAGER MODULE
 * ============================
 * Exports as ES6 module
 */

import { soundManager } from './soundManager.js';

class DarkModeManager {
    constructor() {
        this.isDarkMode = false;
        this.videoElement = null;
        this.toggleSwitch = null;
        this.initialized = false;

        this.videos = {
            light: 'https://dl.dropbox.com/scl/fi/ht8vvjjnms3odia8o0udr/bg.mp4?rlkey=6o9t3zf60f0k3ilirkm6xkpgj&st=mwvnyd9e&dl=0',
            dark: 'https://dl.dropbox.com/scl/fi/qxh4lv0qcydnw9str6gju/bg-alt.mp4?rlkey=caqgw260cqamexollkco4wu3p&st=we2x7r1a&dl=0'
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.createToggleSwitch();
        this.videoElement = document.querySelector('.video-background video');

        if (!this.videoElement) {
            console.error('Video element not found');
            return;
        }

        this.loadPreference();
        this.setupEventListeners();
        this.initialized = true;
        console.log('✅ Dark Mode Manager module loaded');
    }

    createToggleSwitch() {
        const nav = document.getElementById('mainNav');
        if (!nav) return;

        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'theme-toggle-container';
        toggleContainer.innerHTML = `
            <div class="theme-toggle">
                <input type="checkbox" id="themeSwitch" class="theme-switch-input">
                <label for="themeSwitch" class="theme-switch-label">
                    <span class="theme-switch-slider">
                        <span class="theme-icon sun-icon">☀️</span>
                        <span class="theme-icon moon-icon">🌙</span>
                    </span>
                </label>
            </div>
        `;

        nav.parentNode.insertBefore(toggleContainer, nav.nextSibling);
        this.addStyles();
        this.toggleSwitch = document.getElementById('themeSwitch');
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .theme-toggle-container {
                position: fixed;
                top: 40px;
                right: 40px;
                z-index: 1000;
                animation: fadeInDown 0.8s ease;
                opacity: 0;
                pointer-events: none;
            }

            .theme-toggle-container.show {
                opacity: 1;
                pointer-events: all;
            }

            .theme-toggle {
                backdrop-filter: blur(40px) saturate(200%);
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50px;
                padding: 8px 12px;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37),
                            0 0 0 1px rgba(255, 255, 255, 0.1) inset,
                            0 0 60px rgba(255, 255, 255, 0.05) inset;
                border: 1px solid rgba(255, 255, 255, 0.18);
            }

            .theme-switch-input {
                display: none;
            }

            .theme-switch-label {
                display: block;
                width: 60px;
                height: 32px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50px;
                position: relative;
                cursor: pointer;
                transition: background 0.3s ease;
            }

            .theme-switch-input:checked + .theme-switch-label {
                background: rgba(100, 100, 255, 0.3);
            }

            .theme-switch-slider {
                position: absolute;
                top: 2px;
                left: 2px;
                width: 28px;
                height: 28px;
                background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%);
                border-radius: 50%;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .theme-switch-input:checked + .theme-switch-label .theme-switch-slider {
                transform: translateX(28px);
            }

            .theme-icon {
                position: absolute;
                font-size: 14px;
                transition: opacity 0.3s ease, transform 0.3s ease;
            }

            .sun-icon {
                opacity: 1;
                transform: scale(1);
            }

            .moon-icon {
                opacity: 0;
                transform: scale(0.5);
            }

            .theme-switch-input:checked + .theme-switch-label .sun-icon {
                opacity: 0;
                transform: scale(0.5);
            }

            .theme-switch-input:checked + .theme-switch-label .moon-icon {
                opacity: 1;
                transform: scale(1);
            }

            .video-background video {
                transition: opacity 0.6s ease;
            }

            .video-background video.transitioning {
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        if (!this.toggleSwitch) return;

        this.toggleSwitch.addEventListener('change', () => {
            this.toggleTheme();
        });

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.classList.contains('show')) {
                    const toggleContainer = document.querySelector('.theme-toggle-container');
                    if (toggleContainer) {
                        toggleContainer.classList.add('show');
                    }
                }
            });
        });

        const nav = document.getElementById('mainNav');
        if (nav) {
            observer.observe(nav, { attributes: true, attributeFilter: ['class'] });
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;

        soundManager?.play('click', 0.3);
        this.changeVideo();
        this.savePreference();

        // Emit theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { isDarkMode: this.isDarkMode, theme: this.getCurrentTheme() }
        }));
    }

    changeVideo() {
        if (!this.videoElement) return;

        const newVideoUrl = this.isDarkMode ? this.videos.dark : this.videos.light;
        const videoContainer = this.videoElement.parentElement;

        const newVideo = document.createElement('video');
        newVideo.autoplay = true;
        newVideo.muted = true;
        newVideo.loop = true;
        newVideo.playsInline = true;
        newVideo.style.position = 'absolute';
        newVideo.style.top = '0';
        newVideo.style.left = '0';
        newVideo.style.width = '100%';
        newVideo.style.height = '100%';
        newVideo.style.objectFit = 'cover';
        newVideo.style.opacity = '0';
        newVideo.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

        newVideo.src = newVideoUrl;
        newVideo.load();

        newVideo.addEventListener('canplay', () => {
            videoContainer.appendChild(newVideo);

            newVideo.play().catch(err => {
                console.warn('Video autoplay failed:', err);
            });

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.videoElement.style.opacity = '0';
                    newVideo.style.opacity = '1';
                });
            });

            setTimeout(() => {
                if (this.videoElement && this.videoElement.parentElement) {
                    this.videoElement.remove();
                }
                this.videoElement = newVideo;
                this.videoElement.style.transition = '';
            }, 900);
        }, { once: true });
    }

    savePreference() {
        try {
            localStorage.setItem('skye-theme-preference', this.isDarkMode ? 'dark' : 'light');
        } catch (error) {
            console.warn('Could not save theme preference to localStorage:', error);
            // Fallback to sessionStorage if localStorage is not available
            try {
                sessionStorage.setItem('skye-theme-preference', this.isDarkMode ? 'dark' : 'light');
            } catch (e) {
                console.warn('Could not save theme preference to sessionStorage either');
            }
        }
    }

    loadPreference() {
        let savedPreference = null;
        
        try {
            // Try localStorage first
            savedPreference = localStorage.getItem('skye-theme-preference');
            
            // If not found in localStorage, try sessionStorage
            if (savedPreference === null) {
                savedPreference = sessionStorage.getItem('skye-theme-preference');
            }
        } catch (error) {
            console.warn('Could not load theme preference from storage:', error);
        }

        // Set the theme based on saved preference, default to light if none found
        if (savedPreference === 'dark') {
            this.isDarkMode = true;
        } else if (savedPreference === 'light') {
            this.isDarkMode = false;
        } else {
            // No saved preference, use default (light)
            this.isDarkMode = false;
        }

        // Update the toggle switch and video
        if (this.toggleSwitch) {
            this.toggleSwitch.checked = this.isDarkMode;
        }

        // If dark mode is enabled and we have a video element, set the dark video
        if (this.videoElement && this.isDarkMode) {
            this.videoElement.src = this.videos.dark;
        }
    }

    getCurrentTheme() {
        return this.isDarkMode ? 'dark' : 'light';
    }

    setTheme(theme) {
        const shouldBeDark = theme === 'dark';
        if (this.isDarkMode !== shouldBeDark) {
            this.isDarkMode = shouldBeDark;
            if (this.toggleSwitch) {
                this.toggleSwitch.checked = shouldBeDark;
            }
            this.changeVideo();
            this.savePreference();
        }
    }

    // Method to clear saved preference (useful for debugging)
    clearPreference() {
        try {
            localStorage.removeItem('skye-theme-preference');
            sessionStorage.removeItem('skye-theme-preference');
        } catch (error) {
            console.warn('Could not clear theme preference:', error);
        }
    }

    destroy() {
        // Cleanup
    }
}

export const darkModeManager = new DarkModeManager();
window.darkModeManager = darkModeManager;
export default darkModeManager;
