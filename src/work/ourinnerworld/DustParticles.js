// DustParticles.js - Partículas de polvo flotantes dentro del tren
export class DustParticles {
    constructor() {
        this.particles = [];
        this.particlesContainer = null;
        this.isActive = false;
        this.emissionInterval = null;
    }

    init() {
        this.particlesContainer = document.getElementById('dust-particles-container');
        if (!this.particlesContainer) {
            console.warn('Dust particles container not found');
        }
    }

    createParticle() {
        if (!this.particlesContainer) {
            console.warn('No particles container available');
            return;
        }

        const particle = document.createElement('div');
        particle.className = 'dust-particle';
        
        // Variaciones de tamaño - más pequeñas
        const sizeRandom = Math.random();
        if (sizeRandom > 0.8) {
            particle.classList.add('medium'); // Solo algunas medianas
        }
        // El resto son pequeñas (default)
        
        // Posición inicial aleatoria - área más horizontal
        const startX = Math.random() * 100; // Todo el ancho
        const startY = 30 + Math.random() * 40; // Solo en el rango 30%-70% de altura
        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;
        
        // Duración aleatoria de la animación (más rápida)
        const duration = 4 + Math.random() * 4; // Entre 4 y 8 segundos
        particle.style.animation = `dustFloat ${duration}s ease-in-out forwards`;
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particle);
        
        console.log(`Dust particle created at ${startX}%, ${startY}% - Total particles: ${this.particles.length}`);
        
        // Eliminar la partícula después de la animación
        setTimeout(() => {
            particle.remove();
            this.particles = this.particles.filter(p => p !== particle);
        }, duration * 1000);
    }

    start() {
        this.isActive = true;
        console.log('Starting dust particles...', this.particlesContainer);
        
        // Crear partículas iniciales (aumentado)
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                if (this.isActive) this.createParticle();
            }, i * 150);
        }
        
        // Emitir nuevas partículas continuamente
        this.emissionInterval = setInterval(() => {
            if (this.isActive) {
                // Emitir 2-3 partículas cada vez
                const count = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) {
                    setTimeout(() => {
                        if (this.isActive) this.createParticle();
                    }, i * 100);
                }
            }
        }, 700);
    }

    stop() {
        this.isActive = false;
        if (this.emissionInterval) {
            clearInterval(this.emissionInterval);
        }
        
        // Limpiar todas las partículas existentes
        this.particles.forEach(particle => particle.remove());
        this.particles = [];
    }
}
