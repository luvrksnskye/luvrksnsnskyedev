/**
 * ============================
 * ANIMATIONS MANAGER MODULE V6 - ENHANCED
 * ============================
 * Handles all page animations and transitions
 * Enhanced Stellar Intro with multi-terrain visualization and single brain model
 * Optimized performance and memory management
 * - Larger brain visualization
 * - Slower terrain transitions (50 seconds total)
 * - Geographic info with typewriter effect
 * - Smoother animations
 * - Sequential sound effects
 * - Extended brain technical info with type effect
 * Exports as ES6 module
 */

class AnimationsManager {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.currentPage = 'home';
        this.rafCallbacks = new Set();
        this.initialized = false;
        this.pageAnimationStates = new Map();
        
        // Current intro phase
        this.currentPhase = 0;
        
        // Performance optimization flags
        this.isLowPowerMode = this.detectLowPowerDevice();
        this.shouldUseOptimizedMode = window.innerWidth <= 768 || this.isLowPowerMode;
        
        // Stellar Intro Audio
        this.stellarAudio = {
            bgMusic: null,
            bgMusicLoop: null,
            voiceIntro: null,
            voiceDataDisplay: null,
            voiceDataEarth: null,
            voiceDataUser: null,
            voiceFinal: null,
            transitions: [],
            // NEW: UI Sound Effects (sequential, not repeated)
            sfx: {
                textRollover: null,
                scanZoom: null,
                textAnimation: null,
                affirmation: null
            }
        };
        
        // SFX playback tracking
        this.sfxPlayed = {
            textRollover: false,
            scanZoom: false,
            textAnimation: false,
            affirmation: false
        };
        
        // Volume levels
        this.volumes = {
            bgMusic: 0.25,
            bgMusicLoop: 0.20,
            voiceIntro: 0.75,
            voiceDataDisplay: 0.75,
            voiceDataUser: 0.75,
            voiceFinal: 0.70,
            transition: 0.35,
            sfx: 0.15 // Soft SFX volume
        };
        
        // Subtitles data (condensed for better performance)
        this.subtitlesPhase1 = [
            { start: 0.0, end: 6.5, text: "Identity confirmed. Welcome aboard, Skye. All systems recognize your signature." },
            { start: 7.0, end: 10.5, text: "Creative core active, anomaly levels within acceptable range." },
            { start: 11.0, end: 14.5, text: "You are cleared for full access to StarVortex systems." },
            { start: 15.0, end: 19.0, text: "This ship will not limit you, only amplify you. Proceed when ready." }
        ];
        
        this.subtitlesDataDisplay = [
            { start: 0.0, end: 4.0, text: "Records indicate prolonged cryogenic stasis." },
            { start: 4.0, end: 8.0, text: "Memory drift detected. Temporal gaps. Altered perception." },
            { start: 8.0, end: 13.0, text: "Minor desynchronization between emotional recall and factual data." },
            { start: 13.0, end: 19.0, text: "This is normal. Some things may feel unfamiliar." },
            { start: 19.0, end: 26.0, text: "Current date: 2090. Earth status: Population increased, attention decreased." },
            { start: 26.0, end: 32.0, text: "Systems louder but no smarter. Signal saturation critical." },
            { start: 32.0, end: 40.0, text: "Creativity remains rare. Medical scan complete. Body integrity stable." },
            { start: 40.0, end: 49.0, text: "Neural activity elevated. Creative cortex highly responsive. No critical damage found." }
        ];
        
        this.subtitlesDataUser = [
            { start: 0.0, end: 7.0, text: "It's been a long time, hasn't it? Your body has been offline for a long time, Skye." },
            { start: 7.0, end: 18.0, text: "Muscles idle, senses dormant, systems suspended in silence. Waking up after stasis is never clean." },
            { start: 18.0, end: 25.0, text: "Your reflexes may feel delayed, your thoughts sharper than your movements. That imbalance will pass." },
            { start: 25.0, end: 30.0, text: "Your mind, however, never fully shut down. Creative activity persisted beneath the surface." }
        ];
        
        // Skip functionality
        this.introSkipped = false;
        this.skipHandler = null;
        this.skipKeyUpHandler = null;
        this.skipHoldProgress = 0;
        this.skipHoldInterval = null;
        this.isHoldingSpace = false;
        
        // Three.js Terrain references
        this.threeScene = null;
        this.threeCamera = null;
        this.threeRenderer = null;
        this.threeControls = null;
        this.terrainParticles = null;
        this.mountainGeometry = null;
        this.mountainParticles = null;
        this.terrainAnimationFrame = null;
        this.pointsPlot = [];
        this.particleDistance = 25;
        
        // Multi-terrain system - 2 LOCATIONS, 80 SECONDS EACH
        this.terrainLocations = [
            { 
                name: 'everest-valley', 
                duration: 80000, 
                label: 'EVEREST VALLEY',
                geoInfo: {
                    coords: '27.9659°N 86.7797°E',
                    elevation: '5,364m',
                    region: 'KHUMBU, NEPAL',
                    climate: 'HIGH ALTITUDE VALLEY',
                    discovery: 'MAPPED 1921',
                    facts: [
                        'Gateway to Everest',
                        'Sherpa homeland',
                        'Namche Bazaar hub',
                        'Tourism since 1950s'
                    ]
                }
            },
            { 
                name: 'coldeliseran', 
                duration: 80000, 
                label: 'COL DE L\'ISERAN',
                geoInfo: {
                    coords: '45.4167°N 6.9333°E',
                    elevation: '2,770m',
                    region: 'FRENCH ALPS',
                    climate: 'ALPINE MEDITERRANEAN',
                    discovery: 'ROAD BUILT 1937',
                    facts: [
                        'Highest paved pass in Alps',
                        'Tour de France famous',
                        'Part of Route des Grandes Alpes',
                        'Open June-October'
                    ]
                }
            }
        ];
        this.currentTerrainIndex = 0;
        this.terrainTransitionInProgress = false;
        
        // Geography data
        this.baseURL = 'https://s3.ca-central-1.amazonaws.com/kevinnewcombe/three-terrain/';
        
        // Brain 3D references (optimized single model approach) - LARGER SIZE
        this.brainScene = null;
        this.brainCamera = null;
        this.brainRenderer = null;
        this.brainControls = null;
        this.brainMesh = null;
        this.brainMaterial = null;
        this.brainAnimationFrame = null;
        this.brainHighlightRegions = [];
        this.brainScale = 1.6; // INCREASED from 1.0 to 1.6 for larger brain
        
        // Single optimized brain model
        this.brainModelPath = '/src/model-3d/brain_vertex_low.OBJ';
        
        // Extended Brain Technical Info - NEW
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
            { label: 'BROCA\'S AREA', value: 'SPEECH PRODUCTION: ONLINE', delay: 3600 },
            { label: 'WERNICKE\'S AREA', value: 'LANGUAGE COMPREHENSION: ACTIVE', delay: 4000 },
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
        
