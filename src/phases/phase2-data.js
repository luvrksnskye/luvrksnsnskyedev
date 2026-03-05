/**
 * PHASE 2: DATA VISUALIZATION
 * 
 * Duración: ~50 segundos
 * - HUD con corners animados
 * - Scan progress con anillo circular
 * - Data readouts con barras
 * - Status boxes con información
 * - Medical analysis display
 */

import BasePhase from './base-phase.js';

export default class Phase2Data extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        this.subtitles = [
            { start: 0.0, end: 4.0, text: "Records indicate prolonged cryogenic stasis." },
            { start: 4.0, end: 8.0, text: "Memory drift detected. Temporal gaps. Altered perception." },
            { start: 8.0, end: 13.0, text: "Minor desynchronization between emotional recall and factual data." },
            { start: 13.0, end: 19.0, text: "This is normal. Some things may feel unfamiliar." },
            { start: 19.0, end: 26.0, text: "Current date: 2090. Earth status: Population increased, attention decreased." },
            { start: 26.0, end: 32.0, text: "Systems louder but no smarter. Signal saturation critical." },
            { start: 32.0, end: 40.0, text: "Creativity remains rare. Medical scan complete. Body integrity stable." },
            { start: 40.0, end: 49.0, text: "Neural activity elevated. Creative cortex highly responsive. No critical damage found." }
        ];
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 2] Data Visualization started');
            this.isActive = true;
            this.manager.currentPhase = 2;
            
            const phaseData = this.elements.phaseData;
            if (!phaseData) {
                console.error('[PHASE 2] Element not found');
                return resolve();
            }
            
            this.audio.playTransition(0);
            phaseData.classList.add('active');
            this.animateDataElements();
            
            setTimeout(() => this.audio.playSFX('scanZoom'), 1000);
            
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                this.audio.playVoice('voiceDataDisplay', () => {
                    this.updateSubtitles();
                });
                
                const voiceAudio = this.audio.getAudio('voiceDataDisplay');
                if (voiceAudio) {
                    voiceAudio.onended = () => {
                        setTimeout(() => {
                            this.cleanup();
                            resolve();
                        }, 2000);
                    };
                } else {
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 50000);
                }
            }, 2000);
        });
    }
    
    animateDataElements() {
        const readouts = document.querySelectorAll('.readout-item');
        const infoBlocks = document.querySelectorAll('.info-block');
        
        readouts.forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * 600);
        });
        
        infoBlocks.forEach((block, i) => {
            setTimeout(() => block.classList.add('visible'), 1500 + (i * 400));
        });
        
        setTimeout(() => {
            const statusBox = document.getElementById('statusBox');
            if (statusBox) {
                statusBox.classList.add('visible');
                this.animateStatusLines();
            }
        }, 2500);
    }
    
    animateStatusLines() {
        const lines = ['statusLine1', 'statusLine2', 'statusLine3'];
        const texts = [
            'ANALYZING SUBJECT DATA...',
            'CROSS-REFERENCING MEMORY BANKS...',
            'RECONSTRUCTION IN PROGRESS...'
        ];
        
        lines.forEach((id, i) => {
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) {
                    el.textContent = texts[i];
                    el.classList.add('visible');
                }
            }, i * 800);
        });
    }
    
    updateSubtitles() {
        if (this.isSkipped) return;
        
        const voiceAudio = this.audio.getAudio('voiceDataDisplay');
        if (!voiceAudio) return;
        
        const dataSubtitle = this.elements.dataSubtitle;
        if (!dataSubtitle) return;
        
        const currentTime = voiceAudio.currentTime;
        
        const currentSub = this.subtitles.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub && dataSubtitle.textContent !== currentSub.text) {
            dataSubtitle.textContent = currentSub.text;
            dataSubtitle.classList.add('visible');
        }
        
        this.updateDataProgress(currentTime);
    }
    
    updateDataProgress(time) {
        const totalDuration = 49;
        const progress = Math.min((time / totalDuration) * 100, 100);
        
        const scanProgress = document.getElementById('scanProgress');
        if (scanProgress) {
            scanProgress.style.width = `${progress}%`;
        }
        
        const progressRing = document.getElementById('progressRing');
        if (progressRing) {
            const circumference = 339.292;
            const offset = circumference - (progress / 100) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        const percentNum = document.getElementById('percentNum');
        if (percentNum) {
            percentNum.textContent = Math.round(progress);
        }
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        const dataSubtitle = this.elements.dataSubtitle;
        if (dataSubtitle) {
            dataSubtitle.classList.remove('visible');
        }
        
        const phaseData = this.elements.phaseData;
        if (phaseData) {
            phaseData.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 2] Completed');
    }
    
    stop() {
        super.stop();
        this.cleanup();
    }
}
