/**
 * WORK MANAGER - STARVORTEX Section
 * OPTIMIZED VERSION v2.2 - IMPROVED SCROLL ANIMATIONS
 * - Better memory management
 * - Improved RAF usage with proper cleanup
 * - Audio pooling for better performance
 * - Fixed navigation integration
 * - Smoother exit transitions
 * - VISIONS section support
 * - IMPROVED: Scroll-based text animations trigger when elements are actually visible
 */

class WorkManager {
    constructor() {
        this.initialized = false;
        this.isActive = false;
        this.workAudio = null;
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
        
        // Track animated elements to prevent re-animation
        this.animatedElements = new Set();
        
        // Observers
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
        console.log('✅ Work Manager module loaded');
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
            setTimeout(() => this.playAmbientAudio(), 500);
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
        workScreen?.addEventListener('mousedown', this.startHold);
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
        this.cursorRAF = null;
        this.updateCursor();
    }
    
    updateCursor() {
        const cursor = this.cachedElements.cursor;
        if (!cursor || !this.isActive) return;
        
        cursor.style.transform = `translate3d(${this.lastMouseX - 60}px, ${this.lastMouseY - 60}px, 0)`;
        
        if (!this.throttleTimer) {
            this.throttleTimer = setTimeout(() => {
                this.detectScanTarget();
                this.throttleTimer = null;
            }, 50);
        }
    }
    
    detectScanTarget() {
        if (!this.isActive) return;
        
        if (this.scanTargetsCache.length === 0) {
            this.scanTargetsCache = Array.from(document.querySelectorAll('.sv-scan-target'));
        }
        
        const cursor = this.cachedElements.cursor;
        if (!cursor) return;
        
        let nearestTarget = null;
        let nearestDistance = Infinity;
        
        for (const target of this.scanTargetsCache) {
            const targetId = target.dataset.scanId;
            if (this.revealedScans.has(targetId)) continue;
            
            const rect = target.getBoundingClientRect();
            const centerX = rect.left + rect.width * 0.5;
            const centerY = rect.top + rect.height * 0.5;
            const dx = this.lastMouseX - centerX;
            const dy = this.lastMouseY - centerY;
            const distanceSq = dx * dx + dy * dy;
            
            if (distanceSq < 32400 && distanceSq < nearestDistance) {
                nearestTarget = target;
                nearestDistance = distanceSq;
            }
        }
        
        if (nearestTarget && !this.isHolding) {
            if (this.currentScanTarget !== nearestTarget) {
                this.currentScanTarget = nearestTarget;
                cursor.classList.add('near-target');
                if (this.cachedElements.cursorLabel) {
                    this.cachedElements.cursorLabel.textContent = 'CLICK & HOLD';
                }
                this.playHintSound();
            }
        } else if (!nearestTarget && !this.isHolding) {
            this.currentScanTarget = null;
            cursor.classList.remove('near-target');
            if (this.cachedElements.cursorLabel) this.cachedElements.cursorLabel.textContent = '';
            if (this.cachedElements.cursorHoldText) this.cachedElements.cursorHoldText.textContent = '';
        }
    }
    
    startHold(e) {
        if (!this.currentScanTarget) return;
        
        this.isHolding = true;
        this.holdProgress = 0;
        this.scanStage = 'voice-before';
        this.scanCompleted = false;
        
        const scanId = this.currentScanTarget.dataset.scanId;
        this.currentScanType = scanId;
        
        this.playClickSound();
        
        const cursor = this.cachedElements.cursor;
        cursor?.classList.add('holding');
        if (this.cachedElements.cursorLabel) this.cachedElements.cursorLabel.textContent = '';
        if (this.cachedElements.cursorHoldText) this.cachedElements.cursorHoldText.textContent = 'INITIALIZING...';
        
        this.playVoiceBefore(scanId, () => {
            if (this.isHolding && !this.scanCompleted) {
                this.scanStage = 'scanning';
                if (this.cachedElements.cursorHoldText) this.cachedElements.cursorHoldText.textContent = 'SCANNING...';
                this.startScanProcess(scanId);
            }
        });
        
        this.startHoldProgress();
    }
    
