/* =============================================
   MUSIC PLAYER MODULE
   Mini panel with playlist, autoplay, loop,
   volume control, elastic glass toggles, and
   collapsible liquid glass UI.
   ============================================= */

class MusicPlayer {
    constructor() {
        this.audio = null;
        this.playlist = [];
        this.currentIndex = 0;
        this.isPlaying = false;
        this.isCollapsed = false;
        this.volume = 0.4;
        this.isSeeking = false;
        this.isPlaylistOpen = false;
        this.container = null;
        this.els = {};
        this.rafId = null;
        this.hasInteracted = false;
    }

    init() {
        this.buildPlaylist();
        this.createPlayerUI();
        this.cacheElements();
        this.createAudioElement();
        this.bindEvents();
        this.bindFirstInteraction();
        this.startProgressLoop();
    }

    /* --- Playlist --- */

    buildPlaylist() {
        const basePath = 'bgm/';
        const tracks = [
            { title: 'Song of the Welkin Moon',   file: 'Song-of-the-Welkin-Moon' },
            { title: 'Ballad of Many Waters',     file: 'Ballad of Many Waters' },
            { title: 'Cold Night',                file: 'Cold Night' },
            { title: 'Dawn Winery',               file: 'Dawn Winery' },
            { title: "Dreams' Swirling Whispers", file: "Dreams' Swirling Whispers" },
            { title: 'Dreamwalker',               file: 'Dreamwalker' },
            { title: 'Fountain of Belleau',       file: 'Fountain of Belleau' },
            { title: 'Midnight in Mondstadt',     file: 'Midnight in Mondstadt' },
            { title: 'Mondstadt Starlit',         file: 'Mondstadt Starlit' },
            { title: 'Moonlight in Mondstadt',    file: 'Moonlight in Mondstadt' },
            { title: 'Pluie sur la ville',        file: 'Pluie sur la ville' },
            { title: 'Realitatsprinzip',          file: 'Realitätsprinzip' },
        ];

        this.playlist = tracks.map(t => ({
            title: t.title,
            src: basePath + encodeURIComponent(t.file) + '.mp3',
        }));
    }

    /* --- Audio --- */

    createAudioElement() {
        const old = document.getElementById('bgMusic');
        if (old) old.remove();

        this.audio = new Audio();
        this.audio.preload = 'auto';
        this.audio.volume = this.volume;
        this.loadTrack(this.currentIndex);
    }

    loadTrack(index) {
        this.currentIndex = index;
        const track = this.playlist[index];
        if (!track) return;
        this.audio.src = track.src;
        this.audio.load();
        this.updateTrackInfo();
        this.updatePlaylistActive();
    }

    /* --- UI --- */

