/**
 * ============================
 * CORE MODULE
 * ============================
 * Central hub that coordinates all managers
 * Handles initialization and cross-manager communication
 */

import { soundManager } from './soundManager.js';
import { animationsManager } from './animations.js';
import { navigationManager } from './navigation.js';
import { darkModeManager } from './darkModeManager.js';
import { aboutManager } from './aboutManager.js';
import { toolsManager } from './toolsManager.js';
import { languagesManager } from './languagesManager.js';
import { musicManager, youtubeManager } from './musicManager.js';
import { galleryManager, highlightsManager } from './galleryManager.js';
import { contactManager } from './contactManager.js';

class CoreManager {
    constructor() {
        this.managers = {
            sound: soundManager,
            animations: animationsManager,
            navigation: navigationManager,
            darkMode: darkModeManager,
            about: aboutManager,
            tools: toolsManager,
            languages: languagesManager,
            music: musicManager,
            youtube: youtubeManager,
            gallery: galleryManager,
            highlights: highlightsManager,
            contact: contactManager
        };

        this.isInitialized = false;
        this.initPromises = [];

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize all managers in the correct order
     */
    async init() {
        if (this.isInitialized) return;

        console.log('🚀 Core Manager initializing...');

        try {
            // Phase 1: Critical managers that others depend on
            await this.initializeCritical();

            // Phase 2: UI managers
            await this.initializeUI();

            // Phase 3: Content managers
            await this.initializeContent();

            // Setup cross-manager communication
            this.setupCommunication();

            this.isInitialized = true;
            console.log('✅ Core Manager initialized successfully');

            // Dispatch global ready event
            this.dispatchReadyEvent();

        } catch (error) {
            console.error('❌ Core Manager initialization failed:', error);
        }
    }

    /**
     * Initialize critical managers first
     */
    async initializeCritical() {
        console.log('⚡ Initializing critical managers...');
        
        // Sound manager needs to be ready first
        if (this.managers.sound && !this.managers.sound.initialized) {
            this.managers.sound.preloadAll();
        }

        // Animations manager is critical for transitions
        // Already initialized in its constructor
    }

    /**
     * Initialize UI managers
     */
    async initializeUI() {
        console.log('🎨 Initializing UI managers...');
        
        // These handle the main interface
        // Already initialized in their constructors
    }

    /**
     * Initialize content managers
     */
    async initializeContent() {
        console.log('📦 Initializing content managers...');
        
        // These handle specific content sections
        // Already initialized in their constructors
    }

    /**
     * Setup cross-manager communication
     */
    setupCommunication() {
        console.log('🔗 Setting up cross-manager communication...');

        // Music and YouTube should pause each other
        this.setupMediaCoordination();

        // Navigation should trigger animations
        this.setupNavigationAnimations();

        // Dark mode affects all visual managers
        this.setupThemeCoordination();
    }

    /**
     * Coordinate music and YouTube playback
     */
    setupMediaCoordination() {
        const { music, youtube } = this.managers;

        if (music && youtube) {
            // Original play methods
            const musicOriginalPlay = music.play.bind(music);
            const youtubeOriginalPlay = youtube.play.bind(youtube);

            // Override music play to pause YouTube
            music.play = function() {
                if (youtube.getIsPlaying()) {
                    youtube.pause();
                }
                return musicOriginalPlay();
            };

            // Override YouTube play to pause music
            youtube.play = function() {
                if (music.getIsPlaying()) {
                    music.pause();
                }
                return youtubeOriginalPlay();
            };
        }
    }

    /**
     * Coordinate navigation with animations
     */
    setupNavigationAnimations() {
        const { navigation, animations } = this.managers;

        if (navigation && animations) {
            // Original navigate method
            const originalNavigate = navigation.navigateToPage.bind(navigation);

            // Override to include animations
            navigation.navigateToPage = function(pageName) {
                // Trigger page change animations
                animations.navigateToPage(pageName);
                
                // Call original navigation
                return originalNavigate(pageName);
            };
        }
    }

    /**
     * Coordinate theme changes across managers
     */
    setupThemeCoordination() {
        const { darkMode } = this.managers;

        if (darkMode) {
            // Listen for theme changes
            const originalToggle = darkMode.toggleTheme.bind(darkMode);

            darkMode.toggleTheme = function() {
                const result = originalToggle();
                
                // Notify other managers of theme change
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { isDarkMode: darkMode.isDarkMode }
                }));

                return result;
            };
        }
    }

    /**
     * Dispatch ready event when all managers are initialized
     */
    dispatchReadyEvent() {
        window.dispatchEvent(new CustomEvent('coreReady', {
            detail: { managers: this.managers }
        }));
    }

    /**
     * Get a specific manager
     */
    getManager(name) {
        return this.managers[name];
    }

    /**
     * Get all managers
     */
    getAllManagers() {
        return this.managers;
    }

    /**
     * Check if a manager exists
     */
    hasManager(name) {
        return name in this.managers;
    }

    /**
     * Execute action on all managers that have the method
     */
    broadcast(methodName, ...args) {
        const results = {};
        
        Object.entries(this.managers).forEach(([name, manager]) => {
            if (manager && typeof manager[methodName] === 'function') {
                try {
                    results[name] = manager[methodName](...args);
                } catch (error) {
                    console.error(`Error calling ${methodName} on ${name}:`, error);
                }
            }
        });

        return results;
    }

    /**
     * Cleanup all managers
     */
    destroy() {
        console.log('🧹 Cleaning up Core Manager...');

        // Call destroy on managers that have it
        this.broadcast('destroy');

        this.isInitialized = false;
    }
}

// Create and export singleton instance
export const coreManager = new CoreManager();

// Make available globally for debugging
window.coreManager = coreManager;

// Export for module usage
export default coreManager;