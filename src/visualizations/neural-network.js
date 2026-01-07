/**
 * NEURAL NETWORK VISUALIZATION - COGNEX VIDI EXACT REPLICA
 * 
 * Nodos rectangulares con barras verticales grises
 * Conexiones de líneas blancas
 * Pan/Zoom interactivo
 * Click en nodos para info
 */

export default class NeuralNetworkVisualization {
    
    constructor(canvasElement, nodes, stats) {
        this.canvas = canvasElement;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        
        // Transform (pan/zoom)
        this.transform = {
            x: 0,
            y: 0,
            scale: 1
        };
        
        this.minScale = 0.4;
        this.maxScale = 2.5;
        
        // Interaction
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.lastMouse = { x: 0, y: 0 };
        
        // Selection
        this.selectedNode = null;
        this.hoveredNode = null;
        
        // Data
        this.nodes = this.initNodes(nodes);
        this.stats = stats || [];
        this.particles = [];
        
        // Animation
        this.animationFrame = null;
        this.isActive = false;
        this.time = 0;
        
        // Callbacks
        this.onNodeSelect = null;
        
        this.init();
    }
    
    initNodes(nodes) {
        // Default neural network nodes
        const defaultNodes = [
            // Layer 1 (input) - left side
            { id: 'n1', x: 0.12, y: 0.15, bars: [0.8, 0.6, 0.9, 0.5, 0.7], connections: ['n5', 'n6', 'n7'] },
            { id: 'n2', x: 0.12, y: 0.35, bars: [0.6, 0.8, 0.5, 0.9, 0.6], connections: ['n5', 'n6', 'n7', 'n8'] },
            { id: 'n3', x: 0.12, y: 0.55, bars: [0.9, 0.5, 0.7, 0.6, 0.8], connections: ['n6', 'n7', 'n8'] },
            { id: 'n4', x: 0.12, y: 0.75, bars: [0.5, 0.7, 0.8, 0.6, 0.9], connections: ['n7', 'n8'] },
            
            // Layer 2 (hidden 1)
            { id: 'n5', x: 0.28, y: 0.20, bars: [0.7, 0.9, 0.6, 0.8], connections: ['n9', 'n10', 'n11'] },
            { id: 'n6', x: 0.28, y: 0.40, bars: [0.8, 0.6, 0.7, 0.9], connections: ['n9', 'n10', 'n11'] },
            { id: 'n7', x: 0.28, y: 0.60, bars: [0.6, 0.8, 0.9, 0.7], connections: ['n9', 'n10', 'n11'] },
            { id: 'n8', x: 0.28, y: 0.80, bars: [0.9, 0.7, 0.6, 0.8], connections: ['n10', 'n11'] },
            
            // Layer 3 (hidden 2)
            { id: 'n9', x: 0.44, y: 0.25, bars: [0.8, 0.7, 0.9, 0.6, 0.8], connections: ['n12', 'n13'] },
            { id: 'n10', x: 0.44, y: 0.50, bars: [0.6, 0.9, 0.7, 0.8, 0.6], connections: ['n12', 'n13'] },
            { id: 'n11', x: 0.44, y: 0.75, bars: [0.9, 0.6, 0.8, 0.7, 0.9], connections: ['n12', 'n13'] },
            
            // Layer 4 (output)
            { id: 'n12', x: 0.60, y: 0.35, bars: [0.7, 0.8, 0.6, 0.9], connections: [] },
            { id: 'n13', x: 0.60, y: 0.65, bars: [0.8, 0.6, 0.9, 0.7], connections: [] }
        ];
        
        return nodes && nodes.length > 0 ? nodes : defaultNodes;
    }
    
    init() {
        if (!this.canvas) {
            console.error('[VIDI] Canvas not provided');
            return false;
        }
        
        this.ctx = this.canvas.getContext('2d');
        if (!this.ctx) {
            console.error('[VIDI] Could not get context');
            return false;
        }
        
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.centerView();
        
        console.log('[VIDI] Neural visualization initialized');
        return true;
    }
    
