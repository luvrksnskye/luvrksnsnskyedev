/**
 * ============================
 * LANGUAGES MANAGER MODULE
 * ============================
 * Handles the programming languages and frameworks showcase
 * Exports as ES6 module
 */

import { soundManager } from './soundManager.js';

class LanguagesManager {
    constructor() {
        this.initialized = false;
        this.languages = [
            { name: 'JavaScript', icon: '/src/assets/javascript-icon.png', level: 'Expert', proficiency: 95 },
            { name: 'HTML/CSS', icon: '/src/assets/html-css-icon.png', level: 'Expert', proficiency: 98 },
            { name: 'React', icon: '/src/assets/react-icon.png', level: 'Advanced', proficiency: 90 },
            { name: 'Gdscript', icon: '/src/assets/gdscript-icon.svg', level: 'Intermediate', proficiency: 50 },
            { name: 'Typescript', icon: '/src/assets/typescript-icon.png', level: 'Intermediate', proficiency: 65 },
            { name: 'Express', icon: '/src/assets/express-icon.png', level: 'Intermediate', proficiency: 60 },
            { name: 'NestJS', icon: '/src/assets/NestJS-icon.png', level: 'Intermediate', proficiency: 70 },
            { name: 'Bash', icon: '/src/assets/bash-icon.svg', level: 'Expert', proficiency: 98 },
            { name: 'Tailwind CSS', icon: '/src/assets/tailwind-icon.png', level: 'Expert', proficiency: 92 },
            { name: 'Vue.js', icon: '/src/assets/vue-icon.png', level: 'Intermediate', proficiency: 70 },
            { name: 'Next.js', icon: '/src/assets/nextjs-icon.png', level: 'Advanced', proficiency: 88 },
            { name: 'Bootstrap', icon: '/src/assets/bootstrap-icon.png', level: 'Advanced', proficiency: 85 },
            { name: 'Python', icon: '/src/assets/python-icon.png', level: 'Advanced', proficiency: 80 }
        ];

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.languagesContainer = document.getElementById('languagesContainer');

        if (!this.languagesContainer) {
            console.warn('Languages container not found');
            return;
        }

        this.renderLanguages();
        this.initialized = true;
        console.log('✅ Languages Manager module loaded');
    }

    renderLanguages() {
        this.languages.forEach((language, index) => {
            const card = this.createLanguageCard(language, index);
            this.languagesContainer.appendChild(card);
        });
    }

    createLanguageCard(language, index) {
        const card = document.createElement('div');
        card.className = 'language-card';
        card.setAttribute('data-language-index', index);

        card.innerHTML = `
            <div class="language-header">
                <div class="language-icon" style="background-image: url('${language.icon}')"></div>
                <div class="language-info">
                    <div class="language-name">${language.name}</div>
                    <div class="language-level">${language.level}</div>
                </div>
            </div>
            <div class="language-bar">
                <div class="language-progress" style="width: 0%;" data-proficiency="${language.proficiency}"></div>
            </div>
        `;

        card.addEventListener('mouseenter', () => {
            soundManager?.play('hover', 0.15);
            this.animateProgress(card, language.proficiency);
        });

        card.addEventListener('click', () => {
            soundManager?.play('click', 0.3);
        });

        return card;
    }

    animateProgress(card, proficiency) {
        const progressBar = card.querySelector('.language-progress');
        if (!progressBar) return;

        if (progressBar.style.width === `${proficiency}%`) {
            return;
        }

        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.transition = 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            progressBar.style.width = `${proficiency}%`;
        }, 10);
    }

    getLanguage(index) {
        return this.languages[index];
    }

    addLanguage(language) {
        this.languages.push(language);
        const card = this.createLanguageCard(language, this.languages.length - 1);
        this.languagesContainer.appendChild(card);
    }

    removeLanguage(index) {
        if (index >= 0 && index < this.languages.length) {
            this.languages.splice(index, 1);
            const card = this.languagesContainer.querySelector(`[data-language-index="${index}"]`);
            if (card) card.remove();
        }
    }

    updateProficiency(index, newProficiency) {
        if (index >= 0 && index < this.languages.length) {
            this.languages[index].proficiency = Math.max(0, Math.min(100, newProficiency));
            const card = this.languagesContainer.querySelector(`[data-language-index="${index}"]`);
            if (card) {
                this.animateProgress(card, newProficiency);
            }
        }
    }

    getAllLanguages() {
        return this.languages;
    }

    getLanguagesByLevel(level) {
        return this.languages.filter(lang => lang.level === level);
    }

    destroy() {
        // Cleanup
    }
}

export const languagesManager = new LanguagesManager();
window.languagesManager = languagesManager;
export default languagesManager;