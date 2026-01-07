/**
 * TERRAIN LOCATIONS MODULE
 * 
 * Maneja todas las ubicaciones de terrenos:
 * - Selector dropdown para cambiar terrenos
 * - Paneles laterales con información geográfica
 * - Transiciones suaves entre terrenos
 * - Carga de datos JSON desde S3
 */

export default class TerrainLocations {
    
    constructor(terrainPhase) {
        this.phase = terrainPhase;
        
        this.locations = {
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
        
        this.currentKey = 'franzjosefglacier';
        this.baseURL = 'https://s3.ca-central-1.amazonaws.com/kevinnewcombe/three-terrain/';
        
        this.selectorPanel = null;
        this.leftPanel = null;
        this.rightPanel = null;
    }
    
    /**
     * Inyectar estilos dinámicamente
     * Replica injectGeoInfoStyles() de animations.js original
     */
    injectStyles() {
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
    
    init() {
        console.log('[TERRAIN] Initializing terrain locations system');
        this.injectStyles();
        this.createUI();
        this.displayGeoInfo(this.locations[this.currentKey].geoInfo);
    }
    
    createUI() {
        const container = document.querySelector('.globe-container');
        if (!container) return;
        
        this.createSelectorPanel(container);
        this.createInfoPanels(container);
    }
    
    createSelectorPanel(container) {
        let panel = document.getElementById('terrainSelectorPanel');
        if (panel) return;
        
        panel = document.createElement('div');
        panel.id = 'terrainSelectorPanel';
        panel.className = 'terrain-selector-panel';
        panel.innerHTML = `
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
                <option value="athabasca">Athabasca Glacier</option>
                <option value="franzjosefglacier" selected>Franz Josef Glacier</option>
                <option value="grouse">Grouse Grind</option>
                <option value="jotunheimen">Jotunheimen</option>
                <option value="lakecomo">Lake Como</option>
                <option value="petra">Petra</option>
                <option value="sanfrancisco">San Francisco</option>
                <option value="valparaiso">Valparaíso</option>
            </select>
            <div class="selector-hint">EXPLORE EARTH'S TERRAIN</div>
        `;
        
        container.appendChild(panel);
        this.selectorPanel = panel;
        
        const selector = panel.querySelector('#terrainSelector');
        selector.addEventListener('change', (e) => {
            this.changeTerrain(e.target.value);
        });
        
        console.log('[TERRAIN] Selector panel created');
    }
    
    createInfoPanels(container) {
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
            container.appendChild(leftPanel);
        }
        this.leftPanel = leftPanel;
        
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
            container.appendChild(rightPanel);
        }
        this.rightPanel = rightPanel;
        
        console.log('[TERRAIN] Info panels created');
    }
    
    displayGeoInfo(geoInfo) {
        const leftContent = document.getElementById('geoContentLeft');
        const rightContent = document.getElementById('geoContentRight');
        
        if (!leftContent || !rightContent) return;
        
        leftContent.innerHTML = '';
        rightContent.innerHTML = '';
        
        this.leftPanel?.classList.add('visible');
        this.rightPanel?.classList.add('visible');
        
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
        if (!element || this.phase.isSkipped) return;
        
        let index = 0;
        element.classList.add('typing');
        
        const type = () => {
            if (this.phase.isSkipped || index >= text.length) {
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
    
    changeTerrain(terrainKey) {
        if (!this.locations[terrainKey]) {
            console.error('[TERRAIN] Terrain not found:', terrainKey);
            return;
        }
        
        console.log('[TERRAIN] Changing to:', terrainKey);
        this.currentKey = terrainKey;
        
        const location = this.locations[terrainKey];
        this.displayGeoInfo(location.geoInfo);
        
        this.phase.loadTerrain(terrainKey);
    }
    
    destroy() {
        if (this.selectorPanel) {
            this.selectorPanel.remove();
            this.selectorPanel = null;
        }
        if (this.leftPanel) {
            this.leftPanel.remove();
            this.leftPanel = null;
        }
        if (this.rightPanel) {
            this.rightPanel.remove();
            this.rightPanel = null;
        }
        
        console.log('[TERRAIN] Locations system destroyed');
    }
}
