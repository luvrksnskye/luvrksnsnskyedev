/**
 * COGNEX VIDI - NEURAL NETWORK VISUALIZATION
 * Three.js + GSAP Sci-Fi Style
 * 
 * - Nodos circulares con glow
 * - Conexiones curvas animadas
 * - Partículas fluyendo entre nodos
 * - Pan/Zoom con controles suaves
 * - Click para info de nodos SKYE
 */

export default class NeuralNetworkVisualization {
    
    constructor(container, nodes, stats) {
        this.container = container;
        
        // Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // Groups
        this.nodesGroup = null;
        this.connectionsGroup = null;
        this.particlesGroup = null;
        
        // Data
        this.nodes = this.initNodes();
        this.stats = stats || [];
        this.connections = [];
        this.particles = [];
        this.nodeObjects = new Map();
        
        // Interaction
        this.raycaster = null;
        this.mouse = null;
        this.selectedNode = null;
        this.hoveredNode = null;
        
        // Animation
        this.clock = null;
        this.isActive = false;
        this.time = 0;
        
        // Colors
        this.colors = {
            node: 0xffffff,
            nodeGlow: 0x00f0ff,
            connection: 0x333333,
            connectionActive: 0x00f0ff,
            particle: 0x00f0ff,
            optimal: 0x00ff88,
            active: 0x00f0ff,
            calibrating: 0xffaa00,
            recovering: 0xff6666,
            exceptional: 0xff00ff
        };
        
        this.init();
    }
    
    initNodes() {
        // SKYE Neural network - 4 layers
        return [
            // Layer 0 - Input (4 nodes)
            { id: 'prefrontal', label: 'PREFRONTAL CORTEX', layer: 0, index: 0, status: 'optimal', 
              desc: 'Executive function pathways clear. Decision-making optimal.' },
            { id: 'temporal', label: 'TEMPORAL LOBE', layer: 0, index: 1, status: 'active',
              desc: 'Memory encoding active. Auditory processing nominal.' },
            { id: 'parietal', label: 'PARIETAL LOBE', layer: 0, index: 2, status: 'optimal',
              desc: 'Spatial awareness online. Sensory integration stable.' },
            { id: 'occipital', label: 'OCCIPITAL LOBE', layer: 0, index: 3, status: 'active',
              desc: 'Visual processing active. Pattern recognition enhanced.' },
            
            // Layer 1 - Hidden 1 (4 nodes)
            { id: 'motor', label: 'MOTOR CORTEX', layer: 1, index: 0, status: 'calibrating',
              desc: 'Motor functions calibrating. Movement coordination returning.' },
            { id: 'cerebellum', label: 'CEREBELLUM', layer: 1, index: 1, status: 'active',
              desc: 'Balance systems active. Fine motor control engaged.' },
            { id: 'limbic', label: 'LIMBIC SYSTEM', layer: 1, index: 2, status: 'optimal',
              desc: 'Emotional regulation balanced. Stress response nominal.' },
            { id: 'hippocampus', label: 'HIPPOCAMPUS', layer: 1, index: 3, status: 'recovering',
              desc: 'Memory formation at 78%. Long-term storage recovering.' },
            
            // Layer 2 - Hidden 2 (3 nodes)
            { id: 'brainstem', label: 'BRAINSTEM', layer: 2, index: 0, status: 'optimal',
              desc: 'Autonomic functions independent. Vital signs stable.' },
            { id: 'broca', label: "BROCA'S AREA", layer: 2, index: 1, status: 'active',
              desc: 'Speech production active. Language output nominal.' },
            { id: 'wernicke', label: "WERNICKE'S AREA", layer: 2, index: 2, status: 'active',
              desc: 'Language comprehension online. Semantic processing engaged.' },
            
            // Layer 3 - Output (2 nodes)
            { id: 'creative', label: 'CREATIVE CORTEX', layer: 3, index: 0, status: 'exceptional',
              desc: 'Divergent thinking highly active. Creativity exceeds baseline.' },
            { id: 'consciousness', label: 'CONSCIOUSNESS', layer: 3, index: 1, status: 'optimal',
              desc: 'Consciousness index at 98.7%. Self-awareness confirmed.' }
        ];
    }
    
