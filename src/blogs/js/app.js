/* =============================================
   BLOG APP MODULE (Main Orchestrator)
   Coordinates all modules
   ============================================= */

import blogData from './blog-data.js';
import sidebarManager from './sidebar.js';
import paginationManager from './pagination.js';
import pointerShine from './pointer-shine.js';
import glassShine from './glass-shine.js';
import navDisplacement from './nav-displacement.js';
import glassCanvas from './glass-canvas.js';
import soundManager from './sound-manager.js';
import musicPlayer from './music-player.js';
import initBlogAnimationDemos from './blog-animations-demos.js';
import initOuinnerworldDev from './ourinnerworld-dev.js';

class BlogApp {
    constructor() {
        this.currentBlog = null;
        this.els = {};
    }

    init() {
        this.cacheElements();
        this.initGlassCanvas();
        this.initSoundManager();
        this.initMusicPlayer();
        this.initSidebar();
        this.initPagination();
        this.initPointerShine();
        this.initGlassShine();
        this.initNavDisplacement();
        this.loadInitialBlog();
        this.bindGlobalEvents();
    }

    cacheElements() {
        this.els = {
            headerCard: document.getElementById('blogHeader'),
            featuredImage: document.getElementById('blogFeatured'),
            bodyCard: document.getElementById('blogBody'),
            bodyContent: document.getElementById('blogBodyContent'),
            paginationWrap: document.getElementById('blogPagination'),
            sidebar: document.getElementById('blogSidebar'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            blogTitle: document.getElementById('blogTitleText'),
            blogSubtitle: document.getElementById('blogSubtitleText'),
            authorName: document.getElementById('authorName'),
            authorDate: document.getElementById('authorDate'),
            authorAvatar: document.getElementById('authorAvatar'),
            featuredImg: document.getElementById('featuredImg'),
            tagsContainer: document.getElementById('blogTags'),
            navBlogTitle: document.getElementById('navBlogTitle'),
        };
    }

    initGlassCanvas() {
        glassCanvas.init();
    }

    initSoundManager() {
        soundManager.init();
    }

    initMusicPlayer() {
        musicPlayer.init();
    }

    initSidebar() {
        sidebarManager.init(
            this.els.sidebar,
            this.els.sidebarOverlay,
            (blogId) => this.loadBlog(blogId)
        );

        if (this.els.sidebarToggle) {
            this.els.sidebarToggle.addEventListener('click', () => {
                sidebarManager.toggle();
                soundManager.play('menuOpen');
            });
        }
    }

    initPagination() {
        paginationManager.init(
            this.els.paginationWrap,
            this.els.bodyContent,
            (page, total) => {
                soundManager.play('tick');
                /*
                   Re-initialize interactive demos after
                   pagination renders new page content.
                   Small delay to ensure DOM is ready.
                */
                setTimeout(() => {
                    initBlogAnimationDemos();
                    initOuinnerworldDev();
                    this.bindDiagramSounds();
                }, 450);
            }
        );
    }

    initPointerShine() {
        pointerShine.init();
    }

    initGlassShine() {
        glassShine.init();
    }

    initNavDisplacement() {
        navDisplacement.init();
    }

    loadInitialBlog() {
        const hash = window.location.hash.replace('#', '');
        const blog = blogData.find(b => b.id === hash) || blogData[0];
        this.loadBlog(blog.id, false);
    }

    loadBlog(blogId, animate = true) {
        const blog = blogData.find(b => b.id === blogId);
        if (!blog) return;

        this.currentBlog = blog;
        window.location.hash = blog.id;
        sidebarManager.setActive(blog.id);

        if (animate) {
            soundManager.play('command');
            this.transitionBlogContent(blog);
        } else {
            this.populateBlog(blog);
            initBlogAnimationDemos();
            initOuinnerworldDev();
        }
    }

    transitionBlogContent(blog) {
        const cards = [
            this.els.headerCard,
            this.els.featuredImage,
            this.els.bodyCard
        ];

        /* Fade out with staggered blur */
        cards.forEach((card, i) => {
            card.style.transition = `
                opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s,
                transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s,
                filter 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.04}s
            `;
            card.style.opacity = '0';
            card.style.transform = 'translateY(6px) scale(0.99)';
            card.style.filter = 'blur(4px)';
        });

        setTimeout(() => {
            this.populateBlog(blog);

            /* Fade in with staggered spring */
            cards.forEach((card, i) => {
                card.style.transition = `
                    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s,
                    transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s,
                    filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.06}s
                `;
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.filter = 'blur(0px)';
            });

            /* Refresh shine panels after DOM update */
            pointerShine.refresh();
            glassShine.refresh();

            /* Init interactive demos in new content */
            initBlogAnimationDemos();
            initOuinnerworldDev();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 420);
    }

    populateBlog(blog) {
        this.els.blogTitle.textContent = blog.title;
        this.els.blogSubtitle.textContent = blog.subtitle;
        this.els.authorName.textContent = blog.author;
        this.els.authorDate.textContent = blog.date;
        this.els.authorAvatar.src = blog.avatar;
        this.els.authorAvatar.alt = blog.author;
        this.els.featuredImg.src = blog.cover;
        this.els.featuredImg.alt = blog.title;
        this.els.navBlogTitle.textContent = blog.title;

        /* Tags */
        this.els.tagsContainer.innerHTML = blog.tags
            .map(tag => `<span class="blog-tag">${tag}</span>`)
            .join('');

        /* Pagination + content */
        paginationManager.setPages(blog.pages);

        /* Bind diagram interaction sounds after content renders */
        this.bindDiagramSounds();
    }

    bindDiagramSounds() {
        const diagrams = document.querySelectorAll('.diagram-wrap');
        diagrams.forEach(wrap => {
            wrap.addEventListener('click', () => {
                soundManager.play('knock');
            }, { once: false });

            const layers = wrap.querySelectorAll('.layer');
            layers.forEach(layer => {
                layer.addEventListener('pointerenter', () => {
                    soundManager.play('tick', 0.1);
                });
            });
        });
    }

    bindGlobalEvents() {
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && hash !== this.currentBlog?.id) {
                this.loadBlog(hash);
            }
        });

        /* Keyboard nav for pagination */
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'ArrowLeft') {
                const c = paginationManager.getCurrentPage();
                if (c > 0) paginationManager.goToPage(c - 1);
            } else if (e.key === 'ArrowRight') {
                const c = paginationManager.getCurrentPage();
                if (c < this.currentBlog.pages.length - 1) {
                    paginationManager.goToPage(c + 1);
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new BlogApp();
    app.init();
});

export default BlogApp;
