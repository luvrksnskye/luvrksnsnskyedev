/**
 * COGNEX VIDI - NEURAL NETWORK VISUALIZATION
 * NEO-MILITARY BLACKOPS EDITION
 * 
 * ~100 nodes, hundreds of connections
 * Black / White / Red only
 * D3.js Force Simulation + GSAP
 */

export default class NeuralNetworkVisualization {
    
    constructor(container) {
        this.container = container;
        this.svg = null;
        this.simulation = null;
        
        // Data
        this.nodes = [];
        this.edges = [];
        this.particles = [];
        
        // D3 selections
        this.edgePaths = null;
        this.nodeGroups = null;
        this.particleCircles = null;
        
        // Interaction
        this.selectedNode = null;
        this.hoveredNode = null;
        
        // Animation
        this.isActive = false;
        this.animationFrame = null;
        this.time = 0;
        
        // Dimensions
        this.width = 0;
        this.height = 0;
        
        // Zoom
        this.currentZoom = 1;
        this.zoomBehavior = null;
        
        this.init();
    }
    
    init() {
        if (!this.container) return false;
        
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        // Initialize data - 100 nodes
        this.initData();
        
        // Create SVG
        this.createSVG();
        
        // Create simulation
        this.createSimulation();
        
        // Create visual elements
        this.createEdges();
        this.createNodes();
        this.createParticles();
        
        // Bind events
        this.bindEvents();
        
        // Animate entrance
        this.animateEntrance();
        
        console.log('[BLACKOPS] Neural network initialized - ' + this.nodes.length + ' nodes, ' + this.edges.length + ' connections');
        return true;
    }
    
    initData() {
        // Generate ~100 nodes across different sectors
        const sectors = [
            { prefix: 'CORTEX', count: 15, criticalChance: 0.1 },
            { prefix: 'LIMBIC', count: 12, criticalChance: 0.15 },
            { prefix: 'MOTOR', count: 10, criticalChance: 0.05 },
            { prefix: 'SENSORY', count: 12, criticalChance: 0.08 },
            { prefix: 'MEMORY', count: 14, criticalChance: 0.2 },
            { prefix: 'PROCESS', count: 15, criticalChance: 0.05 },
            { prefix: 'CONTROL', count: 10, criticalChance: 0.12 },
            { prefix: 'NEURAL', count: 12, criticalChance: 0.1 }
        ];
        
        const statuses = ['nominal', 'active', 'warning', 'critical', 'offline'];
        const statusWeights = {
            nominal: 0.4,
            active: 0.35,
            warning: 0.12,
            critical: 0.08,
            offline: 0.05
        };
        
        this.nodes = [];
        let nodeIndex = 0;
        
        sectors.forEach(sector => {
            for (let i = 0; i < sector.count; i++) {
                const isCritical = Math.random() < sector.criticalChance;
                let status;
                
                if (isCritical) {
                    status = 'critical';
                } else {
                    const r = Math.random();
                    let cumulative = 0;
                    for (const [s, w] of Object.entries(statusWeights)) {
                        cumulative += w;
                        if (r <= cumulative) {
                            status = s;
                            break;
                        }
                    }
                }
                
                const nodeId = `${sector.prefix}-${String(i + 1).padStart(3, '0')}`;
                
                this.nodes.push({
                    id: nodeIndex,
                    name: nodeId,
                    sector: sector.prefix,
                    status: status,
                    connections: 0,
                    activity: Math.random() * 100,
                    desc: this.generateDescription(sector.prefix, status)
                });
                
                nodeIndex++;
            }
        });
        
        // Generate connections - aim for ~300-400 connections
        this.edges = [];
        const connectionDensity = 3.5; // Average connections per node
        
        this.nodes.forEach((node, i) => {
            // Connect to random nodes
            const connectionCount = Math.floor(Math.random() * 4) + 2;
            
            for (let c = 0; c < connectionCount; c++) {
                // Prefer connections within same sector or adjacent sectors
                let targetIndex;
                
                if (Math.random() < 0.6) {
                    // Same sector connection
                    const sectorNodes = this.nodes.filter(n => n.sector === node.sector && n.id !== node.id);
                    if (sectorNodes.length > 0) {
                        targetIndex = sectorNodes[Math.floor(Math.random() * sectorNodes.length)].id;
                    }
                }
                
                if (targetIndex === undefined) {
                    // Random connection
                    targetIndex = Math.floor(Math.random() * this.nodes.length);
                }
                
                if (targetIndex !== i) {
                    // Check if connection already exists
                    const exists = this.edges.some(e => 
                        (e.source === i && e.target === targetIndex) ||
                        (e.source === targetIndex && e.target === i)
                    );
                    
                    if (!exists) {
                        const isCriticalConnection = 
                            this.nodes[i].status === 'critical' || 
                            this.nodes[targetIndex].status === 'critical';
                        
                        this.edges.push({
                            source: i,
                            target: targetIndex,
                            value: 1,
                            critical: isCriticalConnection
                        });
                        
                        this.nodes[i].connections++;
                        this.nodes[targetIndex].connections++;
                    }
                }
            }
        });
        
        // Add some long-range connections for network connectivity
        for (let i = 0; i < 50; i++) {
            const source = Math.floor(Math.random() * this.nodes.length);
            const target = Math.floor(Math.random() * this.nodes.length);
            
            if (source !== target) {
                const exists = this.edges.some(e => 
                    (e.source === source && e.target === target) ||
                    (e.source === target && e.target === source)
                );
                
                if (!exists) {
                    this.edges.push({
                        source: source,
                        target: target,
                        value: 1,
                        critical: false
                    });
                }
            }
        }
    }
    
