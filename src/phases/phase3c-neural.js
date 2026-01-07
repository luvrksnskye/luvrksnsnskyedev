/**
 * PHASE 3c: NEURAL NETWORK VISUALIZATION
 * COGNEX VIDI STYLE - SKYE DATA
 * 
 * Duración: 60 segundos
 * Subtítulos ORIGINALES mantenidos
 */

import BasePhase from './base-phase.js';
import NeuralNetworkVisualization from '../visualizations/neural-network.js';

export default class Phase3cNeural extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        // Configuración de nodos - datos de SKYE
        this.nodes = [
            { id: 'prefrontal', label: 'PREFRONTAL CORTEX', x: 0.25, y: 0.2, status: 'optimal', connections: ['temporal', 'parietal', 'limbic'] },
            { id: 'temporal', label: 'TEMPORAL LOBE', x: 0.15, y: 0.5, status: 'active', connections: ['prefrontal', 'occipital', 'limbic'] },
            { id: 'parietal', label: 'PARIETAL LOBE', x: 0.5, y: 0.25, status: 'optimal', connections: ['prefrontal', 'occipital', 'motor'] },
            { id: 'occipital', label: 'OCCIPITAL LOBE', x: 0.75, y: 0.35, status: 'active', connections: ['parietal', 'temporal'] },
            { id: 'motor', label: 'MOTOR CORTEX', x: 0.4, y: 0.15, status: 'calibrating', connections: ['parietal', 'cerebellum'] },
            { id: 'cerebellum', label: 'CEREBELLUM', x: 0.65, y: 0.6, status: 'active', connections: ['motor', 'brainstem'] },
            { id: 'limbic', label: 'LIMBIC SYSTEM', x: 0.35, y: 0.55, status: 'optimal', connections: ['prefrontal', 'temporal', 'hippocampus'] },
            { id: 'hippocampus', label: 'HIPPOCAMPUS', x: 0.45, y: 0.7, status: 'recovering', connections: ['limbic', 'temporal'] },
            { id: 'brainstem', label: 'BRAINSTEM', x: 0.55, y: 0.8, status: 'optimal', connections: ['cerebellum'] },
            { id: 'broca', label: "BROCA'S AREA", x: 0.2, y: 0.35, status: 'active', connections: ['prefrontal', 'wernicke'] },
            { id: 'wernicke', label: "WERNICKE'S AREA", x: 0.3, y: 0.65, status: 'active', connections: ['broca', 'temporal'] },
            { id: 'creative', label: 'CREATIVE CORTEX', x: 0.6, y: 0.45, status: 'exceptional', connections: ['prefrontal', 'parietal', 'temporal'] }
        ];
        
        // Estadísticas para el panel
        this.stats = [
            { label: 'TOTAL NEURONS', value: '86.2 BILLION', status: 'optimal' },
            { label: 'SYNAPTIC CONNECTIONS', value: '142.7 TRILLION', status: 'exceptional' },
            { label: 'NEURAL PLASTICITY', value: 'HIGH', status: 'optimal' },
            { label: 'PROCESSING SPEED', value: '127% BASELINE', status: 'elevated' },
            { label: 'MEMORY INTEGRATION', value: '78% RECOVERED', status: 'recovering' },
            { label: 'CONSCIOUSNESS INDEX', value: '98.7%', status: 'optimal' }
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
            
            // Inicializar visualización
            const viewport = document.getElementById('cvViewport');
            if (viewport) {
                this.visualization = new NeuralNetworkVisualization(
                    viewport,
                    this.nodes,
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
