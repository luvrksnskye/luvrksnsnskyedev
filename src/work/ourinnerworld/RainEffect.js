// RainEffect.js
export class RainEffect {
    constructor() {
        this.isActive = false;
        this.dropCount = 250;
        this.rainContainer = null;
    }

    init() {
        this.createRainContainer();
        this.makeItRain();
        this.start();
    }

    createRainContainer() {
        // Crear contenedor principal
        this.rainContainer = document.createElement('div');
        this.rainContainer.className = 'rain';
        this.rainContainer.style.opacity = '0';
        document.getElementById('app').prepend(this.rainContainer);
    }

    makeItRain() {
        // Limpiar lluvia anterior
        if (this.rainContainer) {
            this.rainContainer.innerHTML = '';
        }

        let drops = '';
        let increment = 0;

        while (increment < this.dropCount) {
            // Números aleatorios para varias randomizaciones
            const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
            const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
            
            increment += randoFiver;
            
            // Crear gota con propiedades aleatorias
            drops += `
                <div class="drop" style="
                    left: ${increment}%; 
                    bottom: ${randoFiver + randoFiver - 1 + 100}%; 
                    animation-delay: 0.${randoHundo}s; 
                    animation-duration: 0.5${randoHundo}s;
                ">
                    <div class="stem" style="
                        animation-delay: 0.${randoHundo}s; 
                        animation-duration: 0.5${randoHundo}s;
                    "></div>
                </div>
            `;
        }

        if (this.rainContainer) {
            this.rainContainer.innerHTML = drops;
        }
    }

    start() {
        this.isActive = true;
        
        // Fade in de la lluvia
        gsap.to(this.rainContainer, {
            opacity: 0.8,
            duration: 3,
            ease: "power2.inOut"
        });
        
        // Actualizar lluvia cada 30 segundos para variedad
        setInterval(() => {
            this.makeItRain();
        }, 30000);
    }

    stop() {
        this.isActive = false;
        gsap.to(this.rainContainer, {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut"
        });
    }

    setIntensity(intensity) {
        // intensity: 0-1
        this.dropCount = Math.floor(intensity * 200);
        this.makeItRain();
    }
}
