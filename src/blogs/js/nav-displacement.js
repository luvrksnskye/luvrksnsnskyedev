/* =============================================
   NAV DISPLACEMENT MODULE
   Enhanced with stronger displacement scale
   and chromatic aberration for more visible
   liquid glass effect on nav bar.
   ============================================= */

const navConfig = {
    width: 380,
    height: 52,
    radius: 50,
    border: 0.07,
    lightness: 48,
    alpha: 0.96,
    blur: 14,
    scale: -220,
    displace: 0.18,
    blend: 'difference',
    x: 'R',
    y: 'B',
    r: 0,
    g: 12,
    b: 24,
    frost: 0.03,
    saturation: 2.0,
};

class NavDisplacement {
    constructor() {
        this.filterEl = null;
        this.debugEl = null;
    }

    init() {
        this.filterEl = document.getElementById('navFilterSvg');
        this.debugEl = document.querySelector('.nav-displacement-debug');
        if (!this.filterEl) return;
        this.buildDisplacementImage();
        this.applyConfig();
    }

    buildDisplacementImage() {
        const config = navConfig;
        const border = Math.min(config.width, config.height) * (config.border * 0.5);

        const svgMarkup = `
            <svg class="displacement-image" viewBox="0 0 ${config.width} ${config.height}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="navRed" x1="100%" y1="0%" x2="0%" y2="0%">
                        <stop offset="0%" stop-color="#000"/>
                        <stop offset="100%" stop-color="red"/>
                    </linearGradient>
                    <linearGradient id="navBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#000"/>
                        <stop offset="100%" stop-color="blue"/>
                    </linearGradient>
                </defs>
                <rect x="0" y="0" width="${config.width}" height="${config.height}" fill="black"></rect>
                <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#navRed)" />
                <rect x="0" y="0" width="${config.width}" height="${config.height}" rx="${config.radius}" fill="url(#navBlue)" style="mix-blend-mode: ${config.blend}" />
                <rect x="${border}" y="${border}" width="${config.width - border * 2}" height="${config.height - border * 2}" rx="${config.radius}" fill="hsl(0 0% ${config.lightness}% / ${config.alpha})" style="filter:blur(${config.blur}px)" />
            </svg>
        `;

        const temp = document.createElement('div');
        temp.innerHTML = svgMarkup.trim();
        const svgEl = temp.querySelector('svg');
        const serialized = new XMLSerializer().serializeToString(svgEl);
        const encoded = encodeURIComponent(serialized);
        const dataUri = `data:image/svg+xml,${encoded}`;

        const feImages = this.filterEl.querySelectorAll('feImage');
        feImages.forEach(fe => fe.setAttribute('href', dataUri));

        const displaceMaps = this.filterEl.querySelectorAll('feDisplacementMap');
        displaceMaps.forEach(dm => {
            dm.setAttribute('xChannelSelector', config.x);
            dm.setAttribute('yChannelSelector', config.y);
        });

        const redChannel = this.filterEl.querySelector('#navRedChannel');
        const greenChannel = this.filterEl.querySelector('#navGreenChannel');
        const blueChannel = this.filterEl.querySelector('#navBlueChannel');

        if (redChannel) redChannel.setAttribute('scale', config.scale + config.r);
        if (greenChannel) greenChannel.setAttribute('scale', config.scale + config.g);
        if (blueChannel) blueChannel.setAttribute('scale', config.scale + config.b);

        const gaussianBlur = this.filterEl.querySelector('feGaussianBlur');
        if (gaussianBlur) gaussianBlur.setAttribute('stdDeviation', config.displace);
    }

    applyConfig() {
        const config = navConfig;
        document.documentElement.style.setProperty('--nav-width', config.width);
        document.documentElement.style.setProperty('--nav-height', config.height);
        document.documentElement.style.setProperty('--nav-radius', config.radius);
        document.documentElement.style.setProperty('--nav-frost', config.frost);
        document.documentElement.style.setProperty('--nav-saturation', config.saturation);
    }

    setWidth(w) {
        navConfig.width = w;
        document.documentElement.style.setProperty('--nav-width', w);
        this.buildDisplacementImage();
    }
}

const navDisplacement = new NavDisplacement();
export default navDisplacement;
