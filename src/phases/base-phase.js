/**
 * BASE PHASE CLASS
 * 
 * Clase base que todas las fases heredan
 * Define la interfaz común para todas las fases
 */

export default class BasePhase {
    
    constructor(manager) {
        this.manager = manager;
        this.isActive = false;
        this.isPaused = false;
    }
    
    // Método que debe implementar cada fase
    async play() {
        throw new Error('Phase must implement play() method');
    }
    
    // Método opcional para pausar
    pause() {
        this.isPaused = true;
    }
    
    // Método opcional para resumir
    resume() {
        this.isPaused = false;
    }
    
    // Método opcional para detener
    stop() {
        this.isActive = false;
        this.isPaused = false;
    }
    
    // Método opcional para cleanup
    destroy() {
        this.stop();
    }
    
    // Helper: verificar si está skippeado
    get isSkipped() {
        return this.manager.introSkipped;
    }
    
    // Helper: obtener elementos DOM
    get elements() {
        return this.manager.elements;
    }
    
    // Helper: obtener audio manager
    get audio() {
        return this.manager.audioManager;
    }
    
    // Helper: modo optimizado
    get isOptimized() {
        return this.manager.shouldUseOptimizedMode;
    }
}
