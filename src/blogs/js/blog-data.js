/* =============================================
   BLOG DATA MODULE
   ============================================= */

/* =============================================
   SVG DIAGRAM BUILDERS
   Generate isometric 3D layer diagrams as
   inline SVG markup for blog content
   ============================================= */


   
const THICKNESS = 5;
const FONT_SIZE = 6.5;

function buildLayer({ text, gradient, size, offset = [0, 0] }) {
    const w = size;
    const h = 40 * (size / 100);
    const t = THICKNESS;
    const gid = 'g' + Math.random().toString(36).slice(2, 8);
    const fid = 'f' + Math.random().toString(36).slice(2, 8);
    const fs = FONT_SIZE * size / 100;
    const tx = 49 * size / 100;
    const ty = 7 * size / 100;

    return `
        <g class="layer" style="--offset-x:${offset[0]}px; --offset-y:${offset[1]}px; --size:${size};" data-sound-hover="tick">
            <path d="M0,${h / 2 + t} v${-t} L${w / 2},0 L${w},${h / 2} v${t} L${w / 2},${h + t} Z" fill="url(#${gid})" filter="url(#${fid})"/>
            <path class="face-left" d="M0,${h / 2 + t} v${-t} L${w / 2},${h} v${t} Z"/>
            <path class="face-right" d="M${w / 2},${h + t} v${-t} L${w},${h / 2} v${t} Z"/>
            <text x="0" y="0" dominant-baseline="middle" text-anchor="middle"
                  style="font-size:${fs}px; transform:skew(-68deg,22deg) translate(${tx}px,${ty}px) scaleY(0.5);">
                ${text}
            </text>
            <defs>
                <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${gradient[0]}"/>
                    <stop offset="100%" stop-color="${gradient[1]}"/>
                </linearGradient>
                <filter id="${fid}" filterUnits="userSpaceOnUse" x="-10" y="-10" width="120" height="120">
                    <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="${gradient[0]}" flood-opacity="0.2"/>
                    <feDropShadow dx="0" dy="-1" stdDeviation="2" flood-color="${gradient[0]}" flood-opacity="0.15"/>
                </filter>
            </defs>
        </g>
    `;
}

function buildDiagram(layers, viewBox = '0 0 100 90', extraSvg = '') {
    const layerMarkup = layers.map(l => buildLayer(l)).join('\n');
    return `
        <div class="diagram-wrap" data-sound="knock">
            <svg class="layers-svg" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
                ${extraSvg}
                ${layerMarkup}
            </svg>
        </div>
    `;
}

/* --- Pre-built diagrams --- */

const DIAGRAM_SINGLETON = buildDiagram([
    { text: 'UI',           gradient: ['#E42746', '#E42795'], offset: [52, 52], size: 42 },
    { text: 'State',        gradient: ['#E42746', '#E42795'], offset: [0, 52],  size: 42 },
    { text: 'Events',       gradient: ['#E42746', '#E42795'], offset: [26, 62], size: 42 },
    { text: 'Manager',      gradient: ['#3186ab', '#3153AB'], offset: [0, 22],  size: 100 },
    { text: 'Singleton',    gradient: ['#11eda1', '#11edda'], offset: [0, 0],   size: 100 },
], '0 0 100 95');

const DIAGRAM_CORE = buildDiagram([
    { text: 'Music',     gradient: ['#f59e0b', '#f97316'], offset: [56, 55], size: 38 },
    { text: 'Anim',      gradient: ['#8b5cf6', '#7c3aed'], offset: [0, 55],  size: 38 },
    { text: 'Nav',        gradient: ['#ec4899', '#db2777'], offset: [28, 64], size: 38 },
    { text: 'Gallery',    gradient: ['#06b6d4', '#0891b2'], offset: [56, 38], size: 38 },
    { text: 'Contact',    gradient: ['#10b981', '#059669'], offset: [0, 38],  size: 38 },
    { text: 'Core',       gradient: ['#3b82f6', '#2563eb'], offset: [0, 5],   size: 100 },
], '0 0 100 100');

const DIAGRAM_MOTHER_CORE = buildDiagram([
    { text: 'Music',       gradient: ['#f59e0b', '#f97316'], offset: [54, 72], size: 32 },
    { text: 'SFX',         gradient: ['#f59e0b', '#f97316'], offset: [18, 72], size: 32 },
    { text: 'Audio Core',  gradient: ['#e44b27', '#e4276e'], offset: [0, 52],  size: 70 },
    { text: 'Nav',         gradient: ['#8b5cf6', '#7c3aed'], offset: [88, 72], size: 32 },
    { text: 'Anim',        gradient: ['#8b5cf6', '#7c3aed'], offset: [54, 72], size: 32 },
    { text: 'UI Core',     gradient: ['#7c3aed', '#6d28d9'], offset: [35, 52], size: 70 },
    { text: 'Gallery',     gradient: ['#06b6d4', '#0891b2'], offset: [123, 72], size: 32 },
    { text: 'Filters',     gradient: ['#06b6d4', '#0891b2'], offset: [88, 72], size: 32 },
    { text: 'Media Core',  gradient: ['#0e7490', '#0891b2'], offset: [70, 52], size: 70 },
    { text: 'Mother Core', gradient: ['#11eda1', '#11edda'], offset: [0, 5],   size: 140 },
], '-5 0 145 110', `
    <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
            <path d="M0,0 L6,2 L0,4" fill="rgba(180,205,255,0.5)"/>
        </marker>
    </defs>
    <line class="signal-arrow" x1="35" y1="50" x2="35" y2="30" stroke-dasharray="4 2"/>
    <line class="signal-arrow" x1="70" y1="50" x2="70" y2="30" stroke-dasharray="4 2"/>
    <line class="signal-arrow" x1="105" y1="50" x2="105" y2="30" stroke-dasharray="4 2"/>
`);

