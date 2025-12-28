/**
 * ============================
 * LOADER MANAGER MODULE
 * ============================
 * Handles the 1:50 preloading screen with audio
 * Optimizes resource loading to prevent lag
 */

class LoaderManager {
    constructor() {
        this.initialized = false;
        this.audioUnlocked = false;
        this.loadingComplete = false;
        this.loadingDuration = 60000; // 1 minute in ms
        this.startTime = null;
        
        // Audio tracks
        this.audioTracks = {
            loop: '/src/sfx/TBL3_AFTER_loop.mp3',
            complete: '/src/sfx/FX_text_animation_loop.mp3'
        };
        
        this.currentAudio = null;
        
        // Resources to preload
        this.resourcesToPreload = {
            images: [],
            videos: [],
            audio: []
        };
        
        this.loadedResources = 0;
        this.totalResources = 0;
        
        // DOM Elements (will be set in init)
        this.loaderContainer = null;
        this.loadingBar = null;
        this.loadingNumber = null;
        this.audioPrompt = null;
    }

    /**
     * Initialize the loader
     */
    init() {
        if (this.initialized) return;
        
        console.log('🔍 Looking for preloader elements...');
        
        // Get DOM references (elements already exist in HTML)
        this.loaderContainer = document.getElementById('preloader');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingNumber = document.getElementById('loadPercent');
        this.audioPrompt = document.getElementById('audioPrompt');
        
        console.log('📋 Found elements:', {
            loaderContainer: !!this.loaderContainer,
            loadingBar: !!this.loadingBar,
            loadingNumber: !!this.loadingNumber,
            audioPrompt: !!this.audioPrompt
        });
        
        if (!this.loaderContainer) {
            console.error('❌ Preloader element not found in HTML');
            return;
        }
        
        if (!this.loadingBar || !this.loadingNumber) {
            console.error('❌ Loading bar or number element not found');
            return;
        }
        
        this.collectResources();
        this.setupAudioPrompt();
        this.hideMainContent();
        
        this.initialized = true;
        console.log('✅ Loader Manager initialized');
    }

