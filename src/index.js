/**
 * ============================
 * MAIN INDEX (FIXED v2)
 * ============================
 * Entry point for the modular system
 * Orchestrates initialization sequence:
 * 1. Loader preloads all resources (including stellar intro audio)
 * 2. Explicitly load animations.js FIRST
 * 3. Core initializes all other managers
 * 4. Stellar intro starts automatically
 * 
 * FIX: Explicit animations.js loading before core initialization
 */

// ========================================
// IMPORTS
// ========================================

// Import loader first - handles 1-minute preloading screen
import { loaderManager } from './loaderManager.js';

// Import animations.js IMMEDIATELY to ensure it loads
import { animationsManager } from './animations.js';

// Core manager (lazy loaded after animations)
let coreManager = null;

// Re-export loader for convenience
export { loaderManager } from './loaderManager.js';

// Make animations manager available globally immediately
window.animationsManager = animationsManager;

console.log('[APP] Animations manager imported:', {
    exists: !!animationsManager,
    type: typeof animationsManager,
    hasInit: typeof animationsManager.init === 'function',
    hasStart: typeof animationsManager.startStellarIntro === 'function'
});

// ========================================
// LAZY LOADING
// ========================================

/**
 * Lazy load core manager after animations is ready
 * This prevents blocking the preloader with heavy module loading
 */
async function loadCoreManager() {
    const core = await import('./core.js');
    coreManager = core.coreManager;
    return coreManager;
}

// ========================================
// STELLAR INTRO STARTER
// ========================================

/**
 * Start the stellar intro with retry logic
 * Ensures animations manager is ready before starting
 */
async function startStellarIntro(retryCount = 0, maxRetries = 5) {
    const delay = retryCount === 0 ? 500 : 1000;
    
    return new Promise((resolve) => {
        setTimeout(() => {
            // animationsManager is already imported at the top
            const am = animationsManager || window.animationsManager;
            
            console.log('[APP] Stellar Intro Attempt #' + (retryCount + 1) + ':', {
                animationsExists: !!am,
                initialized: am?.initialized,
                hasStartMethod: typeof am?.startStellarIntro === 'function',
                elements: {
                    stellarIntro: !!document.getElementById('stellarIntro'),
                    terrainCanvas: !!document.getElementById('terrainCanvas'),
                    brainCanvas: !!document.getElementById('brainCanvas')
                }
            });
            
            if (am && am.initialized && typeof am.startStellarIntro === 'function') {
                console.log('[APP] Starting Enhanced Stellar Intro...');
                try {
                    am.startStellarIntro();
                    resolve(true);
                } catch (error) {
                    console.error('[APP] Error starting stellar intro:', error);
                    resolve(false);
                }
            } else if (retryCount < maxRetries) {
                console.warn('[APP] AnimationsManager not ready, retry ' + (retryCount + 1) + '/' + maxRetries + '...');
                startStellarIntro(retryCount + 1, maxRetries).then(resolve);
            } else {
                console.error('[APP] Could not auto-start Stellar Intro after ' + maxRetries + ' attempts');
                console.log('[APP] Final status:', {
                    animationsManager: !!am,
                    initialized: am?.initialized,
                    stellarIntroElement: !!document.getElementById('stellarIntro')
                });
                console.log('[APP] Start manually with: window.app.startIntro()');
                resolve(false);
            }
        }, delay);
    });
}

// ========================================
// APPLICATION INITIALIZATION
// ========================================

/**
 * Initialize the application
 * Only called after the 1-minute preloader completes
 */
async function initializeApp() {
    console.log('[APP] Initializing Skye Journey...');
    
    try {
        // ========================================
        // PHASE 1: Initialize Animations Manager
        // ========================================
        console.log('[APP] Initializing animations manager...');
        
        // Check if DOM elements exist
        const stellarIntroElement = document.getElementById('stellarIntro');
        if (!stellarIntroElement) {
            console.error('[APP] CRITICAL: #stellarIntro element not found in DOM!');
            console.log('[APP] Available IDs:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        }
        
        if (animationsManager && typeof animationsManager.init === 'function') {
            try {
                animationsManager.init();
                console.log('[APP] Animations manager initialized');
            } catch (error) {
                console.error('[APP] Error initializing animations manager:', error);
            }
        } else {
            console.error('[APP] Animations manager not available or missing init method');
        }
        
        // ========================================
        // PHASE 2: Load Core Manager
        // ========================================
        console.log('[APP] Loading core manager...');
        await loadCoreManager();
        console.log('[APP] Core manager loaded');
        
        // ========================================
        // PHASE 3: Initialize Other Managers
        // ========================================
        console.log('[APP] Initializing all managers...');
        await coreManager.init();
        console.log('[APP] Managers initialized');
        
        console.log('[APP] All systems ready');
        
        // ========================================
        // PHASE 4: Dispatch App Ready Event
        // ========================================
        window.dispatchEvent(new CustomEvent('appReady', {
            detail: {
                version: '2.0.0',
                managers: coreManager.getAllManagers()
            }
        }));
        
        // ========================================
        // PHASE 5: Auto-Start Stellar Intro
        // ========================================
        console.log('[APP] Preparing to start stellar intro...');
        await startStellarIntro();
        
    } catch (error) {
        console.error('[APP] Application initialization failed:', error);
        console.error('[APP] Stack:', error.stack);
    }
}

// ========================================
// PRELOADER INTEGRATION
// ========================================

/**
 * Wait for preloader to complete before initializing app
 * This ensures all resources are loaded before starting
 */
function waitForPreloader() {
    // Listen for preload complete event
    window.addEventListener('preloadComplete', () => {
        console.log('[APP] Preloader complete, initializing app...');
        initializeApp();
    }, { once: true });
}

// ========================================
// DOM READY HANDLING
// ========================================

// Start waiting for preloader
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPreloader);
} else {
    waitForPreloader();
}

