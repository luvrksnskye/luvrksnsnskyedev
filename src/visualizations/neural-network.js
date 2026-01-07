/**
 * COGNEX VIDI - NEURAL NETWORK VISUALIZATION
 * Exact replica using SVG
 * 
 * - Nodos rectangulares con barras verticales grises
 * - 4 capas de red neuronal
 * - Conexiones entre capas
 * - Partículas fluyendo
 * - Pan/Zoom
 * - Click para info de SKYE
 */

export default class NeuralNetworkVisualization {
    
    constructor(container, nodes, stats) {
        this.container = container;
        this.svg = null;
        this.g = null; // Main transform group
        
        this.width = 0;
        this.height = 0;
        
        // Transform
        this.transform = { x: 0, y: 0, scale: 1 };
        this.minScale = 0.5;
        this.maxScale = 2;
        
        // Interaction
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.selectedNode = null;
        
        // Data - SKYE neural regions
        this.nodes = this.initNodes();
        this.stats = stats || [];
        this.connections = [];
        this.particles = [];
        
        // Animation
        this.animId = null;
        this.isActive = false;
        this.time = 0;
        
        this.init();
    }
    
    initNodes() {
        // 4 layers of nodes like in the image
        // Each node has bars (heights 0-1) for the vertical bar display
        
        const nodes = [];
        
        // Layer 1 (4 nodes) - Input/Sensory
        const layer1 = [
            { id: 'prefrontal', label: 'PREFRONTAL CORTEX', status: 'optimal', bars: [0.9, 0.6, 0.8, 0.5, 0.7, 0.9] },
            { id: 'temporal', label: 'TEMPORAL LOBE', status: 'active', bars: [0.6, 0.8, 0.5, 0.9, 0.6, 0.7] },
            { id: 'parietal', label: 'PARIETAL LOBE', status: 'optimal', bars: [0.8, 0.5, 0.7, 0.6, 0.9, 0.5] },
            { id: 'occipital', label: 'OCCIPITAL LOBE', status: 'active', bars: [0.5, 0.7, 0.9, 0.6, 0.8, 0.7] }
        ];
        
        // Layer 2 (4 nodes) - Processing
        const layer2 = [
            { id: 'motor', label: 'MOTOR CORTEX', status: 'calibrating', bars: [0.7, 0.9, 0.6, 0.8, 0.5] },
            { id: 'cerebellum', label: 'CEREBELLUM', status: 'active', bars: [0.8, 0.6, 0.7, 0.9, 0.6] },
            { id: 'limbic', label: 'LIMBIC SYSTEM', status: 'optimal', bars: [0.6, 0.8, 0.9, 0.7, 0.8] },
            { id: 'hippocampus', label: 'HIPPOCAMPUS', status: 'recovering', bars: [0.9, 0.7, 0.6, 0.8, 0.5] }
        ];
        
        // Layer 3 (3 nodes) - Integration
        const layer3 = [
            { id: 'brainstem', label: 'BRAINSTEM', status: 'optimal', bars: [0.8, 0.7, 0.9, 0.6, 0.8, 0.7] },
            { id: 'broca', label: "BROCA'S AREA", status: 'active', bars: [0.6, 0.9, 0.7, 0.8, 0.6, 0.9] },
            { id: 'wernicke', label: "WERNICKE'S AREA", status: 'active', bars: [0.9, 0.6, 0.8, 0.7, 0.9, 0.6] }
        ];
        
        // Layer 4 (2 nodes) - Output
        const layer4 = [
            { id: 'creative', label: 'CREATIVE CORTEX', status: 'exceptional', bars: [0.7, 0.8, 0.6, 0.9, 0.7] },
            { id: 'consciousness', label: 'CONSCIOUSNESS', status: 'optimal', bars: [0.8, 0.6, 0.9, 0.7, 0.8] }
        ];
        
        // Position nodes
        const layers = [layer1, layer2, layer3, layer4];
        const layerX = [0.12, 0.32, 0.52, 0.72];
        
        layers.forEach((layer, li) => {
            const count = layer.length;
            layer.forEach((node, ni) => {
                const spacing = 0.8 / (count + 1);
                node.x = layerX[li];
                node.y = 0.1 + spacing * (ni + 1);
                node.layer = li;
                nodes.push(node);
            });
        });
        
        // Define connections (each node connects to all in next layer)
        nodes.forEach(node => {
            node.connections = [];
            const nextLayer = nodes.filter(n => n.layer === node.layer + 1);
            nextLayer.forEach(target => {
                node.connections.push(target.id);
            });
        });
        
        return nodes;
    }
    
    init() {
        if (!this.container) return false;
        
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Create SVG
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.svg.style.display = 'block';
        
        // Main group for transformations
        this.g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svg.appendChild(this.g);
        
        // Connections group (behind nodes)
        this.connGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.g.appendChild(this.connGroup);
        
        // Particles group
        this.particleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.g.appendChild(this.particleGroup);
        
        // Nodes group
        this.nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.g.appendChild(this.nodeGroup);
        
        this.container.appendChild(this.svg);
        
        this.drawConnections();
        this.drawNodes();
        this.createParticles();
        this.bindEvents();
        this.centerView();
        
        console.log('[COGNEX] Neural visualization initialized');
        return true;
    }
    
