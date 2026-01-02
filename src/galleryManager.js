/**
 * ============================
 * GALLERY MANAGER MODULE - galleryManager.js
 * ============================
 */

import { soundManager } from './soundManager.js';

class GalleryManager {
    constructor() {
        this.galleries = {
            everything: [
                '/src/assets/gallery/orlando.png',
                '/src/assets/gallery/roses.png',
                '/src/assets/gallery/chinatown.png',
                '/src/assets/gallery/museum.png',
                '/src/assets/gallery/chicago.png'
            ],
            places: [
                '/src/assets/gallery/plaza.png',
                '/src/assets/gallery/dino-museum.png',
                '/src/assets/gallery/winter.png',
                '/src/assets/gallery/fireworks.png',
                '/src/assets/gallery/fish.png'
            ],
            heart: [
                '/src/assets/gallery/sunny.jpg',
                '/src/assets/gallery/cutie-sunny.jpg',
                '/src/assets/gallery/cute-sunny.jpg',
                '/src/assets/gallery/strawberries-sunny.jpg'
            ],
            cat: [
                '/src/assets/gallery/midnight-travel.png',
                '/src/assets/gallery/cute-girl.png',
                '/src/assets/gallery/sleepy-baby.png',
                '/src/assets/gallery/midnight.png',
                '/src/assets/gallery/idk.png',
                '/src/assets/gallery/silly-girl.png',
                '/src/assets/gallery/her-little-face.png',
                '/src/assets/gallery/sleepy-girl.png'
            ]
        };
        
        this.currentCategory = 'everything';
        this.currentImageIndex = 0;
        this.rotationInterval = null;
        this.rotationDelay = 30000;
        this.imageCache = new Map();
        this.preloadQueue = new Set();
        this.transitionDuration = 400;
        this.isTransitioning = false;
        this.pendingTransition = null;
        this.initialized = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.photosPanel = document.getElementById('mediumPanel3');
        this.galleryImage = document.getElementById('galleryImage');
        this.galleryNav = document.getElementById('galleryNav');
        
        if (!this.photosPanel || !this.galleryImage || !this.galleryNav) {
            return;
        }
        
        this.setupContainer();
        this.setupNavigation();
        
        Object.keys(this.galleries).forEach(cat => this.preloadCategory(cat));
        
        this.loadImageInstant(this.currentCategory, 0);
        this.startRotation();
        this.setupVisibilityHandler();
        
        this.initialized = true;
    }

