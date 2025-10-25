/**
 * ============================
 * SOUND MANAGER MODULE
 * ============================
 * Handles all audio playback with improved performance and reliability
 */

class SoundManager {
    constructor() {
        this.sounds = new Map();
        this.masterVolume = 1.0;
        this.sfxVolume = 0.7;
        this.isMuted = false;
        this.audioContext = null;
        this.unlocked = false;
        this.initialized = false;
        
        this.pendingPlays = [];
        
        this.initializeAudioContext();
        this.initializeSounds();
        this.setupUnlockListeners();
        
        this.initialized = true;
        console.log('✅ Sound Manager module loaded');
    }

    initializeAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
            }
        } catch (e) {
            console.warn('Web Audio API not supported, using HTML5 Audio');
        }
    }

    setupUnlockListeners() {
        const autoPlaySounds = ['intro', 'notification'];
        
        const unlockAudio = () => {
            if (this.unlocked) return;
            
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.sounds.forEach((soundObj, name) => {
                if (!autoPlaySounds.includes(name)) {
                    const audio = soundObj.audio;
                    audio.volume = 0;
                    audio.play().then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = soundObj.defaultVolume * this.masterVolume;
                    }).catch(() => {});
                }
            });
            
            this.unlocked = true;
            
            this.pendingPlays.forEach(({ name, volume, loop }) => {
                if (!autoPlaySounds.includes(name)) {
                    this.play(name, volume, loop);
                }
            });
            this.pendingPlays = [];
            
            console.log('🔊 Audio unlocked');
        };
        
        const events = ['click', 'touchstart', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, unlockAudio, { once: true, passive: true });
        });
    }

    initializeSounds() {
        const soundList = [
            { name: 'intro', url: '/src/assets/sfx/intro.mp3', volume: 0.5 },
            { name: 'notification', url: '/src/assets/sfx/notification.mp3', volume: 0.6 },
            { name: 'click', url: '/src/assets/sfx/click.mp3', volume: 0.4 },
            { name: 'menuClick', url: '/src/assets/sfx/menuClick.mp3', volume: 0.4 },
            { name: 'hover', url: '/src/assets/sfx/hover.mp3', volume: 0.2 },
            { name: 'tick', url: '/src/assets/sfx/tick.mp3', volume: 0.15 },
            { name: 'knock', url: '/src/assets/sfx/knock.mp3', volume: 0.5 },
            { name: 'scroll', url: '/src/assets/sfx/scroll.mp3', volume: 0.3 },
            { name: 'command', url: '/src/assets/sfx/command.mp3', volume: 0.6 },
            { name: 'takeout', url: '/src/assets/sfx/takeout.mp3', volume: 0.4 },
            { name: 'twitter', url: '/src/assets/sfx/twitter-sound-2.mp3', volume: 0.3 },
            { name: 'imessageSent', url: '/src/assets/sfx/imessage-sent.mp3', volume: 0.5 },
            { name: 'imessageReceived', url: '/src/assets/sfx/imessage-received.mp3', volume: 0.5 },
            { name: 'imessageSendFromUser', url: '/src/assets/sfx/imessage-send-from-user.mp3', volume: 0.5 }
        ];

        soundList.forEach(({ name, url, volume }) => {
            this.loadSound(name, url, volume);
        });
    }

    loadSound(name, path, defaultVolume = 0.7) {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = defaultVolume * this.masterVolume;
            audio.crossOrigin = 'anonymous';
            audio.src = path;
            
            this.sounds.set(name, {
                audio,
                defaultVolume,
                loaded: false,
                loading: false
            });
            
            audio.addEventListener('canplaythrough', () => {
                const soundObj = this.sounds.get(name);
                if (soundObj) {
                    soundObj.loaded = true;
                    soundObj.loading = false;
                }
            }, { once: true });
            
            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load sound: ${name}`, e);
                const soundObj = this.sounds.get(name);
                if (soundObj) {
                    soundObj.loading = false;
                }
            });
            
        } catch (error) {
            console.error(`Error loading sound ${name}:`, error);
        }
    }

    play(name, volume = null, loop = false) {
        const soundObj = this.sounds.get(name);
        
        if (!soundObj) {
            console.warn(`Sound "${name}" not found`);
            return Promise.reject(new Error(`Sound not found: ${name}`));
        }

        const autoPlaySounds = ['intro', 'notification'];
        const canAutoPlay = autoPlaySounds.includes(name);

        if (!this.unlocked && !canAutoPlay) {
            this.pendingPlays.push({ name, volume, loop });
            return Promise.resolve();
        }

        const sound = soundObj.audio;

        try {
            sound.currentTime = 0;
            sound.loop = loop;
            
            const finalVolume = volume !== null ? volume : soundObj.defaultVolume;
            sound.volume = Math.max(0, Math.min(1, finalVolume * this.masterVolume));
            sound.muted = this.isMuted;
            
            return sound.play().catch(error => {
                if (error.name !== 'NotAllowedError') {
                    console.warn(`Playback error for ${name}:`, error.message);
                }
                return Promise.reject(error);
            });
            
        } catch (error) {
            console.error(`Error playing sound ${name}:`, error);
            return Promise.reject(error);
        }
    }

    playWithFallback(name, volume = null, loop = false) {
        return this.play(name, volume, loop).catch(() => {
            setTimeout(() => {
                this.play(name, volume, loop).catch(() => {});
            }, 50);
        });
    }

    stop(name) {
        const soundObj = this.sounds.get(name);
        if (soundObj) {
            soundObj.audio.pause();
            soundObj.audio.currentTime = 0;
        }
    }

    pause(name) {
        const soundObj = this.sounds.get(name);
        if (soundObj) {
            soundObj.audio.pause();
        }
    }

    isPlaying(name) {
        const soundObj = this.sounds.get(name);
        if (!soundObj) return false;
        return !soundObj.audio.paused && !soundObj.audio.ended;
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.sounds.forEach(soundObj => {
            soundObj.audio.volume = soundObj.defaultVolume * this.masterVolume;
        });
    }

    setMuted(muted) {
        this.isMuted = muted;
        this.sounds.forEach(soundObj => {
            soundObj.audio.muted = muted;
        });
    }

    toggleMute() {
        this.setMuted(!this.isMuted);
        return this.isMuted;
    }

    stopAll() {
        this.sounds.forEach((_, name) => this.stop(name));
    }

    preloadAll() {
        this.sounds.forEach(soundObj => {
            if (!soundObj.loaded && !soundObj.loading) {
                soundObj.loading = true;
                soundObj.audio.load();
            }
        });
    }

    getLoadedCount() {
        let loaded = 0;
        this.sounds.forEach(soundObj => {
            if (soundObj.loaded) loaded++;
        });
        return { loaded, total: this.sounds.size };
    }

    destroy() {
        this.stopAll();
        this.sounds.clear();
        this.pendingPlays = [];
    }
}

// Create and export singleton instance
export const soundManager = new SoundManager();

// Make available globally
window.soundManager = soundManager;

export default soundManager;