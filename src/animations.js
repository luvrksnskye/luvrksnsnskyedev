/**
 * ============================
 * ANIMATIONS MANAGER MODULE
 * ============================
 * Handles all page animations and transitions
 * Exports as ES6 module
 */

import { soundManager } from './soundManager.js';

class AnimationsManager {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.currentPage = 'home';
        this.rafCallbacks = new Set();
        this.initialized = false;
        this.INTRO_SEEN_KEY = 'skye_intro_seen';

        // Don't auto-initialize - wait for core manager
    }

    init() {
        if (this.initialized) return;
        
        this.elements = {
            heroTitle: document.getElementById('heroTitle'),
            notifications: document.querySelectorAll('.notification'),
            startButton: document.getElementById('startButton'),
            introScreen: document.getElementById('introScreen'),
            mainScreen: document.getElementById('mainScreen'),
            aboutScreen: document.getElementById('aboutScreen'),
            mainNav: document.getElementById('mainNav')
        };

        // Check if user has seen the intro before
        if (this.hasSeenIntro()) {
            this.skipToNotifications();
        } else {
            this.startTerminalEffect();
            this.markIntroAsSeen();
        }

        this.initialized = true;
        console.log('✅ Animations Manager module loaded');
    }

    hasSeenIntro() {
        try {
            return localStorage.getItem(this.INTRO_SEEN_KEY) === 'true';
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    markIntroAsSeen() {
        try {
            localStorage.setItem(this.INTRO_SEEN_KEY, 'true');
        } catch (e) {
            console.warn('Could not save intro state:', e);
        }
    }

    skipToNotifications() {
        const title = this.elements.heroTitle;
        const introScreen = this.elements.introScreen;
        const startButton = this.elements.startButton;

        // Set up the title directly for "SKYE JOURNEY"
        if (title) {
            title.textContent = 'SKYE JOURNEY';
            title.style.fontSize = '72px';
            title.style.letterSpacing = '-2px';
            title.style.opacity = '1';
            title.style.transform = 'none';
            title.style.filter = 'none';
            title.style.textShadow = 'none';
            title.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            title.style.fontWeight = '700';
            title.style.color = '#ffffff';
            title.style.textAlign = 'center';
        }

        // Reset intro screen background
        if (introScreen) {
            introScreen.style.background = '';
        }

        // Make sure start button and notifications are visible
        if (startButton) {
            startButton.style.opacity = '';
            startButton.style.pointerEvents = '';
        }

        const notifications = this.elements.notifications;
        notifications.forEach(notification => {
            notification.style.opacity = '';
            notification.style.pointerEvents = '';
        });

        // Show notifications with a brief delay
        setTimeout(() => {
            this.showNotificationsSequence();
        }, 300);
    }

    startTerminalEffect() {
        const title = this.elements.heroTitle;
        if (!title) return;

        const introScreen = this.elements.introScreen;
        if (introScreen) {
            introScreen.style.background = '#000000';
        }

        const startButton = this.elements.startButton;
        if (startButton) {
            startButton.style.opacity = '0';
            startButton.style.pointerEvents = 'none';
        }

        const notifications = this.elements.notifications;
        notifications.forEach(notification => {
            notification.style.opacity = '0';
            notification.style.pointerEvents = 'none';
        });

        this.playOriginalGlitchAnimation(title);
    }

    playOriginalGlitchAnimation(title) {
        setTimeout(() => {
            soundManager?.play('intro', 0.5);
        }, 100);

        const sequence = [
            { text: 's', delay: 0, font: 'SpAlterna-Regular', size: '64px', opacity: 0.2, blur: '10px', rotate: '8deg' },
            { text: 's', delay: 80, font: 'SpAlterna-Regular', size: '66px', opacity: 0.35, blur: '7px', rotate: '-5deg' },
            { text: 'sk', delay: 160, font: 'SpAlterna-Regular', size: '68px', opacity: 0.5, blur: '5px', rotate: '3deg' },
            { text: 'sky', delay: 240, font: 'SpAlterna-Regular', size: '70px', opacity: 0.65, blur: '3px', rotate: '-1deg' },
            { text: 'skye', delay: 320, font: 'SpAlterna-Regular', size: '72px', opacity: 0.8, blur: '1px', rotate: '0deg' },
            { text: 'skye d', delay: 450, font: 'SpAlterna-Regular', size: '72px', opacity: 0.88, blur: '0px', skew: '2deg' },
            { text: 'skye de', delay: 580, font: 'SpAlterna-Regular', size: '72px', opacity: 0.92, blur: '0px', skew: '1deg' },
            { text: 'skye dev', delay: 710, font: 'SpAlterna-Regular', size: '72px', opacity: 0.96, blur: '0px', skew: '0deg' },
            { text: 'SKYE DEV', delay: 900, font: 'system', size: '71px', opacity: 0.6, blur: '3px', scale: '0.96' },
            { text: 'SKYE DEV', delay: 1000, font: 'system', size: '71.5px', opacity: 0.8, blur: '1.5px', scale: '0.98' },
            { text: 'SKYE DEV', delay: 1100, font: 'system', size: '72px', opacity: 0.95, blur: '0.5px', scale: '0.99' },
            { text: 'SKYE DEV', delay: 1200, font: 'system', size: '48px', opacity: 1, blur: '0px', scale: '1', glow: 'medium' },
            { text: 'SKYE DEV', delay: 1350, font: 'system', size: '48px', opacity: 0.85, blur: '0px', scale: '1', glow: 'none' }
        ];

        title.style.transition = 'all 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        title.style.textAlign = 'center';
        title.style.willChange = 'transform, opacity, filter';

        sequence.forEach(step => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    this.applyTitleStep(title, step);
                });
            }, step.delay);
        });

        setTimeout(() => {
            this.showGlowStatements(title);
        }, 1800);
    }

    showGlowStatements(title) {
        setTimeout(() => {
            const introScreen = this.elements.introScreen;
            const container = document.createElement('div');
            container.className = 'statements-container';
            container.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
                opacity: 0;
                transition: opacity 1.2s ease;
                z-index: 10;
                max-width: 90%;
            `;

            introScreen.appendChild(container);

            const taglines = [
                'Built for human creativity.',
                'Engineered for imagination.',
                'Born from wonder. Built in code.'
            ];

            taglines.forEach(text => {
                const glowText = document.createElement('div');
                glowText.className = 'glow-text';
                glowText.setAttribute('data-text', text);
                glowText.textContent = text;
                glowText.style.cssText = `
                    position: relative;
                    font-size: 48px;
                    font-weight: 500;
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    filter: brightness(1.1);
                    z-index: 1;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    text-align: center;
                    line-height: 1.2;
                    white-space: nowrap;
                `;
                container.appendChild(glowText);
            });

            this.injectGlowStyles();

            setTimeout(() => {
                const audio = new Audio('https://dl.dropbox.com/scl/fi/j6g7zspycjuoae3f0y74r/intro-description-sound.mp3?rlkey=cx3lg52kd8f2n0hprhfmdotop&st=6r7q6ofq&dl=0');
                audio.volume = 0.7;
                audio.play().catch(e => console.log('Audio play failed:', e));
            }, 100);

            setTimeout(() => {
                container.style.opacity = '1';
            }, 200);

            setTimeout(() => {
                this.transitionToSkyeJourney(title, container);
            }, 6500);
        }, 300);
    }

    transitionToSkyeJourney(title, container) {
        title.style.transition = 'opacity 1.5s ease';
        title.style.opacity = '0';
        container.style.transition = 'opacity 1.5s ease';
        container.style.opacity = '0';

        setTimeout(() => {
            container.remove();

            const introScreen = this.elements.introScreen;
            if (introScreen) {
                introScreen.style.background = '';
            }

            const startButton = this.elements.startButton;
            if (startButton) {
                startButton.style.opacity = '';
                startButton.style.pointerEvents = '';
            }

            const notifications = this.elements.notifications;
            notifications.forEach(notification => {
                notification.style.opacity = '';
                notification.style.pointerEvents = '';
            });

            title.textContent = 'SKYE JOURNEY';
            title.style.fontSize = '72px';
            title.style.letterSpacing = '-2px';
            title.style.opacity = '0';
            title.style.transform = 'none';
            title.style.filter = 'none';
            title.style.textShadow = 'none';
            title.style.willChange = 'auto';
            title.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            title.style.fontWeight = '700';
            title.style.color = '#ffffff';
            title.style.textAlign = 'center';

            setTimeout(() => {
                title.style.transition = 'opacity 1s ease';
                title.style.opacity = '1';

                setTimeout(() => {
                    this.showNotificationsSequence();
                }, 500);
            }, 300);
        }, 1500);
    }

    injectGlowStyles() {
        if (document.getElementById('glow-styles')) return;

        const style = document.createElement('style');
        style.id = 'glow-styles';
        style.textContent = `
            .glow-text::before {
                content: attr(data-text);
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg, #00cfff, #a600ff, #ff006e, #ff8800);
                filter: blur(20px) brightness(0.8);
                opacity: 0.7;
                border-radius: 100px;
                z-index: -1;
                pointer-events: none;
                background-size: 200% 200%;
                animation: gradientShift 12s ease-in-out infinite;
            }
            .glow-text::after {
                content: attr(data-text);
                position: absolute;
                inset: 0;
                font-size: inherit;
                font-weight: inherit;
                font-family: inherit;
                letter-spacing: inherit;
                background: linear-gradient(90deg, #00cfff, #a600ff, #ff006e, #ff8800);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                mix-blend-mode: color-burn;
                filter: blur(3px) brightness(1.3);
                z-index: 0;
                pointer-events: none;
                background-size: 200% 200%;
                animation: gradientShift 12s ease-in-out infinite;
            }
            @keyframes gradientShift {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);
    }

    applyTitleStep(title, step) {
        title.textContent = step.text;

        if (step.font === 'system') {
            title.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            title.style.fontWeight = '700';
        } else {
            title.style.fontFamily = `'${step.font}', sans-serif`;
            title.style.fontWeight = 'normal';
        }

        title.style.fontSize = step.size;
        title.style.opacity = step.opacity;

        const transforms = [];
        if (step.rotate) transforms.push(`rotate(${step.rotate})`);
        if (step.skew) transforms.push(`skewX(${step.skew})`);
        if (step.scale) transforms.push(`scale(${step.scale})`);

        title.style.transform = transforms.length > 0 ? transforms.join(' ') : 'none';
        title.style.filter = step.blur && step.blur !== '0px' ? `blur(${step.blur})` : 'none';

        if (step.glow === 'medium') {
            title.style.textShadow = '0 0 25px rgba(255, 255, 255, 0.4), 0 0 50px rgba(255, 255, 255, 0.2)';
        } else {
            title.style.textShadow = 'none';
        }

        if (step.delay === 240 || step.delay === 580 || step.delay === 970 || step.delay === 1300) {
            soundManager?.playWithFallback('knock', 0.25);
        }
    }

    showNotificationsSequence() {
        const notifications = this.elements.notifications;
        if (!notifications || notifications.length === 0) return;

        const notificationDelay = 550;

        notifications.forEach((notification, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    soundManager?.play('notification', 0.6);
                    this.showNotification(notification);
                });
            }, index * notificationDelay);
        });

        const startButton = this.elements.startButton;
        if (startButton) {
            const newButton = startButton.cloneNode(true);
            startButton.parentNode.replaceChild(newButton, startButton);
            this.elements.startButton = newButton;

            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.transitionToMain();
            }, { once: true });
        }
    }

    showNotification(notification) {
        if (!notification) return;

        notification.classList.add('show');

        setTimeout(() => {
            requestAnimationFrame(() => {
                notification.style.transition = 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                notification.style.transform = 'translateY(0) scale(0.98)';

                setTimeout(() => {
                    notification.style.transform = 'translateY(0) scale(1)';
                }, 100);
            });
        }, 600);
    }

    transitionToMain() {
        soundManager?.playWithFallback('command', 0.7);

        const notifications = this.elements.notifications;
        notifications.forEach(notification => {
            notification.classList.add('fade-out');
        });

        setTimeout(() => {
            requestAnimationFrame(() => {
                const introScreen = this.elements.introScreen;
                const homeScreen = document.getElementById('homeScreen');
                const mainNav = this.elements.mainNav;

                if (introScreen) introScreen.classList.add('hidden');
                if (homeScreen) homeScreen.classList.add('show');
                if (mainNav) mainNav.classList.add('show');

                this.currentPage = 'home';

                setTimeout(() => {
                    this.animateHomePage();
                }, 100);
            });
        }, 700);
    }

    navigateToPage(pageName) {
        if (this.currentPage === pageName) return;

        this.hideCurrentPage();

        setTimeout(() => {
            this.showPage(pageName);
            this.currentPage = pageName;
        }, 300);
    }

    hideCurrentPage() {
        const currentScreen = document.getElementById(`${this.currentPage}Screen`);
        if (currentScreen) {
            currentScreen.classList.remove('show');
        }
    }

    showPage(pageName) {
        const targetScreen = document.getElementById(`${pageName}Screen`);
        if (targetScreen) {
            targetScreen.classList.add('show');
            this.triggerPageAnimations(pageName);
        }
    }

    triggerPageAnimations(pageName) {
        switch (pageName) {
            case 'about':
                this.animateAboutPage();
                break;
            case 'home':
                this.animateHomePage();
                break;
        }
    }

    animateAboutPage() {
        const profileCards = document.querySelectorAll('.profile-card');
        this.stagger(profileCards, (card) => {
            this.slideIn(card, 'up', 50, 600);
        }, 120);

        setTimeout(() => {
            const socialLinks = document.querySelectorAll('.social-link');
            this.stagger(socialLinks, (link) => {
                this.scale(link, 0.85, 1, 400);
            }, 80);
        }, 350);

        setTimeout(() => {
            const locationCard = document.querySelector('.location-card');
            if (locationCard) this.fadeIn(locationCard, 500);
        }, 550);
    }

    animateHomePage() {
        const quoteCards = document.querySelectorAll('.quote-card');
        this.stagger(quoteCards, (card) => {
            this.fadeIn(card, 450);
        }, 90);

        setTimeout(() => {
            const toolCards = document.querySelectorAll('.tool-card');
            this.stagger(toolCards, (card) => {
                this.scale(card, 0.92, 1, 350);
            }, 60);
        }, 180);
    }

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        });
    }

    slideIn(element, direction = 'down', distance = 100, duration = 500) {
        const transforms = {
            up: `translateY(${distance}px)`,
            down: `translateY(-${distance}px)`,
            left: `translateX(${distance}px)`,
            right: `translateX(-${distance}px)`
        };

        element.style.transform = transforms[direction];
        element.style.opacity = '0';
        element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${duration}ms ease`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                element.style.transform = 'translate(0, 0)';
                element.style.opacity = '1';
            });
        });
    }

    scale(element, from = 0.5, to = 1, duration = 300) {
        element.style.transform = `scale(${from})`;
        element.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                element.style.transform = `scale(${to})`;
            });
        });
    }

    stagger(elements, animationFn, delay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    animationFn(element);
                });
            }, index * delay);
        });
    }

    pulse(element, scale = 1.05, duration = 200) {
        const original = element.style.transform;
        element.style.transition = `transform ${duration}ms ease`;
        element.style.transform = `scale(${scale})`;

        setTimeout(() => {
            element.style.transform = original;
        }, duration);
    }

    shake(element, intensity = 10, duration = 500) {
        element.animate([
            { transform: 'translateX(0)' },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: `translateX(-${intensity}px)` },
            { transform: `translateX(${intensity}px)` },
            { transform: 'translateX(0)' }
        ], {
            duration,
            easing: 'ease-in-out'
        });
    }

    // Method to reset intro state (useful for testing)
    resetIntroState() {
        try {
            localStorage.removeItem(this.INTRO_SEEN_KEY);
            console.log('Intro state reset. Reload page to see intro animation again.');
        } catch (e) {
            console.warn('Could not reset intro state:', e);
        }
    }

    destroy() {
        this.rafCallbacks.clear();
        this.animationQueue = [];
    }
}

export const animationsManager = new AnimationsManager();
window.animationsManager = animationsManager;
export default animationsManager;