/**
 * ============================
 * ANIMATIONS MANAGER MODULE V4
 * ============================
 * Handles all page animations and transitions
 * Includes Enhanced Stellar Intro Controller with 5 phases
 * Optimized for smooth navigation between Home, About, Work, Contact
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
        
        // Stellar Intro Audio
        this.stellarAudio = {
            bgMusic: null,
            bgMusicLoop: null,
            voiceIntro: null,
            voiceDataDisplay: null,
            voiceDataUser: null,
            voiceFinal: null,
            transitions: []
        };
        
        // Volume levels
        this.volumes = {
            bgMusic: 0.25,
            bgMusicLoop: 0.20,
            voiceIntro: 0.75,
            voiceDataDisplay: 0.75,
            voiceDataUser: 0.75,
            voiceFinal: 0.70,
            transition: 0.35
        };
        
        // Phase 1 subtitles
        this.subtitlesPhase1 = [
            { start: 0.0, end: 6.5, text: "Identity confirmed. Welcome aboard, Skye. All systems recognize your signature." },
            { start: 7.0, end: 10.5, text: "Creative core active, anomaly levels within acceptable range." },
            { start: 11.0, end: 14.5, text: "You are cleared for full access to StarVortex systems." },
            { start: 15.0, end: 19.0, text: "This ship will not limit you, only amplify you. Proceed when ready." }
        ];
        
        // Phase 2 subtitles
        this.subtitlesDataDisplay = [
            { start: 0.0, end: 4.0, text: "Records indicate prolonged cryogenic stasis." },
            { start: 4.0, end: 6.0, text: "Memory drift detected." },
            { start: 6.0, end: 7.0, text: "Temporal gaps." },
            { start: 7.0, end: 8.0, text: "Altered perception." },
            { start: 8.0, end: 13.0, text: "Minor desynchronization between emotional recall and factual data." },
            { start: 13.0, end: 15.0, text: "This is... normal." },
            { start: 15.0, end: 17.0, text: "Some things may feel unfamiliar." },
            { start: 17.0, end: 19.0, text: "Others may feel too familiar." },
            { start: 19.0, end: 21.0, text: "Current date registered." },
            { start: 21.0, end: 23.0, text: "Year 2090." },
            { start: 23.0, end: 24.0, text: "Earth status." },
            { start: 24.0, end: 26.0, text: "Population increased." },
            { start: 26.0, end: 27.0, text: "Attention span decreased." },
            { start: 27.0, end: 30.0, text: "Systems louder but no smarter." },
            { start: 30.0, end: 32.0, text: "Signal saturation critical." },
            { start: 32.0, end: 35.0, text: "Creativity remains rare." },
            { start: 35.0, end: 36.0, text: "Medical scan complete." },
            { start: 36.0, end: 38.0, text: "Body integrity stable." },
            { start: 38.0, end: 40.0, text: "Neural activity elevated." },
            { start: 40.0, end: 43.0, text: "Creative cortex highly responsive." },
            { start: 43.0, end: 46.0, text: "Signs of prolonged screen adaptation detected." },
            { start: 46.0, end: 49.0, text: "No critical damage found." }
        ];
        
        // Phase 4 subtitles
        this.subtitlesDataUser = [
            { start: 0.0, end: 3.0, text: "It's been a long time, hasn't it?" },
            { start: 3.0, end: 7.0, text: "Your body has been offline for a long time, Skye." },
            { start: 7.0, end: 12.0, text: "Muscles idle, senses dormant, systems suspended in silence." },
            { start: 12.0, end: 18.0, text: "Waking up after stasis is never clean, your reflexes may feel delayed, your thoughts sharper" },
            { start: 18.0, end: 20.0, text: "than your movements." },
            { start: 20.0, end: 22.0, text: "That imbalance will pass." },
            { start: 22.0, end: 24.0, text: "Your mind, however." },
            { start: 24.0, end: 25.0, text: "It never fully shut down." },
            { start: 25.0, end: 30.0, text: "Creative activity persisted beneath the surface, fragmented but active." }
        ];
        
        // Skip functionality
        this.introSkipped = false;
        this.skipHandler = null;
        this.skipKeyUpHandler = null;
        this.skipHoldProgress = 0;
        this.skipHoldInterval = null;
        this.isHoldingSpace = false;
        
        // Three.js references
        this.threeScene = null;
        this.threeCamera = null;
        this.threeRenderer = null;
        this.threeControls = null;
        this.terrainParticles = null;
        this.mountainGeometry = null;
        this.mountainParticles = null;
        this.animationFrame = null;
        this.pointsPlot = [];
        this.particleDistance = 25;
        this.centerPoint = {};
        
        // Geography data
        this.baseURL = 'https://s3.ca-central-1.amazonaws.com/kevinnewcombe/three-terrain/';
        
        // Brain 3D references
        this.brainScene = null;
        this.brainCamera = null;
        this.brainRenderer = null;
        this.brainControls = null;
        this.brainParts = [];
        this.brainMaterials = [];
        this.brainAnimationFrame = null;
        
        // Brain data - modelos en blanco puro
        this.brainModels = [
            '/src/model-3d/brain-parts-big_04.OBJ',
            '/src/model-3d/brain-parts-big_06.OBJ',
            '/src/model-3d/brain-parts-big_07.OBJ',
            '/src/model-3d/brain-parts-big_08.OBJ',
            '/src/model-3d/brain_vertex_low.OBJ'
        ];
        
        // Bind methods
        this.updateSubtitlesPhase1 = this.updateSubtitlesPhase1.bind(this);
        this.updateSubtitlesPhase2 = this.updateSubtitlesPhase2.bind(this);
        this.updateSubtitlesPhase4 = this.updateSubtitlesPhase4.bind(this);
        this.handleSkipKeyDown = this.handleSkipKeyDown.bind(this);
        this.handleSkipKeyUp = this.handleSkipKeyUp.bind(this);
        this.loadGeography = this.loadGeography.bind(this);
        this.initBrainVisualization = this.initBrainVisualization.bind(this);
        this.animateBrain = this.animateBrain.bind(this);
        this.loadBrainModels = this.loadBrainModels.bind(this);
        this.createBrainLighting = this.createBrainLighting.bind(this);
        this.animateBrainAssembly = this.animateBrainAssembly.bind(this);
        this.cleanupBrain = this.cleanupBrain.bind(this);
    }

    init() {
        if (this.initialized) {
            console.log('⚠️ Animations already initialized, skipping');
            return;
        }
        
        console.log('🎬 Animations Manager V4 initializing...');
        
        this.cacheElements();

        if (!this.elements.stellarIntro) {
            console.error('❌ stellarIntro element not found! Cannot start intro.');
            return;
        }

        console.log('🚀 Starting Stellar Intro V4...');
        this.startStellarIntro();

        this.initialized = true;
        console.log('✅ Animations Manager V4 initialized');
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
    // AUDIO MANAGEMENT
    // ========================================
    
    preloadStellarAudio() {
        const audioEnabled = true;
        
        // Background music
        this.stellarAudio.bgMusic = new Audio('/src/sfx/INTROx_song.mp3');
        this.stellarAudio.bgMusic.volume = this.volumes.bgMusic;
        this.stellarAudio.bgMusic.loop = false;
        
        // Loop music
        this.stellarAudio.bgMusicLoop = new Audio('/src/sfx/INTROx_AFTER_loop.mp3');
        this.stellarAudio.bgMusicLoop.volume = this.volumes.bgMusicLoop;
        this.stellarAudio.bgMusicLoop.loop = true;
        
        // Voice files
        this.stellarAudio.voiceIntro = new Audio('/src/starvortex_assets/voice_intro.mp3');
        this.stellarAudio.voiceIntro.volume = this.volumes.voiceIntro;
        
        this.stellarAudio.voiceDataDisplay = new Audio('/src/starvortex_assets/voice-data-display.mp3');
        this.stellarAudio.voiceDataDisplay.volume = this.volumes.voiceDataDisplay;
        
        this.stellarAudio.voiceDataUser = new Audio('/src/starvortex_assets/voice-data-user.mp3');
        this.stellarAudio.voiceDataUser.volume = this.volumes.voiceDataUser;
        
        this.stellarAudio.voiceFinal = new Audio('/src/starvortex_assets/voice-final.mp3');
        this.stellarAudio.voiceFinal.volume = this.volumes.voiceFinal;
        
        // Transition sounds
        this.stellarAudio.transitions = [
            new Audio('/src/sfx/FX_flow_transition_data-tech.mp3'),
            new Audio('/src/sfx/FX_Transition.mp3')
        ];
        this.stellarAudio.transitions.forEach(t => t.volume = this.volumes.transition);
        
        // Setup loop transition when main song ends
        this.stellarAudio.bgMusic.addEventListener('ended', () => {
            if (!this.introSkipped) {
                console.log('🔁 Main music ended, starting loop...');
                this.playAudio(this.stellarAudio.bgMusicLoop);
            }
        });
        
        console.log('🎵 Stellar audio preloaded. Audio enabled:', audioEnabled);
    }
    
    playAudio(audioElement) {
        if (audioElement) {
            return audioElement.play().catch(err => {
                console.log('Audio play blocked:', err.message);
            });
        }
        return Promise.resolve();
    }
    
    stopAllAudio() {
        Object.values(this.stellarAudio).forEach(audio => {
            if (Array.isArray(audio)) {
                audio.forEach(a => {
                    if (a && !a.paused) {
                        a.pause();
                        a.currentTime = 0;
                    }
                });
            } else if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }
    
    fadeOutMusic(duration = 1000) {
        const music = this.stellarAudio.bgMusicLoop && !this.stellarAudio.bgMusicLoop.paused 
            ? this.stellarAudio.bgMusicLoop 
            : this.stellarAudio.bgMusic;
            
        if (music && !music.paused) {
            const startVolume = music.volume;
            const steps = 20;
            const stepTime = duration / steps;
            const volumeStep = startVolume / steps;
            
            let step = 0;
            const fade = setInterval(() => {
                step++;
                music.volume = Math.max(0, startVolume - (volumeStep * step));
                if (step >= steps) {
                    clearInterval(fade);
                    music.pause();
                }
            }, stepTime);
        }
    }

    // ========================================
    // SKIP FUNCTIONALITY
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
        
        if (skipIndicator) {
            skipIndicator.classList.add('holding');
        }
        
        const holdDuration = 3000;
        const interval = 30;
        const increment = (interval / holdDuration) * 100;
        
        this.skipHoldInterval = setInterval(() => {
            this.skipHoldProgress += increment;
            
            if (skipBar) {
                skipBar.style.setProperty('--progress', `${this.skipHoldProgress}%`);
            }
            
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
        
        if (skipBar) {
            skipBar.style.setProperty('--progress', '0%');
        }
        
        if (skipIndicator) {
            skipIndicator.classList.remove('holding');
        }
    }
    
    completeSkip(skipIndicator) {
        this.cancelSkipHold(null, skipIndicator);
        this.introSkipped = true;
        
        if (skipIndicator) {
            skipIndicator.classList.add('pressed');
        }
        
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        this.stopAllAudio();
        this.cleanupThree();
        this.cleanupBrain();
        this.transitionFromStellarToMain();
    }
    
    handleSkipKeyDown(e) {
        if (e.code === 'Space' && !this.introSkipped) {
            e.preventDefault();
        }
    }
    
    handleSkipKeyUp(e) {
        if (e.code === 'Space' && !this.introSkipped) {
            e.preventDefault();
        }
    }

    // ========================================
    // MAIN INTRO SEQUENCE
    // ========================================
    
    async startStellarIntro() {
        this.preloadStellarAudio();
        this.setupSkipListener();
        
        // Start background music
        await this.playAudio(this.stellarAudio.bgMusic);
        
        // Phase 1: Voice Recognition
        if (!this.introSkipped) {
            await this.playStellarPhase1();
        }
        
        // Phase 2: Data Visualization
        if (!this.introSkipped) {
            await this.playStellarPhase2();
        }
        
        // Phase 3: Globe Visualization
        if (!this.introSkipped) {
            await this.playStellarPhase3();
        }
        
        // Phase 4: Brain Scan
        if (!this.introSkipped) {
            await this.playStellarPhase4();
        }
        
        // Phase 5: Boarding Pass
        if (!this.introSkipped) {
            await this.playStellarPhase5();
        }
        
        // Transition to main
        if (!this.introSkipped) {
            this.transitionFromStellarToMain();
        }
    }

    // ========================================
    // PHASE 1: VOICE AUTHENTICATION
    // ========================================
    
    async playStellarPhase1() {
        return new Promise((resolve) => {
            console.log('📍 Phase 1: Voice Authentication');
            this.currentPhase = 1;
            
            const phaseVoice = this.elements.phaseVoice;
            const subtitleText = this.elements.subtitleText;
            
            if (!phaseVoice) {
                resolve();
                return;
            }
            
            phaseVoice.classList.add('active');
            
            setTimeout(() => {
                if (this.introSkipped) {
                    resolve();
                    return;
                }
                
                this.playAudio(this.stellarAudio.voiceIntro);
                
                if (this.stellarAudio.voiceIntro) {
                    this.stellarAudio.voiceIntro.addEventListener('timeupdate', this.updateSubtitlesPhase1);
                    
                    this.stellarAudio.voiceIntro.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                if (subtitleText) subtitleText.classList.remove('visible');
                                phaseVoice.classList.remove('active');
                            }
                            resolve();
                        }, 1500);
                    };
                }
                
                // Fallback timer
                setTimeout(() => {
                    if (this.stellarAudio.voiceIntro && 
                        this.stellarAudio.voiceIntro.paused && 
                        this.stellarAudio.voiceIntro.currentTime === 0) {
                        console.log('⏭️ Voice fallback timer triggered');
                        if (!this.introSkipped) {
                            phaseVoice.classList.remove('active');
                        }
                        resolve();
                    }
                }, 22000);
                
            }, 1000);
        });
    }
    
    updateSubtitlesPhase1() {
        if (this.introSkipped || !this.stellarAudio.voiceIntro) return;
        
        const currentTime = this.stellarAudio.voiceIntro.currentTime;
        const subtitleText = this.elements.subtitleText;
        
        if (!subtitleText) return;
        
        const currentSub = this.subtitlesPhase1.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub) {
            if (subtitleText.textContent !== currentSub.text) {
                subtitleText.textContent = currentSub.text;
                subtitleText.classList.add('visible');
            }
        } else if (currentTime >= this.subtitlesPhase1[this.subtitlesPhase1.length - 1].end) {
            subtitleText.classList.remove('visible');
        }
        
        // Update frequency bars
        this.updateFrequencyBars();
    }
    
    updateFrequencyBars() {
        if (this.elements.frequencyBars) {
            this.elements.frequencyBars.forEach((bar) => {
                const height = 8 + Math.random() * 35;
                bar.style.height = `${height}px`;
            });
        }
    }

    // ========================================
    // PHASE 2: DATA VISUALIZATION
    // ========================================
    
    async playStellarPhase2() {
        return new Promise((resolve) => {
            console.log('📍 Phase 2: Data Visualization');
            this.currentPhase = 2;
            
            const phaseData = this.elements.phaseData;
            const dataSubtitle = this.elements.dataSubtitle;
            
            if (!phaseData) {
                resolve();
                return;
            }
            
            // Play transition sound
            if (this.stellarAudio.transitions[0]) {
                this.playAudio(this.stellarAudio.transitions[0]);
            }
            
            phaseData.classList.add('active');
            
            // Animate data elements
            this.animateDataElements();
            
            setTimeout(() => {
                if (this.introSkipped) {
                    resolve();
                    return;
                }
                
                this.playAudio(this.stellarAudio.voiceDataDisplay);
                
                if (this.stellarAudio.voiceDataDisplay) {
                    this.stellarAudio.voiceDataDisplay.addEventListener('timeupdate', this.updateSubtitlesPhase2);
                    
                    this.stellarAudio.voiceDataDisplay.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                if (dataSubtitle) dataSubtitle.classList.remove('visible');
                                phaseData.classList.remove('active');
                            }
                            resolve();
                        }, 2000);
                    };
                }
                
                // Fallback
                setTimeout(() => {
                    if (this.stellarAudio.voiceDataDisplay && 
                        this.stellarAudio.voiceDataDisplay.paused && 
                        !this.introSkipped) {
                        phaseData.classList.remove('active');
                        resolve();
                    }
                }, 55000);
                
            }, 2000);
        });
    }
    
    updateSubtitlesPhase2() {
        if (this.introSkipped || !this.stellarAudio.voiceDataDisplay) return;
        
        const currentTime = this.stellarAudio.voiceDataDisplay.currentTime;
        const dataSubtitle = this.elements.dataSubtitle;
        
        if (!dataSubtitle) return;
        
        const currentSub = this.subtitlesDataDisplay.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub) {
            if (dataSubtitle.textContent !== currentSub.text) {
                dataSubtitle.textContent = currentSub.text;
                dataSubtitle.classList.add('visible');
            }
        }
        
        // Update progress
        this.updateDataProgress(currentTime);
    }
    
    animateDataElements() {
        // Reveal readout items
        const readouts = document.querySelectorAll('.readout-item');
        readouts.forEach((item, i) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, i * 800);
        });
        
        // Reveal info blocks
        const infoBlocks = document.querySelectorAll('.info-block');
        infoBlocks.forEach((block, i) => {
            setTimeout(() => {
                block.classList.add('visible');
            }, 2000 + (i * 600));
        });
        
        // Show status box
        setTimeout(() => {
            const statusBox = this.elements.statusBox;
            if (statusBox) {
                statusBox.classList.add('visible');
                this.animateStatusLines();
            }
        }, 3000);
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
            }, i * 1000);
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
    // PHASE 3: GLOBE VISUALIZATION WITH TERRAIN
    // ========================================
    
    async playStellarPhase3() {
        return new Promise((resolve) => {
            console.log('📍 Phase 3: Globe/Terrain Visualization');
            this.currentPhase = 3;
            
            const phaseGlobe = this.elements.phaseGlobe;
            const canvas = this.elements.terrainCanvas;
            
            if (!phaseGlobe) {
                resolve();
                return;
            }
            
            // Play transition sound
            if (this.stellarAudio.transitions[1]) {
                this.playAudio(this.stellarAudio.transitions[1]);
            }
            
            phaseGlobe.classList.add('active');
            
            // Initialize Three.js terrain with geographic data
            if (canvas && window.THREE) {
                this.initThreeTerrainWithGeo(canvas);
            } else {
                console.error('Three.js or canvas not available');
            }
            
            // Reveal panel items
            const panelItems = document.querySelectorAll('.panel-item');
            panelItems.forEach((item, i) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, 500 + (i * 400));
            });
            
            // Update coordinates dynamically
            this.animateGlobeData();
            
            // Duration - extended for terrain loading
            setTimeout(() => {
                if (!this.introSkipped) {
                    this.cleanupThree();
                    phaseGlobe.classList.remove('active');
                }
                resolve();
            }, 15000);
        });
    }
    
    initThreeTerrainWithGeo(canvas) {
        try {
            // Configura el tamaño del canvas
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            // Scene setup
            this.threeScene = new THREE.Scene();
            this.threeScene.fog = new THREE.Fog(0x111111, 22000, 25000);
            
            // Camera setup
            this.threeCamera = new THREE.PerspectiveCamera(
                10, 
                canvas.width / canvas.height, 
                0.1, 
                200000
            );
            this.threeCamera.position.set(0, 10000, -20000);
            this.threeScene.add(this.threeCamera);
            
            // Renderer setup
            this.threeRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: false,
                alpha: true
            });
            this.threeRenderer.setSize(canvas.width, canvas.height);
            this.threeRenderer.setClearColor(0x000000, 0);
            this.threeRenderer.shadowMap.enabled = true;
            
            // Controls setup
            if (THREE.OrbitControls) {
                this.threeControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
                this.threeControls.autoRotate = true;
                this.threeControls.autoRotateSpeed = 0.25;
                this.threeControls.enableDamping = true;
                this.threeControls.dampingFactor = 0.125;
            }
            
            // Create terrain particle system
            this.createGroundPlane();
            
            // Start animation loop
            this.animateTerrain();
            
            // Load geographic data
            setTimeout(() => {
                this.loadGeography('everest');
            }, 1000);
            
            console.log('🌍 Three.js terrain with geography initialized');
            
        } catch (error) {
            console.error('Three.js terrain error:', error);
            this.initCanvasFallback(canvas);
        }
    }
    
    createGroundPlane() {
        const totalX = 150;
        const totalZ = 150;
        this.particleDistance = 25;
        
        const particleCount = totalX * totalZ;
        const positions = new Float32Array(particleCount * 3);
        
        this.pointsPlot = [];
        let index = 0;
        
        for (let x = 0; x < totalX; x++) {
            const xplot = x - Math.round((totalX - 1) / 2);
            const zArray = [];
            
            for (let z = 0; z < totalZ; z++) {
                const zplot = z - Math.round((totalZ - 1) / 2);
                
                // Posición del vértice
                positions[index * 3] = x * this.particleDistance - this.particleDistance * (totalX - 1) / 2;
                positions[index * 3 + 1] = 0;
                positions[index * 3 + 2] = z * this.particleDistance - this.particleDistance * (totalZ - 1) / 2;
                
                zArray[zplot] = {
                    x: xplot,
                    z: zplot,
                    index: index,
                    targetY: 0
                };
                index++;
            }
            this.pointsPlot[xplot] = zArray;
        }
        
        this.mountainGeometry = new THREE.BufferGeometry();
        this.mountainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.8
        });
        
        this.mountainParticles = new THREE.Points(this.mountainGeometry, material);
        this.mountainParticles.position.y = -700;
        this.threeScene.add(this.mountainParticles);
    }
    
    loadGeography(filename = 'everest') {
        if (!this.baseURL) {
            console.error('Base URL not defined');
            return;
        }
        
        const request = new XMLHttpRequest();
        request.open('GET', `${this.baseURL}_terrain/${filename}.json?v=2`);
        
        request.onprogress = (evt) => {
            if (evt.lengthComputable) {
                const progress = Math.round((evt.loaded / evt.total) * 100);
                console.log(`🌍 Loading terrain: ${progress}%`);
                const loadingEl = document.getElementById('terrainLoading');
                if (loadingEl) {
                    loadingEl.textContent = `LOADING TERRAIN DATA... ${progress}%`;
                }
            }
        };
        
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                try {
                    const data = JSON.parse(request.responseText);
                    this.processGeographicData(data);
                    
                    // Actualizar texto de carga
                    const loadingEl = document.getElementById('terrainLoading');
                    if (loadingEl) {
                        loadingEl.textContent = 'TERRAIN DATA LOADED';
                    }
                } catch (error) {
                    console.error('Error parsing geography data:', error);
                }
            } else {
                console.error('Error loading geography data:', request.status);
            }
        };
        
        request.onerror = () => {
            console.error('Network error loading geography data');
        };
        
        request.send();
    }
    
    processGeographicData(data) {
        if (!this.mountainParticles || !data.coords) {
            console.error('No mountain particles or coords data');
            return;
        }
        
        console.log('🗺️ Processing geographic data...');
        
        // Set center point
        if (data.boundaries) {
            this.centerPoint.lat = data.boundaries[2] + (data.boundaries[0] - data.boundaries[2]) / 2;
            this.centerPoint.lng = data.boundaries[3] + (data.boundaries[1] - data.boundaries[3]) / 2;
            console.log(`📍 Center: ${this.centerPoint.lat}, ${this.centerPoint.lng}`);
        }
        
        const positions = this.mountainGeometry.getAttribute('position').array;
        
        // Process terrain data
        data.coords.forEach(coord => {
            const [x, y, z] = coord;
            
            if (this.pointsPlot[x] && this.pointsPlot[x][z]) {
                const vertex = this.pointsPlot[x][z];
                const targetY = (y - (data.lowest_point || 0)) * this.particleDistance;
                
                // Store target height for animation
                vertex.targetY = targetY;
                
                // Animate to target height
                this.animateVertexHeight(vertex, targetY, positions);
            }
        });
    }
    
    animateVertexHeight(vertex, targetY, positions) {
        if (!vertex) return;
        
        const startTime = Date.now();
        const duration = 1500;
        const startY = positions[vertex.index * 3 + 1];
        
        const animateHeight = () => {
            if (this.introSkipped || this.currentPhase !== 3) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentY = startY + (targetY - startY) * easeOut;
            
            positions[vertex.index * 3 + 1] = currentY;
            this.mountainGeometry.getAttribute('position').needsUpdate = true;
            
            if (progress < 1) {
                requestAnimationFrame(animateHeight);
            }
        };
        
        animateHeight();
    }
    
    animateTerrain() {
        if (!this.threeRenderer || this.currentPhase !== 3 || this.introSkipped) {
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animateTerrain());
        
        if (this.threeControls) {
            this.threeControls.update();
        }
        
        if (this.threeScene && this.threeCamera) {
            this.threeRenderer.render(this.threeScene, this.threeCamera);
        }
    }
    
    animateGlobeData() {
        const coordsEl = document.getElementById('globeCoords');
        const sectorEl = document.getElementById('globeSector');
        const elevEl = document.getElementById('globeElev');
        const terrainEl = document.getElementById('globeTerrain');
        
        const locations = [
            { coords: '27.9881°N 86.9250°E', sector: 'EVEREST', elev: '8849m', terrain: 'MOUNTAIN' },
            { coords: '35.7120°N 139.7876°E', sector: 'TOKYO', elev: '40m', terrain: 'URBAN' },
            { coords: '40.7128°N 74.0060°W', sector: 'NEW YORK', elev: '10m', terrain: 'URBAN' },
            { coords: '51.5074°N 0.1278°W', sector: 'LONDON', elev: '11m', terrain: 'URBAN' }
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
            setTimeout(updateLocation, 3000);
        };
        
        setTimeout(updateLocation, 1000);
    }
    
    cleanupThree() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        if (this.mountainParticles) {
            if (this.mountainGeometry) this.mountainGeometry.dispose();
            if (this.mountainParticles.material) this.mountainParticles.material.dispose();
            if (this.threeScene) {
                this.threeScene.remove(this.mountainParticles);
            }
            this.mountainParticles = null;
        }
        
        if (this.threeRenderer) {
            this.threeRenderer.dispose();
            this.threeRenderer = null;
        }
        
        this.threeScene = null;
        this.threeCamera = null;
        this.threeControls = null;
        this.mountainGeometry = null;
        this.pointsPlot = [];
    }

    // ========================================
    // PHASE 4: BRAIN VISUALIZATION
    // ========================================
    
    async playStellarPhase4() {
        return new Promise((resolve) => {
            console.log('📍 Phase 4: Brain Visualization');
            this.currentPhase = 4;
            
            const phaseBody = this.elements.phaseBody;
            const brainCanvas = this.elements.brainCanvas;
            
            if (!phaseBody) {
                resolve();
                return;
            }
            
            phaseBody.classList.add('active');
            
            // Initialize Brain 3D visualization
            if (brainCanvas && window.THREE) {
                this.initBrainVisualization(brainCanvas);
            } else {
                console.error('Three.js or brain canvas not available');
            }
            
            // Reveal scan items
            const scanItems = document.querySelectorAll('.scan-item');
            scanItems.forEach((item, i) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, 2000 + (i * 1500));
            });
            
            setTimeout(() => {
                if (this.introSkipped) {
                    resolve();
                    return;
                }
                
                this.playAudio(this.stellarAudio.voiceDataUser);
                
                if (this.stellarAudio.voiceDataUser) {
                    this.stellarAudio.voiceDataUser.addEventListener('timeupdate', this.updateSubtitlesPhase4);
                    
                    this.stellarAudio.voiceDataUser.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                const bodySubtitle = document.getElementById('bodySubtitle');
                                if (bodySubtitle) bodySubtitle.classList.remove('visible');
                                phaseBody.classList.remove('active');
                            }
                            resolve();
                        }, 2000);
                    };
                }
                
                // Fallback
                setTimeout(() => {
                    if (this.stellarAudio.voiceDataUser && 
                        this.stellarAudio.voiceDataUser.paused && 
                        !this.introSkipped) {
                        phaseBody.classList.remove('active');
                        resolve();
                    }
                }, 35000);
                
            }, 1500);
        });
    }
    
    initBrainVisualization(canvas) {
        try {
            // Configurar tamaño del canvas
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            // Crear escena
            this.brainScene = new THREE.Scene();
            this.brainScene.background = new THREE.Color(0x000000);
            
            // Crear cámara
            this.brainCamera = new THREE.PerspectiveCamera(
                45,
                canvas.width / canvas.height,
                0.1,
                10000
            );
            this.brainCamera.position.set(0, 200, 500);
            
            // Crear renderer
            this.brainRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: true,
                alpha: true
            });
            this.brainRenderer.setSize(canvas.width, canvas.height);
            this.brainRenderer.setClearColor(0x000000, 0);
            this.brainRenderer.shadowMap.enabled = true;
            this.brainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Configurar controles de órbita
            if (THREE.OrbitControls) {
                this.brainControls = new THREE.OrbitControls(this.brainCamera, this.brainRenderer.domElement);
                this.brainControls.enableDamping = true;
                this.brainControls.dampingFactor = 0.05;
                this.brainControls.autoRotate = true;
                this.brainControls.autoRotateSpeed = 0.5;
                this.brainControls.enableZoom = true;
                this.brainControls.enablePan = false;
                this.brainControls.minDistance = 300;
                this.brainControls.maxDistance = 800;
            }
            
            // Crear iluminación
            this.createBrainLighting();
            
            // Cargar modelos del cerebro
            this.loadBrainModels();
            
            // Iniciar animación
            this.animateBrain();
            
            console.log('🧠 Brain visualization initialized');
            
        } catch (error) {
            console.error('Brain visualization error:', error);
            this.initBrainFallback(canvas);
        }
    }
    
    createBrainLighting() {
        // Luz ambiental - blanco suave
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.brainScene.add(ambientLight);
        
        // Luz direccional principal - blanca
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.brainScene.add(directionalLight);
        
        // Luz de relleno - blanca suave
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-100, 50, -100);
        this.brainScene.add(fillLight);
        
        // Luces de acento - todas blancas
        this.brainAccentLights = [];
        const accentPositions = [
            { x: 0, y: 100, z: 0 },
            { x: 50, y: 0, z: 50 },
            { x: -50, y: 0, z: -50 },
            { x: 0, y: -50, z: 50 }
        ];
        
        accentPositions.forEach(pos => {
            const light = new THREE.PointLight(0xffffff, 0.6, 300);
            light.position.set(pos.x, pos.y, pos.z);
            this.brainScene.add(light);
            this.brainAccentLights.push(light);
        });
    }
    
    loadBrainModels() {
        const loader = new THREE.OBJLoader();
        const loadedParts = [];
        
        this.brainModels.forEach((modelPath, index) => {
            loader.load(
                modelPath,
                (object) => {
                    // Material blanco transparente para todas las partes
                    const material = new THREE.MeshPhongMaterial({
                        color: 0xffffff, // Blanco puro
                        transparent: true,
                        opacity: 0.1, // Muy transparente inicialmente
                        shininess: 100,
                        specular: 0x222222,
                        side: THREE.DoubleSide
                    });
                    
                    // Aplicar material a todas las mallas del objeto
                    object.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.material = material;
                            child.castShadow = true;
                            child.receiveShadow = true;
                            
                            // Posicionar aleatoriamente alrededor del centro
                            const angle = (index / this.brainModels.length) * Math.PI * 2;
                            const radius = 100;
                            object.position.x = Math.cos(angle) * radius;
                            object.position.z = Math.sin(angle) * radius;
                            object.position.y = (Math.random() - 0.5) * 50;
                            
                            // Rotación inicial
                            object.rotation.x = Math.random() * Math.PI;
                            object.rotation.y = Math.random() * Math.PI * 2;
                            object.rotation.z = Math.random() * Math.PI;
                            
                            // Escalar según el modelo
                            const scale = 0.8 + Math.random() * 0.4;
                            object.scale.set(scale, scale, scale);
                            
                            // Agregar animación única
                            object.userData = {
                                rotationSpeedX: 0.0005 + Math.random() * 0.001,
                                rotationSpeedY: 0.001 + Math.random() * 0.002,
                                rotationSpeedZ: 0.0003 + Math.random() * 0.0007,
                                floatSpeed: 0.3 + Math.random() * 0.4,
                                floatAmplitude: 15 + Math.random() * 25,
                                pulseSpeed: 0.8 + Math.random() * 1.2,
                                pulseIntensity: 0.3 + Math.random() * 0.4,
                                initialY: object.position.y,
                                timeOffset: Math.random() * Math.PI * 2,
                                isHighlighted: false,
                                highlightTimer: 0
                            };
                        }
                    });
                    
                    this.brainScene.add(object);
                    this.brainParts.push(object);
                    this.brainMaterials.push(material);
                    loadedParts.push(object);
                    
                    console.log(`✅ Loaded brain part ${index + 1}/${this.brainModels.length}`);
                    
                    // Si es la última parte, iniciar animación de reunión
                    if (loadedParts.length === this.brainModels.length) {
                        setTimeout(() => this.animateBrainAssembly(), 500);
                    }
                },
                (progress) => {
                    console.log(`Loading brain part ${index + 1}: ${Math.round(progress * 100)}%`);
                },
                (error) => {
                    console.error(`Error loading brain model ${modelPath}:`, error);
                    // Intentar con una ruta alternativa
                    const altPath = modelPath.replace('.OBJ', '.obj');
                    console.log(`Trying alternative path: ${altPath}`);
                    
                    // Cargar modelo de respaldo simple
                    const geometry = new THREE.IcosahedronGeometry(30, 1);
                    const material = new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.1,
                        wireframe: true
                    });
                    const fallbackMesh = new THREE.Mesh(geometry, material);
                    fallbackMesh.position.set(
                        (Math.random() - 0.5) * 200,
                        (Math.random() - 0.5) * 100,
                        (Math.random() - 0.5) * 200
                    );
                    this.brainScene.add(fallbackMesh);
                    this.brainParts.push(fallbackMesh);
                    this.brainMaterials.push(material);
                    loadedParts.push(fallbackMesh);
                    
                    if (loadedParts.length === this.brainModels.length) {
                        setTimeout(() => this.animateBrainAssembly(), 500);
                    }
                }
            );
        });
    }
    
    animateBrainAssembly() {
        // Animar las partes del cerebro hacia el centro
        const duration = 2500;
        const startTime = Date.now();
        
        const animateAssembly = () => {
            if (this.introSkipped || this.currentPhase !== 4) return;
            
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Función de easing suave
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            this.brainParts.forEach((part, index) => {
                const targetX = 0;
                const targetY = 0;
                const targetZ = 0;
                
                part.position.x = part.position.x * (1 - easeOutCubic);
                part.position.y = (part.position.y * (1 - easeOutCubic)) + (targetY * easeOutCubic);
                part.position.z = part.position.z * (1 - easeOutCubic);
                
                // Suavizar rotación hacia orientación neutra
                part.rotation.x = part.rotation.x * (1 - easeOutCubic * 0.3);
                part.rotation.z = part.rotation.z * (1 - easeOutCubic * 0.3);
                
                // Aumentar gradualmente la opacidad
                if (this.brainMaterials[index]) {
                    this.brainMaterials[index].opacity = 0.1 + (easeOutCubic * 0.3);
                }
            });
            
            if (progress < 1) {
                requestAnimationFrame(animateAssembly);
            } else {
                // Iniciar secuencia de destacado después del ensamblaje
                this.startHighlightSequence();
            }
        };
        
        animateAssembly();
    }
    
    startHighlightSequence() {
        // Secuencia para destacar diferentes partes del cerebro
        let currentHighlight = 0;
        
        const highlightNextPart = () => {
            if (this.introSkipped || this.currentPhase !== 4) return;
            
            // Resetear todas las partes
            this.brainParts.forEach((part, index) => {
                part.userData.isHighlighted = false;
                part.userData.highlightTimer = 0;
                if (this.brainMaterials[index]) {
                    this.brainMaterials[index].opacity = 0.4;
                    this.brainMaterials[index].emissive = new THREE.Color(0x000000);
                    this.brainMaterials[index].emissiveIntensity = 0;
                }
            });
            
            // Destacar la parte actual
            if (currentHighlight < this.brainParts.length) {
                this.brainParts[currentHighlight].userData.isHighlighted = true;
                
                // Actualizar texto HUD
                const brainSections = [
                    "Frontal Lobe",
                    "Temporal Lobe", 
                    "Parietal Lobe",
                    "Occipital Lobe",
                    "Cerebellum"
                ];
                
                const scanItems = document.querySelectorAll('.scan-item');
                if (scanItems[currentHighlight]) {
                    scanItems[currentHighlight].querySelector('.scan-text').textContent = 
                        `${brainSections[currentHighlight]}: ACTIVATED`;
                    scanItems[currentHighlight].querySelector('.scan-dot').classList.add('success');
                }
            }
            
            currentHighlight = (currentHighlight + 1) % this.brainParts.length;
            
            // Programar siguiente destacado
            setTimeout(highlightNextPart, 3000);
        };
        
        // Empezar la secuencia después de un breve delay
        setTimeout(highlightNextPart, 1000);
    }
    
    animateBrain() {
        if (!this.brainRenderer || this.currentPhase !== 4 || this.introSkipped) {
            if (this.brainAnimationFrame) {
                cancelAnimationFrame(this.brainAnimationFrame);
                this.brainAnimationFrame = null;
            }
            return;
        }
        
        this.brainAnimationFrame = requestAnimationFrame(() => this.animateBrain());
        
        // Actualizar controles
        if (this.brainControls) {
            this.brainControls.update();
        }
        
        // Animar partes del cerebro
        const time = Date.now() * 0.001;
        
        this.brainParts.forEach((part, index) => {
            if (part.userData) {
                // Rotación suave en múltiples ejes
                part.rotation.x += part.userData.rotationSpeedX;
                part.rotation.y += part.userData.rotationSpeedY;
                part.rotation.z += part.userData.rotationSpeedZ;
                
                // Flotación suave
                const floatTime = time * part.userData.floatSpeed + part.userData.timeOffset;
                part.position.y = part.userData.initialY + Math.sin(floatTime) * part.userData.floatAmplitude;
                
                // Pulsación de opacidad
                const pulseTime = time * part.userData.pulseSpeed + part.userData.timeOffset;
                const pulse = Math.sin(pulseTime) * 0.5 + 0.5;
                
                // Actualizar material si existe
                if (this.brainMaterials[index]) {
                    // Efecto de destacado
                    if (part.userData.isHighlighted) {
                        part.userData.highlightTimer += 0.02;
                        const highlightPulse = Math.sin(part.userData.highlightTimer * 3) * 0.3 + 0.7;
                        this.brainMaterials[index].opacity = 0.7 + highlightPulse * 0.3;
                        this.brainMaterials[index].emissive = new THREE.Color(0xffffff);
                        this.brainMaterials[index].emissiveIntensity = highlightPulse * 0.5;
                    } else {
                        // Pulsación normal
                        const baseOpacity = 0.4;
                        this.brainMaterials[index].opacity = baseOpacity + pulse * part.userData.pulseIntensity;
                        this.brainMaterials[index].emissive = new THREE.Color(0x000000);
                        this.brainMaterials[index].emissiveIntensity = 0;
                    }
                }
            }
        });
        
        // Animar luces de acento
        if (this.brainAccentLights) {
            this.brainAccentLights.forEach((light, index) => {
                const lightTime = time * 0.3 + index;
                light.intensity = 0.4 + Math.sin(lightTime) * 0.2;
                
                // Movimiento circular suave de las luces
                const orbitRadius = 150;
                const orbitSpeed = 0.1;
                light.position.x = Math.cos(time * orbitSpeed + index) * orbitRadius;
                light.position.z = Math.sin(time * orbitSpeed + index) * orbitRadius;
            });
        }
        
        // Renderizar
        if (this.brainScene && this.brainCamera) {
            this.brainRenderer.render(this.brainScene, this.brainCamera);
        }
    }
    
    cleanupBrain() {
        if (this.brainAnimationFrame) {
            cancelAnimationFrame(this.brainAnimationFrame);
            this.brainAnimationFrame = null;
        }
        
        if (this.brainParts.length > 0) {
            this.brainParts.forEach(part => {
                if (this.brainScene) {
                    this.brainScene.remove(part);
                }
                // Limpiar geometrías y materiales
                part.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
            });
            this.brainParts = [];
        }
        
        if (this.brainMaterials.length > 0) {
            this.brainMaterials.forEach(material => material.dispose());
            this.brainMaterials = [];
        }
        
        if (this.brainRenderer) {
            this.brainRenderer.dispose();
            this.brainRenderer = null;
        }
        
        this.brainScene = null;
        this.brainCamera = null;
        this.brainControls = null;
        this.brainAccentLights = null;
    }
    
    updateSubtitlesPhase4() {
        if (this.introSkipped || !this.stellarAudio.voiceDataUser) return;
        
        const currentTime = this.stellarAudio.voiceDataUser.currentTime;
        const bodySubtitle = document.getElementById('bodySubtitle');
        
        if (!bodySubtitle) return;
        
        const currentSub = this.subtitlesDataUser.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub) {
            if (bodySubtitle.textContent !== currentSub.text) {
                bodySubtitle.textContent = currentSub.text;
                bodySubtitle.classList.add('visible');
            }
        }
    }

    // ========================================
    // PHASE 5: BOARDING PASS
    // ========================================
    
    async playStellarPhase5() {
        return new Promise((resolve) => {
            console.log('📍 Phase 5: Boarding Pass');
            this.currentPhase = 5;
            
            const phaseBoarding = this.elements.phaseBoarding;
            const boardingWrapper = this.elements.boardingWrapper;
            
            if (!phaseBoarding) {
                resolve();
                return;
            }
            
            phaseBoarding.classList.add('active');
            
            // Play final voice (no subtitles)
            this.playAudio(this.stellarAudio.voiceFinal);
            
            // Reveal boarding pass
            setTimeout(() => {
                if (boardingWrapper) {
                    boardingWrapper.classList.add('visible');
                }
            }, 500);
            
            // Wait for voice to finish or timeout
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
            
            // Fallback timeout
            setTimeout(() => {
                if (!this.introSkipped) {
                    phaseBoarding.classList.remove('active');
                }
                resolve();
            }, 20000);
        });
    }

    // ========================================
    // TRANSITION TO MAIN
    // ========================================
    
    transitionFromStellarToMain() {
        console.log('🎬 Transitioning to main...');
        
        // Hide skip indicator
        const skipIndicator = this.elements.skipIndicator;
        if (skipIndicator) {
            skipIndicator.classList.add('hidden');
        }
        
        // Remove skip listeners
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        // Clear skip interval
        if (this.skipHoldInterval) {
            clearInterval(this.skipHoldInterval);
            this.skipHoldInterval = null;
        }
        
        // Fade out music
        this.fadeOutMusic(1500);
        
        // Fade out intro
        const stellarIntro = this.elements.stellarIntro;
        if (stellarIntro) {
            stellarIntro.classList.add('fade-out');
        }
        
        // Complete transition
        setTimeout(() => {
            if (stellarIntro) {
                stellarIntro.style.display = 'none';
            }
            
            // Show main content
            const mainScreen = this.elements.mainScreen;
            const homeScreen = this.elements.homeScreen;
            const mainNav = this.elements.mainNav;
            
            if (mainScreen) mainScreen.style.display = 'block';
            if (homeScreen) homeScreen.classList.add('show');
            if (mainNav) mainNav.classList.add('show');
            
            this.currentPage = 'home';
            
            // Cleanup
            this.stopAllAudio();
            this.cleanupThree();
            this.cleanupBrain();
            
            console.log('✅ Intro complete, main screen shown');
            
        }, 1500);
    }

    // ========================================
    // FALLBACK FUNCTIONS
    // ========================================
    
    initCanvasFallback(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        
        const particles = [];
        for (let i = 0; i < 500; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                alpha: Math.random() * 0.5 + 0.3
            });
        }
        
        const animateFallback = () => {
            if (this.currentPhase !== 3 || this.introSkipped) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animateFallback);
        };
        
        animateFallback();
    }
    
    initBrainFallback(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = canvas.offsetWidth || window.innerWidth;
        canvas.height = canvas.offsetHeight || window.innerHeight;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        const brainNodes = [];
        for (let i = 0; i < 80; i++) {
            const angle = (i / 80) * Math.PI * 2;
            const radius = 100 + Math.random() * 50;
            brainNodes.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                size: 3 + Math.random() * 4,
                baseSize: 3 + Math.random() * 4,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                connections: [],
                isHighlighted: false
            });
        }
        
        // Crear conexiones
        brainNodes.forEach((node, i) => {
            node.connections = [];
            for (let j = i + 1; j < brainNodes.length; j++) {
                const dx = node.x - brainNodes[j].x;
                const dy = node.y - brainNodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    node.connections.push(j);
                }
            }
        });
        
        // Secuencia de destacado
        let highlightIndex = 0;
        const highlightSequence = () => {
            if (this.introSkipped || this.currentPhase !== 4) return;
            
            brainNodes.forEach(node => node.isHighlighted = false);
            
            // Destacar un grupo de nodos
            for (let i = 0; i < 5; i++) {
                const idx = (highlightIndex + i) % brainNodes.length;
                brainNodes[idx].isHighlighted = true;
            }
            
            highlightIndex = (highlightIndex + 5) % brainNodes.length;
            setTimeout(highlightSequence, 2000);
        };
        
        setTimeout(highlightSequence, 1000);
        
        const animateBrainFallback = () => {
            if (this.currentPhase !== 4 || this.introSkipped) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const time = Date.now() * 0.001;
            
            // Dibujar conexiones
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            
            brainNodes.forEach((node, i) => {
                node.connections.forEach(j => {
                    const target = brainNodes[j];
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(target.x, target.y);
                    ctx.stroke();
                });
            });
            
            // Dibujar nodos
            brainNodes.forEach(node => {
                node.pulse += node.pulseSpeed * 0.02;
                const pulseScale = 1 + Math.sin(node.pulse) * 0.4;
                
                let size = node.baseSize;
                let opacity = 0.7;
                
                if (node.isHighlighted) {
                    size = node.baseSize * 1.8;
                    opacity = 0.9;
                }
                
                ctx.beginPath();
                ctx.arc(node.x, node.y, size * pulseScale, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fill();
                
                // Efecto de brillo para nodos destacados
                if (node.isHighlighted) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, (size * pulseScale) + 5, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.4)`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });
            
            // Efecto de escaneo circular
            const scanRadius = 150 + Math.sin(time * 0.5) * 30;
            ctx.beginPath();
            ctx.arc(centerX, centerY, scanRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            requestAnimationFrame(animateBrainFallback);
        };
        
        animateBrainFallback();
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    navigateToPage(pageName) {
        if (this.currentPage === pageName) return;

        const previousPage = this.currentPage;
        this.currentPage = pageName;

        console.log(`Navigating from ${previousPage} to ${pageName}`);
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

    runRAFCallbacks() {
        this.rafCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('RAF callback error:', error);
                this.rafCallbacks.delete(callback);
            }
        });
        requestAnimationFrame(() => this.runRAFCallbacks());
    }

    destroy() {
        this.animationQueue = [];
        this.rafCallbacks.clear();
        this.isAnimating = false;
        this.stopAllAudio();
        this.cleanupThree();
        this.cleanupBrain();
        
        if (this.skipHoldInterval) {
            clearInterval(this.skipHoldInterval);
        }
        
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
        }
    }
}

// Exportar e instanciar
export const animationsManager = new AnimationsManager();
window.animationsManager = animationsManager;
export default animationsManager;