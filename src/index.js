/**
 * ============================
 * MAIN INDEX
 * ============================
 * Entry point for the modular system
 * Imports and initializes all managers through the core
 */

import { coreManager } from './core.js';

// Re-export all managers for convenience
export { soundManager } from './soundManager.js';
export { animationsManager } from './animations.js';
export { navigationManager } from './navigation.js';
export { darkModeManager } from './darkModeManager.js';
export { aboutManager } from './aboutManager.js';
export { toolsManager } from './toolsManager.js';
export { languagesManager } from './languagesManager.js';
export { musicManager, youtubeManager } from './musicManager.js';
export { galleryManager, highlightsManager } from './galleryManager.js';
export { contactManager } from './contactManager.js'; 
export { coreManager } from './core.js';

/**
 * Initialize the application
 */

async function initializeApp() {
    console.log('🚀 Initializing Skye Journey...');
    
    try {
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

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export core manager as default
export default coreManager;

/**
 * ============================
 * GLOBAL API
 * ============================
 * Convenience methods available globally
 */

// Make core available globally
window.app = {
    core: coreManager,
    
    // Quick access to common operations
    playSound: (name, volume) => coreManager.getManager('sound')?.play(name, volume),
    navigateTo: (page) => coreManager.getManager('navigation')?.navigateToPage(page),
    toggleTheme: () => coreManager.getManager('darkMode')?.toggleTheme(),
    
    // Get specific manager
    get: (managerName) => coreManager.getManager(managerName),
    
    // Get all managers
    getAll: () => coreManager.getAllManagers(),
    
    // Check initialization status
    isReady: () => coreManager.isInitialized,
    
    // Version info
    version: '2.0.0',
    
    // Destroy everything (for cleanup)
    destroy: () => coreManager.destroy()
};

console.log('📦 Skye Journey Module System v2.0.0 loaded');
console.log('💡 Access via: window.app');