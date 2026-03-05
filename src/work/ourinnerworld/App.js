// App.js - Controlador principal de la aplicación
import { AudioManager } from './AudioManager.js';
import { AnimationManager } from './AnimationManager.js';
import { RainEffect } from './RainEffect.js';
import { SectionManager } from './SectionManager.js';
import { FadingStarsEffect } from './FadingStarsEffect.js';
import { DustParticles } from './DustParticles.js';

export class App {
    constructor() {
        this.audioManager = null;
        this.animationManager = null;
        this.rainEffect = null;
        this.starsEffect = null;
        this.fadingStarsEffect = null;
        this.dustParticles = null;
        this.sectionManager = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        console.log('Initializing OURINNERWORLD...');

        this.initializeManagers();
        
        await this.setupInitialState();
        
        this.startExperience();

        this.isInitialized = true;
        console.log('OURINNERWORLD initialized successfully');
    }

    initializeManagers() {
        this.audioManager = new AudioManager();
        this.audioManager.init();

        this.rainEffect = new RainEffect();
        this.rainEffect.init();

        this.fadingStarsEffect = new FadingStarsEffect();
        this.fadingStarsEffect.init();

        this.dustParticles = new DustParticles();
        this.dustParticles.init();

        this.animationManager = new AnimationManager();
        this.animationManager.init();

        this.sectionManager = new SectionManager(
            this.audioManager,
            this.animationManager,
            this.rainEffect,
            this.starsEffect,
            this.dustParticles
        );
        this.sectionManager.init();
    }

    async setupInitialState() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        this.setupInitialElements();
    }

    setupInitialElements() {
        const logo = document.getElementById('game-logo-overlay');
        const welcomeText = document.getElementById('welcome-text');
        
        if (logo) logo.style.opacity = '0';
        if (welcomeText) welcomeText.style.opacity = '0';

        this.applyDataText();
    }

    applyDataText() {
        const elements = document.querySelectorAll('[data-text]');
        elements.forEach(element => {
            const text = element.getAttribute('data-text');
            if (text) {
                element.textContent = text;
            }
        });
    }

    startExperience() {
        setTimeout(() => {
            this.audioManager.playMusic('title-music', 2000);
            
            this.rainEffect.start();
        }, 500);

        this.setupUserInteraction();
    }

    setupUserInteraction() {
        const startAudio = () => {
            if (!this.audioManager.activeBgm || this.audioManager.activeBgm.paused) {
                this.audioManager.playMusic('title-music', 1000);
            }
            document.removeEventListener('click', startAudio);
            document.removeEventListener('touchstart', startAudio);
            document.removeEventListener('keydown', startAudio);
        };

        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('touchstart', startAudio, { once: true });
        document.addEventListener('keydown', startAudio, { once: true });
    }

    pause() {
        this.audioManager.stopAll();
        this.rainEffect.stop();
    }

    resume() {
        const currentSection = this.sectionManager.getCurrentSection();
        if (currentSection) {
            this.sectionManager.activateSection(currentSection);
        }
    }

    destroy() {
        if (this.audioManager) this.audioManager.stopAll();
        if (this.rainEffect) this.rainEffect.stop();
        if (this.animationManager) this.animationManager.cleanup();
        
        this.isInitialized = false;
    }
}

const app = new App();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

window.OURINNERWORLD = app;
