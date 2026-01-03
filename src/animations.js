/**
 * ============================
 * ANIMATIONS MANAGER MODULE V8
 * ============================
 * Handles all animations and visual effects
 * - Stellar Intro sequence (5 phases)
 * - 3D Terrain visualization
 * - Ethereal Brain visualization
 * - Page transitions
 * - Performance optimization for low-end devices
 * 
 * CRITICAL: All audio resources are preloaded by loaderManager
 * This ensures smooth playback without lag during intro sequence
 */


class AnimationsManager {

    // ========================================
    // CONSTRUCTOR - INITIAL STATE SETUP
    // ========================================
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

    // ========================================
    // DEVICE DETECTION & OPTIMIZATION
    // ========================================
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
            sfx: 0.15
        };
        
        // Subtitles data
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
        
        // Terrain transition state
        this.terrainTransition = {
            inProgress: false,
            currentHeight: 0,
            targetHeight: 0,
            startTime: 0,
            duration: 2500
        };
        
        // Camera transition state
        this.cameraTransition = {
            active: false,
            startTime: 0,
            duration: 2500,
            startPos: {},
            targetPos: {}
        };
        
        // Multi-terrain system
        this.terrainLocations = {
            'everest': {
                name: 'everest',
                label: 'MOUNT EVEREST',
                geoInfo: {
                    coords: '27.9881°N 86.9250°E',
                    elevation: '8,849m',
                    region: 'HIMALAYAS, NEPAL/TIBET',
                    climate: 'ALPINE ARCTIC',
                    population: 'UNINHABITED',
                    discovery: 'SURVEYED 1856',
                    facts: [
                        'Highest point on Earth',
                        'Known as Sagarmatha in Nepal',
                        'Chomolungma in Tibetan',
                        'First summited 1953'
                    ]
                }
            },
            'k2': {
                name: 'k2',
                label: 'K2 PEAK',
                geoInfo: {
                    coords: '35.8833°N 76.5167°E',
                    elevation: '8,611m',
                    region: 'KARAKORAM, PAKISTAN/CHINA',
                    climate: 'EXTREME ALPINE',
                    population: 'UNINHABITED',
                    discovery: 'SURVEYED 1856',
                    facts: [
                        'Second highest mountain',
                        'Known as Savage Mountain',
                        'Most dangerous 8000m peak',
                        'First summited 1954'
                    ]
                }
            },
            'kangchenjunga': {
                name: 'kangchenjunga',
                label: 'KANGCHENJUNGA',
                geoInfo: {
                    coords: '27.7025°N 88.1475°E',
                    elevation: '8,586m',
                    region: 'HIMALAYAS, NEPAL/INDIA',
                    climate: 'ALPINE MONSOON',
                    population: 'UNINHABITED',
                    discovery: 'SURVEYED 1849',
                    facts: [
                        'Third highest mountain',
                        'Five treasures of snow',
                        'Sacred to Sikkim people',
                        'First summited 1955'
                    ]
                }
            },
            'everest-valley': {
                name: 'everest-valley',
                label: 'KHUMBU GLACIER',
                geoInfo: {
                    coords: '27.9659°N 86.7797°E',
                    elevation: '5,364m',
                    region: 'KHUMBU, NEPAL',
                    climate: 'HIGH ALTITUDE VALLEY',
                    population: '~6,000 (NAMCHE)',
                    discovery: 'MAPPED 1921',
                    facts: [
                        'Gateway to Everest',
                        'Sherpa homeland',
                        'Namche Bazaar hub',
                        'Tourism since 1950s'
                    ]
                }
            },
            'coldeliseran': {
                name: 'coldeliseran',
                label: "COL DE L'ISERAN",
                geoInfo: {
                    coords: '45.4167°N 6.9333°E',
                    elevation: '2,770m',
                    region: 'FRENCH ALPS',
                    climate: 'ALPINE MEDITERRANEAN',
                    population: 'SEASONAL PASS',
                    discovery: 'ROAD BUILT 1937',
                    facts: [
                        'Highest paved pass in Alps',
                        'Tour de France famous',
                        'Part of Route des Grandes Alpes',
                        'Open June-October'
                    ]
                }
            },
            'athabasca': {
                name: 'athabasca',
                label: 'ATHABASCA GLACIER',
                geoInfo: {
                    coords: '52.2167°N 117.2333°W',
                    elevation: '1,900m - 3,450m',
                    region: 'ROCKY MOUNTAINS, CANADA',
                    climate: 'SUBARCTIC GLACIAL',
                    population: 'UNINHABITED',
                    discovery: 'EXPLORED 1898',
                    facts: [
                        'Part of Columbia Icefield',
                        'Retreating 5m per year',
                        'One of most visited glaciers',
                        '6km long, 1km wide'
                    ]
                }
            },
            'franzjosefglacier': {
                name: 'franzjosefglacier',
                label: 'FRANZ JOSEF GLACIER',
                geoInfo: {
                    coords: '43.4667°S 170.1833°E',
                    elevation: '300m - 2,700m',
                    region: 'SOUTH ISLAND, NEW ZEALAND',
                    climate: 'TEMPERATE MARITIME',
                    population: '~330 (FRANZ JOSEF)',
                    discovery: 'NAMED 1865',
                    facts: [
                        'Descends into rainforest',
                        'Named after Austrian Emperor',
                        'One of steepest glaciers',
                        'UNESCO World Heritage'
                    ]
                }
            },
            'grouse': {
                name: 'grouse',
                label: 'GROUSE GRIND',
                geoInfo: {
                    coords: '49.3833°N 123.0833°W',
                    elevation: '1,127m',
                    region: 'NORTH VANCOUVER, CANADA',
                    climate: 'PACIFIC MARITIME',
                    population: '~52,000 (N. VAN)',
                    discovery: 'TRAIL EST. 1981',
                    facts: [
                        "Known as Mother Nature's Stairmaster",
                        '2,830 steps to summit',
                        '~100,000 hikers annually',
                        'Record time: 23 minutes'
                    ]
                }
            },
            'jotunheimen': {
                name: 'jotunheimen',
                label: 'JOTUNHEIMEN',
                geoInfo: {
                    coords: '61.6333°N 8.3000°E',
                    elevation: '2,469m (GALDHØPIGGEN)',
                    region: 'SOUTHERN NORWAY',
                    climate: 'ALPINE TUNDRA',
                    population: 'UNINHABITED',
                    discovery: 'NAMED 1862',
                    facts: [
                        'Home of the Giants',
                        'Highest peaks in Scandinavia',
                        'Over 250 peaks above 1,900m',
                        'Popular hiking destination'
                    ]
                }
            },
            'lakecomo': {
                name: 'lakecomo',
                label: 'LAKE COMO',
                geoInfo: {
                    coords: '46.0167°N 9.2667°E',
                    elevation: '198m (LAKE SURFACE)',
                    region: 'LOMBARDY, ITALY',
                    climate: 'HUMID SUBTROPICAL',
                    population: '~146,000 (COMO CITY)',
                    discovery: 'ROMAN ERA',
                    facts: [
                        'Third largest Italian lake',
                        'Maximum depth 410m',
                        'Celebrity retreat destination',
                        'Y-shaped glacial lake'
                    ]
                }
            },
            'petra': {
                name: 'petra',
                label: 'PETRA',
                geoInfo: {
                    coords: '30.3285°N 35.4444°E',
                    elevation: '810m - 1,350m',
                    region: "MA'AN, JORDAN",
                    climate: 'HOT DESERT',
                    population: '~32,000 (WADI MUSA)',
                    discovery: 'REDISCOVERED 1812',
                    facts: [
                        'Ancient Nabataean city',
                        'UNESCO World Heritage Site',
                        'One of New 7 Wonders',
                        'Rose City carved in rock'
                    ]
                }
            },
            'sanfrancisco': {
                name: 'sanfrancisco',
                label: 'SAN FRANCISCO',
                geoInfo: {
                    coords: '37.7749°N 122.4194°W',
                    elevation: '0m - 280m',
                    region: 'CALIFORNIA, USA',
                    climate: 'MEDITERRANEAN',
                    population: '~874,000 (CITY)',
                    discovery: 'FOUNDED 1776',
                    facts: [
                        'City of 43 hills',
                        'Golden Gate Bridge 1937',
                        'Tech hub of the world',
                        'Frequent fog: Karl'
                    ]
                }
            },
            'valparaiso': {
                name: 'valparaiso',
                label: 'VALPARAÍSO',
                geoInfo: {
                    coords: '33.0472°S 71.6127°W',
                    elevation: '0m - 500m',
                    region: 'CENTRAL CHILE',
                    climate: 'MEDITERRANEAN',
                    population: '~296,000',
                    discovery: 'FOUNDED 1536',
                    facts: [
                        'Jewel of the Pacific',
                        '42 cerros (hills)',
                        'UNESCO World Heritage',
                        'Famous funiculars since 1883'
                    ]
                }
            }
        };
        
        this.currentTerrainKey = 'coldeliseran';
        this.baseURL = 'https://s3.ca-central-1.amazonaws.com/kevinnewcombe/three-terrain/';
        
        // Brain 3D references - ETHEREAL WHITE
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
        
        // Brain models from YOUR folder
        this.brainModels = {
            'complete': '/src/model-3d/brain-antre.obj',
            'low': '/src/model-3d/brain_vertex_low.obj',
            'parts_assembled': '/src/model-3d/brain-parts-big.obj',
            'parts_separated': {
                'part04': '/src/model-3d/brain-parts-big_04.OBJ',
                'part06': '/src/model-3d/brain-parts-big_06.OBJ',
                'part07': '/src/model-3d/brain-parts-big_07.OBJ',
                'part08': '/src/model-3d/brain-parts-big_08.OBJ'
            }
        };
        
        // Brain technical info
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
        
        // NOT binding methods in constructor - they'll be bound when needed
    }

    // ========================================
    // UTILITY & INITIALIZATION
    // ========================================
    

    // ========================================
    // DEVICE DETECTION & OPTIMIZATION
    // ========================================
    detectLowPowerDevice() {
        return navigator.hardwareConcurrency <= 2 || 
               navigator.connection?.effectiveType === 'slow-2g' ||
               navigator.connection?.effectiveType === '2g' ||
               navigator.deviceMemory < 4;
    }


    // ========================================
    // INITIALIZATION METHOD
    // ========================================
    init() {
        if (this.initialized) {
            console.log('[ANIMATIONS] Animations already initialized, skipping');
            return;
        }
        
        console.log('[ANIMATIONS] Animations Manager V8 Ethereal Brain initializing...');
        console.log(`[DEVICE] Device mode: ${this.shouldUseOptimizedMode ? 'Optimized' : 'Full'}`);
        
        this.cacheElements();

        if (!this.elements.stellarIntro) {
            console.error('[ERROR] stellarIntro element not found! Cannot start intro.');
            return;
        }

        console.log('[ANIMATIONS] Starting Stellar Intro V8 Ethereal Brain...');
        
        // Start intro sequence
        setTimeout(() => {

    // ========================================
    // STELLAR INTRO - MAIN ENTRY POINT
    // ========================================
            this.startStellarIntro();
        }, 1000);

        this.initialized = true;
        console.log('[ANIMATIONS] Animations Manager V8 Ethereal Brain initialized');
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
            
            // Phase 3
            phaseGlobe: document.getElementById('phaseGlobe'),
            terrainCanvas: document.getElementById('terrainCanvas'),
            terrainLocation: document.getElementById('terrainLocation'),
            
            // Phase 4
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

        console.log('[ANIMATIONS] Elements found:', {
            stellarIntro: !!this.elements.stellarIntro,
            terrainCanvas: !!this.elements.terrainCanvas,
            brainCanvas: !!this.elements.brainCanvas
        });
    }

    // ========================================
    // AUDIO MANAGEMENT
    // ========================================
    

    // ========================================
    // AUDIO PRELOADING
    // Note: Audio files are preloaded by loaderManager
    // This method creates Audio objects from cached resources
    // ========================================
    preloadStellarAudio() {
        const loadAudio = (src, volume) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'metadata';
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
            
            this.stellarAudio.sfx.textRollover = loadAudio('/src/sfx/UI_menu_text_rollover_2.mp3', this.volumes.sfx);
            this.stellarAudio.sfx.scanZoom = loadAudio('/src/sfx/scan-zoom.wav', this.volumes.sfx);
            this.stellarAudio.sfx.textAnimation = loadAudio('/src/sfx/FX_text_animation_loop.mp3', this.volumes.sfx);
            this.stellarAudio.sfx.affirmation = loadAudio('/src/sfx/affirmation-tech.wav', this.volumes.sfx);
            
            this.stellarAudio.bgMusic.addEventListener('ended', () => {
                if (!this.introSkipped) {
                    this.playAudio(this.stellarAudio.bgMusicLoop);
                }
            });
            
            console.log('[ANIMATIONS] Stellar audio preloaded with SFX');
        } catch (error) {
            console.error('[ERROR] Audio preload error:', error);
        }
    }
    
    playSFX(sfxName) {
        if (this.sfxPlayed[sfxName] || !this.stellarAudio.sfx[sfxName]) return;
        
        this.sfxPlayed[sfxName] = true;
        this.playAudio(this.stellarAudio.sfx[sfxName]);
        console.log(`[AUDIO] SFX played: ${sfxName}`);
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
                    audio.forEach(this.stopSingleAudio.bind(this));
                } else if (audio.pause) {
                    this.stopSingleAudio(audio);
                } else {
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
    // MAIN INTRO SEQUENCE
    // ========================================
    

    // ========================================
    // STELLAR INTRO - MAIN ENTRY POINT
    // ========================================
    async startStellarIntro() {

    // ========================================
    // AUDIO PRELOADING
    // Note: Audio files are preloaded by loaderManager
    // This method creates Audio objects from cached resources
    // ========================================
        this.preloadStellarAudio();
        this.setupSkipListener();
        
        await this.playAudio(this.stellarAudio.bgMusic);
        
        if (!this.introSkipped) await this.playStellarPhase1();
        if (!this.introSkipped) await this.playStellarPhase2();
        if (!this.introSkipped) await this.playStellarPhase3();
        if (!this.introSkipped) await this.playStellarPhase4();
        if (!this.introSkipped) await this.playStellarPhase5();
        
        if (!this.introSkipped) {
            this.transitionFromStellarToMain();
        }
    }

    // ========================================
    // PHASE 1: VOICE AUTHENTICATION
    // ========================================
    
    async playStellarPhase1() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 1: Voice Authentication');
            this.currentPhase = 1;
            
            const phaseVoice = this.elements.phaseVoice;
            if (!phaseVoice) return resolve();
            
            phaseVoice.classList.add('active');
            
            setTimeout(() => this.playSFX('textRollover'), 500);
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playAudio(this.stellarAudio.voiceIntro);
                
                if (this.stellarAudio.voiceIntro) {
                    this.stellarAudio.voiceIntro.addEventListener('timeupdate', () => this.updateSubtitlesPhase1());
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
    
    updateSubtitlesPhase1() {
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
    }
    
    updateFrequencyBars() {
        this.elements.frequencyBars?.forEach((bar) => {
            bar.style.height = `${8 + Math.random() * 35}px`;
        });
    }

    // ========================================
    // PHASE 2: DATA VISUALIZATION
    // ========================================
    
    async playStellarPhase2() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 2: Data Visualization');
            this.currentPhase = 2;
            
            const phaseData = this.elements.phaseData;
            if (!phaseData) return resolve();
            
            this.playAudio(this.stellarAudio.transitions[0]);
            phaseData.classList.add('active');
            this.animateDataElements();
            
            setTimeout(() => this.playSFX('scanZoom'), 1000);
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playAudio(this.stellarAudio.voiceDataDisplay);
                
                if (this.stellarAudio.voiceDataDisplay) {
                    this.stellarAudio.voiceDataDisplay.addEventListener('timeupdate', () => this.updateSubtitlesPhase2());
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
    
    updateSubtitlesPhase2() {
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
    // PHASE 3: OPTIMIZED TERRAIN TRANSITIONS
    // ========================================
    
    async playStellarPhase3() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 3: Optimized Terrain Visualization');
            this.currentPhase = 3;
            
            const phaseGlobe = this.elements.phaseGlobe;
            if (!phaseGlobe) return resolve();
            
            this.playAudio(this.stellarAudio.transitions[1]);
            phaseGlobe.classList.add('active');
            
            setTimeout(() => this.playSFX('textAnimation'), 2000);
            
            // Create geo info panels
            this.createGeoInfoPanels();
            
            // Initialize terrain system with smooth transitions
            if (this.elements.terrainCanvas && window.THREE) {
                this.initOptimizedTerrainSystem();
            }
            
            this.animateGlobeData();
            
            setTimeout(() => {
                if (this.introSkipped) return;
                this.playAudio(this.stellarAudio.voiceDataEarth);
            }, 3000);
            
            setTimeout(() => {
                if (!this.introSkipped) {

    // ========================================
    // CLEANUP METHODS
    // ========================================
                    this.cleanupTerrain();
                    phaseGlobe.classList.remove('active');
                }
                resolve();
            }, 162000);
        });
    }
    
    createGeoInfoPanels() {
        const globeContainer = document.querySelector('.globe-container');
        if (!globeContainer) return;
        
        // Selector panel
        let selectorPanel = document.getElementById('terrainSelectorPanel');
        if (!selectorPanel) {
            selectorPanel = document.createElement('div');
            selectorPanel.id = 'terrainSelectorPanel';
            selectorPanel.className = 'terrain-selector-panel';
            selectorPanel.innerHTML = `
                <div class="selector-header">
                    <span class="selector-icon">◈</span>
                    <span class="selector-title">SELECT TERRAIN</span>
                </div>
                <select id="terrainSelector" class="terrain-select">
                    <option value="everest">Mount Everest</option>
                    <option value="k2">K2</option>
                    <option value="kangchenjunga">Kangchenjunga</option>
                    <option value="everest-valley">Khumbu Glacier</option>
                    <option value="coldeliseran">Col de l'Iseran</option>
                    <option value="athabasca" selected>Athabasca Glacier</option>
                    <option value="franzjosefglacier">Franz Josef Glacier</option>
                    <option value="grouse">Grouse Grind</option>
                    <option value="jotunheimen">Jotunheimen</option>
                    <option value="lakecomo">Lake Como</option>
                    <option value="petra">Petra</option>
                    <option value="sanfrancisco">San Francisco</option>
                    <option value="valparaiso">Valparaíso</option>
                </select>
                <div class="selector-hint">EXPLORE EARTH'S TERRAIN</div>
            `;
            globeContainer.appendChild(selectorPanel);
            
            const selector = selectorPanel.querySelector('#terrainSelector');
            selector.addEventListener('change', (e) => {
                this.loadNextTerrain(e.target.value);
            });
        }
        
        // Info panels
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
        
        this.injectGeoInfoStyles();
    }
    
    injectGeoInfoStyles() {
        if (document.getElementById('geoInfoStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'geoInfoStyles';
        style.textContent = `
            .terrain-selector-panel {
                position: absolute;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 15px 25px;
                font-family: 'SV-Tech', 'Courier New', monospace;
                z-index: 15;
                backdrop-filter: blur(10px);
                opacity: 0;
                animation: selectorFadeIn 1s ease 1s forwards;
                text-align: center;
            }
            @keyframes selectorFadeIn {
                to { opacity: 1; }
            }
            .selector-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 12px;
            }
            .selector-icon {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.9rem;
            }
            .selector-title {
                font-size: 0.6rem;
                letter-spacing: 0.2em;
                color: rgba(255, 255, 255, 0.7);
            }
            .terrain-select {
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: rgba(255, 255, 255, 0.9);
                padding: 10px 20px;
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.75rem;
                letter-spacing: 0.1em;
                cursor: pointer;
                outline: none;
                width: 100%;
                min-width: 220px;
                transition: all 0.3s ease;
                appearance: none;
                -webkit-appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='rgba(255,255,255,0.7)' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right 12px center;
                padding-right: 35px;
            }
            .terrain-select:hover {
                border-color: rgba(255, 255, 255, 0.6);
                background-color: rgba(255, 255, 255, 0.1);
            }
            .terrain-select:focus {
                border-color: rgba(255, 255, 255, 0.8);
            }
            .terrain-select option {
                background: #111;
                color: rgba(255, 255, 255, 0.9);
                padding: 10px;
            }
            .selector-hint {
                font-size: 0.5rem;
                letter-spacing: 0.15em;
                color: rgba(255, 255, 255, 0.4);
                margin-top: 10px;
            }
            
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
                .terrain-selector-panel {
                    top: 80px;
                    padding: 12px 20px;
                }
                .terrain-select {
                    min-width: 180px;
                }
            }
            
            @media (max-width: 800px) {
                .geo-info-panel {
                    display: none;
                }
                .terrain-selector-panel {
                    top: 60px;
                    padding: 10px 15px;
                }
                .terrain-select {
                    min-width: 160px;
                    font-size: 0.65rem;
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
        
        leftContent.innerHTML = '';
        rightContent.innerHTML = '';
        
        leftPanel?.classList.add('visible');
        rightPanel?.classList.add('visible');
        
        const geoData = [
            { label: 'COORDINATES', value: geoInfo.coords },
            { label: 'ELEVATION', value: geoInfo.elevation },
            { label: 'REGION', value: geoInfo.region },
            { label: 'CLIMATE', value: geoInfo.climate },
            { label: 'POPULATION', value: geoInfo.population || 'N/A' },
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
            
            setTimeout(() => {
                div.classList.add('visible');
                this.typewriterEffect(`geoValue${i}`, item.value, 40);
            }, i * 350);
        });
        
        geoInfo.facts.forEach((fact, i) => {
            const div = document.createElement('div');
            div.className = 'geo-item right-panel';
            div.innerHTML = `<div class="geo-fact" id="geoFact${i}"></div>`;
            rightContent.appendChild(div);
            
            setTimeout(() => {
                div.classList.add('visible');
                this.typewriterEffect(`geoFact${i}`, `• ${fact}`, 25);
            }, 2500 + (i * 600));
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
    
    // ========================================
    // TERRAIN INITIALIZATION
    // ========================================
    // Sets up the 3D scene, camera, and particle grid
    // ========================================
    initOptimizedTerrainSystem() {
        const canvas = this.elements.terrainCanvas;
        
        try {
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            // ========================================
            // SCENE SETUP
            // ========================================
            this.threeScene = new THREE.Scene();
            this.threeScene.fog = new THREE.Fog(0x111111, 15000, 20000);
            
            // ========================================
            // CAMERA CONFIGURATION
            // ========================================
            this.threeCamera = new THREE.PerspectiveCamera(
                this.shouldUseOptimizedMode ? 8 : 10,
                canvas.width / canvas.height,
                0.1,
                this.shouldUseOptimizedMode ? 100000 : 200000
            );
            this.threeCamera.position.set(0, 8000, -15000);
            
            // Store initial camera position for smooth transitions
            this.cameraStartPosition = { x: 0, y: 8000, z: -15000 };
            this.cameraTargetPosition = { x: 0, y: 8000, z: -15000 };
            
            // ========================================
            // RENDERER SETUP
            // ========================================
            this.threeRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.shouldUseOptimizedMode,
                alpha: true,
                powerPreference: this.shouldUseOptimizedMode ? "low-power" : "high-performance"
            });
            this.threeRenderer.setSize(canvas.width, canvas.height);
            this.threeRenderer.setClearColor(0x000000, 0);
            this.threeRenderer.shadowMap.enabled = false;
            
            // ========================================
            // ORBIT CONTROLS
            // ========================================
            if (THREE.OrbitControls) {
                this.threeControls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
                this.threeControls.autoRotate = true;
                this.threeControls.autoRotateSpeed = 0.08;
                this.threeControls.enableDamping = true;
                this.threeControls.dampingFactor = 0.05;
                this.threeControls.minDistance = 5000;
                this.threeControls.maxDistance = 30000;
            }
            
            // ========================================
            // CREATE TERRAIN GRID
            // ========================================
            this.createOptimizedTerrain();
            
            // ========================================
            // START ANIMATION LOOP
            // ========================================
            this.animateTerrain();
            
            // ========================================
            // LOAD FIRST TERRAIN
            // ========================================
            this.loadNextTerrain(this.currentTerrainKey);
            
            console.log('[ANIMATIONS] Optimized terrain system initialized');
            
        } catch (error) {
            console.error('Terrain system error:', error);
            this.initTerrainFallback(canvas);
        }
    }
    
    // ========================================
    // TERRAIN GRID CREATION
    // ========================================
    // Creates the particle grid with optimized vertex management
    // ========================================
    createOptimizedTerrain() {
        // ========================================
        // GRID DIMENSIONS
        // ========================================
        const totalX = this.shouldUseOptimizedMode ? 100 : 120;
        const totalZ = this.shouldUseOptimizedMode ? 100 : 120;
        this.particleDistance = 30;
        
        // ========================================
        // PARTICLE BUFFER ALLOCATION
        // ========================================
        const particleCount = totalX * totalZ;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        this.pointsPlot = [];
        let index = 0;
        
        // ========================================
        // POPULATE VERTEX GRID
        // ========================================
        for (let x = 0; x < totalX; x++) {
            const xplot = x - Math.round((totalX - 1) / 2);
            const zArray = [];
            
            for (let z = 0; z < totalZ; z++) {
                const zplot = z - Math.round((totalZ - 1) / 2);
                
                // Position
                positions[index * 3] = x * this.particleDistance - this.particleDistance * (totalX - 1) / 2;
                positions[index * 3 + 1] = 0;
                positions[index * 3 + 2] = z * this.particleDistance - this.particleDistance * (totalZ - 1) / 2;
                
                // Initial color (white)
                colors[index * 3] = 1.0;
                colors[index * 3 + 1] = 1.0;
                colors[index * 3 + 2] = 1.0;
                
                // Store vertex data with transition properties
                zArray[zplot] = {
                    x: xplot,
                    z: zplot,
                    index: index,
                    targetY: 0,
                    currentY: 0,
                    transitionStart: 0,
                    transitionTarget: 0,
                    inTransition: false,
                    velocity: 0,
                    delay: Math.random() * 200
                };
                index++;
            }
            this.pointsPlot[xplot] = zArray;
        }
        
        // ========================================
        // GEOMETRY SETUP
        // ========================================
        this.mountainGeometry = new THREE.BufferGeometry();
        this.mountainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.mountainGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        // ========================================
        // MATERIAL WITH COLOR SUPPORT
        // ========================================
        const material = new THREE.PointsMaterial({
            size: this.shouldUseOptimizedMode ? 1.2 : 1.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
        
        // ========================================
        // CREATE PARTICLE SYSTEM
        // ========================================
        this.mountainParticles = new THREE.Points(this.mountainGeometry, material);
        this.mountainParticles.position.y = -500;
        this.threeScene.add(this.mountainParticles);
    }
    
    // ========================================
    // TERRAIN LOADING WITH SMOOTH TRANSITIONS
    // ========================================
    // Loads new terrain data and initiates smooth morphing
    // ========================================
    async loadNextTerrain(terrainKey = null) {
        // ========================================
        // VALIDATE REQUEST
        // ========================================
        if (this.terrainTransition.inProgress) {
            console.log('[TERRAIN] Transition in progress, ignoring request');
            return;
        }
        
        const key = terrainKey || this.currentTerrainKey;
        const location = this.terrainLocations[key];
        
        if (!location) {
            console.error(`Terrain not found: ${key}`);
            return;
        }
        
        // ========================================
        // UPDATE CURRENT TERRAIN
        // ========================================
        this.currentTerrainKey = key;
        console.log(`[TERRAIN] Loading terrain: ${location.label}`);
        
        // ========================================
        // UPDATE UI ELEMENTS
        // ========================================
        if (this.elements.terrainLocation) {
            this.elements.terrainLocation.textContent = location.label;
        }
        
        const selector = document.getElementById('terrainSelector');
        if (selector && selector.value !== key) {
            selector.value = key;
        }
        
        // ========================================
        // MARK TRANSITION AS ACTIVE
        // ========================================
        this.terrainTransition.inProgress = true;
        
        // ========================================
        // DISPLAY GEOGRAPHIC INFO
        // ========================================
        this.displayGeoInfo(location.geoInfo);
        
        // ========================================
        // ANIMATE CAMERA TO NEW VIEW
        // ========================================
        this.animateCameraTransition();
        
        // ========================================
        // LOAD TERRAIN DATA
        // ========================================
        try {
            const response = await fetch(`${this.baseURL}_terrain/${location.name}.json?v=2`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.processTerrainDataWithTransition(data);
            
        } catch (error) {
            console.error(`Error loading terrain ${location.name}:`, error);
            this.terrainTransition.inProgress = false;
        }
    }
    
    // ========================================
    // CAMERA TRANSITION ANIMATION
    // ========================================
    // Smoothly moves camera for cinematic effect
    // ========================================
    animateCameraTransition() {
        if (!this.threeCamera) return;
        
        // ========================================
        // SETUP CAMERA MOVEMENT
        // ========================================
        this.cameraTransition.active = true;
        this.cameraTransition.startTime = Date.now();
        
        // Store current position
        this.cameraTransition.startPos = {
            x: this.threeCamera.position.x,
            y: this.threeCamera.position.y,
            z: this.threeCamera.position.z
        };
        
        // Calculate new dynamic position based on terrain
        const variation = (Math.random() - 0.5) * 3000;
        this.cameraTransition.targetPos = {
            x: variation,
            y: 8000 + (Math.random() - 0.5) * 2000,
            z: -15000 + (Math.random() - 0.5) * 2000
        };
        
        console.log('[TERRAIN] Starting camera transition');
    }
    
    // ========================================
    // UPDATE CAMERA POSITION
    // ========================================
    // Called each frame to smoothly interpolate camera
    // ========================================
    updateCameraTransition() {
        if (!this.cameraTransition.active || !this.threeCamera) return;
        
        const elapsed = Date.now() - this.cameraTransition.startTime;
        const progress = Math.min(elapsed / this.cameraTransition.duration, 1);
        
        // ========================================
        // SMOOTH EASING FUNCTION
        // ========================================
        // Ease in-out cubic for smooth start and end
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        // ========================================
        // INTERPOLATE POSITION
        // ========================================
        this.threeCamera.position.x = this.cameraTransition.startPos.x + 
            (this.cameraTransition.targetPos.x - this.cameraTransition.startPos.x) * eased;
        this.threeCamera.position.y = this.cameraTransition.startPos.y + 
            (this.cameraTransition.targetPos.y - this.cameraTransition.startPos.y) * eased;
        this.threeCamera.position.z = this.cameraTransition.startPos.z + 
            (this.cameraTransition.targetPos.z - this.cameraTransition.startPos.z) * eased;
        
        // ========================================
        // END TRANSITION
        // ========================================
        if (progress >= 1) {
            this.cameraTransition.active = false;
            console.log('[TERRAIN] Camera transition complete');
        }
    }
    
    // ========================================
    // PROCESS TERRAIN DATA
    // ========================================
    // Initiates smooth morphing animation to new heights
    // ========================================
    processTerrainDataWithTransition(data) {
        if (!this.mountainParticles || !data.coords) return;
        
        const startTime = Date.now();
        
        // ========================================
        // SETUP VERTEX TRANSITIONS
        // ========================================
        data.coords.forEach(coord => {
            const [x, y, z] = coord;
            
            if (this.pointsPlot[x]?.[z]) {
                const vertex = this.pointsPlot[x][z];
                const targetY = (y - (data.lowest_point || 0)) * this.particleDistance * 0.8;
                
                // Initialize transition properties
                vertex.transitionStart = vertex.currentY;
                vertex.transitionTarget = targetY;
                vertex.inTransition = true;
                vertex.transitionStartTime = startTime + vertex.delay;
                vertex.velocity = 0;
            }
        });
        
        // ========================================
        // CONFIGURE TRANSITION TIMING
        // ========================================
        this.terrainTransition.startTime = startTime;
        this.terrainTransition.duration = 2500;
        
        console.log('[TERRAIN] Starting smooth terrain morphing animation');
    }
    
    // ========================================
    // UPDATE TERRAIN TRANSITION
    // ========================================
    // Called each frame to animate vertex positions
    // ========================================
    updateTerrainTransition() {
        if (!this.terrainTransition.inProgress || !this.mountainGeometry) return;
        
        const positions = this.mountainGeometry.getAttribute('position').array;
        const colors = this.mountainGeometry.getAttribute('color').array;
        const currentTime = Date.now();
        
        let needsUpdate = false;
        let allComplete = true;
        
        // ========================================
        // UPDATE ALL VERTICES IN TRANSITION
        // ========================================
        for (let x in this.pointsPlot) {
            for (let z in this.pointsPlot[x]) {
                const vertex = this.pointsPlot[x][z];
                
                if (vertex.inTransition) {
                    // Check if this vertex's delayed start time has arrived
                    if (currentTime < vertex.transitionStartTime) {
                        allComplete = false;
                        continue;
                    }
                    
                    const elapsed = currentTime - vertex.transitionStartTime;
                    const progress = Math.min(elapsed / this.terrainTransition.duration, 1);
                    
                    // ========================================
                    // SMOOTH EASING WITH MOMENTUM
                    // ========================================
                    // Use ease-out-cubic for natural deceleration
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    
                    // Calculate target position with easing
                    const targetY = vertex.transitionStart + 
                                  (vertex.transitionTarget - vertex.transitionStart) * easeOut;
                    
                    // Add slight overshoot and settle for organic feel
                    const overshoot = Math.sin(progress * Math.PI) * 0.02;
                    const finalY = targetY * (1 + overshoot);
                    
                    // ========================================
                    // UPDATE POSITION
                    // ========================================
                    positions[vertex.index * 3 + 1] = finalY;
                    vertex.currentY = finalY;
                    
                    // ========================================
                    // COLOR FADE EFFECT
                    // ========================================
                    // Fade through blue during transition
                    const fadeProgress = Math.sin(progress * Math.PI);
                    colors[vertex.index * 3] = 1.0 - (fadeProgress * 0.3);
                    colors[vertex.index * 3 + 1] = 1.0 - (fadeProgress * 0.2);
                    colors[vertex.index * 3 + 2] = 1.0;
                    
                    needsUpdate = true;
                    
                    // ========================================
                    // MARK AS COMPLETE
                    // ========================================
                    if (progress >= 1) {
                        vertex.inTransition = false;
                        vertex.targetY = vertex.transitionTarget;
                        // Reset color to white
                        colors[vertex.index * 3] = 1.0;
                        colors[vertex.index * 3 + 1] = 1.0;
                        colors[vertex.index * 3 + 2] = 1.0;
                    } else {
                        allComplete = false;
                    }
                }
            }
        }
        
        // ========================================
        // APPLY UPDATES TO GPU
        // ========================================
        if (needsUpdate) {
            this.mountainGeometry.getAttribute('position').needsUpdate = true;
            this.mountainGeometry.getAttribute('color').needsUpdate = true;
        }
        
        // ========================================
        // END TRANSITION WHEN ALL COMPLETE
        // ========================================
        if (allComplete) {
            this.terrainTransition.inProgress = false;
            console.log('[TERRAIN] Terrain transition complete');
        }
    }
    
    // ========================================
    // TERRAIN ANIMATION LOOP
    // ========================================
    // Main render loop for terrain visualization
    // ========================================
    animateTerrain() {
        // ========================================
        // CHECK IF SHOULD CONTINUE
        // ========================================
        if (!this.threeRenderer || this.currentPhase !== 3 || this.introSkipped) {
            if (this.terrainAnimationFrame) {
                cancelAnimationFrame(this.terrainAnimationFrame);
                this.terrainAnimationFrame = null;
            }
            return;
        }
        
        // ========================================
        // REQUEST NEXT FRAME
        // ========================================
        this.terrainAnimationFrame = requestAnimationFrame(() => this.animateTerrain());
        
        // ========================================
        // UPDATE CONTROLS
        // ========================================
        this.threeControls?.update();
        
        // ========================================
        // UPDATE CAMERA TRANSITION
        // ========================================
        if (this.cameraTransition.active) {
            this.updateCameraTransition();
        }
        
        // ========================================
        // UPDATE TERRAIN MORPHING
        // ========================================
        if (this.terrainTransition.inProgress) {
            this.updateTerrainTransition();
        }
        
        // ========================================
        // SUBTLE AMBIENT ROTATION
        // ========================================
        if (this.mountainParticles && !this.cameraTransition.active) {
            this.mountainParticles.rotation.y += 0.0002;
        }
        
        // ========================================
        // RENDER SCENE
        // ========================================
        if (this.threeScene && this.threeCamera) {
            this.threeRenderer.render(this.threeScene, this.threeCamera);
        }
    }
    
    animateGlobeData() {
        const coordsEl = document.getElementById('globeCoords');
        const sectorEl = document.getElementById('globeSector');
        const elevEl = document.getElementById('globeElev');
        const terrainEl = document.getElementById('globeTerrain');
        
        const updateFromCurrentTerrain = () => {
            if (this.introSkipped || this.currentPhase !== 3) return;
            
            const location = this.terrainLocations[this.currentTerrainKey];
            if (!location) return;
            
            if (coordsEl) coordsEl.textContent = location.geoInfo.coords;
            if (sectorEl) sectorEl.textContent = location.label;
            if (elevEl) elevEl.textContent = location.geoInfo.elevation;
            if (terrainEl) terrainEl.textContent = location.geoInfo.climate;
            
            setTimeout(updateFromCurrentTerrain, 2000);
        };
        
        setTimeout(updateFromCurrentTerrain, 1000);
    }

    // ========================================
    // PHASE 4: ETHEREAL WHITE BRAIN VISUALIZATION
    // ========================================
    
    async playStellarPhase4() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 4: Ethereal White Brain Visualization');
            this.currentPhase = 4;
            
            const phaseBody = this.elements.phaseBody;
            if (!phaseBody) return resolve();
            
            phaseBody.classList.add('active');
            
            setTimeout(() => this.playSFX('affirmation'), 1500);
            
            if (this.elements.brainCanvas && window.THREE) {
                this.initBrainVisualization();
            }
            
            this.createBrainInfoPanel();
            this.animateScanItems();
            
            setTimeout(() => this.displayBrainTechnicalInfo(), 2000);
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playAudio(this.stellarAudio.voiceDataUser);
                
                if (this.stellarAudio.voiceDataUser) {
                    this.stellarAudio.voiceDataUser.addEventListener('timeupdate', () => this.updateSubtitlesPhase4());
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
    
    updateSubtitlesPhase4() {
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
    }
    
    initBrainVisualization() {
        const canvas = this.elements.brainCanvas;
        
        try {
            canvas.width = canvas.offsetWidth || window.innerWidth;
            canvas.height = canvas.offsetHeight || window.innerHeight;
            
            // Scene setup
            this.brainScene = new THREE.Scene();
            this.brainScene.background = new THREE.Color(0x000000);
            
            // Camera setup
            this.brainCamera = new THREE.PerspectiveCamera(
                45,
                canvas.width / canvas.height,
                0.1,
                5000
            );
            this.brainCamera.position.set(0, 80, 250);
            
            // Renderer
            this.brainRenderer = new THREE.WebGLRenderer({
                canvas: canvas,
                antialias: !this.shouldUseOptimizedMode,
                alpha: true,
                powerPreference: this.shouldUseOptimizedMode ? "low-power" : "high-performance"
            });
            this.brainRenderer.setSize(canvas.width, canvas.height);
            this.brainRenderer.setClearColor(0x000000, 0);
            this.brainRenderer.shadowMap.enabled = true;
            this.brainRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Controls
            if (THREE.OrbitControls) {
                this.brainControls = new THREE.OrbitControls(this.brainCamera, this.brainRenderer.domElement);
                this.brainControls.enableDamping = true;
                this.brainControls.dampingFactor = 0.05;
                this.brainControls.autoRotate = true;
                this.brainControls.autoRotateSpeed = 0.15;
                this.brainControls.enableZoom = true;
                this.brainControls.minDistance = 150;
                this.brainControls.maxDistance = 400;
                this.brainControls.enablePan = false;
            }
            
            // Lighting setup for ethereal effect
            this.setupEtherealBrainLighting();
            
            // Create ethereal white brain material
            this.createEtherealBrainMaterial();
            
            // Load brain model
            const modelPath = this.shouldUseOptimizedMode ? 
                this.brainModels.low : 
                this.brainModels.complete;
            
            this.loadEtherealBrainModel(modelPath);
            
            // Create ethereal effects
            this.createEtherealEffects();
            
            // Start animation
            this.animateBrain();
            
            console.log('[ANIMATIONS] Ethereal brain visualization initialized');
            
        } catch (error) {
            console.error('Brain visualization error:', error);
            this.initBrainFallback(canvas);
        }
    }
    
    setupEtherealBrainLighting() {
        // Clear scene first
        while(this.brainScene.children.length > 0){ 
            this.brainScene.remove(this.brainScene.children[0]); 
        }
        
        // Soft ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.brainScene.add(ambientLight);
        
        // Soft directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(50, 100, 50);
        this.brainScene.add(directionalLight);
        
        // Back light for rim effect
        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 0, -100);
        this.brainScene.add(backLight);
        
        // Point lights for magical glow
        const pointLight1 = new THREE.PointLight(0xffffff, 0.4, 150);
        pointLight1.position.set(50, 30, 50);
        this.brainScene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 150);
        pointLight2.position.set(-50, -30, -50);
        this.brainScene.add(pointLight2);
    }
    
    createEtherealBrainMaterial() {
        // Ethereal white material - very transparent
        this.brainMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,           // Pure white
            transparent: true,
            opacity: 0.3,              // Very transparent for ethereal look
            shininess: 100,            // High shininess for glossy look
            specular: 0xffffff,        // White specular
            side: THREE.DoubleSide
        });
        
        // Add emissive property for glow
        this.brainMaterial.emissive = new THREE.Color(0x444444);
        this.brainMaterial.emissiveIntensity = 0.2;
        
        // Enable wireframe for more ethereal look
        this.brainMaterial.wireframe = true;
        this.brainMaterial.wireframeLinewidth = 0.5;
    }
    
    loadEtherealBrainModel(modelPath) {
        const loader = new THREE.OBJLoader();
        
        loader.load(
            modelPath,
            (object) => {
                // Clear existing brain mesh
                if (this.brainMesh) {
                    this.brainScene.remove(this.brainMesh);
                    this.cleanupMesh(this.brainMesh);
                }
                
                // Apply ethereal material to all parts
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = this.brainMaterial;
                        child.castShadow = false; // No shadows for ethereal look
                        child.receiveShadow = false;
                        
                        // Store reference for animation
                        const regionId = `region_${Object.keys(this.brainRegions).length}`;
                        this.brainRegions[regionId] = {
                            mesh: child,
                            material: this.brainMaterial,
                            originalOpacity: 0.3,
                            pulseIntensity: 0,
                            highlighted: false
                        };
                    }
                });
                
                // Center and scale the model
                const box = new THREE.Box3().setFromObject(object);
                const center = box.getCenter(new THREE.Vector3());
                object.position.sub(center);
                
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 180 / maxDim;
                object.scale.setScalar(scale);
                
                // Position for better view
                object.position.y = -20;
                
                this.brainMesh = object;
                this.brainScene.add(object);
                
                console.log(`[SUCCESS] Ethereal brain model loaded: ${modelPath}`);
            },
            (progress) => {
                console.log(`Loading brain: ${Math.round((progress.loaded / progress.total) * 100)}%`);
            },
            (error) => {
                console.error('Error loading brain model:', error);
                this.createEtherealFallbackBrain();
            }
        );
    }
    
    createEtherealEffects() {
        // Create neural energy particles
        this.createNeuralEnergyParticles();
        
        // Create neural connection lines
        this.createNeuralConnections();
        
        // Create aura effect
        this.createAuraEffect();
    }
    
    createNeuralEnergyParticles() {
        const particleCount = this.shouldUseOptimizedMode ? 800 : 1500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position in a spherical shell around the brain
            const radius = 60 + Math.random() * 60;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.cos(phi);
            positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            // Pure white with slight variation
            const brightness = 0.8 + Math.random() * 0.2;
            colors[i * 3] = brightness;     // R
            colors[i * 3 + 1] = brightness; // G
            colors[i * 3 + 2] = brightness; // B
            
            // Random size
            sizes[i] = 0.5 + Math.random() * 1.5;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
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
    
    createNeuralConnections() {
        const connectionCount = this.shouldUseOptimizedMode ? 200 : 400;
        const linesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(connectionCount * 6); // 2 points per line
        
        for (let i = 0; i < connectionCount; i++) {
            // Create random start and end points
            const radius = 50 + Math.random() * 40;
            const theta1 = Math.random() * Math.PI * 2;
            const phi1 = Math.random() * Math.PI;
            const theta2 = theta1 + (Math.random() - 0.5) * 0.5;
            const phi2 = phi1 + (Math.random() - 0.5) * 0.5;
            
            positions[i * 6] = radius * Math.sin(phi1) * Math.cos(theta1);
            positions[i * 6 + 1] = radius * Math.cos(phi1);
            positions[i * 6 + 2] = radius * Math.sin(phi1) * Math.sin(theta1);
            
            positions[i * 6 + 3] = radius * Math.sin(phi2) * Math.cos(theta2);
            positions[i * 6 + 4] = radius * Math.cos(phi2);
            positions[i * 6 + 5] = radius * Math.sin(phi2) * Math.sin(theta2);
        }
        
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            linewidth: 1
        });
        
        this.neuralConnections = new THREE.LineSegments(linesGeometry, lineMaterial);
        this.brainScene.add(this.neuralConnections);
    }
    
    createAuraEffect() {
        // Create a subtle glow sphere around the brain
        const auraGeometry = new THREE.SphereGeometry(90, 32, 32);
        const auraMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            wireframe: true
        });
        
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        this.brainScene.add(aura);
    }
    
    startBrainHighlightSequence() {
        const regions = Object.keys(this.brainRegions);
        if (regions.length === 0) return;
        
        let currentRegion = 0;
        
        const animateHighlights = () => {
            if (this.introSkipped || this.currentPhase !== 4) return;
            
            // Reset all regions
            regions.forEach(regionId => {
                const region = this.brainRegions[regionId];
                if (region) {
                    region.highlighted = false;
                    region.pulseIntensity = 0;
                    region.material.opacity = region.originalOpacity;
                    region.material.emissiveIntensity = 0.2;
                }
            });
            
            // Highlight current region
            const currentRegionId = regions[currentRegion];
            const region = this.brainRegions[currentRegionId];
            if (region) {
                region.highlighted = true;
            }
            
            // Update UI scan items
            const scanItems = document.querySelectorAll('.scan-item');
            if (scanItems[currentRegion]) {
                const regionNames = ['Frontal Cortex', 'Parietal Lobe', 'Temporal Lobe', 
                                   'Occipital Lobe', 'Cerebellum', 'Brainstem'];
                const regionName = regionNames[currentRegion % regionNames.length];
                scanItems[currentRegion].querySelector('.scan-text').textContent = 
                    `${regionName}: ACTIVE`;
                scanItems[currentRegion].querySelector('.scan-dot').classList.add('success');
                
                // Reset previous after delay
                if (currentRegion > 0) {
                    setTimeout(() => {
                        scanItems[currentRegion - 1].querySelector('.scan-dot').classList.remove('success');
                    }, 1000);
                }
            }
            
            // Move to next region every 3 seconds
            currentRegion = (currentRegion + 1) % regions.length;
            
            setTimeout(animateHighlights, 3000);
        };
        
        setTimeout(animateHighlights, 1000);
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
        
        // Update controls
        this.brainControls?.update();
        
        const time = Date.now() * 0.001;
        
        // Animate brain particles
        if (this.brainParticles) {
            const positions = this.brainParticles.geometry.attributes.position.array;
            const particleCount = positions.length / 3;
            
            for (let i = 0; i < particleCount; i++) {
                const index = i * 3;
                
                // Gentle floating animation
                const speed = 0.02 + (i % 10) * 0.005;
                positions[index + 1] += Math.sin(time * speed + i) * 0.02;
                
                // Subtle rotation
                const radius = Math.sqrt(
                    positions[index] * positions[index] + 
                    positions[index + 2] * positions[index + 2]
                );
                const angle = Math.atan2(positions[index + 2], positions[index]);
                positions[index] = radius * Math.cos(angle + 0.0005);
                positions[index + 2] = radius * Math.sin(angle + 0.0005);
            }
            
            this.brainParticles.geometry.attributes.position.needsUpdate = true;
        }
        
        // Animate neural connections
        if (this.neuralConnections) {
            const positions = this.neuralConnections.geometry.attributes.position.array;
            const connectionCount = positions.length / 6;
            
            for (let i = 0; i < connectionCount; i++) {
                const index = i * 6;
                
                // Pulsing effect on connections
                const pulse = Math.sin(time * 2 + i * 0.1) * 0.1 + 0.9;
                if (this.neuralConnections.material) {
                    this.neuralConnections.material.opacity = 0.15 * pulse;
                }
            }
        }
        
        // Animate highlighted regions
        Object.values(this.brainRegions).forEach(region => {
            if (region.highlighted) {
                // Pulsing glow effect for highlighted region
                const pulse = Math.sin(time * 3) * 0.15 + 0.85;
                region.material.opacity = region.originalOpacity * pulse * 1.5;
                region.material.emissiveIntensity = 0.2 + (pulse * 0.3);
            } else {
                // Subtle breathing effect for all regions
                const breath = Math.sin(time * 0.5 + region.mesh.id * 0.1) * 0.05 + 0.95;
                region.material.opacity = region.originalOpacity * breath;
            }
        });
        
        // Global ethereal pulse
        const globalPulse = Math.sin(time * 0.3) * 0.1 + 0.9;
        if (this.brainMaterial) {
            this.brainMaterial.opacity = 0.3 * globalPulse;
        }
        
        // Render
        if (this.brainScene && this.brainCamera) {
            this.brainRenderer.render(this.brainScene, this.brainCamera);
        }
    }
    
    createEtherealFallbackBrain() {
        console.log('[ANIMATIONS] Creating ethereal fallback brain');
        
        const group = new THREE.Group();
        
        // Main brain hemispheres - very transparent
        const brainGeometry = new THREE.SphereGeometry(60, 32, 24);
        const brainMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25, // Very transparent
            shininess: 100,
            specular: 0xffffff,
            wireframe: true,
            wireframeLinewidth: 0.5
        });
        
        const leftHemisphere = new THREE.Mesh(brainGeometry, brainMaterial);
        leftHemisphere.position.x = -30;
        group.add(leftHemisphere);
        
        const rightHemisphere = new THREE.Mesh(brainGeometry, brainMaterial);
        rightHemisphere.position.x = 30;
        group.add(rightHemisphere);
        
        // Cerebellum
        const cerebellumGeometry = new THREE.SphereGeometry(25, 16, 12);
        const cerebellum = new THREE.Mesh(cerebellumGeometry, brainMaterial);
        cerebellum.position.y = -40;
        cerebellum.position.z = 10;
        group.add(cerebellum);
        
        // Position
        group.position.y = -20;
        
        this.brainMesh = group;
        this.brainScene.add(group);
        
        // Store as single region
        this.brainRegions['fallback'] = {
            mesh: group,
            material: brainMaterial,
            originalOpacity: 0.25,
            pulseIntensity: 0,
            highlighted: false
        };
        
        this.brainMaterial = brainMaterial;
        
        // Create ethereal effects for fallback too
        this.createEtherealEffects();
        
        console.log('[ANIMATIONS] Ethereal fallback brain created');
    }
    
    cleanupMesh(mesh) {
        if (!mesh) return;
        
        mesh.traverse(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
    }
    
    createBrainInfoPanel() {
        const bodyContainer = document.querySelector('.body-container');
        if (!bodyContainer) return;
        
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
    
    displayBrainTechnicalInfo() {
        const content = document.getElementById('brainTechContent');
        const panel = document.getElementById('brainTechInfo');
        
        if (!content) return;
        
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
                if (this.introSkipped) return;
                div.classList.add('visible');
                this.typewriterEffect(`brainVal${i}`, info.value, 25);
            }, info.delay);
        });
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
    // PHASE 5: BOARDING PASS
    // ========================================
    
    async playStellarPhase5() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 5: Boarding Pass');
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
        
        document.addEventListener('keydown', this.skipHandler.bind(this));
        document.addEventListener('keyup', this.skipKeyUpHandler.bind(this));
    }
    
    startSkipHold(skipBar, skipIndicator) {
        this.isHoldingSpace = true;
        this.skipHoldProgress = 0;
        
        skipIndicator?.classList.add('holding');
        
        const holdDuration = 2500;
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
        
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        this.stopAllAudio();

    // ========================================
    // CLEANUP METHODS
    // ========================================
        this.cleanupTerrain();
        this.cleanupBrain();
        this.transitionFromStellarToMain();
    }

    // ========================================
    // TRANSITION AND CLEANUP
    // ========================================
    
    transitionFromStellarToMain() {
        console.log('[ANIMATIONS] Transitioning to main...');
        
        this.cleanupSkipFunctionality();
        
        this.fadeOutMusic(1200);
        
        const stellarIntro = this.elements.stellarIntro;
        stellarIntro?.classList.add('fade-out');
        
        setTimeout(() => {
            if (stellarIntro) stellarIntro.style.display = 'none';
            
            this.showMainContent();
            this.performFinalCleanup();
            
            console.log('[ANIMATIONS] Intro complete, transition finished');
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

    // ========================================
    // CLEANUP METHODS
    // ========================================
        this.cleanupTerrain();
        this.cleanupBrain();
        
        if (this.terrainInterval) {
            clearInterval(this.terrainInterval);
            this.terrainInterval = null;
        }
    }

    // ========================================
    // CLEANUP FUNCTIONS
    // ========================================
    
    cleanupBrain() {
        if (this.brainAnimationFrame) {
            cancelAnimationFrame(this.brainAnimationFrame);
            this.brainAnimationFrame = null;
        }
        
        if (this.brainMesh) {
            this.brainScene?.remove(this.brainMesh);
            this.cleanupMesh(this.brainMesh);
            this.brainMesh = null;
        }
        
        if (this.brainParticles) {
            this.brainScene?.remove(this.brainParticles);
            this.brainParticles.geometry.dispose();
            this.brainParticles.material.dispose();
            this.brainParticles = null;
        }
        
        if (this.neuralConnections) {
            this.brainScene?.remove(this.neuralConnections);
            this.neuralConnections.geometry.dispose();
            this.neuralConnections.material.dispose();
            this.neuralConnections = null;
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
        this.brainRegions = {};
        
        console.log('[ANIMATIONS] Brain cleanup complete');
    }
    

    // ========================================
    // CLEANUP METHODS
    // ========================================
    cleanupTerrain() {
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
        this.terrainTransition.inProgress = false;
        
        console.log('[ANIMATIONS] Terrain cleanup complete');
    }

    // ========================================
    // FALLBACK FUNCTIONS
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
            speedX: (Math.random() - 0.5) * 0.2,
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
        
        const nodes = Array(nodeCount).fill().map((_, i) => {
            const angle = (i / nodeCount) * Math.PI * 2;
            const radius = 120 + Math.random() * 60;
            return {
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                size: 2 + Math.random() * 3,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: 0.6 + Math.random() * 1.0,
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
            
            // Draw ethereal connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const distance = Math.sqrt(
                        Math.pow(nodes[i].x - nodes[j].x, 2) + 
                        Math.pow(nodes[i].y - nodes[j].y, 2)
                    );
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance/100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            
            // Draw nodes
            nodes.forEach(node => {
                node.pulse += node.pulseSpeed * 0.015;
                const pulseScale = 1 + Math.sin(node.pulse) * 0.25;
                
                const size = node.size * (node.isHighlighted ? 1.5 : 1);
                const opacity = node.isHighlighted ? 0.4 : 0.2; // More transparent
                
                // Ethereal glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, size * pulseScale * 2, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, size * pulseScale * 2
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.5})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Center point
                ctx.beginPath();
                ctx.arc(node.x, node.y, size * pulseScale * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    // ========================================
    // UTILITY FUNCTIONS
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
        console.log('[ANIMATIONS] Destroying AnimationsManager...');
        
        this.animationQueue = [];
        this.rafCallbacks.clear();
        this.isAnimating = false;
        
        this.stopAllAudio();

    // ========================================
    // CLEANUP METHODS
    // ========================================
        this.cleanupTerrain();
        this.cleanupBrain();
        this.cleanupSkipFunctionality();
        
        this.initialized = false;
        console.log('[ANIMATIONS] AnimationsManager destroyed');
    }
}

// Export and instantiate
const animationsManager = new AnimationsManager();
export { animationsManager };
window.animationsManager = animationsManager;
export default animationsManager;