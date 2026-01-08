// AudioManager.js - Sistema modular de gestión de audio
export class AudioManager {
    constructor() {
        this.bgmVolume = 0.15;
        this.sfxVolume = 0.15;
        this.activeBgm = null;
        this.activeSfx = [];
        this.audioElements = new Map();
    }

    init() {
        this.preloadAudio();
    }

    preloadAudio() {
        const audioFiles = {
            bgm: [
                { id: 'title-music', src: 'music/title.mp3', type: 'bgm' },
                { id: 'stardust-music', src: 'music/yonewaka.mp3', type: 'bgm' }
            ],
            sfx: [
                { id: 'soft-rain', src: 'sfx/soft_rain.mp3', type: 'sfx', loop: true },
                { id: 'train-ambient', src: 'sfx/SE_TRAIN.ogg', type: 'sfx', loop: true }
            ]
        };

        // Crear elementos de audio para BGM
        audioFiles.bgm.forEach(audio => {
            const element = new Audio(audio.src);
            element.volume = 0;
            element.loop = true;
            element.preload = 'auto';
            this.audioElements.set(audio.id, element);
        });

        // Crear elementos de audio para SFX
        audioFiles.sfx.forEach(audio => {
            const element = new Audio(audio.src);
            element.volume = 0;
            element.loop = audio.loop || false;
            element.preload = 'auto';
            this.audioElements.set(audio.id, element);
        });
    }

    fadeIn(audioElement, targetVolume, duration = 1500, steps = 50) {
        const stepTime = duration / steps;
        const volumeIncrement = targetVolume / steps;
        let currentStep = 0;

        audioElement.play().catch(err => console.log('Audio play prevented:', err));

        const fadeInterval = setInterval(() => {
            if (currentStep >= steps) {
                audioElement.volume = targetVolume;
                clearInterval(fadeInterval);
                return;
            }

            audioElement.volume = Math.min(volumeIncrement * currentStep, targetVolume);
            currentStep++;
        }, stepTime);
    }

    fadeOut(audioElement, duration = 1500, steps = 50) {
        const stepTime = duration / steps;
        const initialVolume = audioElement.volume;
        const volumeDecrement = initialVolume / steps;
        let currentStep = 0;

        const fadeInterval = setInterval(() => {
            if (currentStep >= steps) {
                audioElement.volume = 0;
                audioElement.pause();
                clearInterval(fadeInterval);
                return;
            }

            audioElement.volume = Math.max(initialVolume - (volumeDecrement * currentStep), 0);
            currentStep++;
        }, stepTime);
    }

    playMusic(musicId, fadeDuration = 1500) {
        const newMusic = this.audioElements.get(musicId);
        
        if (!newMusic) {
            console.warn(`Music ${musicId} not found`);
            return;
        }

        // Si es la misma música, no hacer nada
        if (this.activeBgm === newMusic && !newMusic.paused) {
            return;
        }

        // Fade in de la nueva música
        this.fadeIn(newMusic, this.bgmVolume, fadeDuration);

        // Fade out de la música anterior
        if (this.activeBgm && this.activeBgm !== newMusic) {
            this.fadeOut(this.activeBgm, fadeDuration);
        }

        this.activeBgm = newMusic;
    }

    playSfx(sfxId, volume = null, fadeDuration = 1000) {
        const sfx = this.audioElements.get(sfxId);
        
        if (!sfx) {
            console.warn(`SFX ${sfxId} not found`);
            return;
        }

        const targetVolume = volume !== null ? volume : this.sfxVolume;
        this.fadeIn(sfx, targetVolume, fadeDuration);
        
        if (!this.activeSfx.includes(sfx)) {
            this.activeSfx.push(sfx);
        }
    }

    stopSfx(sfxId, fadeDuration = 1000) {
        const sfx = this.audioElements.get(sfxId);
        
        if (!sfx) {
            console.warn(`SFX ${sfxId} not found`);
            return;
        }

        this.fadeOut(sfx, fadeDuration);
        this.activeSfx = this.activeSfx.filter(s => s !== sfx);
    }

    stopAllSfx(fadeDuration = 1000) {
        this.activeSfx.forEach(sfx => {
            this.fadeOut(sfx, fadeDuration);
        });
        this.activeSfx = [];
    }

    setMusicVolume(volume) {
        this.bgmVolume = volume;
        if (this.activeBgm) {
            this.activeBgm.volume = volume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = volume;
    }

    stopAll() {
        if (this.activeBgm) {
            this.fadeOut(this.activeBgm, 500);
        }
        this.stopAllSfx(500);
    }
}
