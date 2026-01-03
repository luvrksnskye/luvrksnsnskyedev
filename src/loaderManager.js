/**
 * ============================
 * LOADER MANAGER MODULE
 * ============================
 * Handles the 1-minute preloading screen with audio
 * Preloads all critical resources including stellar intro animations
 * Ensures smooth transition to main application
 */

class LoaderManager {
    constructor() {
        // ========================================
        // INITIALIZATION STATE
        // ========================================
        this.initialized = false;
        this.audioUnlocked = false;
        this.loadingComplete = false;
        this.loadingDuration = 60000; // 1 minute in milliseconds
        this.startTime = null;
        
        // ========================================
        // AUDIO CONFIGURATION
        // ========================================
        this.audioTracks = {
            loop: '/src/sfx/TBL3_AFTER_loop.mp3',
            complete: '/src/sfx/FX_text_animation_loop.mp3'
        };
        
        this.currentAudio = null;
        
        // ========================================
        // PRELOAD RESOURCES
        // ========================================
        this.resourcesToPreload = {
            images: [],
            videos: [],
            audio: [],
            stellarAudio: [] // Dedicated stellar intro audio
        };
        
        this.loadedResources = 0;
        this.totalResources = 0;
        
        // ========================================
        // DOM ELEMENT REFERENCES
        // ========================================
        this.loaderContainer = null;
        this.loadingBar = null;
        this.loadingNumber = null;
        this.audioPrompt = null;
    }

    // ========================================
    // INITIALIZATION METHODS
    // ========================================
    
    /**
     * Initialize the loader system
     */
    init() {
        if (this.initialized) return;
        
        console.log('[LOADER] Looking for preloader elements...');
        
        // Get DOM references (elements must exist in HTML)
        this.loaderContainer = document.getElementById('preloader');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingNumber = document.getElementById('loadPercent');
        this.audioPrompt = document.getElementById('audioPrompt');
        
        console.log('[LOADER] Found elements:', {
            loaderContainer: !!this.loaderContainer,
            loadingBar: !!this.loadingBar,
            loadingNumber: !!this.loadingNumber,
            audioPrompt: !!this.audioPrompt
        });
        
        // Validate required elements
        if (!this.loaderContainer) {
            console.error('[LOADER] ERROR: Preloader element not found in HTML');
            return;
        }
        
        if (!this.loadingBar || !this.loadingNumber) {
            console.error('[LOADER] ERROR: Loading bar or number element not found');
            return;
        }
        
        // Initialize subsystems
        this.collectResources();
        this.setupAudioPrompt();
        this.hideMainContent();
        
        this.initialized = true;
        console.log('[LOADER] Initialization complete');
    }

    // ========================================
    // CONTENT VISIBILITY METHODS
    // ========================================
    