    init() {
        if (!this.container) return false;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);
        this.scene.fog = new THREE.Fog(0x050508, 400, 1200);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 2000);
        this.camera.position.set(0, 0, 500);
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
        
        // Groups
        this.connectionsGroup = new THREE.Group();
        this.nodesGroup = new THREE.Group();
        this.particlesGroup = new THREE.Group();
        
        this.scene.add(this.connectionsGroup);
        this.scene.add(this.particlesGroup);
        this.scene.add(this.nodesGroup);
        
        // Raycaster for interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Clock
        this.clock = new THREE.Clock();
        
        // Create visualization
        this.calculateNodePositions();
        this.createConnections();
        this.createNodes();
        this.createParticles();
        this.createAmbientElements();
        
        // Bind events
        this.bindEvents();
        
        // Initial animation
        this.animateEntrance();
        
        console.log('[NEURAL-THREEJS] Visualization initialized');
        return true;
    }
    
    calculateNodePositions() {
        const layerCounts = [4, 4, 3, 2];
        const layerSpacing = 200;
        const startX = -300;
        
        this.nodes.forEach(node => {
            const layerCount = layerCounts[node.layer];
            const layerHeight = (layerCount - 1) * 80;
            
            node.x = startX + node.layer * layerSpacing;
            node.y = (node.index - (layerCount - 1) / 2) * 80;
            node.z = (Math.random() - 0.5) * 50;
            
            // Store connections
            node.connections = [];
            if (node.layer < 3) {
                const nextLayerNodes = this.nodes.filter(n => n.layer === node.layer + 1);
                nextLayerNodes.forEach(target => {
                    node.connections.push(target.id);
                });
            }
        });
    }
    
    createNodes() {
        const nodeGeometry = new THREE.SphereGeometry(8, 32, 32);
        const glowGeometry = new THREE.SphereGeometry(15, 32, 32);
        
        this.nodes.forEach(node => {
            const group = new THREE.Group();
            group.position.set(node.x, node.y, node.z);
            group.userData = { node };
            
            // Core sphere
            const coreMaterial = new THREE.MeshBasicMaterial({
                color: this.colors.node,
                transparent: true,
                opacity: 0.9
            });
            const core = new THREE.Mesh(nodeGeometry, coreMaterial);
            group.add(core);
            
            // Glow sphere
            const statusColor = this.colors[node.status] || this.colors.node;
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: statusColor,
                transparent: true,
                opacity: 0.15,
                side: THREE.BackSide
            });
            const glow = new THREE.Mesh(glowGeometry, glowMaterial);
            glow.scale.set(1.5, 1.5, 1.5);
            group.add(glow);
            
            // Outer ring
            const ringGeometry = new THREE.RingGeometry(12, 14, 32);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: statusColor,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            group.add(ring);
            
            // Store references
            node.object = group;
            node.core = core;
            node.glow = glow;
            node.ring = ring;
            
            this.nodesGroup.add(group);
            this.nodeObjects.set(node.id, group);
            
            // Initial scale for animation
            group.scale.set(0, 0, 0);
        });
    }
    
    createConnections() {
        this.nodes.forEach(node => {
            if (!node.connections) return;
            
            node.connections.forEach(targetId => {
                const target = this.nodes.find(n => n.id === targetId);
                if (!target) return;
                
                // Create curved connection
                const curve = this.createCurve(node, target);
                const points = curve.getPoints(50);
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                
                const material = new THREE.LineBasicMaterial({
                    color: this.colors.connection,
                    transparent: true,
                    opacity: 0.4
                });
                
                const line = new THREE.Line(geometry, material);
                line.userData = { from: node, to: target, curve };
                
                this.connectionsGroup.add(line);
                this.connections.push({ line, curve, from: node, to: target });
            });
        });
    }
    
    createCurve(from, to) {
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const midZ = (from.z + to.z) / 2 + (Math.random() - 0.5) * 30;
        
        // Add some curve offset
        const offset = (from.y - to.y) * 0.3;
        
        return new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(from.x, from.y, from.z),
            new THREE.Vector3(midX, midY + offset, midZ),
            new THREE.Vector3(to.x, to.y, to.z)
        );
    }
    
    createParticles() {
        const particleGeometry = new THREE.SphereGeometry(2, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: this.colors.particle,
            transparent: true,
            opacity: 0.8
        });
        
        this.connections.forEach(conn => {
            // 2-4 particles per connection
            const count = 2 + Math.floor(Math.random() * 3);
            
            for (let i = 0; i < count; i++) {
                const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
                particle.userData = {
                    connection: conn,
                    progress: Math.random(),
                    speed: 0.002 + Math.random() * 0.003,
                    direction: Math.random() > 0.5 ? 1 : -1
                };
                
                this.particlesGroup.add(particle);
                this.particles.push(particle);
            }
        });
    }
    
    createAmbientElements() {
        // Add some floating particles in background
        const bgParticles = new THREE.BufferGeometry();
        const bgCount = 200;
        const positions = new Float32Array(bgCount * 3);
        
        for (let i = 0; i < bgCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 400 - 100;
        }
        
        bgParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const bgMaterial = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 1.5,
            transparent: true,
            opacity: 0.3
        });
        
        const bgPoints = new THREE.Points(bgParticles, bgMaterial);
        this.scene.add(bgPoints);
        this.bgParticles = bgPoints;
    }
    
    animateEntrance() {
        // Animate nodes appearing with GSAP
        this.nodes.forEach((node, i) => {
            const delay = i * 0.08;
            
            gsap.to(node.object.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.6,
                delay: delay,
                ease: 'back.out(1.7)'
            });
            
            gsap.to(node.object.position, {
                z: node.z,
                duration: 0.8,
                delay: delay,
                ease: 'power2.out'
            });
        });
        
        // Animate connections
        this.connections.forEach((conn, i) => {
            gsap.fromTo(conn.line.material, 
                { opacity: 0 },
                { 
                    opacity: 0.4, 
                    duration: 0.5, 
                    delay: 0.5 + i * 0.02,
                    ease: 'power2.out'
                }
            );
        });
        
        // Animate header bar
        gsap.to('.cv-hbar-fill', {
            width: '78%',
            duration: 2,
            delay: 0.5,
            ease: 'power2.out'
        });
        
        // Animate stats
        document.querySelectorAll('.cv-stat-row').forEach((row, i) => {
            gsap.to(row, {
                opacity: 1,
                x: 0,
                duration: 0.5,
                delay: 1 + i * 0.1,
                ease: 'power2.out'
            });
            row.classList.add('visible');
        });
    }
    
    bindEvents() {
        // Resize
        window.addEventListener('resize', () => this.onResize());
        
        // Mouse move for hover
        this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Click for selection
        this.container.addEventListener('click', (e) => this.onClick(e));
        
        // Zoom buttons
        const zoomIn = document.getElementById('cvZoomIn');
        const zoomOut = document.getElementById('cvZoomOut');
        const zoomReset = document.getElementById('cvZoomReset');
        
        if (zoomIn) zoomIn.addEventListener('click', () => this.zoomIn());
        if (zoomOut) zoomOut.addEventListener('click', () => this.zoomOut());
        if (zoomReset) zoomReset.addEventListener('click', () => this.resetView());
        
        // Mouse wheel zoom
        this.container.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Drag to rotate
        let isDragging = false;
        let prevX = 0, prevY = 0;
        
        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevX = e.clientX;
            prevY = e.clientY;
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - prevX;
            const deltaY = e.clientY - prevY;
            
            this.nodesGroup.rotation.y += deltaX * 0.005;
            this.nodesGroup.rotation.x += deltaY * 0.005;
            this.connectionsGroup.rotation.y += deltaX * 0.005;
            this.connectionsGroup.rotation.x += deltaY * 0.005;
            this.particlesGroup.rotation.y += deltaX * 0.005;
            this.particlesGroup.rotation.x += deltaY * 0.005;
            
            prevX = e.clientX;
            prevY = e.clientY;
        });
        
        this.container.addEventListener('mouseup', () => isDragging = false);
        this.container.addEventListener('mouseleave', () => isDragging = false);
    }
    
    onResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    onMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Check for hover
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.nodesGroup.children, true);
        
        if (intersects.length > 0) {
            const obj = intersects[0].object.parent;
            if (obj.userData.node && obj.userData.node !== this.hoveredNode) {
                this.onNodeHover(obj.userData.node);
            }
            this.container.style.cursor = 'pointer';
        } else {
            if (this.hoveredNode) {
                this.onNodeUnhover();
            }
            this.container.style.cursor = 'grab';
        }
    }
    
    onNodeHover(node) {
        this.hoveredNode = node;
        
        // Scale up with GSAP
        gsap.to(node.object.scale, {
            x: 1.3, y: 1.3, z: 1.3,
            duration: 0.3,
            ease: 'back.out(1.7)'
        });
        
        // Brighten glow
        gsap.to(node.glow.material, {
            opacity: 0.4,
            duration: 0.3
        });
        
        // Highlight connections
        this.connections.forEach(conn => {
            if (conn.from.id === node.id || conn.to.id === node.id) {
                gsap.to(conn.line.material, {
                    opacity: 0.8,
                    duration: 0.3
                });
                conn.line.material.color.setHex(this.colors.connectionActive);
            }
        });
    }
    
    onNodeUnhover() {
        if (!this.hoveredNode) return;
        
        const node = this.hoveredNode;
        
        gsap.to(node.object.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
        
        gsap.to(node.glow.material, {
            opacity: 0.15,
            duration: 0.3
        });
        
        // Reset connections
        this.connections.forEach(conn => {
            if (conn.from.id === node.id || conn.to.id === node.id) {
                gsap.to(conn.line.material, {
                    opacity: 0.4,
                    duration: 0.3
                });
                conn.line.material.color.setHex(this.colors.connection);
            }
        });
        
        this.hoveredNode = null;
    }
    
    onClick(e) {
        if (this.hoveredNode) {
            this.selectNode(this.hoveredNode, e.clientX, e.clientY);
        } else {
            this.deselectNode();
        }
    }
    
    selectNode(node, x, y) {
        this.selectedNode = node;
        
        const popup = document.getElementById('cvNodeInfo');
        if (!popup) return;
        
        // Position popup
        const rect = this.container.getBoundingClientRect();
        popup.style.left = (x - rect.left + 20) + 'px';
        popup.style.top = (y - rect.top - 100) + 'px';
        
        // Update content
        popup.querySelector('.cv-node-info-title').textContent = node.label;
        
        const rows = popup.querySelectorAll('.cv-node-info-row');
        if (rows[0]) {
            const val = rows[0].querySelector('.cv-node-info-value');
            val.textContent = node.status.toUpperCase();
            val.className = 'cv-node-info-value ' + node.status;
        }
        if (rows[1]) {
            rows[1].querySelector('.cv-node-info-value').textContent = node.connections?.length || 0;
        }
        if (rows[2]) {
            rows[2].querySelector('.cv-node-info-value').textContent = 'LAYER ' + node.layer;
        }
        
        popup.querySelector('.cv-node-info-desc').textContent = node.desc;
        
        // Show with animation
        popup.classList.add('visible');
        
        // Auto hide after 4 seconds
        setTimeout(() => this.deselectNode(), 4000);
    }
    
    deselectNode() {
        this.selectedNode = null;
        const popup = document.getElementById('cvNodeInfo');
        if (popup) popup.classList.remove('visible');
    }
    
    onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 50 : -50;
        
        gsap.to(this.camera.position, {
            z: Math.max(200, Math.min(800, this.camera.position.z + delta)),
            duration: 0.3,
            ease: 'power2.out',
            onUpdate: () => this.updateZoomLevel()
        });
    }
    
    zoomIn() {
        gsap.to(this.camera.position, {
            z: Math.max(200, this.camera.position.z - 80),
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: () => this.updateZoomLevel()
        });
    }
    
    zoomOut() {
        gsap.to(this.camera.position, {
            z: Math.min(800, this.camera.position.z + 80),
            duration: 0.5,
            ease: 'power2.out',
            onUpdate: () => this.updateZoomLevel()
        });
    }
    
    resetView() {
        gsap.to(this.camera.position, {
            x: 0, y: 0, z: 500,
            duration: 0.8,
            ease: 'power2.out',
            onUpdate: () => this.updateZoomLevel()
        });
        
        gsap.to(this.nodesGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.out' });
        gsap.to(this.connectionsGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.out' });
        gsap.to(this.particlesGroup.rotation, { x: 0, y: 0, z: 0, duration: 0.8, ease: 'power2.out' });
    }
    
    updateZoomLevel() {
        const el = document.getElementById('cvZoomLvl');
        if (el) {
            const zoom = Math.round((1 - (this.camera.position.z - 200) / 600) * 100 + 50);
            el.textContent = zoom + '%';
        }
    }
    
    start() {
        this.isActive = true;
        this.animate();
        console.log('[NEURAL-THREEJS] Animation started');
    }
    
    stop() {
        this.isActive = false;
        console.log('[NEURAL-THREEJS] Animation stopped');
    }
    
    animate() {
        if (!this.isActive) return;
        
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        this.time += delta;
        
        // Animate particles along curves
        this.particles.forEach(particle => {
            const data = particle.userData;
            data.progress += data.speed * data.direction;
            
            if (data.progress > 1) data.progress = 0;
            if (data.progress < 0) data.progress = 1;
            
            const point = data.connection.curve.getPoint(data.progress);
            particle.position.copy(point);
            
            // Pulse opacity
            particle.material.opacity = 0.5 + Math.sin(this.time * 5 + data.progress * 10) * 0.3;
        });
        
        // Animate node rings
        this.nodes.forEach(node => {
            if (node.ring) {
                node.ring.rotation.z += delta * 0.5;
            }
            
            // Pulse glow based on status
            if (node.glow && node.status === 'exceptional') {
                node.glow.material.opacity = 0.15 + Math.sin(this.time * 3) * 0.1;
            }
        });
        
        // Rotate background particles slightly
        if (this.bgParticles) {
            this.bgParticles.rotation.y += delta * 0.02;
        }
        
        // Update time bar
        const timeFill = document.getElementById('cvTimeFill');
        if (timeFill) {
            const progress = (this.time % 60) / 60 * 100;
            timeFill.style.width = progress + '%';
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    destroy() {
        this.stop();
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
        
        console.log('[NEURAL-THREEJS] Destroyed');
    }
}