    generateDescription(sector, status) {
        const descriptions = {
            CORTEX: [
                'Executive processing unit. ',
                'Decision matrix node. ',
                'Cognitive integration point. '
            ],
            LIMBIC: [
                'Emotional regulation hub. ',
                'Stress response controller. ',
                'Autonomic interface. '
            ],
            MOTOR: [
                'Movement coordination. ',
                'Motor output controller. ',
                'Kinetic processing unit. '
            ],
            SENSORY: [
                'Input processing node. ',
                'Sensory integration unit. ',
                'Perception gateway. '
            ],
            MEMORY: [
                'Data storage sector. ',
                'Long-term memory bank. ',
                'Information retrieval hub. '
            ],
            PROCESS: [
                'Computation node. ',
                'Data processing unit. ',
                'Analysis module. '
            ],
            CONTROL: [
                'System regulation point. ',
                'Override control hub. ',
                'Command interface. '
            ],
            NEURAL: [
                'Signal relay node. ',
                'Synaptic junction. ',
                'Network bridge. '
            ]
        };
        
        const statusMessages = {
            nominal: 'Operating within parameters.',
            active: 'High activity detected.',
            warning: 'Monitoring required.',
            critical: 'ALERT: Critical failure imminent.',
            offline: 'Node offline. Rerouting traffic.'
        };
        
        const base = descriptions[sector][Math.floor(Math.random() * 3)];
        return base + statusMessages[status];
    }
    
    createSVG() {
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // Glow filter for critical nodes
        const defs = this.svg.append('defs');
        
        const filter = defs.append('filter')
            .attr('id', 'redglow')
            .attr('x', '-100%')
            .attr('y', '-100%')
            .attr('width', '300%')
            .attr('height', '300%');
        
        filter.append('feGaussianBlur')
            .attr('stdDeviation', '3')
            .attr('result', 'blur');
        
        filter.append('feFlood')
            .attr('flood-color', '#ff0000')
            .attr('flood-opacity', '0.5')
            .attr('result', 'color');
        
        filter.append('feComposite')
            .attr('in', 'color')
            .attr('in2', 'blur')
            .attr('operator', 'in')
            .attr('result', 'colorBlur');
        
        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'colorBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
        
        // Zoom behavior
        this.zoomBehavior = d3.zoom()
            .scaleExtent([0.2, 4])
            .on('zoom', (event) => {
                this.svg.select('#main-group').attr('transform', event.transform);
                this.currentZoom = event.transform.k;
                this.updateZoomLevel();
            });
        
        this.svg.call(this.zoomBehavior);
        
        // Main group
        this.svg.append('g').attr('id', 'main-group');
    }
    
