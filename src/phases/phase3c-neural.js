/**
 * PHASE 3c: NEURAL NETWORK - BLACKOPS
 * Subtítulos ORIGINALES
 */

import BasePhase from './base-phase.js';
import NeuralNetworkVisualization from '../visualizations/neural-network.js';

export default class Phase3cNeural extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        this.subtitles = [
            { start: 3, end: 10, text: "Initiating neural network scan. Mapping cognitive architecture. Twelve brain regions identified." },
            { start: 10, end: 16, text: "Connection matrix established. Prefrontal cortex optimal. Executive function pathways clear." },
            { start: 16, end: 22, text: "Temporal and parietal integration active. Memory encoding stable." },
            { start: 22, end: 27, text: "Motor cortex calibrating. Cerebellum coordination returning." },
            { start: 27, end: 34, text: "Limbic system balanced. Hippocampus seventy-eight percent recovered." },
            { start: 34, end: 40, text: "Brainstem nominal. Autonomic functions independent. Language centers online." },
            { start: 40, end: 47, text: "Broca and Wernicke connected. Creative cortex exceptional. Divergent thinking highly active." },
            { start: 47, end: 55, text: "Neural plasticity high. Adaptation capability remarkable. One hundred forty-two point seven trillion synaptic connections detected." },
            { start: 55, end: 61, text: "Network complexity extraordinary. Neural scan complete. All systems operational." },
            { start: 61, end: 66, text: "Consciousness at ninety-eight point seven percent." }
        ];
        
        this._vis = null;
        this._subInt = null;
    }
    
    async play() {
        return new Promise(resolve => {
            this.isActive = true;
            this.manager.currentPhase = 3.5;
            
            const el = this.elements.phaseNeuralNetwork;
            if (!el) return resolve();
            
            this.audio.playTransition(1);
            el.classList.add('active');
            
            const vp = document.getElementById('cvViewport');
            if (vp) {
                this._vis = new NeuralNetworkVisualization(vp);
                this._vis.start();
            }
            
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                this._startSubs();
                this.audio.playVoice('voiceNeuralNetwork');
                
                const v = this.audio.getAudio('voiceNeuralNetwork');
                if (v) {
                    v.onended = () => setTimeout(() => { this._cleanup(); resolve(); }, 1500);
                } else {
                    setTimeout(() => { this._cleanup(); resolve(); }, 66000);
                }
            }, 2000);
        });
    }
    
    _startSubs() {
        this._subInt = setInterval(() => {
            if (this.isSkipped) { clearInterval(this._subInt); return; }
            
            const v = this.audio.getAudio('voiceNeuralNetwork');
            const s = document.getElementById('cvSubtitle');
            if (!v || !s) return;
            
            const t = v.currentTime;
            const cur = this.subtitles.find(x => t >= x.start && t < x.end);
            
            if (cur && s.textContent !== cur.text) {
                s.textContent = cur.text;
                s.classList.add('visible');
            } else if (!cur) {
                s.classList.remove('visible');
            }
        }, 100);
    }
    
    _cleanup() {
        if (this._subInt) clearInterval(this._subInt);
        
        const s = document.getElementById('cvSubtitle');
        if (s) s.classList.remove('visible');
        
        if (this._vis) this._vis.stop();
        
        const el = this.elements.phaseNeuralNetwork;
        if (el) el.classList.remove('active');
        
        this.isActive = false;
    }
    
    stop() {
        super.stop();
        if (this._subInt) clearInterval(this._subInt);
        this._cleanup();
    }
    
    destroy() {
        this.stop();
        if (this._vis) { this._vis.destroy(); this._vis = null; }
    }
}
