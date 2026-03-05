/* =============================================
   SOUND MANAGER MODULE
   Manages UI sound effects with AudioContext,
   preloading, per-sound cooldowns, active source
   tracking, and non-invasive automatic binding.
   ============================================= */

const SOUND_LIBRARY = [
    { name: 'click',      url: 'https://dl.dropbox.com/scl/fi/l6tzcxgbl4t6tv8suiqix/photos-click.mp3?rlkey=msdkopzvgwo07ccmwapn4c8q9&st=0w6nd11x&dl=0',     volume: 0.25 },
    { name: 'menuClick',  url: 'https://dl.dropbox.com/scl/fi/feq6pzyifspcxwfh9nm85/photos-menu-click.mp3?rlkey=vckurng5uyx4dj0p3b6awlw6l&st=b9puzya1&dl=0', volume: 0.2  },
    { name: 'hover',      url: 'https://dl.dropbox.com/scl/fi/z5pe7vapb7pe0exgddniy/nock.mp3?rlkey=m23q7lp61gda2403owuj38zf4&st=y6rc4w64&dl=0',             volume: 0.06 },
    { name: 'tick',       url: 'https://dl.dropbox.com/scl/fi/4a3j125poyg20jx6zbkk5/tick.mp3?rlkey=xc5heu4lrjic1v6800xx9smmp&st=wkeee9u4&dl=0',             volume: 0.1  },
    { name: 'knock',      url: 'https://dl.dropbox.com/scl/fi/z5pe7vapb7pe0exgddniy/nock.mp3?rlkey=m23q7lp61gda2403owuj38zf4&st=y6rc4w64&dl=0',             volume: 0.2  },
    { name: 'scroll',     url: 'https://dl.dropbox.com/scl/fi/7k4pkcf323aeb2sbyuomy/scrollwheel.mp3?rlkey=try4rz6cr3wivssmwq5dg1b2h&st=rt6l8zho&dl=0',       volume: 0.85 },
    { name: 'command',    url: 'https://dl.dropbox.com/scl/fi/kyolk2xpiinjup0o96s5c/command-press.mp3?rlkey=i5rd4cajqgguuldfhxl90cjm0&st=u4cmljsx&dl=0',     volume: 0.85  },
    { name: 'takeout',    url: 'https://dl.dropbox.com/scl/fi/z20uauhyn05mr0vxy71oi/takeout-click.mp3?rlkey=fjdywcedsskut7edgors88r6l&st=k5nl1w9d&dl=0',     volume: 0.85  },
    { name: 'check-more', url: '/src/sfx/rising-pops.mp3',      volume: 0.85 },
    { name: 'menuOpen',   url: '/src/sfx/menu-open-softer.mp3',  volume: 0.85 },
    { name: 'on',         url: '/src/sfx/switch-on.mp3',         volume: 0.85 },
    { name: 'off',        url: '/src/sfx/switch-off.mp3',        volume: 0.85 },
];

const SOUND_COOLDOWNS = {
    click:         120,
    menuClick:     200,
    hover:         250,
    tick:          100,
    knock:         300,
    scroll:        500,
    command:       250,
    takeout:       300,
    'check-more':  400,
    menuOpen:      300,
    on:            200,
    off:           200,
};

const GLOBAL_COOLDOWN = 60;

class SoundManager {
    constructor() {
        this.ctx = null;
        this.buffers = new Map();
        this.masterVolume = 0.5;
        this.enabled = true;
        this.loaded = false;
        this.loading = false;
        this.unlocked = false;

        this.lastPlayTime = new Map();
        this.lastGlobalPlay = 0;
        this.activeSources = new Map();
    }

    /* --- Initialization --- */

    init() {
        this.bindUnlock();
        this.bindInteractions();
    }

    bindUnlock() {
        const unlock = () => {
            if (this.unlocked) return;
            this.unlocked = true;

            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            this.preload();

            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
        };

        document.addEventListener('click', unlock, { once: false });
        document.addEventListener('touchstart', unlock, { once: false });
        document.addEventListener('keydown', unlock, { once: false });
    }

