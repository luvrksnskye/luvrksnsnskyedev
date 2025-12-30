/**
 * WORK MANAGER - STARVORTEX Section
 * OPTIMIZED VERSION - Better performance, less lag
 * Changes:
 * - requestAnimationFrame for cursor updates
 * - Throttled target detection (50ms)
 * - DOM element caching
 * - Passive event listeners
 * - Transform instead of left/top for cursor
 * - Reduced reflows and repaints
 * - Sistema de escaneo por etapas con VFX y audio sincronizado
 * - Más píxeles en VFX y mejor sincronización de flujo
 * - HTML separated from JS for better loading
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
        
        // Estados del proceso de escaneo
        this.scanStage = null; // 'voice-before' | 'scanning' | 'voice-after' | 'complete'
        this.scanCompleted = false;
        
        this.scrambleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
        this.scrambleSpeed = 20;
        this.scrambleIncrement = 2;
        
        this.audioTracks = {
            ambient: '/src/sfx/TBL3_AFTER_loop.mp3',
            scan: '/src/sfx/scan-zoom.wav',
            click: '/src/sfx/click.wav',
            hint: '/src/sfx/hint-notification.wav',
            affirmation: '/src/sfx/affirmation-tech.wav',
            textAnim: '/src/sfx/FX_text_animation_loop.mp3',
            rollover: '/src/sfx/UI_menu_text_rollover.mp3',
            // AUDIOS POR ETAPAS DE ESCANEO
            scanBefore: {
                skye: '/src/sfx/voice_scan_before.wav',
                projects: '/src/sfx/voice_scan_before.wav'
            },
            scanIntro: {
                skye: '/src/sfx/scan_intro.mp3',
                projects: '/src/sfx/scan_intro.mp3'
            },
            scanAfter: {
                skye: '/src/sfx/skye_data_analysis.wav',
                projects: '/src/sfx/projects_data_analysis.wav'
            }
        };
        
        this.frameImages = [
            '/src/starvortex_assets/center-circle.png',
            '/src/starvortex_assets/center-circle (1).png',
            '/src/starvortex_assets/center-circle (2).png',
            '/src/starvortex_assets/center-circle (3).png'
        ];
        
        // Performance optimization - cache DOM references
        this.cachedElements = {};
        this.scanTargetsCache = [];
        this.cursorRAF = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.throttleTimer = null;
        this.textAnimPlayed = false;
        
        // Sistema de escaneo por etapas
        this.currentScanType = null;
        this.currentVoiceAudio = null;
        this.currentScanAudio = null;
        this.scanVFX = null;
        this.scanElements = [];
        this.vfxActive = false;
        this.isProcessingAudio = false;
        
        // Bind methods to avoid creating new functions
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.startHold = this.startHold.bind(this);
        this.endHold = this.endHold.bind(this);
    }
    
    init() {
        if (this.initialized) return;
        this.preloadAssets();
        this.setupWorkNavigation();
        // Precargar VFX
        this.initVFX().catch(() => {});
        this.initialized = true;
    }
    
    preloadAssets() {
        // Preload images with priority
        this.frameImages.forEach(src => { 
            const img = new Image(); 
            img.src = src; 
        });
        const teru = new Image();
        teru.src = '/src/starvortex_assets/teru00-sheet.png';
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
        
        // Clear caches
        this.cachedElements = {};
        this.scanTargetsCache = [];
        
        // Reset TODO (sin persistencia)
        this.resetScanState();
        this.revealedScans.clear();
        
        this.stopAllAudio();
        this.transformNavigation();
        this.hideOtherScreens();
        this.showWorkContent();
        this.initCustomCursor();
        
        setTimeout(() => this.playAmbientAudio(), 500);
        setTimeout(() => this.startAnimations(), 300);
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
        
        // Cache cursor elements for faster access
        this.cachedElements.cursor = cursor;
        this.cachedElements.cursorLabel = cursor.querySelector('.sv-cursor-label');
        this.cachedElements.cursorHoldText = cursor.querySelector('.sv-cursor-hold-text');
        this.cachedElements.cursorProgress = cursor.querySelector('.sv-cursor-progress');
        
        // Optimized event listeners with passive flag
        document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        workScreen?.addEventListener('mousedown', this.startHold);
        document.addEventListener('mouseup', this.endHold);
    }
    
    // Optimized mouse handling with RAF
    handleMouseMove(e) {
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (!this.cursorRAF) {
            this.cursorRAF = requestAnimationFrame(() => {
                this.updateCursor();
                this.cursorRAF = null;
            });
        }
    }
    
    updateCursor() {
        const cursor = this.cachedElements.cursor;
        if (!cursor || !this.isActive) return;
        
        // Use transform for better performance (GPU accelerated)
        cursor.style.transform = `translate(${this.lastMouseX - 60}px, ${this.lastMouseY - 60}px)`;
        
        // Throttle target detection (every 50ms instead of every frame)
        if (!this.throttleTimer) {
            this.throttleTimer = setTimeout(() => {
                this.detectScanTarget();
                this.throttleTimer = null;
            }, 50);
        }
    }
    
    detectScanTarget() {
        // Cache scan targets if needed
        if (this.scanTargetsCache.length === 0) {
            this.scanTargetsCache = Array.from(document.querySelectorAll('.sv-scan-target'));
        }
        
        const cursor = this.cachedElements.cursor;
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
            // Faster than Math.sqrt for comparison
            const distanceSq = dx * dx + dy * dy;
            
            if (distanceSq < 32400 && distanceSq < nearestDistance) { // 180^2 = 32400
                nearestTarget = target;
                nearestDistance = distanceSq;
            }
        }
        
        if (nearestTarget && !this.isHolding) {
            if (this.currentScanTarget !== nearestTarget) {
                this.currentScanTarget = nearestTarget;
                cursor.classList.add('near-target');
                this.cachedElements.cursorLabel.textContent = 'CLICK & HOLD';
                this.playHintSound();
            }
        } else if (!nearestTarget && !this.isHolding) {
            this.currentScanTarget = null;
            cursor.classList.remove('near-target');
            this.cachedElements.cursorLabel.textContent = '';
            this.cachedElements.cursorHoldText.textContent = '';
        }
    }
    
    startHold(e) {
        if (!this.currentScanTarget) return;
        
        this.isHolding = true;
        this.holdProgress = 0;
        this.scanStage = 'voice-before';
        this.scanCompleted = false;
        
        // Determinar tipo de escaneo
        const scanId = this.currentScanTarget.dataset.scanId;
        this.currentScanType = scanId;
        
        this.playClickSound();
        
        const cursor = this.cachedElements.cursor;
        cursor?.classList.add('holding');
        this.cachedElements.cursorLabel.textContent = '';
        this.cachedElements.cursorHoldText.textContent = 'INITIALIZING...';
        
        console.log('Iniciando proceso de escaneo para:', scanId);
        
        // ETAPA 1: Reproducir voz "before" inmediatamente
        this.playVoiceBefore(scanId, () => {
            console.log('Voz before terminada, iniciando etapa de escaneo');
            // Cuando termina la voz "before", comenzar etapa 2
            if (this.isHolding && !this.scanCompleted) {
                this.scanStage = 'scanning';
                this.cachedElements.cursorHoldText.textContent = 'SCANNING...';
                
                // ETAPA 2: Iniciar efecto VFX y audio de escaneo (8 segundos)
                this.startScanProcess(scanId);
            }
        });
        
        // Iniciar el timer de progreso pero más lento para dar tiempo a las etapas de audio
        this.startHoldProgress();
    }
    
    startHoldProgress() {
        const progressCircle = this.cachedElements.cursorProgress;
        
        this.holdTimer = setInterval(() => {
            // Solo incrementar progreso durante la etapa de escaneo
            if (this.scanStage === 'scanning' && !this.scanCompleted) {
                this.holdProgress += 0.8; // Más lento para dar tiempo al audio
            }
            
            if (progressCircle) {
                const offset = 251 - (251 * this.holdProgress / 100);
                progressCircle.style.strokeDashoffset = offset;
            }
            
            if (this.holdProgress >= 100 && this.scanStage === 'scanning') {
                console.log('Progreso completado');
                this.completeHold();
            }
        }, 16);
    }
    
    startScanProcess(scanId) {
        console.log('Iniciando proceso de escaneo VFX + audio para:', scanId);
        
        // Iniciar efecto VFX que hará desaparecer el texto
        this.startVFXEffect(this.currentScanTarget, scanId);
        
        // Iniciar audio de escaneo (8 segundos)
        this.playScanIntro(scanId, () => {
            console.log('Audio de escaneo terminado - 8 segundos completados');
            
            // Detener VFX (el texto ya debería haber desaparecido)
            this.stopVFXEffect();
            
            // Asegurar que el texto esté completamente oculto
            this.hideScannedText();
            
            this.scanStage = 'voice-after';
            
            // ETAPA 3: Reproducir voz "after" Y mostrar paneles simultáneamente
            this.playVoiceAfter(scanId, () => {
                console.log('Voz after terminada, completando escaneo totalmente');
                this.scanStage = 'complete';
                this.finalizeScan();
            });
            
            // MOSTRAR PANELES inmediatamente cuando inicia la voz "after"
            if (this.currentScanTarget) {
                const targetId = this.currentScanTarget.dataset.scanId;
                console.log('Revelando paneles mientras suena voz after');
                this.revealScanPanels(targetId);
                this.playAffirmationSound();
            }
        });
    }
    
    endHold() {
        if (!this.isHolding) return;
        
        console.log('Soltando hold, etapa actual:', this.scanStage);
        
        this.isHolding = false;
        clearInterval(this.holdTimer);
        
        const cursor = this.cachedElements.cursor;
        cursor?.classList.remove('holding');
        
        // Si no se completó el escaneo, cancelar todo
        if (!this.scanCompleted) {
            this.holdProgress = 0;
            if (this.cachedElements.cursorProgress) {
                this.cachedElements.cursorProgress.style.strokeDashoffset = 251;
            }
            this.cachedElements.cursorHoldText.textContent = '';
            
            // CANCELAR todo si se suelta antes de completar
            this.stopAllScanAudio();
            this.stopVFXEffect();
            this.scanStage = null;
            
            if (this.currentScanTarget) {
                this.cachedElements.cursorLabel.textContent = 'CLICK & HOLD';
            }
            
            console.log('Proceso cancelado por soltar hold');
        }
    }
    
    completeHold() {
        console.log('Hold completado');
        this.scanCompleted = true;
        clearInterval(this.holdTimer);
        
        const targetId = this.currentScanTarget?.dataset.scanId;
        if (targetId) this.revealedScans.add(targetId);
        
        // Sonido de escaneo completado
        this.playScanSound();
    }
    
    finalizeScan() {
        console.log('Finalizando escaneo completamente');
        
        this.isHolding = false;
        this.scanCompleted = true;
        
        const cursor = this.cachedElements.cursor;
        cursor?.classList.remove('holding', 'near-target');
        this.cachedElements.cursorHoldText.textContent = '';
        this.cachedElements.cursorLabel.textContent = '';
        
        if (this.cachedElements.cursorProgress) {
            this.cachedElements.cursorProgress.style.strokeDashoffset = 251;
        }
        
        this.currentScanTarget = null;
        this.currentScanType = null;
        this.scanStage = null;
        this.holdProgress = 0;
    }
    
    hideScannedText() {
        if (!this.currentScanTarget) return;
        
        // El efecto VFX ya "borró" las letras, solo asegurarnos que estén ocultas
        this.currentScanTarget.style.transition = 'opacity 0.5s ease';
        this.currentScanTarget.style.opacity = '0';
        this.currentScanTarget.style.pointerEvents = 'none';
        
        // Después de un momento, hacerlo display none
        setTimeout(() => {
            if (this.currentScanTarget) {
                this.currentScanTarget.style.display = 'none';
            }
        }, 500);
    }
    
    // ==================== SISTEMA VFX MEJORADO ====================
    
    async initVFX() {
        if (window.VFX || this.scanVFX) return;
        
        try {
            if (window.VFX) {
                this.scanVFX = new window.VFX();
                return;
            }
            
            const script = document.createElement('script');
            script.type = 'module';
            script.textContent = `
                import { VFX } from "https://esm.sh/@vfx-js/core@0.5.2";
                window.VFX = VFX;
            `;
            document.head.appendChild(script);
            
            await new Promise((resolve) => {
                const checkVFX = () => {
                    if (window.VFX) {
                        this.scanVFX = new window.VFX();
                        resolve();
                    } else {
                        setTimeout(checkVFX, 100);
                    }
                };
                checkVFX();
            });
        } catch (error) {
            console.warn('VFX library failed to load', error);
            this.scanVFX = null;
        }
    }
    
    startVFXEffect(element, scanType) {
        if (!element) return;
        
        console.log('Iniciando efecto VFX con más píxeles');
        
        // Detener cualquier efecto previo
        this.stopVFXEffect();
        this.vfxActive = true;
        
        // Fallback visual si VFX no está disponible
        element.classList.add('sv-scan-active');
        
        if (!window.VFX) {
            console.warn('VFX not available, using fallback');
            return;
        }
        
        try {
            if (!this.scanVFX) {
                this.scanVFX = new window.VFX();
            }
            
            // Crear efecto VFX mejorado con más píxeles
            const effect = this.createEnhancedVFXShader(element);
            if (effect) {
                this.scanElements.push({ element, effect });
                console.log('VFX effect started with enhanced pixelation');
            }
        } catch (error) {
            console.warn('Failed to create VFX effect', error);
        }
    }
    
    createEnhancedVFXShader(element) {
        if (!this.scanVFX || !element) return null;
        
        // Shader mejorado con más píxeles y mejor efecto de desaparición
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

vec4 readTex(vec2 uv) {
  if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) {
    return vec4(0);
  }
  return texture(src, uv);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(4859.0, 3985.0))) * 3984.0);
}

float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// COLORES FRIOS - azules, cian, morados más intensos
vec3 getColdColor(vec2 p, float intensity) {
    float hue = mod((p.x * 0.3 + p.y * 0.7) * 0.4 + time * 0.1, 1.0);
    hue = mix(0.50, 0.80, hue); // Más rango de colores fríos
    float sat = 0.9 + intensity * 0.1;
    float val = 0.8 + intensity * 0.2;
    
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 q = abs(fract(vec3(hue) + K.xyz) * 6.0 - K.www);
    return val * mix(K.xxx, clamp(q - K.xxx, 0.0, 1.0), sat);
}

// Función de pixelado mejorada
vec2 pixelate(vec2 uv, float size) {
    vec2 grid = vec2(resolution.x / size, resolution.y / size);
    return floor(uv * grid) / grid;
}

float sdBox(vec2 p, float r) {
  vec2 q = abs(p) - r;
  return min(length(q), max(q.y, q.x));
}

float dir = 1.0;

float toRangeT(vec2 p, float scale) {
  float d;
  
  if (mode == 0) {
    d = p.x / (scale * 2.0) + 0.5;
  }
  else if (mode == 1) {
    d = 1.0 - (p.y / (scale * 2.0) + 0.5);
  }
  else if (mode == 2) {
    d = length(p) / scale;
  }
  
  d = dir > 0.0 ? d : (1.0 - d);
  return d;
}

vec4 cell(vec2 p, vec2 pi, float scale, float t, float edge, float pixelScale) {
  vec2 pc = pi + 0.5;

  vec2 uvc = pc / scale;
  uvc.y /= resolution.y / resolution.x;
  uvc = uvc * 0.5 + 0.5;
  
  // Aplicar pixelado más intenso
  uvc = pixelate(uvc, pixelSize * pixelScale);
  
  if (uvc.x < 0.0 || uvc.x > 1.0 || uvc.y < 0.0 || uvc.y > 1.0) {
    return vec4(0);
  }
  
  float alpha = smoothstep(0.0, 0.1, texture2D(src, uvc, 3.0).a);
  
  // Intensidad basada en el progreso del tiempo
  float intensity = smoothstep(0.0, 1.0, t);
  vec4 color = vec4(getColdColor(pc, intensity), 1.0);
  
  float x = toRangeT(pi, scale);
  float n = hash(pi);
  float anim = smoothstep(W * 3.0, 0.0, abs(x + n * W - t));
  
  // Efecto de desaparición más agresivo
  float disappear = 1.0 - smoothstep(0.3, 1.0, t);
  color *= anim * disappear;    
    
  color *= mix(
    1.0, 
    clamp(0.5 / abs(sdBox(p - pc, 0.5)), 0.0, 15.0),
    edge * pow(anim, 8.0)
  ); 
  
  // Más píxeles dispersos
  float pixelNoise = hash21(floor(pc * pixelSize * 2.0));
  color *= (0.7 + 0.6 * pixelNoise);
  
  return color * alpha * (0.5 + 0.5 * cos(time * 8.0 + length(pc) * 4.0));
}

vec4 cellsColor(vec2 p, float scale, float t) {
  vec2 pi = floor(p);
  vec2 pf = fract(p);
 
  vec2 d = vec2(0, 1);

  vec4 cc = vec4(0);
  float pixelScale = 1.0 + t * 2.0; // Los píxeles se hacen más grandes con el tiempo
  
  cc += cell(p, pi, scale, t, 0.3, pixelScale) * 6.0;
  cc += cell(p, pi + d.xy, scale, t, 1.2, pixelScale);
  cc += cell(p, pi - d.xy, scale, t, 1.2, pixelScale);
  cc += cell(p, pi + d.yx, scale, t, 1.2, pixelScale);
  cc += cell(p, pi - d.yx, scale, t, 1.2, pixelScale);
  
  // Más píxeles en diagonal
  cc += cell(p, pi + vec2(1,1), scale, t, 0.8, pixelScale);
  cc += cell(p, pi - vec2(1,1), scale, t, 0.8, pixelScale);
  cc += cell(p, pi + vec2(1,-1), scale, t, 0.8, pixelScale);
  cc += cell(p, pi + vec2(-1,1), scale, t, 0.8, pixelScale);
   
  return cc / 12.0;
}

vec4 draw(vec2 uv, vec2 p, float t, float scale) {
  vec4 c = readTex(uv);

  vec2 pi = floor(p * scale);
  vec2 pf = fract(p * scale);

  float n = hash(pi);
  t = t * (1.0 + W * 6.0) - W * 3.0; // Más amplitud en el efecto
    
  float x = toRangeT(pi, scale);
  float a1 = smoothstep(t, t - W, x + n * W);
  
  // Desaparición más progresiva del texto original
  float textDisappear = 1.0 - smoothstep(0.2, 0.8, t);
  c *= a1 * textDisappear;

  c += cellsColor(p * scale, scale, t) * 2.5; // Más intensidad en los píxeles
  
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - offset) / resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.y *= resolution.y / resolution.x;

  float t;
  
  if (leaveTime > 0.0) {
    dir = -1.0;
    t = clamp(leaveTime * speed, 0.0, 1.0);
  } else {
    t = clamp((enterTime - delay) * speed, 0.0, 1.0);  
  }      
  t = (fract(t * 0.99999) - 0.5) * dir + 0.5;      
    
  for (float i = 0.0; i < LAYERS; i++) {
    float s = cos(i) * 9.0 + 12.0; // Más variedad en las escalas
    gl_FragColor += draw(uv, p, t, abs(s));
  }
  gl_FragColor /= LAYERS;  
  gl_FragColor *= smoothstep(0.0, 0.02, t);
}
`;

        try {
            const effect = this.scanVFX.add(element, {
                shader,
                overflow: 30,
                uniforms: {
                    mode: 0,
                    width: 0.15, // Más estrecho para más píxeles
                    layers: 4, // Más capas para más densidad
                    speed: 0.6, // Más lento para mejor sincronización con 8 segundos
                    delay: 0.05,
                    pixelSize: 12.0 // Tamaño de píxel más pequeño para más píxeles
                }
            });
            
            return effect;
        } catch (error) {
            console.warn('Failed to create VFX shader', error);
            return null;
        }
    }
    
    stopVFXEffect() {
        console.log('Deteniendo efecto VFX mejorado');
        this.vfxActive = false;
        
        // Remover efectos VFX
        this.scanElements.forEach(item => {
            if (item.effect && this.scanVFX) {
                try {
                    this.scanVFX.remove(item.element);
                } catch (e) {}
            }
            item.element?.classList.remove('sv-scan-active');
        });
        this.scanElements = [];
    }
    
    // ==================== SISTEMA DE AUDIO ====================
    
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
        if (!audioSrc) {
            console.warn(`No voice before audio for scan type: ${scanType}`);
            if (onEnded) onEnded();
            return;
        }
        
        try {
            console.log('Playing voice before:', audioSrc);
            this.currentVoiceAudio = new Audio(audioSrc);
            this.currentVoiceAudio.volume = 0.35;
            this.currentVoiceAudio.onended = () => {
                console.log('Voice before ended');
                this.currentVoiceAudio = null;
                if (onEnded) onEnded();
            };
            this.currentVoiceAudio.onerror = (e) => {
                console.error('Voice before error:', e);
                this.currentVoiceAudio = null;
                if (onEnded) onEnded();
            };
            this.currentVoiceAudio.play().catch(e => {
                console.error('Voice before play failed:', e);
                this.currentVoiceAudio = null;
                if (onEnded) onEnded();
            });
        } catch (e) {
            console.error('Voice before creation failed', e);
            this.currentVoiceAudio = null;
            if (onEnded) onEnded();
        }
    }
    
    playScanIntro(scanType, onEnded = null) {
        this.stopCurrentScanAudio();
        
        const audioSrc = this.audioTracks.scanIntro[scanType];
        if (!audioSrc) {
            console.warn(`No scan intro audio for scan type: ${scanType}`);
            if (onEnded) onEnded();
            return;
        }
        
        try {
            console.log('Playing scan intro (8 seconds):', audioSrc);
            this.currentScanAudio = new Audio(audioSrc);
            this.currentScanAudio.volume = 0.25;
            this.currentScanAudio.onended = () => {
                console.log('Scan intro ended (8 seconds completed)');
                this.currentScanAudio = null;
                if (onEnded) onEnded();
            };
            this.currentScanAudio.onerror = (e) => {
                console.error('Scan intro error:', e);
                this.currentScanAudio = null;
                if (onEnded) onEnded();
            };
            this.currentScanAudio.play().catch(e => {
                console.error('Scan intro play failed:', e);
                this.currentScanAudio = null;
                if (onEnded) onEnded();
            });
        } catch (e) {
            console.error('Scan intro creation failed', e);
            this.currentScanAudio = null;
            if (onEnded) onEnded();
        }
    }
    
    playVoiceAfter(scanType, onEnded = null) {
        this.stopCurrentVoice();
        
        const audioSrc = this.audioTracks.scanAfter[scanType];
        if (!audioSrc) {
            console.warn(`No voice after audio for scan type: ${scanType}`);
            if (onEnded) onEnded();
            return;
        }
        
        try {
            console.log('Playing voice after:', audioSrc);
            // Sin delay - inicia inmediatamente
            this.currentVoiceAudio = new Audio(audioSrc);
            this.currentVoiceAudio.volume = 0.4;
            this.currentVoiceAudio.onended = () => {
                console.log('Voice after ended');
                this.currentVoiceAudio = null;
                if (onEnded) onEnded();
            };
            this.currentVoiceAudio.onerror = (e) => {
                console.error('Voice after error:', e);
                this.currentVoiceAudio = null;
                if (onEnded) onEnded();
            };
            this.currentVoiceAudio.play().catch(e => {
                console.error('Voice after play failed:', e);
                this.currentVoiceAudio = null;
                if (onEnded) onEnded();
            });
        } catch (e) {
            console.error('Voice after creation failed', e);
            this.currentVoiceAudio = null;
            if (onEnded) onEnded();
        }
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
    
    // ==================== MÉTODOS EXISTENTES ====================
    
    revealScanPanels(scanId) {
        console.log('Revealing panels for:', scanId);
        
        const panels = document.querySelectorAll(`.sv-scan-panel[data-scan-group="${scanId}"]`);
        panels.forEach((panel, index) => {
            setTimeout(() => {
                panel.classList.add('revealed');
                this.animatePanelContent(panel);
                panel.querySelectorAll('.sv-skill-fill').forEach((fill, i) => {
                    setTimeout(() => fill.classList.add('animate'), i * 100);
                });
            }, index * 200);
        });
        
        const assets = document.querySelectorAll(`.sv-scan-asset[data-scan-group="${scanId}"]`);
        assets.forEach((asset, index) => {
            setTimeout(() => asset.classList.add('visible'), index * 150);
        });
        
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
    
    setupScrollAnimations() {
        const scroll = document.getElementById('sv-scroll');
        if (!scroll) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.animateSection(entry.target);
                    entry.target.querySelectorAll('.sv-deco-vid').forEach(vid => {
                        vid.currentTime = 0;
                        vid.play().catch(() => {});
                    });
                }
            });
        }, { threshold: 0.15, root: scroll });
        
        document.querySelectorAll('.sv-section').forEach(s => observer.observe(s));
    }
    
    animateSection(section) {
        if (section.classList.contains('animated')) return;
        section.classList.add('animated');
        const id = section.id;
        
        if (id === 'sv-sec-1') {
            this.playRolloverSound();
            setTimeout(() => this.scramble(document.getElementById('sv-ch1'), 'ABOUT'), 100);
            setTimeout(() => this.scramble(document.getElementById('sv-title1'), 'STARVORTEX'), 200);
            setTimeout(() => this.typewriter(document.getElementById('sv-text1'), 'A GROWING TECH MICRO-COMPANY FORMED BY A SMALL, FOCUSED TEAM DEDICATED TO THE DESIGN AND DEVELOPMENT OF MODERN TECHNOLOGICAL SYSTEMS. THE COMPANY SPANS MOBILE, DESKTOP, WEB APPLICATIONS, AND VIDEO GAME DEVELOPMENT.'), 400);
        } else if (id === 'sv-sec-2') {
            this.playRolloverSound();
            setTimeout(() => this.scramble(document.getElementById('sv-ch2'), 'DIVISION 01'), 100);
            setTimeout(() => this.scramble(document.getElementById('sv-sub1'), 'QUANTUM ANALYTICS'), 150);
            setTimeout(() => this.typewriter(document.getElementById('sv-text2'), 'FOCUSED ON DATA ANALYSIS AND ANALYTICAL SOLUTIONS. TRANSFORMING RAW DATA INTO ACTIONABLE INSIGHTS.'), 300);
            setTimeout(() => this.scramble(document.getElementById('sv-ch3'), 'DIVISION 02'), 100);
            setTimeout(() => this.scramble(document.getElementById('sv-sub2'), 'ECHO STUDIOS'), 150);
            setTimeout(() => this.typewriter(document.getElementById('sv-text3'), 'DEDICATED TO VIDEO GAME DEVELOPMENT AND INTERACTIVE EXPERIENCES. THIS IS WHERE I, SKYE, CREATE AND INNOVATE!'), 300);
        } else if (id === 'sv-scan-skye' || id === 'sv-scan-projects') {
            // Animar título con scramble al entrar en vista
            this.playRolloverSound();
            const scrollRevealEl = section.querySelector('.sv-scroll-reveal');
            if (scrollRevealEl && scrollRevealEl.dataset.scrollText) {
                setTimeout(() => this.scramble(scrollRevealEl, scrollRevealEl.dataset.scrollText), 100);
            }
        } else if (id === 'sv-members') {
            this.playRolloverSound();
            setTimeout(() => this.scramble(document.getElementById('sv-members-label'), 'TEAM ROSTER'), 100);
            setTimeout(() => this.glitchType(document.getElementById('sv-members-title'), 'MEMBERS'), 200);
            setTimeout(() => this.typewriter(document.getElementById('sv-members-subtitle'), 'STARVORTEX CORE TEAM • ACTIVE OPERATIVES'), 400);
            // Animate member cards
            const memberCards = document.querySelectorAll('.sv-member-card');
            memberCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('revealed');
                }, 600 + (index * 300));
            });
            // Animate data panels
            const dataPanels = document.querySelectorAll('.sv-data-panel');
            dataPanels.forEach((panel, index) => {
                setTimeout(() => {
                    panel.classList.add('revealed');
                }, 1200 + (index * 200));
            });
        }
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
        
        // Limpiar TODO
        this.stopAllScanAudio();
        this.stopVFXEffect();
        
        if (this.cursorRAF) {
            cancelAnimationFrame(this.cursorRAF);
            this.cursorRAF = null;
        }
        if (this.throttleTimer) {
            clearTimeout(this.throttleTimer);
            this.throttleTimer = null;
        }
        
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.endHold);
        
        this.stopWorkAudio();
        if (this.frameAnimation) { 
            clearInterval(this.frameAnimation); 
            this.frameAnimation = null; 
        }
        
        // Hide cursor
        const cursor = document.getElementById('sv-cursor');
        if (cursor) cursor.style.display = 'none';
        
        // RESETEAR TODO - Sin persistencia
        this.revealedScans.clear();
        this.cachedElements = {};
        this.scanTargetsCache = [];
        this.textAnimPlayed = false;
        this.currentScanTarget = null;
        this.currentScanType = null;
        this.resetScanState();
        
        if (this.scanVFX) {
            try {
                this.scanVFX.destroy();
            } catch (e) {}
            this.scanVFX = null;
        }
        
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
        
        const home = document.getElementById('homeScreen');
        if (home) { 
            home.classList.remove('hidden'); 
            home.classList.add('show'); 
        }
        
        if (window.app?.navigateTo) {
            setTimeout(() => window.app.navigateTo('home'), 100);
        }
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
            this.workAudio = new Audio(this.audioTracks.ambient); 
            this.workAudio.loop = true; 
            this.workAudio.volume = 0; 
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
    
    playScanSound() { 
        this.playSound(this.audioTracks.scan, 0.3);
    }
    
    playClickSound() {
        this.playSound(this.audioTracks.click, 0.25);
    }
    
    playHintSound() {
        this.playSound(this.audioTracks.hint, 0.2);
    }
    
    playAffirmationSound() {
        this.playSound(this.audioTracks.affirmation, 0.3);
    }
    
    playRolloverSound() {
        this.playSound(this.audioTracks.rollover, 0.15);
    }
    
    playTextAnimSound() {
        if (this.textAnimPlayed) return;
        this.textAnimPlayed = true;
        this.playSound(this.audioTracks.textAnim, 0.2);
    }
    
    playSound(src, volume = 0.25) {
        try { 
            const s = new Audio(src); 
            s.volume = volume; 
            s.play().catch(() => {}); 
        } catch (e) {}
    }
    
    destroy() { 
        this.stopWorkAudio(); 
        this.stopAllScanAudio();
        this.stopVFXEffect();
        
        if (this.frameAnimation) clearInterval(this.frameAnimation); 
        if (this.cursorRAF) cancelAnimationFrame(this.cursorRAF);
        if (this.throttleTimer) clearTimeout(this.throttleTimer);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.endHold);
        
        if (this.scanVFX) {
            try {
                this.scanVFX.destroy();
            } catch (e) {}
            this.scanVFX = null;
        }
        
        this.isActive = false; 
    }
}

export const workManager = new WorkManager();
window.workManager = workManager;
export default workManager;