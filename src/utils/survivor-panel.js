/**
 * SURVIVOR PANEL MODULE
 * 
 * Panel de mensajes de sobrevivientes estilo Chicago UI:
 * - Panel horizontal inferior
 * - Lista de mensajes scrolleable
 * - Reproductor de audio
 * - Transcripciones
 * - Secuencia de sonidos (bcomms-on, lifesupport-on, voice)
 */

export default class SurvivorPanel {
    
    constructor(manager) {
        this.manager = manager;
        
        this.panel = null;
        this.currentMessageIndex = 0;
        this.isMessagePlaying = false;
        this.currentPlayingAudio = null;
        
        // Mensajes de sobrevivientes
        this.messages = [
            {
                id: 1,
                type: 'survivor',
                title: 'SURVIVOR TRANSMISSION',
                subtitle: '▄▕▜▚▣',
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
                subtitle: 'LOST DATA ▞▟▘▀',
                location: 'Unknown',
                timestamp: '2090.03.15 - 14:28',
                audioPath: '/src/sfx/lost-data-voice.oga',
                transcript: "▀▕▗▛▄▕▜▚▣ ▜▚▗▣▗▫▔▉▔ ▛▄▕▅▗▕. ▣▗▉▛▄▕▜▉▣ ▚ ▕▞▣▗▕▗▣. ▣▗▃▀▚▗▉▉▔. ▕▛▀▗▞▃▉▄ ▛▉▗▄▕▜▚▣ ▅▕▗▉▕ ▕▔▫▞▣ ▚ ▛▄▅▗▕ ▚ ▕▞▣▗▕▗▣ ▚▛▘▞▉▕▅",
                status: 'AUTHENTICATED'
            }
        ];
        
        // Audio SFX
        this.survivorAudio = {
            voices: {},
            bcommsOn: null,
            lifesupportOn: null
        };
    }
    
    init() {
        console.log('[SURVIVOR] Initializing survivor panel');
        this.createPanel();
        this.preloadAudio();
    }
    
    createPanel() {
        if (this.panel && document.getElementById('sp-survivorMessagesPanel')) {
            console.log('[SURVIVOR] Panel already exists');
            return;
        }
        
        const panel = document.createElement('div');
        panel.id = 'sp-survivorMessagesPanel';
        panel.className = 'sp-survivor-messages-panel';
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
                <div class="sp-messages-list" id="sp-messagesList"></div>
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
        this.panel = panel;
        
        this.populateMessages();
        this.setupEventListeners();
        
        console.log('[SURVIVOR] Panel created');
    }
    
    preloadAudio() {
        const loadAudio = (src, volume) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'auto';
            return audio;
        };
        
        try {
            this.survivorAudio.voices[1] = loadAudio('/src/sfx/survivor_voice.oga', 0.8);
            this.survivorAudio.voices[3] = loadAudio('/src/sfx/lost-data-voice.oga', 0.8);
            this.survivorAudio.bcommsOn = loadAudio('/src/sfx/bcomms-on.mp3', 0.4);
            this.survivorAudio.lifesupportOn = loadAudio('/src/sfx/lifesupport-on.mp3', 0.4);
            
            console.log('[SURVIVOR] Audio preloaded');
        } catch (error) {
            console.error('[SURVIVOR] Audio preload error:', error);
        }
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
                    <span class="sp-message-location">◈ ${message.location}</span>
                    <span class="sp-message-timestamp">// ${message.timestamp}</span>
                </div>
            `;
            
            messageCard.addEventListener('click', () => this.selectMessage(index));
            messagesList.appendChild(messageCard);
        });
    }
    
    setupEventListeners() {
        const closeBtn = document.getElementById('sp-closeSurvivorPanel');
        if (closeBtn) {
            closeBtn.replaceWith(closeBtn.cloneNode(true));
            const newCloseBtn = document.getElementById('sp-closeSurvivorPanel');
            newCloseBtn.addEventListener('click', () => this.hide());
        }
        
        const playPauseBtn = document.getElementById('sp-playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.replaceWith(playPauseBtn.cloneNode(true));
            const newPlayPauseBtn = document.getElementById('sp-playPauseBtn');
            newPlayPauseBtn.addEventListener('click', () => this.togglePlayback());
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
        
        this.stopPlayback();
    }
    
    togglePlayback() {
        if (this.isMessagePlaying) {
            this.stopPlayback();
        } else {
            this.playMessage();
        }
    }
    
    playMessage() {
        const message = this.messages[this.currentMessageIndex];
        if (!message) return;
        
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
            this.playAudioSequence(message.id);
        }
    }
    
    playAudioSequence(messageId) {
        const voiceAudio = this.survivorAudio.voices[messageId];
        if (!voiceAudio) return;
        
        if (this.survivorAudio.bcommsOn) {
            this.survivorAudio.bcommsOn.currentTime = 0;
            this.survivorAudio.bcommsOn.play().catch(e => console.error('[SURVIVOR] bcomms error:', e));
            
            this.survivorAudio.bcommsOn.onended = () => {
                if (this.survivorAudio.lifesupportOn) {
                    this.survivorAudio.lifesupportOn.currentTime = 0;
                    this.survivorAudio.lifesupportOn.play().catch(e => console.error('[SURVIVOR] lifesupport error:', e));
                    
                    this.survivorAudio.lifesupportOn.onended = () => {
                        this.playVoice(voiceAudio, messageId);
                    };
                } else {
                    this.playVoice(voiceAudio, messageId);
                }
            };
        } else {
            this.playVoice(voiceAudio, messageId);
        }
    }
    
    playVoice(voiceAudio, messageId) {
        if (this.currentPlayingAudio && !this.currentPlayingAudio.paused) {
            this.currentPlayingAudio.pause();
            this.currentPlayingAudio.currentTime = 0;
        }
        
        this.currentPlayingAudio = voiceAudio;
        voiceAudio.currentTime = 0;
        voiceAudio.play().catch(e => console.error('[SURVIVOR] Voice error:', e));
        
        voiceAudio.onended = () => {
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
        };
    }
    
    stopPlayback() {
        this.isMessagePlaying = false;
        
        const playPauseBtn = document.getElementById('sp-playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
        }
        
        if (this.currentPlayingAudio) {
            this.currentPlayingAudio.pause();
            this.currentPlayingAudio.currentTime = 0;
            this.currentPlayingAudio = null;
        }
    }
    
    show() {
        if (!this.panel) {
            this.createPanel();
        }
        
        this.panel.style.zIndex = '999999999999';
        this.panel.classList.add('sp-visible');
        this.panel.style.pointerEvents = 'auto';
        this.panel.style.visibility = 'visible';
        
        requestAnimationFrame(() => {
            this.panel.style.removeProperty('visibility');
            this.panel.style.pointerEvents = 'auto';
        });
        
        if (this.messages.length > 0) {
            this.selectMessage(0);
        }
        
        console.log('[SURVIVOR] Panel shown');
    }
    
    hide() {
        if (this.panel) {
            this.panel.classList.remove('sp-visible');
            this.stopPlayback();
            this.panel.style.pointerEvents = 'none';
        }
    }
    
    destroy() {
        this.stopPlayback();
        if (this.panel) {
            this.panel.remove();
            this.panel = null;
        }
        console.log('[SURVIVOR] Destroyed');
    }
}
