/* =============================================
   POINTER SHINE MODULE
   Enhanced with lerped pointer tracking and
   proximity-based intensity for smoother,
   more fluid specular highlight movement.
   ============================================= */

class PointerShine {
    constructor() {
        this.panels = [];
        this.bound = false;
        this.rafId = null;
        this.pointerX = 0;
        this.pointerY = 0;
        this.lerpX = 0;
        this.lerpY = 0;
        this.lerpSpeed = 0.12;
    }

    init() {
        this.collectPanels();
        this.bindPointer();
        this.startLoop();
    }

    collectPanels() {
        this.panels = Array.from(document.querySelectorAll('.glass-specular'));
    }

    refresh() {
        this.collectPanels();
    }

    bindPointer() {
        if (this.bound) return;
        this.bound = true;

        document.addEventListener('pointermove', (event) => {
            this.pointerX = event.clientX;
            this.pointerY = event.clientY;
        });
    }

    startLoop() {
        const tick = () => {
            this.rafId = requestAnimationFrame(tick);

            /* Lerp for fluid motion */
            this.lerpX += (this.pointerX - this.lerpX) * this.lerpSpeed;
            this.lerpY += (this.pointerY - this.lerpY) * this.lerpSpeed;

            this.calculateAngles();
        };
        tick();
    }

    calculateAngles() {
        for (const panel of this.panels) {
            const rect = panel.getBoundingClientRect();
            const centerX = rect.left + rect.width * 0.5;
            const centerY = rect.top + rect.height * 0.5;

            const deltaX = this.lerpX - centerX;
            const deltaY = this.lerpY - centerY;

            const angleRadians = Math.atan2(deltaY, deltaX);
            let angleDegrees = (angleRadians * 180) / Math.PI;
            angleDegrees = (angleDegrees + 90 + 360) % 360;

            /* Proximity: stronger shine closer to pointer */
            const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDist = 600;
            const proximity = 1.0 - Math.min(dist / maxDist, 1.0);
            const intensity = proximity * proximity;

            panel.style.setProperty('--pointer-angle', angleDegrees.toFixed(2));
            panel.style.setProperty('--shine-intensity', intensity.toFixed(3));
        }
    }

    destroy() {
        this.bound = false;
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

const pointerShine = new PointerShine();
export default pointerShine;
