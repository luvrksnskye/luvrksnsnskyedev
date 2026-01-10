// SectionManager.js - Con estrellas flotantes en transición
export class SectionManager {
    constructor(audioManager, animationManager, rainEffect, starsEffect) {
        this.audioManager = audioManager;
        this.animationManager = animationManager;
        this.rainEffect = rainEffect;
        this.starsEffect = starsEffect;
        this.currentSection = null;
        this.sections = new Map();
        this.floatingStars = [];
    }

    init() {
        this.setupSections();
        this.setupScrollObserver();
        this.createTrainElements();
        this.createFloatingStars();
        this.activateSection('intro');
    }

    createTrainElements() {
        const sectionTwo = document.getElementById('section-two');
        if (!sectionTwo) return;

        const trainElements = `
            <div class="train-background"></div>
            <div class="star-parallax"></div>
            <div class="train-clouds"></div>
            <div class="train-outside"></div>
        `;

        sectionTwo.insertAdjacentHTML('afterbegin', trainElements);
    }

    createFloatingStars() {
        const starsContainer = document.getElementById('floating-stars-transition');
        if (!starsContainer) return;

        const starCount = 150;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star-particle';
            
            if (Math.random() > 0.7) {
                star.classList.add('large');
            }
            
            if (Math.random() > 0.6) {
                star.classList.add('sparkle');
            }
            
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${50 + Math.random() * 50}%`;
            
            starsContainer.appendChild(star);
            this.floatingStars.push(star);
        }

        ScrollTrigger.create({
            trigger: '#gradient-transition',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                this.floatingStars.forEach((star, index) => {
                    const delay = (index / this.floatingStars.length) * 0.5;
                    const starProgress = Math.max(0, Math.min(1, (progress - delay) * 2));
                    star.style.opacity = starProgress;
                });
            }
        });
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
            effect: 'none',
            onEnter: () => this.enterSectionTwo(),
            onLeave: () => this.leaveSectionTwo()
        });

        this.sections.set('section-three', {
            element: document.getElementById('section-three'),
            music: 'stardust-music',
            sfx: ['train-ambient'],
            effect: 'none',
            onEnter: () => this.enterSectionThree(),
            onLeave: () => this.leaveSectionThree()
        });
    }

    setupScrollObserver() {
        ScrollTrigger.create({
            trigger: '.main-content',
            start: 'top center',
            onEnter: () => this.activateSection('content-one'),
            onLeaveBack: () => this.activateSection('intro')
        });

        const gradientTransition = document.getElementById('gradient-transition');
        if (gradientTransition) {
            ScrollTrigger.create({
                trigger: gradientTransition,
                start: 'top center',
                onEnter: () => {
                    this.activateSection('section-two');
                    this.showCloudsOverlay();
                },
                onLeaveBack: () => {
                    this.activateSection('content-one');
                    this.hideCloudsOverlay();
                }
            });
        }

        const gradientTransitionThree = document.getElementById('gradient-transition-three');
        if (gradientTransitionThree) {
            ScrollTrigger.create({
                trigger: gradientTransitionThree,
                start: 'top center',
                onEnter: () => this.activateSection('section-three'),
                onLeaveBack: () => this.activateSection('section-two')
            });
            
            // Ocultar nubes cuando se sale de la sección tres hacia abajo
            ScrollTrigger.create({
                trigger: gradientTransitionThree,
                start: 'bottom bottom',
                onEnter: () => this.hideCloudsOverlay(),
                onLeaveBack: () => this.showCloudsOverlay()
            });
        }
    }

    activateSection(sectionId) {
        const section = this.sections.get(sectionId);
        
        if (!section || this.currentSection === sectionId) {
            return;
        }

        if (this.currentSection) {
            const prevSection = this.sections.get(this.currentSection);
            if (prevSection && prevSection.onLeave) {
                prevSection.onLeave();
            }
        }

        this.currentSection = sectionId;
        
        if (section.onEnter) {
            section.onEnter();
        }

        if (section.music) {
            this.audioManager.playMusic(section.music, 2000);
        }

        this.handleEffectTransition(section.effect);

        console.log(`Activated section: ${sectionId}`);
    }

    handleEffectTransition(effectType) {
        if (effectType === 'rain') {
            this.rainEffect.start();
        } else if (effectType === 'none') {
            this.rainEffect.stop();
        }
    }

    enterIntroSection() {
        this.audioManager.playSfx('soft-rain', 0.08, 1500);
    }

    leaveIntroSection() {
    }

    enterContentOneSection() {
    }

    leaveContentOneSection() {
    }

    enterSectionTwo() {
        this.audioManager.stopSfx('soft-rain', 2000);
        this.audioManager.playSfx('train-ambient', 0.03, 2000);
    }

    leaveSectionTwo() {
        this.audioManager.stopSfx('train-ambient', 1500);
    }

    enterSectionThree() {
        // Mantener la música y SFX de la sección 2
    }

    leaveSectionThree() {
    }

    getCurrentSection() {
        return this.currentSection;
    }

    goToSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section || !section.element) return;

        gsap.to(window, {
            scrollTo: { y: section.element, offsetY: 0 },
            duration: 1.5,
            ease: 'power2.inOut'
        });
    }

    showCloudsOverlay() {
        const cloudsOverlay = document.querySelector('.floating-clouds');
        if (cloudsOverlay) {
            cloudsOverlay.style.opacity = '1';
        }
    }

    hideCloudsOverlay() {
        const cloudsOverlay = document.querySelector('.floating-clouds');
        if (cloudsOverlay) {
            cloudsOverlay.style.opacity = '0';
        }
    }
}
