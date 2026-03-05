/**
 * AUDIO MANAGER MODULE
 * 
 * Maneja todo el sistema de audio:
 * - Música de fondo
 * - Voces de narración
 * - Efectos de sonido (SFX)
 * - Transiciones
 * - Control de volumen
 * - Prevención de solapamiento de voces
 */

export default class AudioManager {
    
    constructor(manager) {
        this.manager = manager;
        
        // Audio elements
        this.audio = {
            bgMusic: null,
            voiceIntro: null,
            voiceDataDisplay: null,
            voiceDataEarth: null,
            voiceDataUser: null,
            voiceNeuralNetwork: null,
            voiceRecoveryProtocol: null,
            voiceFinal: null,
            transitions: [],
            sfx: {}
        };
        
        // Volume configuration
        this.volumes = {
            bgMusic: 0.25,
            voiceIntro: 0.75,
            voiceDataDisplay: 0.75,
            voiceDataEarth: 0.75,
            voiceDataUser: 0.75,
            voiceNeuralNetwork: 0.75,
            voiceRecoveryProtocol: 0.75,
            voiceFinal: 0.70,
            transition: 0.40,
            sfx: 0.40
        };
        
        // SFX tracking
        this.sfxPlayed = {
            textRollover: false,
            scanZoom: false,
            textAnimation: false,
            affirmation: false
        };
        
        // Voice control
        this.currentVoiceAudio = null;
        this.isVoicePlaying = false;
    }
    
    async init() {
        console.log('[AUDIO] Initializing audio system');
        this.preloadAll();
    }
    
    preloadAll() {
        const loadAudio = (src, volume, loop = false) => {
            const audio = new Audio(src);
            audio.volume = volume;
            audio.preload = 'metadata';
            audio.loop = loop;
            return audio;
        };

        try {
            // Background music (loops)
            if (!this.audio.bgMusic) {
                this.audio.bgMusic = loadAudio('/src/sfx/Isolated_System.ogg', this.volumes.bgMusic, true);
            }
            
            // Voice narrations
            if (!this.audio.voiceIntro) {
                this.audio.voiceIntro = loadAudio('/src/starvortex_assets/voice_intro.mp3', this.volumes.voiceIntro);
            }
            if (!this.audio.voiceDataDisplay) {
                this.audio.voiceDataDisplay = loadAudio('/src/starvortex_assets/voice-data-display.mp3', this.volumes.voiceDataDisplay);
            }
            if (!this.audio.voiceDataEarth) {
                this.audio.voiceDataEarth = loadAudio('/src/starvortex_assets/voice-data-earth.mp3', this.volumes.voiceDataEarth);
            }
            if (!this.audio.voiceDataUser) {
                this.audio.voiceDataUser = loadAudio('/src/starvortex_assets/voice-data-user.mp3', this.volumes.voiceDataUser);
            }
            if (!this.audio.voiceNeuralNetwork) {
                this.audio.voiceNeuralNetwork = loadAudio('/src/starvortex_assets/voice-neural-network.mp3', this.volumes.voiceNeuralNetwork);
            }
            if (!this.audio.voiceRecoveryProtocol) {
                this.audio.voiceRecoveryProtocol = loadAudio('/src/starvortex_assets/voice_recovery-protocol.ogg', this.volumes.voiceRecoveryProtocol);
            }
            if (!this.audio.voiceFinal) {
                this.audio.voiceFinal = loadAudio('/src/starvortex_assets/voice-final.mp3', this.volumes.voiceFinal);
            }
            
            // Transitions
            if (!this.audio.transitions || this.audio.transitions.length === 0) {
                this.audio.transitions = [
                    loadAudio('/src/sfx/FX_flow_transition_data-tech.mp3', this.volumes.transition),
                    loadAudio('/src/sfx/FX_Transition.mp3', this.volumes.transition)
                ];
            }
            
            // SFX
            if (!this.audio.sfx.textRollover) {
                this.audio.sfx.textRollover = loadAudio('/src/sfx/UI_menu_text_rollover_2.mp3', this.volumes.sfx);
            }
            if (!this.audio.sfx.scanZoom) {
                this.audio.sfx.scanZoom = loadAudio('/src/sfx/scan-zoom.wav', this.volumes.sfx);
            }
            if (!this.audio.sfx.textAnimation) {
                this.audio.sfx.textAnimation = loadAudio('/src/sfx/FX_text_animation_loop.mp3', this.volumes.sfx);
            }
            if (!this.audio.sfx.affirmation) {
                this.audio.sfx.affirmation = loadAudio('/src/sfx/affirmation-tech.wav', this.volumes.sfx);
            }
            
            console.log('[AUDIO] All audio preloaded');
        } catch (error) {
            console.error('[AUDIO] Preload error:', error);
        }
    }
    
