/**
 * ANIMATIONS MANAGER - CORE MODULE V10
 * 
 * Arquitectura Modular:
 * - Este archivo es el núcleo central que orquesta todas las fases
 * - Cada fase es un módulo independiente en /phases/
 * - Mejor mantenimiento, debugging y optimización
 * - Carga bajo demanda de módulos
 * 
 * Estructura:
 * /animations/
 *   animations.js (este archivo - núcleo de animaciones)
 *   /phases/
 *     phase1-voice.js
 *     phase2-data.js
 *     phase3-terrain.js
 *     phase3b-earth.js
 *     phase3c-neural.js
 *     phase4-brain.js
 *     phase5-boarding.js
 *   /utils/
 *     audio-manager.js
 *     skip-handler.js
 *     survivor-panel.js
 */

// Import phase modules
import Phase1Voice from './phases/phase1-voice.js';
import Phase2Data from './phases/phase2-data.js';
import Phase3Terrain from './phases/phase3-terrain.js';
import Phase3bEarth from './phases/phase3b-earth.js';
import Phase3cNeural from './phases/phase3c-neural.js';
import Phase4Brain from './phases/phase4-brain.js';
import Phase5Boarding from './phases/phase5-boarding.js';

// Import utility modules
import AudioManager from './utils/audio-manager.js';
import SkipHandler from './utils/skip-handler.js';
import SurvivorPanel from './utils/survivor-panel.js';

class AnimationsManager {
    
    constructor() {
        // Core state
        this.initialized = false;
        this.currentPhase = 0;
        this.introSkipped = false;
        
        // Performance detection
        this.isLowPowerMode = this.detectLowPowerDevice();
        this.shouldUseOptimizedMode = window.innerWidth <= 768 || this.isLowPowerMode;
        
        // Centralized model paths
        this.MODEL_PATHS = {
            base: '/src/model_3d/',
            brain: {
                complete: 'brain-antre.obj',
                low: 'brain_vertex_low.obj',
                parts_assembled: 'brain-parts-big.obj'
            },
            earth: {
                earthquakes_ply: 'earthquakes.ply',
                earthquakes_glb: 'earthquakes_-_2000_to_2019.glb',
                earthquakes_json: 'earthquakes.json'
            }
        };
        
        // Initialize utility modules
        this.audioManager = new AudioManager(this);
        this.skipHandler = new SkipHandler(this);
        this.survivorPanel = new SurvivorPanel(this);
        
        // Initialize phase modules
        this.phases = {
            voice: new Phase1Voice(this),
            data: new Phase2Data(this),
            terrain: new Phase3Terrain(this),
            earth: new Phase3bEarth(this),
            neural: new Phase3cNeural(this),
            brain: new Phase4Brain(this),
            boarding: new Phase5Boarding(this)
        };
        
        // DOM elements cache
        this.elements = null;
    }
    
    detectLowPowerDevice() {
        return navigator.hardwareConcurrency <= 2 || 
               navigator.connection?.effectiveType === 'slow-2g' ||
               navigator.connection?.effectiveType === '2g' ||
               navigator.deviceMemory < 4;
    }
    
    async init() {
        if (this.initialized) {
            console.log('[CORE] Already initialized');
            return;
        }
        
        console.log('[CORE] Initializing Modular Animation System V10');
        console.log('[DEVICE] Mode:', this.shouldUseOptimizedMode ? 'Optimized' : 'Full');
        
        // Cache DOM elements
        this.cacheElements();
        
        if (!this.elements.stellarIntro) {
            console.error('[CORE] stellarIntro element not found');
            return;
        }
        
        // Initialize audio system
        await this.audioManager.init();
        
        // Initialize skip handler
        this.skipHandler.init();
        
        // Initialize survivor panel
        this.survivorPanel.init();
        
        // Start intro sequence
        setTimeout(() => {
            this.startIntroSequence();
        }, 1000);
        
        this.initialized = true;
        console.log('[CORE] Initialization complete');
    }
    
