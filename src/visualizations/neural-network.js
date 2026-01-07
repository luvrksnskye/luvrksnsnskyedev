

export default class NeuralNetworkVisualization {
    
    constructor(container) {
        this.container = container;
        this.svg = null;
        this.g = null;
        this.simulation = null;
        
        this.nodes = [];
        this.edges = [];
        this.particles = [];
        
        this.edgeElements = null;
        this.nodeElements = null;
        this.labelElements = null;
        this.particleElements = null;
        
        this.width = 0;
        this.height = 0;
        this.currentZoom = 1;
        
        this.isActive = false;
        this.time = 0;
        
        this.init();
    }
    
    init() {
        if (!this.container) return false;
        
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        
        this.generateData();
        this.createSVG();
        this.createSimulation();
        this.createElements();
        this.bindEvents();
        this.updateStats();
        
        console.log('[BLACKOPS] Initialized:', this.nodes.length, 'nodes,', this.edges.length, 'edges');
        return true;
    }
    
    generateData() {
        const sectors = ['CORTEX', 'LIMBIC', 'MOTOR', 'SENSORY', 'MEMORY', 'PROCESS', 'CONTROL', 'NEURAL'];
        this.nodes = [];
        let nodeId = 0;
        
        sectors.forEach(sector => {
            const count = 10 + Math.floor(Math.random() * 5);
            for (let i = 0; i < count; i++) {
                const isCritical = Math.random() < 0.04; // Only 4% critical
                this.nodes.push({
                    id: nodeId++,
                    name: `${sector}-${String(i + 1).padStart(3, '0')}`,
                    sector: sector,
                    status: isCritical ? 'critical' : (Math.random() < 0.25 ? 'active' : 'nominal'),
                    links: 0
                });
            }
        });
        
        this.edges = [];
        this.nodes.forEach((node, i) => {
            const connectionCount = 2 + Math.floor(Math.random() * 3);
            for (let c = 0; c < connectionCount; c++) {
                let targetIdx;
                if (Math.random() < 0.6) {
                    const sectorNodes = this.nodes.filter(n => n.sector === node.sector && n.id !== node.id);
                    if (sectorNodes.length > 0) {
                        targetIdx = sectorNodes[Math.floor(Math.random() * sectorNodes.length)].id;
                    }
                }
                if (targetIdx === undefined) {
                    targetIdx = Math.floor(Math.random() * this.nodes.length);
                }
                
                if (targetIdx !== i) {
                    const exists = this.edges.some(e => 
                        (e.source === i && e.target === targetIdx) ||
                        (e.source === targetIdx && e.target === i)
                    );
                    if (!exists) {
                        this.edges.push({ source: i, target: targetIdx });
                        this.nodes[i].links++;
                        if (this.nodes[targetIdx]) this.nodes[targetIdx].links++;
                    }
                }
            }
        });
    }
    
