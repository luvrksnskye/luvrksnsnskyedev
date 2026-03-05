// Ajusta la ruta al path real de tu sound-manager en el proyecto
import soundManager from './sound-manager.js';

class TimingFunctionGraph {
    constructor(container) {
        this.container = container;
        if (!this.container) return;

        this.canvas = container.querySelector('.timing-graph__canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.buttons = container.querySelectorAll('.timing-btn');
        this.ball = container.querySelector('.timing-ball');
        this.playBtn = container.querySelector('.timing-play-btn');

        this.currentTiming = 'ease';
        this.dpr = window.devicePixelRatio || 1;
        this.animFrame = null;

        this.currentPoints = new Float64Array(200);
        this.targetPoints = new Float64Array(200);
        this.transitionProgress = 1;
        this.isTransitioning = false;

        this.timingFunctions = {
            'linear':      { points: null, css: 'linear' },
            'ease':        { points: [0.25, 0.1, 0.25, 1.0], css: 'ease' },
            'ease-in':     { points: [0.42, 0, 1.0, 1.0], css: 'ease-in' },
            'ease-out':    { points: [0, 0, 0.58, 1.0], css: 'ease-out' },
            'ease-in-out': { points: [0.42, 0, 0.58, 1.0], css: 'ease-in-out' },
            'spring':      { points: [0.34, 1.56, 0.64, 1.0], css: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
            'steps(5)':    { steps: 5, css: 'steps(5, jump-none)' },
            'steps(3)':    { steps: 3, css: 'steps(3, jump-none)' },
        };

        this.init();
    }

    init() {
        this.setupCanvas();
        this.computePoints('ease', this.currentPoints);
        this.computePoints('ease', this.targetPoints);
        this.draw();
        this.bindEvents();
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.w = rect.width;
        this.h = rect.height;
    }

    bindEvents() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.buttons.forEach(b => b.classList.remove('timing-btn--active'));
                btn.classList.add('timing-btn--active');

                // Selección de curva de timing → menuClick
                soundManager.play('menuClick');

                const newTiming = btn.dataset.timing;
                this.transitionTo(newTiming);
            });
        });

        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.playAnimation());
        }

        const ro = new ResizeObserver(() => {
            this.setupCanvas();
            this.draw();
        });
        ro.observe(this.canvas);
    }

    computePoints(name, arr) {
        const fn = this.timingFunctions[name];
        const n = arr.length;

        if (fn.steps) {
            const s = fn.steps;
            for (let i = 0; i < n; i++) {
                const t = i / (n - 1);
                const stepIndex = Math.min(Math.floor(t * s), s - 1);
                arr[i] = stepIndex / (s - 1);
            }
        } else if (fn.points) {
            const [x1, y1, x2, y2] = fn.points;
            for (let i = 0; i < n; i++) {
                const t = i / (n - 1);
                arr[i] = this.cubicBezier(t, x1, y1, x2, y2);
            }
        } else {
            for (let i = 0; i < n; i++) {
                arr[i] = i / (n - 1);
            }
        }
    }

    transitionTo(newTiming) {
        this.currentTiming = newTiming;

        for (let i = 0; i < this.currentPoints.length; i++) {
            this.currentPoints[i] = this.getDisplayPoint(i);
        }

        this.computePoints(newTiming, this.targetPoints);
        this.transitionProgress = 0;
        this.isTransitioning = true;
        this.transitionStart = performance.now();
        this.transitionDuration = 500;

        if (!this.animFrame) {
            this.animateTransition();
        }
    }

    getDisplayPoint(i) {
        if (this.transitionProgress >= 1) return this.targetPoints[i];
        const t = this.easeOutQuart(this.transitionProgress);
        return this.currentPoints[i] + (this.targetPoints[i] - this.currentPoints[i]) * t;
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    animateTransition() {
        const now = performance.now();
        this.transitionProgress = Math.min(
            (now - this.transitionStart) / this.transitionDuration,
            1
        );

        this.draw();

        if (this.transitionProgress < 1) {
            this.animFrame = requestAnimationFrame(() => this.animateTransition());
        } else {
            this.isTransitioning = false;
            this.animFrame = null;
            for (let i = 0; i < this.targetPoints.length; i++) {
                this.currentPoints[i] = this.targetPoints[i];
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        const pad = 40;
        const gw = this.w - pad * 2;
        const gh = this.h - pad * 2;

        ctx.clearRect(0, 0, this.w, this.h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = pad + (gw / 4) * i;
            const y = pad + (gh / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, pad);
            ctx.lineTo(x, pad + gh);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(pad, y);
            ctx.lineTo(pad + gw, y);
            ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Time', pad + gw / 2, this.h - 6);
        ctx.save();
        ctx.translate(10, pad + gh / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Progress', 0, 0);
        ctx.restore();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '9px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('0', pad - 14, pad + gh + 4);
        ctx.fillText('1', pad + gw + 6, pad + gh + 4);
        ctx.textAlign = 'right';
        ctx.fillText('1', pad - 6, pad + 4);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad, pad + gh);
        ctx.lineTo(pad + gw, pad);
        ctx.stroke();
        ctx.setLineDash([]);

        const n = this.currentPoints.length;
        const gradient = ctx.createLinearGradient(pad, 0, pad + gw, 0);
        gradient.addColorStop(0, 'rgba(130, 170, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(180, 205, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 160, 255, 0.7)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        for (let i = 0; i < n; i++) {
            const t = i / (n - 1);
            const val = this.getDisplayPoint(i);
            const x = pad + t * gw;
            const y = pad + gh - val * gh;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();

        ctx.save();
        ctx.shadowColor = 'rgba(180, 205, 255, 0.25)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        ctx.lineTo(pad + gw, pad + gh);
        ctx.lineTo(pad, pad + gh);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, pad, 0, pad + gh);
        fillGrad.addColorStop(0, 'rgba(180, 205, 255, 0.06)');
        fillGrad.addColorStop(1, 'rgba(180, 205, 255, 0)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        if (!this.isTransitioning) {
            const fn = this.timingFunctions[this.currentTiming];
            if (fn.points) {
                const [x1, y1, x2, y2] = fn.points;
                this.drawControlPoint(ctx, pad + x1 * gw, pad + gh - y1 * gh, pad, pad + gh);
                this.drawControlPoint(ctx, pad + x2 * gw, pad + gh - y2 * gh, pad + gw, pad);
            }

            if (fn.steps) {
                const s = fn.steps;
                for (let i = 0; i < s; i++) {
                    const t = i / (s - 1);
                    const x = pad + t * gw;
                    const y = pad + gh - t * gh;
                    ctx.fillStyle = 'rgba(180, 205, 255, 0.9)';
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    drawControlPoint(ctx, cpx, cpy, startX, startY) {
        ctx.strokeStyle = 'rgba(180, 205, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(cpx, cpy);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = 'rgba(180, 205, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cpx, cpy, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(180, 205, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(cpx, cpy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cpx, cpy, 4, 0, Math.PI * 2);
        ctx.stroke();
    }

    cubicBezier(t, x1, y1, x2, y2) {
        const cx = 3 * x1;
        const bx = 3 * (x2 - x1) - cx;
        const ax = 1 - cx - bx;
        const cy = 3 * y1;
        const by = 3 * (y2 - y1) - cy;
        const ay = 1 - cy - by;

        let xt = t;
        for (let i = 0; i < 8; i++) {
            const xEst = ((ax * xt + bx) * xt + cx) * xt;
            const dxEst = (3 * ax * xt + 2 * bx) * xt + cx;
            if (Math.abs(dxEst) < 1e-6) break;
            xt = xt - (xEst - t) / dxEst;
        }

        return ((ay * xt + by) * xt + cy) * xt;
    }

    playAnimation() {
        if (!this.ball) return;
        const fn = this.timingFunctions[this.currentTiming];

        // Arranque de la animación → on
        soundManager.play('on');

        this.ball.classList.remove('timing-ball--animating');
        this.ball.style.setProperty('--ball-timing', fn.css);
        this.ball.style.left = '12px';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.ball.classList.add('timing-ball--animating');
            });
        });

        setTimeout(() => {
            // La bola llega al destino → knock
            soundManager.play('knock');
            this.ball.classList.remove('timing-ball--animating');
            this.ball.style.left = '12px';
        }, 1600);
    }
}

class SpringPlayground {
    constructor(container) {
        this.container = container;
        if (!this.container) return;

        this.canvas = container.querySelector('.spring-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.object = container.querySelector('.spring-object');
        this.playBtn = container.querySelector('.timing-play-btn');
        this.presetRows = container.querySelectorAll('.spring-presets-table tbody tr');

        this.massSlider = container.querySelector('[data-param="mass"]');
        this.stiffnessSlider = container.querySelector('[data-param="stiffness"]');
        this.dampingSlider = container.querySelector('[data-param="damping"]');
        this.bounceSlider = container.querySelector('[data-param="bounce"]');

        this.massValue = container.querySelector('[data-value="mass"]');
        this.stiffnessValue = container.querySelector('[data-value="stiffness"]');
        this.dampingValue = container.querySelector('[data-value="damping"]');
        this.bounceValue = container.querySelector('[data-value="bounce"]');

        this.equationFormula = container.querySelector('.spring-equation__formula');
        this.paramDisplays = {
            mass: container.querySelector('[data-display="mass"]'),
            stiffness: container.querySelector('[data-display="stiffness"]'),
            damping: container.querySelector('[data-display="damping"]'),
            frequency: container.querySelector('[data-display="frequency"]'),
        };

        this.dpr = window.devicePixelRatio || 1;

        this.mass = 1.0;
        this.stiffness = 180;
        this.damping = 12;
        this.bounce = 0.2;

        this.displayPoints = new Float64Array(300);
        this.targetCurvePoints = new Float64Array(300);
        this.curveTransitionProgress = 1;
        this.curveTransitioning = false;

        this.animFrame = null;
        this.isAnimating = false;

        // Timestamp para throttle del sonido en sliders
        this._lastTickTime = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.computeSpringCurve(this.displayPoints);
        this.computeSpringCurve(this.targetCurvePoints);
        this.drawSpringCurve();
        this.bindEvents();
        this.updateEquation();
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.w = rect.width;
        this.h = rect.height;
    }

    bindEvents() {
        const sliders = [this.massSlider, this.stiffnessSlider, this.dampingSlider, this.bounceSlider];
        sliders.forEach(slider => {
            if (!slider) return;
            slider.addEventListener('input', () => this.onSliderChange());
        });

        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.playSpringAnimation());
        }

        if (this.presetRows) {
            this.presetRows.forEach(row => {
                row.addEventListener('click', () => this.applyPreset(row));
            });
        }

        const ro = new ResizeObserver(() => {
            this.setupCanvas();
            this.drawSpringCurve();
        });
        ro.observe(this.canvas);
    }

    computeSpringCurve(arr) {
        const duration = 3.0;
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            const t = (i / (n - 1)) * duration;
            arr[i] = this.springPosition(t);
        }
    }

    onSliderChange() {
        // Tick throttled a 80 ms para no saturar mientras se arrastra el slider
        const now = performance.now();
        if (now - this._lastTickTime > 80) {
            soundManager.play('tick');
            this._lastTickTime = now;
        }

        if (this.massSlider) {
            this.mass = parseFloat(this.massSlider.value);
            if (this.massValue) this.massValue.textContent = this.mass.toFixed(1);
        }
        if (this.stiffnessSlider) {
            this.stiffness = parseFloat(this.stiffnessSlider.value);
            if (this.stiffnessValue) this.stiffnessValue.textContent = this.stiffness.toFixed(0);
        }
        if (this.dampingSlider) {
            this.damping = parseFloat(this.dampingSlider.value);
            if (this.dampingValue) this.dampingValue.textContent = this.damping.toFixed(1);
        }
        if (this.bounceSlider) {
            this.bounce = parseFloat(this.bounceSlider.value);
            if (this.bounceValue) this.bounceValue.textContent = this.bounce.toFixed(2);
        }

        this.transitionCurve();
        this.updateEquation();

        if (this.presetRows) {
            this.presetRows.forEach(r => r.classList.remove('active'));
        }
    }

    transitionCurve() {
        const snapshot = new Float64Array(this.displayPoints);
        this.displayPoints.set(snapshot);

        this.computeSpringCurve(this.targetCurvePoints);
        this.curveTransitionProgress = 0;
        this.curveTransitioning = true;
        this.curveTransitionStart = performance.now();
        this.curveTransitionDuration = 400;

        if (!this.curveAnimFrame) {
            this.animateCurveTransition();
        }
    }

    animateCurveTransition() {
        const now = performance.now();
        this.curveTransitionProgress = Math.min(
            (now - this.curveTransitionStart) / this.curveTransitionDuration,
            1
        );

        const t = 1 - Math.pow(1 - this.curveTransitionProgress, 3);
        for (let i = 0; i < this.displayPoints.length; i++) {
            this.displayPoints[i] = this.displayPoints[i] +
                (this.targetCurvePoints[i] - this.displayPoints[i]) * Math.min(t * 1.2, 1);
        }

        this.drawSpringCurve();

        if (this.curveTransitionProgress < 1) {
            this.curveAnimFrame = requestAnimationFrame(() => this.animateCurveTransition());
        } else {
            this.curveTransitioning = false;
            this.curveAnimFrame = null;
            this.displayPoints.set(this.targetCurvePoints);
        }
    }

    applyPreset(row) {
        const m = parseFloat(row.dataset.mass);
        const k = parseFloat(row.dataset.stiffness);
        const d = parseFloat(row.dataset.damping);

        this.mass = m;
        this.stiffness = k;
        this.damping = d;

        if (this.massSlider) this.massSlider.value = m;
        if (this.stiffnessSlider) this.stiffnessSlider.value = k;
        if (this.dampingSlider) this.dampingSlider.value = d;
        if (this.massValue) this.massValue.textContent = m.toFixed(1);
        if (this.stiffnessValue) this.stiffnessValue.textContent = k.toFixed(0);
        if (this.dampingValue) this.dampingValue.textContent = d.toFixed(1);

        this.presetRows.forEach(r => r.classList.remove('active'));
        row.classList.add('active');

        // Selección de preset → menuClick
        soundManager.play('menuClick');

        this.transitionCurve();
        this.updateEquation();
        this.playSpringAnimation();
    }

    springPosition(t) {
        const m = this.mass;
        const k = this.stiffness;
        const c = this.damping;

        const omega0 = Math.sqrt(k / m);
        const zeta = c / (2 * Math.sqrt(k * m));

        if (zeta < 1) {
            const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
            return 1 - Math.exp(-zeta * omega0 * t) *
                (Math.cos(omegaD * t) + (zeta * omega0 / omegaD) * Math.sin(omegaD * t));
        } else if (Math.abs(zeta - 1) < 0.001) {
            return 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
        } else {
            const s1 = -omega0 * (zeta + Math.sqrt(zeta * zeta - 1));
            const s2 = -omega0 * (zeta - Math.sqrt(zeta * zeta - 1));
            const a2 = s1 / (s1 - s2);
            const a1 = 1 - a2;
            return 1 - a1 * Math.exp(s1 * t) - a2 * Math.exp(s2 * t);
        }
    }

    drawSpringCurve() {
        const ctx = this.ctx;
        const pad = 32;
        const gw = this.w - pad * 2;
        const gh = this.h - pad * 2;

        ctx.clearRect(0, 0, this.w, this.h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = pad + (gw / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, pad);
            ctx.lineTo(x, pad + gh);
            ctx.stroke();
        }

        const targetY = pad + gh * 0.15;
        ctx.strokeStyle = 'rgba(180, 205, 255, 0.12)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad, targetY);
        ctx.lineTo(pad + gw, targetY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(180, 205, 255, 0.25)';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('1.0', pad - 6, targetY + 3);

        const zeroY = pad + gh * 0.85;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.moveTo(pad, zeroY);
        ctx.lineTo(pad + gw, zeroY);
        ctx.stroke();
        ctx.fillText('0.0', pad - 6, zeroY + 3);

        const yRange = zeroY - targetY;
        const n = this.displayPoints.length;

        const gradient = ctx.createLinearGradient(pad, 0, pad + gw, 0);
        gradient.addColorStop(0, 'rgba(130, 170, 255, 0.6)');
        gradient.addColorStop(0.4, 'rgba(180, 205, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 160, 255, 0.7)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();

        for (let i = 0; i < n; i++) {
            const x = pad + (i / (n - 1)) * gw;
            const y = zeroY - this.displayPoints[i] * yRange;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.stroke();

        ctx.save();
        ctx.shadowColor = 'rgba(180, 205, 255, 0.2)';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        ctx.lineTo(pad + gw, zeroY);
        ctx.lineTo(pad, zeroY);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, targetY, 0, zeroY);
        fillGrad.addColorStop(0, 'rgba(180, 205, 255, 0.05)');
        fillGrad.addColorStop(1, 'rgba(180, 205, 255, 0)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.textAlign = 'center';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText('Time (s)', pad + gw / 2, this.h - 4);
    }

    updateEquation() {
        const omega0 = Math.sqrt(this.stiffness / this.mass);
        const zeta = this.damping / (2 * Math.sqrt(this.stiffness * this.mass));
        const freq = omega0 / (2 * Math.PI);

        if (this.equationFormula) {
            let type;
            if (zeta < 0.999) type = 'underdamped';
            else if (zeta < 1.001) type = 'critically damped';
            else type = 'overdamped';

            this.equationFormula.textContent =
                `F(t) = -kx - cv  |  ${type} system  |  \u03B6 = ${zeta.toFixed(3)}`;
        }

        if (this.paramDisplays.mass) this.paramDisplays.mass.textContent = this.mass.toFixed(1);
        if (this.paramDisplays.stiffness) this.paramDisplays.stiffness.textContent = this.stiffness.toFixed(0);
        if (this.paramDisplays.damping) this.paramDisplays.damping.textContent = this.damping.toFixed(1);
        if (this.paramDisplays.frequency) this.paramDisplays.frequency.textContent = freq.toFixed(2) + ' Hz';
    }

    playSpringAnimation() {
        if (!this.object || this.isAnimating) return;

        this.isAnimating = true;

        // Inicio de la animación → on
        soundManager.play('on');

        const startTime = performance.now();
        const duration = 2500;

        // Flag para disparar knock solo una vez si el spring hace overshoot
        let hasKnocked = false;

        this.object.style.transform = 'scale(0.3) translateY(20px)';
        this.object.style.opacity = '0.4';
        this.object.style.filter = 'blur(4px)';

        const animate = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1.0) * 3.0;
            const progress = this.springPosition(t);

            // Overshoot del spring (solo underdamped) → knock
            if (progress > 1.0 && !hasKnocked) {
                hasKnocked = true;
                soundManager.play('knock');
            }

            const scale = 0.3 + progress * 0.7;
            const translateY = 20 * (1 - progress);
            const opacity = 0.4 + Math.min(progress, 1) * 0.6;
            const blur = Math.max(0, 4 * (1 - progress * 2));

            this.object.style.transform = `scale(${scale}) translateY(${translateY}px)`;
            this.object.style.opacity = opacity;
            this.object.style.filter = `blur(${blur}px)`;

            if (elapsed < duration) {
                this.animFrame = requestAnimationFrame(animate);
            } else {
                this.object.style.transform = 'scale(1) translateY(0)';
                this.object.style.opacity = '1';
                this.object.style.filter = 'blur(0px)';
                this.isAnimating = false;
            }
        };

        this.animFrame = requestAnimationFrame(animate);
    }
}

class StepsVisualizer {
    constructor(container) {
        this.container = container;
        if (!this.container) return;

        this.frames = container.querySelectorAll('.steps-demo-frame');
        this.playBtn = container.querySelector('.timing-play-btn');
        this.stepCount = this.frames.length;
        this.interval = null;

        this.init();
    }

    init() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.play());
        }
    }

    play() {
        if (this.interval) clearInterval(this.interval);

        // Arranque de la secuencia de steps → on
        soundManager.play('on');

        let current = 0;
        this.highlight(current);

        this.interval = setInterval(() => {
            current++;
            if (current >= this.stepCount) {
                clearInterval(this.interval);
                this.interval = null;
                // Secuencia completada → check-more
                soundManager.play('check-more');
                setTimeout(() => this.clearAll(), 600);
                return;
            }
            this.highlight(current);
        }, 280);
    }

    highlight(index) {
        // Cada step individual → tick
        soundManager.play('tick');
        this.frames.forEach((f, i) => {
            f.classList.toggle('steps-demo-frame--active', i === index);
        });
    }

    clearAll() {
        this.frames.forEach(f => f.classList.remove('steps-demo-frame--active'));
    }
}

class DecayGraph {
    constructor(container) {
        this.container = container;
        if (!this.container) return;

        this.canvas = container.querySelector('.decay-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.dpr = window.devicePixelRatio || 1;

        this.drawProgress = 0;
        this.hasAnimated = false;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.observeVisibility();

        const ro = new ResizeObserver(() => {
            this.setupCanvas();
            if (this.hasAnimated) {
                this.drawProgress = 1;
                this.draw();
            }
        });
        ro.observe(this.canvas);
    }

    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        this.ctx.scale(this.dpr, this.dpr);
        this.w = rect.width;
        this.h = rect.height;
    }

    observeVisibility() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.animateIn();
                }
            });
        }, { threshold: 0.3 });

        observer.observe(this.canvas);
    }

    animateIn() {
        // El gráfico entra en viewport y empieza a dibujarse → check-more
        soundManager.play('check-more');

        const startTime = performance.now();
        const duration = 1200;

        const tick = (now) => {
            const t = Math.min((now - startTime) / duration, 1);
            this.drawProgress = 1 - Math.pow(1 - t, 3);
            this.draw();

            if (t < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    }

    draw() {
        const ctx = this.ctx;
        const pad = 32;
        const gw = this.w - pad * 2;
        const gh = this.h - pad * 2;

        ctx.clearRect(0, 0, this.w, this.h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const x = pad + (gw / 4) * i;
            ctx.beginPath();
            ctx.moveTo(x, pad);
            ctx.lineTo(x, pad + gh);
            ctx.stroke();
        }

        const configs = [
            { zeta: 0.15, color: 'rgba(255, 130, 130, 0.75)', label: 'Underdamped' },
            { zeta: 0.5,  color: 'rgba(180, 205, 255, 0.75)', label: 'Medium' },
            { zeta: 1.0,  color: 'rgba(130, 255, 180, 0.75)', label: 'Critical' },
        ];

        const duration = 4.0;
        const steps = 250;
        const omega0 = 12;
        const maxI = Math.floor(steps * this.drawProgress);

        configs.forEach(cfg => {
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();

            for (let i = 0; i <= maxI; i++) {
                const t = (i / steps) * duration;
                let y;

                if (cfg.zeta < 1) {
                    const omegaD = omega0 * Math.sqrt(1 - cfg.zeta * cfg.zeta);
                    y = 1 - Math.exp(-cfg.zeta * omega0 * t) *
                        (Math.cos(omegaD * t) + (cfg.zeta / Math.sqrt(1 - cfg.zeta * cfg.zeta)) * Math.sin(omegaD * t));
                } else {
                    y = 1 - (1 + omega0 * t) * Math.exp(-omega0 * t);
                }

                const px = pad + (i / steps) * gw;
                const py = pad + gh - y * gh;

                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }

            ctx.stroke();

            ctx.save();
            ctx.shadowColor = cfg.color.replace('0.75', '0.2');
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.restore();
        });

        const legendAlpha = Math.min(this.drawProgress * 2, 1);
        let legendY = pad + 10;
        configs.forEach(cfg => {
            ctx.globalAlpha = legendAlpha;
            ctx.fillStyle = cfg.color;
            ctx.beginPath();
            ctx.arc(pad + 10, legendY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(cfg.label, pad + 20, legendY + 4);
            legendY += 18;
            ctx.globalAlpha = 1;
        });

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad, pad);
        ctx.lineTo(pad + gw, pad);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-demo="timing-graph"]').forEach(el => new TimingFunctionGraph(el));
    document.querySelectorAll('[data-demo="spring-playground"]').forEach(el => new SpringPlayground(el));
    document.querySelectorAll('[data-demo="steps-visualizer"]').forEach(el => new StepsVisualizer(el));
    document.querySelectorAll('[data-demo="decay-graph"]').forEach(el => new DecayGraph(el));

    document.querySelectorAll('.demo-container').forEach(el => {
        el.addEventListener('pointermove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
            el.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
    });
});

function initBlogAnimationDemos() {
    document.querySelectorAll('[data-demo="timing-graph"]').forEach(el => new TimingFunctionGraph(el));
    document.querySelectorAll('[data-demo="spring-playground"]').forEach(el => new SpringPlayground(el));
    document.querySelectorAll('[data-demo="steps-visualizer"]').forEach(el => new StepsVisualizer(el));
    document.querySelectorAll('[data-demo="decay-graph"]').forEach(el => new DecayGraph(el));

    document.querySelectorAll('.demo-container').forEach(el => {
        el.addEventListener('pointermove', (e) => {
            const rect = el.getBoundingClientRect();
            el.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width * 100) + '%');
            el.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height * 100) + '%');
        });
    });
}

export { TimingFunctionGraph, SpringPlayground, StepsVisualizer, DecayGraph };
export default initBlogAnimationDemos;