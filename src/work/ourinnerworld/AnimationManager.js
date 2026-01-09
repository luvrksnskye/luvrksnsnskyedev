// AnimationManager.js - Sistema modular de animaciones con GSAP
export class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.scrollTriggers = [];
    }

    init() {
        gsap.registerPlugin(ScrollTrigger);
        this.setupScrollAnimations();
    }

    setupScrollAnimations() {
        // Animación inicial del logo y título
        this.animateIntroSection();
        
        // Animación de la primera sección de contenido
        this.animateFirstContentSection();
        
        // Animación de transición a segunda sección
        this.animateSecondSection();
    }

    animateIntroSection() {
        const logo = document.getElementById('game-logo-overlay');
        const welcomeText = document.getElementById('welcome-text');

        // Logo aparece primero
        gsap.fromTo(logo,
            { opacity: 0, scale: 0.8 },
            {
                opacity: 1,
                scale: 1,
                duration: 2,
                ease: 'power2.out',
                delay: 0.5
            }
        );

        // Texto de bienvenida aparece después
        gsap.fromTo(welcomeText,
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: 'power2.out',
                delay: 1.5
            }
        );

        // Fade out al hacer scroll
        ScrollTrigger.create({
            trigger: '.main-content',
            start: 'top bottom',
            end: 'top center',
            scrub: 1,
            onUpdate: (self) => {
                gsap.to([logo, welcomeText], {
                    opacity: 1 - self.progress,
                    y: -50 * self.progress,
                    duration: 0.1
                });
            }
        });
    }

    animateFirstContentSection() {
        const splashImage = document.getElementById('splash-image');
        const descriptions = document.querySelectorAll('.sv-project-desc');

        // Splash image aparece al hacer scroll
        gsap.fromTo(splashImage,
            { opacity: 0, y: 100, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1.2,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: splashImage,
                    start: 'top 80%',
                    end: 'top 50%',
                    scrub: 1
                }
            }
        );

        // Texto aparece gradualmente
        descriptions.forEach((desc, index) => {
            gsap.fromTo(desc,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: desc,
                        start: 'top 85%',
                        end: 'top 60%',
                        scrub: 1
                    }
                }
            );
        });
    }

    animateSecondSection() {
        const secondSection = document.getElementById('section-two');
        
        if (!secondSection) return;

        // Animación del título de la segunda sección
        const sectionTitle = secondSection.querySelector('.section-title');
        if (sectionTitle) {
            gsap.fromTo(sectionTitle,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionTitle,
                        start: 'top 80%',
                        end: 'top 50%',
                        scrub: 1
                    }
                }
            );
        }

        // Animación de la descripción
        const sectionDesc = secondSection.querySelector('.section-description');
        if (sectionDesc) {
            gsap.fromTo(sectionDesc,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionDesc,
                        start: 'top 80%',
                        end: 'top 50%',
                        scrub: 1
                    }
                }
            );
        }
    }

    // Transición de gradiente entre secciones
    createGradientTransition(triggerElement, startColor, endColor) {
        const overlay = document.getElementById('gradient-overlay');
        
        ScrollTrigger.create({
            trigger: triggerElement,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                overlay.style.background = `linear-gradient(to bottom, ${startColor}, ${endColor})`;
                overlay.style.opacity = progress;
            }
        });
    }

    // Efecto de typing para texto
    typewriterEffect(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;

        const type = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    // Limpiar todos los ScrollTriggers
    cleanup() {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        this.animations.clear();
    }
}