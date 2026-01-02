/**
 * ============================
 * ANIMATIONS MANAGER MODULE
 * ============================
 * Handles all page animations and transitions
 * Includes Stellar Intro Controller
 * Optimized for smooth navigation between Home, About, Work, Contact
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
        this.pageAnimationStates = new Map();
        
        // Stellar Intro properties
        this.stellarAudio = {
            bgMusic: null,
            voice: null,
            dataTransition: null,
            finalTransition: null
        };
        
        this.subtitles = [
            { start: 0.0, end: 6.5, text: "Identity confirmed. Welcome aboard, Skye. All systems recognize your signature." },
            { start: 7.0, end: 10.5, text: "Creative core active, anomaly levels within acceptable range." },
            { start: 11.0, end: 14.5, text: "You are cleared for full access to Star Vortex systems." },
            { start: 15.0, end: 19.0, text: "This ship will not limit you, only amplify you. Proceed when ready." }
        ];
        
        this.introSkipped = false;
        this.skipHandler = null;
        this.skipKeyUpHandler = null;
        this.skipHoldProgress = 0;
        this.skipHoldInterval = null;
        this.isHoldingSpace = false;
        
        // Bind methods after they are defined
        setTimeout(() => {
            this.updateSubtitles = this.updateSubtitles.bind(this);
            this.handleSkipKeyDown = this.handleSkipKeyDown.bind(this);
            this.handleSkipKeyUp = this.handleSkipKeyUp.bind(this);
        }, 0);
    }

    init() {
        if (this.initialized) {
            console.log('⚠️ Animations already initialized, skipping');
            return;
        }
        
        console.log('🎬 Animations Manager initializing...');
        
        this.elements = {
            stellarIntro: document.getElementById('stellarIntro'),
            phaseVoice: document.getElementById('phaseVoice'),
            phaseData: document.getElementById('phaseData'),
            phaseBoarding: document.getElementById('phaseBoarding'),
            subtitleText: document.getElementById('subtitleText'),
            mainScreen: document.getElementById('mainScreen'),
            aboutScreen: document.getElementById('aboutScreen'),
            contactScreen: document.getElementById('contactScreen'),
            mainNav: document.getElementById('mainNav')
        };

        console.log('🔍 Elements found:', {
            stellarIntro: !!this.elements.stellarIntro,
            phaseVoice: !!this.elements.phaseVoice,
            phaseData: !!this.elements.phaseData,
            phaseBoarding: !!this.elements.phaseBoarding,
            subtitleText: !!this.elements.subtitleText
        });

        if (!this.elements.stellarIntro) {
            console.error('❌ stellarIntro element not found! Cannot start intro.');
            return;
        }

        // ALWAYS show intro - No localStorage check
        console.log('🚀 Starting Stellar Intro...');
        this.startStellarIntro();

        this.initialized = true;
        console.log('✅ Animations Manager initialized');
    }

    // ========================================
    // STELLAR INTRO SEQUENCE
    // ========================================
    
    preloadStellarAudio() {
        // Check if audio was unlocked by the loader
        const audioEnabled = window.loaderManager?.audioUnlocked || false;
        
        this.stellarAudio.bgMusic = new Audio('/src/sfx/INTROx_song.mp3');
        this.stellarAudio.bgMusic.volume = 0.15;
        this.stellarAudio.bgMusic.loop = false;
        
        this.stellarAudio.voice = new Audio('/src/starvortex_assets/voice_intro.mp3');
        this.stellarAudio.voice.volume = 0.8;
        
        this.stellarAudio.dataTransition = new Audio('/src/sfx/FX_flow_transition_data-tech.mp3');
        this.stellarAudio.dataTransition.volume = 0.4;
        
        this.stellarAudio.finalTransition = new Audio('/src/sfx/FX_Transition.mp3');
        this.stellarAudio.finalTransition.volume = 0.5;
        
        console.log('🎵 Stellar audio preloaded. Audio enabled:', audioEnabled);
    }
    
    async startStellarIntro() {
        this.preloadStellarAudio();
        this.setupSkipListener();
        
        await this.playStellarPhase1();
        
        if (this.introSkipped) return;
        await this.playStellarPhase2();
        
        if (this.introSkipped) return;
        await this.playStellarPhase3();
        
        if (this.introSkipped) return;
        this.transitionFromStellarToMain();
    }
    
    setupSkipListener() {
        const skipIndicator = document.getElementById('skipIndicator');
        const skipBar = skipIndicator?.querySelector('.skip-bar');
        
        this.skipHandler = (e) => {
            if (e.code === 'Space' && !this.introSkipped && !this.isHoldingSpace) {
                e.preventDefault();
                this.startSkipHold(skipBar, skipIndicator);
            }
        };
        
        this.skipKeyUpHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.cancelSkipHold(skipBar, skipIndicator);
            }
        };
        
        document.addEventListener('keydown', this.skipHandler);
        document.addEventListener('keyup', this.skipKeyUpHandler);
    }
    
    startSkipHold(skipBar, skipIndicator) {
        this.isHoldingSpace = true;
        this.skipHoldProgress = 0;
        
        // Add holding class for visual feedback
        if (skipIndicator) {
            skipIndicator.classList.add('holding');
        }
        
        const holdDuration = 3000; // 3 seconds
        const interval = 30; // Update every 30ms
        const increment = (interval / holdDuration) * 100;
        
        this.skipHoldInterval = setInterval(() => {
            this.skipHoldProgress += increment;
            
            // Update visual progress
            if (skipBar) {
                skipBar.style.setProperty('--progress', `${this.skipHoldProgress}%`);
            }
            
            // Complete skip when reaching 100%
            if (this.skipHoldProgress >= 100) {
                this.completeSkip(skipIndicator);
            }
        }, interval);
    }
    
    cancelSkipHold(skipBar, skipIndicator) {
        this.isHoldingSpace = false;
        
        if (this.skipHoldInterval) {
            clearInterval(this.skipHoldInterval);
            this.skipHoldInterval = null;
        }
        
        // Reset progress
        this.skipHoldProgress = 0;
        
        if (skipBar) {
            skipBar.style.setProperty('--progress', '0%');
        }
        
        if (skipIndicator) {
            skipIndicator.classList.remove('holding');
        }
    }
    
    completeSkip(skipIndicator) {
        this.cancelSkipHold(null, skipIndicator);
        this.introSkipped = true;
        
        // Animate skip indicator out
        if (skipIndicator) {
            skipIndicator.classList.add('pressed');
        }
        
        // Remove listeners
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        // Immediately transition
        this.cleanupStellarAudio();
        this.transitionFromStellarToMain();
    }
    
    skipStellarIntro() {
        // Legacy method - now handled by completeSkip
        this.completeSkip(document.getElementById('skipIndicator'));
    }
    
    handleSkip(e) {
        // Legacy method - kept for compatibility
        if (e.code === 'Space' && !this.introSkipped) {
            e.preventDefault();
        }
    }
    
    updateSubtitles() {
        const currentTime = this.stellarAudio.voice.currentTime;
        const subtitleText = this.elements.subtitleText;
        
        if (!subtitleText) return;
        
        const currentSub = this.subtitles.find(sub => 
            currentTime >= sub.start && currentTime < sub.end
        );
        
        if (currentSub) {
            if (subtitleText.textContent !== currentSub.text) {
                subtitleText.textContent = currentSub.text;
                subtitleText.style.animation = 'none';
                setTimeout(() => {
                    subtitleText.style.animation = 'fadeInText 0.5s ease';
                }, 10);
            }
        } else if (currentTime >= this.subtitles[this.subtitles.length - 1].end) {
            subtitleText.textContent = '';
        }
    }
    
    handleSkipKeyDown(e) {
        if (e.code === 'Space' && !this.introSkipped) {
            e.preventDefault();
        }
    }
    
    handleSkipKeyUp(e) {
        if (e.code === 'Space' && !this.introSkipped) {
            e.preventDefault();
        }
    }
    
    async playStellarPhase1() {
        return new Promise((resolve) => {
            const phaseVoice = this.elements.phaseVoice;
            const subtitleText = this.elements.subtitleText;
            
            if (!phaseVoice || !subtitleText) {
                resolve();
                return;
            }
            
            phaseVoice.classList.add('active');
            
            // Check if audio was unlocked
            const audioEnabled = window.loaderManager?.audioUnlocked || false;
            
            // Play background music if audio enabled
            if (audioEnabled && this.stellarAudio.bgMusic) {
                this.stellarAudio.bgMusic.play().catch((err) => {
                    console.log('Background music blocked:', err);
                });
            }
            
            setTimeout(() => {
                if (this.introSkipped) {
                    resolve();
                    return;
                }
                
                // Play voice if audio enabled
                if (audioEnabled && this.stellarAudio.voice) {
                    const voicePromise = this.stellarAudio.voice.play();
                    if (voicePromise !== undefined) {
                        voicePromise.then(() => {
                            console.log('🎤 Voice playing');
                        }).catch((err) => {
                            console.log('Voice blocked:', err);
                        });
                    }
                    
                    this.stellarAudio.voice.addEventListener('timeupdate', this.updateSubtitles.bind(this));
                    
                    this.stellarAudio.voice.onended = () => {
                        setTimeout(() => {
                            if (!this.introSkipped) {
                                subtitleText.textContent = '';
                                phaseVoice.classList.remove('active');
                            }
                            resolve();
                        }, 1500);
                    };
                    
                    // Fallback if voice doesn't play
                    setTimeout(() => {
                        if (this.stellarAudio.voice && this.stellarAudio.voice.paused && this.stellarAudio.voice.currentTime === 0) {
                            console.log('⏭️ Voice did not start, using timer');
                            if (!this.introSkipped) {
                                subtitleText.textContent = '';
                                phaseVoice.classList.remove('active');
                            }
                            resolve();
                        }
                    }, 21000); // 21s fallback
                } else {
                    // No audio or audio not enabled, use timer
                    console.log('⏭️ Audio not enabled, using 20s timer');
                    setTimeout(() => {
                        if (!this.introSkipped) {
                            subtitleText.textContent = '';
                            phaseVoice.classList.remove('active');
                        }
                        resolve();
                    }, 20000);
                }
            }, 800);
        });
    }
    
    async playStellarPhase2() {
        return new Promise((resolve) => {
            const phaseData = this.elements.phaseData;
            
            if (!phaseData || this.introSkipped) {
                resolve();
                return;
            }
            
            phaseData.classList.add('active');
            
            // Check if audio was unlocked
            const audioEnabled = window.loaderManager?.audioUnlocked || false;
            
            // Play transition sound if audio enabled
            if (audioEnabled && this.stellarAudio.dataTransition) {
                this.stellarAudio.dataTransition.play().catch((err) => {
                    console.log('Data transition audio blocked:', err);
                });
            }
            
            this.animateDataElements();
            
            setTimeout(() => {
                if (!this.introSkipped) {
                    phaseData.classList.remove('active');
                }
                resolve();
            }, 8000);
        });
    }
    
    animateDataElements() {
        const dataBars = document.querySelectorAll('.data-bar');
        dataBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('show');
                this.animateTypewriter(bar);
                this.animateScramble(bar);
            }, index * 200);
        });
        
        const modules = document.querySelectorAll('.module-btn');
        modules.forEach((module, index) => {
            setTimeout(() => {
                module.classList.add('show');
                this.animateTypewriter(module);
                this.animateScramble(module);
            }, 2000 + (index * 100));
        });
    }
    
    animateTypewriter(element) {
        const typeElements = element.querySelectorAll('.typewriter');
        typeElements.forEach(el => {
            const text = el.dataset.text || el.textContent;
            if (!text) return;
            
            el.textContent = '';
            let i = 0;
            const speed = 30;
            
            const type = () => {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            };
            
            setTimeout(type, 100);
        });
    }
    
    animateScramble(element) {
        const scrambleElements = element.querySelectorAll('.scramble');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
        
        scrambleElements.forEach(el => {
            const finalText = el.dataset.final || el.textContent;
            if (!finalText) return;
            
            let iteration = 0;
            const speed = 30;
            const maxIterations = finalText.length * 2;
            
            const scramble = () => {
                if (iteration < maxIterations) {
                    el.textContent = finalText
                        .split('')
                        .map((char, index) => {
                            if (index < iteration / 2) {
                                return finalText[index];
                            }
                            if (char === ' ') return ' ';
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('');
                    
                    iteration++;
                    setTimeout(scramble, speed);
                } else {
                    el.textContent = finalText;
                }
            };
            
            setTimeout(scramble, 150);
        });
    }
    
    async playStellarPhase3() {
        return new Promise((resolve) => {
            const phaseBoarding = this.elements.phaseBoarding;
            const boardingContainer = phaseBoarding?.querySelector('.boarding-container');
            
            if (!phaseBoarding || !boardingContainer || this.introSkipped) {
                resolve();
                return;
            }
            
            phaseBoarding.classList.add('active');
            
            setTimeout(() => {
                if (!this.introSkipped) {
                    boardingContainer.classList.add('show');
                }
            }, 200);
            
            // TODO: Second voice here when available
            
            setTimeout(() => {
                if (!this.introSkipped) {
                    phaseBoarding.classList.remove('active');
                }
                resolve();
            }, 6000);
        });
    }
    
    transitionFromStellarToMain() {
        // Hide skip indicator
        const skipIndicator = document.getElementById('skipIndicator');
        if (skipIndicator) {
            skipIndicator.classList.add('hidden');
        }
        
        // Remove skip listeners
        if (this.skipHandler) {
            document.removeEventListener('keydown', this.skipHandler);
            this.skipHandler = null;
        }
        if (this.skipKeyUpHandler) {
            document.removeEventListener('keyup', this.skipKeyUpHandler);
            this.skipKeyUpHandler = null;
        }
        
        // Clear any ongoing skip hold
        if (this.skipHoldInterval) {
            clearInterval(this.skipHoldInterval);
            this.skipHoldInterval = null;
        }
        
        // Check if audio was unlocked
        const audioEnabled = window.loaderManager?.audioUnlocked || false;
        
        // Play final transition if audio enabled
        if (audioEnabled && this.stellarAudio.finalTransition) {
            this.stellarAudio.finalTransition.play().catch((err) => {
                console.log('Final transition audio blocked');
            });
        }
        
        const stellarIntro = this.elements.stellarIntro;
        if (stellarIntro) {
            stellarIntro.classList.add('fade-out');
        }
        
        // Fade out background music if playing
        if (this.stellarAudio.bgMusic && !this.stellarAudio.bgMusic.paused) {
            const fadeOut = setInterval(() => {
                if (this.stellarAudio.bgMusic && this.stellarAudio.bgMusic.volume > 0.01) {
                    this.stellarAudio.bgMusic.volume -= 0.01;
                } else {
                    if (this.stellarAudio.bgMusic) {
                        this.stellarAudio.bgMusic.pause();
                    }
                    clearInterval(fadeOut);
                }
            }, 50);
        }
        
        setTimeout(() => {
            if (stellarIntro) {
                stellarIntro.style.display = 'none';
            }
            
            const homeScreen = document.getElementById('homeScreen');
            const mainNav = this.elements.mainNav;
            
            if (homeScreen) homeScreen.classList.add('show');
            if (mainNav) mainNav.classList.add('show');
            
            this.currentPage = 'home';
            
            setTimeout(() => {
                this.animateHomePage();
            }, 100);
            
            this.cleanupStellarAudio();
        }, 1000);
    }
    
    cleanupStellarAudio() {
        if (this.stellarAudio.voice) {
            this.stellarAudio.voice.removeEventListener('timeupdate', this.updateSubtitles.bind(this));
        }
        
        Object.values(this.stellarAudio).forEach(audio => {
            if (audio) {
                try {
                    if (!audio.paused) {
                        audio.pause();
                    }
                    audio.currentTime = 0;
                } catch (err) {
                    console.log('Error cleaning up audio:', err);
                }
            }
        });
    }

    // ========================================
    // PAGE ANIMATIONS
    // ========================================

    navigateToPage(pageName) {
        if (this.currentPage === pageName) return;

        const previousPage = this.currentPage;
        this.currentPage = pageName;

        this.triggerPageAnimations(pageName);
    }

    triggerPageAnimations(pageName) {
        switch (pageName) {
            case 'home':
                this.animateHomePage();
                break;
            case 'about':
                this.animateAboutPage();
                break;
            case 'contact':
                this.animateContactPage();
                break;
        }
    }

    animateHomePage() {
        if (this.pageAnimationStates.get('home')) return;

        const quotes = document.querySelectorAll('.quote-card');
        quotes.forEach((quote, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    quote.style.opacity = '0';
                    quote.style.transform = 'translateY(20px)';
                    quote.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        quote.style.opacity = '1';
                        quote.style.transform = 'translateY(0)';
                    }, 50);
                });
            }, index * 150);
        });

        const panels = document.querySelectorAll('.panel');
        panels.forEach((panel, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    panel.style.opacity = '0';
                    panel.style.transform = 'translateY(20px)';
                    panel.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        panel.style.opacity = '1';
                        panel.style.transform = 'translateY(0)';
                    }, 50);
                });
            }, (quotes.length * 150) + (index * 150));
        });

        this.pageAnimationStates.set('home', true);
    }

    animateAboutPage() {
        if (this.pageAnimationStates.get('about')) return;

        const profileHeader = document.querySelector('.profile-header');
        if (profileHeader) {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    profileHeader.style.opacity = '0';
                    profileHeader.style.transform = 'translateY(20px)';
                    profileHeader.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        profileHeader.style.opacity = '1';
                        profileHeader.style.transform = 'translateY(0)';
                    }, 50);
                });
            }, 100);
        }

        const interestCards = document.querySelectorAll('.interest-card');
        interestCards.forEach((card, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                });
            }, 300 + (index * 150));
        });

        this.pageAnimationStates.set('about', true);
    }

    animateContactPage() {
        if (this.pageAnimationStates.get('contact')) return;

        const formElements = document.querySelectorAll('.form-group, .submit-btn');
        formElements.forEach((element, index) => {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(20px)';
                    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, 50);
                });
            }, index * 100);
        });

        this.pageAnimationStates.set('contact', true);
    }

    queueAnimation(callback, priority = 0) {
        this.animationQueue.push({ callback, priority });
        this.animationQueue.sort((a, b) => b.priority - a.priority);
        this.processQueue();
    }

    processQueue() {
        if (this.isAnimating || this.animationQueue.length === 0) return;

        this.isAnimating = true;
        const { callback } = this.animationQueue.shift();

        requestAnimationFrame(() => {
            callback();
            this.isAnimating = false;
            this.processQueue();
        });
    }

    registerRAFCallback(callback) {
        this.rafCallbacks.add(callback);
    }

    unregisterRAFCallback(callback) {
        this.rafCallbacks.delete(callback);
    }

    runRAFCallbacks() {
        this.rafCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                this.rafCallbacks.delete(callback);
            }
        });
        requestAnimationFrame(() => this.runRAFCallbacks());
    }

    destroy() {
        this.animationQueue = [];
        this.rafCallbacks.clear();
        this.isAnimating = false;
        this.cleanupStellarAudio();
    }
}

export const animationsManager = new AnimationsManager();
window.animationsManager = animationsManager;
export default animationsManager;

// Add fadeInText animation for subtitles
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInText {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);