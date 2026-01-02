/**
 * STARVORTEX ENHANCED - Additional Features v3.0
 * 
 * This file contains the additional JavaScript functionality for:
 * - Title typing animation with flash effect
 * - Ghost text animations
 * - Scroll navigation (vertical + horizontal indicators)
 * - Expandable side panel
 * - Section tracking
 */

class SVEnhancedFeatures {
    constructor() {
        this.currentSection = 0;
        this.totalSections = 6;
        this.isAnimating = false;
        this.expandPanelOpen = false;
        this.scrollThrottle = false;
        
        // Bind methods
        this.handleScroll = this.handleScroll.bind(this);
        this.updateSectionIndicators = this.updateSectionIndicators.bind(this);
    }
    
    init() {
        this.setupScrollNavigation();
        this.setupExpandButton();
        this.setupSectionObserver();
    }
    
    // ==========================================
    // TITLE ANIMATION WITH FLASH & TYPING
    // ==========================================
    
    animateTitle(element, text, callback) {
        if (!element) return;
        
        element.style.opacity = '0';
        element.textContent = '';
        
        let charIndex = 0;
        const chars = text.split('');
        
        // Start with opacity 1
        element.style.opacity = '1';
        
        const typeChar = () => {
            if (charIndex < chars.length) {
                element.textContent += chars[charIndex];
                charIndex++;
                
                // Random flicker during typing
                if (Math.random() > 0.7) {
                    element.style.opacity = '0.5';
                    setTimeout(() => {
                        element.style.opacity = '1';
                    }, 50);
                }
                
                setTimeout(typeChar, 80 + Math.random() * 40);
            } else {
                // Typing complete - add flash class
                element.classList.add('typing');
                
                // Show ghost texts
                this.showGhostTexts();
                
                // Remove flash class after animation
                setTimeout(() => {
                    element.classList.remove('typing');
                    if (callback) callback();
                }, 450);
            }
        };
        
        // Start typing
        setTimeout(typeChar, 200);
    }
    
    showGhostTexts() {
        const ghosts = [
            document.getElementById('sv-title-ghost-1'),
            document.getElementById('sv-title-ghost-2')
        ];
        
        ghosts.forEach((ghost) => {
            if (ghost) {
                ghost.textContent = 'STARVORTEX';
                // Activate animation by setting play state to running
                ghost.style.animationPlayState = 'running';
            }
        });
    }
    
    // ==========================================
    // SCROLL NAVIGATION
    // ==========================================
    
