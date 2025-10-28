/**
 * ============================
 * NAVIGATION MANAGER MODULE
 * ============================
 * Handles navigation interactions and indicator animations
 * Exports as ES6 module
 */

import { soundManager } from './soundManager.js';
import { animationsManager } from './animations.js';

class NavigationManager {
    constructor() {
        this.navLinks = null;
        this.indicator = null;
        this.navMenu = null;
        this.currentPage = 'home';
        this.initialized = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 1000);
        }
    }

    init() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.indicator = document.querySelector('.nav-indicator-bg');
        this.navMenu = document.querySelector('.nav-menu');

        if (!this.navLinks.length || !this.indicator || !this.navMenu) {
            console.warn('Navigation elements not found');
            return;
        }

        this.initializeIndicator();
        this.setupEventListeners();
        this.initialized = true;
        console.log('✅ Navigation Manager module loaded');
    }

    initializeIndicator() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            this.moveIndicator(activeLink);
        }
    }

    setupEventListeners() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleLinkClick(e, link));
        });

        this.navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => this.handleLinkHover(link));
        });

        this.navMenu.addEventListener('mouseleave', () => this.handleMenuLeave());
        window.addEventListener('resize', () => this.handleResize());
    }

    handleLinkClick(e, link) {
        e.preventDefault();

        soundManager?.play('click', 0.4);

        const pageName = link.getAttribute('data-page');
        
        if (this.currentPage === pageName) return;

        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        this.moveIndicator(link);
        this.navigateToPage(pageName);
    }

    navigateToPage(pageName) {
        this.currentPage = pageName;
        
        if (animationsManager?.initialized) {
            animationsManager.navigateToPage(pageName);
        }

        // Emit navigation event
        window.dispatchEvent(new CustomEvent('pageChanged', {
            detail: { page: pageName }
        }));
    }

    handleLinkHover(link) {
        soundManager?.play('tick', 0.15);
        this.moveIndicator(link);
    }

    handleMenuLeave() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            this.moveIndicator(activeLink);
        }
    }

    handleResize() {
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) {
            setTimeout(() => {
                this.moveIndicator(activeLink);
            }, 100);
        }
    }

    moveIndicator(link) {
        if (!link || !this.indicator) return;

        const linkRect = link.getBoundingClientRect();
        const navRect = this.navMenu.getBoundingClientRect();

        const left = linkRect.left - navRect.left;
        const width = linkRect.width;

        this.indicator.style.left = `${left}px`;
        this.indicator.style.width = `${width}px`;
    }

    setActivePage(pageName) {
        const link = document.querySelector(`.nav-link[data-page="${pageName}"]`);
        if (link) {
            this.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            this.moveIndicator(link);
            this.currentPage = pageName;
        }
    }

    addNotificationDot(pageName) {
        const link = document.querySelector(`.nav-link[data-page="${pageName}"]`);
        if (link) {
            link.classList.add('has-indicator');
        }
    }

    removeNotificationDot(pageName) {
        const link = document.querySelector(`.nav-link[data-page="${pageName}"]`);
        if (link) {
            link.classList.remove('has-indicator');
        }
    }

    getCurrentPage() {
        return this.currentPage;
    }

    destroy() {
        // Cleanup event listeners if needed
    }
}

export const navigationManager = new NavigationManager();
window.navigationManager = navigationManager;
export default navigationManager;