/**
 * ============================
 * CORE MODULE (FIXED v2)
 * ============================
 * Central hub that coordinates all managers
 * Handles initialization and cross-manager communication
 * Optimized for lazy loading after preloader completion
 * 
 * FIX: Uses pre-loaded animations manager from window/index.js
 */

class CoreManager {
    constructor() {
        // ========================================
        // MANAGER REGISTRY
        // ========================================
        this.managers = {};
        this.isInitialized = false;
        this.initPromises = [];
        
        // Wait for preloader to complete before initialization
        // Managers will be loaded dynamically when init() is called
    }

    // ========================================
    // INITIALIZATION METHODS
    // ========================================
    
    /**
     * Initialize all managers in the correct order
     * Called after preloader completes
     */
    async init() {
        if (this.isInitialized) return;

        console.log('[CORE] Initializing Core Manager...');

        try {
            // ========================================
            // REGISTER ANIMATIONS MANAGER (PRE-LOADED)
            // ========================================
            console.log('[CORE] Registering animations manager...');
            
            // Animations manager is already loaded by index.js
            this.registerAnimationsManager();

            // ========================================
            // LOAD OTHER MANAGERS (OPTIONAL)
            // ========================================
            await this.loadOptionalManagers();

            // ========================================
            // PHASED INITIALIZATION
            // ========================================
            // Phase 1: Critical managers (sound, animations)
            await this.initializeCritical();

            // Phase 2: UI managers (navigation, dark mode)
            await this.initializeUI();

            // Phase 3: Content managers (all other modules)
            await this.initializeContent();

            // ========================================
            // SETUP CROSS-MANAGER COMMUNICATION
            // ========================================
            this.setupCommunication();

            this.isInitialized = true;
            console.log('[CORE] Core Manager initialization complete');

            // ========================================
            // DISPATCH READY EVENT
            // ========================================
            this.dispatchReadyEvent();

        } catch (error) {
            console.error('[CORE] Initialization failed:', error);
            console.error('[CORE] Error details:', error.message);
            console.error('[CORE] Stack trace:', error.stack);
        }
    }

    // ========================================
    // ANIMATIONS MANAGER REGISTRATION
    // ========================================
    
    /**
     * Register pre-loaded animations manager
     * The animations manager is loaded by index.js before core initialization
     */
    registerAnimationsManager() {
        // Check window for pre-loaded animations manager
        if (window.animationsManager) {
            console.log('[CORE] Found pre-loaded animations manager');
            this.managers.animations = window.animationsManager;
            console.log('[CORE] Animations manager registered successfully');
        } else {
            console.error('[CORE] CRITICAL: Pre-loaded animations manager not found!');
            console.log('[CORE] This should have been loaded by index.js');
        }
    }

    // ========================================
    // LOAD OPTIONAL MANAGERS
    // ========================================
    
    async loadOptionalManagers() {
        console.log('[CORE] Loading optional managers...');
        
        const managerConfigs = [
            { name: 'sound', path: './soundManager.js', key: 'soundManager' },
            { name: 'navigation', path: './navigation.js', key: 'navigationManager' },
            { name: 'darkMode', path: './darkModeManager.js', key: 'darkModeManager' },
            { name: 'about', path: './aboutManager.js', key: 'aboutManager' },
            { name: 'tools', path: './toolsManager.js', key: 'toolsManager' },
            { name: 'languages', path: './languagesManager.js', key: 'languagesManager' },
            { name: 'music', path: './musicManager.js', key: 'musicManager' },
            { name: 'youtube', path: './musicManager.js', key: 'youtubeManager' },
            { name: 'gallery', path: './galleryManager.js', key: 'galleryManager' },
            { name: 'highlights', path: './galleryManager.js', key: 'highlightsManager' },
            { name: 'contact', path: './contactManager.js', key: 'contactManager' },
            { name: 'work', path: './workManager.js', key: 'workManager' }
        ];

        for (const config of managerConfigs) {
            try {
                const module = await import(config.path);
                const manager = module[config.key] || module.default;
                if (manager) {
                    this.managers[config.name] = manager;
                    console.log('[CORE] Loaded:', config.name);
                }
            } catch (error) {
                console.warn('[CORE] Optional manager not found:', config.name);
            }
        }
    }

    // ========================================
    // PHASE 1: CRITICAL MANAGERS
    // ========================================
    
    /**
     * Initialize critical managers first
     * Sound and animations are essential for intro
     * NOTE: Animations manager is already initialized by index.js
     */
    async initializeCritical() {
        console.log('[CORE] Phase 1: Initializing critical managers...');
        
        // Sound manager initialization
        if (this.managers.sound) {
            if (typeof this.managers.sound.init === 'function' && !this.managers.sound.initialized) {
                this.managers.sound.init();
            }
            // Preload all sound effects
            if (typeof this.managers.sound.preloadAll === 'function') {
                this.managers.sound.preloadAll();
            }
        }

        // Verify animations manager is registered
        if (this.managers.animations) {
            console.log('[CORE] Animations manager verified:', {
                type: typeof this.managers.animations,
                initialized: this.managers.animations.initialized,
                hasInit: typeof this.managers.animations.init === 'function',
                hasStartMethod: typeof this.managers.animations.startStellarIntro === 'function'
            });
            
            // NOTE: Do NOT call init() here - it's already initialized by index.js
            console.log('[CORE] Animations manager ready (pre-initialized)');
        } else {
            console.error('[CORE] CRITICAL: Animations manager not registered!');
            console.log('[CORE] Available managers:', Object.keys(this.managers));
        }
        
        console.log('[CORE] Critical managers ready');
    }

    // ========================================
    // PHASE 2: UI MANAGERS
    // ========================================
    