    setupScrollNavigation() {
        const scroll = document.getElementById('sv-scroll');
        if (!scroll) return;
        
        // Listen to scroll events
        scroll.addEventListener('scroll', this.handleScroll, { passive: true });
        
        // Setup arrow click handlers
        const scrollUpLeft = document.getElementById('sv-scroll-up-left');
        const scrollDownLeft = document.getElementById('sv-scroll-down-left');
        const scrollUpRight = document.getElementById('sv-scroll-up-right');
        const scrollDownRight = document.getElementById('sv-scroll-down-right');
        
        [scrollUpLeft, scrollUpRight].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.scrollToSection(this.currentSection - 1));
            }
        });
        
        [scrollDownLeft, scrollDownRight].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.scrollToSection(this.currentSection + 1));
            }
        });
        
        // Setup dot click handlers
        document.querySelectorAll('.sv-section-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const sectionIndex = parseInt(dot.dataset.section);
                this.scrollToSection(sectionIndex);
            });
        });
        
        // Setup number click handlers
        document.querySelectorAll('.sv-section-num').forEach(num => {
            num.addEventListener('click', () => {
                const sectionIndex = parseInt(num.dataset.section);
                this.scrollToSection(sectionIndex);
            });
        });
    }
    
    handleScroll() {
        const scroll = document.getElementById('sv-scroll');
        if (!scroll) return;
        
        // Throttle scroll events for better performance
        if (this.scrollThrottle) return;
        this.scrollThrottle = true;
        
        requestAnimationFrame(() => {
            const sections = scroll.querySelectorAll('.sv-section[data-section-index]');
            const scrollTop = scroll.scrollTop;
            const scrollHeight = scroll.clientHeight;
            
            let newSection = 0;
            const threshold = scrollHeight / 3;
            
            sections.forEach((section, index) => {
                const sectionTop = section.offsetTop - 60; // Account for nav height
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionMiddle = sectionTop + (section.offsetHeight / 2);
                
                // Check if section middle is in viewport
                if (scrollTop + threshold >= sectionMiddle) {
                    newSection = index;
                }
            });
            
            if (newSection !== this.currentSection) {
                this.currentSection = newSection;
                this.updateSectionIndicators();
            }
            
            this.scrollThrottle = false;
        });
    }
    
    scrollToSection(index) {
        if (this.isAnimating) return;
        if (index < 0 || index >= this.totalSections) return;
        
        const scroll = document.getElementById('sv-scroll');
        if (!scroll) return;
        
        const sections = scroll.querySelectorAll('.sv-section[data-section-index]');
        
        if (sections[index]) {
            this.isAnimating = true;
            const targetTop = sections[index].offsetTop - 60;
            
            scroll.scrollTo({
                top: targetTop,
                behavior: 'smooth'
            });
            
            // Update immediately for responsiveness
            this.currentSection = index;
            this.updateSectionIndicators();
            
            // Reset animation lock
            setTimeout(() => {
                this.isAnimating = false;
            }, 800);
        }
    }
    
    updateSectionIndicators() {
        // Update dots (both sides)
        document.querySelectorAll('.sv-section-dot').forEach(dot => {
            const sectionIndex = parseInt(dot.dataset.section);
            dot.classList.toggle('active', sectionIndex === this.currentSection);
        });
        
        // Update numbers
        document.querySelectorAll('.sv-section-num').forEach(num => {
            const sectionIndex = parseInt(num.dataset.section);
            num.classList.toggle('active', sectionIndex === this.currentSection);
        });
        
        // Update arrows visibility and state
        const upArrows = [
            document.getElementById('sv-scroll-up-left'),
            document.getElementById('sv-scroll-up-right')
        ];
        const downArrows = [
            document.getElementById('sv-scroll-down-left'),
            document.getElementById('sv-scroll-down-right')
        ];
        
        upArrows.forEach(arrow => {
            if (!arrow) return;
            if (this.currentSection === 0) {
                arrow.classList.add('inactive');
                if (arrow.src && !arrow.src.includes('inactive')) {
                    arrow.src = arrow.src.replace('arrow-scroll.png', 'arrow-scroll-inactive.png');
                }
            } else {
                arrow.classList.remove('inactive');
                if (arrow.src && arrow.src.includes('inactive')) {
                    arrow.src = arrow.src.replace('arrow-scroll-inactive.png', 'arrow-scroll.png');
                }
            }
        });
        
        downArrows.forEach(arrow => {
            if (!arrow) return;
            if (this.currentSection >= this.totalSections - 1) {
                arrow.classList.add('inactive');
                if (arrow.src && !arrow.src.includes('inactive')) {
                    arrow.src = arrow.src.replace('arrow-scroll.png', 'arrow-scroll-inactive.png');
                }
            } else {
                arrow.classList.remove('inactive');
                if (arrow.src && arrow.src.includes('inactive')) {
                    arrow.src = arrow.src.replace('arrow-scroll-inactive.png', 'arrow-scroll.png');
                }
            }
        });
    }
    
    // ==========================================
    // EXPANDABLE PANEL
    // ==========================================
    
    setupExpandButton() {
        const expandBtn = document.getElementById('sv-expand-btn');
        const expandPanel = document.getElementById('sv-expandable-panel');
        
        if (!expandBtn) {
            return;
        }
        
        if (!expandPanel) {
            return;
        }
        
        
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.expandPanelOpen = !this.expandPanelOpen;
            
            
            expandBtn.classList.toggle('expanded', this.expandPanelOpen);
            expandPanel.classList.toggle('open', this.expandPanelOpen);
            
            // Play click sound if available
            if (window.workManager?.playClickSound) {
                window.workManager.playClickSound();
            }
        });
        
        // Close panel when clicking outside
        document.addEventListener('click', (e) => {
            if (this.expandPanelOpen && 
                !expandPanel.contains(e.target) && 
                !expandBtn.contains(e.target)) {
                this.expandPanelOpen = false;
                expandBtn.classList.remove('expanded');
                expandPanel.classList.remove('open');
            }
        });
    }
    
    // ==========================================
    // SECTION OBSERVER
    // ==========================================
    
    setupSectionObserver() {
        const scroll = document.getElementById('sv-scroll');
        if (!scroll) {
            return;
        }
        
        const sections = scroll.querySelectorAll('.sv-section[data-section-index]');
        this.totalSections = sections.length;
        
        
        // Log each section for debugging
        sections.forEach((section, index) => {
            const sectionIndex = section.getAttribute('data-section-index');
        });
        
        // Initial update
        this.updateSectionIndicators();
        
        // Force initial scroll check after a short delay
        setTimeout(() => {
            this.handleScroll();
        }, 500);
    }
    
    // ==========================================
    // CLEANUP
    // ==========================================
    
    destroy() {
        const scroll = document.getElementById('sv-scroll');
        if (scroll) {
            scroll.removeEventListener('scroll', this.handleScroll);
        }
    }
}

