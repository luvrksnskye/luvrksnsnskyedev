/**
 * ============================
 * SOUND MANAGER MODULE
 * ============================
 * Handles all audio playback with improved performance and reliability
 * Exports as ES6 module
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
            { name: 'intro', url: 'https://dl.dropbox.com/scl/fi/ks0yjrp1ue9x66r112kf9/intro.mp3?rlkey=sqekry2xna3po0ab1wcluwwm7&st=7b0h3m92&dl=0', volume: 0.5 },
            { name: 'notification', url: 'https://dl.dropbox.com/scl/fi/gzd79p68f29cw7o5o5ooi/notification.mp3?rlkey=w4f07un5nd209pyw6cb6wk595&st=5j983eff&dl=0', volume: 0.6 },
            { name: 'click', url: 'https://dl.dropbox.com/scl/fi/540cbknh21pcqglzj2q15/photos-click.mp3?rlkey=yeli4n3k9wflpwecqlwt1wyzq&st=z65jscnn&dl=0', volume: 0.4 },
            { name: 'menuClick', url: 'https://dl.dropbox.com/scl/fi/a3akgbh8k6jl2hzd9x6rc/photos-menu-click.mp3?rlkey=qpd5q1pbl58o4klgqtsphxz7g&st=eoxnlo4z&dl=0', volume: 0.4 },
            { name: 'hover', url: 'https://dl.dropbox.com/scl/fi/dxg84w3gsvm3k8zmps0p8/tick.mp3?rlkey=hti8o87g7ys7lbvw99v2dvwrp&st=ypxd4746&dl=0', volume: 0.2 },
            { name: 'tick', url: 'https://dl.dropbox.com/scl/fi/dxg84w3gsvm3k8zmps0p8/tick.mp3?rlkey=hti8o87g7ys7lbvw99v2dvwrp&st=ypxd4746&dl=0', volume: 0.15 },
            { name: 'knock', url: 'https://dl.dropbox.com/scl/fi/ygh46ndu20a0m3vis3rro/nock.mp3?rlkey=nbxly84tj0fwhqru6522k4zr1&st=l859xlqi&dl=0', volume: 0.5 },
            { name: 'scroll', url: 'https://dl.dropbox.com/scl/fi/4fnq8v4gwcmvintzcxs14/scrollwheel.mp3?rlkey=esn9jqop484qslzf61xx63vxf&st=xrcdalwt&dl=0', volume: 0.3 },
            { name: 'message', url: 'https://dl.dropbox.com/scl/fi/vcpr6tl07v2rz8oknw80t/imessage.mp3?rlkey=pvi98kh5s6tjr0c0qsjw68txx&st=tve9hdg4&dl=0', volume: 0.5 },
            { name: 'command', url: 'https://dl.dropbox.com/scl/fi/hllkh10a15nmn164sqcaa/command-press.mp3?rlkey=qg1zeiw8660976fh90xz7fdnk&st=3hipm1h3&dl=0', volume: 0.6 },
            { name: 'takeout', url: 'https://dl.dropbox.com/scl/fi/gdqg9391zbn53vmnc2ni7/takeout-click.mp3?rlkey=ks36mtqtvw5sswzi6iehc9qlu&st=v6a1o8u6&dl=0', volume: 0.4 },
            { name: 'twitter', url: 'https://dl.dropbox.com/scl/fi/r5v7ms475it79xvpyv9h4/twitter-sound-2.mp3?rlkey=80zp1bymh50qvg5r53rtcwpp9&st=f975ufhw&dl=0', volume: 0.3 }
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