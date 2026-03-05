

class NeuralNetworkVisualization {
    
    constructor(container) {
        this._nn_container = container;
        this._nn_svg = null;
        this._nn_g = null;
        this._nn_simulation = null;
        this._nn_nodes = [];
        this._nn_edges = [];
        this._nn_edgeEls = null;
        this._nn_nodeEls = null;
        this._nn_labelEls = null;
        this._nn_width = 0;
        this._nn_height = 0;
        this._nn_zoom = 1;
        this._nn_zoomBehavior = null;
        this._nn_active = false;
        this._nn_frame = null;
        this._nn_time = 0;
        this._nn_popupTimer = null;
        this._nn_resizeHandler = null;
        
        this._nn_init();
    }
    
    _nn_init() {
        if (!this._nn_container) return;
        
        this._nn_width = this._nn_container.clientWidth;
        this._nn_height = this._nn_container.clientHeight;
        
        this._nn_genData();
        this._nn_createSVG();
        this._nn_createSim();
        this._nn_createEls();
        this._nn_bindEvents();
        this._nn_updateStats();
    }
    
    _nn_genData() {
        const sectors = ['CX', 'LB', 'MT', 'SN', 'MM', 'PR', 'CT', 'NR'];
        let id = 0;
        
        sectors.forEach(s => {
            const cnt = 11 + Math.floor(Math.random() * 4);
            for (let i = 0; i < cnt; i++) {
                this._nn_nodes.push({
                    id: id++,
                    name: `${s}-${String(i + 1).padStart(3, '0')}`,
                    sector: s,
                    status: Math.random() < 0.03 ? 'critical' : (Math.random() < 0.2 ? 'active' : 'nominal'),
                    links: 0
                });
            }
        });
        
        this._nn_nodes.forEach((n, i) => {
            const cc = 2 + Math.floor(Math.random() * 3);
            for (let c = 0; c < cc; c++) {
                let t;
                if (Math.random() < 0.6) {
                    const same = this._nn_nodes.filter(x => x.sector === n.sector && x.id !== n.id);
                    if (same.length) t = same[Math.floor(Math.random() * same.length)].id;
                }
                if (t === undefined) t = Math.floor(Math.random() * this._nn_nodes.length);
                
                if (t !== i && !this._nn_edges.some(e => (e.source === i && e.target === t) || (e.source === t && e.target === i))) {
                    this._nn_edges.push({ source: i, target: t });
                    this._nn_nodes[i].links++;
                    if (this._nn_nodes[t]) this._nn_nodes[t].links++;
                }
            }
        });
    }
    
    _nn_createSVG() {
        const old = this._nn_container.querySelector('svg.nn-svg');
        if (old) old.remove();
        
        this._nn_svg = d3.select(this._nn_container)
            .append('svg')
            .attr('class', 'nn-svg')
            .attr('width', this._nn_width)
            .attr('height', this._nn_height)
            .style('display', 'block')
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0');
        
        this._nn_g = this._nn_svg.append('g').attr('class', 'nn-g');
        
        this._nn_zoomBehavior = d3.zoom()
            .scaleExtent([0.2, 4])
            .on('zoom', (e) => {
                this._nn_g.attr('transform', e.transform);
                this._nn_zoom = e.transform.k;
                this._nn_updateZoom();
            });
        
        this._nn_svg.call(this._nn_zoomBehavior);
    }
    
