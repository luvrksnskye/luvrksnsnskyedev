/**
 * ============================
 * CONTACT MANAGER MODULE
 * ============================
 */

import { soundManager } from './soundManager.js';

class ContactManager {
    constructor() {
        this.initialized = false;
        this.currentStep = 0;
        this.userResponses = {
            email: '',
            username: '',
            topic: '',
            message: ''
        };
        
        this.conversationSteps = [
            {
                type: 'skye',
                message: "Hey there! 👋 I'm so happy you want to get in touch!",
                delay: 800
            },
            {
                type: 'skye',
                message: "Let me ask you a few quick questions so I can get back to you properly.",
                delay: 1200
            },
            {
                type: 'skye',
                message: "First things first - what's your email address?",
                delay: 1000,
                waitForInput: true,
                inputType: 'email',
                validation: (value) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value);
                },
                errorMessage: "Hmm, that doesn't look like a valid email. Could you try again? 📧"
            },
            {
                type: 'skye',
                message: "Perfect! Now, what should I call you? (Your name or username)",
                delay: 800,
                waitForInput: true,
                inputType: 'username',
                validation: (value) => value.trim().length >= 2,
                errorMessage: "I need at least 2 characters for your name! ✨"
            },
            {
                type: 'skye',
                message: "Nice to meet you, {username}! 😊",
                delay: 600
            },
            {
                type: 'skye',
                message: "What would you like to talk about? (Project collaboration, feedback, just saying hi, etc.)",
                delay: 1000,
                waitForInput: true,
                inputType: 'topic',
                validation: (value) => value.trim().length >= 3,
                errorMessage: "Could you give me a bit more detail? At least 3 characters! 💭"
            },
            {
                type: 'skye',
                message: "Awesome! Last question - tell me more about it. What's on your mind?",
                delay: 800,
                waitForInput: true,
                inputType: 'message',
                validation: (value) => value.trim().length >= 10,
                errorMessage: "I'd love to hear more! Please write at least 10 characters. 💬"
            },
            {
                type: 'skye',
                message: "Thank you so much for reaching out, {username}! 💙",
                delay: 1000
            },
            {
                type: 'skye',
                message: "I'll get back to you at {email} as soon as possible!",
                delay: 1200
            },
            {
                type: 'skye',
                message: "Sending your message now...",
                delay: 800,
                action: 'send'
            }
        ];

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.contactContainer = document.getElementById('contactContainer');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.inputContainer = document.getElementById('inputContainer');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');

        if (!this.contactContainer) {
            console.warn('Contact container not found');
            return;
        }

        this.setupEventListeners();
        this.initialized = true;
        console.log('✅ Contact Manager module loaded');
    }

    setupEventListeners() {
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.handleSend());
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSend();
                }
            });

            this.messageInput.addEventListener('input', () => {
                this.updateSendButtonState();
            });
        }

        // Listen for contact page becoming visible
        window.addEventListener('pageChanged', (e) => {
            if (e.detail.page === 'contact' && this.currentStep === 0) {
                setTimeout(() => this.startConversation(), 500);
            }
        });
    }

    startConversation() {
        this.currentStep = 0;
        this.messagesContainer.innerHTML = '';
        this.hideInput();
        this.processNextStep();
    }

    async processNextStep() {
        if (this.currentStep >= this.conversationSteps.length) {
            return;
        }

        const step = this.conversationSteps[this.currentStep];
        
        await this.delay(step.delay || 800);

        if (step.action === 'send') {
            await this.sendEmail();
            return;
        }

        let message = step.message;
        // Replace placeholders
        message = message.replace('{username}', this.userResponses.username);
        message = message.replace('{email}', this.userResponses.email);

        await this.addSkyeMessage(message);

        if (step.waitForInput) {
            this.showInput(step);
        } else {
            this.currentStep++;
            this.processNextStep();
        }
    }

    async addSkyeMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message skye-message';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        // Show typing indicator first
        const typingIndicator = this.createTypingIndicator();
        bubbleDiv.appendChild(typingIndicator);
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.style.backgroundImage = "url('https://dl.dropbox.com/scl/fi/nrgsz0vtcnwgd9msz1nzh/puppy.JPG?rlkey=jen8najj04sih3gw2pxeymq35&st=hvyte78j&dl=0')";
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubbleDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();

        // Wait for typing animation
        await this.delay(Math.min(text.length * 30, 2000));

        // Remove typing indicator and show actual message
        typingIndicator.remove();
        
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        bubbleDiv.appendChild(textSpan);

        // Play received sound when message appears
        soundManager?.play('imessageReceived', 0.4);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        // Play send sound immediately when user sends
        soundManager?.play('imessageSendFromUser', 0.5);

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        bubbleDiv.appendChild(textSpan);
        
        messageDiv.appendChild(bubbleDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.scrollToBottom();
    }

    createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            indicator.appendChild(dot);
        }
        
        return indicator;
    }

    showInput(step) {
        this.currentInputStep = step;
        this.inputContainer.style.display = 'flex';
        this.messageInput.value = '';
        this.messageInput.placeholder = this.getPlaceholder(step.inputType);
        this.messageInput.focus();
        this.updateSendButtonState();
    }

    hideInput() {
        this.inputContainer.style.display = 'none';
        this.messageInput.value = '';
    }

    getPlaceholder(inputType) {
        const placeholders = {
            email: 'your.email@example.com',
            username: 'Your name',
            topic: 'What would you like to discuss?',
            message: 'Tell me more...'
        };
        return placeholders[inputType] || 'Type your message...';
    }

    async handleSend() {
        const value = this.messageInput.value.trim();
        
        if (!value) return;

        const step = this.currentInputStep;

        // Validate input
        if (step.validation && !step.validation(value)) {
            await this.addSkyeMessage(step.errorMessage);
            soundManager?.play('knock', 0.3);
            return;
        }

        // Add user message
        this.addUserMessage(value);
        
        // Save response
        this.userResponses[step.inputType] = value;

        // Hide input and move to next step
        this.hideInput();
        this.currentStep++;
        
        await this.delay(600);
        this.processNextStep();
    }

    updateSendButtonState() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText;
        this.sendButton.style.opacity = hasText ? '1' : '0.5';
    }

   async sendEmail() {
    try {
        // Hey so, if you are using my code as reference, remember to change the URL to your own server!
        const RAILWAY_URL = 'https://luvrksnsnskyedev-production.up.railway.app';

        const response = await fetch(`${RAILWAY_URL}/api/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.userResponses)
        });

        const data = await response.json();

        if (response.ok) {
            await this.addSkyeMessage("Message sent successfully! ✨ I'll get back to you soon!");
            soundManager?.play('notification', 0.6);
        } else {
            await this.addSkyeMessage(`Oops! ${data.error || 'Something went wrong.'} Could you try again or email me directly at luvrksnskyejourney@icloud.com? 💔`);
            soundManager?.play('knock', 0.4);
        }
    } catch (error) {
        console.error('Error sending email:', error);
        await this.addSkyeMessage("Hmm, there was a connection issue. Please email me directly at luvrksnskyejourney@icloud.com! 💌");
        soundManager?.play('knock', 0.4);
    }

    this.currentStep++;
}

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset() {
        this.currentStep = 0;
        this.userResponses = {
            email: '',
            username: '',
            topic: '',
            message: ''
        };
        this.messagesContainer.innerHTML = '';
        this.hideInput();
    }

    destroy() {
        this.reset();
    }
}

export const contactManager = new ContactManager();
window.contactManager = contactManager;
export default contactManager;