    startHoldProgress() {
        const progressCircle = this.cachedElements.cursorProgress;
        
        this.holdTimer = setInterval(() => {
            if (this.scanStage === 'scanning' && !this.scanCompleted) {
                this.holdProgress += 0.8;
            }
            
            if (progressCircle) {
                const offset = 251 - (251 * this.holdProgress / 100);
                progressCircle.style.strokeDashoffset = offset;
            }
            
            if (this.holdProgress >= 100 && this.scanStage === 'scanning') {
                this.completeHold();
            }
        }, 16);
    }
    
    startScanProcess(scanId) {
        this.startVFXEffect(this.currentScanTarget, scanId);
        
        this.playScanIntro(scanId, () => {
            this.stopVFXEffect();
            this.hideScannedText();
            this.scanStage = 'voice-after';
            
            this.playVoiceAfter(scanId, () => {
                this.scanStage = 'complete';
                this.finalizeScan();
            });
            
            if (this.currentScanTarget) {
                const targetId = this.currentScanTarget.dataset.scanId;
                this.revealScanPanels(targetId);
                this.playAffirmationSound();
            }
        });
    }
    
    endHold() {
        if (!this.isHolding) return;
        
        this.isHolding = false;
        clearInterval(this.holdTimer);
        
        const cursor = this.cachedElements.cursor;
        cursor?.classList.remove('holding');
        
        if (!this.scanCompleted) {
            this.holdProgress = 0;
            if (this.cachedElements.cursorProgress) this.cachedElements.cursorProgress.style.strokeDashoffset = 251;
            if (this.cachedElements.cursorHoldText) this.cachedElements.cursorHoldText.textContent = '';
            
            this.stopAllScanAudio();
            this.stopVFXEffect();
            this.scanStage = null;
            
            if (this.currentScanTarget && this.cachedElements.cursorLabel) {
                this.cachedElements.cursorLabel.textContent = 'CLICK & HOLD';
            }
        }
    }
    
    completeHold() {
        this.scanCompleted = true;
        clearInterval(this.holdTimer);
        
        const targetId = this.currentScanTarget?.dataset.scanId;
        if (targetId) this.revealedScans.add(targetId);
        
        this.playScanSound();
    }
    
    finalizeScan() {
        this.isHolding = false;
        this.scanCompleted = true;
        
        const cursor = this.cachedElements.cursor;
        cursor?.classList.remove('holding', 'near-target');
        if (this.cachedElements.cursorHoldText) this.cachedElements.cursorHoldText.textContent = '';
        if (this.cachedElements.cursorLabel) this.cachedElements.cursorLabel.textContent = '';
        if (this.cachedElements.cursorProgress) this.cachedElements.cursorProgress.style.strokeDashoffset = 251;
        
        this.currentScanTarget = null;
        this.currentScanType = null;
        this.scanStage = null;
        this.holdProgress = 0;
    }
    
    hideScannedText() {
        if (!this.currentScanTarget) return;
        
        this.currentScanTarget.style.transition = 'opacity 0.5s ease';
        this.currentScanTarget.style.opacity = '0';
        this.currentScanTarget.style.pointerEvents = 'none';
        
        setTimeout(() => {
            if (this.currentScanTarget) this.currentScanTarget.style.display = 'none';
        }, 500);
    }
    