    centerView() {
        this.transform.x = this.width * 0.08;
        this.transform.y = this.height * 0.02;
        this.transform.scale = 0.9;
        this.applyTransform();
        this.updateZoom();
    }
    
    applyTransform() {
        this.g.setAttribute('transform', 
            `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`
        );
    }
    
    drawConnections() {
        this.connGroup.innerHTML = '';
        
        this.nodes.forEach(node => {
            if (!node.connections) return;
            
            const x1 = node.x * this.width;
            const y1 = node.y * this.height;
            
            node.connections.forEach(targetId => {
                const target = this.nodes.find(n => n.id === targetId);
                if (!target) return;
                
                const x2 = target.x * this.width;
                const y2 = target.y * this.height;
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', x1);
                line.setAttribute('y1', y1);
                line.setAttribute('x2', x2);
                line.setAttribute('y2', y2);
                line.setAttribute('stroke', 'rgba(255,255,255,0.2)');
                line.setAttribute('stroke-width', '1');
                line.classList.add('cv-conn');
                line.dataset.from = node.id;
                line.dataset.to = targetId;
                
                this.connGroup.appendChild(line);
                
                // Store connection data for particles
                this.connections.push({ from: node, to: target, line });
            });
        });
    }
    
    drawNodes() {
        this.nodeGroup.innerHTML = '';
        
        // Node dimensions
        const nodeW = 50;
        const nodeH = 38;
        const barW = 3;
        const barGap = 2;
        const markerH = 4;
        
        this.nodes.forEach(node => {
            const x = node.x * this.width;
            const y = node.y * this.height;
            
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.classList.add('cv-node');
            g.dataset.id = node.id;
            g.setAttribute('transform', `translate(${x - nodeW/2}, ${y - nodeH/2})`);
            
            // Background
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('width', nodeW);
            bg.setAttribute('height', nodeH);
            bg.setAttribute('fill', '#0a0a0a');
            bg.classList.add('cv-node-bg');
            g.appendChild(bg);
            
            // Border
            const border = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            border.setAttribute('width', nodeW);
            border.setAttribute('height', nodeH);
            border.setAttribute('fill', 'none');
            border.setAttribute('stroke', 'rgba(255,255,255,0.3)');
            border.setAttribute('stroke-width', '1');
            border.classList.add('cv-node-border');
            g.appendChild(border);
            
            // Top marker (small rectangle)
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            marker.setAttribute('x', nodeW/2 - 4);
            marker.setAttribute('y', -markerH - 1);
            marker.setAttribute('width', 8);
            marker.setAttribute('height', markerH);
            marker.setAttribute('fill', 'rgba(255,255,255,0.4)');
            marker.classList.add('cv-node-marker');
            g.appendChild(marker);
            
            // Vertical bars inside
            const bars = node.bars || [0.6, 0.8, 0.5, 0.9, 0.7];
            const totalBarsW = bars.length * barW + (bars.length - 1) * barGap;
            const startX = (nodeW - totalBarsW) / 2;
            const maxBarH = nodeH - 8;
            
            bars.forEach((h, i) => {
                const barX = startX + i * (barW + barGap);
                const barH = maxBarH * h;
                const barY = nodeH - 4 - barH;
                
                const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bar.setAttribute('x', barX);
                bar.setAttribute('y', barY);
                bar.setAttribute('width', barW);
                bar.setAttribute('height', barH);
                bar.setAttribute('fill', i % 2 === 0 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)');
                bar.classList.add('cv-node-bar');
                bar.dataset.index = i;
                g.appendChild(bar);
            });
            
            // Store reference
            node.element = g;
            node.nodeW = nodeW;
            node.nodeH = nodeH;
            
            this.nodeGroup.appendChild(g);
        });
    }
    
