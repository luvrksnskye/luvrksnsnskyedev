// SectionManager.js - Sistema de gestión de secciones y transiciones
export class SectionManager {
    constructor(audioManager, animationManager, rainEffect, starsEffect) {
        this.audioManager = audioManager;
        this.animationManager = animationManager;
        this.rainEffect = rainEffect;
        this.starsEffect = starsEffect;
        this.currentSection = null;
        this.sections = new Map();
    }

    init() {
        this.setupSections();
        this.setupScrollObserver();
        this.activateSection('intro');
    }

    setupSections() {
        this.sections.set('intro', {
            element: document.querySelector('.title-container'),
            music: 'title-music',
            sfx: ['soft-rain'],
            effect: 'rain',
            onEnter: () => this.enterIntroSection(),
            onLeave: () => this.leaveIntroSection()
        });

        this.sections.set('content-one', {
            element: document.querySelector('.main-content'),
            music: 'title-music',
            sfx: ['soft-rain'],
            effect: 'rain',
            onEnter: () => this.enterContentOneSection(),
            onLeave: () => this.leaveContentOneSection()
        });

        this.sections.set('section-two', {
            element: document.getElementById('section-two'),
            music: 'stardust-music',
            sfx: ['train-ambient'],
            effect: 'stars',
            onEnter: () => this.enterSectionTwo(),
            onLeave: () => this.leaveSectionTwo()
        });
    }

    setupScrollObserver() {
        // Observer para la primera sección de contenido
        ScrollTrigger.create({
            trigger: '.main-content',
            start: 'top center',
            onEnter: () => this.activateSection('content-one'),
            onLeaveBack: () => this.activateSection('intro')
        });

        // Observer para la transición gradual (cambiar música y efectos)
        const gradientTransition = document.getElementById('gradient-transition');
        if (gradientTransition) {
            ScrollTrigger.create({
                trigger: gradientTransition,
                start: 'top center',
                onEnter: () => this.activateSection('section-two'),
                onLeaveBack: () => this.activateSection('content-one')
            });
        }
    }

    activateSection(sectionId) {
        const section = this.sections.get(sectionId);
        
        if (!section || this.currentSection === sectionId) {
            return;
        }

        // Desactivar sección anterior
        if (this.currentSection) {
            const prevSection = this.sections.get(this.currentSection);
            if (prevSection && prevSection.onLeave) {
                prevSection.onLeave();
            }
        }

        // Activar nueva sección
        this.currentSection = sectionId;
        
        if (section.onEnter) {
            section.onEnter();
        }

        // Cambiar música
        if (section.music) {
            this.audioManager.playMusic(section.music, 2000);
        }

        // Manejar efectos visuales
        this.handleEffectTransition(section.effect);

        console.log(`Activated section: ${sectionId}`);
    }

    handleEffectTransition(effectType) {
        if (effectType === 'rain') {
            this.rainEffect.start();
            this.starsEffect.stop();
        } else if (effectType === 'stars') {
            this.rainEffect.stop();
            this.starsEffect.start();
        }
    }

    // Callbacks para entrada de secciones
    enterIntroSection() {
        this.audioManager.playSfx('soft-rain', 0.08, 1500);
    }

    leaveIntroSection() {
        // La música y efectos continúan
    }

    enterContentOneSection() {
        // Mantener música y efectos actuales
    }

    leaveContentOneSection() {
        // Preparar para transición
    }

    enterSectionTwo() {
        // Detener lluvia gradualmente
        this.audioManager.stopSfx('soft-rain', 2000);
        
        // Iniciar ambiente de tren muy muy bajo
        this.audioManager.playSfx('train-ambient', 0.03, 2000);
    }

    leaveSectionTwo() {
        this.audioManager.stopSfx('train-ambient', 1500);
    }

    // Obtener sección actual
    getCurrentSection() {
        return this.currentSection;
    }

    // Forzar cambio de sección
    goToSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section || !section.element) return;

        gsap.to(window, {
            scrollTo: { y: section.element, offsetY: 0 },
            duration: 1.5,
            ease: 'power2.inOut'
        });
    }
}
