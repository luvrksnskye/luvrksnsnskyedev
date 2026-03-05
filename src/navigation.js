/**
 * NAVIGATION MANAGER MODULE
 * Handles navigation between all screens (home, about, work, contact)
 * - Clean state machine with guaranteed lock release
 * - Proper work mode integration via workManager
 * - Uses existing CSS transitions on screen classes
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
        this.isNavigating = false;
        this.navigationQueue = [];

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 1000);
        }
    }

    init() {
        if (this.initialized) return;

        this.navLinks = document.querySelectorAll('.nav-link');
        this.indicator = document.querySelector('.nav-indicator-bg');
        this.navMenu = document.querySelector('.nav-menu');

        if (!this.navLinks.length || !this.indicator || !this.navMenu) {
            console.warn('[NAV] Elements not found');
            return;
        }

        this.initializeIndicator();
        this.setupEventListeners();
        this.setupPageVisibility();
        this.initialized = true;
        console.log('[NAV] Initialized');
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
            link.addEventListener('mouseenter', () => this.handleLinkHover(link));
        });

        this.navMenu.addEventListener('mouseleave', () => this.handleMenuLeave());
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('navigateToPage', (e) => {
            if (e.detail?.page) {
                this.navigateToPage(e.detail.page);
            }
        });
    }

    setupPageVisibility() {
        const screens = ['homeScreen', 'aboutScreen', 'contactScreen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                if (screenId === 'homeScreen') {
                    screen.style.display = '';
                } else {
                    screen.classList.remove('show');
                }
            }
        });
    }

    handleLinkClick(e, link) {
        e.preventDefault();

        const pageName = link.getAttribute('data-page');

        if (this.currentPage === pageName || this.isNavigating) return;

        try { soundManager?.play('click', 0.4); } catch (err) {}

        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        this.moveIndicator(link);
        this.navigateToPage(pageName);
    }

    navigateToPage(pageName) {
        if (this.currentPage === pageName) return;

        if (this.isNavigating) {
            this.navigationQueue = [pageName];
            return;
        }

        this.isNavigating = true;
        const previousPage = this.currentPage;
        this.currentPage = pageName;

        try {
            if (pageName === 'work') {
                this.handleWorkNavigation(previousPage);
                return;
            }

            if (previousPage === 'work') {
                this.exitWorkThenTransition(pageName);
                return;
            }

            this.performPageTransition(pageName, previousPage);
        } catch (err) {
            console.error('[NAV] Navigation error:', err);
            this.finishNavigation();
        }
    }

    /* ====================================================
     *  WORK MODE TRANSITIONS
     * ==================================================== */

    handleWorkNavigation(previousPage) {
        this.hideScreen(previousPage, () => {
            try {
                if (window.workManager) {
                    window.workManager.enterWorkMode();
                }
            } catch (err) {
                console.error('[NAV] Work mode error:', err);
            }

            this.finishNavigation();

            window.dispatchEvent(new CustomEvent('pageChanged', {
                detail: { page: 'work', previousPage }
            }));
        });
    }

    exitWorkThenTransition(pageName) {
        try {
            if (window.workManager?.isActive) {
                window.workManager.exitWorkMode(pageName);
            }
        } catch (err) {
            console.error('[NAV] Exit work error:', err);
        }

        setTimeout(() => {
            this.revealScreen(pageName);

            window.dispatchEvent(new CustomEvent('pageChanged', {
                detail: { page: pageName, previousPage: 'work' }
            }));
        }, 200);
    }

    /* ====================================================
     *  NORMAL PAGE TRANSITIONS
     * ==================================================== */

    performPageTransition(pageName, previousPage) {
        this.hideScreen(previousPage, () => {
            this.revealScreen(pageName);

            window.dispatchEvent(new CustomEvent('pageChanged', {
                detail: { page: pageName, previousPage }
            }));
        });
    }

    /**
     * Hide a screen by removing .show. Waits for CSS transition
     * to finish, then calls the callback. Always calls callback
     * even if the screen was not showing.
     */
    hideScreen(pageName, callback) {
        const screen = document.getElementById(`${pageName}Screen`);

        if (screen && screen.classList.contains('show')) {
            screen.classList.remove('show');
            setTimeout(() => {
                if (callback) callback();
            }, 350);
        } else {
            if (callback) callback();
        }
    }

    /**
     * Reveal the target screen. Clears stale classes from every
     * standard screen, then adds .show to the target.
     *
     * CRITICAL: finishNavigation is ALWAYS called via a safety
     * timeout, even if an error occurs in the animation call.
     */
    revealScreen(pageName) {
        const allScreenIds = ['homeScreen', 'aboutScreen', 'contactScreen'];

        allScreenIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.remove('show', 'hidden');
            }
        });

        const target = document.getElementById(`${pageName}Screen`);

        if (target) {
            /* Use double-rAF to guarantee the browser has flushed
               the removal of .show before we re-add it. This ensures
               the CSS transition fires reliably on every screen. */
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    target.classList.add('show');

                    try {
                        if (animationsManager?.initialized &&
                            typeof animationsManager.navigateToPage === 'function') {
                            animationsManager.navigateToPage(pageName);
                        }
                    } catch (err) {
                        console.warn('[NAV] Animation call failed:', err);
                    }
                });
            });

            /* Safety timeout - always release the navigation lock.
               This runs independently of the rAF callbacks above. */
            setTimeout(() => {
                this.finishNavigation();
            }, 500);
        } else {
            console.warn('[NAV] Target screen not found:', `${pageName}Screen`);
            this.finishNavigation();
        }
    }

    /* ====================================================
     *  NAVIGATION STATE
     * ==================================================== */

    finishNavigation() {
        this.isNavigating = false;

        if (this.navigationQueue.length > 0) {
            const nextPage = this.navigationQueue.shift();
            this.navigateToPage(nextPage);
        }
    }

    /* ====================================================
     *  INDICATOR AND HOVER
     * ==================================================== */

    handleLinkHover(link) {
        try { soundManager?.play('tick', 0.15); } catch (err) {}
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

    /* ====================================================
     *  PUBLIC API
     * ==================================================== */

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

    forceNavigate(pageName) {
        this.isNavigating = false;
        this.navigationQueue = [];
        this.navigateToPage(pageName);
    }

    destroy() {
        this.navigationQueue = [];
        this.isNavigating = false;
    }
}

export const navigationManager = new NavigationManager();
window.navigationManager = navigationManager;
export default navigationManager;
