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
            { name: 'intro', url: 'https://dl.dropbox.com/scl/fi/wvs6esbp1t42ziids8dfi/intro.mp3?rlkey=7fp9psisvbdy7bzuxv3w6c8wf&st=drkhxe0p&dl=0', volume: 0.5 },
            { name: 'notification', url: 'https://dl.dropbox.com/scl/fi/s8ld9kf73k5mcl04t82h3/notification.mp3?rlkey=i6an0a1ds7x0f647rlyh5am0d&st=hsrjqxeb&dl=0', volume: 0.6 },
            { name: 'click', url: 'https://dl.dropbox.com/scl/fi/l6tzcxgbl4t6tv8suiqix/photos-click.mp3?rlkey=msdkopzvgwo07ccmwapn4c8q9&st=0w6nd11x&dl=0', volume: 0.4 },
            { name: 'menuClick', url: 'https://dl.dropbox.com/scl/fi/feq6pzyifspcxwfh9nm85/photos-menu-click.mp3?rlkey=vckurng5uyx4dj0p3b6awlw6l&st=b9puzya1&dl=0', volume: 0.4 },
            { name: 'hover', url: 'https://dl.dropbox.com/scl/fi/z5pe7vapb7pe0exgddniy/nock.mp3?rlkey=m23q7lp61gda2403owuj38zf4&st=y6rc4w64&dl=0', volume: 0.2 },
            { name: 'tick', url: 'https://dl.dropbox.com/scl/fi/4a3j125poyg20jx6zbkk5/tick.mp3?rlkey=xc5heu4lrjic1v6800xx9smmp&st=wkeee9u4&dl=0', volume: 0.15 },
            { name: 'knock', url: 'https://dl.dropbox.com/scl/fi/z5pe7vapb7pe0exgddniy/nock.mp3?rlkey=m23q7lp61gda2403owuj38zf4&st=y6rc4w64&dl=0', volume: 0.5 },
            { name: 'scroll', url: 'https://dl.dropbox.com/scl/fi/7k4pkcf323aeb2sbyuomy/scrollwheel.mp3?rlkey=try4rz6cr3wivssmwq5dg1b2h&st=rt6l8zho&dl=0', volume: 0.3 },
            { name: 'command', url: 'https://dl.dropbox.com/scl/fi/kyolk2xpiinjup0o96s5c/command-press.mp3?rlkey=i5rd4cajqgguuldfhxl90cjm0&st=u4cmljsx&dl=0', volume: 0.6 },
            { name: 'takeout', url: 'https://dl.dropbox.com/scl/fi/z20uauhyn05mr0vxy71oi/takeout-click.mp3?rlkey=fjdywcedsskut7edgors88r6l&st=k5nl1w9d&dl=0', volume: 0.4 },
            { name: 'twitter', url: 'https://dl.dropbox.com/scl/fi/cvepeszb9omxqzsxgisvr/twitter-sound-2.mp3?rlkey=cfifmezfdfxlro6skxii2askv&st=4fcm17k7&dl=0', volume: 0.3 },
            { name: 'imessageSent', url: 'https://dl.dropbox.com/scl/fi/3op1dvn1loy2grk0lkwdm/imessage-sent.mp3?rlkey=xuqgsn2nqoch477814e70idce&st=f19gw7lt&dl=0', volume: 0.5 },
            { name: 'imessageReceived', url: 'https://dl.dropbox.com/scl/fi/gy3bwo3p7gzv9aankkc1m/imessage-received.mp3?rlkey=t51y0yqqqd79hkx9bcmqn0hl8&st=ob212x0g&dl=0', volume: 0.5 },
            { name: 'imessageSendFromUser', url: 'https://dl.dropbox.com/scl/fi/395lmycyofdpa7xg6hj95/imessage-send-from-user.mp3?rlkey=d2odvmvymfbe0ukha93sqe8ce&st=qeovttu3&dl=0', volume: 0.5 }
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