        // Definir los métodos como funciones flecha para evitar problemas de binding
        this.updateSubtitlesPhase1 = () => {
            if (this.introSkipped || !this.stellarAudio.voiceIntro) return;
            
            const currentTime = this.stellarAudio.voiceIntro.currentTime;
            const subtitleText = this.elements.subtitleText;
            if (!subtitleText) return;
            
            const currentSub = this.subtitlesPhase1.find(sub => 
                currentTime >= sub.start && currentTime < sub.end
            );
            
            if (currentSub && subtitleText.textContent !== currentSub.text) {
                subtitleText.textContent = currentSub.text;
                subtitleText.classList.add('visible');
            } else if (currentTime >= this.subtitlesPhase1[this.subtitlesPhase1.length - 1].end) {
                subtitleText.classList.remove('visible');
            }
            
            this.updateFrequencyBars();
        };
        
        this.updateSubtitlesPhase2 = () => {
            if (this.introSkipped || !this.stellarAudio.voiceDataDisplay) return;
            
            const currentTime = this.stellarAudio.voiceDataDisplay.currentTime;
            const dataSubtitle = this.elements.dataSubtitle;
            if (!dataSubtitle) return;
            
            const currentSub = this.subtitlesDataDisplay.find(sub => 
                currentTime >= sub.start && currentTime < sub.end
            );
            
            if (currentSub && dataSubtitle.textContent !== currentSub.text) {
                dataSubtitle.textContent = currentSub.text;
                dataSubtitle.classList.add('visible');
            }
            
            this.updateDataProgress(currentTime);
        };
        
        this.updateSubtitlesPhase4 = () => {
            if (this.introSkipped || !this.stellarAudio.voiceDataUser) return;
            
            const currentTime = this.stellarAudio.voiceDataUser.currentTime;
            const bodySubtitle = this.elements.bodySubtitle;
            if (!bodySubtitle) return;
            
            const currentSub = this.subtitlesDataUser.find(sub => 
                currentTime >= sub.start && currentTime < sub.end
            );
            
            if (currentSub && bodySubtitle.textContent !== currentSub.text) {
                bodySubtitle.textContent = currentSub.text;
                bodySubtitle.classList.add('visible');
            }
        };
        
        this.handleSkipKeyDown = (e) => {
            if (e.code === 'Space' && !this.introSkipped && !this.isHoldingSpace) {
                e.preventDefault();
                const skipIndicator = this.elements.skipIndicator;
                const skipBar = skipIndicator?.querySelector('.skip-bar');
                this.startSkipHold(skipBar, skipIndicator);
            }
        };
        