    /**
     * Hide all main content during loading phase
     */
    hideMainContent() {
        const elementsToHide = [
            '.video-background',
            '#mainNav',
            '#introScreen',
            '.theme-toggle-container',
            '#homeScreen',
            '#aboutScreen',
            '#contactScreen'
        ];
        
        elementsToHide.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
            }
        });
    }

    /**
     * Show main content after loading completes
     */
    showMainContent() {
        // Show video background with fade
        const videoBackground = document.querySelector('.video-background');
        if (videoBackground) {
            videoBackground.style.visibility = 'visible';
            videoBackground.style.opacity = '1';
            videoBackground.style.transition = 'opacity 0.5s ease';
        }
        
        // Remove inline styles from intro screen (let CSS control it)
        const introScreen = document.getElementById('introScreen');
        if (introScreen) {
            introScreen.style.visibility = '';
            introScreen.style.opacity = '';
        }
        
        // Reset visibility for other elements
        const elementsToReset = [
            '#mainNav',
            '.theme-toggle-container',
            '#homeScreen',
            '#aboutScreen',
            '#contactScreen'
        ];
        
        elementsToReset.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.visibility = '';
                el.style.opacity = '';
            }
        });
    }

    // ========================================
    // AUDIO CONTROL METHODS
    // ========================================
    
    /**
     * Setup audio unlock prompt handler
     */
    setupAudioPrompt() {
        const unlockAudio = (e) => {
            if (this.audioUnlocked) return;
            
            this.audioUnlocked = true;
            
            // Update UI feedback
            if (this.audioPrompt) {
                this.audioPrompt.classList.add('activated');
                const textEl = this.audioPrompt.querySelector('.audio-text');
                if (textEl) {
                    textEl.textContent = 'SOUND ENABLED';
                }
            }
            
            // Begin audio playback
            this.playLoopAudio();
            
            console.log('[LOADER] Audio enabled by user interaction');
        };
        
        // Listen for any user interaction
        document.addEventListener('click', unlockAudio, { passive: true });
        document.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('keydown', unlockAudio, { passive: true });
    }

    /**
     * Play the background loop audio
     */
    playLoopAudio() {
        if (!this.audioUnlocked) return;
        
        try {
            this.currentAudio = new Audio(this.audioTracks.loop);
            this.currentAudio.loop = true;
            this.currentAudio.volume = 0.5;
            
            this.currentAudio.play().catch(err => {
                console.warn('[LOADER] Audio playback failed:', err);
            });
            
            console.log('[LOADER] Background loop audio started');
        } catch (err) {
            console.error('[LOADER] Error initializing audio:', err);
        }
    }

    /**
     * Fade out audio over specified duration
     */
    fadeOutAudio(audio, duration, callback) {
        if (!audio) {
            if (callback) callback();
            return;
        }
        
        const startVolume = audio.volume;
        const steps = 30;
        const stepDuration = duration / steps;
        const volumeStep = startVolume / steps;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(0, startVolume - (volumeStep * currentStep));
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                audio.pause();
                audio.currentTime = 0;
                if (callback) callback();
            }
        }, stepDuration);
    }

    /**
     * Fade in audio over specified duration
     */
    fadeInAudio(audio, duration, targetVolume) {
        if (!audio) return;
        
        const steps = 30;
        const stepDuration = duration / steps;
        const volumeStep = targetVolume / steps;
        let currentStep = 0;
        
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.min(targetVolume, volumeStep * currentStep);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepDuration);
    }

    // ========================================
    // RESOURCE COLLECTION & PRELOADING
    // ========================================
    
    /**
     * Collect all resources that need preloading
     */
    collectResources() {
        // ========================================
        // COLLECT PAGE IMAGES
        // ========================================
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            if (img.src && !img.src.includes('preloader')) {
                this.resourcesToPreload.images.push(img.src);
            }
        });
        
        // Collect background images from inline styles
        const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
        elementsWithBg.forEach(el => {
            const bgStyle = el.style.backgroundImage;
            if (bgStyle) {
                const urlMatch = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (urlMatch && urlMatch[1]) {
                    this.resourcesToPreload.images.push(urlMatch[1]);
                }
            }
        });
        
        // ========================================
        // CRITICAL STATIC ASSETS
        // ========================================
        const knownImages = [
            '/src/assets/github-icon.png',
            '/src/assets/yt-icon.png',
            '/src/assets/figma-icon.png',
            '/src/assets/notion-icon.png',
            '/src/assets/obsidian-icon.png',
            '/src/assets/javascript-icon.png',
            '/src/assets/html-css-icon.png',
            '/src/assets/react-icon.png',
            '/src/assets/gdscript-icon.svg',
            '/src/assets/typescript-icon.png',
            '/src/assets/express-icon.png',
            '/src/assets/NestJS-icon.png',
            '/src/assets/bash-icon.svg',
            '/src/assets/tailwind-icon.png',
            '/src/assets/vue-icon.png',
            '/src/assets/nextjs-icon.png',
            '/src/assets/bootstrap-icon.png',
            '/src/assets/python-icon.png'
        ];
        
        // ========================================
        // GALLERY IMAGES
        // ========================================
        const galleryImages = [
            '/src/assets/gallery/orlando.png',
            '/src/assets/gallery/roses.png',
            '/src/assets/gallery/chinatown.png',
            '/src/assets/gallery/museum.png',
            '/src/assets/gallery/chicago.png',
            '/src/assets/gallery/plaza.png',
            '/src/assets/gallery/dino-museum.png',
            '/src/assets/gallery/winter.png',
            '/src/assets/gallery/fireworks.png',
            '/src/assets/gallery/fish.png'
        ];
        
        this.resourcesToPreload.images.push(...knownImages, ...galleryImages);
        
        // ========================================
        // LOADER AUDIO TRACKS
        // ========================================
        this.resourcesToPreload.audio.push(
            this.audioTracks.loop,
            this.audioTracks.complete
        );
        
        // ========================================
        // STELLAR INTRO AUDIO (CRITICAL FOR SMOOTH PLAYBACK)
        // Paths based on actual file structure from screenshots
        // ========================================
        const stellarAudioPaths = [
            // Voice narration files (from starvortex_assets folder)
            '/src/starvortex_assets/voice_intro.mp3',
            '/src/starvortex_assets/voice-data-display.mp3',
            '/src/starvortex_assets/voice-data-earth.mp3',
            '/src/starvortex_assets/voice-data-user.mp3',
            '/src/starvortex_assets/voice-final.mp3',
            
            // General SFX (from sfx folder)
            '/src/sfx/affirmation-tech.wav',
            '/src/sfx/b-computer-on.mp3',
            '/src/sfx/bcomms-on.mp3',
            '/src/sfx/click.wav',
            '/src/sfx/FX_flow_transition_data-tech.mp3',
            '/src/sfx/FX_press_sheen.mp3',
            '/src/sfx/FX_text_animation_loop.mp3',
            '/src/sfx/FX_Transition.mp3',
            '/src/sfx/hint-notification.wav',
            // '/src/sfx/Hyper-Commission_ZZZ.mp3', // Excluded: too large (75.9 MB)
            '/src/sfx/INTROx_AFTER_loop.mp3',
            '/src/sfx/INTROx_song.mp3',
            '/src/sfx/lifesupport-on.mp3',
            '/src/sfx/Main_song.mp3',
            '/src/sfx/projects_data_analysis.wav',
            '/src/sfx/scan_intro.mp3',
            '/src/sfx/scan-zoom.wav',
            '/src/sfx/skye_data_analysis.wav',
            '/src/sfx/TBL3_AFTER_loop.mp3',
            '/src/sfx/UI_menu_text_rollover.mp3',
            '/src/sfx/UI_menu_text_rollover_2.mp3',
            '/src/sfx/UI_menu_text_rollover_3.mp3',
            '/src/sfx/visions_voice.wav',
            '/src/sfx/voice_scan_before.wav'
        ];
        
        this.resourcesToPreload.stellarAudio.push(...stellarAudioPaths);
        
        // ========================================
        // CALCULATE TOTAL RESOURCES
        // ========================================
        this.totalResources = 
            this.resourcesToPreload.images.length + 
            this.resourcesToPreload.videos.length +
            this.resourcesToPreload.audio.length +
            this.resourcesToPreload.stellarAudio.length;
        
        console.log('[LOADER] Resource count:', {
            images: this.resourcesToPreload.images.length,
            videos: this.resourcesToPreload.videos.length,
            audio: this.resourcesToPreload.audio.length,
            stellarAudio: this.resourcesToPreload.stellarAudio.length,
            total: this.totalResources
        });
    }

    // ========================================
    // LOADING PROCESS METHODS
    // ========================================
    
    /**
     * Start the loading process
     */
    startLoading() {
        console.log('[LOADER] Starting loading timer:', this.loadingDuration + 'ms');
        this.startTime = Date.now();
        
        // Begin background resource preloading
        this.preloadResources();
        
        // Animate loading bar
        this.animateLoadingBar();
        
        // Complete loading after duration
        setTimeout(() => {
            this.completeLoading();
        }, this.loadingDuration);
    }

    /**
     * Preload all collected resources
     */
    preloadResources() {
        console.log('[LOADER] Preloading resources...');
        
        // ========================================
        // PRELOAD IMAGES
        // ========================================
        this.resourcesToPreload.images.forEach(src => {
            const img = new Image();
            img.onload = () => this.onResourceLoaded('image', src);
            img.onerror = () => this.onResourceLoaded('image', src, true);
            img.src = src;
        });
        
        // ========================================
        // PRELOAD VIDEOS (metadata only)
        // ========================================
        this.resourcesToPreload.videos.forEach(src => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => this.onResourceLoaded('video', src);
            video.onerror = () => this.onResourceLoaded('video', src, true);
            video.src = src;
        });
        
        // ========================================
        // PRELOAD LOADER AUDIO
        // ========================================
        this.resourcesToPreload.audio.forEach(src => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.oncanplaythrough = () => this.onResourceLoaded('audio', src);
            audio.onerror = () => this.onResourceLoaded('audio', src, true);
            audio.src = src;
        });
        
        // ========================================
        // PRELOAD STELLAR INTRO AUDIO (HIGH PRIORITY)
        // ========================================
        console.log('[LOADER] Preloading stellar intro audio for smooth playback...');
        this.resourcesToPreload.stellarAudio.forEach(src => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.oncanplaythrough = () => this.onResourceLoaded('stellar-audio', src);
            audio.onerror = () => this.onResourceLoaded('stellar-audio', src, true);
            audio.src = src;
        });
    }

    /**
     * Callback when a resource finishes loading
     */
    onResourceLoaded(type, src, hasError = false) {
        this.loadedResources++;
        
        if (hasError) {
            console.warn('[LOADER] Failed to load:', type, src);
        }
        
        // Log progress at intervals
        const progress = Math.floor((this.loadedResources / this.totalResources) * 100);
        if (this.loadedResources % 10 === 0 || this.loadedResources === this.totalResources) {
            console.log('[LOADER] Resource progress:', this.loadedResources + '/' + this.totalResources, '(' + progress + '%)');
        }
    }

    /**
     * Animate the loading bar based on time
     */
    animateLoadingBar() {
        const updateProgress = () => {
            if (this.loadingComplete) return;
            
            const elapsed = Date.now() - this.startTime;
            const progress = Math.min(100, (elapsed / this.loadingDuration) * 100);
            
            // Update loading bar width
            if (this.loadingBar) {
                this.loadingBar.style.width = progress + '%';
            }
            
            // Update percentage number
            if (this.loadingNumber) {
                this.loadingNumber.textContent = Math.floor(progress);
            }
            
            // Continue animation loop
            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        requestAnimationFrame(updateProgress);
    }

    // ========================================
    // COMPLETION METHODS
    // ========================================
    
    /**
     * Complete the loading process
     */
    completeLoading() {
        this.loadingComplete = true;
        
        console.log('[LOADER] Loading phase complete');
        console.log('[LOADER] Resources loaded:', this.loadedResources + '/' + this.totalResources);
        
        // Fade out loop audio and transition to completion
        if (this.currentAudio) {
            this.fadeOutAudio(this.currentAudio, 1500, () => {
                this.playCompletionSound();
            });
        } else {
            this.playCompletionSound();
        }
    }
    
    /**
     * Play completion sound and finish loading
     */
    playCompletionSound() {
        if (this.audioUnlocked) {
            try {
                const completeSound = new Audio(this.audioTracks.complete);
                completeSound.volume = 0.6;
                completeSound.loop = false;
                
                completeSound.play().then(() => {
                    console.log('[LOADER] Playing completion sound');
                    
                    // Fade out after 2 seconds
                    setTimeout(() => {
                        this.fadeOutAudio(completeSound, 1500, () => {
                            this.finishLoading();
                        });
                    }, 2000);
                }).catch(err => {
                    console.warn('[LOADER] Completion sound failed:', err);
                    this.finishLoading();
                });
            } catch (e) {
                this.finishLoading();
            }
        } else {
            this.finishLoading();
        }
    }
    
    /**
     * Final step: fade out loader and show website
     */
    finishLoading() {
        console.log('[LOADER] Finishing loading sequence...');
        
        // Fade out loader
        if (this.loaderContainer) {
            this.loaderContainer.classList.add('fade-out');
        }
        
        // Show main content
        this.showMainContent();
        
        // Remove loader from DOM after fade animation
        setTimeout(() => {
            if (this.loaderContainer && this.loaderContainer.parentNode) {
                this.loaderContainer.parentNode.removeChild(this.loaderContainer);
            }
            
            // Set global completion flag
            window.preloaderComplete = true;
            
            // Dispatch completion event for app initialization
            window.dispatchEvent(new CustomEvent('preloadComplete'));
            
            console.log('[LOADER] Site ready - all systems go!');
        }, 800);
    }

    // ========================================
    // CLEANUP METHODS
    // ========================================
    
    /**
     * Destroy loader and cleanup resources
     */
    destroy() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        if (this.loaderContainer && this.loaderContainer.parentNode) {
            this.loaderContainer.parentNode.removeChild(this.loaderContainer);
        }
    }
}

// ========================================
// MODULE EXPORTS & INITIALIZATION
// ========================================

// Create singleton instance
export const loaderManager = new LoaderManager();

/**
 * Initialize loader on DOM ready
 */
function initLoader() {
    try {
        console.log('[LOADER] Initializing loader system...');
        loaderManager.init();
        
        if (loaderManager.initialized) {
            console.log('[LOADER] Starting loading process...');
            loaderManager.startLoading();
        } else {
            console.error('[LOADER] ERROR: Initialization failed - DOM elements not found');
        }
    } catch (error) {
        console.error('[LOADER] Initialization error:', error);
    }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
} else {
    // DOM already ready, initialize with slight delay
    setTimeout(initLoader, 0);
}

// Make available globally
window.loaderManager = loaderManager;
export default loaderManager;