    createPlayerUI() {
        const panel = document.createElement('div');
        panel.id = 'musicPlayer';
        panel.className = 'music-player';
        panel.innerHTML = `
            <div class="music-player__panel glass-container glass-panel glass-shine">
                <div class="glass-filter music-player__blur"></div>
                <div class="glass-overlay music-player__distort"></div>
                <div class="glass-specular" style="--pointer-angle: 45"></div>
                <div class="glass-content music-player__content">

                    <div class="music-player__header">
                        <button class="music-player__collapse" id="mpCollapse" aria-label="Toggle player">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"/>
                            </svg>
                        </button>
                        <div class="music-player__track-info">
                            <span class="music-player__track-title" id="mpTitle">Loading...</span>
                        </div>
                        <button class="music-player__playlist-btn" id="mpPlaylistBtn" aria-label="Toggle playlist">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                                <line x1="8" y1="6" x2="21" y2="6"/>
                                <line x1="8" y1="12" x2="21" y2="12"/>
                                <line x1="8" y1="18" x2="21" y2="18"/>
                                <circle cx="4" cy="6" r="1.2" fill="currentColor" stroke="none"/>
                                <circle cx="4" cy="12" r="1.2" fill="currentColor" stroke="none"/>
                                <circle cx="4" cy="18" r="1.2" fill="currentColor" stroke="none"/>
                            </svg>
                        </button>
                    </div>

                    <div class="music-player__body" id="mpBody">
                        <div class="music-player__progress-row">
                            <span class="music-player__time" id="mpTimeCurrent">0:00</span>
                            <div class="music-player__progress-wrap" id="mpProgressWrap">
                                <div class="music-player__progress-track">
                                    <div class="music-player__progress-fill" id="mpProgressFill"></div>
                                    <div class="music-player__progress-thumb elastic-thumb" id="mpProgressThumb"></div>
                                </div>
                            </div>
                            <span class="music-player__time" id="mpTimeTotal">0:00</span>
                        </div>

                        <div class="music-player__controls">
                            <button class="music-player__btn" id="mpPrev" aria-label="Previous">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                            </button>
                            <button class="music-player__btn music-player__btn--play" id="mpPlay" aria-label="Play/Pause">
                                <svg class="mp-icon-play" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                <svg class="mp-icon-pause" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
                            </button>
                            <button class="music-player__btn" id="mpNext" aria-label="Next">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                            </button>
                        </div>

                        <div class="music-player__volume-row">
                            <button class="music-player__btn music-player__btn--mute" id="mpMute" aria-label="Mute">
                                <svg class="mp-icon-vol" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                                </svg>
                                <svg class="mp-icon-muted" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                    <line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
                                </svg>
                            </button>
                            <div class="music-player__volume-slider" id="mpVolumeWrap">
                                <div class="music-player__volume-track">
                                    <div class="music-player__volume-fill" id="mpVolumeFill"></div>
                                    <div class="music-player__volume-thumb elastic-thumb elastic-thumb--glass" id="mpVolumeThumb">
                                        <div class="elastic-thumb__glass-inner"></div>
                                        <div class="elastic-thumb__glass-shine"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="music-player__playlist" id="mpPlaylist">
                            <div class="music-player__playlist-scroll" id="mpPlaylistInner"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        this.container = panel;
    }

    cacheElements() {
        this.els = {
            panel:        this.container.querySelector('.music-player__panel'),
            collapse:     document.getElementById('mpCollapse'),
            title:        document.getElementById('mpTitle'),
            timeCurrent:  document.getElementById('mpTimeCurrent'),
            timeTotal:    document.getElementById('mpTimeTotal'),
            body:         document.getElementById('mpBody'),
            progressWrap: document.getElementById('mpProgressWrap'),
            progressFill: document.getElementById('mpProgressFill'),
            progressThumb:document.getElementById('mpProgressThumb'),
            play:         document.getElementById('mpPlay'),
            prev:         document.getElementById('mpPrev'),
            next:         document.getElementById('mpNext'),
            mute:         document.getElementById('mpMute'),
            volumeWrap:   document.getElementById('mpVolumeWrap'),
            volumeFill:   document.getElementById('mpVolumeFill'),
            volumeThumb:  document.getElementById('mpVolumeThumb'),
            playlistBtn:  document.getElementById('mpPlaylistBtn'),
            playlist:     document.getElementById('mpPlaylist'),
            playlistInner:document.getElementById('mpPlaylistInner'),
            iconPlay:     this.container.querySelector('.mp-icon-play'),
            iconPause:    this.container.querySelector('.mp-icon-pause'),
            iconVol:      this.container.querySelector('.mp-icon-vol'),
            iconMuted:    this.container.querySelector('.mp-icon-muted'),
        };
        this.updateVolumeUI();
        this.renderPlaylist();
    }

    /* --- First Interaction (autoplay) --- */

    bindFirstInteraction() {
        const tryAutoplay = () => {
            if (this.hasInteracted) return;
            this.hasInteracted = true;
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayPauseIcon();
            }).catch(() => {});
            document.removeEventListener('click', tryAutoplay);
            document.removeEventListener('touchstart', tryAutoplay);
            document.removeEventListener('keydown', tryAutoplay);
        };
        document.addEventListener('click', tryAutoplay);
        document.addEventListener('touchstart', tryAutoplay);
        document.addEventListener('keydown', tryAutoplay);

        this.audio.play().then(() => {
            this.hasInteracted = true;
            this.isPlaying = true;
            this.updatePlayPauseIcon();
        }).catch(() => {});
    }

    /* --- Events --- */

    bindEvents() {
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('loadedmetadata', () => this.updateTrackInfo());

        this.els.collapse.addEventListener('click', () => this.toggleCollapse());
        this.els.play.addEventListener('click', () => this.togglePlay());
        this.els.prev.addEventListener('click', () => this.prevTrack());
        this.els.next.addEventListener('click', () => this.nextTrack());
        this.els.mute.addEventListener('click', () => this.toggleMute());
        this.els.progressWrap.addEventListener('pointerdown', (e) => this.startSeek(e));
        this.els.volumeWrap.addEventListener('pointerdown', (e) => this.startVolumeDrag(e));
        this.els.playlistBtn.addEventListener('click', () => this.togglePlaylist());

        this.els.playlistInner.addEventListener('click', (e) => {
            const item = e.target.closest('.music-player__playlist-item');
            if (!item) return;
            const idx = parseInt(item.dataset.index, 10);
            this.loadTrack(idx);
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updatePlayPauseIcon();
            });
        });
    }

    /* --- Playback --- */

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(() => {});
        }
        this.isPlaying = !this.isPlaying;
        this.updatePlayPauseIcon();
    }

    nextTrack() {
        this.loadTrack((this.currentIndex + 1) % this.playlist.length);
        if (this.isPlaying) this.audio.play().catch(() => {});
    }

    prevTrack() {
        if (this.audio.currentTime > 3) { this.audio.currentTime = 0; return; }
        this.loadTrack((this.currentIndex - 1 + this.playlist.length) % this.playlist.length);
        if (this.isPlaying) this.audio.play().catch(() => {});
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.els.iconVol.style.display = this.audio.muted ? 'none' : '';
        this.els.iconMuted.style.display = this.audio.muted ? '' : 'none';
    }

    /* --- Seeking --- */

    startSeek(e) {
        this.isSeeking = true;
        this.doSeek(e);
        const onMove = (ev) => this.doSeek(ev);
        const onUp = () => {
            this.isSeeking = false;
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }

    doSeek(e) {
        const rect = this.els.progressWrap.getBoundingClientRect();
        let pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        if (this.audio.duration) this.audio.currentTime = pct * this.audio.duration;
        this.updateProgressUI(pct);
    }

    /* --- Volume --- */

    startVolumeDrag(e) {
        this.doVolume(e);
        this.els.volumeThumb.classList.add('elastic-thumb--active');

        const onMove = (ev) => this.doVolume(ev);
        const onUp = () => {
            this.els.volumeThumb.classList.remove('elastic-thumb--active');
            this.els.volumeThumb.classList.add('elastic-thumb--release');
            setTimeout(() => this.els.volumeThumb.classList.remove('elastic-thumb--release'), 700);
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };
        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    }

    doVolume(e) {
        const rect = this.els.volumeWrap.getBoundingClientRect();
        let pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.volume = pct;
        this.audio.volume = pct;
        if (this.audio.muted && pct > 0) {
            this.audio.muted = false;
            this.els.iconVol.style.display = '';
            this.els.iconMuted.style.display = 'none';
        }
        this.updateVolumeUI();
    }

    /* --- UI Updates --- */

    updatePlayPauseIcon() {
        if (!this.els.iconPlay) return;
        this.els.iconPlay.style.display = this.isPlaying ? 'none' : '';
        this.els.iconPause.style.display = this.isPlaying ? '' : 'none';
    }

    updateTrackInfo() {
        if (!this.els.title) return;
        const track = this.playlist[this.currentIndex];
        if (track) this.els.title.textContent = track.title;
    }

    updateProgressUI(pct) {
        if (!this.els.progressFill) return;
        const p = (pct * 100).toFixed(2) + '%';
        this.els.progressFill.style.width = p;
        this.els.progressThumb.style.left = p;
    }

    updateVolumeUI() {
        if (!this.els.volumeFill) return;
        const p = (this.volume * 100).toFixed(2) + '%';
        this.els.volumeFill.style.width = p;
        this.els.volumeThumb.style.left = p;
    }

    startProgressLoop() {
        const tick = () => {
            this.rafId = requestAnimationFrame(tick);
            if (this.isSeeking || !this.audio) return;
            if (this.audio.duration) {
                const pct = this.audio.currentTime / this.audio.duration;
                this.updateProgressUI(pct);
                if (this.els.timeCurrent) {
                    this.els.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
                }
                if (this.els.timeTotal) {
                    this.els.timeTotal.textContent = this.formatTime(this.audio.duration);
                }
            }
        };
        tick();
    }

    formatTime(s) {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    /* --- Collapse --- */

    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.container.classList.toggle('music-player--collapsed', this.isCollapsed);
    }

    /* --- Playlist --- */

    togglePlaylist() {
        this.isPlaylistOpen = !this.isPlaylistOpen;
        this.els.playlist.classList.toggle('music-player__playlist--open', this.isPlaylistOpen);
        this.els.playlistBtn.classList.toggle('music-player__playlist-btn--active', this.isPlaylistOpen);
    }

    renderPlaylist() {
        if (!this.els.playlistInner) return;
        this.els.playlistInner.innerHTML = this.playlist.map((track, i) => `
            <div class="music-player__playlist-item ${i === this.currentIndex ? 'music-player__playlist-item--active' : ''}" data-index="${i}">
                <span class="music-player__playlist-num">${String(i + 1).padStart(2, '0')}</span>
                <span class="music-player__playlist-name">${track.title}</span>
                ${i === this.currentIndex ? '<span class="music-player__playlist-now">&#9835;</span>' : ''}
            </div>
        `).join('');
    }

    updatePlaylistActive() { this.renderPlaylist(); }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.audio) { this.audio.pause(); this.audio.src = ''; }
        if (this.container) this.container.remove();
    }
}

const musicPlayer = new MusicPlayer();
export default musicPlayer;
