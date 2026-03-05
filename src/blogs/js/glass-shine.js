/* =============================================
   GLASS SHINE MODULE
   Enhanced with lerped pointer tracking and
   proximity-based intensity for smoother
   border shine effect on .glass-shine elements.
   ============================================= */

class GlassShine {
    constructor() {
        this.elements = [];
        this.isTracking = false;
        this.rafId = null;
        this.pointerX = 0;
        this.pointerY = 0;
        this.lerpX = 0;
        this.lerpY = 0;
        this.lerpSpeed = 0.1;
    }

    init() {
        this.collectElements();
        this.bindPointer();
        this.startLoop();
    }

    collectElements() {
        this.elements = Array.from(document.querySelectorAll('.glass-shine'));
    }

    refresh() {
        this.collectElements();
    }

    bindPointer() {
        if (this.isTracking) return;
        this.isTracking = true;

        document.addEventListener('pointermove', (e) => {
            this.pointerX = e.clientX;
            this.pointerY = e.clientY;
        });
    }

    startLoop() {
        const tick = () => {
            this.rafId = requestAnimationFrame(tick);

            this.lerpX += (this.pointerX - this.lerpX) * this.lerpSpeed;
            this.lerpY += (this.pointerY - this.lerpY) * this.lerpSpeed;

            this.updateAngles();
        };
        tick();
    }

    updateAngles() {
        for (const el of this.elements) {
            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width * 0.5;
            const centerY = rect.top + rect.height * 0.5;
            const dx = this.lerpX - centerX;
            const dy = this.lerpY - centerY;
            const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;

            const dist = Math.sqrt(dx * dx + dy * dy);
            const proximity = 1.0 - Math.min(dist / 500, 1.0);
            const intensity = proximity * proximity;

            el.style.setProperty('--shine-angle', angle.toFixed(1));
            el.style.setProperty('--shine-intensity', intensity.toFixed(3));
        }
    }

    destroy() {
        this.isTracking = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

const glassShine = new GlassShine();
export default glassShine;
