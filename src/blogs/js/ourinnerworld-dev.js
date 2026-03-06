/* =============================================
   OURINNERWORLD DEV — Interactive Components
   Code blocks + Visual Shader Graph renderer
   ============================================= */

import soundManager from './sound-manager.js';
import musicPlayer from './music-player.js';

/* ==========================
   GODOT CODE BLOCK
   ========================== */

class GodotCodeBlock {
    constructor(el) {
        this.el = el;
        if (!this.el) return;
        this.copyBtn = el.querySelector('.godot-code-block__copy');
        this.codeEl = el.querySelector('.godot-code-block__code');
        this.init();
    }

    init() {
        this.bindCopy();
        this.bindLineHover();
    }

    bindCopy() {
        if (!this.copyBtn || !this.codeEl) return;

        this.copyBtn.addEventListener('click', async () => {
            try {
                const text = this.codeEl.textContent;
                await navigator.clipboard.writeText(text);
                this.showCopied();
                soundManager.play('tick');
            } catch {
                /* Fallback for older browsers */
                const range = document.createRange();
                range.selectNodeContents(this.codeEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                document.execCommand('copy');
                sel.removeAllRanges();
                this.showCopied();
            }
        });
    }

    showCopied() {
        const label = this.copyBtn.querySelector('.godot-code-block__copy-label');
        const originalText = label ? label.textContent : '';

        this.copyBtn.classList.add('godot-code-block__copy--copied');
        if (label) label.textContent = 'Copied!';

        setTimeout(() => {
            this.copyBtn.classList.remove('godot-code-block__copy--copied');
            if (label) label.textContent = originalText;
        }, 2000);
    }

    bindLineHover() {
        const lines = this.el.querySelectorAll('.godot-code-block__line');
        lines.forEach(line => {
            line.addEventListener('click', () => {
                line.classList.toggle('godot-code-block__line--highlight');
                soundManager.play('tick', 0.08);
            });
        });
    }
}

/* ==========================
   VISUAL SHADER GRAPH
   ========================== */

class ShaderGraph {
    constructor(el) {
        this.el = el;
        if (!this.el) return;
        this.canvas = el.querySelector('.shader-graph__canvas');
        this.svgNS = 'http://www.w3.org/2000/svg';
        this.nodes = [];
        this.connections = [];
        this.init();
    }

    init() {
        this.parseNodes();
        this.parseConnections();
        this.drawWires();
        this.initPreviews();
        this.bindInteractions();
    }

    parseNodes() {
        const nodeEls = this.canvas.querySelectorAll('.shader-node');
        nodeEls.forEach(nodeEl => {
            const id = nodeEl.dataset.nodeId;
            const ports = {};

            nodeEl.querySelectorAll('[data-port-id]').forEach(portEl => {
                const portId = portEl.dataset.portId;
                const portType = portEl.dataset.portType || 'output';
                const dot = portEl.querySelector('.shader-node__port-dot');
                ports[portId] = { el: portEl, dot, type: portType };
            });

            this.nodes.push({ id, el: nodeEl, ports });
        });
    }

    parseConnections() {
        const connData = this.el.dataset.connections;
        if (!connData) return;

        try {
            this.connections = JSON.parse(connData);
        } catch {
            this.connections = [];
        }
    }

    drawWires() {
        if (!this.connections.length) return;

        let svg = this.canvas.querySelector('.shader-graph__connections');
        if (!svg) {
            svg = document.createElementNS(this.svgNS, 'svg');
            svg.classList.add('shader-graph__connections');
            svg.style.position = 'absolute';
            svg.style.inset = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '1';
            this.canvas.style.position = 'relative';
            this.canvas.insertBefore(svg, this.canvas.firstChild);
        }

        const canvasRect = this.canvas.getBoundingClientRect();

        this.connections.forEach(conn => {
            const fromNode = this.nodes.find(n => n.id === conn.from);
            const toNode = this.nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return;

            const fromPort = fromNode.ports[conn.fromPort];
            const toPort = toNode.ports[conn.toPort];
            if (!fromPort?.dot || !toPort?.dot) return;

            const fromRect = fromPort.dot.getBoundingClientRect();
            const toRect = toPort.dot.getBoundingClientRect();

            const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
            const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
            const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
            const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

            const dx = Math.abs(x2 - x1) * 0.5;
            const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const path = document.createElementNS(this.svgNS, 'path');
            path.setAttribute('d', d);
            path.classList.add('shader-graph__wire');
            if (conn.animated) path.classList.add('shader-graph__wire--animated');
            if (conn.type) path.classList.add(`shader-graph__wire--${conn.type}`);
            svg.appendChild(path);
        });
    }

    initPreviews() {
        const previews = this.canvas.querySelectorAll('.shader-node__preview canvas');
        previews.forEach(cvs => {
            const ctx = cvs.getContext('2d');
            if (!ctx) return;
            const type = cvs.dataset.previewType || 'gradient';
            this.renderPreview(ctx, cvs, type);
        });
    }

