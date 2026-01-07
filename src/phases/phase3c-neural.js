
import BasePhase from './base-phase.js';
import NeuralNetworkVisualization from '../visualizations/neural-network.js';

export default class Phase3cNeural extends BasePhase {
    
    constructor(manager) {
        super(manager);
        

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
            console.log('[PHASE 3c] Neural Network BLACKOPS');
            this.isActive = true;
            this.manager.currentPhase = 3.5;
            
            const phase = this.elements.phaseNeuralNetwork;
            if (!phase) {
                console.error('[PHASE 3c] Element not found');
                return resolve();
            }
            
            this.audio.playTransition(1);
            phase.classList.add('active');
            
            // Init visualization
            const viewport = document.getElementById('cvViewport');
            if (viewport) {
                this.visualization = new NeuralNetworkVisualization(viewport);
                this.visualization.start();
            }
            
            // Play voice
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                this.startSubtitleSync();
                this.audio.playVoice('voiceNeuralNetwork');
                
                const voice = this.audio.getAudio('voiceNeuralNetwork');
                if (voice) {
                    voice.onended = () => {
                        setTimeout(() => {
                            this.cleanup();
                            resolve();
                        }, 1500);
                    };
                } else {
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 66000);
                }
            }, 2000);
        });
    }
    
    startSubtitleSync() {
        this.subtitleInterval = setInterval(() => {
            if (this.isSkipped) {
                clearInterval(this.subtitleInterval);
                return;
            }
            
            const voice = this.audio.getAudio('voiceNeuralNetwork');
            const subtitle = document.getElementById('cvSubtitle');
            if (!voice || !subtitle) return;
            
            const time = voice.currentTime;
            const current = this.subtitles.find(s => time >= s.start && time < s.end);
            
            if (current && subtitle.textContent !== current.text) {
                subtitle.textContent = current.text;
                subtitle.classList.add('visible');
            } else if (!current) {
                subtitle.classList.remove('visible');
            }
        }, 100);
    }
    
    cleanup() {
        if (this.subtitleInterval) clearInterval(this.subtitleInterval);
        
        const subtitle = document.getElementById('cvSubtitle');
        if (subtitle) subtitle.classList.remove('visible');
        
        if (this.visualization) this.visualization.stop();
        
        const phase = this.elements.phaseNeuralNetwork;
        if (phase) phase.classList.remove('active');
        
        this.isActive = false;
        console.log('[PHASE 3c] Complete');
    }
    
    stop() {
        super.stop();
        if (this.subtitleInterval) clearInterval(this.subtitleInterval);
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