    cacheElements() {
        this.elements = {
            stellarIntro: document.getElementById('stellarIntro'),
            skipIndicator: document.getElementById('skipIndicator'),
            
            // Phase 1
            phaseVoice: document.getElementById('phaseVoice'),
            subtitleText: document.getElementById('subtitleText'),
            
            // Phase 2
            phaseData: document.getElementById('phaseData'),
            dataSubtitle: document.getElementById('dataSubtitle'),
            
            // Phase 3
            phaseGlobe: document.getElementById('phaseGlobe'),
            terrainCanvas: document.getElementById('terrainCanvas'),
            
            // Phase 3b
            phaseEarth: document.getElementById('phaseEarth'),
            earthCanvas: document.getElementById('earthCanvas'),
            
            // Phase 3c (NEW)
            phaseNeuralNetwork: document.getElementById('phaseNeuralNetwork'),
            neuralCanvas: document.getElementById('neuralCanvas'),
            neuralSubtitle: document.getElementById('neuralSubtitle'),
            
            // Phase 4
            phaseBody: document.getElementById('phaseBody'),
            brainCanvas: document.getElementById('brainCanvas'),
            bodySubtitle: document.getElementById('bodySubtitle'),
            
            // Phase 5
            phaseBoarding: document.getElementById('phaseBoarding'),
            boardingWrapper: document.querySelector('.boarding-wrapper'),
            
            // Main screens
            mainScreen: document.getElementById('mainScreen'),
            homeScreen: document.getElementById('homeScreen'),
            mainNav: document.getElementById('mainNav')
        };
        
        console.log('[CORE] Elements cached');
    }
    
    async startIntroSequence() {
        console.log('[CORE] Starting intro sequence');
        
        // Start background music
        this.audioManager.playBackground();
        
        // Execute phases in sequence
        try {
            if (!this.introSkipped) await this.phases.voice.play();
            if (!this.introSkipped) await this.phases.data.play();
            if (!this.introSkipped) await this.phases.terrain.play();
            if (!this.introSkipped) await this.phases.earth.play();
            if (!this.introSkipped) await this.phases.neural.play();  // NEW
            if (!this.introSkipped) await this.phases.brain.play();
            if (!this.introSkipped) await this.phases.boarding.play();
            
            // Transition to main content
            if (!this.introSkipped) {
                this.transitionToMain();
            }
        } catch (error) {
            console.error('[CORE] Error in intro sequence:', error);
        }
    }
    
    skipIntro() {
        console.log('[CORE] Skipping intro');
        this.introSkipped = true;
        
        // Stop all phases
        Object.values(this.phases).forEach(phase => {
            if (phase.stop) phase.stop();
        });
        
        // Stop audio
        this.audioManager.stopAll();
        
        // Stop survivor panel
        this.survivorPanel.hide();
        
        // Transition to main
        this.transitionToMain();
    }
    
    transitionToMain() {
        console.log('[CORE] Transitioning to main content');
        
        // Fade out background music
        this.audioManager.fadeOutBackground(1200);
        
        // Hide intro container
        const stellarIntro = this.elements.stellarIntro;
        if (stellarIntro) {
            stellarIntro.classList.add('fade-out');
            
            setTimeout(() => {
                stellarIntro.style.display = 'none';
                this.showMainContent();
            }, 1200);
        }
    }
    
    showMainContent() {
        const mainScreen = this.elements.mainScreen;
        const homeScreen = this.elements.homeScreen;
        const mainNav = this.elements.mainNav;
        
        if (mainScreen) mainScreen.style.display = 'block';
        if (homeScreen) homeScreen.classList.add('show');
        if (mainNav) mainNav.classList.add('show');
        
        console.log('[CORE] Main content displayed');
    }
    
    destroy() {
        console.log('[CORE] Destroying animation system');
        
        // Cleanup all phases
        Object.values(this.phases).forEach(phase => {
            if (phase.destroy) phase.destroy();
        });
        
        // Cleanup utilities
        this.audioManager.destroy();
        this.skipHandler.destroy();
        this.survivorPanel.destroy();
        
        this.initialized = false;
    }
}

// Create and export singleton instance
const animationsManager = new AnimationsManager();
export { animationsManager };
export default animationsManager;

// Make available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.animationsManager = animationsManager;
}