    async initVFX() {
        if (window.VFX || this.scanVFX) return;
        
        try {
            if (window.VFX) {
                this.scanVFX = new window.VFX();
                return;
            }
            
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `import { VFX } from "https://esm.sh/@vfx-js/core@0.5.2"; window.VFX = VFX;`;
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                const checkVFX = () => {
                    if (window.VFX) {
                        this.scanVFX = new window.VFX();
                        resolve();
                    } else setTimeout(checkVFX, 100);
                };
                checkVFX();
            });
        } catch (error) {
            this.scanVFX = null;
        }
    }
    
    startVFXEffect(element, scanType) {
        if (!element) return;
        
        this.stopVFXEffect();
        this.vfxActive = true;
        element.classList.add('sv-scan-active');
        
        if (!window.VFX) return;
        
        try {
            if (!this.scanVFX) this.scanVFX = new window.VFX();
            const effect = this.createEnhancedVFXShader(element);
            if (effect) this.scanElements.push({ element, effect });
        } catch (error) {}
    }
    
    createEnhancedVFXShader(element) {
        if (!this.scanVFX || !element) return null;
        
        const shader = `
precision highp float;
uniform sampler2D src;
uniform vec2 resolution;
uniform vec2 offset;
uniform float time;
uniform float enterTime;
uniform float leaveTime;
uniform int mode;
uniform float layers;
uniform float speed;
uniform float delay;
uniform float width;
uniform float pixelSize;
#define W width
#define LAYERS layers
vec4 readTex(vec2 uv) { if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return vec4(0); return texture(src, uv); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(4859.0, 3985.0))) * 3984.0); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 getColdColor(vec2 p, float intensity) { float hue = mod((p.x * 0.3 + p.y * 0.7) * 0.4 + time * 0.1, 1.0); hue = mix(0.50, 0.80, hue); float sat = 0.9 + intensity * 0.1; float val = 0.8 + intensity * 0.2; vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 q = abs(fract(vec3(hue) + K.xyz) * 6.0 - K.www); return val * mix(K.xxx, clamp(q - K.xxx, 0.0, 1.0), sat); }
vec2 pixelate(vec2 uv, float size) { vec2 grid = vec2(resolution.x / size, resolution.y / size); return floor(uv * grid) / grid; }
float sdBox(vec2 p, float r) { vec2 q = abs(p) - r; return min(length(q), max(q.y, q.x)); }
float dir = 1.0;
float toRangeT(vec2 p, float scale) { float d; if (mode == 0) d = p.x / (scale * 2.0) + 0.5; else if (mode == 1) d = 1.0 - (p.y / (scale * 2.0) + 0.5); else d = length(p) / scale; return dir > 0.0 ? d : (1.0 - d); }
vec4 cell(vec2 p, vec2 pi, float scale, float t, float edge, float pixelScale) { vec2 pc = pi + 0.5; vec2 uvc = pc / scale; uvc.y /= resolution.y / resolution.x; uvc = uvc * 0.5 + 0.5; uvc = pixelate(uvc, pixelSize * pixelScale); if (uvc.x < 0.0 || uvc.x > 1.0 || uvc.y < 0.0 || uvc.y > 1.0) return vec4(0); float alpha = smoothstep(0.0, 0.1, texture2D(src, uvc, 3.0).a); float intensity = smoothstep(0.0, 1.0, t); vec4 color = vec4(getColdColor(pc, intensity), 1.0); float x = toRangeT(pi, scale); float n = hash(pi); float anim = smoothstep(W * 3.0, 0.0, abs(x + n * W - t)); float disappear = 1.0 - smoothstep(0.3, 1.0, t); color *= anim * disappear; color *= mix(1.0, clamp(0.5 / abs(sdBox(p - pc, 0.5)), 0.0, 15.0), edge * pow(anim, 8.0)); float pixelNoise = hash21(floor(pc * pixelSize * 2.0)); color *= (0.7 + 0.6 * pixelNoise); return color * alpha * (0.5 + 0.5 * cos(time * 8.0 + length(pc) * 4.0)); }
vec4 cellsColor(vec2 p, float scale, float t) { vec2 pi = floor(p); vec4 cc = vec4(0); float pixelScale = 1.0 + t * 2.0; cc += cell(p, pi, scale, t, 0.3, pixelScale) * 6.0; cc += cell(p, pi + vec2(0,1), scale, t, 1.2, pixelScale); cc += cell(p, pi - vec2(0,1), scale, t, 1.2, pixelScale); cc += cell(p, pi + vec2(1,0), scale, t, 1.2, pixelScale); cc += cell(p, pi - vec2(1,0), scale, t, 1.2, pixelScale); cc += cell(p, pi + vec2(1,1), scale, t, 0.8, pixelScale); cc += cell(p, pi - vec2(1,1), scale, t, 0.8, pixelScale); cc += cell(p, pi + vec2(1,-1), scale, t, 0.8, pixelScale); cc += cell(p, pi + vec2(-1,1), scale, t, 0.8, pixelScale); return cc / 12.0; }
vec4 draw(vec2 uv, vec2 p, float t, float scale) { vec4 c = readTex(uv); vec2 pi = floor(p * scale); float n = hash(pi); t = t * (1.0 + W * 6.0) - W * 3.0; float x = toRangeT(pi, scale); float a1 = smoothstep(t, t - W, x + n * W); float textDisappear = 1.0 - smoothstep(0.2, 0.8, t); c *= a1 * textDisappear; c += cellsColor(p * scale, scale, t) * 2.5; return c; }
void main() { vec2 uv = (gl_FragCoord.xy - offset) / resolution; vec2 p = uv * 2.0 - 1.0; p.y *= resolution.y / resolution.x; float t; if (leaveTime > 0.0) { dir = -1.0; t = clamp(leaveTime * speed, 0.0, 1.0); } else { t = clamp((enterTime - delay) * speed, 0.0, 1.0); } t = (fract(t * 0.99999) - 0.5) * dir + 0.5; for (float i = 0.0; i < LAYERS; i++) { float s = cos(i) * 9.0 + 12.0; gl_FragColor += draw(uv, p, t, abs(s)); } gl_FragColor /= LAYERS; gl_FragColor *= smoothstep(0.0, 0.02, t); }`;

        try {
            return this.scanVFX.add(element, { shader, overflow: 30, uniforms: { mode: 0, width: 0.15, layers: 4, speed: 0.6, delay: 0.05, pixelSize: 12.0 } });
        } catch (error) { return null; }
    }
    
    stopVFXEffect() {
        this.vfxActive = false;
        this.scanElements.forEach(item => {
            if (item.effect && this.scanVFX) try { this.scanVFX.remove(item.element); } catch (e) {}
            item.element?.classList.remove('sv-scan-active');
        });
        this.scanElements = [];
    }
    
    resetScanState() {
        this.stopAllScanAudio();
        this.stopVFXEffect();
        this.currentScanType = null;
        this.isProcessingAudio = false;
        this.scanStage = null;
        this.scanCompleted = false;
        this.holdProgress = 0;
    }
    
    playVoiceBefore(scanType, onEnded = null) {
        this.stopCurrentVoice();
        const audioSrc = this.audioTracks.scanBefore[scanType];
        if (!audioSrc) { if (onEnded) onEnded(); return; }
        try {
            this.currentVoiceAudio = this.getPooledAudio(audioSrc, 0.35);
            this.currentVoiceAudio.onended = () => { this.currentVoiceAudio = null; if (onEnded) onEnded(); };
            this.currentVoiceAudio.onerror = () => { this.currentVoiceAudio = null; if (onEnded) onEnded(); };
            this.currentVoiceAudio.play().catch(() => { this.currentVoiceAudio = null; if (onEnded) onEnded(); });
        } catch (e) { if (onEnded) onEnded(); }
    }
    
    playScanIntro(scanType, onEnded = null) {
        this.stopCurrentScanAudio();
        const audioSrc = this.audioTracks.scanIntro[scanType];
        if (!audioSrc) { if (onEnded) onEnded(); return; }
        try {
            this.currentScanAudio = this.getPooledAudio(audioSrc, 0.25);
            this.currentScanAudio.onended = () => { this.currentScanAudio = null; if (onEnded) onEnded(); };
            this.currentScanAudio.onerror = () => { this.currentScanAudio = null; if (onEnded) onEnded(); };
            this.currentScanAudio.play().catch(() => { this.currentScanAudio = null; if (onEnded) onEnded(); });
        } catch (e) { if (onEnded) onEnded(); }
    }
    
    playVoiceAfter(scanType, onEnded = null) {
        this.stopCurrentVoice();
        const audioSrc = this.audioTracks.scanAfter[scanType];
        if (!audioSrc) { if (onEnded) onEnded(); return; }
        try {
            this.currentVoiceAudio = this.getPooledAudio(audioSrc, 0.4);
            this.currentVoiceAudio.onended = () => { this.currentVoiceAudio = null; if (onEnded) onEnded(); };
            this.currentVoiceAudio.onerror = () => { this.currentVoiceAudio = null; if (onEnded) onEnded(); };
            this.currentVoiceAudio.play().catch(() => { this.currentVoiceAudio = null; if (onEnded) onEnded(); });
        } catch (e) { if (onEnded) onEnded(); }
    }
    
    stopCurrentVoice() { 
        if (this.currentVoiceAudio) { 
            try { 
                this.currentVoiceAudio.pause(); 
                this.currentVoiceAudio.currentTime = 0; 
                this.currentVoiceAudio.onended = null; 
                this.currentVoiceAudio.onerror = null; 
            } catch (e) {} 
            this.currentVoiceAudio = null; 
        } 
    }
    
    stopCurrentScanAudio() { 
        if (this.currentScanAudio) { 
            try { 
                this.currentScanAudio.pause(); 
                this.currentScanAudio.currentTime = 0; 
                this.currentScanAudio.onended = null; 
                this.currentScanAudio.onerror = null; 
            } catch (e) {} 
            this.currentScanAudio = null; 
        } 
    }
    
    stopAllScanAudio() { 
        this.stopCurrentVoice(); 
        this.stopCurrentScanAudio(); 
    }
    
    revealScanPanels(scanId) {
        const panels = document.querySelectorAll(`.sv-scan-panel[data-scan-group="${scanId}"]`);
        panels.forEach((panel, index) => {
            setTimeout(() => {
                panel.classList.add('revealed');
                this.animatePanelContent(panel);
                panel.querySelectorAll('.sv-skill-fill').forEach((fill, i) => setTimeout(() => fill.classList.add('animate'), i * 100));
            }, index * 200);
        });
        
        // Reveal vortex logo container (floating, no panel) for visions section
        if (scanId === 'visions') {
            const vortexContainer = document.querySelector('.sv-vortex-container[data-scan-group="visions"]');
            if (vortexContainer) {
                setTimeout(() => vortexContainer.classList.add('revealed'), 100);
            }
        }
        
        document.querySelectorAll(`.sv-scan-asset[data-scan-group="${scanId}"]`).forEach((asset, index) => setTimeout(() => asset.classList.add('visible'), index * 150));
        const dotPattern = document.querySelector(`.sv-dot-pattern[data-scan-group="${scanId}"]`);
        if (dotPattern) dotPattern.classList.add('visible');
    }
    
    animatePanelContent(panel) {
        this.playRolloverSound();
        panel.querySelectorAll('[data-text]').forEach((el, i) => {
            const text = el.dataset.text;
            const effect = el.dataset.effect;
            setTimeout(() => { 
                if (effect === 'scramble') this.scramble(el, text); 
                else if (effect === 'type') this.typewriter(el, text); 
            }, i * 80);
        });
    }
    
    showWorkContent() {
        const workScreen = document.getElementById('sv-work-screen');
        if (!workScreen) return;
        workScreen.style.display = 'block';
        this.setupScrollAnimations();
        requestAnimationFrame(() => workScreen.classList.add('active'));
    }
    
    /**
     * IMPROVED: Setup scroll animations with better visibility detection
     * - Sections use threshold 0.15 for general visibility
     * - Titles use a separate observer with higher threshold (0.5) + rootMargin
     *   to ensure the text is actually in view when scramble triggers
     */
    setupScrollAnimations() {
        const scroll = document.getElementById('sv-scroll');
        if (!scroll) return;
        
        // Observer for general section visibility (videos, backgrounds, etc.)
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Play videos when section becomes visible
                    entry.target.querySelectorAll('.sv-deco-vid').forEach(vid => { 
                        vid.currentTime = 0; 
                        vid.play().catch(() => {}); 
                    });
                }
            });
        }, { 
            threshold: 0.1, 
            root: scroll 
        });
        
        // Observer for text elements - triggers when element is more centered in viewport
        // Uses rootMargin to create a "trigger zone" in the middle of the viewport
        this.titleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const elId = el.id || el.dataset.animId;
                    
                    // Check if already animated
                    if (this.animatedElements.has(elId)) return;
                    this.animatedElements.add(elId);
                    
                    // Trigger the animation for this specific element
                    this.animateElement(el);
                }
            });
        }, { 
            threshold: 0.8,  // Element must be 80% visible
            root: scroll,
            rootMargin: '-10% 0px -10% 0px'  // Shrink the trigger area to center
        });
        
        // Observe all sections
        document.querySelectorAll('.sv-section').forEach(s => {
            this.sectionObserver.observe(s);
        });
        
        // Observe specific text elements that need scroll-triggered animations
        this.setupTextElementObservers();
    }
    
    /**
     * Setup observers for individual text elements
     */
    setupTextElementObservers() {
        // Grid section titles
        const gridTextElements = [
            { el: document.getElementById('sv-ch1'), text: 'ABOUT', effect: 'scramble', id: 'sv-ch1' },
            { el: document.getElementById('sv-title1'), text: 'STARVORTEX', effect: 'scramble', id: 'sv-title1' },
            { el: document.getElementById('sv-text1'), text: 'A GROWING TECH COLLECTIVE FORMED BY A SMALL, FOCUSED TEAM DEDICATED TO THE DESIGN AND DEVELOPMENT OF MODERN TECHNOLOGICAL SYSTEMS. THE GROUP SPANS MOBILE, DESKTOP, WEB APPLICATIONS, AND VIDEO GAME DEVELOPMENT.', effect: 'typewriter', id: 'sv-text1' },
            { el: document.getElementById('sv-ch2'), text: 'DIVISION 01', effect: 'scramble', id: 'sv-ch2' },
            { el: document.getElementById('sv-sub1'), text: 'QUANTUM ANALYTICS', effect: 'scramble', id: 'sv-sub1' },
            { el: document.getElementById('sv-text2'), text: 'FOCUSED ON DATA ANALYSIS AND ANALYTICAL SOLUTIONS. TRANSFORMING RAW DATA INTO ACTIONABLE INSIGHTS.', effect: 'typewriter', id: 'sv-text2' },
            { el: document.getElementById('sv-ch3'), text: 'DIVISION 02', effect: 'scramble', id: 'sv-ch3' },
            { el: document.getElementById('sv-sub2'), text: 'ECHO STUDIOS', effect: 'scramble', id: 'sv-sub2' },
            { el: document.getElementById('sv-text3'), text: 'DEDICATED TO VIDEO GAME DEVELOPMENT AND INTERACTIVE EXPERIENCES. THIS IS WHERE I, SKYE, CREATE AND INNOVATE!', effect: 'typewriter', id: 'sv-text3' },
        ];
        
        gridTextElements.forEach(item => {
            if (item.el) {
                item.el.dataset.animId = item.id;
                item.el.dataset.animText = item.text;
                item.el.dataset.animEffect = item.effect;
                this.titleObserver.observe(item.el);
            }
        });
        
        // Scan section titles (scroll reveal elements)
        document.querySelectorAll('.sv-scroll-reveal').forEach(el => {
            if (el.dataset.scrollText) {
                el.dataset.animId = el.dataset.scrollText;
                el.dataset.animText = el.dataset.scrollText;
                el.dataset.animEffect = 'scramble';
                this.titleObserver.observe(el);
            }
        });
        
        // Members section elements
        const membersLabel = document.getElementById('sv-members-label');
        const membersTitle = document.getElementById('sv-members-title');
        const membersSubtitle = document.getElementById('sv-members-subtitle');
        
        if (membersLabel) {
            membersLabel.dataset.animId = 'sv-members-label';
            membersLabel.dataset.animText = 'TEAM ROSTER';
            membersLabel.dataset.animEffect = 'scramble';
            this.titleObserver.observe(membersLabel);
        }
        
        if (membersTitle) {
            membersTitle.dataset.animId = 'sv-members-title';
            membersTitle.dataset.animText = 'MEMBERS';
            membersTitle.dataset.animEffect = 'glitchType';
            this.titleObserver.observe(membersTitle);
        }
        
        if (membersSubtitle) {
            membersSubtitle.dataset.animId = 'sv-members-subtitle';
            membersSubtitle.dataset.animText = 'STARVORTEX CORE TEAM • ACTIVE OPERATIVES';
            membersSubtitle.dataset.animEffect = 'typewriter';
            this.titleObserver.observe(membersSubtitle);
        }
        
        // Observe member cards container for revealing cards
        const membersSection = document.getElementById('sv-members');
        if (membersSection) {
            membersSection.dataset.animId = 'sv-members-section';
            // Use a separate observer for revealing member cards
            const memberCardsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has('sv-members-cards')) {
                        this.animatedElements.add('sv-members-cards');
                        // Reveal member cards with stagger
                        document.querySelectorAll('.sv-member-card').forEach((card, index) => {
                            setTimeout(() => card.classList.add('revealed'), 300 + (index * 200));
                        });
                        // Reveal data panels
                        document.querySelectorAll('.sv-data-panel').forEach((panel, index) => {
                            setTimeout(() => panel.classList.add('revealed'), 800 + (index * 150));
                        });
                    }
                });
            }, { 
                threshold: 0.3, 
                root: document.getElementById('sv-scroll') 
            });
            memberCardsObserver.observe(membersSection);
        }
    }
    
    /**
     * Animate a single element based on its data attributes
     */
    animateElement(el) {
        if (!el) return;
        
        const text = el.dataset.animText;
        const effect = el.dataset.animEffect;
        
        if (!text || !effect) return;
        
        this.playRolloverSound();
        
        switch (effect) {
            case 'scramble':
                this.scramble(el, text);
                break;
            case 'typewriter':
                this.typewriter(el, text);
                break;
            case 'glitchType':
                this.glitchType(el, text);
                break;
        }
    }
    
    /**
     * Legacy method - kept for compatibility but now handled by individual observers
     */
    animateSection(section) {
        // This method is now mostly handled by setupTextElementObservers
        // Keep minimal functionality for edge cases
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
        
        // Disconnect observers
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
        if (ws) { ws.classList.remove('active'); setTimeout(() => { ws.style.display = 'none'; }, 500); }
        
        const home = document.getElementById('homeScreen');
        if (home) { home.classList.remove('hidden'); home.classList.add('show'); }
        
        if (window.navigationManager) window.navigationManager.setActivePage('home');
        else if (window.app?.navigateTo) setTimeout(() => window.app.navigateTo('home'), 100);
    }
    
    hideOtherScreens() { 
        ['homeScreen', 'aboutScreen', 'contactScreen', 'introScreen'].forEach(id => { 
            const s = document.getElementById(id); 
            if (s) { s.classList.remove('show'); s.classList.add('hidden'); } 
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
    
    playAmbientAudio() { 
        try { 
            // Primero reproduce Main_song.mp3
            this.workAudio = this.getPooledAudio(this.audioTracks.mainSong, 0);
            this.workAudio.play().then(() => { 
                let v = 0; 
                const fade = setInterval(() => { 
                    v += 0.02; 
                    this.workAudio.volume = Math.min(0.3, v); 
                    if (v >= 0.3) clearInterval(fade); 
                }, 80); 
            }).catch(() => {});
            
            // Cuando termina Main_song, reproduce el ambient en loop
            this.workAudio.onended = () => {
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
            };
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
    
    playScanSound() { this.playSound(this.audioTracks.scan, 0.3); }
    playClickSound() { this.playSound(this.audioTracks.click, 0.25); }
    playHintSound() { this.playSound(this.audioTracks.hint, 0.2); }
    playAffirmationSound() { this.playSound(this.audioTracks.affirmation, 0.3); }
    playRolloverSound() { this.playSound(this.audioTracks.rollover, 0.15); }
    playTextAnimSound() { if (this.textAnimPlayed) return; this.textAnimPlayed = true; this.playSound(this.audioTracks.textAnim, 0.2); }
    playSound(src, volume = 0.25) { try { const s = this.getPooledAudio(src, volume); s.play().catch(() => {}); } catch (e) {} }
    
    destroy() { 
        this.stopWorkAudio(); 
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