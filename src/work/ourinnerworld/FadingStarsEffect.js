// FadingStarsEffect.js - Estrellas estáticas que se desvanecen gradualmente
export class FadingStarsEffect {
    constructor() {
        this.stars = [];
        this.starsContainer = null;
    }

    init() {
        this.createStarsContainer();
        this.createFadingStars();
    }

    createStarsContainer() {
        const transitionThree = document.getElementById('gradient-transition-three');
        if (!transitionThree) return;

        this.starsContainer = document.createElement('div');
        this.starsContainer.className = 'fading-stars';
        transitionThree.insertBefore(this.starsContainer, transitionThree.firstChild);
    }

    createFadingStars() {
        if (!this.starsContainer) return;

        const starCount = 800;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'fading-star';
            
            // Variaciones de tamaño
            if (Math.random() > 0.7) {
                star.classList.add('large');
            }
            
            if (Math.random() > 0.8) {
                star.classList.add('sparkle');
            }
            
            // Posición aleatoria horizontal
            const leftPosition = Math.random() * 100;
            star.style.left = `${leftPosition}%`;
            
            // Posición vertical aleatoria
            const topPosition = Math.random() * 100;
            star.style.top = `${topPosition}%`;
            
            // Calcular opacidad basada en la posición vertical
            // Arriba (0%) = opacidad 1, Abajo (100%) = opacidad 0
            const opacity = 1 - (topPosition / 100);
            star.style.opacity = opacity;
            
            this.starsContainer.appendChild(star);
            this.stars.push(star);
        }
    }
}
