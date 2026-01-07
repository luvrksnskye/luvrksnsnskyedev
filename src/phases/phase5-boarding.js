/**
 * PHASE 5: BOARDING PASS
 * 
 * Duración: ~15 segundos
 * - Tarjeta de embarque estilo aeropuerto
 * - Información del pasajero
 * - Código de barras
 * - Gate y seat info
 * - Voz final de bienvenida
 */

import BasePhase from './base-phase.js';

export default class Phase5Boarding extends BasePhase {
    
    constructor(manager) {
        super(manager);
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 5] Boarding Pass started');
            this.isActive = true;
            this.manager.currentPhase = 5;
            
            const phaseBoarding = this.elements.phaseBoarding;
            if (!phaseBoarding) {
                console.error('[PHASE 5] Element not found');
                return resolve();
            }
            
            phaseBoarding.classList.add('active');
            this.audio.playVoice('voiceFinal', () => {});
            
            setTimeout(() => {
                const boardingWrapper = this.elements.boardingWrapper;
                if (boardingWrapper) {
                    boardingWrapper.classList.add('visible');
                }
            }, 500);
            
            const voiceFinal = this.audio.getAudio('voiceFinal');
            if (voiceFinal) {
                voiceFinal.onended = () => {
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 3000);
                };
            } else {
                setTimeout(() => {
                    this.cleanup();
                    resolve();
                }, 15000);
            }
        });
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        const phaseBoarding = this.elements.phaseBoarding;
        if (phaseBoarding) {
            phaseBoarding.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 5] Completed');
    }
    
    stop() {
        super.stop();
        this.cleanup();
    }
}