    /**
     * Hide all main content during loading
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
     * Show main content after loading
     */
    showMainContent() {
        // Show the video background
        const videoBackground = document.querySelector('.video-background');
        if (videoBackground) {
            videoBackground.style.visibility = 'visible';
            videoBackground.style.opacity = '1';
            videoBackground.style.transition = 'opacity 0.5s ease';
        }
        
        // For introScreen, just remove the inline styles so CSS can control it
        const introScreen = document.getElementById('introScreen');
        if (introScreen) {
            introScreen.style.visibility = '';
            introScreen.style.opacity = '';
        }
        
        // Reset the hidden styles on other elements so they can be shown by navigation
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
                // Remove inline styles so CSS classes can control visibility
                el.style.visibility = '';
                el.style.opacity = '';
            }
        });
    }

    /**
     * Setup audio prompt click handler
     */
    setupAudioPrompt() {
        const unlockAudio = (e) => {
            if (this.audioUnlocked) return;
            
            this.audioUnlocked = true;
            
            // Update UI
            if (this.audioPrompt) {
                this.audioPrompt.classList.add('activated');
                const textEl = this.audioPrompt.querySelector('.audio-text');
                if (textEl) {
                    textEl.textContent = 'SOUND ENABLED';
                }
            }
            
            // Start playing audio
            this.playLoopAudio();
            
            console.log('🔊 Audio enabled');
        };
        
        // Listen for any click/touch/key on the document
        document.addEventListener('click', unlockAudio, { passive: true });
        document.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('keydown', unlockAudio, { passive: true });
    }

    /**
     * Play the loop audio
     */
    playLoopAudio() {
        if (!this.audioUnlocked) return;
        
        try {
            this.currentAudio = new Audio(this.audioTracks.loop);
            this.currentAudio.loop = true;
            this.currentAudio.volume = 0.5;
            
            this.currentAudio.play().catch(err => {
                console.warn('Audio play failed:', err);
            });
            
            console.log('🎵 Playing loop audio');
        } catch (err) {
            console.error('Error playing audio:', err);
        }
    }

    /**
     * Fade out audio
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
     * Fade in audio
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

    /**
     * Collect all resources to preload
     */
    collectResources() {
        // Collect all images from the page
        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            if (img.src && !img.src.includes('preloader')) {
                this.resourcesToPreload.images.push(img.src);
            }
        });
        
        // Collect background images
        const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
        elementsWithBg.forEach(el => {
            const bgStyle = el.style.backgroundImage;
            if (bgStyle) {
                const match = bgStyle.match(/url\(['"]?(.+?)['"]?\)/);
                if (match) {
                    this.resourcesToPreload.images.push(match[1]);
                }
            }
        });
        
        // Collect video sources
        const videos = document.querySelectorAll('video source');
        videos.forEach(source => {
            if (source.src) {
                this.resourcesToPreload.videos.push(source.src);
            }
        });
        
        // Add known assets from managers
        const knownImages = [
            '/src/assets/figma-icon.png',
            '/src/assets/github-icon.png',
            '/src/assets/vscode-icon.png',
            '/src/assets/firealpaca-icon.png',
            '/src/assets/godot-icon.png',
            '/src/assets/ghostty-icon.png',
            '/src/assets/aftereffects-icon.png',
            '/src/assets/aseprite-icon.png',
            '/src/assets/git-icon.svg',
            '/src/assets/debian-icon.png',
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
        
        // Add gallery images
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
        
        // Preload audio tracks
        this.resourcesToPreload.audio.push(
            this.audioTracks.loop,
            this.audioTracks.complete
        );
        
        // Calculate total
        this.totalResources = 
            this.resourcesToPreload.images.length + 
            this.resourcesToPreload.videos.length +
            this.resourcesToPreload.audio.length;
        
        console.log(`📦 Found ${this.totalResources} resources to preload`);
    }

    /**
     * Start the loading process
     */
    startLoading() {
        console.log('⏱️ Starting loading timer for', this.loadingDuration, 'ms');
        this.startTime = Date.now();
        
        // Start preloading resources in background
        this.preloadResources();
        
        // Animate the loading bar
        this.animateLoadingBar();
        
        // Complete loading after duration
        setTimeout(() => {
            this.completeLoading();
        }, this.loadingDuration);
    }

    /**
     * Preload all resources
     */
    preloadResources() {
        // Preload images
        this.resourcesToPreload.images.forEach(src => {
            const img = new Image();
            img.onload = () => this.onResourceLoaded();
            img.onerror = () => this.onResourceLoaded();
            img.src = src;
        });
        
        // Preload videos (metadata only)
        this.resourcesToPreload.videos.forEach(src => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => this.onResourceLoaded();
            video.onerror = () => this.onResourceLoaded();
            video.src = src;
        });
        
        // Preload audio
        this.resourcesToPreload.audio.forEach(src => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.oncanplaythrough = () => this.onResourceLoaded();
            audio.onerror = () => this.onResourceLoaded();
            audio.src = src;
        });
    }

    /**
     * Called when a resource is loaded
     */
    onResourceLoaded() {
        this.loadedResources++;
    }

    /**
     * Animate the loading bar
     */
    animateLoadingBar() {
        const updateProgress = () => {
            if (this.loadingComplete) return;
            
            const elapsed = Date.now() - this.startTime;
            const progress = Math.min(100, (elapsed / this.loadingDuration) * 100);
            
            // Update loading bar
            if (this.loadingBar) {
                this.loadingBar.style.width = `${progress}%`;
            }
            
            // Update percentage number
            if (this.loadingNumber) {
                this.loadingNumber.textContent = Math.floor(progress);
            }
            
            // Continue animation
            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        requestAnimationFrame(updateProgress);
    }

    /**
     * Complete the loading process
     */
    completeLoading() {
        this.loadingComplete = true;
        
        console.log('✅ Loading complete');
        
        // Fade out loop audio and play completion sound
        if (this.currentAudio) {
            this.fadeOutAudio(this.currentAudio, 1500, () => {
                // Play completion sound after loop fades out
                this.playCompletionSound();
            });
        } else {
            // If no loop audio was playing, just play completion sound
            this.playCompletionSound();
        }
    }
    
    /**
     * Play completion sound and then fade out loader
     */
    playCompletionSound() {
        if (this.audioUnlocked) {
            try {
                const completeSound = new Audio(this.audioTracks.complete);
                completeSound.volume = 0.6;
                completeSound.loop = false;
                
                completeSound.play().then(() => {
                    console.log('🎵 Playing completion sound');
                    
                    // Fade out completion sound after 2 seconds
                    setTimeout(() => {
                        this.fadeOutAudio(completeSound, 1500, () => {
                            this.finishLoading();
                        });
                    }, 2000);
                }).catch(err => {
                    console.warn('Completion sound failed:', err);
                    this.finishLoading();
                });
            } catch (e) {
                this.finishLoading();
            }
        } else {
            // If audio not unlocked, just finish loading
            this.finishLoading();
        }
    }
    
    /**
     * Finish loading and show the website
     */
    finishLoading() {
        // Fade out loader
        if (this.loaderContainer) {
            this.loaderContainer.classList.add('fade-out');
        }
        
        // Show main content
        this.showMainContent();
        
        // Remove loader from DOM after fade
        setTimeout(() => {
            if (this.loaderContainer && this.loaderContainer.parentNode) {
                this.loaderContainer.parentNode.removeChild(this.loaderContainer);
            }
            
            // Set global flag
            window.preloaderComplete = true;
            
            // Dispatch event that loading is complete
            window.dispatchEvent(new CustomEvent('preloadComplete'));
            
            console.log('🎉 Site ready!');
        }, 800);
    }

    /**
     * Destroy the loader
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

// Create and export singleton
export const loaderManager = new LoaderManager();

// Initialize on DOM ready
function initLoader() {
    try {
        console.log('🔄 Initializing loader...');
        loaderManager.init();
        
        if (loaderManager.initialized) {
            console.log('🔄 Starting loading process...');
            loaderManager.startLoading();
        } else {
            console.error('❌ Loader failed to initialize - DOM elements not found');
        }
    } catch (error) {
        console.error('❌ Loader initialization error:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
} else {
    // DOM already ready, but use setTimeout to ensure all elements are parsed
    setTimeout(initLoader, 0);
}

window.loaderManager = loaderManager;
export default loaderManager;
