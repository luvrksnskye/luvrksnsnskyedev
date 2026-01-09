// RainEffect.js - Lluvia más intensa y visible
export class RainEffect {
    constructor() {
        this.isActive = false;
        this.dropCount = 450;
        this.rainContainer = null;
    }

    init() {
        this.createRainContainer();
        this.makeItRain();
    }

    createRainContainer() {
        this.rainContainer = document.createElement('div');
        this.rainContainer.className = 'rain';
        this.rainContainer.style.opacity = '0';
        
        const titleContainer = document.querySelector('.title-container');
        if (titleContainer) {
            titleContainer.appendChild(this.rainContainer);
        }
    }

    makeItRain() {
        if (this.rainContainer) {
            this.rainContainer.innerHTML = '';
        }

        let drops = '';
        let increment = 0;

        while (increment < this.dropCount) {
            const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
            const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
            
            increment += randoFiver;
            
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
        
        gsap.to(this.rainContainer, {
            opacity: 1,
            duration: 3,
            ease: "power2.inOut"
        });
        
        this.rainInterval = setInterval(() => {
            if (this.isActive) {
                this.makeItRain();
            }
        }, 30000);
    }

    stop() {
        this.isActive = false;
        if (this.rainInterval) {
            clearInterval(this.rainInterval);
        }
        gsap.to(this.rainContainer, {
            opacity: 0,
            duration: 2,
            ease: "power2.inOut"
        });
    }

    setIntensity(intensity) {
        this.dropCount = Math.floor(intensity * 500);
        this.makeItRain();
    }
}
