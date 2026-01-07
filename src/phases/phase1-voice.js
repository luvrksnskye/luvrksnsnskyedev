/**
 * PHASE 1: VOICE AUTHENTICATION
 * 
 * Duración: ~20 segundos
 * - AI voice visualizer con anillos pulsantes
 * - Subtítulos sincronizados con voz
 * - Barras de frecuencia animadas
 */

import BasePhase from './base-phase.js';

export default class Phase1Voice extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        // Subtítulos para esta fase
        this.subtitles = [
            { start: 0.0, end: 6.5, text: "Identity confirmed. Welcome aboard, Skye. All systems recognize your signature." },
            { start: 7.0, end: 10.5, text: "Creative core active, anomaly levels within acceptable range." },
            { start: 11.0, end: 14.5, text: "You are cleared for full access to StarVortex systems." },
            { start: 15.0, end: 19.0, text: "This ship will not limit you, only amplify you. Proceed when ready." }
        ];
        
        this.frequencyBars = null;
        this.frequencyInterval = null;
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 1] Voice Authentication started');
            this.isActive = true;
            this.manager.currentPhase = 1;
            
            const phaseVoice = this.elements.phaseVoice;
            if (!phaseVoice) {
                console.error('[PHASE 1] Element not found');
                return resolve();
            }
            
            // Activar fase
            phaseVoice.classList.add('active');
            
            // Play SFX
            setTimeout(() => {
                this.audio.playSFX('textRollover');
            }, 500);
            
            // Iniciar animación de barras de frecuencia
            this.startFrequencyAnimation();
            
            // Reproducir voz con subtítulos
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                this.audio.playVoice('voiceIntro', () => {
                    this.updateSubtitles();
                });
                
                // Cuando termina el audio
                const voiceAudio = this.audio.getAudio('voiceIntro');
                if (voiceAudio) {
                    voiceAudio.onended = () => {
                        setTimeout(() => {
                            this.cleanup();
                            resolve();
                        }, 1500);
                    };
                } else {
                    // Fallback si no hay audio
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 20000);
                }
            }, 1000);
        });
    }
    
    startFrequencyAnimation() {
        this.frequencyBars = this.elements.phaseVoice?.querySelectorAll('.freq-bar');
        
        if (!this.frequencyBars) return;
        
        this.frequencyInterval = setInterval(() => {
            if (this.isSkipped || !this.isActive) {
                this.stopFrequencyAnimation();
                return;
            }
            
            this.frequencyBars.forEach((bar) => {
                bar.style.height = `${8 + Math.random() * 35}px`;
            });
        }, 100);
    }
    
    stopFrequencyAnimation() {
        if (this.frequencyInterval) {
            clearInterval(this.frequencyInterval);
            this.frequencyInterval = null;
        }
    }
    
    updateSubtitles() {
        if (this.isSkipped) return;
        
        const voiceAudio = this.audio.getAudio('voiceIntro');
        if (!voiceAudio) return;
        
        const subtitleText = this.elements.subtitleText;
        if (!subtitleText) return;
        
        const currentTime = voiceAudio.currentTime;
        
        const currentSub = this.subtitles.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub && subtitleText.textContent !== currentSub.text) {
            subtitleText.textContent = currentSub.text;
            subtitleText.classList.add('visible');
        } else if (currentTime >= this.subtitles[this.subtitles.length - 1].end) {
            subtitleText.classList.remove('visible');
        }
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        this.stopFrequencyAnimation();
        
        const subtitleText = this.elements.subtitleText;
        if (subtitleText) {
            subtitleText.classList.remove('visible');
        }
        
        const phaseVoice = this.elements.phaseVoice;
        if (phaseVoice) {
            phaseVoice.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 1] Completed');
    }
    
    stop() {
        super.stop();
        this.cleanup();
    }
    
    destroy() {
        this.stop();
        this.frequencyBars = null;
    }
}
