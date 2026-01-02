/**
 * WORK MANAGER - STARVORTEX Section
 * OPTIMIZED VERSION v2.3 - PRODUCTION READY
 * - Memory management optimized
 * - RAF usage with proper cleanup
 * - Audio pooling for better performance
 * - Fixed navigation integration
 * - Smooth exit transitions
 * - VISIONS section support
 * - Scroll-based animations when visible
 * - Sequential audio: Main_song.mp3 → loop ambient
 */

class WorkManager {
    constructor() {
        this.initialized = false;
        this.isActive = false;
        this.workAudio = null;
        this.mainSongAudio = null;
        this.frameAnimation = null;
        this.currentFrame = 0;
        this.frameDirection = 1;
        this.totalFrames = 4;
        
        this.currentScanTarget = null;
        this.isHolding = false;
        this.holdProgress = 0;
        this.holdTimer = null;
        this.revealedScans = new Set();
        
        this.scanStage = null;
        this.scanCompleted = false;
        
        this.scrambleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
        this.scrambleSpeed = 20;
        this.scrambleIncrement = 2;
        
        this.audioTracks = {
            mainSong: '/src/sfx/Main_song.mp3',
            ambient: '/src/sfx/TBL3_AFTER_loop.mp3',
            scan: '/src/sfx/scan-zoom.wav',
            click: '/src/sfx/click.wav',
            hint: '/src/sfx/hint-notification.wav',
            affirmation: '/src/sfx/affirmation-tech.wav',
            textAnim: '/src/sfx/FX_text_animation_loop.mp3',
            rollover: '/src/sfx/UI_menu_text_rollover.mp3',
            scanBefore: {
                skye: '/src/sfx/voice_scan_before.wav',
                projects: '/src/sfx/voice_scan_before.wav',
                visions: '/src/sfx/b-computer-on.mp3'
            },
            scanIntro: {
                skye: '/src/sfx/scan_intro.mp3',
                projects: '/src/sfx/scan_intro.mp3',
                visions: '/src/sfx/scan_intro.mp3'
            },
            scanAfter: {
                skye: '/src/sfx/skye_data_analysis.wav',
                projects: '/src/sfx/projects_data_analysis.wav',
                visions: '/src/sfx/visions_voice.wav'
            }
        };
        
        this.frameImages = [
            '/src/starvortex_assets/center-circle.png',
            '/src/starvortex_assets/center-circle (1).png',
            '/src/starvortex_assets/center-circle (2).png',
            '/src/starvortex_assets/center-circle (3).png'
        ];
        
        this.cachedElements = {};
        this.scanTargetsCache = [];
        this.cursorRAF = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.throttleTimer = null;
        this.textAnimPlayed = false;
        
        this.currentScanType = null;
        this.currentVoiceAudio = null;
        this.currentScanAudio = null;
        this.scanVFX = null;
        this.scanElements = [];
        this.vfxActive = false;
        this.isProcessingAudio = false;
        this.audioPool = new Map();
        
        this.animatedElements = new Set();
        this.sectionObserver = null;
        this.titleObserver = null;
        
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.startHold = this.startHold.bind(this);
        this.endHold = this.endHold.bind(this);
        this.updateCursorRAF = this.updateCursorRAF.bind(this);
    }
    
    init() {
        if (this.initialized) return;
        this.preloadAssets();
        this.setupWorkNavigation();
        this.initVFX().catch(() => {});
        this.initialized = true;
    }
    
    preloadAssets() {
        this.frameImages.forEach(src => { 
            const img = new Image(); 
            img.src = src; 
        });
        const teru = new Image();
        teru.src = '/src/starvortex_assets/teru00-sheet.png';
        
        Object.entries(this.audioTracks).forEach(([key, value]) => {
            if (typeof value === 'string') {
                this.preloadAudio(value);
            } else if (typeof value === 'object') {
                Object.values(value).forEach(url => this.preloadAudio(url));
            }
        });
    }
    
    preloadAudio(url) {
        if (this.audioPool.has(url)) return;
        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = url;
        this.audioPool.set(url, audio);
    }
    
    getPooledAudio(url, volume = 0.3) {
        const audio = new Audio(url);
        audio.volume = volume;
        return audio;
    }
    
