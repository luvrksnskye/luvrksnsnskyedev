// StarsEffect.js - Sistema de estrellas cayendo estilo pixel art
export class StarsEffect {
    constructor() {
        this.isActive = false;
        this.starsContainer = null;
        this.starCount = 20;
    }

    init() {
        this.createStarsContainer();
        this.createStars();
    }

    createStarsContainer() {
        this.starsContainer = document.createElement('div');
        this.starsContainer.className = 'night-sky';
        this.starsContainer.style.opacity = '0';
        document.getElementById('section-two').prepend(this.starsContainer);
    }

    createStars() {
        if (!this.starsContainer) return;

        let starsHTML = '';
        
        for (let i = 0; i < this.starCount; i++) {
            const delay = Math.random() * 9999;
            const topOffset = (Math.random() * 400) - 200;
            const leftOffset = (Math.random() * 300);
            const duration = 3000 + (Math.random() * 2000);
            
            starsHTML += `
                <div class="shooting-star" style="
                    top: calc(50% - ${topOffset}px);
                    left: calc(50% - ${leftOffset}px);
                    animation-delay: ${delay}ms;
                    animation-duration: ${duration}ms;
                "></div>
            `;
        }

        this.starsContainer.innerHTML = starsHTML;
    }

    start() {
        if (!this.starsContainer) return;
        
        this.isActive = true;
        
        gsap.to(this.starsContainer, {
            opacity: 1,
            duration: 2,
            ease: 'power2.inOut'
        });
    }

    stop() {
        if (!this.starsContainer) return;
        
        this.isActive = false;
        
        gsap.to(this.starsContainer, {
            opacity: 0,
            duration: 2,
            ease: 'power2.inOut'
        });
    }

    updateStarCount(count) {
        this.starCount = count;
        this.createStars();
    }
}
