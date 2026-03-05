/* =============================================
   SIDEBAR MODULE
   ============================================= */

import blogData from './blog-data.js';

class SidebarManager {
    constructor() {
        this.container = null;
        this.overlay = null;
        this.listEl = null;
        this.searchInput = null;
        this.currentBlogId = null;
        this.onBlogSelect = null;
        this.isOpen = false;
    }

    init(containerEl, overlayEl, onBlogSelect) {
        this.container = containerEl;
        this.overlay = overlayEl;
        this.onBlogSelect = onBlogSelect;
        this.render();
        this.bindEvents();
    }

    render() {
        /* Find the .glass-inner wrapper inside the sidebar */
        const inner = this.container.querySelector('.glass-inner');
        const target = inner || this.container;

        target.innerHTML = `
            <button class="sidebar__close" aria-label="Close sidebar">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
            <div class="sidebar__header">
                <div class="sidebar__title">Blog Posts</div>
                <div class="sidebar__count">${blogData.length} articles</div>
            </div>
            <div class="sidebar__search">
                <div class="sidebar__search-wrap">
                    <svg class="sidebar__search-icon" viewBox="0 0 16 16" fill="none">
                        <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.2"/>
                        <path d="M10.5 10.5L14.5 14.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                    </svg>
                    <input type="text" class="sidebar__search-input" placeholder="Search posts..." />
                </div>
            </div>
            <div class="sidebar__list"></div>
        `;
        this.listEl = target.querySelector('.sidebar__list');
        this.searchInput = target.querySelector('.sidebar__search-input');
        this.renderList(blogData);
    }

    renderList(blogs) {
        this.listEl.innerHTML = blogs.map(blog => `
            <div class="sidebar-item ${blog.id === this.currentBlogId ? 'sidebar-item--active' : ''}"
                 data-blog-id="${blog.id}">
                <img class="sidebar-item__thumb" src="${blog.cover}" alt="${blog.title}" loading="lazy" />
                <div class="sidebar-item__info">
                    <div class="sidebar-item__title">${blog.title}</div>
                    <div class="sidebar-item__date">${blog.date}</div>
                </div>
                <span class="sidebar-item__tag">${blog.category}</span>
            </div>
        `).join('');
    }

    bindEvents() {
        this.listEl.addEventListener('click', (e) => {
            const item = e.target.closest('.sidebar-item');
            if (!item) return;
            const blogId = item.dataset.blogId;
            if (blogId === this.currentBlogId) return;
            this.selectBlog(blogId);
        });

        this.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                this.renderList(blogData);
                return;
            }
            const filtered = blogData.filter(b =>
                b.title.toLowerCase().includes(query) ||
                b.tags.some(t => t.toLowerCase().includes(query)) ||
                b.category.toLowerCase().includes(query)
            );
            this.renderList(filtered);
        });

        const closeBtn = this.container.querySelector('.sidebar__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
    }

    selectBlog(blogId) {
        this.currentBlogId = blogId;
        this.updateActiveState();
        if (this.onBlogSelect) this.onBlogSelect(blogId);
        this.close();
    }

    setActive(blogId) {
        this.currentBlogId = blogId;
        this.updateActiveState();
    }

    updateActiveState() {
        const items = this.listEl.querySelectorAll('.sidebar-item');
        items.forEach(item => {
            item.classList.toggle('sidebar-item--active', item.dataset.blogId === this.currentBlogId);
        });
    }

    open() {
        this.isOpen = true;
        this.container.classList.add('blog-sidebar--open');
        if (this.overlay) this.overlay.classList.add('sidebar-overlay--visible');
    }

    close() {
        this.isOpen = false;
        this.container.classList.remove('blog-sidebar--open');
        if (this.overlay) this.overlay.classList.remove('sidebar-overlay--visible');
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }
}

const sidebarManager = new SidebarManager();
export default sidebarManager;
