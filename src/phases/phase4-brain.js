/**
 * PHASE 4: BRAIN VISUALIZATION
 * 
 * Duración: ~35 segundos (voice + recovery protocol)
 * - Three.js ethereal white brain
 * - Neural particles y connections
 * - Panel técnico con información
 * - Dos voces: voiceDataUser + voiceRecoveryProtocol
 */

import BasePhase from './base-phase.js';

export default class Phase4Brain extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        // Inyectar estilos del panel técnico
        this.injectBrainInfoStyles();
        
        // Three.js references
        this.brainScene = null;
        this.brainCamera = null;
        this.brainRenderer = null;
        this.brainControls = null;
        this.brainMesh = null;
        this.brainMaterial = null;
        this.brainAnimationFrame = null;
        this.brainRegions = {};
        this.brainParticles = null;
        this.neuralConnections = null;
        
        // Brain technical info data
        this.brainTechnicalInfo = [
            { label: 'SUBJECT ID', value: 'SKYE-2090-CRYO', delay: 0 },
            { label: 'NEURAL DENSITY', value: '86.2 BILLION NEURONS', delay: 400 },
            { label: 'SYNAPTIC ACTIVITY', value: '142.7 TRILLION CONNECTIONS', delay: 800 },
            { label: 'PREFRONTAL CORTEX', value: 'EXECUTIVE FUNCTION: OPTIMAL', delay: 1200 },
            { label: 'HIPPOCAMPUS', value: 'MEMORY ENCODING: 78% RECOVERED', delay: 1600 },
            { label: 'AMYGDALA', value: 'EMOTIONAL PROCESSING: STABLE', delay: 2000 },
            { label: 'CEREBELLUM', value: 'MOTOR COORDINATION: RECALIBRATING', delay: 2400 },
            { label: 'TEMPORAL LOBE', value: 'AUDITORY PROCESSING: ACTIVE', delay: 2800 },
            { label: 'OCCIPITAL LOBE', value: 'VISUAL CORTEX: 94% FUNCTIONALITY', delay: 3200 },
            { label: "BROCA'S AREA", value: 'SPEECH PRODUCTION: ONLINE', delay: 3600 },
            { label: "WERNICKE'S AREA", value: 'LANGUAGE COMPREHENSION: ACTIVE', delay: 4000 },
            { label: 'CREATIVE CORTEX', value: 'DIVERGENT THINKING: EXCEPTIONAL', delay: 4400 },
            { label: 'DOPAMINE LEVELS', value: '127% OF BASELINE - ELEVATED', delay: 4800 },
            { label: 'SEROTONIN SYNC', value: 'MOOD REGULATION: BALANCED', delay: 5200 },
            { label: 'NEURAL PLASTICITY', value: 'ADAPTATION RATE: HIGH', delay: 5600 },
            { label: 'DREAM STATE', value: 'REM PATTERNS: RECORDED DURING STASIS', delay: 6000 },
            { label: 'CONSCIOUSNESS', value: 'AWARENESS INDEX: 98.7%', delay: 6400 },
            { label: 'INTUITION MATRIX', value: 'PATTERN RECOGNITION: ENHANCED', delay: 6800 },
            { label: 'MEMORY BANKS', value: 'LONG-TERM: FRAGMENTED | SHORT-TERM: CLEAR', delay: 7200 },
            { label: 'OVERALL STATUS', value: 'NEURAL REINITIALIZATION: SUCCESSFUL', delay: 7600 }
        ];
        
        // Brain model paths
        this.brainModels = {
            'complete': 'src/model_3d/brain-antre.obj',
            'low': 'src/model_3d/brain_vertex_low.obj'
        };
    }
    
    /**
     * Inyectar estilos del panel técnico
     * Replica injectBrainInfoStyles() del animations.js original
     */
    injectBrainInfoStyles() {
        if (document.getElementById('brainInfoStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'brainInfoStyles';
        style.textContent = `
            .brain-tech-panel {
                position: absolute;
                left: 40px;
                top: 50%;
                transform: translateY(-50%);
                width: 320px;
                max-height: 70vh;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.75);
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 20px;
                font-family: 'SV-Tech', 'Courier New', monospace;
                z-index: 10;
                backdrop-filter: blur(5px);
                opacity: 0;
                transition: opacity 0.8s ease;
            }
            .brain-tech-panel.visible {
                opacity: 1;
            }
            .brain-tech-panel::-webkit-scrollbar {
                width: 4px;
            }
            .brain-tech-panel::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }
            .brain-tech-panel::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
            }
            .brain-panel-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .brain-icon {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            }
            .brain-title {
                font-size: 0.65rem;
                letter-spacing: 0.15em;
                color: rgba(255, 255, 255, 0.7);
            }
            .brain-tech-content {
                min-height: 200px;
            }
            .brain-tech-item {
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                opacity: 0;
                transform: translateX(-15px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }
            .brain-tech-item.visible {
                opacity: 1;
                transform: translateX(0);
            }
            .brain-tech-label {
                font-size: 0.5rem;
                letter-spacing: 0.12em;
                color: rgba(255, 255, 255, 0.4);
                display: block;
                margin-bottom: 4px;
            }
            .brain-tech-value {
                font-size: 0.65rem;
                color: rgba(255, 255, 255, 0.9);
                letter-spacing: 0.03em;
            }
            .brain-tech-value.typing {
                border-right: 2px solid rgba(255, 255, 255, 0.7);
                animation: blink 0.7s step-end infinite;
            }
            .brain-tech-value.success {
                color: rgba(255, 255, 255, 0.9);
            }
            .brain-tech-value.warning {
                color: rgba(255, 255, 255, 0.7);
            }
            
            @media (max-width: 1100px) {
                .brain-tech-panel {
                    width: 260px;
                    left: 20px;
                    padding: 15px;
                }
            }
            
            @media (max-width: 800px) {
                .brain-tech-panel {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 4] Brain Visualization started');
            this.isActive = true;
            this.manager.currentPhase = 4;
            
            const phaseBody = this.elements.phaseBody;
            if (!phaseBody) {
                console.error('[PHASE 4] Element not found');
                return resolve();
            }
            
            phaseBody.classList.add('active');
            
            setTimeout(() => this.audio.playSFX('affirmation'), 1500);
            
            if (this.elements.brainCanvas && window.THREE) {
                this.initBrainVisualization();
            }
            
            this.createBrainInfoPanel();
            this.animateScanItems();
            
            setTimeout(() => this.displayBrainTechnicalInfo(), 2000);
            
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                // Primera voz: voiceDataUser (sin subtítulos)
                this.audio.playVoice('voiceDataUser', () => {
                    // Callback cuando termina voiceDataUser
                });
                
                const voiceUser = this.audio.getAudio('voiceDataUser');
                if (voiceUser) {
                    voiceUser.onended = () => {
                        this.playRecoveryPhase(resolve);
                    };
                } else {
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 35000);
                }
            }, 1500);
        });
    }
    
    playRecoveryPhase(resolve) {
        console.log('[PHASE 4] Recovery Protocol initiated');
        
        // Segunda voz: voiceRecoveryProtocol (sin subtítulos)
        this.audio.playVoice('voiceRecoveryProtocol', () => {
            // Callback vacío - solo reproducir audio
        });
        
        const voiceRecovery = this.audio.getAudio('voiceRecoveryProtocol');
        if (voiceRecovery) {
            voiceRecovery.onended = () => {
                setTimeout(() => {
                    this.cleanup();
                    resolve();
                }, 1500);
            };
        } else {
            setTimeout(() => {
                this.cleanup();
                resolve();
            }, 35000);
        }
    }
    
    /**
     * Crear panel de información técnica del cerebro
     * Replica createBrainInfoPanel() del original
     */
    createBrainInfoPanel() {
        const bodyContainer = document.querySelector('.body-container');
        if (!bodyContainer) {
            console.warn('[PHASE 4] .body-container not found');
            return;
        }
        
        let infoPanel = document.getElementById('brainTechInfo');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'brainTechInfo';
            infoPanel.className = 'brain-tech-panel';
            infoPanel.innerHTML = `
                <div class="brain-panel-header">
                    <span class="brain-icon">⚡</span>
                    <span class="brain-title">NEURAL ANALYSIS</span>
                </div>
                <div class="brain-tech-content" id="brainTechContent"></div>
            `;
            bodyContainer.appendChild(infoPanel);
            console.log('[PHASE 4] Brain tech panel created');
        }
    }
    
    /**
     * Mostrar información técnica con efecto typewriter
     * Replica displayBrainTechnicalInfo() del original
     */
    displayBrainTechnicalInfo() {
        const content = document.getElementById('brainTechContent');
        const panel = document.getElementById('brainTechInfo');
        
        if (!content) {
            console.warn('[PHASE 4] brainTechContent not found');
            return;
        }
        
        content.innerHTML = '';
        panel?.classList.add('visible');
        
        this.brainTechnicalInfo.forEach((info, i) => {
            const div = document.createElement('div');
            div.className = 'brain-tech-item';
            
            let statusClass = 'success';
            if (info.value.includes('FRAGMENTED') || info.value.includes('RECALIBRATING') ||
                info.value.includes('RECOVERED')) {
                statusClass = 'warning';
            }
            
            div.innerHTML = `
                <span class="brain-tech-label">${info.label}</span>
                <span class="brain-tech-value ${statusClass}" id="brainVal${i}"></span>
            `;
            content.appendChild(div);
            
            setTimeout(() => {
                if (this.isSkipped) return;
                div.classList.add('visible');
                this.typewriterEffect(`brainVal${i}`, info.value, 25);
            }, info.delay);
        });
    }
    
    /**
     * Efecto typewriter para texto
     */
    typewriterEffect(elementId, text, speed = 50) {
        const element = document.getElementById(elementId);
        if (!element || this.isSkipped) return;
        
        let index = 0;
        element.classList.add('typing');
        
        const type = () => {
            if (this.isSkipped || index >= text.length) {
                element.textContent = text;
                element.classList.remove('typing');
                return;
            }
            
            element.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(type, speed);
        };
        
        type();
    }
    
    initBrainVisualization() {
        const canvas = this.elements.brainCanvas;
        
        try {
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            this.brainScene = new THREE.Scene();
            this.brainScene.background = new THREE.Color(0x000000);
            
            this.brainCamera = new THREE.PerspectiveCamera(
                45,
                canvas.width / canvas.height,
                0.1,
                5000
            );
            this.brainCamera.position.set(0, 80, 250);
            
            this.brainRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.isOptimized,
                alpha: true,
                powerPreference: this.isOptimized ? "low-power" : "high-performance"
            });
            this.brainRenderer.setSize(canvas.width, canvas.height);
            this.brainRenderer.setClearColor(0x000000, 0);
            
            if (THREE.OrbitControls) {
                this.brainControls = new THREE.OrbitControls(this.brainCamera, this.brainRenderer.domElement);
                this.brainControls.enableDamping = true;
                this.brainControls.dampingFactor = 0.05;
                this.brainControls.autoRotate = true;
                this.brainControls.autoRotateSpeed = 0.15;
                this.brainControls.enableZoom = true;
                this.brainControls.minDistance = 150;
                this.brainControls.maxDistance = 400;
            }
            
            this.setupEtherealLighting();
            this.createEtherealMaterial();
            this.loadBrainModel();
            this.createEtherealEffects();
            this.animateBrain();
            
            console.log('[PHASE 4] Brain visualization initialized');
            
        } catch (error) {
            console.error('[PHASE 4] Brain error:', error);
        }
    }
    
    setupEtherealLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.brainScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(50, 100, 50);
        this.brainScene.add(directionalLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 0, -100);
        this.brainScene.add(backLight);
    }
    
    createEtherealMaterial() {
        this.brainMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3,
            shininess: 100,
            specular: 0xffffff,
            side: THREE.DoubleSide,
            wireframe: true,
            wireframeLinewidth: 0.5
        });
        
        this.brainMaterial.emissive = new THREE.Color(0x444444);
        this.brainMaterial.emissiveIntensity = 0.2;
    }
    
    loadBrainModel() {
        const modelPath = this.isOptimized ? 
            this.manager.MODEL_PATHS.base + this.manager.MODEL_PATHS.brain.low : 
            this.manager.MODEL_PATHS.base + this.manager.MODEL_PATHS.brain.complete;
        
        if (!THREE.OBJLoader) {
            console.warn('[PHASE 4] OBJLoader not available');
            return;
        }
        
        const loader = new THREE.OBJLoader();
        
        loader.load(
            modelPath,
            (object) => {
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = this.brainMaterial;
                        child.castShadow = false;
                        child.receiveShadow = false;
                    }
                });
                
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);
                
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 180 / maxDim;
                object.scale.setScalar(scale);
                
                object.position.y = -20;
                
                this.brainMesh = object;
                this.brainScene.add(object);
                
                console.log('[PHASE 4] Brain model loaded');
            },
            undefined,
            (error) => {
                console.error('[PHASE 4] Error loading brain:', error);
            }
        );
    }
    
    createEtherealEffects() {
        // Neural energy particles
        const particleCount = this.isOptimized ? 800 : 1500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            const radius = 60 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            const brightness = 0.8 + Math.random() * 0.2;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        
        this.brainParticles = new THREE.Points(particles, particleMaterial);
        this.brainScene.add(this.brainParticles);
    }
    
    animateBrain() {
        if (!this.brainRenderer || this.manager.currentPhase !== 4 || this.isSkipped) {
            if (this.brainAnimationFrame) {
                cancelAnimationFrame(this.brainAnimationFrame);
                this.brainAnimationFrame = null;
            }
            return;
        }
        
        this.brainAnimationFrame = requestAnimationFrame(() => this.animateBrain());
        
        this.brainControls?.update();
        
        const time = Date.now() * 0.001;
        
        if (this.brainParticles) {
            const positions = this.brainParticles.geometry.attributes.position.array;
            const particleCount = positions.length / 3;
            
            for (let i = 0; i < particleCount; i++) {
                const index = i * 3;
                const speed = 0.02 + (i % 10) * 0.005;
                positions[index + 1] += Math.sin(time * speed + i) * 0.02;
            }
            
            this.brainParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        const globalPulse = Math.sin(time * 0.3) * 0.1 + 0.9;
        if (this.brainMaterial) {
            this.brainMaterial.opacity = 0.3 * globalPulse;
        }
        
        if (this.brainScene && this.brainCamera) {
            this.brainRenderer.render(this.brainScene, this.brainCamera);
        }
    }
    
    animateScanItems() {
        const scanItems = document.querySelectorAll('.scan-item');
        scanItems.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 1000 + (i * 800));
        });
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        if (this.brainAnimationFrame) {
            cancelAnimationFrame(this.brainAnimationFrame);
            this.brainAnimationFrame = null;
        }
        
        if (this.brainMesh && this.brainScene) {
            this.brainScene.remove(this.brainMesh);
        }
        
        if (this.brainParticles && this.brainScene) {
            this.brainScene.remove(this.brainParticles);
            if (this.brainParticles.geometry) {
                this.brainParticles.geometry.dispose();
            }
            if (this.brainParticles.material) {
                this.brainParticles.material.dispose();
            }
        }
        
        if (this.brainMaterial) {
            this.brainMaterial.dispose();
        }
        
        if (this.brainRenderer) {
            this.brainRenderer.dispose();
        }
        
        if (this.brainControls) {
            this.brainControls.dispose();
        }
        
        const bodySubtitle = this.elements.bodySubtitle;
        if (bodySubtitle) {
            bodySubtitle.classList.remove('visible');
        }
        
        const phaseBody = this.elements.phaseBody;
        if (phaseBody) {
            phaseBody.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 4] Completed');
    }
    
    stop() {
        super.stop();
        this.cleanup();
    }
}
