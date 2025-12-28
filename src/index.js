/**
 * ============================
 * MAIN INDEX
 * ============================
 * Entry point for the modular system
 * Imports and initializes all managers through the core
 * Waits for preloader to complete before initialization
 */

// Import loader first - it handles the 2-minute preloading screen
import { loaderManager } from './loaderManager.js';

// Core manager import (deferred initialization)
let coreManager = null;

// Re-export all managers for convenience (lazy loaded after preload)
export { loaderManager } from './loaderManager.js';

/**
 * Lazy load all managers after preloading is complete
 */
async function loadManagers() {
    const core = await import('./core.js');
    coreManager = core.coreManager;
    return coreManager;
}

/**
 * Initialize the application
 * Only called after the 2-minute preloader completes
 */
async function initializeApp() {
    console.log('🚀 Initializing Skye Journey...');
    
    try {
        // Load and initialize core manager
        await loadManagers();
        
        // Core manager will handle all initialization
        await coreManager.init();
        
        console.log('✅ All systems ready!');
        
        // Dispatch app ready event
        window.dispatchEvent(new CustomEvent('appReady', {
            detail: {
                version: '2.0.0',
                managers: coreManager.getAllManagers()
            }
        }));
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
    }
}

/**
 * Wait for preloader to complete before initializing the app
 */
function waitForPreloader() {
    // Listen for preload complete event
    window.addEventListener('preloadComplete', () => {
        console.log('📦 Preloader complete, initializing app...');
        initializeApp();
    }, { once: true });
}

// Start waiting for preloader
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForPreloader);
} else {
    waitForPreloader();
}

// Export core manager as default
export default coreManager;

/**
 * ============================
 * GLOBAL API
 * ============================
 * Convenience methods available globally
 */

// Make app available globally (managers loaded after preload)
window.app = {
    // Core will be available after preload
    get core() { return coreManager; },
    
    // Quick access to common operations
    playSound: (name, volume) => coreManager?.getManager('sound')?.play(name, volume),
    navigateTo: (page) => coreManager?.getManager('navigation')?.navigateToPage(page),
    toggleTheme: () => coreManager?.getManager('darkMode')?.toggleTheme(),
    
    // Get specific manager
    get: (managerName) => coreManager?.getManager(managerName),
    
    // Get all managers
    getAll: () => coreManager?.getAllManagers(),
    
    // Check initialization status
    isReady: () => coreManager?.isInitialized ?? false,
    
    // Version info
    version: '2.0.0',
    
    // Destroy everything (for cleanup)
    destroy: () => coreManager?.destroy(),
    
    // Loader reference
    loader: loaderManager
};

console.log('📦 Skye Journey Module System v2.0.0 loaded');
console.log('⏳ Waiting for preloader to complete...');
console.log('💡 Access via: window.app');