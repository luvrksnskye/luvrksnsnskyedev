/**
 * PHASE 3b: EARTH CATASTROPHE VISUALIZATION (OPTIMIZADA)
 * 
 * Duración: 60 segundos
 * - Three.js Earth con terremotos
 * - Cámara más cerca (6000 vs 12000)
 * - Rotación suave (0.15 speed)
 * - Paneles laterales con datos
 * - Carga desde MODEL_PATHS centralizado
 */

import BasePhase from './base-phase.js';

export default class Phase3bEarth extends BasePhase {
    
    constructor(manager) {
        super(manager);
        
        // Three.js references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earthMesh = null;
        this.earthquakePoints = [];
        this.animationFrame = null;
        
        // State
        this.earthquakeData = [];
        this.earthquakeStats = {
            totalQuakes: 0,
            maxMagnitude: 0,
            worstRegion: '',
            deadliestYear: ''
        };
    }
    
    async play() {
        return new Promise((resolve) => {
            console.log('[PHASE 3b] Earth Catastrophe started');
            this.isActive = true;
            this.manager.currentPhase = 3.2;
            
            const phaseEarth = this.elements.phaseEarth;
            if (!phaseEarth) {
                console.error('[PHASE 3b] Element not found');
                return resolve();
            }
            
            this.audio.playTransition(1);
            phaseEarth.classList.add('active');
            
            // Show survivor panel
            this.manager.survivorPanel.show();
            
            const canvas = this.elements.earthCanvas;
            if (canvas && window.THREE) {
                this.initEarthVisualization(canvas);
            }
            
            setTimeout(() => {
                if (!this.isSkipped) {
                    this.cleanup();
                    resolve();
                }
            }, 60000);
        });
    }
    