    resize() {
        const parent = this.canvas.parentElement;
        if (!parent) return;
        
        const rect = parent.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    centerView() {
        // Center network in viewport
        this.transform.x = this.width * 0.15;
        this.transform.y = this.height * 0.05;
        this.transform.scale = 0.85;
        this.updateZoomDisplay();
    }
    
    createParticles() {
        this.particles = [];
        
        this.nodes.forEach(node => {
            if (!node.connections) return;
            
            node.connections.forEach(targetId => {
                const target = this.nodes.find(n => n.id === targetId);
                if (!target) return;
                
                // 2-3 particles per connection
                const count = 2 + Math.floor(Math.random() * 2);
                for (let i = 0; i < count; i++) {
                    this.particles.push({
                        from: node,
                        to: target,
                        progress: Math.random(),
                        speed: 0.003 + Math.random() * 0.004,
                        size: 1.5 + Math.random() * 1
                    });
                }
            });
        });
    }
    
    bindEvents() {
        // Mouse
        this.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', e => this.onWheel(e));
        this.canvas.addEventListener('click', e => this.onClick(e));
        
        // Touch
        this.canvas.addEventListener('touchstart', e => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', e => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.onTouchEnd());
        
        // Resize
        window.addEventListener('resize', () => this.resize());
        
        // Zoom buttons
        const zoomIn = document.getElementById('vidiZoomIn');
        const zoomOut = document.getElementById('vidiZoomOut');
        const zoomReset = document.getElementById('vidiZoomReset');
        
        if (zoomIn) zoomIn.addEventListener('click', () => this.zoomIn());
        if (zoomOut) zoomOut.addEventListener('click', () => this.zoomOut());
        if (zoomReset) zoomReset.addEventListener('click', () => this.centerView());
    }
    
    onMouseDown(e) {
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.canvas.style.cursor = 'grabbing';
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.lastMouse = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        if (this.isDragging) {
            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            this.transform.x += dx;
            this.transform.y += dy;
            this.dragStart = { x: e.clientX, y: e.clientY };
        } else {
            this.hoveredNode = this.getNodeAt(this.lastMouse.x, this.lastMouse.y);
            this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'grab';
    }
    
    onWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.transform.scale * delta));
        
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        
        const ratio = newScale / this.transform.scale;
        this.transform.x = mx - (mx - this.transform.x) * ratio;
        this.transform.y = my - (my - this.transform.y) * ratio;
        this.transform.scale = newScale;
        
        this.updateZoomDisplay();
    }
    
    onClick(e) {
        if (this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const node = this.getNodeAt(x, y);
        
        if (node) {
            this.selectedNode = node;
            this.showNodePopup(node, x, y);
            if (this.onNodeSelect) this.onNodeSelect(node);
        } else {
            this.selectedNode = null;
            this.hideNodePopup();
        }
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
            this.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }
    
    onTouchEnd() {
        this.isDragging = false;
    }
    
    zoomIn() {
        this.transform.scale = Math.min(this.maxScale, this.transform.scale * 1.2);
        this.updateZoomDisplay();
    }
    
    zoomOut() {
        this.transform.scale = Math.max(this.minScale, this.transform.scale * 0.8);
        this.updateZoomDisplay();
    }
    
    updateZoomDisplay() {
        const el = document.getElementById('vidiZoomLevel');
        if (el) el.textContent = Math.round(this.transform.scale * 100) + '%';
    }
    
    getNodeAt(screenX, screenY) {
        const worldX = (screenX - this.transform.x) / this.transform.scale;
        const worldY = (screenY - this.transform.y) / this.transform.scale;
        
        // Node size
        const nodeW = 45;
        const nodeH = 35;
        
        for (const node of this.nodes) {
            const nx = node.x * this.width;
            const ny = node.y * this.height;
            
            if (worldX >= nx - nodeW/2 && worldX <= nx + nodeW/2 &&
                worldY >= ny - nodeH/2 && worldY <= ny + nodeH/2) {
                return node;
            }
        }
        return null;
    }
    
    showNodePopup(node, x, y) {
        const popup = document.getElementById('vidiNodePopup');
        if (!popup) return;
        
        // Position popup
        popup.style.left = (x + 15) + 'px';
        popup.style.top = (y - 50) + 'px';
        popup.classList.add('active');
        
        // Update content
        const title = popup.querySelector('.vidi-popup-title');
        if (title) title.textContent = node.label || node.id.toUpperCase();
        
        const rows = popup.querySelectorAll('.vidi-popup-row');
        if (rows.length >= 3) {
            rows[0].querySelector('.vidi-popup-value').textContent = node.status || 'ACTIVE';
            rows[1].querySelector('.vidi-popup-value').textContent = (node.connections?.length || 0) + ' LINKS';
            rows[2].querySelector('.vidi-popup-value').textContent = (node.bars?.length || 0) + ' BARS';
        }
        
        const desc = popup.querySelector('.vidi-popup-desc');
        if (desc) desc.textContent = node.description || 'Neural processing node. Click to analyze data streams.';
    }
    
    hideNodePopup() {
        const popup = document.getElementById('vidiNodePopup');
        if (popup) popup.classList.remove('active');
    }
    
    start() {
        this.isActive = true;
        this.animate();
        console.log('[VIDI] Animation started');
    }
    
    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        console.log('[VIDI] Animation stopped');
    }
    
