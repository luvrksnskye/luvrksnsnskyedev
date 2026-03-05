/* =============================================
   PAGINATION MODULE
   Renders the EXACT HTML structure from Document 6:
   
   <nav class="pagination">
     <ul class="pagination__list" role="list">
       <li class="pagination__item">
         <a class="pagination__link pagination__link--arrow">
           <svg>...</svg>  (prev)
         </a>
       </li>
       <li class="pagination__item">
         <a class="pagination__link">1</a>
       </li>
       <li class="pagination__item pagination__gap pagination__item--mobile-only">
         <span class="pagination__link--gap">...</span>
       </li>
       <li class="pagination__item">
         <a aria-current="page" class="pagination__link pagination__link--current">4</a>
       </li>
       ...
     </ul>
   </nav>
   ============================================= */

class PaginationManager {
    constructor() {
        this.container = null;
        this.contentEl = null;
        this.pages = [];
        this.currentPage = 0;
        this.totalPages = 0;
        this.onPageChange = null;
    }

    init(paginationEl, contentEl, onPageChange) {
        this.container = paginationEl;
        this.contentEl = contentEl;
        this.onPageChange = onPageChange;
    }

    setPages(pages) {
        this.pages = pages;
        this.totalPages = pages.length;
        this.currentPage = 0;
        this.render();
        this.renderContent();
    }

    render() {
        if (this.totalPages <= 1) {
            this.container.innerHTML = '';
            return;
        }

        const progressPercent = ((this.currentPage + 1) / this.totalPages) * 100;

        /*
            Build the EXACT structure from Document 6 pasted:
            <nav class="pagination" aria-label="Pagination navigation">
              <ul class="pagination__list" role="list">
                ...items...
              </ul>
            </nav>
        */
        this.container.innerHTML = `
            <nav class="pagination" aria-label="Pagination navigation">
                <ul class="pagination__list" role="list">
                    ${this.buildItems()}
                </ul>
                <div class="pagination__progress">
                    <div class="pagination__progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            </nav>
        `;

        this.bindEvents();
    }

    buildItems() {
        const current = this.currentPage;
        const total = this.totalPages;
        let html = '';

        /*
            From Document 6: Previous arrow
            <li class="pagination__item">
              <a href="#2" aria-label="Previous" class="pagination__link pagination__link--arrow">
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                  <path d="M7 11L2 6L7 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </li>
        */
        html += `
            <li class="pagination__item">
                <a aria-label="Previous" class="pagination__link pagination__link--arrow ${current === 0 ? 'disabled' : ''}" data-action="prev">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 11L2 6L7 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </a>
            </li>
        `;

        /* Page numbers with smart ellipsis (progressive anchors) */
        const visible = this.getVisiblePages(current, total);
        let lastRendered = -1;

        for (const page of visible) {
            /*
                From Document 6: Gap ellipsis
                <li class="pagination__item pagination__gap pagination__item--mobile-only">
                  <span class="pagination__link--gap" aria-hidden="true">...</span>
                </li>
            */
            if (lastRendered !== -1 && page - lastRendered > 1) {
                html += `
                    <li class="pagination__item pagination__gap">
                        <span class="pagination__link--gap" aria-hidden="true">\u2026</span>
                    </li>
                `;
            }

            /*
                From Document 6: Page link
                <li class="pagination__item">
                  <a href="#4" aria-current="page" aria-label="Page 4" class="pagination__link pagination__link--current">4</a>
                </li>
            */
            const isCurrent = page === current;
            html += `
                <li class="pagination__item">
                    <a ${isCurrent ? 'aria-current="page"' : ''} aria-label="Page ${page + 1}" class="pagination__link ${isCurrent ? 'pagination__link--current' : ''}" data-page="${page}">
                        ${page + 1}
                    </a>
                </li>
            `;
            lastRendered = page;
        }

        /*
            From Document 6: Next arrow
            <li class="pagination__item">
              <a href="#0" aria-label="Next" class="pagination__link pagination__link--arrow">
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                  <path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </li>
        */
        html += `
            <li class="pagination__item">
                <a aria-label="Next" class="pagination__link pagination__link--arrow ${current === total - 1 ? 'disabled' : ''}" data-action="next">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L6 6L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                    </svg>
                </a>
            </li>
        `;

        return html;
    }

    getVisiblePages(current, total) {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i);
        }
        const pages = new Set();
        pages.add(0);
        pages.add(total - 1);
        const start = Math.max(1, current - 1);
        const end = Math.min(total - 2, current + 1);
        for (let i = start; i <= end; i++) pages.add(i);
        return [...pages].sort((a, b) => a - b);
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const link = e.target.closest('.pagination__link');
            if (!link || link.classList.contains('disabled')) return;
            e.preventDefault();

            const action = link.dataset.action;
            const page = link.dataset.page;

            if (action === 'prev' && this.currentPage > 0) {
                this.goToPage(this.currentPage - 1);
            } else if (action === 'next' && this.currentPage < this.totalPages - 1) {
                this.goToPage(this.currentPage + 1);
            } else if (page !== undefined) {
                this.goToPage(parseInt(page, 10));
            }
        });
    }

    goToPage(pageIndex) {
        if (pageIndex === this.currentPage) return;
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;

        this.currentPage = pageIndex;
        this.transitionContent();
        this.render();

        if (this.onPageChange) {
            this.onPageChange(pageIndex, this.totalPages);
        }
    }

    transitionContent() {
        const pageContent = this.contentEl.querySelector('.blog-page-content');
        if (!pageContent) {
            this.renderContent();
            return;
        }

        pageContent.classList.add('blog-page-content--exiting');

        setTimeout(() => {
            this.renderContent();
            const newContent = this.contentEl.querySelector('.blog-page-content');
            if (newContent) {
                newContent.classList.add('blog-page-content--entering');
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        newContent.classList.remove('blog-page-content--entering');
                    });
                });
            }
            this.contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
    }

    renderContent() {
        if (!this.pages[this.currentPage]) return;
        this.contentEl.innerHTML = `
            <div class="blog-page-content">
                ${this.pages[this.currentPage].content}
            </div>
        `;
    }

    getCurrentPage() {
        return this.currentPage;
    }
}

const paginationManager = new PaginationManager();
export default paginationManager;