    /**
     * Initialize UI managers
     * Navigation and dark mode control user interface
     */
    async initializeUI() {
        console.log('[CORE] Phase 2: Initializing UI managers...');
        
        // Navigation manager
        if (this.managers.navigation && typeof this.managers.navigation.init === 'function') {
            this.managers.navigation.init();
        }
        
        // Dark mode manager
        if (this.managers.darkMode && typeof this.managers.darkMode.init === 'function') {
            this.managers.darkMode.init();
        }
        
        console.log('[CORE] UI managers ready');
    }

    // ========================================
    // PHASE 3: CONTENT MANAGERS
    // ========================================
    
    /**
     * Initialize content managers
     * All page-specific content modules
     */
    async initializeContent() {
        console.log('[CORE] Phase 3: Initializing content managers...');
        
        const contentManagers = [
            'about', 'tools', 'languages', 'music', 
            'youtube', 'gallery', 'highlights', 'contact', 'work'
        ];
        
        contentManagers.forEach(name => {
            const manager = this.managers[name];
            if (manager && typeof manager.init === 'function' && !manager.initialized) {
                try {
                    manager.init();
                } catch (error) {
                    console.warn('[CORE] Failed to initialize ' + name + ' manager:', error);
                }
            }
        });
        
        console.log('[CORE] Content managers ready');
    }

    // ========================================
    // CROSS-MANAGER COMMUNICATION SETUP
    // ========================================
    
    /**
     * Setup communication between managers
     */
    setupCommunication() {
        console.log('[CORE] Setting up cross-manager communication...');

        // Music and YouTube coordination
        this.setupMediaCoordination();

        // Navigation with animations
        this.setupNavigationAnimations();

        // Dark mode theme coordination
        this.setupThemeCoordination();
        
        console.log('[CORE] Cross-manager communication established');
    }

    // ========================================
    // MEDIA COORDINATION
    // ========================================
    
    /**
     * Coordinate music and YouTube playback
     * Ensures only one media source plays at a time
     */
    setupMediaCoordination() {
        const { music, youtube } = this.managers;

        if (music && youtube) {
            // Store original play methods
            const musicOriginalPlay = music.play.bind(music);
            const youtubeOriginalPlay = youtube.play.bind(youtube);

            // Override music.play to pause YouTube
            music.play = function() {
                if (youtube.getIsPlaying()) {
                    youtube.pause();
                }
                return musicOriginalPlay();
            };

            // Override youtube.play to pause music
            youtube.play = function() {
                if (music.getIsPlaying()) {
                    music.pause();
                }
                return youtubeOriginalPlay();
            };
        }
    }

    // ========================================
    // NAVIGATION COORDINATION
    // ========================================
    
    /**
     * Coordinate navigation with animations
     * Ensures smooth page transitions
     */
    setupNavigationAnimations() {
        const { navigation, animations } = this.managers;

        if (navigation && animations) {
            // Store original navigate method
            const originalNavigate = navigation.navigateToPage.bind(navigation);

            // Override to include animations
            navigation.navigateToPage = function(pageName) {
                // Trigger page change animations
                if (typeof animations.navigateToPage === 'function') {
                    animations.navigateToPage(pageName);
                }
                
                // Call original navigation
                return originalNavigate(pageName);
            };
        }
    }

    // ========================================
    // THEME COORDINATION
    // ========================================
    
    /**
     * Coordinate theme changes across all managers
     * Broadcasts theme updates to all interested modules
     */
    setupThemeCoordination() {
        const { darkMode } = this.managers;

        if (darkMode) {
            // Store original toggle method
            const originalToggle = darkMode.toggleTheme.bind(darkMode);

            // Override to broadcast theme changes
            darkMode.toggleTheme = function() {
                const result = originalToggle();
                
                // Notify all managers of theme change
                window.dispatchEvent(new CustomEvent('themeChanged', {
                    detail: { isDarkMode: darkMode.isDarkMode }
                }));

                return result;
            };
        }
    }

    // ========================================
    // EVENT DISPATCHING
    // ========================================
    
    /**
     * Dispatch ready event when all managers are initialized
     */
    dispatchReadyEvent() {
        window.dispatchEvent(new CustomEvent('coreReady', {
            detail: { managers: this.managers }
        }));
        
        console.log('[CORE] Ready event dispatched');
    }

    // ========================================
    // MANAGER ACCESS METHODS
    // ========================================
    
    /**
     * Get a specific manager by name
     */
    getManager(name) {
        return this.managers[name];
    }

    /**
     * Get all registered managers
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

    // ========================================
    // BROADCAST METHODS
    // ========================================
    
    /**
     * Execute a method on all managers that have it
     * Useful for global operations like pause, resume, etc.
     */
    broadcast(methodName, ...args) {
        const results = {};
        
        Object.entries(this.managers).forEach(([name, manager]) => {
            if (manager && typeof manager[methodName] === 'function') {
                try {
                    results[name] = manager[methodName](...args);
                } catch (error) {
                    console.error('[CORE] Error calling ' + methodName + ' on ' + name + ':', error);
                }
            }
        });

        return results;
    }

    // ========================================
    // CLEANUP METHODS
    // ========================================
    
    /**
     * Cleanup and destroy all managers
     */
    destroy() {
        console.log('[CORE] Cleaning up Core Manager...');

        // Call destroy on all managers that have it
        this.broadcast('destroy');

        this.isInitialized = false;
        
        console.log('[CORE] Core Manager destroyed');
    }
}

// ========================================
// MODULE EXPORTS
// ========================================

// Create and export singleton instance
export const coreManager = new CoreManager();

// Make available globally for debugging and console access
window.coreManager = coreManager;

// Export for module usage
export default coreManager;