    renderPreview(ctx, cvs, type) {
        const w = cvs.width = cvs.clientWidth * (window.devicePixelRatio || 1);
        const h = cvs.height = cvs.clientHeight * (window.devicePixelRatio || 1);
        ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        const cw = cvs.clientWidth;
        const ch = cvs.clientHeight;

        if (type === 'gradient') {
            const grad = ctx.createLinearGradient(0, 0, cw, ch);
            grad.addColorStop(0, '#cdd6f4');
            grad.addColorStop(1, '#11111b');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cw, ch);
        } else if (type === 'sine') {
            ctx.fillStyle = '#1e1e2e';
            ctx.fillRect(0, 0, cw, ch);
            ctx.strokeStyle = '#89b4fa';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let x = 0; x < cw; x++) {
                const y = ch / 2 + Math.sin(x * 0.08) * (ch * 0.35);
                x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        } else if (type === 'oneminus') {
            const grad = ctx.createLinearGradient(0, 0, 0, ch);
            grad.addColorStop(0, '#11111b');
            grad.addColorStop(1, '#cdd6f4');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cw, ch);
        }
    }

    bindInteractions() {
        const nodes = this.canvas.querySelectorAll('.shader-node');
        nodes.forEach(node => {
            node.addEventListener('pointerenter', () => {
                soundManager.play('tick', 0.06);
            });
        });

        /* Redraw wires on resize */
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const oldSvg = this.canvas.querySelector('.shader-graph__connections');
                if (oldSvg) oldSvg.remove();
                this.drawWires();
            }, 250);
        });
    }
}

/* ==========================
   OST PREVIEW PLAYER
   Pauses the blog music player when
   playing, and vice-versa.
   ========================== */

class OSTPreview {
    constructor(el) {
        this.el = el;
        if (!this.el) return;

        this.src = el.dataset.ostSrc;
        if (!this.src) return;

        this.audio = new Audio();
        this.audio.preload = 'metadata';
        this.audio.src = this.src;
        this.isPlaying = false;
        this.wasMusicPlaying = false;
        this.rafId = null;

        this.playBtn = el.querySelector('#ostPlayBtn') || el.querySelector('.ost-preview__play');
        this.iconPlay = el.querySelector('.ost-preview__icon-play');
        this.iconPause = el.querySelector('.ost-preview__icon-pause');
        this.progressWrap = el.querySelector('#ostProgressWrap') || el.querySelector('.ost-preview__progress-wrap');
        this.progressFill = el.querySelector('#ostProgressFill') || el.querySelector('.ost-preview__progress-fill');
        this.timeEl = el.querySelector('#ostTime') || el.querySelector('.ost-preview__time');

        this.init();
    }

    init() {
        this.bindEvents();
        this.startLoop();
    }

    bindEvents() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => this.togglePlay());
        }

        if (this.progressWrap) {
            this.progressWrap.addEventListener('click', (e) => this.seek(e));
        }

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updateIcon();
            this.playBtn?.classList.remove('ost-preview__play--playing');
            this.resumeMusicPlayer();
        });
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.playBtn?.classList.remove('ost-preview__play--playing');
            this.resumeMusicPlayer();
        } else {
            this.pauseMusicPlayer();
            this.audio.play().catch(() => {});
            this.isPlaying = true;
            this.playBtn?.classList.add('ost-preview__play--playing');
        }
        this.updateIcon();
        soundManager.play('tick');
    }

    pauseMusicPlayer() {
        if (musicPlayer && musicPlayer.isPlaying) {
            this.wasMusicPlaying = true;
            musicPlayer.audio.pause();
            musicPlayer.isPlaying = false;
            musicPlayer.updatePlayPauseIcon();
        } else {
            this.wasMusicPlaying = false;
        }
    }

    resumeMusicPlayer() {
        if (this.wasMusicPlaying && musicPlayer && !musicPlayer.isPlaying) {
            musicPlayer.audio.play().catch(() => {});
            musicPlayer.isPlaying = true;
            musicPlayer.updatePlayPauseIcon();
            this.wasMusicPlaying = false;
        }
    }

    seek(e) {
        const rect = this.progressWrap.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (this.audio.duration) {
            this.audio.currentTime = pct * this.audio.duration;
        }
    }

    updateIcon() {
        if (this.iconPlay) this.iconPlay.style.display = this.isPlaying ? 'none' : '';
        if (this.iconPause) this.iconPause.style.display = this.isPlaying ? '' : 'none';
    }

    startLoop() {
        const update = () => {
            if (this.audio.duration && this.progressFill) {
                const pct = (this.audio.currentTime / this.audio.duration) * 100;
                this.progressFill.style.width = pct + '%';
            }
            if (this.timeEl && this.audio.currentTime) {
                const t = Math.floor(this.audio.currentTime);
                const m = Math.floor(t / 60);
                const s = t % 60;
                this.timeEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
            }
            this.rafId = requestAnimationFrame(update);
        };
        this.rafId = requestAnimationFrame(update);
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.audio) { this.audio.pause(); this.audio.src = ''; }
    }
}

/* ==========================
   INIT FUNCTION
   ========================== */

function initOuinnerworldDev() {
    document.querySelectorAll('.godot-code-block').forEach(el => {
        if (!el._codeBlockInit) {
            new GodotCodeBlock(el);
            el._codeBlockInit = true;
        }
    });

    document.querySelectorAll('.shader-graph').forEach(el => {
        if (!el._shaderGraphInit) {
            new ShaderGraph(el);
            el._shaderGraphInit = true;
        }
    });

    document.querySelectorAll('.ost-preview').forEach(el => {
        if (!el._ostInit) {
            new OSTPreview(el);
            el._ostInit = true;
        }
    });
}

/* Run on DOMContentLoaded and export for pagination re-init */
document.addEventListener('DOMContentLoaded', initOuinnerworldDev);

export { GodotCodeBlock, ShaderGraph, OSTPreview };
export default initOuinnerworldDev;