    _nn_createSim() {
        this._nn_simulation = d3.forceSimulation(this._nn_nodes)
            .force('link', d3.forceLink(this._nn_edges).id(d => d.id).distance(45).strength(0.4))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(this._nn_width / 2, this._nn_height / 2))
            .force('collision', d3.forceCollide().radius(10))
            .alphaDecay(0.025)
            .on('tick', () => this._nn_tick());
    }
    
    _nn_createEls() {
        const self = this;
        
        this._nn_edgeEls = this._nn_g.append('g')
            .selectAll('path')
            .data(this._nn_edges)
            .enter()
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255,255,255,0.1)')
            .attr('stroke-width', 0.5);
        
        this._nn_nodeEls = this._nn_g.append('g')
            .selectAll('circle')
            .data(this._nn_nodes)
            .enter()
            .append('circle')
            .attr('r', d => d.status === 'critical' ? 4 : 3)
            .attr('fill', d => d.status === 'critical' ? 'rgba(255, 127, 127, 1)' : (d.status === 'active' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'))
            .attr('stroke', 'rgba(255,255,255,0.15)')
            .attr('stroke-width', 0.5)
            .style('cursor', 'pointer')
            .call(d3.drag()
                .on('start', (e, d) => self._nn_dragStart(e, d))
                .on('drag', (e, d) => self._nn_drag(e, d))
                .on('end', (e, d) => self._nn_dragEnd(e, d)))
            .on('mouseenter', (e, d) => self._nn_hl(d, true))
            .on('mouseleave', (e, d) => self._nn_hl(d, false))
            .on('click', (e, d) => self._nn_popup(d, e));
        
        this._nn_labelEls = this._nn_g.append('g')
            .selectAll('text')
            .data(this._nn_nodes.filter(n => n.links > 6))
            .enter()
            .append('text')
            .text(d => d.name)
            .attr('font-family', 'monospace')
            .attr('font-size', '5px')
            .attr('fill', 'rgba(255,255,255,0.25)')
            .attr('text-anchor', 'middle')
            .style('pointer-events', 'none');
    }
    
    _nn_tick() {
        this._nn_edgeEls.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.3;
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        this._nn_nodeEls.attr('cx', d => d.x).attr('cy', d => d.y);
        this._nn_labelEls.attr('x', d => d.x).attr('y', d => d.y - 8);
    }
    
    _nn_dragStart(e, d) {
        if (!e.active) this._nn_simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    
    _nn_drag(e, d) { d.fx = e.x; d.fy = e.y; }
    
    _nn_dragEnd(e, d) {
        if (!e.active) this._nn_simulation.alphaTarget(0);
    }
    
    _nn_hl(n, on) {
        this._nn_edgeEls
            .attr('stroke', d => (on && (d.source.id === n.id || d.target.id === n.id)) ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)')
            .attr('stroke-width', d => (on && (d.source.id === n.id || d.target.id === n.id)) ? 1 : 0.5);
        
        this._nn_nodeEls.filter(d => d.id === n.id)
            .attr('r', on ? 6 : (n.status === 'critical' ? 4 : 3))
            .attr('stroke', on ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)');
    }
    
    _nn_popup(n, e) {
        const p = document.getElementById('cvNodeInfo');
        if (!p) return;
        
        const r = this._nn_container.getBoundingClientRect();
        let x = e.clientX - r.left + 10;
        let y = e.clientY - r.top - 20;
        if (x + 180 > r.width) x = e.clientX - r.left - 190;
        
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        
        const t = p.querySelector('.cv-node-info-title');
        if (t) t.textContent = n.name;
        
        const v = p.querySelectorAll('.cv-node-info-value');
        if (v[0]) v[0].textContent = n.status.toUpperCase();
        if (v[1]) v[1].textContent = n.links;
        if (v[2]) v[2].textContent = n.sector;
        
        p.classList.add('visible');
        clearTimeout(this._nn_popupTimer);
        this._nn_popupTimer = setTimeout(() => p.classList.remove('visible'), 2500);
    }
    
    _nn_updateStats() {
        const nc = document.getElementById('nodeCount');
        const ec = document.getElementById('edgeCount');
        const cc = document.getElementById('criticalCount');
        
        if (nc) nc.textContent = this._nn_nodes.length;
        if (ec) ec.textContent = this._nn_edges.length;
        if (cc) cc.textContent = this._nn_nodes.filter(n => n.status === 'critical').length;
        
        const g = document.getElementById('statusGrid');
        if (g) {
            g.innerHTML = '';
            this._nn_nodes.forEach(n => {
                const d = document.createElement('div');
                d.className = 'cv-status-dot' + (n.status === 'critical' ? ' critical' : (n.status === 'active' ? ' active' : ''));
                g.appendChild(d);
            });
        }
    }
    
    _nn_updateZoom() {
        const el = document.getElementById('cvZoomLvl');
        if (el) el.textContent = Math.round(this._nn_zoom * 100) + '%';
    }
    
    _nn_bindEvents() {
        const zi = document.getElementById('cvZoomIn');
        const zo = document.getElementById('cvZoomOut');
        const zr = document.getElementById('cvZoomReset');
        
        if (zi) zi.onclick = () => this._nn_svg.transition().duration(200).call(this._nn_zoomBehavior.scaleBy, 1.4);
        if (zo) zo.onclick = () => this._nn_svg.transition().duration(200).call(this._nn_zoomBehavior.scaleBy, 0.7);
        if (zr) zr.onclick = () => this._nn_svg.transition().duration(300).call(this._nn_zoomBehavior.transform, d3.zoomIdentity);
        
        this._nn_resizeHandler = () => {
            this._nn_width = this._nn_container.clientWidth;
            this._nn_height = this._nn_container.clientHeight;
            this._nn_svg.attr('width', this._nn_width).attr('height', this._nn_height);
            this._nn_simulation.force('center', d3.forceCenter(this._nn_width / 2, this._nn_height / 2));
            this._nn_simulation.alpha(0.3).restart();
        };
        window.addEventListener('resize', this._nn_resizeHandler);
    }
    
    start() {
        this._nn_active = true;
        this._nn_animate();
        document.querySelectorAll('.cv-stat-row').forEach((r, i) => {
            setTimeout(() => r.classList.add('visible'), 300 + i * 80);
        });
    }
    
    stop() {
        this._nn_active = false;
        if (this._nn_frame) cancelAnimationFrame(this._nn_frame);
    }
    
    _nn_animate() {
        if (!this._nn_active) return;
        this._nn_frame = requestAnimationFrame(() => this._nn_animate());
        this._nn_time += 0.016;
        
        const tf = document.getElementById('cvTimeFill');
        if (tf) tf.style.width = ((this._nn_time % 60) / 60 * 100) + '%';
        
        if (this._nn_nodeEls) {
            this._nn_nodeEls.filter(d => d.status === 'critical')
                .attr('r', 4 + Math.sin(this._nn_time * 5) * 1);
        }
    }
    
    destroy() {
        this.stop();
        if (this._nn_simulation) { this._nn_simulation.stop(); this._nn_simulation = null; }
        if (this._nn_svg) { this._nn_svg.remove(); this._nn_svg = null; }
        if (this._nn_resizeHandler) window.removeEventListener('resize', this._nn_resizeHandler);
        clearTimeout(this._nn_popupTimer);
    }
}

export default NeuralNetworkVisualization;
if (typeof window !== 'undefined') window.NeuralNetworkVisualization = NeuralNetworkVisualization;