    initEarthVisualization(canvas) {
        try {
            const rect = canvas.getBoundingClientRect();
            const width = rect.width || window.innerWidth;
            const height = rect.height || window.innerHeight;
            
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000000);
            
            // Camera - OPTIMIZADA: más cerca
            this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 100000);
            this.camera.position.set(0, 0, 6000); // Era 12000, ahora 6000
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.isOptimized,
                alpha: false,
                powerPreference: this.isOptimized ? "low-power" : "high-performance"
            });
            
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x0a0a15, 1);
            
            // Controls - OPTIMIZADA: rotación más suave
            if (THREE.OrbitControls) {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.08;
                this.controls.autoRotate = true;
                this.controls.autoRotateSpeed = 0.15; // Era 0.2, ahora 0.15 (más suave)
                this.controls.minDistance = 3000;
                this.controls.maxDistance = 15000;
                this.controls.update();
            }
            
            // Lighting
            this.setupLighting();
            
            // Create Earth
            this.createEarth();
            
            // Load earthquake data
            this.loadEarthquakeData();
            
            // Start animation
            this.animateEarth();
            
            console.log('[PHASE 3b] Earth visualization initialized');
            
        } catch (error) {
            console.error('[PHASE 3b] Earth error:', error);
        }
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5000, 3000, 5000);
        this.scene.add(directionalLight);
        
        if (!this.isOptimized) {
            const pointLight = new THREE.PointLight(0x00aaff, 0.3, 10000);
            pointLight.position.set(0, 0, -5000);
            this.scene.add(pointLight);
        }
    }
    
    createEarth() {
        const segments = this.isOptimized ? 32 : 64;
        const radius = 2000;
        
        const earthGeometry = new THREE.SphereGeometry(radius, segments, segments);
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 1,
            wireframe: false,
        });
        
        this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earthMesh);
        
        if (!this.isOptimized) {
            const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.05, 32, 32);
            const atmosphereMaterial = new THREE.MeshBasicMaterial({
                color: 0x00aaff,
                transparent: true,
                opacity: 0.1,
                side: THREE.BackSide
            });
            
            const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
            this.scene.add(atmosphereMesh);
        }
    }
    
    async loadEarthquakeData() {
        try {
            // OPTIMIZACIÓN: usar MODEL_PATHS centralizado
            const basePath = this.manager.MODEL_PATHS.base;
            const sources = [
                { type: 'ply', path: basePath + this.manager.MODEL_PATHS.earth.earthquakes_ply },
                { type: 'glb', path: basePath + this.manager.MODEL_PATHS.earth.earthquakes_glb },
                { type: 'json', path: basePath + this.manager.MODEL_PATHS.earth.earthquakes_json }
            ];
            
            for (const source of sources) {
                try {
                    await this.loadFromSource(source);
                    return;
                } catch (error) {
                    console.log(`[PHASE 3b] ${source.type} failed, trying next...`);
                    continue;
                }
            }
            
            // Fallback: simulated data
            this.createSimulatedData();
            
        } catch (error) {
            console.error('[PHASE 3b] Data loading failed:', error);
            this.createSimulatedData();
        }
    }
    
    async loadFromSource(source) {
        if (source.type === 'ply') {
            return new Promise((resolve, reject) => {
                if (!THREE.PLYLoader) {
                    reject(new Error('PLYLoader not available'));
                    return;
                }
                
                const loader = new THREE.PLYLoader();
                loader.load(
                    source.path,
                    (geometry) => {
                        this.processPLYGeometry(geometry);
                        resolve();
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        } else if (source.type === 'glb') {
            return new Promise((resolve, reject) => {
                if (!THREE.GLTFLoader) {
                    reject(new Error('GLTFLoader not available'));
                    return;
                }
                
                const loader = new THREE.GLTFLoader();
                loader.load(
                    source.path,
                    (gltf) => {
                        this.processGLBModel(gltf.scene);
                        resolve();
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        } else if (source.type === 'json') {
            const response = await fetch(source.path);
            if (!response.ok) throw new Error('HTTP error');
            
            const data = await response.json();
            this.visualizeJSONData(data.earthquakes || []);
        }
    }
    
    processPLYGeometry(geometry) {
        const material = new THREE.PointsMaterial({
            size: this.isOptimized ? 4 : 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const scale = this.isOptimized ? 50 : 100;
        geometry.scale(scale, scale, scale);
        
        const points = new THREE.Points(geometry, material);
        points.position.set(0, 0, 0);
        
        this.scene.add(points);
        this.earthquakePoints.push(points);
        
        console.log('[PHASE 3b] PLY geometry loaded and processed');
    }
    
    processGLBModel(model) {
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                const pointsMaterial = new THREE.PointsMaterial({
                    size: this.isOptimized ? 3 : 6,
                    color: 0xff0000,
                    transparent: true,
                    opacity: 0.7,
                    blending: THREE.AdditiveBlending
                });
                
                const points = new THREE.Points(child.geometry, pointsMaterial);
                points.scale.set(100, 100, 100);
                points.position.set(0, 0, 0);
                
                this.scene.add(points);
                this.earthquakePoints.push(points);
            }
        });
        
        console.log('[PHASE 3b] GLB model processed');
    }
    
    visualizeJSONData(earthquakes) {
        const positions = [];
        const colors = [];
        
        earthquakes.forEach((quake) => {
            const coords = this.latLonToXYZ(quake.lat, quake.lon, quake.depth);
            positions.push(coords.x, coords.y, coords.z);
            
            const color = this.magnitudeToColor(quake.mag);
            colors.push(color.r, color.g, color.b);
        });
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.isOptimized ? 4 : 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        this.earthquakePoints.push(points);
    }
    
    createSimulatedData() {
        const count = this.isOptimized ? 500 : 1000;
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            const lat = (Math.random() - 0.5) * 180;
            const lon = (Math.random() - 0.5) * 360;
            const depth = Math.random() * 100;
            const magnitude = 3 + Math.random() * 6;
            
            const coords = this.latLonToXYZ(lat, lon, depth);
            positions.push(coords.x, coords.y, coords.z);
            
            const color = this.magnitudeToColor(magnitude);
            colors.push(color.r, color.g, color.b);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.isOptimized ? 3 : 6,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        this.earthquakePoints.push(points);
    }
    
    latLonToXYZ(lat, lon, depth) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const radius = 2000 - depth * 3;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        
        return { x, y, z };
    }
    
    magnitudeToColor(magnitude) {
        const normalized = Math.max(0, Math.min(1, (magnitude - 3) / 6));
        
        if (normalized < 0.3) {
            return { r: 0.2, g: 0.5, b: 1.0 };
        } else if (normalized < 0.6) {
            return { r: 1.0, g: 1.0, b: 0.0 };
        } else {
            return { r: 1.0, g: 0.2, b: 0.1 };
        }
    }
    
    animateEarth() {
        if (!this.scene || !this.renderer || !this.camera || !this.isActive) {
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animateEarth());
        
        if (this.controls) {
            this.controls.update();
        }
        
        // OPTIMIZACIÓN: rotación más suave
        if (this.earthMesh) {
            this.earthMesh.rotation.y += 0.0005; // Era 0.001, ahora 0.0005
        }
        
        // Animate earthquake points
        const time = Date.now() * 0.001;
        this.earthquakePoints.forEach((points) => {
            if (points.material) {
                const pulse = Math.sin(time * 2) * 0.15 + 0.85;
                points.material.opacity = 0.7 * pulse;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    cleanup() {
        if (this.isSkipped) return;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        this.earthquakePoints.forEach(points => {
            if (points.geometry) points.geometry.dispose();
            if (points.material) points.material.dispose();
            if (this.scene) this.scene.remove(points);
        });
        
        if (this.earthMesh) {
            if (this.earthMesh.geometry) this.earthMesh.geometry.dispose();
            if (this.earthMesh.material) this.earthMesh.material.dispose();
            if (this.scene) this.scene.remove(this.earthMesh);
        }
        
        if (this.controls) {
            this.controls.dispose();
            this.controls = null;
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = null;
        }
        
        this.scene = null;
        this.camera = null;
        
        this.manager.survivorPanel.hide();
        
        const phaseEarth = this.elements.phaseEarth;
        if (phaseEarth) {
            phaseEarth.classList.remove('active');
        }
        
        this.isActive = false;
        console.log('[PHASE 3b] Completed');
    }
    
    stop() {
        super.stop();
        this.cleanup();
    }
}
