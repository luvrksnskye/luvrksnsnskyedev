/**
 * PHASE 3: TERRAIN VISUALIZATION
 * 
 * Duración: ~15 segundos
 * - Three.js terrain con partículas
 * - Múltiples ubicaciones geográficas
 * - Transiciones suaves entre terrenos
 * - Paneles de información geográfica
 */

import BasePhase from './base-phase.js';
import TerrainLocations from '../utils/terrain-locations.js';

export default class Phase3Terrain extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        this.terrainLocations = new TerrainLocations(this);
        
        this.threeScene = null;
        this.threeCamera = null;
        this.threeRenderer = null;
        this.threeControls = null;
        this.mountainParticles = null;
        this.mountainGeometry = null;
        this.terrainAnimationFrame = null;
        this.pointsPlot = [];
        this.particleDistance = 25;
        
        this.currentTerrainKey = 'franzjosefglacier';
        this.baseURL = 'https://s3.ca-central-1.amazonaws.com/kevinnewcombe/three-terrain/';
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 3] Terrain Visualization started');
            this.isActive = true;
            this.manager.currentPhase = 3;
            
            const phaseGlobe = this.elements.phaseGlobe;
            if (!phaseGlobe) {
                console.error('[PHASE 3] Element not found');
                return resolve();
            }
            
            this.audio.playTransition(1);
            phaseGlobe.classList.add('active');
            
            setTimeout(() => this.audio.playSFX('textAnimation'), 2000);
            
            if (this.elements.terrainCanvas && window.THREE) {
                this.initTerrainSystem();
                this.terrainLocations.init();
            }
            
            this.animateGlobeData();
            
            setTimeout(() => {
                if (this.isSkipped) return resolve();
                
                this.audio.playVoice('voiceDataEarth', () => {});
                
                const voiceAudio = this.audio.getAudio('voiceDataEarth');
                if (voiceAudio) {
                    voiceAudio.onended = () => {
                        this.cleanup();
                        resolve();
                    };
                } else {
                    setTimeout(() => {
                        this.cleanup();
                        resolve();
                    }, 15000);
                }
            }, 3000);
        });
    }
    
    initTerrainSystem() {
        const canvas = this.elements.terrainCanvas;
        
        try {
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            this.threeScene = new THREE.Scene();
            this.threeScene.fog = new THREE.Fog(0x111111, 15000, 20000);
            
            this.threeCamera = new THREE.PerspectiveCamera(
                this.isOptimized ? 8 : 10,
                canvas.width / canvas.height,
                0.1,
                this.isOptimized ? 100000 : 200000
            );
            this.threeCamera.position.set(0, 8000, -15000);
            
            this.threeRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.isOptimized,
                alpha: true,
                powerPreference: this.isOptimized ? "low-power" : "high-performance"
            });
            this.threeRenderer.setSize(canvas.width, canvas.height);
            this.threeRenderer.setClearColor(0x000000, 0);
            
            if (THREE.OrbitControls) {
                this.threeControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
                this.threeControls.autoRotate = true;
                this.threeControls.autoRotateSpeed = 0.08;
                this.threeControls.enableDamping = true;
                this.threeControls.dampingFactor = 0.05;
                this.threeControls.minDistance = 5000;
                this.threeControls.maxDistance = 30000;
            }
            
            this.createTerrain();
            this.animateTerrain();
            this.loadTerrain(this.terrainLocations.currentKey);
            
            console.log('[PHASE 3] Terrain system initialized');
            
        } catch (error) {
            console.error('[PHASE 3] Terrain error:', error);
        }
    }
    
    createTerrain() {
        const totalX = this.isOptimized ? 100 : 120;
        const totalZ = this.isOptimized ? 100 : 120;
        
        const particleCount = totalX * totalZ;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        this.pointsPlot = [];
        let index = 0;
        
        for (let x = 0; x < totalX; x++) {
            const xplot = x - Math.round((totalX - 1) / 2);
            const zArray = [];
            
            for (let z = 0; z < totalZ; z++) {
                const zplot = z - Math.round((totalZ - 1) / 2);
                
                positions[index * 3] = x * this.particleDistance - this.particleDistance * (totalX - 1) / 2;
                positions[index * 3 + 1] = 0;
                positions[index * 3 + 2] = z * this.particleDistance - this.particleDistance * (totalZ - 1) / 2;
                
                colors[index * 3] = 1.0;
                colors[index * 3 + 1] = 1.0;
                colors[index * 3 + 2] = 1.0;
                
                zArray[zplot] = {
                    x: xplot,
                    z: zplot,
                    index: index,
                    currentY: 0,
                    targetY: 0
                };
                index++;
            }
            this.pointsPlot[xplot] = zArray;
        }
        
        this.mountainGeometry = new THREE.BufferGeometry();
        this.mountainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.mountainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.isOptimized ? 1.2 : 1.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        this.mountainParticles = new THREE.Points(this.mountainGeometry, material);
        this.mountainParticles.position.y = -500;
        this.threeScene.add(this.mountainParticles);
    }
    
    async loadTerrain(terrainKey) {
        // Prevenir cambios durante transición activa
        if (this.terrainTransition?.inProgress) {
            console.log('[PHASE 3] Transition in progress, ignoring request');
            return;
        }
        
        console.log(`[PHASE 3] Loading terrain: ${terrainKey}`);
        
        // Marcar transición como activa
        if (!this.terrainTransition) {
            this.terrainTransition = { inProgress: false };
        }
        this.terrainTransition.inProgress = true;
        
        // Animar cámara con GSAP si está disponible
        this.animateCameraTransition();
        
        try {
            const response = await fetch(`${this.terrainLocations.baseURL}_terrain/${terrainKey}.json?v=2`);
            if (!response.ok) {
                this.terrainTransition.inProgress = false;
                return;
            }
            
            const data = await response.json();
            this.processTerrainDataWithTransition(data);
        } catch (error) {
            console.error('[PHASE 3] Error loading terrain:', error);
            this.terrainTransition.inProgress = false;
        }
    }
    
    /**
     * Animar transición de cámara con GSAP
     * Replica animateCameraTransition() del original
     */
    animateCameraTransition() {
        if (!this.threeCamera) return;
        
        const tweenEngine = typeof gsap !== 'undefined' ? gsap : (typeof TweenMax !== 'undefined' ? TweenMax : null);
        
        // Calcular nueva posición dinámica
        const variation = (Math.random() - 0.5) * 2000;
        const targetPos = {
            x: variation,
            y: 8000 + (Math.random() - 0.5) * 1500,
            z: -15000 + (Math.random() - 0.5) * 1500
        };
        
        if (tweenEngine) {
            // Transición con GSAP
            tweenEngine.to(this.threeCamera.position, {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                duration: 1.8,
                ease: "power2.inOut"
            });
            console.log('[PHASE 3] GSAP camera transition started');
        } else {
            // Fallback sin GSAP - aplicar directamente
            this.threeCamera.position.set(targetPos.x, targetPos.y, targetPos.z);
            console.log('[PHASE 3] Fallback camera transition (no GSAP)');
        }
    }
    
    /**
     * Procesar datos de terreno con transición GSAP
     * Replica processTerrainDataWithTransition() del original
     */
    processTerrainDataWithTransition(data) {
        if (!this.mountainParticles || !data.coords) return;
        
        // Detectar GSAP
        const tweenEngine = typeof gsap !== 'undefined' ? gsap : (typeof TweenMax !== 'undefined' ? TweenMax : null);
        
        if (!tweenEngine) {
            console.warn('[PHASE 3] GSAP not loaded, using instant transition');
            this.processTerrainData(data);
            this.terrainTransition.inProgress = false;
            return;
        }
        
        console.log('[PHASE 3] Starting GSAP terrain morphing');
        
        // Animar cada vértice con GSAP
        data.coords.forEach(coord => {
            const [x, y, z] = coord;
            
            if (this.pointsPlot[x]?.[z]) {
                const vertex = this.pointsPlot[x][z];
                const targetY = (y - (data.lowest_point || 0)) * this.particleDistance * 0.8;
                
                const geometry = this.mountainGeometry;
                const positions = geometry.getAttribute('position').array;
                const vertexIndex = vertex.index;
                
                // GSAP tween para cada vértice
                tweenEngine.to(vertex, {
                    currentY: targetY,
                    duration: 1.5,
                    ease: "power3.out",
                    onUpdate: () => {
                        positions[vertexIndex * 3 + 1] = vertex.currentY;
                        geometry.getAttribute('position').needsUpdate = true;
                    }
                });
            }
        });
        
        // Marcar como completo después de la animación
        setTimeout(() => {
            this.terrainTransition.inProgress = false;
            console.log('[PHASE 3] GSAP terrain transition complete');
        }, 1600);
    }
    
    processTerrainData(data) {
        if (!this.mountainParticles || !data.coords) return;
        
        data.coords.forEach(coord => {
            const [x, y, z] = coord;
            
            if (this.pointsPlot[x]?.[z]) {
                const vertex = this.pointsPlot[x][z];
                vertex.targetY = (y - (data.lowest_point || 0)) * this.particleDistance * 0.8;
                vertex.currentY = vertex.targetY;
                
                const positions = this.mountainGeometry.getAttribute('position').array;
                positions[vertex.index * 3 + 1] = vertex.currentY;
            }
        });
        
        if (this.mountainGeometry) {
            this.mountainGeometry.getAttribute('position').needsUpdate = true;
        }
    }
    
    animateTerrain() {
        if (!this.threeRenderer || this.manager.currentPhase !== 3 || this.isSkipped) {
            if (this.terrainAnimationFrame) {
                cancelAnimationFrame(this.terrainAnimationFrame);
                this.terrainAnimationFrame = null;
            }
            return;
        }
        
        this.terrainAnimationFrame = requestAnimationFrame(() => this.animateTerrain());
        
        this.threeControls?.update();
        
        if (this.mountainParticles) {
            this.mountainParticles.rotation.y += 0.0002;
        }
        
        if (this.threeScene && this.threeCamera) {
            this.threeRenderer.render(this.threeScene, this.threeCamera);
        }
    }
    
    animateGlobeData() {
        // Placeholder for data ticker animation
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        if (this.terrainAnimationFrame) {
            cancelAnimationFrame(this.terrainAnimationFrame);
            this.terrainAnimationFrame = null;
        }
        
        if (this.mountainParticles) {
            if (this.mountainGeometry) {
                this.mountainGeometry.dispose();
                this.mountainGeometry = null;
            }
            if (this.mountainParticles.material) {
                this.mountainParticles.material.dispose();
            }
            if (this.threeScene) {
                this.threeScene.remove(this.mountainParticles);
            }
            this.mountainParticles = null;
        }
        
        if (this.threeRenderer) {
            this.threeRenderer.dispose();
            this.threeRenderer = null;
        }
        
        if (this.threeControls) {
            this.threeControls.dispose();
            this.threeControls = null;
        }
        
        this.threeScene = null;
        this.threeCamera = null;
        
        this.terrainLocations.destroy();
        
        const phaseGlobe = this.elements.phaseGlobe;
        if (phaseGlobe) {
            phaseGlobe.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 3] Completed');
    }
    
    stop() {
        super.stop();
        this.cleanup();
    }
}
