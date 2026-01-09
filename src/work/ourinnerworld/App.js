// App.js - Controlador principal de la aplicación
import { AudioManager } from './AudioManager.js';
import { AnimationManager } from './AnimationManager.js';
import { RainEffect } from './RainEffect.js';
import { SectionManager } from './SectionManager.js';

export class App {
    constructor() {
        this.audioManager = null;
        this.animationManager = null;
        this.rainEffect = null;
        this.starsEffect = null;
        this.sectionManager = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        console.log('Initializing OURINNERWORLD...');

        // Inicializar managers en orden
        this.initializeManagers();
        
        // Setup inicial
        await this.setupInitialState();
        
        // Iniciar experiencia
        this.startExperience();

        this.isInitialized = true;
        console.log('OURINNERWORLD initialized successfully');
    }

    initializeManagers() {
        // Audio
        this.audioManager = new AudioManager();
        this.audioManager.init();

        // Efectos visuales
        this.rainEffect = new RainEffect();
        this.rainEffect.init();

        // Animaciones
        this.animationManager = new AnimationManager();
        this.animationManager.init();

        // Secciones
        this.sectionManager = new SectionManager(
            this.audioManager,
            this.animationManager,
            this.rainEffect,
            this.starsEffect
        );
        this.sectionManager.init();
    }

    async setupInitialState() {
        // Esperar a que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Configurar estado inicial de elementos
        this.setupInitialElements();
    }

    setupInitialElements() {
        // Asegurar que elementos iniciales estén listos
        const logo = document.getElementById('game-logo-overlay');
        const welcomeText = document.getElementById('welcome-text');
        
        if (logo) logo.style.opacity = '0';
        if (welcomeText) welcomeText.style.opacity = '0';

        // Aplicar texto a elementos con data-text
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
        // Pequeño delay antes de iniciar para suavidad
        setTimeout(() => {
            // Iniciar música de título
            this.audioManager.playMusic('title-music', 2000);
            
            // Iniciar lluvia
            this.rainEffect.start();
            
            // Las animaciones de intro ya están configuradas en AnimationManager
        }, 500);

        // Permitir interacción con audio en navegadores modernos
        this.setupUserInteraction();
    }

    setupUserInteraction() {
        // Algunos navegadores requieren interacción del usuario para reproducir audio
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

    // Métodos de control públicos
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

    // Cleanup
    destroy() {
        if (this.audioManager) this.audioManager.stopAll();
        if (this.rainEffect) this.rainEffect.stop();
        if (this.animationManager) this.animationManager.cleanup();
        
        this.isInitialized = false;
    }
}

// Crear instancia global
const app = new App();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

// Exportar para acceso global si es necesario
window.OURINNERWORLD = app;
