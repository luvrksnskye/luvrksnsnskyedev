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
        {
    id: 'Ourinnerworld',
    title: 'Ourinnerworld: Dreamers Journey Devlog #Godot Engine',
    subtitle: 'After a long time without posting, I am back with a new devlog about the game I am working on as gift for my boyfriend, Ourinnerworld. It is a personal project that I started a few months ago, and I wanted to share some of the progress and reflections about it. I am using Godot Engine for this project, and it has been a great experience so far. In this devlog, I will talk about the game concept, the development process, and some of the other things I have learned along the way.',
    author: 'Skyedev',
    date: 'March 05, 2026',
    avatar: '/src/assets/pfp-photo.jpg',
    cover: '/src/assets/blogs_assets/photos.jpg',
    tags: ['personal', 'gamedev', 'godot', 'games'],
    category: 'Dev',
    pages: [
        {
            content: `
<p><strong>Ourinnerworld</strong> have already... well, i dont know, maybe more than 5 months in the first phases of development, I suppose. Initially started as a simple short game inspired by <strong>OMORI</strong>, since that's the favorite game of my boyfriend, and I got the idea from another of my childhood games in the past. Along the way, I eventually realized that I have A LOT of ideas for unique and complex mechanics and visuals. Started with minimalistic pixel art, and now I am in the middle of redesigning each character sprite. A few months ago, I didn't know anything about Godot Engine, and I probably still don't know everything yet lol. I mean, there's for sure a whole world to learn about gamedev with this engine, like shaders, autoload scripts, and visual effects for art, tilemaps, or sprites. I went through so many drafts of the story until I finally decided on the main idea of the game. Studying in the meantime about settings, the vibe of the game experience, interiors, and exteriors in different worlds! If you asked me, this was quite unexpected... and fucky considering this was in the beginning something ‘simple’, but when I create or do a new thing, it isn’t hard to not go any further with all possibilities? Anyways, you may think that I have more than one map already created, but that's totally wrong. </p>

<p> My gamedev process is slow mainly cause I want to create something very special for someone I love! And here is when we start with the mechanics and visuals developed so far. I spend more time writing the story of the game and drawing its assets than programming it, which is curious but definitely worth it. Being able to draw, test, and flip my canvas every time is very convenient when making the maps and designs of the game. Makes sense for me at least! The past months I focused on the <strong>story→foliage design→visuals→ambience→features</strong>. Of course theres other things like the inventory system, the menu UI, and other existing mechanics like the ‘tag’ on the party-like RPG system. Even so, I want to make an overview of the stuff we can visually appreciate as players! Without revealing so many details of the story tho. I am even thinking about using ‘Blender’ as a tool (alongside Aseprite) for the creation of complex structures, like schools, churches, and bigger houses! or the significant story-related dark cathedral/dreamers' sanctuary.</p>

<p>Without getting too bogged down in details, in Ouinnerworld, many mechanics vary in type and purpose, divided into categories. Some gameplay mechanics are important to the story and play a significant role in it, while others are purely for the player's enjoyment. However, as you progress, these <strong>two categories merge until they become the same</strong>. The exception is certain mechanics, such as some items, that are exclusive to their respective worlds. This blog contains a list and map of the different mechanics in the Dreamers Project, as well as exploring their potential improvements as the game's development progresses. The Dreamer (player) will feature a party system with a limit of up to five characters on your team, each with their own stats, abilities, and emotions. Each character has up to six possible skill slots: four combat skills displayed in the skill menu and two action skills accessed from the main menu. (At least for now! Everything mentioned is subject to change.)</p>

<p>

OURINNERWORLD introduces a new type of skill to this system: the <strong>action skill</strong>, accessed from the party menu. These skills will help you actively overcome obstacles or solve puzzles in different worlds, while others will have a unique function within the story. At the beginning of the game, there are no options for violent combat. Instead, players have defense and abilities to confront or assist enemies. Violent combat skills are unlocked later in the story for certain characters. Many abilities can affect the emotions of team members and their enemies, as can the use of special items or story events. Examples include the Dreamer's and Hikiko's gameplay in the Dreamworlds during the story:</p>

<div class="info-box">
                        <div class="info-box__title">Action Skills Overview</div>
                        <div class="info-box__content">The Dreamer's music can calm angry or sad enemies, while Hikiko's simple abilities, like using her hammer to smash things, can irritate and anger nearby enemies. They might also become annoyed if Hikiko intentionally throws things at them. Look at him! This is the old version animated sprite for the smash animation. I feel kinda sad to know that I will redo this one!! By the way, yes! It also has an animation for throwing various objects, which can range from balls of different sizes or rocks... to unexpected stuff. </div>
                        <img src="/src/assets/ourinnerworlddev/$ACTION_HIKIKO_SMASH_DOWN.gif" id="Hikiko-Smash-Animation">
                    </div> 

                    <h2>Visuals and Worlds Environment</h2>
                    <p>Initially, the art style of the game was quite minimalistic, with simple pixel art and basic animations. However, as the development progressed, I realized that I wanted to create a more immersive and visually appealing experience for the player. I started experimenting with different art styles and techniques, and eventually settled on a more detailed pixel art style that still retains a charming and nostalgic feel. The characters and environments are now more vibrant and expressive, which adds to the overall atmosphere of the game. I am currently in the process of redesigning each character sprite to better fit the new art style and to enhance their personalities.</p>

                    <p>The process of creating tiles for each worlds can become quite tedious, especially if you are working solo like me. When you add several terrain types like grass, dirt, and paths, along with random variations, you can quickly end up managing hundreds of tiles. In theory, if each tile considers its eight neighboring tiles, <strong>creating a unique tile for every possible configuration would require 256 tiles</strong>. Fortunately, in practice we can usually work with far fewer. One common approach is the classic 15-piece tileset, which uses a small number of tiles but has a greater drawback: the edges are drawn through the center of each tile, so they don't align well with the world grid, creating ambiguous tiles and confusing placement. </p>

<p>Another option is the 47-piece tileset, where edges are drawn closer to the grid borders, making them align better with the game world, but this increases the number of tiles significantly. Sometimes developers use a smaller 16-tile subset, which is quicker to produce and grid-aligned, although it can cause issues with detailed inner corners depending on the art style. Additionally, both approaches make it difficult to achieve equally rounded inner and outer corners, which some developers prefer visually, especially for paths. Because each of these systems involves trade-offs, many developers turn to the dual-grid system. As the name suggests, this method uses two grids: a hidden world grid that tracks tile placement and a second grid offset by half a tile that determines what is displayed. </p>

<p>Each tile in the display grid depends on its four overlapping neighbors, which reduces the number of possible configurations to just 16 instead of 256. In this system, tile edges are intentionally drawn through the middle of each tile, and once the offset grid is applied they align perfectly with the game world. In engines like Godot, this can be implemented using two tilemaps, where the display tilemap is offset by half a tile and a custom script handles the logic for selecting the correct tile based on neighboring configurations.</p>

<p>In the case of Ourinnerworld, I am using a dual-grid system for the tilemaps, which allows me to create more visually appealing environments while keeping the number of tiles manageable. This approach has been particularly helpful in creating the different worlds and their unique atmospheres. Each world has its own set of tiles that reflect its theme and mood, and the dual-grid system helps to ensure that they align properly with the game world, creating a cohesive and immersive experience for the player.</p>

<p> The main reason of me doing this method is because this game and it story is very much focused on the environments and the vibe of the game, so I want to make sure that the visuals are as polished and immersive as possible. I am also using a lot of visual effects and shaders to enhance the atmosphere of each world, which adds another layer of depth to the game. Ourinnerworld story is very much focused on the idea of exploring different dreamworlds during a chapter of the story, and those worlds can get quite different from each other, so I want to make sure that the visuals reflect that diversity and uniqueness. From cute and colorful worlds to darker and more surreal ones, I want to create a wide range of environments that players can get lost in and enjoy exploring.</p>

<p> The dual-grid system, as its name suggests, uses two grids instead of one. The first grid, often called the world grid, simply keeps track of where each tile is placed but does not display anything visually. The second grid is offset from the world grid by half a tile, and each tile in this display grid changes depending on its four overlapping neighbors. Because each tile only considers four neighbors instead of eight, the number of possible configurations drops to <strong>just 16 instead of 256</strong>. For this method, the tileset is designed with edges drawn halfway through each tile, which might initially seem incorrect, but once the half-tile offset is applied, everything appears perfectly aligned with the game’s world grid. To learn more about the dual-grid system, it is worth checking out a talk by <a href="https://www.youtube.com/watch?v=Uxeo9c-PX-w" target="_blank" rel="noopener noreferrer">Oskar Stålberg↗</a> or a devlog by <a href="https://www.youtube.com/watch?v=buKQjkad2I0&t" target="_blank" rel="noopener noreferrer">ThinMatrix↗</a>, both of which explain the concept in more depth. The system sounds powerful, but the next question is how it can actually be implemented in a game engine.</p>

<p>
In Godot, I also created a shader for the grass tilemaps that adds a pleasant texture while respecting the pixel art style of the game. Not only that, but I also added subtle cloud effects reflected on the ground. This shader generates shadows of moving clouds across the world using a noise texture. First, it calculates the position of each pixel in world space within the <code>vertex()</code> function so that the effect is independent from the camera. Then, in <code>fragment()</code>, it uses this position scaled by <code>cloud_scale</code> to sample a noise texture (<code>cloud_noise</code>) that represents the shape of the clouds. An offset is added to this position based on wind direction (<code>cloud_direction</code>), speed (<code>cloud_speed</code>), and time (<code>TIME</code>), causing the clouds to continuously shift. The resulting noise value is compared to a threshold (<code>cloud_threshold</code>) using <code>smoothstep</code>, which creates a smooth transition between light and shadowed areas according to the softness defined by <code>cloud_softness</code>. Finally, the shader calculates the amount of darkness to apply (<code>cloud_darkness</code>) and draws a shadow color (<code>shadow_color</code>) with proportional transparency, producing a layer of soft shadows that simulate clouds passing over the world.
</p>
            
<div class="video-container">
  <video autoplay loop muted playsinline>
    <source src="/src/assets/ourinnerworlddev/worldtest.mp4" type="video/mp4">
  </video>
</div>

<h2>Water Shader And Wind Shader</h2>

<p>Another visual thing I spent a good amount of time on is the water shader. This one is a <code>canvas_item</code> visual shader inspired by the work of <a href="https://www.youtube.com/@jesscodes" target="_blank" rel="noopener noreferrer">jess::codes↗</a>, who originally built it in Unity for her pixel art game. I adapted and ported the approach to Godot, and honestly, understanding how the layers work together was the most fun part of the whole process.</p>

<p>The core idea is that the water is not just one flat color. It is actually built from multiple visual layers stacked on top of each other, and each one does something different. Think of it like painting with transparencies: you start with a base and keep adding details on top until it looks alive. The shader reads the color channels of the source texture to decide what goes where. The <strong>red channel</strong> defines where the shore outline appears, <strong>green</strong> controls where the foam shows up, and <strong>blue</strong> determines water depth and transparency. So a single texture is doing triple duty as a visual data map, which is kind of elegant if you think about it.</p>

<p>The first thing the shader does in the <code>fragment()</code> function is pixelize the UV coordinates. This is what keeps everything looking crispy and pixel-art-friendly instead of smooth and blurry. It floors the coordinates multiplied by a pixelization value and divides them back, essentially snapping every sample to a pixel grid. It also corrects the aspect ratio so the textures don't stretch weirdly on non-square surfaces.</p>

<p>From there, the shader builds its layers one by one. The <strong>base layer</strong> is a depth-based water color. It samples a gradient texture using the blue channel of the source, so deeper water gets one color and shallower water gets another. Simple but effective for giving the water a sense of volume.</p>

<p>On top of that comes the <strong>caustics layer</strong>, which is probably my favorite part visually. Caustics are those rippling light patterns you see at the bottom of a pool when sunlight hits the surface. The shader creates this by sampling a noise texture that scrolls over time (using <code>TIME * causticSpeed</code>), then using a subtract blend to distort the coordinates before sampling the actual caustic textures. There are two caustic textures involved: a base caustic and a highlight caustic, and they get interpolated together based on the highlight's alpha. A fade noise texture controls where the caustics are visible and where they disappear, which prevents the effect from looking too uniform across the whole water surface.</p>

<p>Then there is the <strong>specular layer</strong>, which simulates the little bright sparkles on the water surface when light reflects off it. This one uses a clever trick: it takes two noise textures scrolling in opposite horizontal directions (left and right), blends them together with an overlay blend mode, and then subtracts a static noise pattern from the result. Finally, it applies a <code>step()</code> function with a threshold to turn the smooth noise into hard, pixel-perfect sparkle dots. That <code>step()</code> is what makes it look like actual pixel art instead of a soft gradient, and you can control how many sparkles appear by adjusting the threshold value.</p>

<p>The <strong>foam layer</strong> handles the white frothy edges where water meets land. It samples a foam texture at a specific scale and then uses the green channel from the source texture to determine intensity. The foam only appears where the source tells it to, which means you can paint exactly where the shore foam goes by editing your tilemap colors. The foam intensity uniform lets you control how aggressively it shows up.</p>

<p>Finally, the <strong>outline layer</strong> is extracted from the red channel multiplied by the alpha, and it gets tinted with an outline color. This creates a subtle defined edge around the water boundary that helps separate it visually from the terrain.</p>

<p>All of these layers get composited together in the fragment function using <code>mix()</code> calls. The order matters: first the depth color gets mixed with caustics based on the caustic alpha, then specular gets mixed on top but only where caustics are visible (using <code>ceil(finalCaustics.a)</code> as a mask, which is a nice touch to avoid floating sparkles in empty areas), then foam goes over everything, and the outline gets blended last. The final alpha is driven by the blue channel multiplied by a general transparency uniform, so the depth also controls how see-through the water is.</p>

<p>The shader also has a companion system for <strong>water trails</strong>, which uses a few C# scripts to paint trails that follow movement (like a character walking through water or a cursor). The noise textures are now generated using Godot's built-in <strong>FastNoiseLite</strong> instead of runtime generation, which should help with performance even though it can introduce some repetition if the textures are too small.</p>

<p>I think what makes this shader feel so nice for a pixel art game is that every layer respects the pixelization grid. The UV snapping ensures that caustics, sparkles, and foam all move and render at the same pixel resolution as the rest of the game, so nothing feels out of place. And the fact that all the visual information (outline, foam, depth) is encoded into the RGB channels of a single texture makes the whole system surprisingly lightweight for how much visual complexity it produces.</p>

<div class="video-container">
  <img src="/src/assets/ourinnerworlddev/WaterShader.png" alt="Water Shader Demo" class="demo-water">
</div>

<div class="video-container">
  <img src="/src/assets/ourinnerworlddev/WindShader.png" alt="Wind Shader Demo" class="demo-wind">
</div>

<p>Discussing visuals and bringing life to the game, I am considering adding a living ecosystem to some worlds, which means incorporating animals. I still have some ideas about how to implement this. I want to create simple AI behaviors for animals that can roam around, interact with the environment, and maybe even react to the player’s presence. For example, I have a very basic code idea for the behavior of butterflies and fireflies when close to the player or specific characters inside the party-system.</p>


<h2>Living Ecosystem: Butterfly Behavior</h2>

<p>On the topic of bringing life to the environments, one thing I really wanted was to make worlds feel inhabited. Not just by NPCs with scripted paths, but by small creatures doing their own thing around you. The first real test of this is butterflies. I wrote a base behavior script that gives each butterfly its own personality, and honestly it is still very early and rough, but the core idea is there and I think it is worth showing how the system works so far. Keep in mind this is a freshly made foundation that will probably change a lot as I test it more in the actual maps and iterate on the details!</p>

<p>The personality system is the heart of the whole thing. When a butterfly spawns, it rolls a random value and gets assigned one of five personality types: <strong>VERY_SHY</strong>, <strong>SHY</strong>, <strong>NEUTRAL</strong>, <strong>BOLD</strong>, or <strong>VERY_BOLD</strong>. Each personality comes with its own config dictionary that defines how the butterfly reacts to the player. A very shy butterfly has a large detection radius of 80 pixels and will panic and flee the moment you get anywhere near it, while a very bold one only starts caring at 30 pixels and has a 90% chance of actually approaching you instead of running away. The distribution is weighted so that most butterflies land somewhere in the middle, with the extremes being rarer, which should make those encounters feel more special when they happen.</p>

<div class="godot-code-block">
    <div class="godot-code-block__header">
        <div class="godot-code-block__lang">
            <span class="godot-code-block__lang-dot"></span>
            GDScript
        </div>
        <span class="godot-code-block__filename">butterfly-core.gd</span>
        <button class="godot-code-block__copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span class="godot-code-block__copy-label">Copy</span>
        </button>
    </div>
    <div class="godot-code-block__body">
        <pre class="godot-code-block__pre"><code class="godot-code-block__code godot-code-block__lines"><span class="godot-code-block__line"><span class="syn-comment"># Personality types and their behavior configs</span></span>
<span class="godot-code-block__line"><span class="syn-keyword">enum</span> <span class="syn-type">PersonalityType</span> { VERY_SHY, SHY, NEUTRAL, BOLD, VERY_BOLD }</span>
<span class="godot-code-block__line"></span>
<span class="godot-code-block__line"><span class="syn-keyword">const</span> <span class="syn-constant">PERSONALITY_CONFIG</span>: <span class="syn-type">Dictionary</span> <span class="syn-operator">=</span> {</span>
<span class="godot-code-block__line">    <span class="syn-type">PersonalityType</span>.VERY_SHY: {</span>
<span class="godot-code-block__line--highlight"><span class="godot-code-block__line">        <span class="syn-string">"detection_radius"</span>: <span class="syn-number">80.0</span>,</span></span>
<span class="godot-code-block__line">        <span class="syn-string">"safe_distance"</span>: <span class="syn-number">90.0</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"approach_chance"</span>: <span class="syn-number">0.1</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"rest_chance"</span>: <span class="syn-number">0.95</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"flee_threshold"</span>: <span class="syn-number">30.0</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"approach_speed"</span>: <span class="syn-number">0.4</span></span>
<span class="godot-code-block__line">    },</span>
<span class="godot-code-block__line">    <span class="syn-comment"># ... SHY, NEUTRAL, BOLD ...</span></span>
<span class="godot-code-block__line">    <span class="syn-type">PersonalityType</span>.VERY_BOLD: {</span>
<span class="godot-code-block__line--highlight"><span class="godot-code-block__line">        <span class="syn-string">"detection_radius"</span>: <span class="syn-number">30.0</span>,</span></span>
<span class="godot-code-block__line">        <span class="syn-string">"safe_distance"</span>: <span class="syn-number">50.0</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"approach_chance"</span>: <span class="syn-number">0.9</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"rest_chance"</span>: <span class="syn-number">0.5</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"flee_threshold"</span>: <span class="syn-number">110.0</span>,</span>
<span class="godot-code-block__line">        <span class="syn-string">"approach_speed"</span>: <span class="syn-number">0.9</span></span>
<span class="godot-code-block__line">    }</span>
<span class="godot-code-block__line">}</span></code></pre>
    </div>
</div>

<p>The butterfly runs through a state machine with five states: <strong>WANDERING</strong>, <strong>FLEEING</strong>, <strong>APPROACHING</strong>, <strong>WAITING_FOR_REST</strong>, and <strong>RESTING_ON_PLAYER</strong>. During wandering, it picks a random direction every couple of seconds and just floats around. But the moment the player enters its detection radius, or moves fast enough nearby, it switches to fleeing and darts away at triple speed until it reaches a safe distance. The interesting part is what happens when the player stays still. If the player is not moving and a butterfly is close enough, there is a chance it becomes curious and starts approaching. How likely that is depends entirely on the personality type. A bold butterfly will approach almost every time, while a shy one barely ever does.</p>

<div class="godot-code-block">
    <div class="godot-code-block__header">
        <div class="godot-code-block__lang">
            <span class="godot-code-block__lang-dot"></span>
            GDScript
        </div>
        <span class="godot-code-block__filename">butterfly-core.gd</span>
        <button class="godot-code-block__copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span class="godot-code-block__copy-label">Copy</span>
        </button>
    </div>
    <div class="godot-code-block__body">
        <pre class="godot-code-block__pre"><code class="godot-code-block__code godot-code-block__lines"><span class="godot-code-block__line"><span class="syn-comment"># State machine — main physics loop</span></span>
<span class="godot-code-block__line"><span class="syn-keyword">enum</span> <span class="syn-type">State</span> { WANDERING, FLEEING, APPROACHING, WAITING_FOR_REST, RESTING_ON_PLAYER }</span>
<span class="godot-code-block__line"><span class="syn-keyword">var</span> <span class="syn-property">current_state</span>: <span class="syn-type">State</span> <span class="syn-operator">=</span> <span class="syn-type">State</span>.WANDERING</span>
<span class="godot-code-block__line"></span>
<span class="godot-code-block__line"><span class="syn-keyword">func</span> <span class="syn-func">_physics_process</span>(<span class="syn-param">delta</span>: <span class="syn-type">float</span>) <span class="syn-operator">-></span> <span class="syn-type">void</span>:</span>
<span class="godot-code-block__line">    <span class="syn-keyword">match</span> <span class="syn-property">current_state</span>:</span>
<span class="godot-code-block__line">        <span class="syn-type">State</span>.WANDERING:</span>
<span class="godot-code-block__line">            <span class="syn-func">_process_wandering</span>(<span class="syn-param">delta</span>)</span>
<span class="godot-code-block__line">        <span class="syn-type">State</span>.FLEEING:</span>
<span class="godot-code-block__line">            <span class="syn-func">_process_fleeing</span>(<span class="syn-param">delta</span>)</span>
<span class="godot-code-block__line">        <span class="syn-type">State</span>.APPROACHING:</span>
<span class="godot-code-block__line">            <span class="syn-func">_process_approaching</span>(<span class="syn-param">delta</span>)</span>
<span class="godot-code-block__line">        <span class="syn-type">State</span>.WAITING_FOR_REST:</span>
<span class="godot-code-block__line">            <span class="syn-func">_process_waiting_for_rest</span>(<span class="syn-param">delta</span>)</span>
<span class="godot-code-block__line">        <span class="syn-type">State</span>.RESTING_ON_PLAYER:</span>
<span class="godot-code-block__line">            <span class="syn-func">_process_resting</span>(<span class="syn-param">delta</span>)</span>
<span class="godot-code-block__line"></span>
<span class="godot-code-block__line--highlight"><span class="godot-code-block__line">    <span class="syn-func">_avoid_other_butterflies</span>()</span></span>
<span class="godot-code-block__line">    <span class="syn-func">move_and_slide</span>()</span></code></pre>
    </div>
</div>

<p>The resting mechanic is probably the most charming part, even in this early state. When a butterfly decides it wants to rest, it checks whether the current party leader is in the right condition. For Rainy, the player character, the butterfly will only land on his if he is in his <code>idle_sleep</code> animation. For Hikiko, it requires him to be in <code>idle_down</code> and to have been the leader for more than 50 seconds. Only one butterfly can rest on the player at a time, so if the spot is taken, the butterfly enters a waiting state where it orbits around the player in a little circle using <code>cos</code> and <code>sin</code> on a timer, which looks pretty cute. If it waits for more than 20 seconds without getting a chance, it gives up and goes back to wandering. When a butterfly does land, it sits on top of the character's head and notifies the party member through a callback, which could trigger a small reaction animation or something later.</p>

<div class="godot-code-block">
    <div class="godot-code-block__header">
        <div class="godot-code-block__lang">
            <span class="godot-code-block__lang-dot"></span>
            GDScript
        </div>
        <span class="godot-code-block__filename">butterfly-core.gd</span>
        <button class="godot-code-block__copy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            <span class="godot-code-block__copy-label">Copy</span>
        </button>
    </div>
    <div class="godot-code-block__body">
        <pre class="godot-code-block__pre"><code class="godot-code-block__code godot-code-block__lines"><span class="godot-code-block__line"><span class="syn-comment"># Resting on the player's head</span></span>
<span class="godot-code-block__line"><span class="syn-keyword">func</span> <span class="syn-func">_process_resting</span>(<span class="syn-param">delta</span>: <span class="syn-type">float</span>) <span class="syn-operator">-></span> <span class="syn-type">void</span>:</span>
<span class="godot-code-block__line--highlight"><span class="godot-code-block__line">    <span class="syn-builtin">global_position</span> <span class="syn-operator">=</span> <span class="syn-property">player</span>.<span class="syn-builtin">global_position</span> <span class="syn-operator">+</span> <span class="syn-type">Vector2</span>(<span class="syn-number">0</span>, <span class="syn-number">-20</span>)</span></span>
<span class="godot-code-block__line">    <span class="syn-property">velocity</span> <span class="syn-operator">=</span> <span class="syn-type">Vector2</span>.ZERO</span>
<span class="godot-code-block__line">    <span class="syn-property">animations</span>.<span class="syn-func">play</span>(<span class="syn-string">"iddle_front"</span>)</span>
<span class="godot-code-block__line"></span>
<span class="godot-code-block__line">    <span class="syn-keyword">if not</span> <span class="syn-func">_check_can_rest_on_player</span>():</span>
<span class="godot-code-block__line">        <span class="syn-func">_release_resting_spot</span>()</span>
<span class="godot-code-block__line">        <span class="syn-func">_start_fleeing</span>()</span>
<span class="godot-code-block__line"></span>
<span class="godot-code-block__line"><span class="syn-comment"># Orbiting while waiting for the resting spot</span></span>
<span class="godot-code-block__line"><span class="syn-keyword">func</span> <span class="syn-func">_process_waiting_for_rest</span>(<span class="syn-param">delta</span>: <span class="syn-type">float</span>) <span class="syn-operator">-></span> <span class="syn-type">void</span>:</span>
<span class="godot-code-block__line">    <span class="syn-property">waiting_timer</span> <span class="syn-operator">+=</span> <span class="syn-param">delta</span></span>
<span class="godot-code-block__line">    <span class="syn-keyword">var</span> <span class="syn-property">orbit_angle</span>: <span class="syn-type">float</span> <span class="syn-operator">=</span> <span class="syn-property">waiting_timer</span> <span class="syn-operator">*</span> <span class="syn-number">0.5</span></span>
<span class="godot-code-block__line--highlight"><span class="godot-code-block__line">    <span class="syn-keyword">var</span> <span class="syn-property">orbit_offset</span>: <span class="syn-type">Vector2</span> <span class="syn-operator">=</span> <span class="syn-type">Vector2</span>(<span class="syn-func">cos</span>(<span class="syn-property">orbit_angle</span>), <span class="syn-func">sin</span>(<span class="syn-property">orbit_angle</span>)) <span class="syn-operator">*</span> <span class="syn-property">orbit_radius</span></span></span>
<span class="godot-code-block__line">    <span class="syn-keyword">var</span> <span class="syn-property">target_pos</span>: <span class="syn-type">Vector2</span> <span class="syn-operator">=</span> <span class="syn-property">player</span>.<span class="syn-builtin">global_position</span> <span class="syn-operator">+</span> <span class="syn-property">orbit_offset</span></span>
<span class="godot-code-block__line">    <span class="syn-property">velocity</span> <span class="syn-operator">=</span> (<span class="syn-property">target_pos</span> <span class="syn-operator">-</span> <span class="syn-builtin">global_position</span>).<span class="syn-func">normalized</span>() <span class="syn-operator">*</span> (<span class="syn-property">fly_speed</span> <span class="syn-operator">*</span> <span class="syn-number">0.5</span>)</span></code></pre>
    </div>
</div>

<p>There is also a simple flocking mechanism where butterflies push each other away if they get too close, using a <code>personal_space_radius</code> of 25 pixels. Each butterfly checks its distance to nearby ones from a static array that tracks all active instances, and if another butterfly is inside that radius, it adds a push force in the opposite direction. It caps the check at 3 nearby butterflies to avoid performance issues since the system supports up to 190 butterflies at once. This whole script is really just the starting point!</p>

<p> Now, well, I should clarify that no, Ourinnerworld isn't an open-world game or anything close to it, however, I like the idea of ​​giving it unique and explorable mechanics. I'm even considering adding frogs to rainy and humid maps! Which I'll probably do in the coming months while I continue writing the game's story and its chapters.</p>

<p>As for the <strong>wind shader</strong>, it is a simple vertex shader that creates a waving effect on foliage sprites. It uses a sine wave function to offset the vertices of the sprite based on time and a wind strength uniform. The shader also takes into account the vertex position to create a more natural variation in the movement, so different parts of the sprite move slightly differently, simulating the effect of wind blowing through leaves or grass. The result is a subtle but effective animation that brings the environment to life without needing complex animations for each sprite. I did this mostly for some big and medium trees in the game, but is also usable for piles of leaves!</p>

<div class="video-container">
  <video autoplay loop muted playsinline>
    <source src="/src/assets/ourinnerworlddev/shadertest.mp4" type="video/mp4">
  </video>
</div>

<div class="shader-graph" data-connections='[
    {"from":"vertex1","fromPort":"out","to":"decomp1","toPort":"in","type":"vec2"},
    {"from":"decomp1","fromPort":"x","to":"add1","toPort":"a","type":"float"},
    {"from":"decomp1","fromPort":"y","to":"compose1","toPort":"y","type":"float"},
    {"from":"uv1","fromPort":"out","to":"decomp2","toPort":"in","type":"vec2"},
    {"from":"decomp2","fromPort":"y","to":"oneminus","toPort":"in","type":"float"},
    {"from":"wind","fromPort":"out","to":"mul1","toPort":"a","type":"float"},
    {"from":"oneminus","fromPort":"out","to":"mul1","toPort":"b","type":"float","animated":true},
    {"from":"vertex2","fromPort":"out","to":"decomp3","toPort":"in","type":"vec2"},
    {"from":"decomp3","fromPort":"x","to":"addtime","toPort":"a","type":"float"},
    {"from":"time1","fromPort":"out","to":"addtime","toPort":"b","type":"float","animated":true},
    {"from":"addtime","fromPort":"out","to":"sin1","toPort":"in","type":"float","animated":true},
    {"from":"sin1","fromPort":"out","to":"mul2","toPort":"b","type":"float","animated":true},
    {"from":"mul1","fromPort":"out","to":"mul2","toPort":"a","type":"float"},
    {"from":"mul2","fromPort":"out","to":"add1","toPort":"b","type":"float","animated":true},
    {"from":"add1","fromPort":"out","to":"compose1","toPort":"x","type":"float"},
    {"from":"compose1","fromPort":"out","to":"output","toPort":"vertex","type":"vec2","animated":true}
]'>
    <div class="shader-graph__label">Visual Shader</div>
    <div class="shader-graph__title">Tree Wind Sway</div>
    <div class="shader-graph__desc">Vertex shader for foliage. Decomposes the UV to create a height mask with OneMinus (base stays, top sways), then feeds vertex.x + TIME through a Sin function and multiplies it by WindStrength and the mask. The displaced X gets recomposed with the original Y and sent to the Vertex output.</div>

    <div class="shader-graph__canvas" style="min-height: 580px;">

        <!-- Input: vertex (top-left) -->
        <div class="shader-node shader-node--input" data-node-id="vertex1" style="left: 20px; top: 10px;">
            <div class="shader-node__header">Input</div>
            <div class="shader-node__body">
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    vertex
                </div>
            </div>
            <div class="shader-node__tooltip">VERTEX position of the sprite</div>
        </div>

        <!-- VectorDecompose 1 -->
        <div class="shader-node shader-node--compose" data-node-id="decomp1" style="left: 200px; top: 10px;">
            <div class="shader-node__header">VectorDecompose</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="in" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    vec
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="x" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    x
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="y" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    y
                </div>
            </div>
        </div>

        <!-- FloatParameter: WindStrength -->
        <div class="shader-node shader-node--param" data-node-id="wind" style="left: 20px; top: 130px;">
            <div class="shader-node__header">FloatParameter</div>
            <div class="shader-node__body">
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    WindStrength
                </div>
                <div class="shader-node__param-row">
                    <span>Hint</span>
                    <span class="shader-node__param-value">Range</span>
                </div>
                <div class="shader-node__param-row">
                    <span>Min / Max</span>
                    <span class="shader-node__param-value">2.0 — 10.0</span>
                </div>
            </div>
            <div class="shader-node__tooltip">Uniform: WindStrength (2.0 to 10.0)</div>
        </div>

        <!-- Input: UV -->
        <div class="shader-node shader-node--input" data-node-id="uv1" style="left: 20px; top: 290px;">
            <div class="shader-node__header">Input</div>
            <div class="shader-node__body">
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    uv
                </div>
            </div>
        </div>

        <!-- VectorDecompose 2 (UV) -->
        <div class="shader-node shader-node--compose" data-node-id="decomp2" style="left: 180px; top: 290px;">
            <div class="shader-node__header">VectorDecompose</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="in" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    vec
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="x" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    x
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="y" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    y
                </div>
            </div>
        </div>

        <!-- FloatFunc: OneMinus -->
        <div class="shader-node shader-node--function" data-node-id="oneminus" style="left: 370px; top: 310px;">
            <div class="shader-node__header">FloatFunc</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="in" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    in
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    OneMinus
                </div>
                <div class="shader-node__preview">
                    <canvas data-preview-type="oneminus"></canvas>
                </div>
            </div>
            <div class="shader-node__tooltip">1.0 - UV.y (top = 1, base = 0)</div>
        </div>

        <!-- FloatOp: Multiply (WindStrength * OneMinus) -->
        <div class="shader-node shader-node--operation" data-node-id="mul1" style="left: 520px; top: 190px;">
            <div class="shader-node__header">FloatOp</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="a" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    a
                </div>
                <div class="shader-node__port" data-port-id="b" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    b
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    Multiply
                </div>
            </div>
            <div class="shader-node__tooltip">WindStrength * UV height mask</div>
        </div>

        <!-- Input: TIME -->
        <div class="shader-node shader-node--input" data-node-id="time1" style="left: 20px; top: 440px;">
            <div class="shader-node__header">Input</div>
            <div class="shader-node__body">
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    time
                </div>
            </div>
        </div>

        <!-- Input: vertex (bottom) -->
        <div class="shader-node shader-node--input" data-node-id="vertex2" style="left: 20px; top: 520px;">
            <div class="shader-node__header">Input</div>
            <div class="shader-node__body">
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    vertex
                </div>
            </div>
        </div>

        <!-- VectorDecompose 3 (vertex for sin) -->
        <div class="shader-node shader-node--compose" data-node-id="decomp3" style="left: 200px; top: 520px;">
            <div class="shader-node__header">VectorDecompose</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="in" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    vec
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="x" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    x
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="y" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    y
                </div>
            </div>
        </div>

        <!-- FloatOp: Add (vertex.x + TIME) -->
        <div class="shader-node shader-node--operation" data-node-id="addtime" style="left: 370px; top: 480px;">
            <div class="shader-node__header">FloatOp</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="a" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    a
                </div>
                <div class="shader-node__port" data-port-id="b" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    b
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    Add
                </div>
            </div>
            <div class="shader-node__tooltip">vertex.x + TIME (phase offset per vertex)</div>
        </div>

        <!-- FloatFunc: Sin -->
        <div class="shader-node shader-node--function" data-node-id="sin1" style="left: 520px; top: 480px;">
            <div class="shader-node__header">FloatFunc</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="in" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    in
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    Sin
                </div>
                <div class="shader-node__preview">
                    <canvas data-preview-type="sine"></canvas>
                </div>
            </div>
            <div class="shader-node__tooltip">sin(vertex.x + TIME) — oscillation</div>
        </div>

        <!-- FloatOp: Multiply (mask * sin) -->
        <div class="shader-node shader-node--operation" data-node-id="mul2" style="left: 660px; top: 330px;">
            <div class="shader-node__header">FloatOp</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="a" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    a
                </div>
                <div class="shader-node__port" data-port-id="b" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    b
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    Multiply
                </div>
            </div>
            <div class="shader-node__tooltip">(wind * mask) * sin() = final sway</div>
        </div>

        <!-- FloatOp: Add (original.x + displacement) -->
        <div class="shader-node shader-node--operation" data-node-id="add1" style="left: 810px; top: 100px;">
            <div class="shader-node__header">FloatOp</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="a" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    a
                </div>
                <div class="shader-node__port" data-port-id="b" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    b
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    Add
                </div>
            </div>
            <div class="shader-node__tooltip">vertex.x + wind displacement</div>
        </div>

        <!-- VectorCompose -->
        <div class="shader-node shader-node--compose" data-node-id="compose1" style="left: 960px; top: 80px;">
            <div class="shader-node__header">VectorCompose</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="x" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    x
                </div>
                <div class="shader-node__port" data-port-id="y" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    y
                </div>
                <div class="shader-node__port shader-node__port--output" data-port-id="out" data-port-type="output">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    vec
                </div>
            </div>
            <div class="shader-node__tooltip">Vector2(displaced_x, original_y)</div>
        </div>

        <!-- Output -->
        <div class="shader-node shader-node--output" data-node-id="output" style="left: 1120px; top: 60px;">
            <div class="shader-node__header">Output</div>
            <div class="shader-node__body">
                <div class="shader-node__port" data-port-id="vertex" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    Vertex
                </div>
                <div class="shader-node__port" data-port-id="uv" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--vec2"></span>
                    <span style="opacity:0.3">UV</span>
                </div>
                <div class="shader-node__port" data-port-id="color" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--color"></span>
                    <span style="opacity:0.3">Color</span>
                </div>
                <div class="shader-node__port" data-port-id="alpha" data-port-type="input">
                    <span class="shader-node__port-dot shader-node__port-dot--float"></span>
                    <span style="opacity:0.3">Alpha</span>
                </div>
            </div>
        </div>

    </div>
</div>

<h2>2D Lighting with Normal Maps</h2>

<p>Something I have been thinking about a lot lately is lighting. Most 2D pixel art games get away with baked lighting in the sprites themselves, and that is totally fine, but I want Ourinnerworld to have a sense of atmosphere that changes depending on where you are and what time it is in the story. The idea is to use Godot's <code>Light2D</code> nodes combined with normal maps on sprites and tilemaps, following the approach explained by <a href="https://www.gdquest.com/tutorial/godot/2d/lighting-with-normal-maps/" target="_blank" rel="noopener noreferrer">GDQuest↗</a> and also explored in <a href="https://www.youtube.com/watch?v=UavoVWHrebM" target="_blank" rel="noopener noreferrer">this devlog↗</a> that goes deeper into using them with animated sprites and tilemaps.</p>

<div class="info-box">
    <div class="info-box__title">What is a Normal Map?</div>
    <div class="info-box__content">A normal map is a special texture where each pixel's RGB values encode the direction a surface is facing at that point, instead of a color. The red channel represents the horizontal direction (left/right), green represents the vertical direction (up/down), and blue represents depth (toward or away from the camera). When a 2D light source hits a sprite that has a normal map assigned, the engine uses this directional information to calculate how much light each pixel should receive, creating the illusion of depth and volume on a flat sprite. In Godot, you can assign a normal map directly to a Sprite2D node through its material, or through a small shader for AnimatedSprite2D nodes. Tools like Laigter or even Aseprite with the right workflow can help generate normal maps from existing pixel art. The result is that your flat sprites react to lights in a way that feels genuinely three-dimensional, with highlights where the surface faces the light and shadows where it faces away.</div>
</div>

<p>The basic setup is not too complicated. You create a normal map version of your sprite (usually with an <code>_n</code> suffix), assign it to the sprite's material in the inspector, drop a <code>Light2D</code> into the scene with a soft texture, and the engine handles the rest. The light's <code>Height</code> property controls how far above the sprite the light appears to be, which changes how dramatic the shading looks. A <code>CanvasModulate</code> node lets you set the ambient darkness of the scene, so the lighting actually has something to contrast against. Without it, everything stays bright and the normal map effect is barely visible.</p>

<p>Where things get more interesting for Ourinnerworld is applying this to animated characters and tilemaps. For animated sprites in Godot, you need a small shader that reads the normal map and assigns it to the <code>NORMAL</code> built-in, since AnimatedSprite2D does not have a native normal map property. The shader itself is literally a few lines: sample the normal texture at the current UV, convert the color values from the 0-1 range to the -1 to 1 range that normals use, and assign it. For tilemaps, each tile in the tileset can have its own normal map assigned, which means the entire ground and walls of a world can react to lights moving through the scene. I am still experimenting with how subtle or dramatic I want the lighting to be for each world, since some dreamworlds are supposed to feel warm and soft while others should have harsher, more directional light. It is one of those things where the settings will probably be different per world, and I am okay with that.</p>

<h2>Gameplay Mechanics on the Horizon</h2>

<p>Beyond the visual and technical side of things, I have been brainstorming a bunch of gameplay mechanics that I want to incorporate into different worlds. None of these are implemented yet, but they are sitting in my notes and I think about them way too often, so here is a quick rundown. I want a <strong>swimming mechanic</strong> where the player can enter bodies of water and move differently, with a slower pace and maybe some particle effects for ripples. There is also <strong>fishing</strong>, which I imagine as a calm minigame you can do in certain spots, maybe with different catches depending on the world you are in. <strong>Watering plants</strong> is another one, where the player can interact with gardens or flowerbeds and watch them grow over time, which ties into the idea of worlds that feel alive and reactive to your actions.</p>

<p>For more puzzle-oriented gameplay, I have been sketching out <strong>button puzzles</strong> where you step on pressure plates or interact with switches in a specific order to open paths or reveal hidden areas. Some of these could involve using the party system, where different characters need to stand on different buttons at the same time. And on the chill side of things, I really want to have <strong>coffee shops</strong> and small stores in certain worlds where you can buy items. Not every mechanic needs to be complex. Sometimes the most memorable moments in games are the quiet ones where you just exist in a space for a bit.</p>

<h2>Art Progress Preview</h2>

<p>Here is a look at some of the art assets I have been working on in Aseprite. Most of this is still work in progress, but it gives an idea of the direction the visual style is heading. I am trying to keep a balance between detail and readability, since everything needs to look clear at the game's actual resolution while still having personality and charm. Drawing tiles, characters, and props one pixel at a time is definitely a slow process, but the control you get over every single detail makes it worth it.</p>

<div class="video-container">
    <video autoplay loop muted playsinline>
        <source src="/src/assets/ourinnerworlddev/artpreview.mp4" type="video/mp4">
    </video>
</div>

<div class="video-container">
    <img src="/src/assets/ourinnerworlddev/gamescreenshoot.png" alt="Art preview showing various pixel art assets including characters, tiles, and props">
</div>
<div class="video-container">
    <video autoplay loop muted playsinline>
        <source src="/src/assets/ourinnerworlddev/gameplaytest.mp4" type="video/mp4">
    </video>
</div>

<h2>Rendering Thoughts</h2>

<p>I have been watching a lot of rendering breakdowns lately and one that really stuck with me is <a href="https://www.youtube.com/watch?v=au9pce-xg5s" target="_blank" rel="noopener noreferrer">aarthificial's video↗</a> about pixel art rendering techniques. The core idea he explores is how to keep pixel art clean and stable when rendered in a game engine, avoiding common artifacts like pixel swimming, subpixel jitter, and inconsistent pixel sizes when the camera moves. His approach involves snapping the camera to a texel-aligned grid and then shifting the render output back by the snap error in screen space, so movement stays smooth while the pixels remain perfectly crisp. It is a surprisingly elegant solution to a problem that honestly drove me a little crazy when I first started moving the camera around in Godot.</p>

<p>For Ourinnerworld specifically, I am still deciding how deep to go with these techniques. The game uses a fixed pixel resolution and I already have the camera configured to avoid most jitter issues, but there are edge cases with sprite movement and tilemap scrolling where things can still look slightly off. I am also curious about the idea of separating animation from appearance using lookup textures, where the spritesheet encodes coordinates instead of colors and a shader resolves the final pixels from a separate palette image. It would make creating character variations much cheaper since you would only need new palette images instead of redrawing entire animation sheets. That said, I do not want to over-engineer the rendering pipeline for a game that is fundamentally about its story and atmosphere. There is a balance between technical polish and just shipping the thing, and I think for now the priority is getting the worlds built and the narrative in place. But it is fun to think about, and I will probably revisit some of these ideas once I have more of the game playable.</p>

<h2>OST Preview</h2>

<p>Before wrapping up this blog, I want to share something special. A friend and fellow music producer has been working on the original soundtrack for Ourinnerworld, and while it is still very much in progress, we have a preview track that captures the mood we are going for the Dark Worlds OST. The music is meant to feel dramatic and intimate, something that sits in the background of your experience without being intrusive but that you will definitely notice if it stops. Give it a listen! If the blog's background music is playing, it will pause automatically so you can hear this properly.</p>

<div class="ost-preview" data-ost-src="/src/assets/ourinnerworlddev/ostpreview.mp3">
    <div class="ost-preview__header">
        <div class="ost-preview__badge">Original Soundtrack</div>
        <span class="ost-preview__title">OURINNERWORLD — Preview Track</span>
        <span class="ost-preview__artist">EDDIE</span>
    </div>
    <div class="ost-preview__controls">
        <button class="ost-preview__play" id="ostPlayBtn" aria-label="Play OST preview">
            <svg class="ost-preview__icon-play" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            <svg class="ost-preview__icon-pause" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
        </button>
        <div class="ost-preview__progress-wrap" id="ostProgressWrap">
            <div class="ost-preview__progress-track">
                <div class="ost-preview__progress-fill" id="ostProgressFill"></div>
            </div>
        </div>
        <span class="ost-preview__time" id="ostTime">0:00</span>
    </div>
</div>
            `
        }
    ]
  },
  
];

export default blogData;
