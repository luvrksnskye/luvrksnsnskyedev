/**
 * ============================
 * TOOLS MANAGER MODULE
 * ============================
 * Handles the tools/software showcase panel
 * Exports as ES6 module
 */

import { soundManager } from './soundManager.js';

class ToolsManager {
    constructor() {
        this.initialized = false;
        this.tools = [
            { name: 'Figma', image: '/src/assets/figma-icon.png', description: 'My primary design tool for creating interfaces, prototypes, and collaborative design work. Perfect for UI/UX design and design systems.' },
            { name: 'Github', image: '/src/assets/github-icon.png', description: 'Organization and documentation hub for all my projects, ideas, and workflows. Keeping everything structured and accessible.' },
            { name: 'VS Code', image: '/src/assets/vscode-icon.png', description: 'The code editor where I bring designs to life with HTML, CSS, and JavaScript. My daily development environment.' },
            { name: 'Firealpaca', image: '/src/assets/firealpaca-icon.png', description: 'Digital painting software for creating illustrations, concept art, and animations with a focus on a user-friendly interface.' },
            { name: 'Godot', image: '/src/assets/godot-icon.png', description: 'Game engine for developing interactive experiences and game prototypes. Building immersive worlds and mechanics.' },
            { name: 'Ghostty', image: '/src/assets/ghostty-icon.png', description: 'bla bla bla.' },
            { name: 'After Effects', image: '/src/assets/aftereffects-icon.png', description: 'Motion graphics and animation software for creating engaging video content and UI animations.' },
            { name: 'Aseprite', image: '/src/assets/aseprite-icon.png', description: 'Pixel art tool for creating 2D animations and sprites with a focus on frame-by-frame animation.' },
            { name: 'Git', image: '/src/assets/git-icon.svg', description: 'Version control system for tracking changes in code and collaborating with others.' },
            { name: 'Debian', image: '/src/assets/debian-icon.png', description: 'Operating system that provides a flexible and powerful environment for development and customization.' },
            { name: 'Notion', image: '/src/assets/notion-icon.png', description: 'All-in-one workspace for note-taking, project management, and collaboration.' },
            { name: 'Obsidian', image: '/src/assets/obsidian-icon.png', description: 'Knowledge base that works on local Markdown files. It is highly customizable, allowing users to link notes together, visualize connections with a graph view, and extend its functionality with a wide variety of plugins. I love this software so much!' }
        ];

        this.activeCard = null;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.toolsScroll = document.getElementById('toolsScroll');
        this.toolDescription = document.getElementById('toolDescription');
        this.toolDescriptionText = document.getElementById('toolDescriptionText');

        if (!this.toolsScroll || !this.toolDescription || !this.toolDescriptionText) {
            console.warn('Tools panel elements not found');
            return;
        }

        this.renderTools();
        this.initialized = true;
        console.log('✅ Tools Manager module loaded');
    }

    renderTools() {
        this.tools.forEach((tool, index) => {
            const card = this.createToolCard(tool, index);
            this.toolsScroll.appendChild(card);
        });
        
        this.toolsScroll.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {
        if (!this.scrollTimeout) {
            soundManager?.play('scroll', 0.2);
            
            this.scrollTimeout = setTimeout(() => {
                this.scrollTimeout = null;
            }, 200);
        }
    }

    createToolCard(tool, index) {
        const card = document.createElement('div');
        card.className = 'tool-card';
        card.setAttribute('data-tool-index', index);
        
        card.innerHTML = `
            <div class="tool-icon" style="background-image: url('${tool.image}')"></div>
            <div class="tool-name">${tool.name}</div>
        `;
        
        card.addEventListener('click', () => this.handleToolClick(tool, card));
        card.addEventListener('mouseenter', () => soundManager?.play('tick', 0.15));
        
        return card;
    }

    handleToolClick(tool, card) {
        soundManager?.play('menuClick', 0.4);

        if (this.activeCard === card) {
            this.hideDescription(card);
            return;
        }

        if (this.activeCard) {
            this.activeCard.classList.remove('active');
        }

        this.activeCard = card;
        card.classList.add('active');

        this.showDescription(tool);
        this.scrollToCard(card);
    }

    showDescription(tool) {
        this.toolDescriptionText.textContent = tool.description;
        this.toolDescription.classList.add('show');
    }

    hideDescription(card) {
        card.classList.remove('active');
        this.toolDescription.classList.remove('show');
        this.activeCard = null;
    }

    scrollToCard(card) {
        const container = this.toolsScroll;
        const cardRect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const scrollLeft = card.offsetLeft - (containerRect.width / 2) + (cardRect.width / 2);
        
        container.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
        });
    }

    addTool(tool) {
        this.tools.push(tool);
        const card = this.createToolCard(tool, this.tools.length - 1);
        this.toolsScroll.appendChild(card);
    }

    removeTool(index) {
        if (index >= 0 && index < this.tools.length) {
            this.tools.splice(index, 1);
            const card = this.toolsScroll.querySelector(`[data-tool-index="${index}"]`);
            if (card) card.remove();
        }
    }

    getTool(index) {
        return this.tools[index];
    }

    clearSelection() {
        if (this.activeCard) {
            this.hideDescription(this.activeCard);
        }
    }

    destroy() {
        this.clearSelection();
    }
}

export const toolsManager = new ToolsManager();
window.toolsManager = toolsManager;
export default toolsManager;