// Initialize when work mode is entered
const svEnhanced = new SVEnhancedFeatures();

// Function to hook into workManager
function hookWorkManager() {
    if (!window.workManager) {
        setTimeout(hookWorkManager, 100);
        return;
    }
    
    
    const originalEnterWorkMode = window.workManager.enterWorkMode.bind(window.workManager);
    const originalExitWorkMode = window.workManager.exitWorkMode.bind(window.workManager);
    const originalStartAnimations = window.workManager.startAnimations.bind(window.workManager);
    
    window.workManager.enterWorkMode = async function() {
        await originalEnterWorkMode();
        svEnhanced.init();
    };
    
    window.workManager.exitWorkMode = function() {
        svEnhanced.destroy();
        originalExitWorkMode();
    };
    
    // Override title animation
    window.workManager.startAnimations = function() {
        this.startCircleAnimation();
        const hero = document.getElementById('sv-hero');
        if (hero) {
            hero.classList.add('visible');
            this.playTextAnimSound();
            
            // Use enhanced title animation
            setTimeout(() => {
                this.playRolloverSound();
                svEnhanced.animateTitle(document.getElementById('sv-title'), 'STARVORTEX', () => {
                    // Continue with other animations after title
                });
            }, 400);
            
            setTimeout(() => this.typewriter(document.getElementById('sv-tagline'), 'ONE FORCE BEHIND TOMORROW\'S SYSTEMS'), 1500);
            setTimeout(() => { this.playRolloverSound(); this.scramble(document.getElementById('sv-label-l'), 'TECHNOLOGY'); }, 1900);
            setTimeout(() => { this.playRolloverSound(); this.scramble(document.getElementById('sv-label-r'), 'DESIGN. DEVELOP. DELIVER.'); }, 2100);
            setTimeout(() => this.typewriter(document.getElementById('sv-desc'), 'RATHER THAN FOCUSING ON A SINGLE SPECIALTY, STARVORTEX OPERATES UNDER A MULTI-DIVISION MODEL, WITH EACH DIVISION DEDICATED TO A SPECIFIC BRANCH OF TECHNOLOGY.'), 2300);
        }
    };
    
}

// Start hooking when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookWorkManager);
} else {
    hookWorkManager();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { svEnhanced, SVEnhancedFeatures };
}