    animate() {
        if (!this.isActive || !this.ctx) return;
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.time += 0.016;
        
        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Apply transform
        this.ctx.save();
        this.ctx.translate(this.transform.x, this.transform.y);
        this.ctx.scale(this.transform.scale, this.transform.scale);
        
        // Draw
        this.drawConnections();
        this.drawParticles();
        this.drawNodes();
        
        this.ctx.restore();
        
        // Update time bar
        this.updateTimeBar();
    }
    
    drawConnections() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.ctx.lineWidth = 1 / this.transform.scale;
        
        this.nodes.forEach(node => {
            if (!node.connections) return;
            
            const x1 = node.x * this.width;
            const y1 = node.y * this.height;
            
            node.connections.forEach(targetId => {
                const target = this.nodes.find(n => n.id === targetId);
                if (!target) return;
                
                const x2 = target.x * this.width;
                const y2 = target.y * this.height;
                
                // Highlight if selected
                if (this.selectedNode && (this.selectedNode.id === node.id || this.selectedNode.id === targetId)) {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                    this.ctx.lineWidth = 1.5 / this.transform.scale;
                } else {
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                    this.ctx.lineWidth = 1 / this.transform.scale;
                }
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            });
        });
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;
            
            const x1 = p.from.x * this.width;
            const y1 = p.from.y * this.height;
            const x2 = p.to.x * this.width;
            const y2 = p.to.y * this.height;
            
            const x = x1 + (x2 - x1) * p.progress;
            const y = y1 + (y2 - y1) * p.progress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, p.size / this.transform.scale, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            this.ctx.fill();
        });
    }
    
    drawNodes() {
        this.nodes.forEach(node => {
            const x = node.x * this.width;
            const y = node.y * this.height;
            
            // Node dimensions - rectangular like Cognex
            const nodeW = 45;
            const nodeH = 35;
            const barW = 3;
            const barGap = 2;
            const bars = node.bars || [0.6, 0.8, 0.5, 0.9, 0.7];
            
            // Background
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(x - nodeW/2, y - nodeH/2, nodeW, nodeH);
            
            // Border
            const isSelected = this.selectedNode && this.selectedNode.id === node.id;
            const isHovered = this.hoveredNode && this.hoveredNode.id === node.id;
            
            this.ctx.strokeStyle = isSelected || isHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1 / this.transform.scale;
            this.ctx.strokeRect(x - nodeW/2, y - nodeH/2, nodeW, nodeH);
            
            // Draw vertical bars inside - COGNEX STYLE
            const totalBarsW = bars.length * barW + (bars.length - 1) * barGap;
            const startX = x - totalBarsW / 2;
            const maxBarH = nodeH - 8;
            
            bars.forEach((h, i) => {
                const barX = startX + i * (barW + barGap);
                const barH = maxBarH * h;
                const barY = y + nodeH/2 - 4 - barH;
                
                // Animate slightly
                const anim = Math.sin(this.time * 2 + i * 0.8 + node.x * 5) * 0.08;
                const finalH = barH * (1 + anim);
                
                // Bar color - alternating brightness
                const brightness = 0.35 + (i % 2) * 0.2 + Math.sin(this.time * 3 + i) * 0.1;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                this.ctx.fillRect(barX, y + nodeH/2 - 4 - finalH, barW, finalH);
            });
            
            // Small label marker at top
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.fillRect(x - 3, y - nodeH/2 - 3, 6, 3);
        });
    }
    
    updateTimeBar() {
        const fill = document.getElementById('vidiTimeFill');
        if (fill) {
            const progress = (this.time % 60) / 60 * 100;
            fill.style.width = progress + '%';
        }
    }
    
    destroy() {
        this.stop();
        window.removeEventListener('resize', this.resize);
        this.ctx = null;
        this.particles = [];
        console.log('[VIDI] Destroyed');
    }
}