    setupWorkNavigation() {
        document.addEventListener('click', (e) => {
            const workLink = e.target.closest('[data-page="work"]');
            if (workLink && !this.isActive) {
                e.preventDefault();
                this.enterWorkMode();
            }
        });
    }
    
    async enterWorkMode() {
        if (this.isActive) return;
        this.isActive = true;
        
        this.cachedElements = {};
        this.scanTargetsCache = [];
        this.animatedElements.clear();
        this.resetScanState();
        this.revealedScans.clear();
        
        this.stopAllAudio();
        this.transformNavigation();
        this.hideOtherScreens();
        this.showWorkContent();
        this.initCustomCursor();
        
        requestAnimationFrame(() => {
            setTimeout(() => this.playSequentialAudio(), 500);
            setTimeout(() => this.startAnimations(), 300);
        });
    }
    
    transformNavigation() {
        const mainNav = document.getElementById('mainNav');
        if (!mainNav) return;
        
        this.originalNavHTML = mainNav.innerHTML;
        mainNav.classList.add('sv-work-mode');
        
        const navMenu = mainNav.querySelector('.nav-menu');
        if (navMenu) navMenu.classList.add('sv-nav-styled');
        
        const backBtn = document.createElement('button');
        backBtn.className = 'sv-back-btn';
        backBtn.innerHTML = `<span class="sv-back-line"></span><span class="sv-back-line"></span>`;
        backBtn.addEventListener('click', () => this.exitWorkMode());
        mainNav.insertBefore(backBtn, mainNav.firstChild);
        
        const modeBox = document.createElement('div');
        modeBox.className = 'sv-mode-indicator';
        modeBox.innerHTML = `<span class="sv-mode-txt">S.V MODE</span>`;
        mainNav.appendChild(modeBox);
    }
    
    initCustomCursor() {
        const workScreen = document.getElementById('sv-work-screen');
        if (workScreen) workScreen.style.cursor = 'none';
        
        const cursor = document.getElementById('sv-cursor');
        if (!cursor) return;
        
        cursor.style.display = 'block';
        
        this.cachedElements.cursor = cursor;
        this.cachedElements.cursorLabel = cursor.querySelector('.sv-cursor-label');
        this.cachedElements.cursorHoldText = cursor.querySelector('.sv-cursor-hold-text');
        this.cachedElements.cursorProgress = cursor.querySelector('.sv-cursor-progress');
        
        document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        
        this.scanTargetsCache = Array.from(document.querySelectorAll('.sv-scan-target'));
        this.scanTargetsCache.forEach(target => {
            target.addEventListener('mouseenter', () => this.onScanTargetEnter(target));
            target.addEventListener('mouseleave', () => this.onScanTargetLeave());
            target.addEventListener('mousedown', this.startHold);
        });
        
        document.addEventListener('mouseup', this.endHold);
    }
    