    createSVG() {
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('display', 'block');
        
        this.g = this.svg.append('g');
        
        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([0.2, 4])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
                this.currentZoom = event.transform.k;
                this.updateZoomLevel();
            });
        
        this.svg.call(zoom);
        this.zoomBehavior = zoom;
    }
    
    createSimulation() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.edges).id(d => d.id).distance(50).strength(0.4))
            .force('charge', d3.forceManyBody().strength(-60))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(12))
            .on('tick', () => this.tick());
    }
    
    createElements() {
        // Edges
        this.edgeElements = this.g.append('g')
            .attr('class', 'edges')
            .selectAll('path')
            .data(this.edges)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255,255,255,0.12)')
            .attr('stroke-width', 0.5);
        
        // Particles
        this.particles = [];
        this.edges.slice(0, Math.floor(this.edges.length * 0.15)).forEach(edge => {
            this.particles.push({
                edge: edge,
                progress: Math.random(),
                speed: 0.004 + Math.random() * 0.004
            });
        });
        
        this.particleElements = this.g.append('g')
            .attr('class', 'particles')
            .selectAll('circle')
            .data(this.particles)
            .enter()
            .append('circle')
            .attr('r', 1.5)
            .attr('fill', 'rgba(255,255,255,0.5)');
        
        // Nodes
        this.nodeElements = this.g.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('r', d => d.status === 'critical' ? 5 : 4)
            .attr('fill', d => {
                if (d.status === 'critical') return '#ff0000';
                if (d.status === 'active') return 'rgba(255,255,255,0.8)';
                return 'rgba(255,255,255,0.4)';
            })
            .attr('stroke', 'rgba(255,255,255,0.2)')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', (event, d) => this.dragStart(event, d))
                .on('drag', (event, d) => this.dragging(event, d))
                .on('end', (event, d) => this.dragEnd(event, d)))
            .on('mouseenter', (event, d) => this.highlightNode(d, true))
            .on('mouseleave', (event, d) => this.highlightNode(d, false))
            .on('click', (event, d) => this.showPopup(d, event));
        
        // Labels
        this.labelElements = this.g.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(this.nodes.filter(n => n.links > 5))
            .enter()
            .append('text')
            .text(d => d.name)
            .attr('font-family', 'Share Tech Mono, monospace')
            .attr('font-size', '6px')
            .attr('fill', 'rgba(255,255,255,0.3)')
            .attr('text-anchor', 'middle')
            .style('pointer-events', 'none');
    }
    
    tick() {
        // Edges
        this.edgeElements.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.2;
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        
        // Nodes
        this.nodeElements.attr('cx', d => d.x).attr('cy', d => d.y);
        
        // Labels
        this.labelElements.attr('x', d => d.x).attr('y', d => d.y - 10);
        
        // Particles
        this.particleElements.each((p, i, nodes) => {
            p.progress += p.speed;
            if (p.progress > 1) p.progress = 0;
            
            const source = p.edge.source;
            const target = p.edge.target;
            const t = p.progress;
            
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) || 1;
            const offsetX = -dy / dr * 15;
            const offsetY = dx / dr * 15;
            
            const x = (1-t)*(1-t)*source.x + 2*(1-t)*t*(midX+offsetX) + t*t*target.x;
            const y = (1-t)*(1-t)*source.y + 2*(1-t)*t*(midY+offsetY) + t*t*target.y;
            
            d3.select(nodes[i]).attr('cx', x).attr('cy', y);
        });
    }
    
    dragStart(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    dragging(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    dragEnd(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
    }
    
    highlightNode(node, active) {
        this.edgeElements.attr('stroke', d => {
            if (active && (d.source.id === node.id || d.target.id === node.id)) {
                return 'rgba(255,255,255,0.4)';
            }
            return 'rgba(255,255,255,0.12)';
        }).attr('stroke-width', d => {
            if (active && (d.source.id === node.id || d.target.id === node.id)) {
                return 1;
            }
            return 0.5;
        });
        
        if (active) {
            this.nodeElements.filter(d => d.id === node.id)
                .attr('r', 8)
                .attr('stroke', 'rgba(255,255,255,0.6)');
        } else {
            this.nodeElements.filter(d => d.id === node.id)
                .attr('r', d => d.status === 'critical' ? 5 : 4)
                .attr('stroke', 'rgba(255,255,255,0.2)');
        }
    }
    
    showPopup(node, event) {
        const popup = document.getElementById('cvNodeInfo');
        if (!popup) return;
        
        const rect = this.container.getBoundingClientRect();
        popup.style.left = (event.clientX - rect.left + 10) + 'px';
        popup.style.top = (event.clientY - rect.top - 20) + 'px';
        
        const title = popup.querySelector('.cv-node-info-title');
        if (title) title.textContent = node.name;
        
        const rows = popup.querySelectorAll('.cv-node-info-row');
        if (rows[0]) rows[0].querySelector('.cv-node-info-value').textContent = node.status.toUpperCase();
        if (rows[1]) rows[1].querySelector('.cv-node-info-value').textContent = node.links + ' LINKS';
        if (rows[2]) rows[2].querySelector('.cv-node-info-value').textContent = node.sector;
        
        popup.classList.add('visible');
        
        clearTimeout(this.popupTimeout);
        this.popupTimeout = setTimeout(() => popup.classList.remove('visible'), 3000);
    }
    
    updateStats() {
        const nodeCount = document.getElementById('nodeCount');
        const edgeCount = document.getElementById('edgeCount');
        const criticalCount = document.getElementById('criticalCount');
        
        if (nodeCount) nodeCount.textContent = this.nodes.length;
        if (edgeCount) edgeCount.textContent = this.edges.length;
        if (criticalCount) criticalCount.textContent = this.nodes.filter(n => n.status === 'critical').length;
    }
    
    updateZoomLevel() {
        const el = document.getElementById('cvZoomLvl');
        if (el) el.textContent = Math.round(this.currentZoom * 100) + '%';
    }
    
    bindEvents() {
        const zoomIn = document.getElementById('cvZoomIn');
        const zoomOut = document.getElementById('cvZoomOut');
        const zoomReset = document.getElementById('cvZoomReset');
        
        if (zoomIn) zoomIn.onclick = () => this.svg.transition().call(this.zoomBehavior.scaleBy, 1.3);
        if (zoomOut) zoomOut.onclick = () => this.svg.transition().call(this.zoomBehavior.scaleBy, 0.7);
        if (zoomReset) zoomReset.onclick = () => this.svg.transition().call(this.zoomBehavior.transform, d3.zoomIdentity);
        
        window.addEventListener('resize', () => this.onResize());
    }
    
    onResize() {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.svg.attr('width', this.width).attr('height', this.height);
        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }
    
    start() {
        this.isActive = true;
        this.animate();
        
        // Animate entrance with GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.to('.cv-hbar-fill', { width: '100%', duration: 3, ease: 'power1.out' });
        }
        
        console.log('[BLACKOPS] Started');
    }
    
    stop() {
        this.isActive = false;
        console.log('[BLACKOPS] Stopped');
    }
    
    animate() {
        if (!this.isActive) return;
        
        requestAnimationFrame(() => this.animate());
        this.time += 0.016;
        
        // Time bar
        const timeFill = document.getElementById('cvTimeFill');
        if (timeFill) timeFill.style.width = ((this.time % 60) / 60 * 100) + '%';
        
        // Pulse critical nodes
        if (this.nodeElements) {
            this.nodeElements.filter(d => d.status === 'critical')
                .attr('r', 5 + Math.sin(this.time * 4) * 1.5);
        }
    }
    
    destroy() {
        this.stop();
        if (this.simulation) this.simulation.stop();
        if (this.svg) this.svg.remove();
        console.log('[BLACKOPS] Destroyed');
    }
}