    async preload() {
        if (this.loading || this.loaded) return;
        this.loading = true;

        const promises = SOUND_LIBRARY.map(async (sound) => {
            try {
                const response = await fetch(sound.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
                this.buffers.set(sound.name, {
                    buffer: audioBuffer,
                    volume: sound.volume,
                });
            } catch (err) {
                console.warn(`SoundManager: failed to load "${sound.name}"`, err);
            }
        });

        await Promise.allSettled(promises);
        this.loaded = true;
        this.loading = false;
    }

    /* --- Playback with anti-overlap --- */

    play(name, volumeOverride) {
        if (!this.enabled || !this.ctx || !this.buffers.has(name)) return;

        const now = performance.now();

        if (now - this.lastGlobalPlay < GLOBAL_COOLDOWN) return;

        const lastTime = this.lastPlayTime.get(name) || 0;
        const cooldown = SOUND_COOLDOWNS[name] || 150;
        if (now - lastTime < cooldown) return;

        const active = this.activeSources.get(name);
        if (active) {
            try {
                active.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.04);
                active.source.stop(this.ctx.currentTime + 0.05);
            } catch (_) { /* already stopped */ }
        }

        const entry = this.buffers.get(name);
        const source = this.ctx.createBufferSource();
        const gain = this.ctx.createGain();

        source.buffer = entry.buffer;
        const vol = (volumeOverride ?? entry.volume) * this.masterVolume;
        gain.gain.value = vol;

        source.connect(gain);
        gain.connect(this.ctx.destination);
        source.start(0);

        this.lastPlayTime.set(name, now);
        this.lastGlobalPlay = now;

        this.activeSources.set(name, { source, gain });
        source.addEventListener('ended', () => {
            if (this.activeSources.get(name)?.source === source) {
                this.activeSources.delete(name);
            }
        });
    }

    /* --- Volume control --- */

    setMasterVolume(v) {
        this.masterVolume = Math.max(0, Math.min(1, v));
    }

    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.play('on');
        } else {
            /* Play 'off' before disabling so the user hears feedback */
            const wasEnabled = this.enabled;
            this.enabled = true;
            this.play('off');
            this.enabled = wasEnabled;
        }
        return this.enabled;
    }

    /* --- Automatic interaction bindings --- */

    bindInteractions() {
        document.addEventListener('click', (e) => {
            /* Guard: SVG elements may not have .closest */
            if (!e.target || typeof e.target.closest !== 'function') return;

            const target = e.target.closest('[data-sound]');
            if (target) {
                this.play(target.dataset.sound);
                return;
            }

            /* Toggle switches: on/off sounds */
            const toggle = e.target.closest('[data-toggle-sound]');
            if (toggle) {
                const isActive = toggle.classList.contains('active')
                    || toggle.getAttribute('aria-checked') === 'true';
                this.play(isActive ? 'off' : 'on');
                return;
            }

            /* "Check more" / "Read more" / "Show more" triggers */
            const expandTrigger = e.target.closest('[data-expand], .check-more-btn, .read-more-btn');
            if (expandTrigger) {
                this.play('check-more');
                return;
            }

            const pagination = e.target.closest('.pagination__link');
            if (pagination && !pagination.classList.contains('disabled')) {
                this.play('tick');
                return;
            }

            const interactive = e.target.closest('a, button');
            if (interactive) {
                this.play('click');
            }
        });

        document.addEventListener('pointerenter', (e) => {
            /* Guard: SVG elements may not have .closest */
            if (!e.target || typeof e.target.closest !== 'function') return;

            const target = e.target.closest(
                '.pagination__link, .sidebar-item, .blog-tag'
            );
            if (!target) return;
            this.play('hover');
        }, true);

        let lastScrollSound = 0;
        window.addEventListener('scroll', () => {
            const now = performance.now();
            if (now - lastScrollSound < 600) return;
            lastScrollSound = now;
            this.play('scroll');
        }, { passive: true });

        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.play('tick');
            }
        });
    }

    /* --- Cleanup --- */

    destroy() {
        for (const [, active] of this.activeSources) {
            try { active.source.stop(); } catch (_) {}
        }
        this.activeSources.clear();

        if (this.ctx) {
            this.ctx.close();
        }
        this.buffers.clear();
    }
}

const soundManager = new SoundManager();
export default soundManager;