const DIAGRAM_EVENT_FLOW = buildDiagram([
    { text: 'emit()',      gradient: ['#f43f5e', '#e11d48'], offset: [52, 56], size: 40 },
    { text: 'listen()',    gradient: ['#a855f7', '#9333ea'], offset: [0, 56],  size: 40 },
    { text: 'Event Bus',   gradient: ['#6366f1', '#4f46e5'], offset: [0, 28],  size: 100 },
    { text: 'Core Hub',    gradient: ['#11eda1', '#11edda'], offset: [0, 0],   size: 100 },
], '0 0 100 95');


/* =============================================
   BLOG ENTRIES
   ============================================= */

const blogData = [
    {
        id: 'project-launch',
        title: 'Project Launch: Building My New Portfolio',
        subtitle: 'A journey through creating a modern, interactive portfolio website with vanilla JavaScript and beautiful animations.',
        author: 'Skyedev',
        date: 'October 25, 2025',
        avatar: '/src/assets/pfp-photo.jpg',
        cover: '/src/assets/blogs_assets/cover-blog-project-launch.JPG',
        tags: ['portfolio', 'javascript', 'design', 'glassmorphism'],
        category: 'Dev',
        pages: [
            {
                content: `
                    <h2>Introduction</h2>
                    <p>Welcome to my new portfolio! This isn't my first time building a portfolio website, but it's definitely the most ambitious one yet. As someone who's chronically ill and needs to be mindful of my energy levels, I've learned to pace myself while working on passion projects like this. The combination of frequent medical appointments and managing my health takes up a significant portion of my time, but I'm determined to create something beautiful and functional.</p>
                    <p>Honestly, my first portfolio was pretty sick too! I mean, I liked it at the beginning, but then I started to believe that I could do better than that and explore a new style or... continue my style, in a new way. As you can notice, I really love some effects and designs in particular, and this is kinda obvious when we see my other personal website, <a href="https://luvrksknskyejourney.org/" target="_blank"><strong>luvrksknskyejourney↗</strong></a> when we pay attention to the details. I ABSOLUTELY LOVE glassmorphism and the UI of iOS/macOS and other OS like Arch Linux or Debian with Hyprland. I love clean design, but also with some personal touch and color.</p>
                    <div class="info-box">
                        <div class="info-box__title">Project Overview</div>
                        <div class="info-box__content">A modern, interactive portfolio website built with vanilla JavaScript using a modular architecture. Features smooth animations, dynamic content loading, and interactive elements designed to showcase my work and personality.</div>
                    </div>
                    <h2>Design</h2>
                    <p>The design of this portfolio is inspired by modern UI trends, particularly the beautiful glass morphism aesthetic that's become popular in recent years. I wanted to create something that feels both contemporary and timeless, with careful attention to every detail. At least that's what I try to achieve.</p>
                    <h3>Visual Elements</h3>
                    <ul>
                        <li><strong>Glass Morphism:</strong> Translucent panels with backdrop-filter blur effects create depth and visual interest</li>
                        <li><strong>Smooth Animations:</strong> Every interaction is accompanied by carefully crafted transitions and animations</li>
                        <li><strong>Video Background:</strong> A dynamic background that adds movement without being distracting</li>
                        <li><strong>Color Palette:</strong> Subtle gradients and carefully chosen colors that work in harmony</li>
                    </ul>
                `
            },
            {
                content: `
                    <h2>Technical Architecture</h2>
                    <p>One of the things I'm most proud of is the modular architecture I implemented. Instead of writing spaghetti code in a single file (like my first portfolio or like I'm used to lol), I organized everything into separate manager classes that handle specific functionality. Each module has the necessary imports from other modules, exports its class as a singleton, global registration for compatibility, communication methods between modules, and an event system for coordination. Index.js imports and coordinates everything as the main entry point, while core.js is the central coordinator that handles all the managers.</p>
                    <h3>Core Structure</h3>
                    <ul>
                        <li><strong>Core:</strong> The brain of the application, coordinating all other managers</li>
                        <li><strong>NavigationManager:</strong> Handles smooth page transitions and routing</li>
                        <li><strong>AnimationsManager:</strong> Controls all animations and visual effects</li>
                        <li><strong>MusicManager/SoundManager:</strong> Manages the audio player and playlist, manages also the sound effects of the UI</li>
                        <li><strong>GalleryManager:</strong> Handles the image gallery with categories</li>
                        <li><strong>ContactManager:</strong> Manages the contact form and messaging</li>
                    </ul>
                    <h3>Key Features</h3>
                    <ul>
                        <li><strong>Music Player:</strong> An integrated audio player with playlist support</li>
                        <li><strong>Photo Gallery:</strong> A categorized image gallery with smooth transitions</li>
                        <li><strong>YouTube Integration:</strong> Embedded video with custom controls</li>
                        <li><strong>iMessage-Style Chat:</strong> A unique contact interface that mimics Apple's iMessage</li>
                        <li><strong>Dark/Light Mode:</strong> Theme switching with persistent preferences</li>
                        <li><strong>Interactive Panels:</strong> Hover effects and animations on every element</li>
                    </ul>
                `
            },
            {
                content: `
                    <h2>Development Process</h2>
                    <p>Building this portfolio has been and still is a learning experience. I wanted to challenge myself by using vanilla JavaScript instead of relying on frameworks like React or Vue. This decision taught me a lot about DOM manipulation, event handling, and state management. In fact, almost all the time I love to use vanilla Javascript tbh, it's just so flexible and powerful.</p>
                    <p>Here are some of the development techniques I employed:</p>
                    <ul>
                        <li>Used CSS transforms and opacity for better animation performance</li>
                        <li>Implemented lazy loading for images and media</li>
                        <li>Built a centralized sound manager to coordinate all audio playback</li>
                    </ul>
                    <h2>What's Next</h2>
                    <p>This portfolio is a living project that will continue to evolve. I have several features planned for future updates:</p>
                    <ul>
                        <li><strong>Project Case Studies:</strong> Detailed breakdowns of my work</li>
                        <li><strong>Interactive Demos:</strong> Live examples of my code experiments</li>
                        <li><strong>Multilingual Support:</strong> Content in English and Spanish maybe...</li>
                    </ul>
                    <h2>Personal Thoughts</h2>
                    <p>Creating this portfolio has been more than just a technical exercise, it's been a way to express myself and my journey as a developer. Every animation, every color choice, every interaction has been carefully considered to reflect who I am and what I care about.</p>
                    <p>I'm grateful for my boyfriend, who's also a developer and has been incredibly supportive throughout this process. He made the entire backend of this portfolio possible, and his insights have been invaluable.</p>
                    <h2>Thank You</h2>
                    <p>If you've made it this far, thank you for taking the time to read about my journey. I hope this portfolio inspires you in some way, whether you're a fellow developer, a potential friend, or just someone who appreciates good design.</p>
                    <p>Feel free to explore the rest of the site, check out my work, and don't hesitate to reach out if you'd like to connect. The code for this portfolio is open source, so if you want to use any part of it for your own projects, please do!</p>
                `
            }
        ]
    },
    {
        id: 'vanilla-js-modules',
        title: 'Vanilla JS Modular Architecture',
        subtitle: 'How to structure a complex web app without frameworks, using ES modules and singleton patterns.',
        author: 'Skyedev',
        date: 'March 04, 2026',
        avatar: '/src/assets/pfp-photo.jpg',
        cover: '/src/assets/blogs_assets/blue-sea.gif',
        tags: ['javascript', 'architecture', 'modules', 'vanilla'],
        category: 'JS',
        pages: [
            {
                content: `
                    <h2>Why Vanilla?</h2>
                    <p>Frameworks are great, but there's something powerful about understanding the raw platform. By building with vanilla JavaScript, you learn DOM manipulation, event handling, and state management at a fundamental level. And I need to be honest, since I learned to program in vanilla JS, I appreciate the control and flexibility it provides. I learned to program by doing "old school" JavaScript. Doing document.querySelector and manipulating the DOM directly was my first taste of web interactivity. And while it was a chaos of scripts at first, with experience, that foundation gave me something that frameworks sometimes take away! And I think that's the beauty of vanilla JavaScript. When I use vanilla, I'm the one who decides how everything is structured. There are no framework rules, no "wrong" ways (well, there are, but they're my mistakes). There's a freedom that, for personal projects or portfolios, is incredibly liberating.</p>
                    <p>My portfolio uses a modular singleton pattern where each manager handles a specific domain. They communicate through a central Core, keeping things clean and decoupled. I was so excited at first to try this way of coding tbh, considering the benefits of a more maintainable and scalable code and how was my procress building the Skye Journey Site, which I created with so much love. 'Skyedev' and 'Skye Journey' are totally different websites and still, they are special for me.</p>

                    <p>As a creator and developer, I always feel that my creativity has two distinct facets, and that's reflected in my two websites. Skye Journey <a href="https://luvrksknskyejourney.org/" target="_blank" rel="noopener noreferrer">(https://luvrksknskyejourney.org/↗)</a> is my most intimate and personal space. It's like an open journal for the world, where I share experiences, reflections, and progress in my life. It was also the first website I decided to build on my own in a creative and experimental way. Its welcoming design always calms me and helps me relax. Even though its code is a mess, man, I love Skye Journey.</p>

                    <p>Skydev <a href="https://luvrksnsnskyedev.space/" target="_blank" rel="noopener noreferrer">(https://luvrksnsnskyedev.space/↗)</a> is my... laboratory? I mean, yes, it's an interactive, futuristic, and experimental site, full of animations, sound effects, and sensory navigation. Here, I not only share ideas but also play with technology and web design, creating an immersive experience that reflects my more technical and exploratory side. I suppose both websites share something of each other, almost like twins. Skyedev is the younger and more organized website compared to Skye Journey, though. Both are special to me, and I hope they can be special to you too. Besides their differences... They share something in common! They are both made with vanilla Javascript. Skyedev was made with this modular approach similar to React! And you can check more about that stoping by my <a href="https://github.com/luvrksnskye/luvrksnsnskyedev" target="_blank" rel="noopener noreferrer">(Github Repository↗)</a> and my first blog, "(Project Launch: Building My New Portfolio↗)"</p>

                    <p>Anyways, let's dive into the architecture of this modular vanilla JavaScript approach and how it can help you build complex web applications without relying on frameworks. I'll probably talk more about the way I try to usually build these applications.</p>
                `
            },
            {
                content: `
                    <h2>The Singleton Manager Pattern</h2>
                    <p>At the heart of this architecture is a concept borrowed from classical software engineering: the Singleton. In our context, a singleton is a class that only has one instance throughout the entire application lifecycle. You create it once, export it, and every file that imports it gets the exact same object. This is critical because it means state is centralized within each domain. There's no confusion about "which instance" holds the current playlist or which NavigationManager is tracking the active route. There is only one, and everyone shares it.</p>

                    <p>Here's the mental model. Think of each Manager as a self-contained island. It has its own private state (variables, DOM references, timers), its own public API (methods other modules can call), and its own internal logic. Nothing leaks out unless explicitly exported. The singleton wrapper at the bottom of the file ensures that when you write <code>import musicManager from './music-manager.js'</code>, you always get the same living instance, not a fresh copy.</p>

                    ${DIAGRAM_SINGLETON}
                    <p class="diagram-caption">Each Manager is a singleton: one instance with its own UI bindings, internal state, and event listeners, all wrapped in a single exportable object.</p>

                    <p>The practical benefit is enormous. Imagine your MusicManager holds the current track index, playback state, and volume level. If it were not a singleton, different parts of your app could accidentally create separate instances, each with diverging state. Your play/pause button might toggle one instance while the visualizer reads from another. With a singleton, this entire class of bugs vanishes. Everyone reads and writes to the same source of truth.</p>

                    <h2>Why Not Just Global Variables?</h2>
                    <p>You might ask: "If there's only one instance, isn't that basically a global variable?" The distinction matters. A global variable is unstructured data floating in the window scope. A singleton manager is an encapsulated object with a defined interface. You can't accidentally overwrite its internal state from outside because JavaScript modules have their own scope. The module system itself acts as the encapsulation boundary. You get the convenience of global access with the safety of structured code.</p>

                    <p>Furthermore, each manager can enforce its own invariants. The MusicManager can ensure that volume never goes below 0 or above 1 by validating in its <code>setVolume()</code> method. A plain global variable offers no such protection. This is the difference between "shared state" and "managed state", and it's what makes the singleton pattern viable for real applications, not just toy examples.</p>
                `
            },
            {
                content: `
                    <h2>The Core: Central Nervous System</h2>
                    <p>With multiple managers operating independently, you need a way for them to coordinate without directly depending on each other. This is where the Core comes in. Think of the Core as the central nervous system of your application. It doesn't do the actual work of playing music or animating elements. Instead, it knows about every manager and provides a communication channel between them.</p>

                    ${DIAGRAM_CORE}
                    <p class="diagram-caption">The Core sits at the foundation. Every Manager registers with it and communicates through it, never directly referencing sibling managers.</p>

                    <p>The Core typically implements two key mechanisms. First, a registry where each manager registers itself during initialization. This allows any manager to request a reference to another through the Core, rather than importing it directly. Second, an event bus, a simple publish/subscribe system where managers can emit named events and other managers can listen for them. When the MusicManager starts a new track, it emits something like <code>core.emit('track:changed', trackData)</code>. The AnimationsManager, which has subscribed to that event, receives the data and triggers the appropriate visual response. Neither manager imports the other. They only know about the Core.</p>

                    ${DIAGRAM_EVENT_FLOW}
                    <p class="diagram-caption">The event bus pattern: managers emit events upward to the Core, which broadcasts them to all registered listeners.</p>

                    <h2>Decoupling in Practice</h2>
                    <p>This decoupling has profound practical implications. Suppose you want to add a new VisualizerManager that reacts to audio data. Without the Core pattern, you'd have to open the MusicManager, import the VisualizerManager, and wire them together. Every new feature creates a new import dependency, and the dependency graph becomes a tangled web. With the Core pattern, the VisualizerManager simply subscribes to <code>'track:changed'</code> and <code>'audio:data'</code> events. The MusicManager doesn't change at all. It doesn't even know the VisualizerManager exists. This is the same principle that makes component systems in game engines like Godot so powerful: entities don't know about each other, they communicate through signals.</p>

                    <p>The event bus implementation itself can be surprisingly simple. At its core (no pun intended), it's just an object mapping event names to arrays of callback functions. The <code>emit()</code> method iterates over the relevant array and calls each callback. The <code>on()</code> method pushes a new callback into the array. You can add <code>off()</code> for cleanup and <code>once()</code> for single-fire listeners. That's it. Twenty lines of code that fundamentally change how your application scales.</p>
                `
            },
            {
                content: `
                    <h2>When One Core Isn't Enough</h2>
                    <p>The single-Core architecture works beautifully for small to medium applications. But as your project grows, you might notice a problem: the Core becomes a bottleneck. Every event from every manager passes through the same hub. The event listener map grows large. Debugging becomes harder because every event fires at the Core level, and you have to filter through noise to find what you're looking for. Initialization order becomes fragile because all managers register at the same point. This is where the idea of the Mother Core emerges.</p>

                    <h2>The Mother Core Architecture</h2>
                    <p>A Mother Core is essentially a "Core of Cores." Instead of having one flat hub that every manager connects to, you organize your managers into logical domains. Each domain gets its own specialized Core (a "Child Core"), and the Mother Core sits above them, coordinating inter-domain communication while leaving intra-domain communication to the Child Cores.</p>

                    ${DIAGRAM_MOTHER_CORE}
                    <p class="diagram-caption">The Mother Core architecture: Child Cores handle their own domain's events internally. The Mother Core only mediates cross-domain communication.</p>

                    <p>Consider a concrete example. Your application has an audio domain (MusicManager, SoundEffectsManager, AudioVisualizerManager), a UI domain (NavigationManager, LayoutManager, AnimationsManager, ThemeManager), and a media domain (GalleryManager, FiltersManager, LightboxManager). Each domain's managers communicate frequently with each other but rarely with managers in other domains. The Audio Core handles all audio-related events internally. The UI Core manages layout and animation coordination. The Media Core handles gallery state.</p>

                    <p>When cross-domain communication is needed, for example, when the user navigates to a new page and the music should crossfade, the UI Core emits a <code>'domain:navigation:changed'</code> event upward to the Mother Core. The Mother Core routes it to the Audio Core, which tells the MusicManager to crossfade. The key insight is that most events stay within their domain. Only the truly cross-cutting concerns bubble up to the Mother Core, dramatically reducing the noise at the top level.</p>

                    <h3>Isolation and Testability</h3>
                    <p>This isolation has a wonderful side effect: each Child Core becomes independently testable. You can instantiate the Audio Core in a test environment, register mock managers, emit events, and verify behavior without any UI or media infrastructure loaded. The domains are genuinely independent subsystems that happen to cooperate through a well-defined interface. This is the same principle behind microservices in backend architecture, but applied at the module level within a single-page application.</p>

                    <h3>The Routing Layer</h3>
                    <p>The Mother Core's routing logic can be as simple or sophisticated as you need. At its simplest, it's another event bus where Child Cores emit and listen. At its most advanced, it could implement priority queues (some cross-domain events are more urgent than others), event transformation (translating domain-specific event shapes into a common format), or even middleware-style interceptors that can modify or block events before they reach their destination. You decide how far to take it based on your application's complexity.</p>
                `
            },
            {
                content: `
                    <h2>Implementation Patterns</h2>
                    <p>Let me walk through the concrete patterns that make this architecture work in practice. These aren't abstract ideas; they're the exact techniques I use in my projects.</p>

                    <h3>The Manager Template</h3>
                    <p>Every manager follows the same structural template. It has a <code>constructor()</code> that initializes private state to sensible defaults. It has an <code>init()</code> method that receives references (usually DOM elements and a Core instance) and sets up event listeners. It has domain-specific methods that perform the actual work. And at the bottom of the file, a singleton instance is created and exported.</p>

                    <pre><code>class MusicManager {
    constructor() {
        this.core = null;
        this.currentTrack = 0;
        this.isPlaying = false;
        this.audioEl = null;
    }

    init(core) {
        this.core = core;
        this.audioEl = document.getElementById('audioPlayer');
        this.bindEvents();
        this.core.on('track:request', (id) => this.loadTrack(id));
    }

    play() {
        this.audioEl.play();
        this.isPlaying = true;
        this.core.emit('music:playing', this.currentTrack);
    }

    loadTrack(id) {
        this.currentTrack = id;
        this.core.emit('track:changed', { id });
    }

    bindEvents() { /* DOM listeners */ }
}

const musicManager = new MusicManager();
export default musicManager;</code></pre>

                    <p>Notice the pattern: the constructor is pure (no side effects, no DOM access), <code>init()</code> is where the real wiring happens, and the singleton export at the bottom ensures a single shared instance. This separation between construction and initialization is important because it allows you to control the order in which things start up. The Core can instantiate all managers first, then call <code>init()</code> on each one in the correct order.</p>

                    <h3>The Core Template</h3>
                    <p>The Core itself follows the same principle, but its job is coordination rather than domain logic. It maintains a registry of managers and an event bus. During startup, it imports all managers, registers them, and calls their <code>init()</code> methods in the correct dependency order.</p>

                    <pre><code>class Core {
    constructor() {
        this.managers = new Map();
        this.listeners = new Map();
    }

    register(name, manager) {
        this.managers.set(name, manager);
    }

    get(name) {
        return this.managers.get(name);
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, data) {
        const cbs = this.listeners.get(event);
        if (cbs) cbs.forEach(cb => cb(data));
    }

    async init() {
        for (const [name, mgr] of this.managers) {
            await mgr.init(this);
        }
    }
}</code></pre>

                    <p>Twenty-some lines, and you have a fully functional coordination hub. The <code>register/get</code> methods provide the service locator pattern. The <code>on/emit</code> methods provide the pub/sub pattern. Together, they give managers two ways to communicate: direct method calls (via <code>core.get('music').play()</code>) for imperative operations, and events (via <code>core.emit()</code>) for reactive, decoupled notifications. Choosing between the two is a judgment call. Use direct calls when you need a return value or when the operation is a command. Use events when you're broadcasting a state change that zero or more listeners might care about.</p>
                `
            },
            {
                content: `
                    <h2>Scaling Considerations</h2>
                    <p>Let's be honest about the tradeoffs. This architecture is not free. It adds conceptual overhead compared to just writing imperative code in a single file. You have to think about module boundaries, event naming conventions, initialization order, and the lifecycle of each manager. For a small project (a landing page, a simple form), this is overkill. The sweet spot is medium to large single-page applications where multiple independent systems need to coexist and evolve independently. If you find yourself managing more than four or five independent features that interact with each other, this pattern starts paying for itself immediately.</p>

                    <h3>Error Boundaries</h3>
                    <p>One thing frameworks give you for free is error boundaries. In React, a component that throws during render is caught by the nearest error boundary. In our vanilla architecture, an error in one manager's event handler could crash the entire event dispatch loop. A simple mitigation is wrapping each callback invocation in a try/catch within the <code>emit()</code> method. This way, a bug in the AnimationsManager won't prevent the MusicManager from receiving the same event. It's a small addition that dramatically improves resilience.</p>

                    <h3>Memory and Cleanup</h3>
                    <p>Singleton managers live for the entire duration of the page. This is usually fine, but if your application has routes where entire sections of UI are created and destroyed, you need to be careful about DOM references. A manager that caches a reference to a DOM element that gets removed will hold a stale reference. The solution is a <code>destroy()</code> or <code>cleanup()</code> method on each manager that nullifies DOM references and removes event listeners. The Core can call these methods during navigation transitions, then re-call <code>init()</code> when the new view is ready.</p>

                    <h2>Final Thoughts</h2>
                    <p>This modular architecture isn't a replacement for frameworks. It's an alternative for developers who want to understand the fundamentals, who value control over convention, or who are building projects where the overhead of a framework isn't justified. The patterns here, singletons, service locators, event buses, domain isolation, are framework-agnostic concepts that will serve you well regardless of what tools you use in the future. React's useContext is a service locator. Vue's event bus (before it was deprecated) was exactly what we built here. Angular's dependency injection is a more sophisticated version of our Core registry. By building these patterns yourself, you develop an intuition for why they exist and when to reach for them.</p>

                    <p>For me, the idea behind Mother Core is like creating a modular universe within Vanilla JS. Each Core is a planet, and the Mother Core is the sun that keeps them in orbit. It sounds ambitious, but the beauty of Vanilla JS is that you can experiment and build these architectures your way, even with personal projects like Skyedev. The freedom to shape your own structure, to make your own mistakes and learn from them, that's what keeps me coming back to vanilla JavaScript every time.</p>

                    <p>If you've made it this far, I hope this deep dive gave you a clearer picture of how to structure complex applications without reaching for a framework. The diagrams above are interactive, hover over the layers to see how the pieces connect. And if you want to see these patterns in action, check out the <a href="https://github.com/luvrksnskye/luvrksnsnskyedev" target="_blank" rel="noopener noreferrer">Skyedev source code</a> on GitHub. Happy building!</p>
                `
          }
        ]
    },
        {
    id: 'fluid-animations',
    title: 'Fluid Animations: The Apple Approach',
    subtitle: 'How to use spring physics and timing functions to create natural, engaging animations in web interfaces.',
    author: 'Skyedev',
    date: 'March 04, 2026',
    avatar: '/src/assets/pfp-photo.jpg',
    cover: '/src/assets/blogs_assets/icon.gif',
    tags: ['animaciones', 'css', 'javascript', 'springs', 'apple', 'ui'],
    category: 'Dev',
    pages: [
        {
            content: `
<div class="animation-article">
    <h2>Why animations actually matter</h2>
    <p>Apple hit the nail on the head at WWDC 2018: a truly fluid interface should feel like an <strong>extension of your own mind.</strong> Think about it! when you reach for a coffee mug, your hand doesn't move at a robotic, constant speed. It has weight, it builds momentum, and it slows down naturally as it arrives. When an app mimics that "physicality," it stops feeling like code and starts feeling like a real, tangible object.</p>

    <p>That tiny bounce you see on an iOS button? That’s not just "eye candy." It’s the app nodding back at you, saying, <em>"Got it! I'm on it."</em> Without these touches, an app feels like a flat cardboard cutout; with them, it feels like a piece of polished glass sliding under your fingertips.</p>

    <div class="info-box">
        <div class="info-box__title">About Animations</div>
        <div class="info-box__content">A great animation is like a good waiter: it’s always there when you need it, but you never actually notice it working. If a user consciously stops to think, "Wow, look at that animation," it might be distracting them from the task at hand. The best movement is the one that just feels "right."</div>
    </div>

    <h3>Linear vs. Spring: The "Robot" vs. The "Human"</h3>
    <p>Check out this comparison. On the left, we have <code>linear</code> it’s how a robot moves, starting and stopping abruptly like a light switch. On the right, the <strong>Spring</strong> curve has "spirit." It accelerates, overshoots its goal slightly, and settles into place. Hover over them and feel the difference:</p>

    <div class="anim-example">
        <div class="comparison-row">
            <div class="comparison-item">
                <span class="comparison-item__label">Linear (The Robot)</span>
              <div class="hover-card-demo hover-card-demo--linear">
    <img src="/src/assets/support.png" alt="Animated object">
</div>
            </div>
            <div class="comparison-item">
                <span class="comparison-item__label">Spring (The Human)</span>
                <div class="hover-card-demo hover-card-demo--spring">
                     <img src="/src/assets/support.png" alt="Animated object">
                </div>
            </div>
        </div>
        <p class="anim-example__description">The linear version is a bit rigid. The spring version "breathes"—it has a subtle bounce that feels much more organic to our human eyes.</p>
    </div>

    <h2>Timing Functions: The personality of movement</h2>
    <p>In the world of CSS, a <em>timing function</em> is essentially the <strong>personality</strong> you give to an object. It defines the "vibe" of the movement:</p>
    
    <ul>
        <li><code>linear</code> is a <strong>boring robot</strong> walking at a constant pace.</li>
        <li><code>ease</code> is a <strong>person</strong> taking a relaxed stroll.</li>
        <li><code>cubic-bezier(0.34, 1.56, 0.64, 1)</code>? That’s a <strong>cat</strong> pouncing onto a table.</li>
    </ul>

    <p>The graph below maps time (X) against progress (Y). Pick a personality, watch the curve, and hit play to see it in action:</p>

    <div class="demo-container" data-demo="timing-graph">
        <span class="demo-label">Timing Functions Graph</span>
        <div class="timing-graph">
            <canvas class="timing-graph__canvas"></canvas>
            <div class="timing-graph__controls">
                <button class="timing-btn timing-btn--active" data-timing="ease">ease</button>
                <button class="timing-btn" data-timing="linear">linear</button>
                <button class="timing-btn" data-timing="ease-in">ease-in</button>
                <button class="timing-btn" data-timing="ease-out">ease-out</button>
                <button class="timing-btn" data-timing="ease-in-out">ease-in-out</button>
                <button class="timing-btn" data-timing="spring">spring</button>
                <button class="timing-btn" data-timing="steps(5)">steps(5)</button>
                <button class="timing-btn" data-timing="steps(3)">steps(3)</button>
            </div>
        </div>

        <div class="timing-ball-track">
            <div class="timing-ball"></div>
        </div>

        <button class="timing-play-btn">
            <svg viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 13,8 3,15"/></svg>
            Play
        </button>
    </div>

    <h2>Steps: The "Flipbook" effect</h2>
    <p>Sometimes you don't want a smooth slide; you want a jump. The <code>steps()</code> function is like an old-school <strong>flipbook animation</strong> or a ticking clock. Instead of a continuous flow, it clicks into specific frames. This is exactly what you need for "sprite" animations or loading icons that need to feel snappy and rhythmic.</p>

    <div class="demo-container" data-demo="steps-visualizer">
        <span class="demo-label">Steps Visualizer</span>
        <div class="steps-demo-strip">
            <div class="steps-demo-frame">1</div>
            <div class="steps-demo-frame">2</div>
            <div class="steps-demo-frame">3</div>
            <div class="steps-demo-frame">4</div>
            <div class="steps-demo-frame">5</div>
            <div class="steps-demo-frame">6</div>
            <div class="steps-demo-frame">7</div>
            <div class="steps-demo-frame">8</div>
        </div>
        <button class="timing-play-btn">
            <svg viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 13,8 3,15"/></svg>
            Play Steps
        </button>
    </div>

    <h2>Cubic Bezier: Your precision steering wheel</h2>
    <p>Behind almost every smooth movement is a Cubic Bezier curve. Don't let the math name scare you—it’s just a way to draw a path between "Start" and "Finish." By pulling on two "invisible handles," you shape how the animation flows.</p>

    <p>If you pull a handle high enough (beyond 1.0), the animation will "overshoot" its goal. Imagine throwing a ball slightly past a line and having it roll back—that’s the secret to those satisfying, springy bounces. Apple doesn't use generic settings; they hand-tune these curves for every single interaction.</p>

    <h2>Springs: Nature’s favorite code</h2>
    <p>Spring animations are the "secret sauce" behind everything that feels high-end in iOS or macOS. Instead of telling an object <em>how long</em> to move, you give it <strong>physical traits</strong> and let physics do the work:</p>

    <ul>
        <li><strong>Mass:</strong> How heavy is the object? (A bowling ball vs. a feather).</li>
        <li><strong>Stiffness:</strong> How tight is the spring? (A porch swing vs. a pogo stick).</li>
        <li><strong>Damping:</strong> How much "friction" is in the air? (Moving through water vs. moving through honey).</li>
    </ul>

    <p>The math looks like this: $$ F(t) = -kx - cv $$ but the <em>feeling</em> is what matters. Depending on the mix, you get three different "moods":</p>

    <ul>
        <li><strong>Underdamped:</strong> It wobbles back and forth before stopping. Fun, energetic, and playful.</li>
        <li><strong>Critically damped:</strong> It gets home as fast as possible without any wobbling. The "professional" choice for most UI.</li>
        <li><strong>Overdamped:</strong> It arrives slowly, like it’s stuck in syrup. Rare in UI, but great for heavy, dramatic effects.</li>
    </ul>

    <div class="demo-container" data-demo="decay-graph">
        <span class="demo-label">The Physics of Decay</span>
        <div class="decay-graph-wrap">
            <canvas class="decay-canvas"></canvas>
        </div>
    </div>

    <h2>Spring Playground</h2>
    <p>Now it’s your turn to be the physicist. Adjust the sliders and watch how the curve changes in real-time. Then, click play to see how that math translates into movement.</p>

    <p>Try the <strong>Presets</strong> below to see how different "recipes" create totally different vibes—from "Snappy" to "Heavy":</p>

    <div class="demo-container" data-demo="spring-playground">
        <span class="demo-label">Interactive Spring Playground</span>
        <div class="spring-playground">
            <div class="spring-controls">
                <div class="spring-control">
                    <div class="spring-control__label">
                        <span>Mass</span>
                        <span class="spring-control__value" data-value="mass">1.0</span>
                    </div>
                    <input type="range" class="spring-control__slider" data-param="mass" min="0.1" max="5.0" step="0.1" value="1.0">
                </div>
                <div class="spring-control">
                    <div class="spring-control__label">
                        <span>Stiffness</span>
                        <span class="spring-control__value" data-value="stiffness">180</span>
                    </div>
                    <input type="range" class="spring-control__slider" data-param="stiffness" min="10" max="500" step="5" value="180">
                </div>
                <div class="spring-control">
                    <div class="spring-control__label">
                        <span>Damping</span>
                        <span class="spring-control__value" data-value="damping">12.0</span>
                    </div>
                    <input type="range" class="spring-control__slider" data-param="damping" min="0.5" max="40" step="0.5" value="12">
                </div>
                <div class="spring-control">
                    <div class="spring-control__label">
                        <span>Bounce</span>
                        <span class="spring-control__value" data-value="bounce">0.20</span>
                    </div>
                    <input type="range" class="spring-control__slider" data-param="bounce" min="-1.0" max="1.0" step="0.05" value="0.2">
                </div>
            </div>

            <div class="spring-canvas-wrap">
                <canvas class="spring-canvas"></canvas>
            </div>

            <div class="spring-object-track">
                <div class="spring-object">
                    <img src="/src/assets/support.png" alt="Animated object">
                </div>
            </div>

            <button class="timing-play-btn">
                <svg viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 13,8 3,15"/></svg>
                Animate Spring
            </button>

            <table class="spring-presets-table">
                <thead>
                    <tr>
                        <th>Preset</th>
                        <th>Mass</th>
                        <th>Stiff</th>
                        <th>Damp</th>
                        <th>Feel</th>
                    </tr>
                </thead>
                   <tbody>
                <tr data-mass="1.0" data-stiffness="180" data-damping="12">
                    <td><span class="preset-swatch" style="background: #b4cdff;"></span>Default iOS</td>
                    <td>1.0</td>
                    <td>180</td>
                    <td>12</td>
                    <td>Balanced, subtle bounce</td>
                </tr>
                <tr data-mass="1.0" data-stiffness="300" data-damping="20">
                    <td><span class="preset-swatch" style="background: #82ffb4;"></span>Snappy</td>
                    <td>1.0</td>
                    <td>300</td>
                    <td>20</td>
                    <td>Fast, precise</td>
                </tr>
                <tr data-mass="1.0" data-stiffness="120" data-damping="14">
                    <td><span class="preset-swatch" style="background: #ffb4cd;"></span>Gentle</td>
                    <td>1.0</td>
                    <td>120</td>
                    <td>14</td>
                    <td>Smooth, relaxed</td>
                </tr>
                <tr data-mass="1.5" data-stiffness="200" data-damping="8">
                    <td><span class="preset-swatch" style="background: #ffd700;"></span>Bouncy</td>
                    <td>1.5</td>
                    <td>200</td>
                    <td>8</td>
                    <td>Very elastic, playful</td>
                </tr>
                <tr data-mass="1.0" data-stiffness="400" data-damping="28">
                    <td><span class="preset-swatch" style="background: #c4b5fd;"></span>Critical</td>
                    <td>1.0</td>
                    <td>400</td>
                    <td>28</td>
                    <td>No bounce, direct</td>
                </tr>
                <tr data-mass="3.0" data-stiffness="80" data-damping="6">
                    <td><span class="preset-swatch" style="background: #f97316;"></span>Heavy</td>
                    <td>3.0</td>
                    <td>80</td>
                    <td>6</td>
                    <td>Slow, weighted</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>

    <h2>Final "Checks" for your UI</h2>
    <p>Before you go, here are a few rules of thumb to keep your animations feeling professional and not annoying:</p>

    <ul>
        <li><strong>The 100ms Rule:</strong> Your app should react instantly. If a task takes time, show a "skeleton" or a transition immediately so the user doesn't think the app is frozen.</li>
        <li><strong>Be Consistent:</strong> If your buttons bounce, they should bounce with the same "personality" throughout the whole app.</li>
        <li><strong>Size matters:</strong> Moving a small icon should be quick (0.2s). Moving a whole page should feel "heavier" (0.5s). The more pixels move, the more time they need.</li>
        <li><strong>The "Waterfall" Effect:</strong> When animating a list, stagger the items by 30-50ms. It creates an organic "ripple" that feels much more natural than everything moving at once.</li>
        <li><strong>Less is more:</strong> One perfect animation is better than twenty mediocre ones. Movement should guide the eyes, not distract them.</li>
    </ul>

    <p>Animations aren't a luxury, they are the heartbeat of a polished product. Play with these examples if that can help!</p>
</div>
            `
        }
    ]
  },
        {
    id: 'Im-Back-From-The-Dead',
    title: 'I\'m Back! It\'s been so long, isnt it?',
    subtitle: 'After moving out of the United States, going to a new college, and dealing with a lot of personal stuff, I\'m finally back to blogging and a lot of reflections about life, art, and the future. As some doors close, new ones open for my journey. So many things changed, but one thing is for sure: I\'m still the same person, and I\'m still here to share my thoughts and experiences.',
    author: 'Skyedev',
    date: 'March 05, 2026',
    avatar: '/src/assets/pfp-photo.jpg',
    cover: '/src/assets/blogs_assets/wind.gif',
    tags: ['personal', 'art', 'college', 'journal'],
    category: 'Personal',
    pages: [
        {
            content: `

            <p>Hey everyone, it’s been a while! I know I’ve been pretty quiet on the blog for the past few months in the Skye Journey Site, and I wanted to take a moment to explain why. A lot has happened in my life recently, and I’ve been going through some big changes that have kept me busy and focused on other things. But I’m happy to say that I’m back now, and I’m excited to start sharing my thoughts and experiences again.</p>

            <p> I am still working for the next update of the <a href="https://luvrksknskyejourney.org/" target="_blank" rel="noopener noreferrer">(https://luvrksknskyejourney.org/↗)</a> Site, but I wanted to take a moment to reflect on everything that’s been going on. First of all, I recently moved out of the United States. I experienced a lot of existencial crises after that. And uh, what a year has 2025 been! it definitely felt a bit more busy than 2024. Felt like I got involved in more stuff too! I learned quite a few things about myself and the relationships I have with friends... This 2026, I started my first year in the <strong>Culinary Arts Institute</strong> as a future professional international chef, following some of the family traditions. Met lots of new people, made lots of new colleagues, and learned a couple of new things as well. I noticed i've been a bit more open to talking to new people despite being a bit shy. Been getting a bit outside of my zone as of late doing things while my heart is going at 100bpm. My public speaking skills have gotten a little bit better too. There always is something to improve on!</p>

<p>  Talking to other students in the Culinary School here made me realize more than before how much I missed having connections with people, or at least hearing their stories and seeing their joy about the little things. It always surprises me when I notice that people think about me and remember me. I still consider myself a bit of a shy at heart, yes, I enjoy being alone, but I also enjoy a lot having a laugh with people that I love. At the end of the year during December, I saw a friend of mine that I was very happy to have been talking to... more than before in the past 8 years. I don't give a fuck anymore. Because either way, life is so much more fun when you aren't afraid to love and get close to people. People like my boyfriend or a few friends I have left, the ones who stayed there along the way. Y’know? I don't usually write or talk about it, but my parents are kinda rigid and very, very, very tough. They were like this since I was a child. It is funny because I am usually quite different. I consider myself a warm and expressive person. This last year... I took my best friend to see the art-classical Nutcracker for Christmas. Sometimes I think about how crazy the whole idea of the single thought that we didn’t get the chance to see each other for 8 years. I didn't know yet, but I missed her. A lot. And I just realized this in the exact moment that I was able to hug her after all this time again.  I think I can’t even remember if we ever had the chance to say our ‘goodbye’ before I left the country when we were kids.
</p>

            <p>Can life be this cruel and beautiful at the same time, huh? I never told her ‘hey, I love you’ because I was so focused on hating myself. I completely forgot that life is about having fun and being kind. I didnt realize how much.. How much I love my friend. Until this moment, and now? Man, I am constantly scared of not letting people know how much they mean to me. What if one of my friends thinks all their life, wrongly, that I don't love them? I don't wish that for anyone. I know what it is to feel so unwanted and unloved. I want to be a bit kinder to myself, to everyone.  I want to feel less shame in doing very normal things, go on more walks with my best friend, cultivate better memories, and have more confidence in myself and the things that I do. I also want other things, but those are the most important ones when it comes to myself and the people around me. I’m so glad to be here. Whatever happens now on, I'm just glad that life allowed me to restore some of what is left behind. I know I am not the best person, I am not perfect, I am just human, but I care. I do care.</p>

            <p>All the people I know are talented, kind, and just good-hearted people. All my friends are gorgeous human beings, and I am so glad to be there and be able to let them know that! So, yeah. I guess I did get a little emotional writing this, and that was not the main idea. Sorry for that. I just wanted to write about this, let the feelings go out. That may make me feel better, or make someone smile, and that’s enough for me. Other people’s joy is more than enough. I hope this post finds you well, and that you are also able to find joy in the little things, and love in the people around you. Life is too short to be anything but happy, and I want to make the most of it.</p>

            <p> This post was made not only to let the feeling go out, but also for all the people I care about. If you read this, thank you! May you have a good year, life, and accomplish everything you desire.</p>
            `
        }
    ]
  },
  
];

export default blogData;