    setupContainer() {
        const container = this.galleryImage.parentElement;
        container.style.cssText = `
            position: relative;
            overflow: hidden;
            transform: translateZ(0);
            will-change: contents;
        `;
        
        this.galleryImage.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transform: translateZ(0);
            backface-visibility: hidden;
            cursor: pointer;
            user-select: none;
        `;
        
        this.galleryImage.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextImage();
            soundManager?.play('menuClick', 0.6);
        }, { passive: false });
    }

    setupNavigation() {
        const navButtons = this.galleryNav.querySelectorAll('.gallery-nav-btn');
        const indicator = this.galleryNav.querySelector('.gallery-nav-indicator');
        
        this.buttonPositions = [];
        
        navButtons.forEach((button, index) => {
            const buttonWidth = button.offsetWidth;
            const gap = 4;
            this.buttonPositions.push({
                left: index * (buttonWidth + gap) + 2,
                width: buttonWidth
            });
            
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.changeCategory(category);
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const pos = this.buttonPositions[index];
                indicator.style.transform = `translateX(${pos.left}px)`;
                indicator.style.width = `${pos.width}px`;
                
                soundManager?.play('menuClick', 0.6);
            });
        });
        
        if (this.buttonPositions.length > 0) {
            const pos = this.buttonPositions[0];
            indicator.style.transform = `translateX(${pos.left}px)`;
            indicator.style.width = `${pos.width}px`;
            indicator.style.transition = 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }

    preloadCategory(category) {
        const images = this.galleries[category];
        if (!images) return;
        
        images.forEach(src => {
            if (this.imageCache.has(src) || this.preloadQueue.has(src)) return;
            
            this.preloadQueue.add(src);
            const img = new Image();
            
            img.onload = () => {
                this.imageCache.set(src, img);
                this.preloadQueue.delete(src);
            };
            
            img.onerror = () => {
                this.preloadQueue.delete(src);
            };
            
            img.src = src;
        });
    }

    changeCategory(category) {
        if (!this.galleries[category] || category === this.currentCategory) return;
        
        this.currentCategory = category;
        this.currentImageIndex = 0;
        
        this.stopRotation();
        this.loadImageInstant(category, 0);
        this.startRotation();
    }

    loadImageInstant(category, index) {
        const images = this.galleries[category];
        if (!images || images.length === 0) return;
        
        index = ((index % images.length) + images.length) % images.length;
        const imagePath = images[index];
        
        if (this.isTransitioning) {
            this.pendingTransition = { category, index };
            return;
        }
        
        this.currentImageIndex = index;
        
        if (this.imageCache.has(imagePath)) {
            this.transitionInstant(imagePath);
        } else {
            this.loadUrgent(imagePath);
        }
        
        this.preloadAhead(category, index);
    }

    loadUrgent(imagePath) {
        const img = new Image();
        
        img.onload = () => {
            this.imageCache.set(imagePath, img);
            this.transitionInstant(imagePath);
        };
        
        img.onerror = () => {
            this.nextImage();
        };
        
        img.src = imagePath;
    }

    transitionInstant(newImagePath) {
        this.isTransitioning = true;
        
        soundManager?.play('click', 0.4);
        
        const container = this.galleryImage.parentElement;
        const oldImage = this.galleryImage;
        
        const newImage = document.createElement('img');
        newImage.src = newImagePath;
        newImage.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0;
            transform: translateZ(0);
            backface-visibility: hidden;
            cursor: pointer;
            user-select: none;
            transition: opacity ${this.transitionDuration}ms cubic-bezier(0.2, 0, 0.2, 1);
        `;
        
        oldImage.style.transition = `opacity ${this.transitionDuration}ms cubic-bezier(0.2, 0, 0.2, 1)`;
        
        container.appendChild(newImage);
        
        void newImage.offsetHeight;
        
        oldImage.style.opacity = '0';
        newImage.style.opacity = '1';
        
        newImage.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextImage();
            soundManager?.play('click', 0.6);
        }, { passive: false });
        
        setTimeout(() => {
            if (oldImage.parentElement) {
                oldImage.parentElement.removeChild(oldImage);
            }
            
            this.galleryImage = newImage;
            this.isTransitioning = false;
            
            soundManager?.play('hover', 0.2);
            
            if (this.pendingTransition) {
                const pending = this.pendingTransition;
                this.pendingTransition = null;
                this.loadImageInstant(pending.category, pending.index);
            }
        }, this.transitionDuration);
    }

    preloadAhead(category, currentIndex) {
        const images = this.galleries[category];
        for (let i = 1; i <= 2; i++) {
            const nextIndex = (currentIndex + i) % images.length;
            const nextPath = images[nextIndex];
            
            if (!this.imageCache.has(nextPath) && !this.preloadQueue.has(nextPath)) {
                this.preloadQueue.add(nextPath);
                const img = new Image();
                img.onerror = () => this.preloadQueue.delete(nextPath);
                img.src = nextPath;
            }
        }
    }

    nextImage() {
        const nextIndex = (this.currentImageIndex + 1) % this.galleries[this.currentCategory].length;
        this.loadImageInstant(this.currentCategory, nextIndex);
    }

    previousImage() {
        const images = this.galleries[this.currentCategory];
        const prevIndex = (this.currentImageIndex - 1 + images.length) % images.length;
        this.loadImageInstant(this.currentCategory, prevIndex);
    }

    startRotation() {
        this.stopRotation();
        this.rotationInterval = setInterval(() => this.nextImage(), this.rotationDelay);
    }

    stopRotation() {
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
            this.rotationInterval = null;
        }
    }

    setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopRotation();
            } else {
                this.startRotation();
            }
        });
    }

    setRotationDelay(delay) {
        this.rotationDelay = delay;
        if (this.rotationInterval) {
            this.startRotation();
        }
    }

    setTransitionDuration(duration) {
        this.transitionDuration = duration;
    }

    addImagesToCategory(category, images) {
        if (!this.galleries[category]) {
            this.galleries[category] = [];
        }
        this.galleries[category].push(...images);
        this.preloadCategory(category);
    }

    clearCache() {
        this.imageCache.clear();
        this.preloadQueue.clear();
    }

    getCurrentCategory() {
        return this.currentCategory;
    }

    getCurrentImageIndex() {
        return this.currentImageIndex;
    }

    destroy() {
        this.stopRotation();
        this.clearCache();
        this.pendingTransition = null;
    }
}

class HighlightsManager {
    constructor() {
        this.initialized = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.twitterPanel = document.getElementById('mediumPanel1');
        this.twitterButton = this.twitterPanel?.querySelector('.twitter-button');
        
        if (this.twitterPanel && this.twitterButton) {
            this.initTwitterPanel();
        }

        this.initialized = true;
    }

    initTwitterPanel() {
        let soundPlayed = false;
        let hoverTimeout = null;

        this.twitterButton.addEventListener('mouseenter', () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
            
            hoverTimeout = setTimeout(() => {
                if (!soundPlayed) {
                    soundManager?.play('twitter', 0.3);
                    soundPlayed = true;
                }
            }, 100);
        });

        this.twitterButton.addEventListener('mouseleave', () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });

        this.twitterPanel.addEventListener('mouseleave', () => {
            soundPlayed = false;
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        });

        this.twitterButton.addEventListener('click', (e) => {
            e.stopPropagation();
            
            soundManager?.play('click', 0.3);
            window.open('https://twitter.com/LuvrksnSkye', '_blank');
        });

        this.twitterPanel.addEventListener('click', (e) => {
            if (!e.target.closest('.twitter-button')) {
                soundManager?.play('hover', 0.15);
            }
        });
    }

    updateTweetContent(tweetText) {
        const tweetElement = this.twitterPanel?.querySelector('.tweet-text p');
        if (tweetElement) {
            tweetElement.textContent = tweetText;
        }
    }

    setTwitterUrl(url) {
        this.twitterUrl = url;
    }

    destroy() {
        // Cleanup
    }
}

// Exportar ambas instancias
export const galleryManager = new GalleryManager();
export const highlightsManager = new HighlightsManager();

// Hacer disponibles globalmente
window.galleryManager = galleryManager;
window.highlightsManager = highlightsManager;