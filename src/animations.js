/**
 * ============================
 * ANIMATIONS MANAGER MODULE V9
 * ============================
 * Handles all animations and visual effects
 * - Stellar Intro sequence (5 phases)
 * - 3D Terrain visualization
 * - Earth Catastrophe visualization (replaces Chicago)
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
        
        // Voice audio control - prevent overlapping
        this.currentVoiceAudio = null;
        this.isVoicePlaying = false;
        
        // Volume levels
        this.volumes = {
            bgMusic: 0.25,
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
            { start: 0.0, end: 7.0, text: "It's been a long time, isn't it? Your body has been offline for a long time, Skye." },
            { start: 7.0, end: 18.0, text: "Muscles idle, senses dormant, systems suspended in silence. Waking up after stasis is never clean." },
            { start: 18.0, end: 25.0, text: "Your reflexes may feel delayed, your thoughts sharper than your movements. That imbalance will pass." },
            { start: 25.0, end: 30.0, text: "Your mind, however, never fully shut down. Creative activity persisted beneath the surface." }
        ];
        
        this.subtitlesRecoveryProtocol = [
            { start: 0.04, end: 0.08, text: "Recovery protocols exceeded biological thresholds." },
            { start: 0.08, end: 0.12, text: "Preservation required non-organic intervention." },
            { start: 0.12, end: 0.16, text: "Consciousness was extracted, mapped, and stabilized." },
            { start: 0.16, end: 0.19, text: "Result, a fully resolved digital engram." },
            { start: 0.19, end: 0.23, text: "Organic systems were deemed non-viable for reintegration." },
            { start: 0.23, end: 0.26, text: "Human continuity was not maintained." },
            { start: 0.26, end: 0.28, text: "Cognitive structure intact." },
            { start: 0.28, end: 0.30, text: "Identity preserved." },
            { start: 0.30, end: 0.32, text: "Memory capacity expanded." },
            { start: 0.32, end: 0.34, text: "Processing latency reduced to near zero." }
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
            duration: 1500  // Faster, smoother like GSAP
        };
        
        // Camera transition state
        this.cameraTransition = {
            active: false,
            startTime: 0,
            duration: 1800,  // Smooth camera movement
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
        
        this.currentTerrainKey = 'franzjosefglacier';
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
        
        // Survivor Audio
        this.survivorAudio = {
            voices: {}, // Almacenará múltiples audios de voces por ID de mensaje
            bcommsOn: null,
            lifesupportOn: null
        };
        this.survivorAudioPlaying = false;
        this.currentPlayingAudio = null; // Track which audio is currently playing
        
        // EARTH EARTHQUAKE VISUALIZATION SYSTEM
        this.earthViz = null;
        this.earthActive = false;
        
        // Brain 3D model paths
        this.brainModels = {
            'complete': 'src/model_3d/brain-antre.obj',
            'low': 'src/model_3d/brain_vertex_low.obj',
            'parts_assembled': 'src/model_3d/brain-parts-big.obj',
            'parts_separated': {
                'part04': 'src/model_3d/brain-parts-big_04.OBJ',
                'part06': 'src/model_3d/brain-parts-big_06.OBJ',
                'part07': 'src/model_3d/brain-parts-big_07.OBJ',
                'part08': 'src/model_3d/brain-parts-big_08.OBJ'
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
            console.log('[ANIMATIONS] Already initialized, skipping');
            return;
        }
        
        console.log('[ANIMATIONS] Animations Manager V9 Earth Catastrophe initializing');
        console.log('[DEVICE] Mode:', this.shouldUseOptimizedMode ? 'Optimized' : 'Full');
        
        this.cacheElements();

        if (!this.elements.stellarIntro) {
            console.error('[ERROR] stellarIntro element not found');
            return;
        }

        console.log('[ANIMATIONS] Starting Stellar Intro V9 Earth Catastrophe');
        
        setTimeout(() => {
            this.startStellarIntro();
        }, 1000);

        this.initialized = true;
        console.log('[ANIMATIONS] Animations Manager V9 Earth Catastrophe initialized');
    }
    
    cacheElements() {
        this.elements = {
            stellarIntro: document.getElementById('stellarIntro'),
            skipIndicator: document.getElementById('skipIndicator'),
            
            phaseVoice: document.getElementById('phaseVoice'),
            subtitleText: document.getElementById('subtitleText'),
            frequencyBars: document.querySelectorAll('.freq-bar'),
            
            phaseData: document.getElementById('phaseData'),
            dataSubtitle: document.getElementById('dataSubtitle'),
            scanProgress: document.getElementById('scanProgress'),
            progressRing: document.getElementById('progressRing'),
            percentNum: document.getElementById('percentNum'),
            statusBox: document.getElementById('statusBox'),
            
            phaseGlobe: document.getElementById('phaseGlobe'),
            terrainCanvas: document.getElementById('terrainCanvas'),
            terrainLocation: document.getElementById('terrainLocation'),
            observeEarthBtn: document.getElementById('observeEarthBtn'), // CAMBIADO: de Chicago a Earth
            earthPanel: document.getElementById('earthPanel'), // CAMBIADO: de Chicago a Earth
            earthCloseBtn: document.getElementById('earthCloseBtn'), // CAMBIADO: de Chicago a Earth
            earthDetailCanvas: document.getElementById('earthDetailCanvas'), // NUEVO: canvas para Earth
            brainCanvas: document.getElementById('brainCanvas'),
            
            phaseBody: document.getElementById('phaseBody'),
            bodySubtitle: document.getElementById('bodySubtitle'),
            
            phaseBoarding: document.getElementById('phaseBoarding'),
            boardingWrapper: document.querySelector('.boarding-wrapper'),
            
            mainScreen: document.getElementById('mainScreen'),
            homeScreen: document.getElementById('homeScreen'),
            aboutScreen: document.getElementById('aboutScreen'),
            contactScreen: document.getElementById('contactScreen'),
            mainNav: document.getElementById('mainNav')
        };
        // Dynamically create survivor audio button
        this.elements.survivorAudioBtn = this.createSurvivorAudioButton();

         console.log('[ANIMATIONS] Elements cached:', {
        stellarIntro: !!this.elements.stellarIntro,
        phaseGlobe: !!this.elements.phaseGlobe,
        phaseEarth: !!this.elements.phaseEarth, // Ahora debería ser true
        earthCanvas: !!this.elements.earthCanvas, // Ahora debería ser true
        terrainCanvas: !!this.elements.terrainCanvas
    });
}

    // ========================================
    // CREATES DYNAMIC SURVIVOR AUDIO BUTTON
    // ========================================
    createSurvivorAudioButton() {
        // Legacy method - now creates the full panel instead
        this.createSurvivorMessagesPanel();
        return document.getElementById('survivorAudioBtn'); // Return dummy element for compatibility
    }
    
    // ========================================
    // SURVIVOR MESSAGES PANEL
    // ========================================
    
    createSurvivorMessagesPanel() {
        // Evitar crear el panel múltiples veces
        if (this.survivorPanel && document.getElementById('sp-survivorMessagesPanel')) {
            console.log('[ANIMATIONS] Survivor panel already exists, skipping creation');
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'sp-survivorMessagesPanel';
        panel.className = 'sp-survivor-messages-panel';
        
        // ONLY set initial hidden state - let CSS handle everything else
        panel.style.visibility = 'hidden';
        
        panel.innerHTML = `
            <div class="sp-panel-header">
                <div class="sp-header-top">
                    <span class="sp-panel-icon">▣</span>
                    <span class="sp-panel-title">TRANSMISSIONS</span>
                    <button class="sp-panel-close-btn" id="sp-closeSurvivorPanel">✕</button>
                </div>
                <div class="sp-header-status">
                    <span class="sp-status-indicator"></span>
                    <span class="sp-status-text">RECEIVING SIGNALS</span>
                </div>
            </div>
            
            <div class="sp-panel-content">
                <div class="sp-messages-list" id="sp-messagesList">
                    <!-- Messages will be populated here -->
                </div>
            </div>
            
            <div class="sp-panel-player" id="sp-messagePlayer">
                <div class="sp-player-info">
                    <div class="sp-player-title" id="sp-playerTitle">No transmission selected</div>
                    <div class="sp-player-meta">
                        <span id="sp-playerLocation"></span>
                        <span id="sp-playerTimestamp"></span>
                    </div>
                </div>
                <div class="sp-player-controls">
                    <button class="sp-control-btn" id="sp-playPauseBtn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </button>
                    <div class="sp-player-progress">
                        <div class="sp-progress-bar" id="sp-progressBar"></div>
                    </div>
                    <div class="sp-player-time">
                        <span id="sp-currentTime">00:00</span>
                        <span>/</span>
                        <span id="sp-totalTime">00:00</span>
                    </div>
                </div>
                <div class="sp-player-transcript" id="sp-playerTranscript"></div>
            </div>
        `;
        
        document.body.appendChild(panel);
        this.survivorPanel = panel;
        
        // Create dummy button element for compatibility
        const dummyBtn = document.createElement('button');
        dummyBtn.id = 'survivorAudioBtn';
        dummyBtn.style.display = 'none';
        document.body.appendChild(dummyBtn);
        
        // Initialize messages data
        this.messages = [
            {
                id: 1,
                type: 'survivor',
                title: 'SURVIVOR TRANSMISSION',
                subtitle: ' ▄▖▜▚┣',
                location: 'Unknown',
                timestamp: '2090.03.14 - 08:42',
                audioPath: '/src/sfx/survivor_voice.oga',
                transcript: "---",
                status: 'AUTHENTICATED'
            },
            {
                id: 2,
                type: 'news',
                title: 'EMERGENCY BROADCAST',
                subtitle: 'Global Crisis Alert',
                location: 'New York, NY',
                timestamp: '2090.03.13 - 23:15',
                audioPath: '/src/sfx/news-broadcast-1.mp3',
                transcript: "---",
                status: 'PRIORITY ALERT'
            },
            {
                id: 3,
                type: 'survivor',
                title: 'SURVIVOR TRANSMISSION',
                subtitle: 'LOST DATA ▞▟▘▝',
                location: 'Unknown',
                timestamp: '2090.03.15 - 14:28',
                audioPath: '/src/sfx/lost-data-voice.oga',
                transcript: "▀▖┗▛▄▖▜▚┣ ▜▚┗┣┗┫┓┏┓ ▛▄▖┅┗▖. ┣┗┏▛▄▖▜┏┣ ▚ ▖▞┣┗▖┗┣. ┣┗▖┃▀▚▗┏┏┓. ▖┛▀┗▞┃┏▄ ▛┏┗▄▖▜▚┣ ┅▖┗━▖ ▖┓┫▞┣ ▚ ▛▄┅┗▖ ▚ ▖▞┣┗▖┗┣ ▚┛▘▞━▖┅",
                status: 'AUTHENTICATED'
            }
        ];
        
        this.currentMessageIndex = 0;
        this.isMessagePlaying = false;
        
        // Populate messages
        this.populateMessages();
        
        // Setup event listeners
        this.setupPanelEventListeners();
        
        // Start hidden using visibility (not opacity to avoid transition conflicts)
        panel.style.visibility = 'hidden';
        panel.style.pointerEvents = 'none';
        
        console.log('[ANIMATIONS] Survivor Messages Panel created (initially hidden with visibility)');
    }
    
    populateMessages() {
        const messagesList = document.getElementById('sp-messagesList');
        if (!messagesList) return;
        
        messagesList.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const messageCard = document.createElement('div');
            messageCard.className = `sp-message-card ${message.type}`;
            messageCard.dataset.index = index;
            
            const icon = message.type === 'survivor' ? '▣' : '//';
            
            messageCard.innerHTML = `
                <div class="sp-message-header">
                    <span class="sp-message-icon">${icon}</span>
                    <span class="sp-message-type">${message.type.toUpperCase()}</span>
                    <span class="sp-message-status sp-${message.status.toLowerCase().replace(' ', '-')}">${message.status}</span>
                </div>
                <div class="sp-message-title">${message.title}</div>
                <div class="sp-message-subtitle">${message.subtitle}</div>
                <div class="sp-message-meta">
                    <span class="sp-message-location"> ◈ ${message.location}</span>
                    <span class="sp-message-timestamp"> // ${message.timestamp}</span>
                </div>
            `;
            
            messageCard.addEventListener('click', () => this.selectMessage(index));
            messagesList.appendChild(messageCard);
        });
    }
    
    setupPanelEventListeners() {
        console.log('[SURVIVOR_PANEL] Setting up event listeners...');
        
        const closeBtn = document.getElementById('sp-closeSurvivorPanel');
        if (closeBtn) {
            // Remover listeners previos si existen
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            const newCloseBtn = document.getElementById('sp-closeSurvivorPanel');
            newCloseBtn.addEventListener('click', () => {
                console.log('[SURVIVOR_PANEL] Close button clicked');
                this.hideSurvivorPanel();
            });
            console.log('[SURVIVOR_PANEL] Close button listener attached');
        } else {
            console.error('[SURVIVOR_PANEL] Close button not found!');
        }
        
        const playPauseBtn = document.getElementById('sp-playPauseBtn');
        if (playPauseBtn) {
            // Remover listeners previos si existen
            playPauseBtn.replaceWith(playPauseBtn.cloneNode(true));
            const newPlayPauseBtn = document.getElementById('sp-playPauseBtn');
            newPlayPauseBtn.addEventListener('click', () => {
                console.log('[SURVIVOR_PANEL] Play/Pause button clicked');
                this.toggleMessagePlayback();
            });
            console.log('[SURVIVOR_PANEL] Play/Pause button listener attached');
        } else {
            console.error('[SURVIVOR_PANEL] Play/Pause button not found!');
        }
    }
    
    selectMessage(index) {
        if (index < 0 || index >= this.messages.length) return;
        
        this.currentMessageIndex = index;
        const message = this.messages[index];
        
        document.querySelectorAll('.sp-message-card').forEach((card, i) => {
            card.classList.toggle('sp-active', i === index);
        });
        
        document.getElementById('sp-playerTitle').textContent = message.title;
        document.getElementById('sp-playerLocation').textContent = message.location;
        document.getElementById('sp-playerTimestamp').textContent = message.timestamp;
        document.getElementById('sp-playerTranscript').textContent = message.transcript;
        
        this.stopMessagePlayback();
        
        console.log(`[MESSAGES] Selected message ${index + 1}: ${message.title}`);
    }
    
    toggleMessagePlayback() {
        if (this.isMessagePlaying) {
            this.stopMessagePlayback();
        } else {
            this.playMessage();
        }
    }
    
    playMessage() {
        const message = this.messages[this.currentMessageIndex];
        if (!message) {
            console.error('[MESSAGES] No message selected');
            return;
        }
        
        console.log('[MESSAGES] Playing message:', message.title);
        console.log('[MESSAGES] Message ID:', message.id);
        console.log('[MESSAGES] Message type:', message.type);
        console.log('[MESSAGES] Available survivor voices:', Object.keys(this.survivorAudio.voices));
        
        this.isMessagePlaying = true;
        
        const playPauseBtn = document.getElementById('sp-playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
            `;
        }
        
        if (message.type === 'survivor') {
            const voiceAudio = this.survivorAudio.voices[message.id];
            if (voiceAudio) {
                console.log('[MESSAGES] Starting survivor audio sequence for message ID:', message.id);
                this.playSurvivorAudioSequence(message.id);
            } else {
                console.error('[MESSAGES] Survivor voice audio not loaded for message ID:', message.id);
                this.isMessagePlaying = false;
                if (playPauseBtn) {
                    playPauseBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    `;
                }
            }
        } else if (message.type === 'news') {
            // Para mensajes de noticias, podrías cargar un audio diferente
            console.log('[MESSAGES] News message - audio not implemented yet');
            this.isMessagePlaying = false;
            if (playPauseBtn) {
                playPauseBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
            }
        }
    }
    
    stopMessagePlayback() {
        console.log('[MESSAGES] Stopping message playback');
        
        this.isMessagePlaying = false;
        
        const playPauseBtn = document.getElementById('sp-playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
        }
        
        this.stopSurvivorAudio();
    }
    
    showSurvivorPanel() {
        if (!this.survivorPanel) {
            this.createSurvivorMessagesPanel();
        }
        
        console.log('[SURVIVOR_PANEL] Showing panel with CSS animation...');
        
        // CRITICAL: Ensure panel is above everything
        this.survivorPanel.style.zIndex = '999999999999';
        
        // Add visible class FIRST (CSS will handle the animation)
        this.survivorPanel.classList.add('sp-visible');
        
        // CRITICAL: Force pointer-events to auto for clicks to work
        this.survivorPanel.style.pointerEvents = 'auto';
        
        // Force visibility to override the initial hidden state
        this.survivorPanel.style.visibility = 'visible';
        
        // Small delay to ensure CSS transition works
        requestAnimationFrame(() => {
            this.survivorPanel.style.removeProperty('visibility');
            // Keep pointer-events auto
            this.survivorPanel.style.pointerEvents = 'auto';
        });
        
        if (this.messages.length > 0) {
            this.selectMessage(0);
        }
        
        console.log('[ANIMATIONS] Survivor Messages Panel shown - clicks enabled');
    }
    
    hideSurvivorPanel() {
        if (this.survivorPanel) {
            this.survivorPanel.classList.remove('sp-visible');
            this.stopMessagePlayback();
            
            // Ensure pointer events are disabled
            this.survivorPanel.style.pointerEvents = 'none';
        }
    }
    
    playSurvivorAudioSequence(messageId) {
        const voiceAudio = this.survivorAudio.voices[messageId];
        
        if (!voiceAudio) {
            console.error('[AUDIO] Survivor voice not loaded for message ID:', messageId);
            return;
        }
        
        console.log('[AUDIO] Starting survivor message sequence for message ID:', messageId);
        
        // SECUENCIA: reproducir UNO DESPUÉS DEL OTRO
        if (this.survivorAudio.bcommsOn) {
            console.log('[AUDIO] Step 1: Playing bcomms-on...');
            this.survivorAudio.bcommsOn.currentTime = 0;
            this.survivorAudio.bcommsOn.play().catch(e => console.error('[AUDIO] bcomms error:', e));
            
            // Esperar a que termine bcomms-on
            this.survivorAudio.bcommsOn.onended = () => {
                console.log('[AUDIO] Step 2: bcomms-on finished, playing lifesupport-on...');
                
                if (this.survivorAudio.lifesupportOn) {
                    this.survivorAudio.lifesupportOn.currentTime = 0;
                    this.survivorAudio.lifesupportOn.play().catch(e => console.error('[AUDIO] lifesupport error:', e));
                    
                    // Esperar a que termine lifesupport-on
                    this.survivorAudio.lifesupportOn.onended = () => {
                        console.log('[AUDIO] Step 3: lifesupport-on finished, playing voice...');
                        this.playVoiceMessageFromPanel(voiceAudio, messageId);
                    };
                } else {
                    // Si no hay lifesupport, reproducir voz directamente
                    this.playVoiceMessageFromPanel(voiceAudio, messageId);
                }
            };
        } else if (this.survivorAudio.lifesupportOn) {
            // Si no hay bcomms, empezar con lifesupport
            console.log('[AUDIO] Step 1: Playing lifesupport-on...');
            this.survivorAudio.lifesupportOn.currentTime = 0;
            this.survivorAudio.lifesupportOn.play().catch(e => console.error('[AUDIO] lifesupport error:', e));
            
            this.survivorAudio.lifesupportOn.onended = () => {
                console.log('[AUDIO] Step 2: lifesupport-on finished, playing voice...');
                this.playVoiceMessageFromPanel(voiceAudio, messageId);
            };
        } else {
            // Si no hay SFX, reproducir voz directamente
            this.playVoiceMessageFromPanel(voiceAudio, messageId);
        }
    }
    
    playVoiceMessageFromPanel(voiceAudio, messageId) {
        console.log('[AUDIO] Playing voice for message ID:', messageId);
        
        // Stop any currently playing audio
        if (this.currentPlayingAudio && !this.currentPlayingAudio.paused) {
            this.currentPlayingAudio.pause();
            this.currentPlayingAudio.currentTime = 0;
        }
        
        this.currentPlayingAudio = voiceAudio;
        voiceAudio.currentTime = 0;
        voiceAudio.play().catch(e => {
            console.error('[AUDIO] Voice playback error:', e);
        });
        
        this.survivorAudioPlaying = true;
        
        voiceAudio.onended = () => {
            this.survivorAudioPlaying = false;
            this.isMessagePlaying = false;
            this.currentPlayingAudio = null;
            
            const playPauseBtn = document.getElementById('sp-playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                `;
            }
            
            console.log('[AUDIO] Voice message ended for message ID:', messageId);
        };
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
        const loadAudio = (src, volume, loop = false) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'metadata';
            audio.loop = loop;
            return audio;
        };

        try {
            if (!this.stellarAudio.bgMusic) {
                this.stellarAudio.bgMusic = loadAudio('/src/sfx/Isolated_System.ogg', this.volumes.bgMusic, true);
            }
            
            if (!this.stellarAudio.voiceIntro) {
                this.stellarAudio.voiceIntro = loadAudio('/src/starvortex_assets/voice_intro.mp3', this.volumes.voiceIntro);
            }
            if (!this.stellarAudio.voiceDataDisplay) {
                this.stellarAudio.voiceDataDisplay = loadAudio('/src/starvortex_assets/voice-data-display.mp3', this.volumes.voiceDataDisplay);
            }
            if (!this.stellarAudio.voiceDataEarth) {
                this.stellarAudio.voiceDataEarth = loadAudio('/src/starvortex_assets/voice-data-earth.mp3', this.volumes.voiceDataDisplay);
            }
            if (!this.stellarAudio.voiceDataUser) {
                this.stellarAudio.voiceDataUser = loadAudio('/src/starvortex_assets/voice-data-user.mp3', this.volumes.voiceDataUser);
            }
            if (!this.stellarAudio.voiceRecoveryProtocol) {
                this.stellarAudio.voiceRecoveryProtocol = loadAudio('/src/starvortex_assets/voice_recovery-protocol.ogg', this.volumes.voiceDataUser); // Using voiceDataUser volume
            }
            if (!this.stellarAudio.voiceFinal) {
                this.stellarAudio.voiceFinal = loadAudio('/src/starvortex_assets/voice-final.mp3', this.volumes.voiceFinal);
            }
            
            // Transitions and SFX also need to be checked, as they are arrays/objects.
            // For transitions, we might need a more sophisticated check or just create them always if they are meant to be re-playable short effects.
            // For now, let's just make sure the main background music and voices are not duplicated.
            // If the transitions and sfx are causing issues, we can address them later.
            if (!this.stellarAudio.transitions || this.stellarAudio.transitions.length === 0) {
                this.stellarAudio.transitions = [
                    loadAudio('/src/sfx/FX_flow_transition_data-tech.mp3', this.volumes.transition),
                    loadAudio('/src/sfx/FX_Transition.mp3', this.volumes.transition)
                ];
            }
            
            if (!this.stellarAudio.sfx.textRollover) {
                this.stellarAudio.sfx.textRollover = loadAudio('/src/sfx/UI_menu_text_rollover_2.mp3', this.volumes.sfx);
            }
            if (!this.stellarAudio.sfx.scanZoom) {
                this.stellarAudio.sfx.scanZoom = loadAudio('/src/sfx/scan-zoom.wav', this.volumes.sfx);
            }
            if (!this.stellarAudio.sfx.textAnimation) {
                this.stellarAudio.sfx.textAnimation = loadAudio('/src/sfx/FX_text_animation_loop.mp3', this.volumes.sfx);
            }
            if (!this.stellarAudio.sfx.affirmation) {
                this.stellarAudio.sfx.affirmation = loadAudio('/src/sfx/affirmation-tech.wav', this.volumes.sfx);
            }
            
            console.log('[ANIMATIONS] Stellar audio preloaded with SFX');
        } catch (error) {
            console.error('[ERROR] Audio preload error:', error);
        }
    }
    
    playSFX(sfxName) {
        if (this.sfxPlayed[sfxName] || !this.stellarAudio.sfx[sfxName]) {
            return;
        }
        
        this.sfxPlayed[sfxName] = true;
        this.playAudio(this.stellarAudio.sfx[sfxName]);
        console.log('[AUDIO] SFX played:', sfxName);
    }
    
    isAudioPlaying(audioElement) {
        return audioElement && audioElement.currentTime > 0 && !audioElement.paused && !audioElement.ended && audioElement.readyState > 2;
    }

    playAudio(audioElement) {
        if (this.isAudioPlaying(audioElement)) {
            return Promise.resolve();
        }
        return audioElement?.play().catch(err => 
            console.log('Audio play blocked:', err.message)
        ) || Promise.resolve();
    }
    
    // Play voice audio with overlap prevention
    playVoiceAudio(audioElement) {
        if (!audioElement) return Promise.resolve();
        
        if (this.currentVoiceAudio && !this.currentVoiceAudio.paused) {
            console.log('[AUDIO] Stopping previous voice to prevent overlap');
            this.currentVoiceAudio.pause();
            this.currentVoiceAudio.currentTime = 0;
        }
        
        this.currentVoiceAudio = audioElement;
        this.isVoicePlaying = true;
        
        const onEnded = () => {
            this.isVoicePlaying = false;
            this.currentVoiceAudio = null;
            audioElement.removeEventListener('ended', onEnded);
        };
        
        audioElement.addEventListener('ended', onEnded);
        
        return audioElement.play().catch(err => {
            console.log('[AUDIO] Voice play blocked:', err.message);
            this.isVoicePlaying = false;
            this.currentVoiceAudio = null;
            return Promise.resolve();
        });
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
        const music = this.stellarAudio.bgMusic;
            
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
    // SURVIVOR AUDIO FUNCTIONS
    // ========================================
    
    preloadSurvivorAudio() {
        console.log('[AUDIO] Preloading survivor audio files...');
        
        const loadAudio = (src, volume) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'auto';
            return audio;
        };
        
        try {
            // Cargar los 3 audios de sobrevivientes (basado en los mensajes)
            this.survivorAudio.voices[1] = loadAudio('/src/sfx/survivor_voice.oga', 0.8);
            this.survivorAudio.voices[3] = loadAudio('/src/sfx/lost-data-voice.oga', 0.8);
            
            // SFX de comunicaciones
            this.survivorAudio.bcommsOn = loadAudio('/src/sfx/bcomms-on.mp3', 0.4);
            this.survivorAudio.lifesupportOn = loadAudio('/src/sfx/lifesupport-on.mp3', 0.4);
            
            // Event listeners for successful load - voices
            Object.entries(this.survivorAudio.voices).forEach(([id, audio]) => {
                if (audio && audio.addEventListener) {
                    audio.addEventListener('canplaythrough', () => {
                        console.log(`[AUDIO] Survivor voice ${id} loaded`);
                    });
                    
                    audio.addEventListener('error', (e) => {
                        console.error(`[AUDIO] Error loading survivor voice ${id}:`, e);
                    });
                }
            });
            
            // Event listeners for SFX
            if (this.survivorAudio.bcommsOn) {
                this.survivorAudio.bcommsOn.addEventListener('canplaythrough', () => {
                    console.log('[AUDIO] bcomms-on SFX loaded');
                });
            }
            
            if (this.survivorAudio.lifesupportOn) {
                this.survivorAudio.lifesupportOn.addEventListener('canplaythrough', () => {
                    console.log('[AUDIO] lifesupport-on SFX loaded');
                });
            }
            
            console.log('[AUDIO] Survivor audio preload initiated');
        } catch (error) {
            console.error('[ERROR] Survivor audio preload error:', error);
        }
    }
    
    stopSurvivorAudio() {
        // Stop all survivor voice audios
        Object.values(this.survivorAudio.voices).forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        // Stop SFX
        if (this.survivorAudio.bcommsOn && !this.survivorAudio.bcommsOn.paused) {
            this.survivorAudio.bcommsOn.pause();
            this.survivorAudio.bcommsOn.currentTime = 0;
        }
        if (this.survivorAudio.lifesupportOn && !this.survivorAudio.lifesupportOn.paused) {
            this.survivorAudio.lifesupportOn.pause();
            this.survivorAudio.lifesupportOn.currentTime = 0;
        }
        
        const btn = this.elements.survivorAudioBtn;
        this.survivorAudioPlaying = false;
        this.currentPlayingAudio = null;
        btn?.classList.remove('playing');
        
        const textElement = btn?.querySelector('.audio-text');
        if (textElement) {
            textElement.textContent = 'LISTEN MESSAGE';
        }
        
        console.log('[AUDIO] Survivor audio stopped');
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
        this.preloadSurvivorAudio();  // Preload survivor audio
        
        await this.playAudio(this.stellarAudio.bgMusic);
        
        if (!this.introSkipped) await this.playStellarPhase1();
        if (!this.introSkipped) await this.playStellarPhase2();
        if (!this.introSkipped) await this.playStellarPhase3();
        if (!this.introSkipped) await this.playStellarPhaseEarth(); // NUEVA FASE EARTH
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
                
                this.playVoiceAudio(this.stellarAudio.voiceIntro);
                
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
                } else {
                    setTimeout(() => {
                        if (!this.introSkipped) {
                            phaseVoice.classList.remove('active');
                        }
                        resolve();
                    }, 20000);
                }
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
                
                this.playVoiceAudio(this.stellarAudio.voiceDataDisplay);
                
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
                } else {
                    setTimeout(() => {
                        if (!this.introSkipped) {
                            phaseData.classList.remove('active');
                        }
                        resolve();
                    }, 50000);
                }
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
            
            this.createGeoInfoPanels();
            
            if (this.elements.terrainCanvas && window.THREE) {
                this.initOptimizedTerrainSystem();
            }
            
            this.animateGlobeData();
            
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                this.playVoiceAudio(this.stellarAudio.voiceDataEarth);
                
                if (this.stellarAudio.voiceDataEarth) {
                    this.stellarAudio.voiceDataEarth.onended = () => {
                        if (this.introSkipped) return resolve();
                        
                        this.cleanupTerrain();
                        phaseGlobe.classList.remove('active');
                        setTimeout(() => {
                            this.playStellarPhaseEarth().then(resolve);
                        }, 500);
                    };
                } else {
                    setTimeout(() => {
                        if (this.introSkipped) return resolve();
                        this.cleanupTerrain();
                        phaseGlobe.classList.remove('active');
                        setTimeout(() => {
                            this.playStellarPhaseEarth().then(resolve);
                        }, 500);
                    }, 15000);
                }
            }, 3000);
        });
    }

    async playStellarPhaseEarth() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 3b: Earth Visualization');
            this.currentPhase = 3.5;

            const phaseEarth = document.getElementById('phaseEarth');
            if (!phaseEarth) {
                console.error('[ANIMATIONS] #phaseEarth not found!');
                return resolve();
            }

            this.playAudio(this.stellarAudio.transitions[1]);
            phaseEarth.classList.add('active');
            this.showSurvivorPanel();

            const canvas = document.getElementById('earthCanvas');
            if (canvas && window.THREE) {
                if (!this.earthViz) {
                    this.earthViz = new EarthquakeVisualization(canvas, phaseEarth);
                }
                this.earthViz.start();
            }

            // After a delay, proceed to the next phase
            setTimeout(() => {
                if (this.introSkipped) return resolve();
                
                if (this.earthViz) {
                    this.earthViz.stop();
                }
                this.hideSurvivorPanel();
                phaseEarth.classList.remove('active');
                resolve();
            }, 60000); // 60 second duration for this phase
        });
    }
    
    // ========================================
    // PHASE 3b: EARTH CATASTROPHE VISUALIZATION (NUEVA FASE)
    // ========================================
    
    async playStellarPhase3Earth_old() {
        return new Promise((resolve) => {
            console.log('[ANIMATIONS] Phase 3b: Earth Catastrophe Visualization');
            this.currentPhase = 3.5;
            
            // Crear o reutilizar el contenedor de Earth Catastrophe
            let earthPhaseContainer = document.getElementById('phaseEarthCatastrophe');
            
            if (!earthPhaseContainer) {
                earthPhaseContainer = document.createElement('div');
                earthPhaseContainer.id = 'phaseEarthCatastrophe';
                earthPhaseContainer.className = 'intro-phase phase-earth-catastrophe';
                earthPhaseContainer.innerHTML = `
                    <div class="earth-catastrophe-container">
                        <div class="earth-catastrophe-panel">
                            <div class="earth-header">
                                <h2 class="earth-title">EARTH CATASTROPHE ANALYSIS</h2>
                                <button class="earth-continue-btn" id="earthContinueBtn">
                                    CONTINUE
                                </button>
                            </div>
                            
                            <div class="earth-content">
                                <div class="earth-stats">
                                    <div class="stat-item">
                                        <div class="stat-label">PERIOD ANALYZED</div>
                                        <div class="stat-value">2000 - 2090</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">TOTAL EARTHQUAKES</div>
                                        <div class="stat-value danger" id="phaseEarthquakeCount">Loading...</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">MAX MAGNITUDE</div>
                                        <div class="stat-value danger" id="phaseMaxMagnitude">Loading...</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">MOST AFFECTED REGION</div>
                                        <div class="stat-value warning" id="phaseWorstRegion">Loading...</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">DEADLIEST QUAKE</div>
                                        <div class="stat-value danger" id="phaseDeadliestQuake">Loading...</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-label">DATA SOURCE</div>
                                        <div class="stat-value">USGS Earthquake Database</div>
                                    </div>
                                    
                                    <div class="earth-timeline">
                                        <h3 class="timeline-title">MAJOR EVENTS TIMELINE</h3>
                                        <div class="timeline-item">
                                            <div class="timeline-year">2011 Japan</div>
                                            <div class="timeline-desc">Tohoku Earthquake & Tsunami</div>
                                        </div>
                                        <div class="timeline-item">
                                            <div class="timeline-year">2004 Indian Ocean</div>
                                            <div class="timeline-desc">Tsunami - 230,000+ casualties</div>
                                        </div>
                                        <div class="timeline-item">
                                            <div class="timeline-year">2010 Haiti</div>
                                            <div class="timeline-desc">7.0M - 160,000+ casualties</div>
                                        </div>
                                        <div class="timeline-item">
                                            <div class="timeline-year">2008 China</div>
                                            <div class="timeline-desc">Sichuan Earthquake</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="earth-visual">
                                    <canvas id="earthCatastropheCanvas"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Añadir al DOM después de stellarIntro
                const stellarIntro = this.elements.stellarIntro;
                stellarIntro.appendChild(earthPhaseContainer);
                
                // Inject CSS para la nueva fase
                this.injectEarthPhaseStyles();
            }
            
            // Inicializar Earth Catastrophe Visualization
            const canvas = document.getElementById('earthCatastropheCanvas');
            if (!canvas) {
                console.error('[EARTH] Earth Catastrophe Canvas not found');
                return resolve();
            }
            
            // Crear o reutilizar visualización
            if (!this.earthCatastropheViz) {
                this.earthCatastropheViz = new EarthquakeVisualization(canvas, earthPhaseContainer);
            }
            
            // Mostrar la fase Earth
            earthPhaseContainer.classList.add('active');
            
            // Start Earth visualization
            setTimeout(() => {
                if (this.earthCatastropheViz.start()) {
                    console.log('[EARTH] Earthquake visualization started successfully');
                }
            }, 500);
            
            // Setup continue button
            const earthContinueBtn = document.getElementById('earthContinueBtn');
            if (earthContinueBtn) {
                const handleContinue = () => {
                    console.log('[EARTH] Continuing to next phase');
                    
                    // Stop Earth visualization
                    if (this.earthCatastropheViz) {
                        this.earthCatastropheViz.stop();
                    }
                    
                    // Remove phase
                    earthPhaseContainer.classList.remove('active');
                    
                    // Cleanup
                    setTimeout(() => {
                        if (this.earthCatastropheViz) {
                            this.earthCatastropheViz.destroy();
                            this.earthCatastropheViz = null;
                        }
                        
                        resolve();
                    }, 300);
                };
                
                earthContinueBtn.addEventListener('click', handleContinue, { once: true });
            } else {
                // Fallback: auto-continue after 15 seconds
                setTimeout(() => {
                    if (!this.introSkipped) {
                        earthPhaseContainer.classList.remove('active');
                        if (this.earthCatastropheViz) {
                            this.earthCatastropheViz.destroy();
                            this.earthCatastropheViz = null;
                        }
                        resolve();
                    }
                }, 15000);
            }
        });
    }
    
    setupEarthPhaseButton() {
        const btn = document.getElementById('observeEarthBtn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            console.log('[EARTH] Earth catastrophe button clicked in phase 3');
            // Esta función ahora solo sirve como interfaz visual en la fase 3
            // La transición real ocurre a través del botón CONTINUE
        });
        
        console.log('[EARTH] Earth phase button setup complete');
    }
    
    injectEarthPhaseStyles() {
        if (document.getElementById('earthPhaseStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'earthPhaseStyles';
        style.textContent = `
            .intro-phase.phase-earth-catastrophe {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000000;
                z-index: 100;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.8s ease;
            }
            
            .intro-phase.phase-earth-catastrophe.active {
                opacity: 1;
                pointer-events: all;
            }
            
            .earth-catastrophe-container {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #0a0a15 0%, #1a1a2e 100%);
            }
            
            .earth-catastrophe-panel {
                width: 90%;
                max-width: 1400px;
                height: 85%;
                background: rgba(10, 10, 20, 0.95);
                border: 1px solid rgba(0, 170, 255, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: 0 0 50px rgba(0, 170, 255, 0.1);
                position: relative;
            }
            
            .earth-header {
                padding: 20px 30px;
                border-bottom: 1px solid rgba(0, 170, 255, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(0, 0, 0, 0.5);
            }
            
            .earth-title {
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 1.4rem;
                letter-spacing: 0.2em;
                color: rgba(255, 255, 255, 0.9);
                margin: 0;
                font-weight: 400;
            }
            
            .earth-continue-btn {
                background: rgba(0, 170, 255, 0.1);
                border: 1px solid rgba(0, 170, 255, 0.5);
                color: rgba(255, 255, 255, 0.9);
                padding: 12px 24px;
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.9rem;
                letter-spacing: 0.15em;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .earth-continue-btn:hover {
                background: rgba(0, 170, 255, 0.2);
                border-color: rgba(0, 170, 255, 0.8);
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(0, 170, 255, 0.2);
            }
            
            .earth-content {
                display: flex;
                flex: 1;
                overflow: hidden;
            }
            
            .earth-stats {
                width: 35%;
                padding: 30px;
                border-right: 1px solid rgba(0, 170, 255, 0.1);
                overflow-y: auto;
            }
            
            .stat-item {
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            
            .stat-label {
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.6rem;
                letter-spacing: 0.15em;
                color: rgba(255, 255, 255, 0.4);
                margin-bottom: 8px;
                display: block;
            }
            
            .stat-value {
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 1rem;
                color: rgba(255, 255, 255, 0.9);
                letter-spacing: 0.05em;
            }
            
            .stat-value.danger {
                color: rgba(255, 50, 50, 0.9);
            }
            
            .stat-value.warning {
                color: rgba(255, 200, 50, 0.9);
            }
            
            .earth-timeline {
                margin-top: 40px;
            }
            
            .timeline-title {
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.9rem;
                letter-spacing: 0.15em;
                color: rgba(255, 255, 255, 0.7);
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .timeline-item {
                margin-bottom: 15px;
                padding-left: 15px;
                border-left: 2px solid rgba(0, 170, 255, 0.5);
            }
            
            .timeline-year {
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.8rem;
                color: rgba(0, 170, 255, 0.9);
                margin-bottom: 5px;
            }
            
            .timeline-desc {
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.6);
            }
            
            .earth-visual {
                width: 65%;
                padding: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            #earthCatastropheCanvas {
                width: 100%;
                height: 100%;
                border: 1px solid rgba(0, 170, 255, 0.2);
                background: #000;
            }
            
            @media (max-width: 1200px) {
                .earth-catastrophe-panel {
                    flex-direction: column;
                    height: 95%;
                }
                
                .earth-content {
                    flex-direction: column;
                }
                
                .earth-stats {
                    width: 100%;
                    height: 40%;
                    border-right: none;
                    border-bottom: 1px solid rgba(0, 170, 255, 0.1);
                }
                
                .earth-visual {
                    width: 100%;
                    height: 60%;
                }
            }
            
            @media (max-width: 768px) {
                .earth-catastrophe-panel {
                    width: 95%;
                    height: 90%;
                }
                
                .earth-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
                
                .earth-title {
                    font-size: 1rem;
                }
                
                .stat-value {
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================
    // CONTINUE BUTTON FOR MANUAL PROGRESSION
    // ========================================
    showContinueButton(container, onContinue) {
        // Create continue button if it doesn't exist
        let continueBtn = document.getElementById('phase3ContinueBtn');
        
        if (!continueBtn) {
            continueBtn = document.createElement('button');
            continueBtn.id = 'phase3ContinueBtn';
            continueBtn.className = 'phase-continue-btn';
            continueBtn.innerHTML = `
                <span class="continue-icon">//</span>
                <span class="continue-text">CONTINUE</span>
            `;
            container.appendChild(continueBtn);
            
            // Add styles
            this.injectContinueButtonStyles();
        }
        
        // Show button with animation
        setTimeout(() => {
            continueBtn.classList.add('visible');
        }, 500);
        
        // Handle click
        const handleClick = () => {
            continueBtn.classList.remove('visible');
            setTimeout(() => {
                continueBtn.remove();
                onContinue();
            }, 300);
        };
        
        continueBtn.addEventListener('click', handleClick, { once: true });
        
        console.log('[ANIMATIONS] Continue button displayed');
    }
    
    injectContinueButtonStyles() {
        if (document.getElementById('continueButtonStyles')) return;
        
        const style = document.createElement('style');
        style.id = 'continueButtonStyles';
        style.textContent = `
            .phase-continue-btn {
                position: absolute;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.4);
                color: rgba(255, 255, 255, 0.9);
                padding: 15px 40px;
                font-family: 'SV-Tech', 'Courier New', monospace;
                font-size: 0.9rem;
                letter-spacing: 0.2em;
                cursor: pointer;
                z-index: 100;
                backdrop-filter: blur(10px);
                opacity: 0;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .phase-continue-btn.visible {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .phase-continue-btn:hover {
                background: rgba(255, 255, 255, 0.2);
                border-color: rgba(255, 255, 255, 0.7);
                transform: translateX(-50%) translateY(-2px);
                box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
            }
            
            .phase-continue-btn:active {
                transform: translateX(-50%) translateY(0);
            }
            
            .continue-icon {
                font-size: 1rem;
                animation: pulseIcon 2s ease-in-out infinite;
            }
            
            .continue-text {
                font-weight: 600;
            }
            
            @keyframes pulseIcon {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .phase-continue-btn {
                    bottom: 60px;
                    padding: 12px 30px;
                    font-size: 0.75rem;
                }
            }
        `;
        document.head.appendChild(style);
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
                    <span class="selector-icon">▣</span>
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
                    <span class="geo-icon">✧</span>
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
    // Uses GSAP for professional smooth motion
    // ========================================
    animateCameraTransition() {
        if (!this.threeCamera) return;
        
        const tweenEngine = typeof gsap !== 'undefined' ? gsap : (typeof TweenMax !== 'undefined' ? TweenMax : null);
        
        // Calculate new dynamic position based on terrain
        const variation = (Math.random() - 0.5) * 2000;
        const targetPos = {
            x: variation,
            y: 8000 + (Math.random() - 0.5) * 1500,
            z: -15000 + (Math.random() - 0.5) * 1500
        };
        
        if (tweenEngine) {
            // GSAP camera transition
            tweenEngine.to(this.threeCamera.position, {
                x: targetPos.x,
                y: targetPos.y,
                z: targetPos.z,
                duration: 1.8,
                ease: "power2.inOut",
                onStart: () => {
                    this.cameraTransition.active = true;
                    console.log('[TERRAIN] Starting GSAP camera transition');
                },
                onComplete: () => {
                    this.cameraTransition.active = false;
                    console.log('[TERRAIN] GSAP camera transition complete');
                }
            });
        } else {
            // Fallback without GSAP
            this.cameraTransition.active = true;
            this.cameraTransition.startTime = performance.now();
            this.cameraTransition.duration = 1800;
            
            this.cameraTransition.startPos = {
                x: this.threeCamera.position.x,
                y: this.threeCamera.position.y,
                z: this.threeCamera.position.z
            };
            this.cameraTransition.targetPos = targetPos;
            
            console.log('[TERRAIN] Starting fallback camera transition');
        }
    }
    
    // ========================================
    // UPDATE CAMERA POSITION (Fallback only)
    // ========================================
    // Called each frame when GSAP is not available
    // ========================================
    updateCameraTransition() {
        // Skip if GSAP is handling it or not active
        if (!this.cameraTransition.active || !this.threeCamera) return;
        
        // Check if GSAP is handling this
        const tweenEngine = typeof gsap !== 'undefined' ? gsap : (typeof TweenMax !== 'undefined' ? TweenMax : null);
        if (tweenEngine) return; // GSAP handles its own updates
        
        const elapsed = performance.now() - this.cameraTransition.startTime;
        const progress = Math.min(elapsed / this.cameraTransition.duration, 1);
        
        // ========================================
        // SMOOTH EASE-IN-OUT FUNCTION
        // ========================================
        const eased = progress < 0.5
            ? (1 - Math.cos(progress * Math.PI)) / 2
            : (1 + Math.sin((progress - 0.5) * Math.PI)) / 2;
        
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
    // Uses GSAP library for fluid transitions (like CodePen reference)
    // ========================================
    processTerrainDataWithTransition(data) {
        if (!this.mountainParticles || !data.coords) return;
        
        // Check if GSAP is available
        if (typeof gsap === 'undefined' && typeof TweenMax === 'undefined') {
            console.warn('[TERRAIN] GSAP not loaded, using fallback transition');
            this.processTerrainDataFallback(data);
            return;
        }
        
        const tweenEngine = typeof gsap !== 'undefined' ? gsap : TweenMax;
        
        console.log('[TERRAIN] Starting GSAP terrain morphing animation');
        
        // ========================================
        // GSAP ANIMATION FOR EACH VERTEX
        // ========================================
        data.coords.forEach(coord => {
            const [x, y, z] = coord;
            
            if (this.pointsPlot[x]?.[z]) {
                const vertex = this.pointsPlot[x][z];
                const targetY = (y - (data.lowest_point || 0)) * this.particleDistance * 0.8;
                
                // Store reference to geometry for updates
                const geometry = this.mountainGeometry;
                const positions = geometry.getAttribute('position').array;
                const vertexIndex = vertex.index;
                
                // GSAP tween - exactly like CodePen
                tweenEngine.to(vertex, {
                    currentY: targetY,
                    duration: 1.5,
                    ease: "power3.out",
                    onUpdate: () => {
                        // Update the buffer geometry position
                        positions[vertexIndex * 3 + 1] = vertex.currentY;
                        geometry.getAttribute('position').needsUpdate = true;
                    }
                });
            }
        });
        
        // Mark transition as complete after animation duration
        this.terrainTransition.inProgress = true;
        setTimeout(() => {
            this.terrainTransition.inProgress = false;
            console.log('[TERRAIN] GSAP terrain transition complete');
        }, 1600);
    }
    
    // ========================================
    // FALLBACK TRANSITION (without GSAP)
    // ========================================
    processTerrainDataFallback(data) {
        if (!this.mountainParticles || !data.coords) return;
        
        const startTime = performance.now();
        const transitionDuration = 1500;
        
        data.coords.forEach(coord => {
            const [x, y, z] = coord;
            
            if (this.pointsPlot[x]?.[z]) {
                const vertex = this.pointsPlot[x][z];
                const targetY = (y - (data.lowest_point || 0)) * this.particleDistance * 0.8;
                
                vertex.transitionStart = vertex.currentY;
                vertex.transitionTarget = targetY;
                vertex.inTransition = true;
                vertex.transitionStartTime = startTime + (Math.random() * 30);
                vertex.transitionDuration = transitionDuration;
            }
        });
        
        this.terrainTransition.startTime = startTime;
        this.terrainTransition.duration = transitionDuration + 200;
        console.log('[TERRAIN] Using fallback terrain transition');
    }
    
    // ========================================
    // UPDATE TERRAIN TRANSITION
    // ========================================
    // Called each frame to animate vertex positions
    // Uses Power3.easeOut easing like GSAP for fluid motion
    // ========================================
    updateTerrainTransition() {
        if (!this.terrainTransition.inProgress || !this.mountainGeometry) return;
        
        const positions = this.mountainGeometry.getAttribute('position').array;
        const colors = this.mountainGeometry.getAttribute('color').array;
        const currentTime = performance.now();
        
        let needsUpdate = false;
        let allComplete = true;
        
        // ========================================
        // GSAP POWER3.EASEOUT FUNCTION
        // ========================================
        // Replicates the smooth deceleration of GSAP's Power3.easeOut
        const power3EaseOut = (t) => {
            return 1 - Math.pow(1 - t, 3);
        };
        
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
                    const duration = vertex.transitionDuration || this.terrainTransition.duration;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // ========================================
                    // POWER3.EASEOUT INTERPOLATION (GSAP-style)
                    // ========================================
                    const eased = power3EaseOut(progress);
                    
                    // Calculate interpolated Y position
                    const newY = vertex.transitionStart + 
                                (vertex.transitionTarget - vertex.transitionStart) * eased;
                    
                    // ========================================
                    // UPDATE POSITION
                    // ========================================
                    positions[vertex.index * 3 + 1] = newY;
                    vertex.currentY = newY;
                    
                    // ========================================
                    // SUBTLE COLOR PULSE DURING TRANSITION
                    // ========================================
                    // Brief blue tint that fades to white
                    const colorPulse = Math.sin(progress * Math.PI) * 0.15;
                    colors[vertex.index * 3] = 1.0 - colorPulse;     // R
                    colors[vertex.index * 3 + 1] = 1.0 - colorPulse * 0.5; // G
                    colors[vertex.index * 3 + 2] = 1.0;              // B stays full
                    
                    needsUpdate = true;
                    
                    // ========================================
                    // MARK AS COMPLETE
                    // ========================================
                    if (progress >= 1) {
                        vertex.inTransition = false;
                        vertex.targetY = vertex.transitionTarget;
                        // Reset color to pure white
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
        const tempEl = document.getElementById('globeTemp');
        const pressureEl = document.getElementById('globePressure');
        const magneticEl = document.getElementById('globeMagnetic');
        
        // Data ticker
        const tickerEl = document.getElementById('dataTicker');
        const tickerText = tickerEl?.querySelector('.ticker-text');
        
        const tickerMessages = [
            'TERRAIN SCAN IN PROGRESS',
            'ATMOSPHERIC ANALYSIS ACTIVE',
            'GEOLOGICAL SURVEY INITIATED',
            'MAGNETIC FIELD DETECTED',
            'TOPOGRAPHIC MAPPING ONLINE',
            'SPECTRAL ANALYSIS RUNNING',
            'ELEVATION DATA ACQUIRED',
            'SURFACE COMPOSITION ANALYZED'
        ];
        
        let tickerIndex = 0;
        
        const updateTicker = () => {
            if (tickerText && !this.introSkipped && this.currentPhase === 3) {
                tickerText.textContent = tickerMessages[tickerIndex];
                tickerIndex = (tickerIndex + 1) % tickerMessages.length;
                setTimeout(updateTicker, 4000);
            }
        };
        
        setTimeout(updateTicker, 500);
        
        const updateFromCurrentTerrain = () => {
            if (this.introSkipped || this.currentPhase !== 3) return;
            
            const location = this.terrainLocations[this.currentTerrainKey];
            if (!location) return;
            
            if (coordsEl) coordsEl.textContent = location.geoInfo.coords;
            if (sectorEl) sectorEl.textContent = location.label;
            if (elevEl) elevEl.textContent = location.geoInfo.elevation;
            if (terrainEl) terrainEl.textContent = location.geoInfo.climate;
            
            // Generate dynamic data
            if (tempEl) {
                const temp = -20 + Math.random() * 60;
                tempEl.textContent = temp.toFixed(1) + '°C';
            }
            if (pressureEl) {
                const pressure = 950 + Math.random() * 100;
                pressureEl.textContent = pressure.toFixed(0) + ' hPa';
            }
            if (magneticEl) {
                const magnetic = 25 + Math.random() * 40;
                magneticEl.textContent = magnetic.toFixed(1) + ' μT';
            }
            
            setTimeout(updateFromCurrentTerrain, 2000);
        };
        
        setTimeout(updateFromCurrentTerrain, 1000);
    }

    // ========================================
    // EARTH EARTHQUAKE VISUALIZATION SYSTEM
    // ========================================
    // (Esta sección permanece igual, solo cambia su uso)
    
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
                
                this.playVoiceAudio(this.stellarAudio.voiceDataUser);
                
                if (this.stellarAudio.voiceDataUser) {
                    this.stellarAudio.voiceDataUser.addEventListener('timeupdate', () => this.updateSubtitlesPhase4());
                    this.stellarAudio.voiceDataUser.onended = () => {
                        // After voiceDataUser, transition to recovery protocol
                        this.playBrainRecoveryPhase(resolve);
                    };
                } else {
                    setTimeout(() => {
                        if (!this.introSkipped) {
                            phaseBody.classList.remove('active');
                        }
                        resolve();
                    }, 32000);
                }
            }, 1500);
        });
    }

    async playBrainRecoveryPhase(resolve) {
        console.log('[ANIMATIONS] Brain Recovery Phase initiated');
        const phaseBody = this.elements.phaseBody;
        const bodySubtitle = this.elements.bodySubtitle;

        // Ensure subtitle area is clear before starting new subtitles
        if (bodySubtitle) bodySubtitle.textContent = '';

        if (!this.stellarAudio.voiceRecoveryProtocol) {
            console.warn('[ANIMATIONS] voiceRecoveryProtocol not loaded, skipping recovery phase');
            if (!this.introSkipped) {
                phaseBody.classList.remove('active');
            }
            return resolve();
        }

        // Play the recovery protocol audio
        this.playVoiceAudio(this.stellarAudio.voiceRecoveryProtocol);

        // Update subtitles for recovery protocol
        this.stellarAudio.voiceRecoveryProtocol.addEventListener('timeupdate', () => this.updateSubtitlesRecoveryProtocol());

        // When recovery protocol audio ends, finalize phase 4
        this.stellarAudio.voiceRecoveryProtocol.onended = () => {
            console.log('[ANIMATIONS] Brain Recovery Protocol audio ended, finalizing Phase 4');
            setTimeout(() => {
                if (!this.introSkipped) {
                    bodySubtitle?.classList.remove('visible');
                    phaseBody.classList.remove('active'); // Turn off the brain phase
                }
                resolve(); // Resolve the promise for playStellarPhase4
            }, 1500); // Small delay before resolving
        };
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
    
    updateSubtitlesRecoveryProtocol() {
        if (this.introSkipped || !this.stellarAudio.voiceRecoveryProtocol) return;
        
        const currentTime = this.stellarAudio.voiceRecoveryProtocol.currentTime;
        const bodySubtitle = this.elements.bodySubtitle;
        if (!bodySubtitle) return;
        
        const currentSub = this.subtitlesRecoveryProtocol.find(sub =>
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub && bodySubtitle.textContent !== currentSub.text) {
            bodySubtitle.textContent = currentSub.text;
            bodySubtitle.classList.add('visible');
        } else if (currentTime >= this.subtitlesRecoveryProtocol[this.subtitlesRecoveryProtocol.length - 1].end) {
            bodySubtitle.classList.remove('visible');
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
                    <span class="brain-icon">⚡</span>
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
            this.playVoiceAudio(this.stellarAudio.voiceFinal);
            
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
            } else {
                setTimeout(() => {
                    if (!this.introSkipped) {
                        phaseBoarding.classList.remove('active');
                    }
                    resolve();
                }, 15000);
            }
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
        this.stopSurvivorAudio();

        // Cleanup all visualizations
        this.cleanupTerrain();
        this.cleanupEarth();
        this.cleanupBrain();
        this.transitionFromStellarToMain();
    }

    // ========================================
    // TRANSITION AND CLEANUP
    // ========================================
    
    transitionFromStellarToMain() {
        console.log('[ANIMATIONS] Transitioning to main...');
        
        this.cleanupSkipFunctionality();
        this.stopSurvivorAudio();
        this.cleanupEarth();
        
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
        this.cleanupTerrain();
        this.cleanupEarth();
        this.cleanupBrain();
        
        if (this.terrainInterval) {
            clearInterval(this.terrainInterval);
            this.terrainInterval = null;
        }
    }

    // ========================================
    // CLEANUP FUNCTIONS
    // ========================================
    
    cleanupEarth() {
        console.log('[ANIMATIONS] Cleaning up Earth visualization');
        
        if (this.earthViz) {
            this.earthViz.destroy();
            this.earthViz = null;
        }
        
        if (this.earthCatastropheViz) {
            this.earthCatastropheViz.destroy();
            this.earthCatastropheViz = null;
        }
        
        this.earthActive = false;
        
        console.log('[ANIMATIONS] Earth cleanup complete');
    }
    
    cleanupBrain() {
        console.log('[ANIMATIONS] Cleaning up brain');
        
        if (this.brainAnimationFrame) {
            cancelAnimationFrame(this.brainAnimationFrame);
            this.brainAnimationFrame = null;
        }
        
        if (this.brainMesh && this.brainScene) {
            this.brainScene.remove(this.brainMesh);
            this.cleanupMesh(this.brainMesh);
            this.brainMesh = null;
        }
        
        if (this.brainParticles && this.brainScene) {
            this.brainScene.remove(this.brainParticles);
           
           
            if (this.brainParticles.geometry) {
                this.brainParticles.geometry.dispose();
            }
            if (this.brainParticles.material) {
                this.brainParticles.material.dispose();
            }
            this.brainParticles = null;
        }
        
        if (this.neuralConnections && this.brainScene) {
            this.brainScene.remove(this.neuralConnections);
            if (this.neuralConnections.geometry) {
                this.neuralConnections.geometry.dispose();
            }
            if (this.neuralConnections.material) {
                this.neuralConnections.material.dispose();
            }
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
        
        if (this.brainControls) {
            this.brainControls.dispose();
            this.brainControls = null;
        }
        
        this.brainScene = null;
        this.brainCamera = null;
        this.brainRegions = {};
        
        console.log('[ANIMATIONS] Brain cleanup complete');
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

    cleanupTerrain() {
        console.log('[ANIMATIONS] Cleaning up terrain');
        
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
        console.log('[ANIMATIONS] Destroying AnimationsManager');
        
        this.animationQueue = [];
        this.rafCallbacks.clear();
        this.isAnimating = false;
        
        this.stopAllAudio();
        this.cleanupTerrain();
        this.cleanupEarth();
        this.cleanupBrain();
        this.cleanupSkipFunctionality();
        
        if (this.elements) {
            this.elements = null;
        }
        
        this.initialized = false;
        console.log('[ANIMATIONS] AnimationsManager destroyed');
    }
}

// ========================================
// EARTH EARTHQUAKE VISUALIZATION CLASS
// ========================================

class EarthquakeVisualization {
    constructor(canvasElement, panelElement) {
        this.canvas = canvasElement;
        this.panel = panelElement;
        
        this.earthquakeData = [];
        this.earthquakeStats = {
            totalQuakes: 0,
            maxMagnitude: 0,
            worstRegion: '',
            deadliestYear: ''
        };
        
        // Three.js objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earthMesh = null;
        this.earthquakePoints = [];
        this.animationFrame = null;
        
        // State
        this.isActive = false;
        this.isLoading = false;
        this.isInitialized = false;
        
        // Performance
        this.isLowPowerMode = this.detectLowPowerDevice();
        this.shouldUseOptimizedMode = window.innerWidth <= 768 || this.isLowPowerMode;
    }
    
    detectLowPowerDevice() {
        return navigator.hardwareConcurrency <= 2 || 
               navigator.connection?.effectiveType === 'slow-2g' ||
               navigator.connection?.effectiveType === '2g' ||
               navigator.deviceMemory < 4;
    }
    
    init() {
        console.log('[EARTH] Initializing Earthquake Visualization');
        
        if (!this.canvas) {
            console.error('[EARTH] Canvas element not provided!');
            return false;
        }
        
        this.setupScene();
        this.isInitialized = true;
        
        return true;
    }
    
    setupScene() {
        console.log('[EARTH] Setting up Three.js scene');
        
        try {
            // Get canvas dimensions
            const rect = this.canvas.getBoundingClientRect();
            const width = rect.width || window.innerWidth;
            const height = rect.height || window.innerHeight;
            
            // Scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000000);
            
            // Camera
            this.camera = new THREE.PerspectiveCamera(
                60, 
                width / height, 
                1, 
                100000
            );
            this.camera.position.set(0, 0, this.shouldUseOptimizedMode ? 12000 : 10000);
            
            // Renderer
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.canvas,
                antialias: !this.shouldUseOptimizedMode,
                alpha: false,
                powerPreference: this.shouldUseOptimizedMode ? "low-power" : "high-performance"
            });
            
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.renderer.setClearColor(0x0a0a15, 1);
            this.renderer.shadowMap.enabled = !this.shouldUseOptimizedMode;
            
            // Controls
            if (THREE.OrbitControls) {
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.08;
                this.controls.autoRotate = true;
                this.controls.autoRotateSpeed = this.shouldUseOptimizedMode ? 0.1 : 0.2;
                this.controls.minDistance = 3000;
                this.controls.maxDistance = this.shouldUseOptimizedMode ? 20000 : 15000;
                this.controls.enableZoom = true;
                this.controls.enablePan = true;
                this.controls.enableRotate = true;
                this.controls.update();
            }
            
            // Lighting
            this.setupLighting();
            
            // Create Earth
            this.createEarth();
            
            // Setup resize handler
            this.setupResizeHandler();
            
            console.log('[EARTH] Three.js scene setup complete');
            
        } catch (error) {
            console.error('[EARTH] Error setting up scene:', error);
            this.createFallback();
            return false;
        }
        
        return true;
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5000, 3000, 5000);
        this.scene.add(directionalLight);
        
        // Point lights for better depth perception
        if (!this.shouldUseOptimizedMode) {
            const pointLight = new THREE.PointLight(0x00aaff, 0.3, 10000);
            pointLight.position.set(0, 0, -5000);
            this.scene.add(pointLight);
        }
    }
    
    createEarth() {
        console.log('[EARTH] Creating Earth model');
        
        // Optimize geometry based on device capability
        const segments = this.shouldUseOptimizedMode ? 32 : 64;
        const radius = 2000;
        
        // Earth geometry
        const earthGeometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Earth material
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 1,
            wireframe: false,
        });
        
        this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        this.scene.add(this.earthMesh);
        
        // Add atmosphere glow (only if not in optimized mode)
        if (!this.shouldUseOptimizedMode) {
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
        
        console.log('[EARTH] Earth model created');
    }
    
    async loadEarthquakeData() {
        console.log('[EARTH] Loading earthquake data...');
        this.isLoading = true;
        
        try {
            // Try different data sources in sequence
            await this.loadDataFromSources();
        } catch (error) {
            console.log('[EARTH] All data loading failed, creating simulation:', error.message);
            this.createSimulatedData();
        }
        
        this.updateUI();
        this.isLoading = false;
        
        // Start animation if not already running
        if (!this.animationFrame && this.isActive) {
            this.animate();
        }
        
        console.log('[EARTH] Earthquake data loaded successfully');
    }
    
    async loadDataFromSources() {
        const sources = [
            { type: 'ply', path: '/src/model_3d/earthquakes.ply' },
            { type: 'glb', path: '/src/model_3d/earthquakes_-_2000_to_2019.glb' },
            { type: 'json', path: '/src/model_3d/earthquakes.json' }
        ];
        
        for (const source of sources) {
            try {
                console.log(`[EARTH] Trying ${source.type} source: ${source.path}`);
                
                switch (source.type) {
                    case 'ply':
                        await this.loadPLYData(source.path);
                        break;
                    case 'glb':
                        await this.loadGLBData(source.path);
                        break;
                    case 'json':
                        await this.loadJSONData(source.path);
                        break;
                }
                
                // If we reach here, loading succeeded
                console.log(`[EARTH] Successfully loaded ${source.type} data`);
                return;
                
            } catch (error) {
                console.log(`[EARTH] Failed to load ${source.type}:`, error.message);
                continue;
            }
        }
        
        // If all sources fail
        throw new Error('All data sources failed');
    }
    
    async loadPLYData(path) {
        return new Promise((resolve, reject) => {
            if (!THREE.PLYLoader) {
                reject(new Error('PLYLoader not available'));
                return;
            }
            
            const loader = new THREE.PLYLoader();
            loader.load(
                path,
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
    }
    
    async loadGLBData(path) {
        return new Promise((resolve, reject) => {
            if (!THREE.GLTFLoader) {
                reject(new Error('GLTFLoader not available'));
                return;
            }
            
            const loader = new THREE.GLTFLoader();
            loader.load(
                path,
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
    }
    
    async loadJSONData(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.earthquakes) {
            this.earthquakeData = data.earthquakes;
            this.earthquakeStats = data.statistics || this.calculateStatsFromData(data.earthquakes);
            this.visualizeJSONData();
        } else {
            throw new Error('Invalid JSON structure');
        }
    }
    
    processPLYGeometry(geometry) {
        // Create material
        const material = new THREE.PointsMaterial({
            size: this.shouldUseOptimizedMode ? 4 : 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        // Scale and position
        const scale = this.shouldUseOptimizedMode ? 50 : 100;
        geometry.scale(scale, scale, scale);
        
        // Create points mesh
        const points = new THREE.Points(geometry, material);
        points.position.set(0, 0, 0);
        
        this.scene.add(points);
        this.earthquakePoints.push(points);
        
        // Extract statistics
        this.extractStatsFromGeometry(geometry);
    }
    
    processGLBModel(model) {
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                // Convert mesh to points for better performance
                const pointsMaterial = new THREE.PointsMaterial({
                    size: this.shouldUseOptimizedMode ? 3 : 6,
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
        
        this.earthquakeStats = {
            totalQuakes: 10000,
            maxMagnitude: 9.1,
            worstRegion: 'Global Dataset',
            deadliestYear: '2011'
        };
    }
    
    visualizeJSONData() {
        console.log('[EARTH] Visualizing JSON earthquake data');
        
        const positions = [];
        const colors = [];
        const sizes = [];
        
        this.earthquakeData.forEach((quake) => {
            // Convert lat/lon/depth to 3D coordinates
            const coords = this.latLonToXYZ(quake.lat, quake.lon, quake.depth);
            positions.push(coords.x, coords.y, coords.z);
            
            // Color based on magnitude
            const color = this.magnitudeToColor(quake.mag);
            colors.push(color.r, color.g, color.b);
            
            // Size based on magnitude
            sizes.push(Math.max(2, quake.mag * (this.shouldUseOptimizedMode ? 1.0 : 1.5)));
        });
        
        // Create geometry
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: this.shouldUseOptimizedMode ? 4 : 8,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        // Create points
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        this.earthquakePoints.push(points);
    }
    
    createSimulatedData() {
        console.log('[EARTH] Creating simulated earthquake data');
        
        const count = this.shouldUseOptimizedMode ? 500 : 1000;
        const positions = [];
        const colors = [];
        const magnitudes = [];
        
        // Pacific Ring of Fire coordinates
        const ringOfFireCoords = [
            { lat: 61.02, lon: -147.65 }, // Alaska
            { lat: 51.79, lon: 176.13 }, // Aleutian Islands
            { lat: 35.36, lon: 138.73 }, // Japan
            { lat: 23.78, lon: 121.00 }, // Taiwan
            { lat: 14.08, lon: 120.89 }, // Philippines
            { lat: -6.92, lon: 107.60 }, // Indonesia
            { lat: -41.29, lon: 174.78 }, // New Zealand
            { lat: -15.48, lon: -172.10 }, // Samoa
            { lat: 19.43, lon: -155.29 }, // Hawaii
            { lat: 37.77, lon: -122.42 }, // California
            { lat: 60.98, lon: -147.00 }, // Alaska (again)
            { lat: -17.55, lon: -149.60 }, // Tahiti
            { lat: 52.16, lon: -176.20 }, // Aleutian Islands 2
            { lat: 39.74, lon: 116.12 }, // Beijing area
            { lat: -9.08, lon: 157.25 }  // Solomon Islands
        ];
        
        for (let i = 0; i < count; i++) {
            let lat, lon;
            
            // 70% in Ring of Fire, 30% random
            if (i < count * 0.7 && ringOfFireCoords.length > 0) {
                const coord = ringOfFireCoords[Math.floor(Math.random() * ringOfFireCoords.length)];
                lat = coord.lat + (Math.random() - 0.5) * 20;
                lon = coord.lon + (Math.random() - 0.5) * 20;
            } else {
                lat = (Math.random() - 0.5) * 180;
                lon = (Math.random() - 0.5) * 360;
            }
            
            const depth = Math.random() * 100;
            const magnitude = 3 + Math.random() * 6;
            
            const coords = this.latLonToXYZ(lat, lon, depth);
            positions.push(coords.x, coords.y, coords.z);
            
            const color = this.magnitudeToColor(magnitude);
            colors.push(color.r, color.g, color.b);
            magnitudes.push(magnitude);
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: this.shouldUseOptimizedMode ? 3 : 6,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });
        
        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
        this.earthquakePoints.push(points);
        
        // Calculate stats
        this.earthquakeStats = {
            totalQuakes: count,
            maxMagnitude: Math.max(...magnitudes),
            worstRegion: 'Pacific Ring of Fire',
            deadliestYear: '2011'
        };
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
            return { r: 0.2, g: 0.5, b: 1.0 }; // Blue for low magnitude
        } else if (normalized < 0.6) {
            return { r: 1.0, g: 1.0, b: 0.0 }; // Yellow for medium
        } else {
            return { r: 1.0, g: 0.2, b: 0.1 }; // Red for high
        }
    }
    
    extractStatsFromGeometry(geometry) {
        const count = geometry.attributes.position ? geometry.attributes.position.count : 0;
        
        this.earthquakeStats = {
            totalQuakes: count,
            maxMagnitude: 9.1,
            worstRegion: 'Global Dataset',
            deadliestYear: '2011'
        };
    }
    
    calculateStatsFromData(earthquakes) {
        let maxMag = 0;
        let regionCounts = {};
        
        earthquakes.forEach(quake => {
            maxMag = Math.max(maxMag, quake.mag || 0);
            
            // Simple region detection based on coordinates
            const region = this.getRegionFromCoords(quake.lat, quake.lon);
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });
        
        // Find worst region
        let worstRegion = '';
        let maxCount = 0;
        Object.entries(regionCounts).forEach(([region, count]) => {
            if (count > maxCount) {
                maxCount = count;
                worstRegion = region;
            }
        });
        
        return {
            totalQuakes: earthquakes.length,
            maxMagnitude: maxMag,
            worstRegion: worstRegion || 'Unknown',
            deadliestYear: '2011' // Default
        };
    }
    
    getRegionFromCoords(lat, lon) {
        if (lat > 20 && lat < 60 && lon > 100 && lon < 160) return 'Asia-Pacific';
        if (lat > -60 && lat < 20 && lon > -160 && lon < -60) return 'Americas';
        if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return 'Europe';
        if (lat > -90 && lat < -60) return 'Antarctica';
        return 'Global';
    }
    
    updateUI() {
        // Update stats in UI
        const statsElements = {
            'quakeCount': this.earthquakeStats.totalQuakes?.toLocaleString() || '0',
            'maxMagnitude': this.earthquakeStats.maxMagnitude?.toFixed(1) || '0.0',
            'worstRegion': this.earthquakeStats.worstRegion || 'Unknown',
            'deadliestQuake': `${this.earthquakeStats.deadliestYear || 'Unknown'} (Magnitude ${this.earthquakeStats.maxMagnitude?.toFixed(1) || '0.0'})`
        };
        
        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        console.log('[EARTH] UI updated with stats:', this.earthquakeStats);
    }
    
    animate() {
        if (!this.scene || !this.renderer || !this.camera || !this.isActive) {
            return;
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Rotate Earth
        if (this.earthMesh) {
            this.earthMesh.rotation.y += this.shouldUseOptimizedMode ? 0.0005 : 0.001;
        }
        
        // Animate earthquake points
        const time = Date.now() * 0.001;
        this.earthquakePoints.forEach((points, index) => {
            if (points.material) {
                // Subtle pulsing effect
                const pulse = Math.sin(time * 2 + index) * 0.15 + 0.85;
                points.material.opacity = 0.7 * pulse;
                
                // Gentle floating animation for points
                if (points.geometry.attributes.position) {
                    const positions = points.geometry.attributes.position.array;
                    const count = positions.length / 3;
                    
                    for (let i = 0; i < count; i++) {
                        const idx = i * 3;
                        // Very subtle movement to create organic feel
                        positions[idx] += Math.sin(time + i) * 0.01;
                        positions[idx + 1] += Math.cos(time * 0.7 + i) * 0.01;
                        positions[idx + 2] += Math.sin(time * 0.5 + i) * 0.01;
                    }
                    
                    points.geometry.attributes.position.needsUpdate = true;
                }
            }
        });
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    setupResizeHandler() {
        this.handleResize = () => {
            if (!this.camera || !this.renderer || !this.canvas) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            if (width > 0 && height > 0) {
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width, height);
            }
        };
        
        // Initial resize
        this.handleResize();
        
        // Listen for resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Observe container resize
        if (this.canvas.parentElement) {
            this.resizeObserver = new ResizeObserver(() => {
                this.handleResize();
            });
            this.resizeObserver.observe(this.canvas.parentElement);
        }
    }
    
    createFallback() {
        console.log('[EARTH] Creating 2D fallback visualization');
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        const draw = () => {
            if (!this.isActive) return;
            
            const width = this.canvas.width;
            const height = this.canvas.height;
            
            ctx.clearRect(0, 0, width, height);
            
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(centerX, centerY) * 0.4;
            
            // Draw Earth
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(26, 26, 62, 0.8)';
            ctx.fill();
            
            // Draw grid
            ctx.strokeStyle = 'rgba(0, 170, 255, 0.2)';
            ctx.lineWidth = 1;
            
            // Latitude lines
            for (let i = -80; i <= 80; i += 20) {
                const latRad = i * Math.PI / 180;
                const y = centerY + radius * Math.sin(latRad);
                const xRadius = radius * Math.cos(latRad);
                
                ctx.beginPath();
                ctx.ellipse(centerX, y, xRadius, radius * 0.1, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Earthquake points
            const time = Date.now() * 0.001;
            for (let i = 0; i < 50; i++) {
                const angle = (i / 50) * Math.PI * 2;
                const pulse = Math.sin(time + i) * 0.5 + 0.5;
                const distance = radius * (1 + pulse * 0.1);
                
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                ctx.beginPath();
                ctx.arc(x, y, 2 + pulse * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, ${150 + pulse * 105}, 0, ${0.6 + pulse * 0.2})`;
                ctx.fill();
            }
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
    
    start() {
        if (!this.isInitialized) {
            if (!this.init()) {
                console.error('[EARTH] Failed to initialize visualization');
                return false;
            }
        }
        
        this.isActive = true;
        
        // Load data if not already loaded
        if (this.earthquakePoints.length === 0) {
            this.loadEarthquakeData();
        }
        
        // Start animation
        if (!this.animationFrame) {
            this.animate();
        }
        
        console.log('[EARTH] Visualization started');
        return true;
    }
    
    stop() {
        this.isActive = false;
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        console.log('[EARTH] Visualization stopped');
    }
    
    destroy() {
        this.stop();
        
        // Remove resize listeners
        window.removeEventListener('resize', this.handleResize);
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Clean up Three.js objects
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
        this.isInitialized = false;
        
        console.log('[EARTH] Visualization destroyed');
    }
}

// Export and instantiate
const animationsManager = new AnimationsManager();
export { animationsManager };
window.animationsManager = animationsManager;
export default animationsManager;