// ========================================
// MODULE EXPORTS
// ========================================

// Export animations manager first
export { animationsManager };

// Export core manager as default
export default coreManager;

// ========================================
// GLOBAL API
// ========================================

/**
 * Convenience methods available globally via window.app
 * Provides easy access to common operations
 */
window.app = {
    // ========================================
    // CORE ACCESS
    // ========================================
    get core() { 
        return coreManager; 
    },
    
    // ========================================
    // ANIMATIONS ACCESS
    // ========================================
    get animations() {
        return animationsManager;
    },
    
    // ========================================
    // QUICK ACTIONS
    // ========================================
    playSound: (name, volume) => {
        return coreManager?.getManager('sound')?.play(name, volume);
    },
    
    navigateTo: (page) => {
        return coreManager?.getManager('navigation')?.navigateToPage(page);
    },
    
    toggleTheme: () => {
        return coreManager?.getManager('darkMode')?.toggleTheme();
    },
    
    // ========================================
    // MANAGER ACCESS
    // ========================================
    get: (managerName) => {
        if (managerName === 'animations') {
            return animationsManager;
        }
        return coreManager?.getManager(managerName);
    },
    
    getAll: () => {
        return coreManager?.getAllManagers();
    },
    
    // ========================================
    // STATUS CHECKS
    // ========================================
    isReady: () => {
        return coreManager?.isInitialized ?? false;
    },
    
    // ========================================
    // SYSTEM INFO
    // ========================================
    version: '2.0.0',
    
    // ========================================
    // CLEANUP
    // ========================================
    destroy: () => {
        return coreManager?.destroy();
    },
    
    // ========================================
    // LOADER REFERENCE
    // ========================================
    loader: loaderManager,
    
    // ========================================
    // STELLAR INTRO CONTROLS
    // ========================================
    
    /**
     * Start stellar intro manually
     */
    startIntro: () => {
        const am = animationsManager || window.animationsManager;
        
        console.log('[APP] Manual start requested. Status:', {
            animationsExists: !!am,
            initialized: am?.initialized,
            hasMethod: typeof am?.startStellarIntro === 'function'
        });
        
        if (am) {
            if (!am.initialized && typeof am.init === 'function') {
                console.log('[APP] Initializing animations manager first...');
                am.init();
            }
            
            if (typeof am.startStellarIntro === 'function') {
                am.startStellarIntro();
                console.log('[APP] Stellar Intro started manually');
            } else {
                console.error('[APP] startStellarIntro method not found');
            }
        } else {
            console.error('[APP] AnimationsManager not available');
        }
    },
    
    /**
     * Skip directly to main content
     */
    skipIntro: () => {
        const am = animationsManager || window.animationsManager;
        if (am && typeof am.skipToMain === 'function') {
            am.skipToMain();
            console.log('[APP] Stellar Intro skipped');
        } else {
            console.error('[APP] Skip method not available');
        }
    },
    
    /**
     * Debug: Check animations manager status
     */
    checkAnimations: () => {
        const am = animationsManager || window.animationsManager;
        console.log('[APP] Animations Manager Status:', {
            imported: !!animationsManager,
            window: !!window.animationsManager,
            initialized: am?.initialized,
            hasMethods: {
                init: typeof am?.init === 'function',
                startStellarIntro: typeof am?.startStellarIntro === 'function',
                skipToMain: typeof am?.skipToMain === 'function'
            },
            domElements: {
                stellarIntro: !!document.getElementById('stellarIntro'),
                terrainCanvas: !!document.getElementById('terrainCanvas'),
                brainCanvas: !!document.getElementById('brainCanvas')
            }
        });
        return am;
    },
    
    /**
     * Debug: Initialize animations manager manually
     */
    initAnimations: () => {
        const am = animationsManager || window.animationsManager;
        if (am && typeof am.init === 'function') {
            am.init();
            console.log('[APP] Animations manager initialized manually');
        } else {
            console.error('[APP] Cannot initialize - manager not available');
        }
    }
};

// ========================================
// INITIALIZATION MESSAGES
// ========================================

console.log('[APP] Skye Journey Module System v2.0.0 loaded');
console.log('[APP] Animations Manager pre-loaded:', !!animationsManager);
console.log('[APP] Waiting for preloader to complete...');
console.log('[APP] Access via: window.app');
console.log('[APP] Debug with: window.app.checkAnimations()');
console.log('[APP] Manual start: window.app.startIntro()');