    createParticles() {
        this.particles = [];
        
        this.connections.forEach(conn => {
            // 2-3 particles per connection
            const count = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('r', 1.5 + Math.random());
                circle.setAttribute('fill', 'rgba(255,255,255,0.7)');
                circle.classList.add('cv-particle');
                this.particleGroup.appendChild(circle);
                
                this.particles.push({
                    el: circle,
                    conn: conn,
                    progress: Math.random(),
                    speed: 0.004 + Math.random() * 0.004
                });
            }
        });
    }
    
    bindEvents() {
        // Mouse
        this.svg.addEventListener('mousedown', e => this.onMouseDown(e));
        this.svg.addEventListener('mousemove', e => this.onMouseMove(e));
        this.svg.addEventListener('mouseup', () => this.onMouseUp());
        this.svg.addEventListener('mouseleave', () => this.onMouseUp());
        this.svg.addEventListener('wheel', e => this.onWheel(e));
        
        // Click on nodes
        this.nodeGroup.addEventListener('click', e => this.onNodeClick(e));
        
        // Touch
        this.svg.addEventListener('touchstart', e => this.onTouchStart(e));
        this.svg.addEventListener('touchmove', e => this.onTouchMove(e));
        this.svg.addEventListener('touchend', () => this.onTouchEnd());
        
        // Zoom buttons
        const zoomIn = document.getElementById('cvZoomIn');
        const zoomOut = document.getElementById('cvZoomOut');
        const zoomReset = document.getElementById('cvZoomReset');
        
        if (zoomIn) zoomIn.onclick = () => this.zoomIn();
        if (zoomOut) zoomOut.onclick = () => this.zoomOut();
        if (zoomReset) zoomReset.onclick = () => this.centerView();
        
        // Resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.svg.style.cursor = 'grabbing';
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        
        this.transform.x += dx;
        this.transform.y += dy;
        this.applyTransform();
        
        this.dragStart = { x: e.clientX, y: e.clientY };
    }
    
    onMouseUp() {
        this.isDragging = false;
        this.svg.style.cursor = 'grab';
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.transform.scale * delta));
        
        const rect = this.svg.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const ratio = newScale / this.transform.scale;
        this.transform.x = mx - (mx - this.transform.x) * ratio;
        this.transform.y = my - (my - this.transform.y) * ratio;
        this.transform.scale = newScale;
        
        this.applyTransform();
        this.updateZoom();
    }
    
    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const dx = e.touches[0].clientX - this.dragStart.x;
            const dy = e.touches[0].clientY - this.dragStart.y;
            this.transform.x += dx;
            this.transform.y += dy;
            this.applyTransform();
            this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    onNodeClick(e) {
        const nodeEl = e.target.closest('.cv-node');
        if (!nodeEl) return;
        
        const nodeId = nodeEl.dataset.id;
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        this.selectedNode = node;
        this.showPopup(node, e.clientX, e.clientY);
    }
    
    showPopup(node, x, y) {
        const popup = document.getElementById('cvPopup');
        if (!popup) return;
        
        const rect = this.container.getBoundingClientRect();
        popup.style.left = (x - rect.left + 10) + 'px';
        popup.style.top = (y - rect.top - 60) + 'px';
        popup.classList.add('show');
        
        const title = popup.querySelector('.cv-popup-title');
        if (title) title.textContent = node.label;
        
        const rows = popup.querySelectorAll('.cv-popup-row');
        if (rows[0]) rows[0].querySelector('.cv-popup-val').textContent = node.status.toUpperCase();
        if (rows[1]) rows[1].querySelector('.cv-popup-val').textContent = node.connections?.length || 0;
        if (rows[2]) rows[2].querySelector('.cv-popup-val').textContent = node.bars?.length || 0;
        
        // Hide after 3 seconds
        setTimeout(() => popup.classList.remove('show'), 3000);
    }
    
    zoomIn() {
        this.transform.scale = Math.min(this.maxScale, this.transform.scale * 1.2);
        this.applyTransform();
        this.updateZoom();
    }
    
    zoomOut() {
        this.transform.scale = Math.max(this.minScale, this.transform.scale * 0.8);
        this.applyTransform();
        this.updateZoom();
    }
    
    updateZoom() {
        const el = document.getElementById('cvZoomLvl');
        if (el) el.textContent = Math.round(this.transform.scale * 100) + '%';
    }
    
    onResize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    }
    
    start() {
        this.isActive = true;
        this.animate();
        console.log('[COGNEX] Animation started');
    }
    
    stop() {
        this.isActive = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        console.log('[COGNEX] Animation stopped');
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.animId = requestAnimationFrame(() => this.animate());
        this.time += 0.016;
        
        // Animate particles
        this.particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;
            
            const x1 = p.conn.from.x * this.width;
            const y1 = p.conn.from.y * this.height;
            const x2 = p.conn.to.x * this.width;
            const y2 = p.conn.to.y * this.height;
            
            const x = x1 + (x2 - x1) * p.progress;
            const y = y1 + (y2 - y1) * p.progress;
            
            p.el.setAttribute('cx', x);
            p.el.setAttribute('cy', y);
        });
        
        // Animate bars slightly
        this.nodes.forEach(node => {
            if (!node.element) return;
            const bars = node.element.querySelectorAll('.cv-node-bar');
            bars.forEach((bar, i) => {
                const baseH = node.bars[i] || 0.5;
                const anim = Math.sin(this.time * 2 + i * 0.5 + node.x * 5) * 0.08;
                const newH = baseH * (1 + anim);
                const maxH = node.nodeH - 8;
                const h = maxH * newH;
                bar.setAttribute('height', h);
                bar.setAttribute('y', node.nodeH - 4 - h);
            });
        });
        
        // Update time bar
        const timeFill = document.getElementById('cvTimeFill');
        if (timeFill) {
            const progress = (this.time % 60) / 60 * 100;
            timeFill.style.width = progress + '%';
        }
    }
    
    destroy() {
        this.stop();
        if (this.svg && this.svg.parentNode) {
            this.svg.parentNode.removeChild(this.svg);
        }
        console.log('[COGNEX] Destroyed');
    }
}