        this.handleSkipKeyUp = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                const skipIndicator = this.elements.skipIndicator;
                const skipBar = skipIndicator?.querySelector('.skip-bar');
                this.cancelSkipHold(skipBar, skipIndicator);
            }
        };
        
        this.loadNextTerrain = async () => {
            if (this.terrainTransitionInProgress) return;
            
            const location = this.terrainLocations[this.currentTerrainIndex];
            console.log(`🏔️ Loading terrain: ${location.label}`);
            
            // Update UI
            if (this.elements.terrainLocation) {
                this.elements.terrainLocation.textContent = location.label;
            }
            
            this.terrainTransitionInProgress = true;
            
            // Display geographic info with typewriter effect
            this.displayGeoInfo(location.geoInfo);
            
            try {
                const response = await fetch(`${this.baseURL}_terrain/${location.name}.json?v=2`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.processTerrainData(data);
                
            } catch (error) {
                console.error(`Error loading terrain ${location.name}:`, error);
            } finally {
                this.terrainTransitionInProgress = false;
            }
        };
        
        this.initBrainVisualization = () => {
            const canvas = this.elements.brainCanvas;
            
            try {
                canvas.width = canvas.offsetWidth || window.innerWidth;
                canvas.height = canvas.offsetHeight || window.innerHeight;
                
                // Optimized scene setup
                this.brainScene = new THREE.Scene();
                this.brainScene.background = new THREE.Color(0x000000);
                
                // Camera positioned further back to accommodate larger brain
                this.brainCamera = new THREE.PerspectiveCamera(
                    45,
                    canvas.width / canvas.height,
                    0.1,
                    5000
                );
                this.brainCamera.position.set(0, 180, 500); // Moved back for larger brain
                
                this.brainRenderer = new THREE.WebGLRenderer({
                    canvas: canvas,
                    antialias: !this.shouldUseOptimizedMode,
                    alpha: true,
                    powerPreference: this.shouldUseOptimizedMode ? "low-power" : "high-performance"
                });
                this.brainRenderer.setSize(canvas.width, canvas.height);
                this.brainRenderer.setClearColor(0x000000, 0);
                
                // Controls with smoother damping
                if (THREE.OrbitControls) {
                    this.brainControls = new THREE.OrbitControls(this.brainCamera, this.brainRenderer.domElement);
                    this.brainControls.enableDamping = true;
                    this.brainControls.dampingFactor = 0.03; // Smoother damping
                    this.brainControls.autoRotate = true;
                    this.brainControls.autoRotateSpeed = 0.2; // Slower rotation
                    this.brainControls.enableZoom = false;
                    this.brainControls.enablePan = false;
                }
                
                this.createBrainLighting();
                this.loadSingleBrainModel();
                this.animateBrain();
                
                console.log('🧠 Large brain model initialized');
                
            } catch (error) {
                console.error('Brain visualization error:', error);
                this.initBrainFallback(canvas);
            }
        };
        
        this.animateBrain = () => {
            if (!this.brainRenderer || this.currentPhase !== 4 || this.introSkipped) {
                if (this.brainAnimationFrame) {
                    cancelAnimationFrame(this.brainAnimationFrame);
                    this.brainAnimationFrame = null;
                }
                return;
            }
            
            this.brainAnimationFrame = requestAnimationFrame(() => this.animateBrain());
            
            this.brainControls?.update();
            
            // Update brain material based on highlight regions
            if (this.brainMaterial) {
                const time = Date.now() * 0.001;
                let totalIntensity = 0.7;
                
                this.brainHighlightRegions.forEach(region => {
                    if (region.active) {
                        region.activationTime += 0.02;
                        const pulse = Math.sin(region.activationTime * region.pulseSpeed * 3) * 0.3 + 0.7;
                        totalIntensity = Math.max(totalIntensity, region.baseIntensity + pulse * 0.3);
                    }
                });
                
                this.brainMaterial.opacity = totalIntensity;
                
                // Subtle global pulsing
                const globalPulse = Math.sin(time * 0.5) * 0.1 + 0.9;
                this.brainMaterial.emissiveIntensity = globalPulse * 0.1;
            }
            
            if (this.brainScene && this.brainCamera) {
                this.brainRenderer.render(this.brainScene, this.brainCamera);
            }
        };
        
        this.cleanupBrain = () => {
            if (this.brainAnimationFrame) {
                cancelAnimationFrame(this.brainAnimationFrame);
                this.brainAnimationFrame = null;
            }
            
            if (this.brainMesh) {
                this.brainScene?.remove(this.brainMesh);
                this.brainMesh.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                this.brainMesh = null;
            }
            
            if (this.brainMaterial) {
                this.brainMaterial.dispose();
                this.brainMaterial = null;
            }
            
            if (this.brainRenderer) {
                this.brainRenderer.dispose();
                this.brainRenderer = null;
            }
            
            this.brainScene = null;
            this.brainCamera = null;
            this.brainControls = null;
            this.brainHighlightRegions = [];
            
            console.log('🗑️ Brain cleanup complete');
        };
        
        this.cleanupTerrain = () => {
            if (this.terrainInterval) {
                clearInterval(this.terrainInterval);
                this.terrainInterval = null;
            }
            
            if (this.terrainAnimationFrame) {
                cancelAnimationFrame(this.terrainAnimationFrame);
                this.terrainAnimationFrame = null;
            }
            
            if (this.mountainParticles) {
                if (this.mountainGeometry) this.mountainGeometry.dispose();
                if (this.mountainParticles.material) this.mountainParticles.material.dispose();
                this.threeScene?.remove(this.mountainParticles);
            }
            
            if (this.threeRenderer) {
                this.threeRenderer.dispose();
            }
            
            this.threeScene = null;
            this.threeCamera = null;
            this.threeControls = null;
            this.mountainGeometry = null;
            this.mountainParticles = null;
            this.pointsPlot = [];
            
            console.log('🗑️ Terrain cleanup complete');
        };
        
        this.animateTerrain = () => {
            if (!this.threeRenderer || this.currentPhase !== 3 || this.introSkipped) {
                if (this.terrainAnimationFrame) {
                    cancelAnimationFrame(this.terrainAnimationFrame);
                    this.terrainAnimationFrame = null;
                }
                return;
            }
            
            this.terrainAnimationFrame = requestAnimationFrame(() => this.animateTerrain());
            
            this.threeControls?.update();
            
            if (this.threeScene && this.threeCamera) {
                this.threeRenderer.render(this.threeScene, this.threeCamera);
            }
        };
    }

    // ========================================
    // UTILITY & INITIALIZATION
    // ========================================
    
    detectLowPowerDevice() {
        // Check for low power indicators
        return navigator.hardwareConcurrency <= 2 || 
               navigator.connection?.effectiveType === 'slow-2g' ||
               navigator.connection?.effectiveType === '2g' ||
               navigator.deviceMemory < 4;
    }

    init() {
        if (this.initialized) {
            console.log('⚠️ Animations already initialized, skipping');
            return;
        }
        
        console.log('🎬 Animations Manager V6 Enhanced initializing...');
        console.log(`📱 Device mode: ${this.shouldUseOptimizedMode ? 'Optimized' : 'Full'}`);
        
        this.cacheElements();

        if (!this.elements.stellarIntro) {
            console.error('❌ stellarIntro element not found! Cannot start intro.');
            return;
        }

        console.log('🚀 Starting Stellar Intro V6 Enhanced...');
        this.startStellarIntro();

        this.initialized = true;
        console.log('✅ Animations Manager V6 Enhanced initialized');
    }
    
    cacheElements() {
        this.elements = {
            stellarIntro: document.getElementById('stellarIntro'),
            skipIndicator: document.getElementById('skipIndicator'),
            
            // Phase 1
            phaseVoice: document.getElementById('phaseVoice'),
            subtitleText: document.getElementById('subtitleText'),
            frequencyBars: document.querySelectorAll('.freq-bar'),
            
            // Phase 2
            phaseData: document.getElementById('phaseData'),
            dataSubtitle: document.getElementById('dataSubtitle'),
            scanProgress: document.getElementById('scanProgress'),
            progressRing: document.getElementById('progressRing'),
            percentNum: document.getElementById('percentNum'),
            statusBox: document.getElementById('statusBox'),
            
            // Phase 3 - Canvas para terreno
            phaseGlobe: document.getElementById('phaseGlobe'),
            terrainCanvas: document.getElementById('terrainCanvas'),
            terrainLocation: document.getElementById('terrainLocation'),
            
            // Phase 4 - Canvas para cerebro 3D
            phaseBody: document.getElementById('phaseBody'),
            brainCanvas: document.getElementById('brainCanvas'),
            bodySubtitle: document.getElementById('bodySubtitle'),
            
            // Phase 5
            phaseBoarding: document.getElementById('phaseBoarding'),
            boardingWrapper: document.querySelector('.boarding-wrapper'),
            
            // Main screens
            mainScreen: document.getElementById('mainScreen'),
            homeScreen: document.getElementById('homeScreen'),
            aboutScreen: document.getElementById('aboutScreen'),
            contactScreen: document.getElementById('contactScreen'),
            mainNav: document.getElementById('mainNav')
        };

        console.log('🔍 Elements found:', {
            stellarIntro: !!this.elements.stellarIntro,
            terrainCanvas: !!this.elements.terrainCanvas,
            brainCanvas: !!this.elements.brainCanvas
        });
    }

    // ========================================
    // AUDIO MANAGEMENT (ENHANCED WITH SFX)
    // ========================================
    
    preloadStellarAudio() {
        // Optimized audio loading with error handling
        const loadAudio = (src, volume) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'metadata'; // Only load metadata initially
            return audio;
        };

        try {
            this.stellarAudio.bgMusic = loadAudio('/src/sfx/INTROx_song.mp3', this.volumes.bgMusic);
            this.stellarAudio.bgMusicLoop = loadAudio('/src/sfx/INTROx_AFTER_loop.mp3', this.volumes.bgMusicLoop);
            this.stellarAudio.bgMusicLoop.loop = true;
            
            this.stellarAudio.voiceIntro = loadAudio('/src/starvortex_assets/voice_intro.mp3', this.volumes.voiceIntro);
            this.stellarAudio.voiceDataDisplay = loadAudio('/src/starvortex_assets/voice-data-display.mp3', this.volumes.voiceDataDisplay);
            this.stellarAudio.voiceDataEarth = loadAudio('/src/starvortex_assets/voice-data-earth.mp3', this.volumes.voiceDataDisplay);
            this.stellarAudio.voiceDataUser = loadAudio('/src/starvortex_assets/voice-data-user.mp3', this.volumes.voiceDataUser);
            this.stellarAudio.voiceFinal = loadAudio('/src/starvortex_assets/voice-final.mp3', this.volumes.voiceFinal);
            
            this.stellarAudio.transitions = [
                loadAudio('/src/sfx/FX_flow_transition_data-tech.mp3', this.volumes.transition),
                loadAudio('/src/sfx/FX_Transition.mp3', this.volumes.transition)
            ];
            
            // NEW: Load sequential SFX (soft, non-repeated)
            this.stellarAudio.sfx.textRollover = loadAudio('/src/sfx/UI_menu_text_rollover_2.mp3', this.volumes.sfx);
            this.stellarAudio.sfx.scanZoom = loadAudio('/src/sfx/scan-zoom.mp3', this.volumes.sfx);
            this.stellarAudio.sfx.textAnimation = loadAudio('/src/sfx/FX_text_animation_loop.mp3', this.volumes.sfx);
            this.stellarAudio.sfx.affirmation = loadAudio('/src/sfx/affirmation-tech.wav', this.volumes.sfx);
            
            // Setup loop transition
            this.stellarAudio.bgMusic.addEventListener('ended', () => {
                if (!this.introSkipped) {
                    this.playAudio(this.stellarAudio.bgMusicLoop);
                }
            });
            
            console.log('🎵 Stellar audio preloaded with SFX');
        } catch (error) {
            console.error('❌ Audio preload error:', error);
        }
    }
    
    // Play SFX only once (sequential, not repeated)
    playSFX(sfxName) {
        if (this.sfxPlayed[sfxName] || !this.stellarAudio.sfx[sfxName]) return;
        
        this.sfxPlayed[sfxName] = true;
        this.playAudio(this.stellarAudio.sfx[sfxName]);
        console.log(`🔊 SFX played: ${sfxName}`);
    }
    
    playAudio(audioElement) {
        return audioElement?.play().catch(err => 
            console.log('Audio play blocked:', err.message)
        ) || Promise.resolve();
    }
    
    stopAllAudio() {
        Object.values(this.stellarAudio).forEach(audio => {
            if (typeof audio === 'object' && audio !== null) {
                if (Array.isArray(audio)) {
                    audio.forEach(this.stopSingleAudio);
                } else if (audio.pause) {
                    this.stopSingleAudio(audio);
                } else {
                    // Handle sfx object
                    Object.values(audio).forEach(sfx => this.stopSingleAudio(sfx));
                }
            }
        });
    }
    
    stopSingleAudio(audio) {
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    fadeOutMusic(duration = 1000) {
        const music = (this.stellarAudio.bgMusicLoop && !this.stellarAudio.bgMusicLoop.paused) 
            ? this.stellarAudio.bgMusicLoop 
            : this.stellarAudio.bgMusic;
            
        if (!music || music.paused) return;
        
        const fade = () => {
            const fadeStep = music.volume * 0.1;
            music.volume = Math.max(0, music.volume - fadeStep);
            
            if (music.volume > 0) {
                setTimeout(fade, duration / 20);
            } else {
                music.pause();
            }
        };
        
        fade();
    }

    // ========================================
    // SKIP FUNCTIONALITY (OPTIMIZED)
    // ========================================
    
    setupSkipListener() {
        const skipIndicator = this.elements.skipIndicator;
        const skipBar = skipIndicator?.querySelector('.skip-bar');
        
        this.skipHandler = (e) => {
            if (e.code === 'Space' && !this.introSkipped && !this.isHoldingSpace) {
                e.preventDefault();
                this.startSkipHold(skipBar, skipIndicator);
            }
        };
        
        this.skipKeyUpHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.cancelSkipHold(skipBar, skipIndicator);
            }
        };
        
        document.addEventListener('keydown', this.skipHandler);
        document.addEventListener('keyup', this.skipKeyUpHandler);
    }
    
    startSkipHold(skipBar, skipIndicator) {
        this.isHoldingSpace = true;
        this.skipHoldProgress = 0;
        
        skipIndicator?.classList.add('holding');
        
        const holdDuration = 2500; // Reduced for better UX
        const interval = 50;
        const increment = (interval / holdDuration) * 100;
        
        this.skipHoldInterval = setInterval(() => {
            this.skipHoldProgress += increment;
            
            skipBar?.style.setProperty('--progress', `${this.skipHoldProgress}%`);
            
            if (this.skipHoldProgress >= 100) {
                this.completeSkip(skipIndicator);
            }
        }, interval);
    }
    
    cancelSkipHold(skipBar, skipIndicator) {
        this.isHoldingSpace = false;
        
        if (this.skipHoldInterval) {
            clearInterval(this.skipHoldInterval);
            this.skipHoldInterval = null;
        }
        
        this.skipHoldProgress = 0;
        skipBar?.style.setProperty('--progress', '0%');
        skipIndicator?.classList.remove('holding');
    }
    
    completeSkip(skipIndicator) {
        this.cancelSkipHold(null, skipIndicator);
        this.introSkipped = true;
        
        skipIndicator?.classList.add('pressed');
        
        // Cleanup listeners
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        this.stopAllAudio();
        this.cleanupTerrain();
        this.cleanupBrain();
        this.transitionFromStellarToMain();
    }

    // ========================================
    // MAIN INTRO SEQUENCE
    // ========================================
    
    async startStellarIntro() {
        this.preloadStellarAudio();
        this.setupSkipListener();
        
        await this.playAudio(this.stellarAudio.bgMusic);
        
        if (!this.introSkipped) await this.playStellarPhase1();
        if (!this.introSkipped) await this.playStellarPhase2();
        if (!this.introSkipped) await this.playStellarPhase3(); // Extended to 50s
        if (!this.introSkipped) await this.playStellarPhase4();
        if (!this.introSkipped) await this.playStellarPhase5();
        
        if (!this.introSkipped) {
            this.transitionFromStellarToMain();
        }
    }

    // ========================================
    // PHASE 1: VOICE AUTHENTICATION (OPTIMIZED)
    // ========================================
    
    async playStellarPhase1() {
        return new Promise((resolve) => {
            console.log('📍 Phase 1: Voice Authentication');
            this.currentPhase = 1;
            
            const phaseVoice = this.elements.phaseVoice;
            if (!phaseVoice) return resolve();
            
            phaseVoice.classList.add('active');
            
            // Play first SFX
            setTimeout(() => this.playSFX('textRollover'), 500);
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playAudio(this.stellarAudio.voiceIntro);
                
                if (this.stellarAudio.voiceIntro) {
                    this.stellarAudio.voiceIntro.addEventListener('timeupdate', this.updateSubtitlesPhase1);
                    this.stellarAudio.voiceIntro.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                this.elements.subtitleText?.classList.remove('visible');
                                phaseVoice.classList.remove('active');
                            }
                            resolve();
                        }, 1500);
                    };
                }
                
                setTimeout(() => {
                    if (!this.introSkipped) resolve();
                }, 22000);
                
            }, 1000);
        });
    }
    
    updateFrequencyBars() {
        this.elements.frequencyBars?.forEach((bar) => {
            bar.style.height = `${8 + Math.random() * 35}px`;
        });
    }

    // ========================================
    // PHASE 2: DATA VISUALIZATION (OPTIMIZED)
    // ========================================
    
    async playStellarPhase2() {
        return new Promise((resolve) => {
            console.log('📍 Phase 2: Data Visualization');
            this.currentPhase = 2;
            
            const phaseData = this.elements.phaseData;
            if (!phaseData) return resolve();
            
            this.playAudio(this.stellarAudio.transitions[0]);
            phaseData.classList.add('active');
            this.animateDataElements();
            
            // Play second SFX
            setTimeout(() => this.playSFX('scanZoom'), 1000);
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playAudio(this.stellarAudio.voiceDataDisplay);
                
                if (this.stellarAudio.voiceDataDisplay) {
                    this.stellarAudio.voiceDataDisplay.addEventListener('timeupdate', this.updateSubtitlesPhase2);
                    this.stellarAudio.voiceDataDisplay.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                this.elements.dataSubtitle?.classList.remove('visible');
                                phaseData.classList.remove('active');
                            }
                            resolve();
                        }, 2000);
                    };
                }
                
                setTimeout(() => {
                    if (!this.introSkipped) resolve();
                }, 55000);
                
            }, 2000);
        });
    }
    
    animateDataElements() {
        // Optimized sequential animations with smoother timing
        const readouts = document.querySelectorAll('.readout-item');
        const infoBlocks = document.querySelectorAll('.info-block');
        
        readouts.forEach((item, i) => {
            setTimeout(() => item.classList.add('visible'), i * 600);
        });
        
        infoBlocks.forEach((block, i) => {
            setTimeout(() => block.classList.add('visible'), 1500 + (i * 400));
        });
        
        setTimeout(() => {
            this.elements.statusBox?.classList.add('visible');
            this.animateStatusLines();
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
    
    updateDataProgress(time) {
        const totalDuration = 49;
        const progress = Math.min((time / totalDuration) * 100, 100);
        
        if (this.elements.scanProgress) {
            this.elements.scanProgress.style.width = `${progress}%`;
        }
        
        if (this.elements.progressRing) {
            const circumference = 339.292;
            const offset = circumference - (progress / 100) * circumference;
            this.elements.progressRing.style.strokeDashoffset = offset;
        }
        
        if (this.elements.percentNum) {
            this.elements.percentNum.textContent = Math.round(progress);
        }
    }

    // ========================================
    // PHASE 3: MULTI-TERRAIN VISUALIZATION (160 SECONDS)
    // ========================================
    
    async playStellarPhase3() {
        return new Promise((resolve) => {
            console.log('📍 Phase 3: Multi-Terrain Visualization (160s - 2 locations)');
            this.currentPhase = 3;
            
            const phaseGlobe = this.elements.phaseGlobe;
            if (!phaseGlobe) return resolve();
            
            this.playAudio(this.stellarAudio.transitions[1]);
            phaseGlobe.classList.add('active');
            
            // Play third SFX
            setTimeout(() => this.playSFX('textAnimation'), 2000);
            
            // Create geo info panels
            this.createGeoInfoPanels();
            
            // Initialize terrain system
            if (this.elements.terrainCanvas && window.THREE) {
                this.initMultiTerrainSystem();
            }
            
            this.animateGlobeData();
            
            // Play voice-data-earth audio
            setTimeout(() => {
                if (this.introSkipped) return;
                this.playAudio(this.stellarAudio.voiceDataEarth);
            }, 3000);
            
            // Extended duration: 160 seconds for terrain (80s x 2)
            setTimeout(() => {
                if (!this.introSkipped) {
                    this.cleanupTerrain();
                    phaseGlobe.classList.remove('active');
                }
                resolve();
            }, 162000); // 160s + 2s buffer
        });
    }
    
    createGeoInfoPanels() {
        // Create left and right geo info panels if they don't exist
        const globeContainer = document.querySelector('.globe-container');
        if (!globeContainer) return;
        
        // Left panel for geographic data
        let leftPanel = document.getElementById('geoInfoLeft');
        if (!leftPanel) {
            leftPanel = document.createElement('div');
            leftPanel.id = 'geoInfoLeft';
            leftPanel.className = 'geo-info-panel left';
            leftPanel.innerHTML = `
                <div class="geo-panel-header">
                    <span class="geo-icon">◉</span>
                    <span class="geo-title">LOCATION DATA</span>
                </div>
                <div class="geo-content" id="geoContentLeft"></div>
            `;
            globeContainer.appendChild(leftPanel);
        }
        
        // Right panel for facts
        let rightPanel = document.getElementById('geoInfoRight');
        if (!rightPanel) {
            rightPanel = document.createElement('div');
            rightPanel.id = 'geoInfoRight';
            rightPanel.className = 'geo-info-panel right';
            rightPanel.innerHTML = `
                <div class="geo-panel-header">
                    <span class="geo-icon">◎</span>
                    <span class="geo-title">TERRAIN FACTS</span>
                </div>
                <div class="geo-content" id="geoContentRight"></div>
            `;
            globeContainer.appendChild(rightPanel);
        }
        
        // Add styles dynamically
        this.injectGeoInfoStyles();
    }
    
    injectGeoInfoStyles() {
        if (document.getElementById('geoInfoStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'geoInfoStyles';
        style.textContent = `
            .geo-info-panel {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 280px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 20px;
                font-family: 'SV-Tech', 'Courier New', monospace;
                z-index: 10;
                backdrop-filter: blur(5px);
                opacity: 0;
                transition: opacity 0.8s ease;
            }
            .geo-info-panel.visible {
                opacity: 1;
            }
            .geo-info-panel.left {
                left: 40px;
            }
            .geo-info-panel.right {
                right: 40px;
            }
            .geo-panel-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            .geo-icon {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.8rem;
            }
            .geo-title {
                font-size: 0.65rem;
                letter-spacing: 0.15em;
                color: rgba(255, 255, 255, 0.7);
            }
            .geo-content {
                min-height: 150px;
            }
            .geo-item {
                margin-bottom: 12px;
                opacity: 0;
                transform: translateX(-10px);
                transition: opacity 0.5s ease, transform 0.5s ease;
            }
            .geo-item.visible {
                opacity: 1;
                transform: translateX(0);
            }
            .geo-item.right-panel {
                transform: translateX(10px);
            }
            .geo-item.right-panel.visible {
                transform: translateX(0);
            }
            .geo-label {
                font-size: 0.55rem;
                letter-spacing: 0.1em;
                color: rgba(255, 255, 255, 0.4);
                display: block;
                margin-bottom: 3px;
            }
            .geo-value {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.9);
                letter-spacing: 0.05em;
            }
            .geo-value.typing {
                border-right: 2px solid rgba(255, 255, 255, 0.7);
                animation: blink 0.7s step-end infinite;
            }
            @keyframes blink {
                50% { border-color: transparent; }
            }
            .geo-fact {
                font-size: 0.6rem;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 8px;
                padding-left: 12px;
                border-left: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            @media (max-width: 1100px) {
                .geo-info-panel {
                    width: 220px;
                    padding: 15px;
                }
                .geo-info-panel.left { left: 20px; }
                .geo-info-panel.right { right: 20px; }
            }
            
            @media (max-width: 800px) {
                .geo-info-panel {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    displayGeoInfo(geoInfo) {
        const leftContent = document.getElementById('geoContentLeft');
        const rightContent = document.getElementById('geoContentRight');
        const leftPanel = document.getElementById('geoInfoLeft');
        const rightPanel = document.getElementById('geoInfoRight');
        
        if (!leftContent || !rightContent) return;
        
        // Clear previous content
        leftContent.innerHTML = '';
        rightContent.innerHTML = '';
        
        // Show panels
        leftPanel?.classList.add('visible');
        rightPanel?.classList.add('visible');
        
        // Left panel: Geographic data with typewriter effect
        const geoData = [
            { label: 'COORDINATES', value: geoInfo.coords },
            { label: 'ELEVATION', value: geoInfo.elevation },
            { label: 'REGION', value: geoInfo.region },
            { label: 'CLIMATE', value: geoInfo.climate },
            { label: 'DISCOVERY', value: geoInfo.discovery }
        ];
        
        geoData.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'geo-item';
            div.innerHTML = `
                <span class="geo-label">${item.label}</span>
                <span class="geo-value" id="geoValue${i}"></span>
            `;
            leftContent.appendChild(div);
            
            // Staggered reveal
            setTimeout(() => {
                div.classList.add('visible');
                // Typewriter effect
                this.typewriterEffect(`geoValue${i}`, item.value, 50);
            }, i * 400);
        });
        
        // Right panel: Facts with typewriter effect
        geoInfo.facts.forEach((fact, i) => {
            const div = document.createElement('div');
            div.className = 'geo-item right-panel';
            div.innerHTML = `<div class="geo-fact" id="geoFact${i}"></div>`;
            rightContent.appendChild(div);
            
            // Staggered reveal
            setTimeout(() => {
                div.classList.add('visible');
                this.typewriterEffect(`geoFact${i}`, `• ${fact}`, 30);
            }, 2000 + (i * 500));
        });
    }
    
    typewriterEffect(elementId, text, speed = 50) {
        const element = document.getElementById(elementId);
        if (!element || this.introSkipped) return;
        
        let index = 0;
        element.classList.add('typing');
        
        const type = () => {
            if (this.introSkipped || index >= text.length) {
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
    
    initMultiTerrainSystem() {
        const canvas = this.elements.terrainCanvas;
        
        try {
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            // Scene setup with performance optimizations
            this.threeScene = new THREE.Scene();
            this.threeScene.fog = new THREE.Fog(0x111111, 15000, 20000);
            
            // Optimized camera settings
            this.threeCamera = new THREE.PerspectiveCamera(
                this.shouldUseOptimizedMode ? 8 : 10,
                canvas.width / canvas.height,
                0.1,
                this.shouldUseOptimizedMode ? 100000 : 200000
            );
            this.threeCamera.position.set(0, 8000, -15000);
            
            // Renderer with performance settings
            this.threeRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.shouldUseOptimizedMode,
                alpha: true,
                powerPreference: this.shouldUseOptimizedMode ? "low-power" : "high-performance"
            });
            this.threeRenderer.setSize(canvas.width, canvas.height);
            this.threeRenderer.setClearColor(0x000000, 0);
            this.threeRenderer.shadowMap.enabled = false; // Disabled for performance
            
            // Controls setup - SLOWER ROTATION for smoother feel
            if (THREE.OrbitControls) {
                this.threeControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
                this.threeControls.autoRotate = true;
                this.threeControls.autoRotateSpeed = 0.08; // Much slower for smoother animation
                this.threeControls.enableDamping = true;
                this.threeControls.dampingFactor = 0.03; // Smoother damping
            }
            
            // Create optimized terrain particle system
            this.createOptimizedTerrain();
            this.animateTerrain();
            
            // Start terrain sequence with 10s intervals
            this.startTerrainSequence();
            
            console.log('🌍 Multi-terrain system initialized (160s duration, 80s each)');
            
        } catch (error) {
            console.error('Terrain system error:', error);
            this.initTerrainFallback(canvas);
        }
    }
    
    createOptimizedTerrain() {
        // Reduced terrain size for better performance
        const totalX = this.shouldUseOptimizedMode ? 100 : 120;
        const totalZ = this.shouldUseOptimizedMode ? 100 : 120;
        this.particleDistance = 30;
        
        const particleCount = totalX * totalZ;
        const positions = new Float32Array(particleCount * 3);
        
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
                
                zArray[zplot] = {
                    x: xplot,
                    z: zplot,
                    index: index,
                    targetY: 0,
                    currentY: 0
                };
                index++;
            }
            this.pointsPlot[xplot] = zArray;
        }
        
        this.mountainGeometry = new THREE.BufferGeometry();
        this.mountainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: this.shouldUseOptimizedMode ? 1.2 : 1.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.8
        });
        
        this.mountainParticles = new THREE.Points(this.mountainGeometry, material);
        this.mountainParticles.position.y = -500;
        this.threeScene.add(this.mountainParticles);
    }
    
    startTerrainSequence() {
        this.currentTerrainIndex = 0;
        this.loadNextTerrain();
        
        // Schedule terrain transitions every 80 seconds
        this.terrainInterval = setInterval(() => {
            if (this.introSkipped || this.currentPhase !== 3) {
                clearInterval(this.terrainInterval);
                return;
            }
            
            this.currentTerrainIndex = (this.currentTerrainIndex + 1) % this.terrainLocations.length;
            this.loadNextTerrain();
        }, 80000); // 80 seconds per terrain
    }
    
    processTerrainData(data) {
        if (!this.mountainParticles || !data.coords) return;
        
        const positions = this.mountainGeometry.getAttribute('position').array;
        
        // Smooth transition: first flatten current terrain (slower)
        this.flattenCurrentTerrain(positions, () => {
            // Then apply new terrain data
            data.coords.forEach(coord => {
                const [x, y, z] = coord;
                
                if (this.pointsPlot[x]?.[z]) {
                    const vertex = this.pointsPlot[x][z];
                    const targetY = (y - (data.lowest_point || 0)) * this.particleDistance * 0.8;
                    this.animateVertexToHeight(vertex, targetY, positions);
                }
            });
        });
    }
    
    flattenCurrentTerrain(positions, callback) {
        const flattenDuration = 2000; // Slower flattening
        const startTime = Date.now();
        
        // Store original heights
        const originalHeights = [];
        for (let i = 1; i < positions.length; i += 3) {
            originalHeights.push(positions[i]);
        }
        
        const flatten = () => {
            if (this.introSkipped || this.currentPhase !== 3) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / flattenDuration, 1);
            // Smoother easing
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            for (let i = 1; i < positions.length; i += 3) {
                const originalIndex = (i - 1) / 3;
                positions[i] = originalHeights[originalIndex] * (1 - easeOut);
            }
            
            this.mountainGeometry.getAttribute('position').needsUpdate = true;
            
            if (progress < 1) {
                requestAnimationFrame(flatten);
            } else {
                callback();
            }
        };
        
        flatten();
    }
    
    animateVertexToHeight(vertex, targetY, positions) {
        const duration = 3000; // Slower rise for smoother animation
        const startTime = Date.now();
        const startY = positions[vertex.index * 3 + 1];
        
        const animate = () => {
            if (this.introSkipped || this.currentPhase !== 3) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smoother easing function
            const easeOut = 1 - Math.pow(1 - progress, 4);
            
            const currentY = startY + (targetY - startY) * easeOut;
            positions[vertex.index * 3 + 1] = currentY;
            
            if (vertex.index % 50 === 0) { // Update less frequently
                this.mountainGeometry.getAttribute('position').needsUpdate = true;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    animateGlobeData() {
        const coordsEl = document.getElementById('globeCoords');
        const sectorEl = document.getElementById('globeSector');
        const elevEl = document.getElementById('globeElev');
        const terrainEl = document.getElementById('globeTerrain');
        
        const locations = [
            { coords: '27.9659°N 86.7797°E', sector: 'EVEREST VALLEY', elev: '5364m', terrain: 'VALLEY' },
            { coords: '45.4167°N 6.9333°E', sector: 'COL DE LISERAN', elev: '2770m', terrain: 'ALPINE' }
        ];
        
        let index = 0;
        const updateLocation = () => {
            if (this.introSkipped || this.currentPhase !== 3) return;
            
            const loc = locations[index % locations.length];
            if (coordsEl) coordsEl.textContent = loc.coords;
            if (sectorEl) sectorEl.textContent = loc.sector;
            if (elevEl) elevEl.textContent = loc.elev;
            if (terrainEl) terrainEl.textContent = loc.terrain;
            
            index++;
            setTimeout(updateLocation, 80000); // Sync with terrain transitions (80s)
        };
        
        setTimeout(updateLocation, 1000);
    }
    
    // ========================================
    // PHASE 4: BRAIN VISUALIZATION (LARGER + MORE INFO)
    // ========================================
    
    async playStellarPhase4() {
        return new Promise((resolve) => {
            console.log('📍 Phase 4: Brain Visualization (Large + Extended Info)');
            this.currentPhase = 4;
            
            const phaseBody = this.elements.phaseBody;
            if (!phaseBody) return resolve();
            
            phaseBody.classList.add('active');
            
            // Play fourth SFX
            setTimeout(() => this.playSFX('affirmation'), 1500);
            
            if (this.elements.brainCanvas && window.THREE) {
                this.initBrainVisualization();
            }
            
            // Create extended brain info panel
            this.createBrainInfoPanel();
            
            this.animateScanItems();
            
            // Start extended brain info with typewriter effect
            setTimeout(() => this.displayBrainTechnicalInfo(), 2000);
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playAudio(this.stellarAudio.voiceDataUser);
                
                if (this.stellarAudio.voiceDataUser) {
                    this.stellarAudio.voiceDataUser.addEventListener('timeupdate', this.updateSubtitlesPhase4);
                    this.stellarAudio.voiceDataUser.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                this.elements.bodySubtitle?.classList.remove('visible');
                                phaseBody.classList.remove('active');
                            }
                            resolve();
                        }, 2000);
                    };
                }
                
                setTimeout(() => {
                    if (!this.introSkipped) resolve();
                }, 35000);
                
            }, 1500);
        });
    }
    
    createBrainInfoPanel() {
        const bodyContainer = document.querySelector('.body-container');
        if (!bodyContainer) return;
        
        // Left panel for extended brain info
        let infoPanel = document.getElementById('brainTechInfo');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.id = 'brainTechInfo';
            infoPanel.className = 'brain-tech-panel';
            infoPanel.innerHTML = `
                <div class="brain-panel-header">
                    <span class="brain-icon">⬡</span>
                    <span class="brain-title">NEURAL ANALYSIS</span>
                </div>
                <div class="brain-tech-content" id="brainTechContent"></div>
            `;
            bodyContainer.appendChild(infoPanel);
        }
        
        // Add styles dynamically
        this.injectBrainInfoStyles();
    }
    
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
                color: rgba(150, 255, 150, 0.9);
            }
            .brain-tech-value.warning {
                color: rgba(255, 200, 100, 0.9);
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
    
    displayBrainTechnicalInfo() {
        const content = document.getElementById('brainTechContent');
        const panel = document.getElementById('brainTechInfo');
        
        if (!content) return;
        
        content.innerHTML = '';
        panel?.classList.add('visible');
        
        this.brainTechnicalInfo.forEach((info, i) => {
            const div = document.createElement('div');
            div.className = 'brain-tech-item';
            
            // Determine status class based on value content
            let statusClass = '';
            if (info.value.includes('OPTIMAL') || info.value.includes('ACTIVE') || 
                info.value.includes('SUCCESSFUL') || info.value.includes('EXCEPTIONAL') ||
                info.value.includes('ENHANCED') || info.value.includes('HIGH')) {
                statusClass = 'success';
            } else if (info.value.includes('FRAGMENTED') || info.value.includes('RECALIBRATING') ||
                       info.value.includes('RECOVERED')) {
                statusClass = 'warning';
            }
            
            div.innerHTML = `
                <span class="brain-tech-label">${info.label}</span>
                <span class="brain-tech-value ${statusClass}" id="brainVal${i}"></span>
            `;
            content.appendChild(div);
            
            // Staggered reveal with typewriter effect
            setTimeout(() => {
                if (this.introSkipped) return;
                div.classList.add('visible');
                this.typewriterEffect(`brainVal${i}`, info.value, 25);
            }, info.delay);
        });
    }
    
    createBrainLighting() {
        // Optimized lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.brainScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.brainScene.add(directionalLight);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-50, 0, -50);
        this.brainScene.add(fillLight);
    }
    
    loadSingleBrainModel() {
        const loader = new THREE.OBJLoader();
        
        loader.load(
            this.brainModelPath,
            (object) => {
                // Single optimized material
                this.brainMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.7,
                    shininess: 30,
                    specular: 0x111111
                });
                
                // Apply material and setup mesh
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = this.brainMaterial;
                        child.castShadow = false;
                        child.receiveShadow = false;
                    }
                });
                
                // Center and scale the model - LARGER SIZE
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);
                
                // Increased scale for larger brain
                const scale = this.shouldUseOptimizedMode ? 1.3 : this.brainScale;
                object.scale.setScalar(scale);
                
                this.brainMesh = object;
                this.brainScene.add(object);
                
                // Create highlight regions for visual effect
                this.createBrainHighlightRegions();
                
                console.log('✅ Large brain model loaded (scale: ' + scale + ')');
            },
            (progress) => {
                console.log(`Loading brain: ${Math.round((progress.loaded / progress.total) * 100)}%`);
            },
            (error) => {
                console.error('Error loading brain model:', error);
                this.createFallbackBrain();
            }
        );
    }
    
    createBrainHighlightRegions() {
        // Create 5 invisible regions for highlighting effects
        this.brainHighlightRegions = [];
        
        for (let i = 0; i < 5; i++) {
            const region = {
                active: false,
                intensity: 0,
                baseIntensity: 0.7,
                pulseSpeed: 0.5 + Math.random() * 0.5,
                activationTime: 0
            };
            
            this.brainHighlightRegions.push(region);
        }
        
        // Start highlight sequence
        this.startBrainHighlightSequence();
    }
    
    startBrainHighlightSequence() {
        let currentRegion = 0;
        
        const activateNextRegion = () => {
            if (this.introSkipped || this.currentPhase !== 4) return;
            
            // Deactivate all regions
            this.brainHighlightRegions.forEach(region => {
                region.active = false;
                region.activationTime = 0;
            });
            
            // Activate current region
            if (this.brainHighlightRegions[currentRegion]) {
                this.brainHighlightRegions[currentRegion].active = true;
                
                // Update scan display
                const scanItems = document.querySelectorAll('.scan-item');
                if (scanItems[currentRegion]) {
                    const regionNames = ['Frontal Cortex', 'Parietal Lobe', 'Temporal Region', 'Occipital Area', 'Cerebellum'];
                    scanItems[currentRegion].querySelector('.scan-text').textContent = 
                        `${regionNames[currentRegion]}: ACTIVE`;
                    scanItems[currentRegion].querySelector('.scan-dot').classList.add('success');
                }
            }
            
            currentRegion = (currentRegion + 1) % this.brainHighlightRegions.length;
            setTimeout(activateNextRegion, 3000);
        };
        
        setTimeout(activateNextRegion, 1000);
    }
    
    createFallbackBrain() {
        // Simple fallback geometry if model fails to load - LARGER
        const geometry = new THREE.SphereGeometry(120, 16, 12); // Increased from 80
        this.brainMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        
        this.brainMesh = new THREE.Mesh(geometry, this.brainMaterial);
        this.brainScene.add(this.brainMesh);
        
        console.log('🔄 Large fallback brain created');
    }
    
    animateScanItems() {
        const scanItems = document.querySelectorAll('.scan-item');
        scanItems.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, 1000 + (i * 800));
        });
    }
    
    // ========================================
    // PHASE 5: BOARDING PASS (UNCHANGED)
    // ========================================
    
    async playStellarPhase5() {
        return new Promise((resolve) => {
            console.log('📍 Phase 5: Boarding Pass');
            this.currentPhase = 5;
            
            const phaseBoarding = this.elements.phaseBoarding;
            if (!phaseBoarding) return resolve();
            
            phaseBoarding.classList.add('active');
            this.playAudio(this.stellarAudio.voiceFinal);
            
            setTimeout(() => {
                this.elements.boardingWrapper?.classList.add('visible');
            }, 500);
            
            if (this.stellarAudio.voiceFinal) {
                this.stellarAudio.voiceFinal.onended = () => {
                    setTimeout(() => {
                        if (!this.introSkipped) {
                            phaseBoarding.classList.remove('active');
                        }
                        resolve();
                    }, 3000);
                };
            }
            
            setTimeout(() => {
                if (!this.introSkipped) resolve();
            }, 18000);
        });
    }

    // ========================================
    // TRANSITION AND CLEANUP (OPTIMIZED)
    // ========================================
    
    transitionFromStellarToMain() {
        console.log('🎬 Transitioning to main (optimized)...');
        
        // Cleanup listeners and intervals
        this.cleanupSkipFunctionality();
        
        // Fade out music and intro
        this.fadeOutMusic(1200);
        
        const stellarIntro = this.elements.stellarIntro;
        stellarIntro?.classList.add('fade-out');
        
        setTimeout(() => {
            if (stellarIntro) stellarIntro.style.display = 'none';
            
            // Show main content
            this.showMainContent();
            
            // Final cleanup
            this.performFinalCleanup();
            
            console.log('✅ Intro complete, optimized transition finished');
            
        }, 1200);
    }
    
    cleanupSkipFunctionality() {
        const skipIndicator = this.elements.skipIndicator;
        skipIndicator?.classList.add('hidden');
        
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        if (this.skipHoldInterval) {
            clearInterval(this.skipHoldInterval);
            this.skipHoldInterval = null;
        }
    }
    
    showMainContent() {
        const mainScreen = this.elements.mainScreen;
        const homeScreen = this.elements.homeScreen;
        const mainNav = this.elements.mainNav;
        
        if (mainScreen) mainScreen.style.display = 'block';
        if (homeScreen) homeScreen.classList.add('show');
        if (mainNav) mainNav.classList.add('show');
        
        this.currentPage = 'home';
    }
    
    performFinalCleanup() {
        this.stopAllAudio();
        this.cleanupTerrain();
        this.cleanupBrain();
        
        // Clear any remaining intervals or timeouts
        if (this.terrainInterval) {
            clearInterval(this.terrainInterval);
            this.terrainInterval = null;
        }
    }

    // ========================================
    // FALLBACK FUNCTIONS (OPTIMIZED)
    // ========================================
    
    initTerrainFallback(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const particleCount = this.shouldUseOptimizedMode ? 300 : 500;
        const particles = Array(particleCount).fill().map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.2, // Slower for smoothness
            speedY: (Math.random() - 0.5) * 0.2,
            alpha: Math.random() * 0.4 + 0.4
        }));
        
        const animate = () => {
            if (this.currentPhase !== 3 || this.introSkipped) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x = (p.x + p.speedX + canvas.width) % canvas.width;
                p.y = (p.y + p.speedY + canvas.height) % canvas.height;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    initBrainFallback(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const nodeCount = this.shouldUseOptimizedMode ? 60 : 80;
        
        // LARGER fallback brain
        const nodes = Array(nodeCount).fill().map((_, i) => {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 120 + Math.random() * 60; // Increased from 80 + 40
            return {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                size: 2 + Math.random() * 3,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.6 + Math.random() * 1.0, // Slower for smoothness
                isHighlighted: false
            };
        });
        
        let highlightIndex = 0;
        const highlightNodes = () => {
            if (this.introSkipped || this.currentPhase !== 4) return;
            
            nodes.forEach(node => node.isHighlighted = false);
            
            for (let i = 0; i < 8; i++) {
                const idx = (highlightIndex + i) % nodes.length;
                nodes[idx].isHighlighted = true;
            }
            
            highlightIndex = (highlightIndex + 8) % nodes.length;
            setTimeout(highlightNodes, 2500);
        };
        
        setTimeout(highlightNodes, 500);
        
        const animate = () => {
            if (this.currentPhase !== 4 || this.introSkipped) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            nodes.forEach(node => {
                node.pulse += node.pulseSpeed * 0.015; // Slower animation
                const pulseScale = 1 + Math.sin(node.pulse) * 0.25;
                
                const size = node.size * (node.isHighlighted ? 1.5 : 1);
                const opacity = node.isHighlighted ? 0.9 : 0.6;
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, size * pulseScale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fill();
                
                if (node.isHighlighted) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, (size * pulseScale) + 3, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // ========================================
    // UTILITY FUNCTIONS (OPTIMIZED)
    // ========================================
    
    navigateToPage(pageName) {
        if (this.currentPage === pageName) return;
        this.currentPage = pageName;
        console.log(`Navigating to ${pageName}`);
    }

    queueAnimation(callback, priority = 0) {
        this.animationQueue.push({ callback, priority });
        this.animationQueue.sort((a, b) => b.priority - a.priority);
        this.processQueue();
    }

    processQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;

        this.isAnimating = true;
        const { callback } = this.animationQueue.shift();

        requestAnimationFrame(() => {
            callback();
            this.isAnimating = false;
            this.processQueue();
        });
    }

    registerRAFCallback(callback) {
        this.rafCallbacks.add(callback);
    }

    unregisterRAFCallback(callback) {
        this.rafCallbacks.delete(callback);
    }

    destroy() {
        console.log('🗑️ Destroying AnimationsManager...');
        
        this.animationQueue = [];
        this.rafCallbacks.clear();
        this.isAnimating = false;
        
        this.stopAllAudio();
        this.cleanupTerrain();
        this.cleanupBrain();
        this.cleanupSkipFunctionality();
        
        this.initialized = false;
        console.log('✅ AnimationsManager destroyed');
    }
}

// Export and instantiate
export const animationsManager = new AnimationsManager();
window.animationsManager = animationsManager;
export default animationsManager;