    // Play background music
    playBackground() {
        if (this.audio.bgMusic && this.audio.bgMusic.paused) {
            this.audio.bgMusic.play().catch(err => 
                console.log('[AUDIO] Background play blocked:', err.message)
            );
        }
    }
    
    // Play voice with callback for time updates
    playVoice(voiceName, onTimeUpdate) {
        const voiceAudio = this.audio[voiceName];
        if (!voiceAudio) {
            console.warn(`[AUDIO] Voice ${voiceName} not found`);
            return;
        }
        
        // Stop previous voice to prevent overlap
        if (this.currentVoiceAudio && !this.currentVoiceAudio.paused) {
            console.log('[AUDIO] Stopping previous voice to prevent overlap');
            this.currentVoiceAudio.pause();
            this.currentVoiceAudio.currentTime = 0;
        }
        
        this.currentVoiceAudio = voiceAudio;
        this.isVoicePlaying = true;
        
        // Setup time update callback
        if (onTimeUpdate) {
            const updateHandler = () => onTimeUpdate();
            voiceAudio.addEventListener('timeupdate', updateHandler);
        }
        
        // Cleanup on end
        const onEnded = () => {
            this.isVoicePlaying = false;
            this.currentVoiceAudio = null;
            voiceAudio.removeEventListener('ended', onEnded);
        };
        voiceAudio.addEventListener('ended', onEnded);
        
        // Play
        voiceAudio.play().catch(err => {
            console.log('[AUDIO] Voice play blocked:', err.message);
            this.isVoicePlaying = false;
            this.currentVoiceAudio = null;
        });
    }
    
    // Play SFX (only once per session)
    playSFX(sfxName) {
        if (this.sfxPlayed[sfxName] || !this.audio.sfx[sfxName]) {
            return;
        }
        
        this.sfxPlayed[sfxName] = true;
        this.audio.sfx[sfxName].play().catch(err => 
            console.log('[AUDIO] SFX play blocked:', err.message)
        );
        console.log(`[AUDIO] SFX played: ${sfxName}`);
    }
    
    // Play transition sound
    playTransition(index = 0) {
        if (this.audio.transitions[index]) {
            this.audio.transitions[index].currentTime = 0;
            this.audio.transitions[index].play().catch(err => 
                console.log('[AUDIO] Transition play blocked:', err.message)
            );
        }
    }
    
    // Get audio element
    getAudio(name) {
        return this.audio[name];
    }
    
    // Stop all audio
    stopAll() {
        Object.values(this.audio).forEach(audio => {
            if (typeof audio === 'object' && audio !== null) {
                if (Array.isArray(audio)) {
                    audio.forEach(a => this.stopSingle(a));
                } else if (audio.pause) {
                    this.stopSingle(audio);
                } else {
                    Object.values(audio).forEach(sfx => this.stopSingle(sfx));
                }
            }
        });
    }
    
    stopSingle(audio) {
        if (audio && !audio.paused) {
            audio.pause();
            audio.currentTime = 0;
        }
    }
    
    // Fade out background music
    fadeOutBackground(duration = 1000) {
        const music = this.audio.bgMusic;
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
    
    destroy() {
        this.stopAll();
        this.audio = null;
        console.log('[AUDIO] Destroyed');
    }
}