    createSimulation() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.edges)
                .id(d => d.id)
                .distance(60)
                .strength(0.3))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('charge', d3.forceManyBody().strength(-80))
            .force('collision', d3.forceCollide().radius(15))
            .force('x', d3.forceX(this.width / 2).strength(0.03))
            .force('y', d3.forceY(this.height / 2).strength(0.03))
            .alphaDecay(0.02)
            .on('tick', () => this.tick());
    }
    
    createEdges() {
        const mainGroup = this.svg.select('#main-group');
        
        this.edgePaths = mainGroup.append('g')
            .attr('id', 'edges')
            .selectAll('path')
            .data(this.edges)
            .enter()
            .append('path')
            .attr('class', d => d.critical ? 'edge danger' : 'edge')
            .style('opacity', 0);
    }
    
    createNodes() {
        const mainGroup = this.svg.select('#main-group');
        const self = this;
        
        // Drag behavior
        const drag = d3.drag()
            .on('start', function(event, d) {
                if (!event.active) self.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', function(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', function(event, d) {
                if (!event.active) self.simulation.alphaTarget(0);
                d3.select(this).classed('pinned', true);
            });
        
        this.nodeGroups = mainGroup.append('g')
            .attr('id', 'nodes')
            .selectAll('g')
            .data(this.nodes)
            .enter()
            .append('g')
            .attr('class', d => `node-group status-${d.status}`)
            .call(drag)
            .on('dblclick', function(event, d) {
                d.fx = null;
                d.fy = null;
                d3.select(this).classed('pinned', false);
            })
            .on('mouseenter', (event, d) => this.onNodeHover(d, event))
            .on('mouseleave', () => this.onNodeUnhover())
            .on('click', (event, d) => this.onNodeClick(d, event));
        
        // Node circles
        this.nodeGroups.append('circle')
            .attr('class', 'node-main')
            .attr('r', 0) // Start at 0 for animation
            .attr('filter', d => d.status === 'critical' ? 'url(#redglow)' : null);
        
        // Labels (only show for larger nodes or on hover)
        this.nodeGroups.append('text')
            .attr('y', -12)
            .text(d => d.name)
            .style('opacity', 0)
            .style('display', d => d.connections > 4 ? 'block' : 'none');
    }
    
    createParticles() {
        const mainGroup = this.svg.select('#main-group');
        
        // Create fewer particles for performance with 100 nodes
        this.particles = [];
        
        // Only add particles to ~30% of edges
        this.edges.forEach((edge, edgeIndex) => {
            if (Math.random() < 0.3) {
                this.particles.push({
                    edge: edge,
                    edgeIndex: edgeIndex,
                    progress: Math.random(),
                    speed: 0.005 + Math.random() * 0.005,
                    direction: Math.random() > 0.5 ? 1 : -1
                });
            }
        });
        
        this.particleCircles = mainGroup.append('g')
            .attr('id', 'particles')
            .selectAll('circle')
            .data(this.particles)
            .enter()
            .append('circle')
            .attr('r', 1.5)
            .style('opacity', 0);
    }
    
    tick() {
        // Update edge paths with curved arcs
        this.edgePaths.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        
        // Update node positions
        this.nodeGroups.attr('transform', d => `translate(${d.x},${d.y})`);
        
        // Update particles
        this.updateParticles();
    }
    
    updateParticles() {
        this.particleCircles.each((d, i, nodes) => {
            d.progress += d.speed * d.direction;
            
            if (d.progress > 1) d.progress = 0;
            if (d.progress < 0) d.progress = 1;
            
            const edge = d.edge;
            const source = typeof edge.source === 'object' ? edge.source : this.nodes[edge.source];
            const target = typeof edge.target === 'object' ? edge.target : this.nodes[edge.target];
            
            if (!source || !target) return;
            
            const t = d.progress;
            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
            
            // Approximate arc position
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const perpX = -dy / (dr || 1) * 20;
            const perpY = dx / (dr || 1) * 20;
            
            const x = source.x * (1-t) * (1-t) + (midX + perpX) * 2 * t * (1-t) + target.x * t * t;
            const y = source.y * (1-t) * (1-t) + (midY + perpY) * 2 * t * (1-t) + target.y * t * t;
            
            d3.select(nodes[i])
                .attr('cx', x)
                .attr('cy', y);
        });
    }
    
    onNodeHover(node, event) {
        this.hoveredNode = node;
        
        const group = this.nodeGroups.filter(d => d.id === node.id);
        
        gsap.to(group.select('.node-main').node(), {
            attr: { r: 10 },
            duration: 0.2,
            ease: 'power2.out'
        });
        
        // Show label
        group.select('text').style('display', 'block');
        gsap.to(group.select('text').node(), {
            opacity: 1,
            duration: 0.2
        });
        
        // Highlight connected edges
        this.edgePaths.classed('active', d => 
            d.source.id === node.id || d.target.id === node.id
        );
    }
    
    onNodeUnhover() {
        if (!this.hoveredNode) return;
        
        const node = this.hoveredNode;
        const group = this.nodeGroups.filter(d => d.id === node.id);
        
        const baseRadius = node.status === 'critical' ? 5 : 4;
        
        gsap.to(group.select('.node-main').node(), {
            attr: { r: baseRadius },
            duration: 0.2,
            ease: 'power2.out'
        });
        
        // Hide label if low connection count
        if (node.connections <= 4) {
            gsap.to(group.select('text').node(), {
                opacity: 0,
                duration: 0.2,
                onComplete: () => group.select('text').style('display', 'none')
            });
        }
        
        // Remove edge highlight
        this.edgePaths.classed('active', false);
        
        this.hoveredNode = null;
    }
    
    onNodeClick(node, event) {
        this.selectedNode = node;
        this.showNodeInfo(node, event.pageX, event.pageY);
    }
    
    showNodeInfo(node, x, y) {
        const popup = document.getElementById('cvNodeInfo');
        if (!popup) return;
        
        const rect = this.container.getBoundingClientRect();
        
        let popupX = x - rect.left + 15;
        let popupY = y - rect.top - 30;
        
        if (popupX + 230 > rect.width) popupX = x - rect.left - 240;
        if (popupY < 20) popupY = y - rect.top + 20;
        
        popup.style.left = popupX + 'px';
        popup.style.top = popupY + 'px';
        
        // Set danger class
        popup.classList.toggle('danger', node.status === 'critical');
        
        // Update content
        const title = popup.querySelector('.cv-node-info-title');
        title.textContent = node.name;
        title.classList.toggle('danger', node.status === 'critical');
        
        const rows = popup.querySelectorAll('.cv-node-info-row');
        if (rows[0]) {
            const val = rows[0].querySelector('.cv-node-info-value');
            val.textContent = node.status.toUpperCase();
            val.classList.toggle('danger', node.status === 'critical');
        }
        if (rows[1]) {
            rows[1].querySelector('.cv-node-info-value').textContent = node.connections + ' LINKS';
        }
        if (rows[2]) {
            rows[2].querySelector('.cv-node-info-value').textContent = node.activity.toFixed(1) + '%';
        }
        
        popup.querySelector('.cv-node-info-desc').textContent = node.desc;
        
        popup.classList.add('visible');
        
        clearTimeout(this.hidePopupTimeout);
        this.hidePopupTimeout = setTimeout(() => {
            popup.classList.remove('visible');
        }, 3500);
    }
    
    animateEntrance() {
        // Animate edges
        gsap.to(this.edgePaths.nodes(), {
            opacity: 1,
            duration: 0.3,
            stagger: 0.002,
            delay: 0.2,
            ease: 'none'
        });
        
        // Animate nodes
        this.nodeGroups.selectAll('.node-main').each(function(d) {
            const baseRadius = d.status === 'critical' ? 5 : 4;
            gsap.to(this, {
                attr: { r: baseRadius },
                duration: 0.4,
                delay: 0.3 + Math.random() * 0.5,
                ease: 'back.out(1.5)'
            });
        });
        
        // Animate some labels
        gsap.to(this.nodeGroups.filter(d => d.connections > 4).selectAll('text').nodes(), {
            opacity: 1,
            duration: 0.3,
            stagger: 0.02,
            delay: 0.8,
            ease: 'power2.out'
        });
        
        // Animate particles
        gsap.to(this.particleCircles.nodes(), {
            opacity: 0.6,
            duration: 0.5,
            delay: 1,
            ease: 'power2.out'
        });
        
        // Animate header bar
        gsap.to('.cv-hbar-fill', {
            width: '100%',
            duration: 3,
            delay: 0.3,
            ease: 'power1.out'
        });
        
        // Animate stats
        document.querySelectorAll('.cv-stat-row').forEach((row, i) => {
            gsap.to(row, {
                opacity: 1,
                x: 0,
                duration: 0.3,
                delay: 1 + i * 0.08,
                ease: 'power2.out',
                onStart: () => row.classList.add('visible')
            });
        });
        
        // Update status dots
        this.updateStatusDots();
    }
    
    updateStatusDots() {
        const dots = document.querySelectorAll('.cv-status-dot');
        const criticalCount = this.nodes.filter(n => n.status === 'critical').length;
        const activeCount = this.nodes.filter(n => n.status === 'active').length;
        
        dots.forEach((dot, i) => {
            setTimeout(() => {
                if (i < criticalCount) {
                    dot.classList.add('danger');
                } else if (i < criticalCount + Math.floor(activeCount / 2)) {
                    dot.classList.add('active');
                }
            }, i * 30);
        });
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.onResize());
        
        const zoomIn = document.getElementById('cvZoomIn');
        const zoomOut = document.getElementById('cvZoomOut');
        const zoomReset = document.getElementById('cvZoomReset');
        
        if (zoomIn) zoomIn.addEventListener('click', () => this.zoomIn());
        if (zoomOut) zoomOut.addEventListener('click', () => this.zoomOut());
        if (zoomReset) zoomReset.addEventListener('click', () => this.resetZoom());
    }
    
    onResize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        this.svg.attr('width', this.width).attr('height', this.height);
        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }
    
    zoomIn() {
        this.svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 1.4);
    }
    
    zoomOut() {
        this.svg.transition().duration(300).call(this.zoomBehavior.scaleBy, 0.7);
    }
    
    resetZoom() {
        this.svg.transition().duration(500).call(this.zoomBehavior.transform, d3.zoomIdentity);
    }
    
    updateZoomLevel() {
        const el = document.getElementById('cvZoomLvl');
        if (el) el.textContent = Math.round(this.currentZoom * 100) + '%';
    }
    
    start() {
        this.isActive = true;
        this.animate();
        console.log('[BLACKOPS] Animation started');
    }
    
    stop() {
        this.isActive = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        console.log('[BLACKOPS] Animation stopped');
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
        this.time += 0.016;
        
        // Update time bar
        const timeFill = document.getElementById('cvTimeFill');
        if (timeFill) {
            const progress = (this.time % 60) / 60 * 100;
            timeFill.style.width = progress + '%';
        }
        
        // Pulse critical nodes
        this.nodeGroups.filter(d => d.status === 'critical')
            .select('.node-main')
            .attr('r', 5 + Math.sin(this.time * 4) * 1.5);
        
        // Animate left panel bars
        document.querySelectorAll('.cv-bar').forEach((bar, i) => {
            const baseHeight = bar.classList.contains('h100') ? 100 :
                             bar.classList.contains('h80') ? 80 :
                             bar.classList.contains('h60') ? 60 :
                             bar.classList.contains('h40') ? 40 : 20;
            const pulse = Math.sin(this.time * 3 + i * 0.3) * 15;
            bar.style.height = Math.max(5, baseHeight + pulse) + '%';
        });
    }
    
    destroy() {
        this.stop();
        if (this.simulation) this.simulation.stop();
        if (this.svg) this.svg.remove();
        console.log('[BLACKOPS] Destroyed');
    }
}
