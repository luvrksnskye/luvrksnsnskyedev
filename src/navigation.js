/**
 * NAVIGATION MANAGER MODULE
 * Gestión de navegación e indicadores
 * - Transiciones suaves entre páginas
 * - Queue de navegación
 * - Integración con managers
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

        soundManager?.play('click', 0.4);

        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        this.moveIndicator(link);
        this.navigateToPage(pageName);
    }

    navigateToPage(pageName) {
        if (this.currentPage === pageName) return;
        
        if (this.isNavigating) {
            this.navigationQueue.push(pageName);
            return;
        }

        this.isNavigating = true;
        const previousPage = this.currentPage;
        this.currentPage = pageName;

        if (pageName === 'work') {
            this.handleWorkNavigation(previousPage);
            return;
        }

        if (previousPage === 'work') {
            this.exitWorkMode(() => {
                this.performPageTransition(pageName, previousPage);
            });
            return;
        }

        this.performPageTransition(pageName, previousPage);
    }

    performPageTransition(pageName, previousPage) {
        const currentScreen = document.getElementById(`${previousPage}Screen`);
        if (currentScreen && previousPage !== 'work') {
            currentScreen.classList.add('page-exit');
            currentScreen.classList.remove('show');
        }

        setTimeout(() => {
            if (currentScreen && previousPage !== 'work') {
                currentScreen.classList.remove('page-exit');
            }

            const targetScreen = document.getElementById(`${pageName}Screen`);
            if (targetScreen) {
                targetScreen.classList.add('page-enter');
                targetScreen.classList.add('show');
                
                if (animationsManager?.initialized) {
                    animationsManager.navigateToPage(pageName);
                }

                setTimeout(() => {
                    targetScreen.classList.remove('page-enter');
                    this.finishNavigation();
                }, 400);
            } else {
                this.finishNavigation();
            }

            window.dispatchEvent(new CustomEvent('pageChanged', {
                detail: { page: pageName, previousPage }
            }));

        }, 300);
    }

    handleWorkNavigation(previousPage) {
        const currentScreen = document.getElementById(`${previousPage}Screen`);
        if (currentScreen) {
            currentScreen.classList.remove('show');
        }

        if (window.workManager) {
            window.workManager.enterWorkMode();
        }

        this.finishNavigation();

        window.dispatchEvent(new CustomEvent('pageChanged', {
            detail: { page: 'work', previousPage }
        }));
    }

    exitWorkMode(callback) {
        if (window.workManager?.isActive) {
            window.workManager.exitWorkMode();
        }
        
        setTimeout(() => {
            if (callback) callback();
        }, 100);
    }

    finishNavigation() {
        this.isNavigating = false;
        
        if (this.navigationQueue.length > 0) {
            const nextPage = this.navigationQueue.shift();
            this.navigateToPage(nextPage);
        }
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