    handleMouseMove(e) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (!this.cursorRAF) {
            this.cursorRAF = requestAnimationFrame(this.updateCursorRAF);
        }
    }
    
    updateCursorRAF() {
        const cursor = this.cachedElements.cursor;
        if (cursor) {
            cursor.style.transform = `translate(${this.lastMouseX}px, ${this.lastMouseY}px)`;
        }
        this.cursorRAF = null;
    }
    
    onScanTargetEnter(target) {
        const cursor = this.cachedElements.cursor;
        const label = this.cachedElements.cursorLabel;
        const holdText = this.cachedElements.cursorHoldText;
        
        if (!cursor) return;
        
        this.currentScanTarget = target;
        const scanType = target.dataset.scanType;
        const isRevealed = this.revealedScans.has(scanType);
        
        cursor.classList.add('over-scan');
        if (label) label.textContent = isRevealed ? 'ACCESSED' : 'HOLD TO SCAN';
        if (holdText) holdText.style.display = isRevealed ? 'none' : 'block';
        
        this.playHintSound();
    }
    
    onScanTargetLeave() {
        const cursor = this.cachedElements.cursor;
        const label = this.cachedElements.cursorLabel;
        const holdText = this.cachedElements.cursorHoldText;
        
        if (!cursor) return;
        
        cursor.classList.remove('over-scan');
        if (label) label.textContent = '';
        if (holdText) holdText.style.display = 'none';
        
        this.currentScanTarget = null;
        this.endHold();
    }
    
    startHold(e) {
        if (!this.currentScanTarget || this.isHolding) return;
        
        const scanType = this.currentScanTarget.dataset.scanType;
        if (this.revealedScans.has(scanType)) return;
        
        this.isHolding = true;
        this.holdProgress = 0;
        
        const progressCircle = this.cachedElements.cursorProgress;
        if (progressCircle) progressCircle.style.display = 'block';
        
        this.playScanSound();
        
        const duration = 2000;
        const interval = 16;
        const increment = (interval / duration) * 100;
        
        this.holdTimer = setInterval(() => {
            this.holdProgress += increment;
            
            if (progressCircle) {
                const offset = 251.2 - (251.2 * this.holdProgress / 100);
                progressCircle.style.strokeDashoffset = offset;
            }
            
            if (this.holdProgress >= 100) {
                this.completeScan();
            }
        }, interval);
    }
    
    endHold() {
        if (!this.isHolding) return;
        
        this.isHolding = false;
        this.holdProgress = 0;
        
        if (this.holdTimer) {
            clearInterval(this.holdTimer);
            this.holdTimer = null;
        }
        
        const progressCircle = this.cachedElements.cursorProgress;
        if (progressCircle) {
            progressCircle.style.display = 'none';
            progressCircle.style.strokeDashoffset = 251.2;
        }
    }
    
    completeScan() {
        this.endHold();
        
        if (!this.currentScanTarget) return;
        
        const scanType = this.currentScanTarget.dataset.scanType;
        this.revealedScans.add(scanType);
        
        const label = this.cachedElements.cursorLabel;
        const holdText = this.cachedElements.cursorHoldText;
        
        if (label) label.textContent = 'ACCESSED';
        if (holdText) holdText.style.display = 'none';
        
        this.playAffirmationSound();
        this.initiateScanSequence(scanType);
    }
    
    async initiateScanSequence(scanType) {
        if (this.isProcessingAudio) return;
        
        this.isProcessingAudio = true;
        this.currentScanType = scanType;
        this.scanStage = 'before';
        
        this.stopVFXEffect();
        await this.playScanBeforeSound(scanType);
    }
    
    async playScanBeforeSound(scanType) {
        const audioSrc = this.audioTracks.scanBefore[scanType];
        if (!audioSrc) {
            this.scanStage = 'intro';
            await this.playScanIntroSound(scanType);
            return;
        }
        
        this.currentVoiceAudio = this.getPooledAudio(audioSrc, 0.4);
        
        this.currentVoiceAudio.onended = async () => {
            this.scanStage = 'intro';
            await this.playScanIntroSound(scanType);
        };
        
        try {
            await this.currentVoiceAudio.play();
        } catch (e) {
            this.scanStage = 'intro';
            await this.playScanIntroSound(scanType);
        }
    }
    
    async playScanIntroSound(scanType) {
        const audioSrc = this.audioTracks.scanIntro[scanType];
        if (!audioSrc) {
            this.scanStage = 'after';
            await this.playScanAfterSound(scanType);
            return;
        }
        
        this.currentScanAudio = this.getPooledAudio(audioSrc, 0.35);
        
        this.currentScanAudio.onended = async () => {
            this.scanStage = 'after';
            await this.playScanAfterSound(scanType);
        };
        
        try {
            await this.currentScanAudio.play();
            this.startVFXEffect();
        } catch (e) {
            this.scanStage = 'after';
            await this.playScanAfterSound(scanType);
        }
    }
    
    async playScanAfterSound(scanType) {
        const audioSrc = this.audioTracks.scanAfter[scanType];
        if (!audioSrc) {
            this.completeScanSequence(scanType);
            return;
        }
        
        this.currentVoiceAudio = this.getPooledAudio(audioSrc, 0.4);
        
        this.currentVoiceAudio.onended = () => {
            this.completeScanSequence(scanType);
        };
        
        try {
            await this.currentVoiceAudio.play();
        } catch (e) {
            this.completeScanSequence(scanType);
        }
    }
    
    completeScanSequence(scanType) {
        this.stopVFXEffect();
        this.revealScanContent(scanType);
        this.isProcessingAudio = false;
        this.currentScanType = null;
        this.scanStage = null;
    }
    
    stopAllScanAudio() {
        if (this.currentVoiceAudio) {
            this.currentVoiceAudio.pause();
            this.currentVoiceAudio.currentTime = 0;
            this.currentVoiceAudio.onended = null;
            this.currentVoiceAudio = null;
        }
        
        if (this.currentScanAudio) {
            this.currentScanAudio.pause();
            this.currentScanAudio.currentTime = 0;
            this.currentScanAudio.onended = null;
            this.currentScanAudio = null;
        }
        
        this.isProcessingAudio = false;
        this.scanStage = null;
    }
    
    resetScanState() {
        this.stopAllScanAudio();
        this.currentScanTarget = null;
        this.currentScanType = null;
        this.isHolding = false;
        this.holdProgress = 0;
        this.scanStage = null;
        this.scanCompleted = false;
        
        if (this.holdTimer) {
            clearInterval(this.holdTimer);
            this.holdTimer = null;
        }
    }
    
    revealScanContent(scanType) {
        const contentId = `sv-${scanType}-content`;
        const content = document.getElementById(contentId);
        
        if (content) {
            content.classList.add('revealed');
            this.setupTextElementObservers(content);
        }
    }
    
    async initVFX() {
        try {
            const module = await import('./sv-enhanced.js');
            this.scanVFX = module.svEnhanced;
        } catch (e) {}
    }
    
    startVFXEffect() {
        if (this.scanVFX && typeof this.scanVFX.startScanVFX === 'function') {
            this.scanVFX.startScanVFX();
            this.vfxActive = true;
        }
    }
    
    stopVFXEffect() {
        if (this.scanVFX && typeof this.scanVFX.stopScanVFX === 'function') {
            this.scanVFX.stopScanVFX();
            this.vfxActive = false;
        }
    }
    
    showWorkContent() {
        const workScreen = document.getElementById('sv-work-screen');
        if (!workScreen) return;
        
        workScreen.style.display = 'block';
        requestAnimationFrame(() => {
            workScreen.classList.add('active');
        });
        
        this.setupScrollAnimations();
    }
    
    setupScrollAnimations() {
        const sections = document.querySelectorAll('.sv-section');
        
        if (!sections.length) return;
        
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    this.setupTextElementObservers(entry.target);
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '0px'
        });
        
        sections.forEach(section => {
            this.sectionObserver.observe(section);
        });
    }
    
    setupTextElementObservers(container) {
        if (!container) return;
        
        const titles = container.querySelectorAll('.sv-section-title');
        const texts = container.querySelectorAll('.sv-section-text');
        
        if (this.titleObserver) {
            this.titleObserver.disconnect();
        }
        
        this.titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const elementId = element.id || `${element.className}-${Math.random()}`;
                    
                    if (!this.animatedElements.has(elementId)) {
                        this.animatedElements.add(elementId);
                        
                        if (element.classList.contains('sv-section-title')) {
                            this.playRolloverSound();
                            const text = element.dataset.text || element.textContent;
                            this.scramble(element, text);
                        } else if (element.classList.contains('sv-section-text')) {
                            const text = element.dataset.text || element.textContent;
                            this.typewriter(element, text);
                        }
                        
                        this.titleObserver.unobserve(element);
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px'
        });
        
        [...titles, ...texts].forEach(el => {
            if (el.dataset.text || el.textContent.trim()) {
                this.titleObserver.observe(el);
            }
        });
    }
    
    animateSection(section) {
        if (section.classList.contains('animated')) return;
        section.classList.add('animated');
    }
    
    startAnimations() {
        this.startCircleAnimation();
        const hero = document.getElementById('sv-hero');
        if (hero) {
            hero.classList.add('visible');
            this.playTextAnimSound();
            setTimeout(() => { this.playRolloverSound(); this.glitchType(document.getElementById('sv-title'), 'STARVORTEX'); }, 400);
            setTimeout(() => this.typewriter(document.getElementById('sv-tagline'), 'ONE FORCE BEHIND TOMORROW\'S SYSTEMS'), 1000);
            setTimeout(() => { this.playRolloverSound(); this.scramble(document.getElementById('sv-label-l'), 'TECHNOLOGY'); }, 1400);
            setTimeout(() => { this.playRolloverSound(); this.scramble(document.getElementById('sv-label-r'), 'DESIGN. DEVELOP. DELIVER.'); }, 1600);
            setTimeout(() => this.typewriter(document.getElementById('sv-desc'), 'RATHER THAN FOCUSING ON A SINGLE SPECIALTY, STARVORTEX OPERATES UNDER A MULTI-DIVISION MODEL, WITH EACH DIVISION DEDICATED TO A SPECIFIC BRANCH OF TECHNOLOGY.'), 1800);
        }
    }
    
    glitchType(el, text) {
        if (!el) return;
        const chars = text.split('');
        let idx = 0, display = '', flicker = 0;
        el.textContent = '';
        const type = () => {
            if (idx >= chars.length) { el.textContent = text; return; }
            if (flicker < 2) { el.textContent = display + (flicker % 2 === 0 ? chars[idx] : '_'); flicker++; setTimeout(type, 40); }
            else { display += chars[idx]; el.textContent = display; idx++; flicker = 0; setTimeout(type, 50); }
        };
        type();
    }
    
    scramble(el, text) {
        if (!el) return;
        const letters = this.scrambleLetters;
        let iter = 0, resolved = 0;
        el.textContent = '';
        const animate = () => {
            if (resolved >= text.length) { el.textContent = text; return; }
            let result = text.substring(0, resolved);
            for (let i = resolved; i < text.length; i++) result += ' .,\'#>+'.includes(text[i]) ? text[i] : letters[Math.floor(Math.random() * letters.length)];
            el.textContent = result;
            if (++iter >= this.scrambleIncrement) { iter = 0; resolved++; }
            setTimeout(animate, this.scrambleSpeed);
        };
        animate();
    }
    
    typewriter(el, text) {
        if (!el) return;
        let i = 0;
        el.textContent = '';
        const type = () => { if (i < text.length) { el.textContent += text[i++]; setTimeout(type, 8); } };
        type();
    }
    
    startCircleAnimation() {
        const img = document.getElementById('sv-circle-img');
        if (!img) return;
        this.frameAnimation = setInterval(() => {
            this.currentFrame += this.frameDirection;
            if (this.currentFrame >= this.totalFrames - 1) this.frameDirection = -1;
            else if (this.currentFrame <= 0) this.frameDirection = 1;
            img.src = this.frameImages[this.currentFrame];
        }, 100);
    }
    
    exitWorkMode() {
        if (!this.isActive) return;
        this.isActive = false;
        
        this.stopAllScanAudio();
        this.stopVFXEffect();
        
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
            this.sectionObserver = null;
        }
        if (this.titleObserver) {
            this.titleObserver.disconnect();
            this.titleObserver = null;
        }
        
        if (this.cursorRAF) { cancelAnimationFrame(this.cursorRAF); this.cursorRAF = null; }
        if (this.throttleTimer) { clearTimeout(this.throttleTimer); this.throttleTimer = null; }
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.endHold);
        
        this.stopWorkAudio();
        this.stopMainSongAudio();
        if (this.frameAnimation) { clearInterval(this.frameAnimation); this.frameAnimation = null; }
        
        const cursor = document.getElementById('sv-cursor');
        if (cursor) cursor.style.display = 'none';
        
        this.revealedScans.clear();
        this.animatedElements.clear();
        this.cachedElements = {};
        this.scanTargetsCache = [];
        this.textAnimPlayed = false;
        this.currentScanTarget = null;
        this.currentScanType = null;
        this.resetScanState();
        
        if (this.scanVFX) { try { this.scanVFX.destroy(); } catch (e) {} this.scanVFX = null; }
        
        const nav = document.getElementById('mainNav');
        if (nav) { 
            nav.classList.remove('sv-work-mode'); 
            nav.querySelector('.sv-back-btn')?.remove(); 
            nav.querySelector('.sv-mode-indicator')?.remove(); 
            nav.querySelector('.nav-menu')?.classList.remove('sv-nav-styled'); 
        }
        
        const ws = document.getElementById('sv-work-screen');
        if (ws) { 
            ws.classList.remove('active'); 
            setTimeout(() => { ws.style.display = 'none'; }, 500); 
        }
        
        if (window.navigationManager) {
            window.navigationManager.isNavigating = false;
            window.navigationManager.finishNavigation();
        }
    }
    
    hideOtherScreens() { 
        ['homeScreen', 'aboutScreen', 'contactScreen', 'introScreen'].forEach(id => { 
            const s = document.getElementById(id); 
            if (s) { 
                s.classList.remove('show'); 
                s.classList.add('hidden'); 
            } 
        }); 
    }
    
    stopAllAudio() { 
        if (window.app?.get) { 
            const mm = window.app.get('music'); 
            if (mm?.pause) mm.pause(); 
        } 
        document.querySelectorAll('audio').forEach(a => { 
            if (!a.paused) { a.pause(); a.currentTime = 0; } 
        }); 
    }
    
    playSequentialAudio() {
        try {
            this.mainSongAudio = this.getPooledAudio(this.audioTracks.mainSong, 0);
            this.mainSongAudio.loop = false;
            
            this.mainSongAudio.onended = () => {
                this.playAmbientAudio();
            };
            
            this.mainSongAudio.play().then(() => {
                let v = 0;
                const fade = setInterval(() => {
                    v += 0.02;
                    this.mainSongAudio.volume = Math.min(0.3, v);
                    if (v >= 0.3) clearInterval(fade);
                }, 80);
            }).catch(() => {});
        } catch (e) {}
    }
    
    playAmbientAudio() { 
        try { 
            this.workAudio = this.getPooledAudio(this.audioTracks.ambient, 0);
            this.workAudio.loop = true;
            this.workAudio.play().then(() => { 
                let v = 0; 
                const fade = setInterval(() => { 
                    v += 0.02; 
                    this.workAudio.volume = Math.min(0.3, v); 
                    if (v >= 0.3) clearInterval(fade); 
                }, 80); 
            }).catch(() => {}); 
        } catch (e) {} 
    }
    
    stopWorkAudio() { 
        if (this.workAudio) { 
            let v = this.workAudio.volume; 
            const fade = setInterval(() => { 
                v -= 0.03; 
                this.workAudio.volume = Math.max(0, v); 
                if (v <= 0) { 
                    clearInterval(fade); 
                    this.workAudio.pause(); 
                    this.workAudio = null; 
                } 
            }, 50); 
        } 
    }
    
    stopMainSongAudio() {
        if (this.mainSongAudio) {
            let v = this.mainSongAudio.volume;
            const fade = setInterval(() => {
                v -= 0.03;
                this.mainSongAudio.volume = Math.max(0, v);
                if (v <= 0) {
                    clearInterval(fade);
                    this.mainSongAudio.pause();
                    this.mainSongAudio.onended = null;
                    this.mainSongAudio = null;
                }
            }, 50);
        }
    }
    
    playScanSound() { this.playSound(this.audioTracks.scan, 0.3); }
    playClickSound() { this.playSound(this.audioTracks.click, 0.25); }
    playHintSound() { this.playSound(this.audioTracks.hint, 0.2); }
    playAffirmationSound() { this.playSound(this.audioTracks.affirmation, 0.3); }
    playRolloverSound() { this.playSound(this.audioTracks.rollover, 0.15); }
    playTextAnimSound() { if (this.textAnimPlayed) return; this.textAnimPlayed = true; this.playSound(this.audioTracks.textAnim, 0.2); }
    playSound(src, volume = 0.25) { try { const s = this.getPooledAudio(src, volume); s.play().catch(() => {}); } catch (e) {} }
    
    destroy() { 
        this.stopWorkAudio();
        this.stopMainSongAudio();
        this.stopAllScanAudio();
        this.stopVFXEffect();
        if (this.frameAnimation) clearInterval(this.frameAnimation); 
        if (this.cursorRAF) cancelAnimationFrame(this.cursorRAF);
        if (this.throttleTimer) clearTimeout(this.throttleTimer);
        if (this.sectionObserver) this.sectionObserver.disconnect();
        if (this.titleObserver) this.titleObserver.disconnect();
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.endHold);
        if (this.scanVFX) { try { this.scanVFX.destroy(); } catch (e) {} this.scanVFX = null; }
        this.audioPool.clear();
        this.animatedElements.clear();
        this.isActive = false; 
    }
}

export const workManager = new WorkManager();
window.workManager = workManager;
export default workManager;
