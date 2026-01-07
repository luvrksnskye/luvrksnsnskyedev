/**
 * PHASE 3c: NEURAL NETWORK VISUALIZATION
 * Three.js + GSAP Sci-Fi Style
 * 
 * Duración: 60 segundos
 * Subtítulos ORIGINALES mantenidos
 */

import BasePhase from './base-phase.js';
import NeuralNetworkVisualization from '../visualizations/neural-network.js';

export default class Phase3cNeural extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        // Estadísticas para el overlay
        this.stats = [
            { label: 'TOTAL NEURONS', value: '86.2 BILLION' },
            { label: 'SYNAPTIC CONNECTIONS', value: '142.7 TRILLION' },
            { label: 'NEURAL PLASTICITY', value: 'HIGH' },
            { label: 'PROCESSING SPEED', value: '127% BASELINE' },
            { label: 'MEMORY INTEGRATION', value: '78% RECOVERED' },
            { label: 'CONSCIOUSNESS INDEX', value: '98.7%' }
        ];
        
        // SUBTITULOS ORIGINALES - SIN CAMBIOS
        this.subtitles = [
            { start: 3.0, end: 10.0, text: "Initiating neural network scan. Mapping cognitive architecture. Twelve brain regions identified." },
            { start: 10.0, end: 16.0, text: "Connection matrix established. Prefrontal cortex optimal. Executive function pathways clear." },
            { start: 16.0, end: 22.0, text: "Temporal and parietal integration active. Memory encoding stable." },
            { start: 22.0, end: 27.0, text: "Motor cortex calibrating. Cerebellum coordination returning." },
            { start: 27.0, end: 34.0, text: "Limbic system balanced. Hippocampus seventy-eight percent recovered." },
            { start: 34.0, end: 40.0, text: "Brainstem nominal. Autonomic functions independent. Language centers online." },
            { start: 40.0, end: 47.0, text: "Broca and Wernicke connected. Creative cortex exceptional. Divergent thinking highly active." },
            { start: 47.0, end: 55.0, text: "Neural plasticity high. Adaptation capability remarkable. One hundred forty-two point seven trillion synaptic connections detected." },
            { start: 55.0, end: 61.0, text: "Network complexity extraordinary. Neural scan complete. All systems operational." },
            { start: 61.0, end: 66.0, text: "Consciousness at ninety-eight point seven percent." }
        ];
        
        this.visualization = null;
        this.subtitleInterval = null;
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 3c] Neural Network started');
            this.isActive = true;
            this.manager.currentPhase = 3.5;
            
            const phaseNeural = this.elements.phaseNeuralNetwork;
            if (!phaseNeural) {
                console.error('[PHASE 3c] Element not found');
                return resolve();
            }
            
            // Activar fase
            this.audio.playTransition(1);
            phaseNeural.classList.add('active');
            
            // Populate stats overlay
            this.populateStats();
            
            // Inicializar visualización Three.js
            const viewport = document.getElementById('cvViewport');
            if (viewport) {
                this.visualization = new NeuralNetworkVisualization(
                    viewport,
                    null,
                    this.stats
                );
                this.visualization.start();
            }
            
            // Reproducir voz con subtítulos
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                this.startSubtitleSync();
                
                this.audio.playVoice('voiceNeuralNetwork', () => {
                    // Voice started
                });
                
                const voiceAudio = this.audio.getAudio('voiceNeuralNetwork');
                if (voiceAudio) {
                    voiceAudio.onended = () => {
                        setTimeout(() => {
                            this.cleanup();
                            resolve();
                        }, 1500);
                    };
                } else {
                    // Fallback: 66 segundos
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 66000);
                }
            }, 2000);
        });
    }
    
    populateStats() {
        const container = document.getElementById('cvStatsOverlay');
        if (!container) return;
        
        container.innerHTML = this.stats.map(stat => `
            <div class="cv-stat-row">
                <span class="cv-stat-label">${stat.label}</span>
                <span class="cv-stat-value">${stat.value}</span>
            </div>
        `).join('');
    }
    
    startSubtitleSync() {
        if (this.subtitleInterval) {
            clearInterval(this.subtitleInterval);
        }
        
        this.subtitleInterval = setInterval(() => {
            this.updateSubtitles();
        }, 100);
    }
    
    updateSubtitles() {
        if (this.isSkipped) {
            if (this.subtitleInterval) {
                clearInterval(this.subtitleInterval);
                this.subtitleInterval = null;
            }
            return;
        }
        
        const voiceAudio = this.audio.getAudio('voiceNeuralNetwork');
        if (!voiceAudio) return;
        
        const subtitle = document.getElementById('cvSubtitle');
        if (!subtitle) return;
        
        const currentTime = voiceAudio.currentTime;
        
        const currentSub = this.subtitles.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub && subtitle.textContent !== currentSub.text) {
            subtitle.textContent = currentSub.text;
            subtitle.classList.add('visible');
        } else if (!currentSub && currentTime >= this.subtitles[this.subtitles.length - 1].end) {
            subtitle.classList.remove('visible');
        }
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        if (this.subtitleInterval) {
            clearInterval(this.subtitleInterval);
            this.subtitleInterval = null;
        }
        
        const subtitle = document.getElementById('cvSubtitle');
        if (subtitle) {
            subtitle.classList.remove('visible');
        }
        
        if (this.visualization) {
            this.visualization.stop();
        }
        
        const phaseNeural = this.elements.phaseNeuralNetwork;
        if (phaseNeural) {
            phaseNeural.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 3c] Completed');
    }
    
    stop() {
        super.stop();
        
        if (this.subtitleInterval) {
            clearInterval(this.subtitleInterval);
            this.subtitleInterval = null;
        }
        
        this.cleanup();
    }
    
    destroy() {
        this.stop();
        
        if (this.visualization) {
            this.visualization.destroy();
            this.visualization = null;
        }
    }
}
