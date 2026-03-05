/**
 * SKIP HANDLER MODULE
 * 
 * Maneja la funcionalidad de skip:
 * - Detecta tecla espaciadora mantenida
 * - Barra de progreso visual
 * - Completa skip a 2.5 segundos
 * - Limpieza de eventos
 */

export default class SkipHandler {
    
    constructor(manager) {
        this.manager = manager;
        
        this.isHoldingSpace = false;
        this.holdProgress = 0;
        this.holdInterval = null;
        this.holdDuration = 2500; // 2.5 segundos
        
        this.keyDownHandler = null;
        this.keyUpHandler = null;
        
        this.skipIndicator = null;
        this.skipBar = null;
    }
    
    init() {
        console.log('[SKIP] Initializing skip handler');
        
        // Cache elements
        this.skipIndicator = document.getElementById('skipIndicator');
        this.skipBar = this.skipIndicator?.querySelector('.skip-bar');
        
        if (!this.skipIndicator) {
            console.warn('[SKIP] Skip indicator not found');
            return;
        }
        
        // Setup event listeners
        this.keyDownHandler = (e) => this.onKeyDown(e);
        this.keyUpHandler = (e) => this.onKeyUp(e);
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        
        // Mostrar indicador después de 3 segundos
        setTimeout(() => {
            if (this.skipIndicator && !this.manager.introSkipped) {
                this.skipIndicator.style.opacity = '1';
            }
        }, 3000);
        
        console.log('[SKIP] Skip handler initialized');
    }
    
    onKeyDown(e) {
        if (e.code === 'Space' && !this.manager.introSkipped && !this.isHoldingSpace) {
            e.preventDefault();
            this.startHold();
        }
    }
    
    onKeyUp(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            this.cancelHold();
        }
    }
    
    startHold() {
        console.log('[SKIP] Hold started');
        this.isHoldingSpace = true;
        this.holdProgress = 0;
        
        if (this.skipIndicator) {
            this.skipIndicator.classList.add('holding');
        }
        
        const interval = 50; // Update every 50ms
        const increment = (interval / this.holdDuration) * 100;
        
        this.holdInterval = setInterval(() => {
            this.holdProgress += increment;
            
            if (this.skipBar) {
                this.skipBar.style.setProperty('--progress', `${this.holdProgress}%`);
            }
            
            // Complete skip
            if (this.holdProgress >= 100) {
                this.completeSkip();
            }
        }, interval);
    }
    
    cancelHold() {
        if (!this.isHoldingSpace) return;
        
        console.log('[SKIP] Hold cancelled');
        this.isHoldingSpace = false;
        
        if (this.holdInterval) {
            clearInterval(this.holdInterval);
            this.holdInterval = null;
        }
        
        this.holdProgress = 0;
        
        if (this.skipBar) {
            this.skipBar.style.setProperty('--progress', '0%');
        }
        
        if (this.skipIndicator) {
            this.skipIndicator.classList.remove('holding');
        }
    }
    
    completeSkip() {
        console.log('[SKIP] Skip completed');
        
        this.cancelHold();
        
        if (this.skipIndicator) {
            this.skipIndicator.classList.add('pressed');
            this.skipIndicator.style.opacity = '0';
        }
        
        // Trigger skip in manager
        this.manager.skipIntro();
        
        // Remove event listeners
        this.removeListeners();
    }
    
    removeListeners() {
        if (this.keyDownHandler) {
            document.removeEventListener('keydown', this.keyDownHandler);
            this.keyDownHandler = null;
        }
        
        if (this.keyUpHandler) {
            document.removeEventListener('keyup', this.keyUpHandler);
            this.keyUpHandler = null;
        }
    }
    
    hide() {
        if (this.skipIndicator) {
            this.skipIndicator.classList.add('hidden');
            this.skipIndicator.style.opacity = '0';
        }
    }
    
    destroy() {
        this.cancelHold();
        this.removeListeners();
        this.hide();
        console.log('[SKIP] Destroyed');
    }
}
