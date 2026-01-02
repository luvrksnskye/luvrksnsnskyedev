/**
 * ============================
 * MUSIC MANAGER MODULE - musicManager.js
 * ============================
 */

import { soundManager } from './soundManager.js';

class MusicManager {
    constructor() {
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.previousVolume = 0.7;
        this.initialized = false;
        
        this.playlist = [
            { title: "Hyper Commission", artist: "Zenless Zone Zero 2024 Mix", cover: "/src/assets/zzz.jpg", audio: "/src/sfx/Hyper-Commission _ZZZ.mp3" },
             { title: "From Far Shores", artist: "Janice Kwan & Lifeformed", cover: "/src/assets/tunic-apple_music.jpg", audio: "https://dl.dropbox.com/scl/fi/hfsxv1qjre59d95sh7dpv/from-far-shores.mp3?rlkey=mia52yu7b41fegg1vnd55reje&st=yizojvz2&dl=0" },
            { title: "A Thousand Strings", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/pl96txwel6cl265wzwgka/A-Thousand-Strings.mp3?rlkey=g9g35jd9ypm8tedg0ig3ythjx&st=lni0taix&dl=0" },
            { title: "Sam's Discoveries", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/gd90ejmtw0jhsm00nw13m/Sams-Discoveries.mp3?rlkey=n70szts0cwum3s49qfyvxjn3f&st=ogrnsgpb&dl=0" },
            { title: "Lily Pads", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/wjarm55lzu3pb3e704lam/Lily-Pads.mp3?rlkey=xf6xw45fat3aiy4cyjlqurh49&st=fxv3qks6&dl=0" },
            { title: "Ten Thousand Souls", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/y45fwedyzmw86ocmax502/Ten-Thousand-Souls.mp3?rlkey=1jh4j0pa1pg1ji33c23zsxu5c&st=x80soyz2&dl=0" },
            { title: "In Search of Familiar Harmonies", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/jhu0ppihxts32rb300xv7/In-Search-of-Familiar-Harmonies.mp3?rlkey=wk0embmp5n9bljv7mzc5a1w96&st=h321gwuq&dl=0" },
            { title: "Kelp Caves", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/up51bq2mmim9qotdnm9w1/Kelp-Caves.mp3?rlkey=46spas4dkslafhurp7cdp0jgk&st=3t7aj8ka&dl=0" },
            { title: "Arctic Peeper", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/wo6cslcqse3u3oeh0r5c7/Arctic-Peeper.mp3?rlkey=vdusiz08ss0nij5bl7yjsaxfy&st=zdzvhao8&dl=0" },
            { title: "Below Zero", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/rsqzn4lwxmxqpvd2la1dp/below-zero.mp3?rlkey=oc78ef4yknrwiacg5m0tbi9b5&st=dhjd0p34&dl=0" },
            { title: "Twisty Bridges", artist: "Ben Prunty", cover: "/src/assets/subnautica-below-zero-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/263vpzdijcejna2ibbbbs/Twisty-Bridges.mp3?rlkey=fgi2hvodiadkygzlpyl5otmz5&st=kz3hql7y&dl=0" },
            { title: "Turn Back Time", artist: "Yaroslav Kulikov", cover: "/src/assets/turn-back-time-apple-music.jpeg", audio: "https://dl.dropbox.com/scl/fi/vhn3ckke4ea4pzp8xtwfe/turn-back-time.mp3?rlkey=7pr93w0ybm41zvuxa9360oc5h&st=tzgxbs6a&dl=0" },
            { title: "Disc Wars", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/anwd78s7ikf2xw0vo57r5/Disc-Wars.mp3?rlkey=hiqj6ew7lcivdd7cn20ltv7a7&st=mv80pm1e&dl=0" },
            { title: "Outlands", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/vdhsev9sixxco13paodo1/Outlands.mp3?rlkey=p5t2wbmmo4ofojjbd59cd1fff&st=d1xcapfw&dl=0" },
            { title: "The Game Has Changed", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/j95fn2sxuno0ypv798vk9/The-Game-Has-Changed.mp3?rlkey=d0fodcmlt3jap65v1oqsg967j&st=5z93aomh&dl=0" },
            { title: "Derezzed", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/8pvem1part62bbcex5zwu/Derezzed.mp3?rlkey=63gqyp0d3bhlhrecxt26ahhvl&st=xa6w4ejx&dl=0" },
            { title: "Armory", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/7mjli038311c4qvddmggf/Armory.mp3?rlkey=8o8fsqgz5ykt5lgca79fbd1ad&st=6ln1t28j&dl=0" },
            { title: "The Son Of Flynn", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/31hl84o6xz69yl7bis1p7/The-Son-Of-Flynn.mp3?rlkey=lkbl9fma53l73nmjkjqr13cva&st=ggbyjbkn&dl=0" },
            { title: "Solar Sailer", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/c11zlry3uizddb08x65be/Solar-Sailer.mp3?rlkey=n4769px12o670he62ory6okhb&st=a22fhkgu&dl=0" },
            { title: "End Of Line", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/17yhu6df3xgbzqzfrpwki/End-Of-Line.mp3?rlkey=4x5x8jzzr1v95oxm6y649ttp9&st=p0twk73y&dl=0" },
            { title: "TRON Legacy (End Titles)", artist: "Daft Punk", cover: "/src/assets/TRON-Legacy-apple-music.jpg", audio: "https://dl.dropbox.com/scl/fi/6dfaxv4ie1vkj4iagss3x/TRON-Legacy-End-Titles.mp3?rlkey=pvbtj14qdvdbqf7jsf70jwzru&st=jo8q866k&dl=0" },
               { title: "Queendom", artist: "Aurora", cover: "/src/assets/aurora_apple-music.jpeg", audio: "https://dl.dropbox.com/scl/fi/pzbw12pfjopwm9y38b6ou/AURORA-Queendom.mp3?rlkey=7zrukh111h1wcligjcad16fnr&st=ekvpu2iq&dl=0" },
            { title: "Sunflower", artist: "Post Malone & Swae Lee", cover: "/src/assets/sunflower-apple_music.jpeg", audio: "https://dl.dropbox.com/scl/fi/rr6r3el4l4xuk4tfjw0m4/sunflower.mp3?rlkey=9pxxwbgk86i6bzja79eivnxyo&st=41opl5bd&dl=0" },
            { title: "Self-love", artist: "Metro Boomin & Coi Leray", cover: "/src/assets/self-love-apple_music.jpeg", audio: "https://dl.dropbox.com/scl/fi/zkdozwpg9f9lxrjy88wpv/self-love.mp3?rlkey=3gptmvyua5pfd3or1e8gt0jea&st=j9tr0fv3&dl=0" },
            { title: "Painting", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/5r9q2tbcyvs72vrc2w18j/Painting.mp3?rlkey=g41eyb32hzjczevnky2utxqvq&st=on8n2uw2&dl=0" },
                { title: "Lighting the Way", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/sivukqxe9ozuwcmqeflcx/Lighting-the-Way.mp3?rlkey=7z7whik97cwdvq6opy5t1xu78&st=1u7ejk4u&dl=0" },
                    { title: "Manta", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/btwbg4b5q1yizwbq2c1fc/Manta.mp3?rlkey=r664qrtiktua047blipud93v6&st=5aeld0r4&dl=0" },
                        { title: "The Waters Above", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/fd5rb44fsb6t9kyea6dyv/The-Waters-Above.mp3?rlkey=a564y1dh8pntu6mpsksl022wt&st=o23wv02x&dl=0" },
                            { title: "Waltzing in the Rain", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/a77ew291511xt1zsn340j/Waltzing-in-the-Rain.mp3?rlkey=auy440f6qfp1ywjxe1ojei7rc&st=m0agthw6&dl=0" },
                                  { title: "A Portentous Walk", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/j7rhf0601uxxfo54n8ab0/A-Portentous-Walk.mp3?rlkey=lpkfootgijnv6kap1q09poabu&st=7pj2pga9&dl=0" },
                                        { title: "The Vault", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/bxjskxhwgfqel112ccxqx/The-Vault.mp3?rlkey=kyze4mgucvys4npomvk8po9hs&st=35aeg4kg&dl=0" },
                                           { title: "Faded Glories", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-1.png", audio: "https://dl.dropbox.com/scl/fi/lyoyc2naalzwtn6p8by3i/Faded-Glories.mp3?rlkey=ddn5ks579k3kmpb6ie5llfn1y&st=bge93ymn&dl=0" },
    { title: "A Bell Ringer", artist: "Sky: Children Of The Light OST", cover: "/src/assets/ost-vol-2.png", audio: "https://dl.dropbox.com/scl/fi/1t2iwqvnqe1swxl727dm4/A-Bell-Ringer.mp3?rlkey=99q7r042n6re3db6z8obcla6y&st=1qdgxwcd&dl=0" }
        ];
        
        this.audio = null;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.musicPanel = document.getElementById('mediumPanel2');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.playlistBtn = document.getElementById('playlistBtn');
        this.trackTitle = this.musicPanel?.querySelector('.track-title');
        this.trackArtist = this.musicPanel?.querySelector('.track-artist');
        this.albumCover = this.musicPanel?.querySelector('.album-cover');
        
        if (!this.musicPanel || !this.playBtn) {
            return;
        }
        
        this.initAudio();
        this.setupEventListeners();
        this.loadTrack(this.currentTrackIndex);
        
        this.initialized = true;
    }

    initAudio() {
        this.audio = new Audio();
        this.audio.volume = 0.7;
        
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('error', (e) => {
            this.isPlaying = false;
            this.updateUI();
        });
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlay();
        });
        
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.previous();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.next();
        });
        
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }
        
        if (this.playlistBtn) {
            this.playlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openPlaylist();
            });
        }
        
        this.musicPanel.addEventListener('click', (e) => {
            if (e.target === this.musicPanel || e.target.closest('.music-info')) {
                this.togglePlay();
            }
        });
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        
        const track = this.playlist[index];
        this.currentTrackIndex = index;
        
        this.audio.src = track.audio;
        
        if (this.trackTitle) this.trackTitle.textContent = track.title;
        if (this.trackArtist) this.trackArtist.textContent = track.artist;
        if (this.albumCover) this.albumCover.src = track.cover;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        // Will be coordinated by core manager
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
                soundManager?.play('click', 0.4);
            }).catch(error => {
                this.isPlaying = false;
                this.updateUI();
            });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateUI();
        soundManager?.play('click', 0.3);
    }

    next() {
        const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.loadTrack(nextIndex);
        
        if (this.isPlaying) {
            this.play();
        }
        
        soundManager?.play('click', 0.35);
    }

    previous() {
        const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.loadTrack(prevIndex);
        
        if (this.isPlaying) {
            this.play();
        }
        
        soundManager?.play('click', 0.35);
    }

    updateUI() {
        if (this.isPlaying) {
            this.musicPanel.classList.add('playing');
        } else {
            this.musicPanel.classList.remove('playing');
        }
    }

    setVolume(volume) {
        if (this.audio) {
            this.audio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    getVolume() {
        return this.audio ? this.audio.volume : 0;
    }

    addTrack(track) {
        this.playlist.push(track);
    }

    getCurrentTrack() {
        return this.playlist[this.currentTrackIndex];
    }

    getIsPlaying() {
        return this.isPlaying;
    }
    
    toggleMute() {
        if (this.audio.volume > 0) {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.musicPanel.classList.add('muted');
        } else {
            this.audio.volume = this.previousVolume || 0.7;
            this.musicPanel.classList.remove('muted');
        }
        
        soundManager?.play('click', 0.2);
    }
    
    openPlaylist() {
        soundManager?.play('click', 0.3);
        window.open('https://music.apple.com/us/playlist/luvrksnskye/pl.u-8aAVXD1svMZvDJR', '_blank');
    }

    destroy() {
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
        }
    }
}

class YouTubeManager {
    constructor() {
        this.player = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.previousVolume = 70;
        this.initialized = false;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.youtubePanel = document.getElementById('youtubePanel');
        this.playBtn = document.getElementById('youtubePlayBtn');
        this.prevBtn = document.getElementById('youtubePrevBtn');
        this.nextBtn = document.getElementById('youtubeNextBtn');
        this.volumeBtn = document.getElementById('youtubeVolumeBtn');
        this.playlistBtn = document.getElementById('youtubePlaylistBtn');
        
        if (!this.youtubePanel || !this.playBtn) {
            return;
        }
        
        this.loadYouTubeAPI();
        this.setupEventListeners();
        
        this.initialized = true;
    }

    loadYouTubeAPI() {
        if (window.YT && window.YT.Player) {
            this.initPlayer();
            return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            this.initPlayer();
        };
    }

    initPlayer() {
        this.player = new YT.Player('youtubeIframe', {
            events: {
                'onReady': (event) => this.onPlayerReady(event),
                'onStateChange': (event) => this.onPlayerStateChange(event),
                'onError': (event) => this.onPlayerError(event)
            }
        });
    }

    onPlayerReady(event) {
        this.player.setVolume(70);
    }

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.updateUI();
        } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.updateUI();
        }
    }

    onPlayerError(event) {
        this.isPlaying = false;
        this.updateUI();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePlay();
        });
        
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.restart();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.seekForward();
        });
        
        if (this.volumeBtn) {
            this.volumeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMute();
            });
        }
        
        if (this.playlistBtn) {
            this.playlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openPlaylist();
            });
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        // Will be coordinated by core manager
        if (!this.player) return;
        
        try {
            this.player.playVideo();
            soundManager?.play('click', 0.4);
        } catch (error) {
        }
    }

    pause() {
        if (!this.player) return;
        
        try {
            this.player.pauseVideo();
            soundManager?.play('click', 0.3);
        } catch (error) {
        }
    }

    restart() {
        if (!this.player) return;
        
        try {
            this.player.seekTo(0);
            soundManager?.play('click', 0.35);
        } catch (error) {
        }
    }

    seekForward() {
        if (!this.player) return;
        
        try {
            const currentTime = this.player.getCurrentTime();
            this.player.seekTo(currentTime + 10);
            soundManager?.play('click', 0.35);
        } catch (error) {
        }
    }

    toggleMute() {
        if (!this.player) return;
        
        try {
            if (this.isMuted) {
                this.player.unMute();
                this.player.setVolume(this.previousVolume);
                this.isMuted = false;
                this.youtubePanel.classList.remove('muted');
            } else {
                this.previousVolume = this.player.getVolume();
                this.player.mute();
                this.isMuted = true;
                this.youtubePanel.classList.add('muted');
            }
            
            soundManager?.play('click', 0.2);
        } catch (error) {
        }
    }

    updateUI() {
        if (this.isPlaying) {
            this.youtubePanel.classList.add('playing');
        } else {
            this.youtubePanel.classList.remove('playing');
        }
    }

    setVolume(volume) {
        if (this.player) {
            try {
                this.player.setVolume(Math.max(0, Math.min(100, volume)));
            } catch (error) {
            }
        }
    }

    getVolume() {
        if (this.player) {
            try {
                return this.player.getVolume();
            } catch (error) {
                return 0;
            }
        }
        return 0;
    }

    getIsPlaying() {
        return this.isPlaying;
    }

    openPlaylist() {
        soundManager?.play('click', 0.3);
        window.open('https://youtu.be/UrO0_OWuf6c?si=gC4MNrPzf5VvcuQ1', '_blank');
    }

    stop() {
        if (this.player) {
            try {
                this.player.stopVideo();
                this.isPlaying = false;
                this.updateUI();
            } catch (error) {
            }
        }
    }

    destroy() {
        if (this.player) {
            this.stop();
        }
    }
}

// Exportar ambas instancias
export const musicManager = new MusicManager();
export const youtubeManager = new YouTubeManager();

// Hacer disponibles globalmente
window.musicManager = musicManager;
window.youtubeManager = youtubeManager;