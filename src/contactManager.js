/**
 * ============================
 * CONTACT MANAGER MODULE
 * ============================
 */
import { soundManager } from './soundManager.js';
import { CONFIG } from './config.js';

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

        this.dialogVariations = {
            greeting: [
                "Hey there! I'm so happy you want to get in touch! ✨",
                "Hi! Oh my gosh, I love when people reach out! 💙",
                "Hello! Thanks for stopping by to chat! 🌟",
                "Hey! So excited to hear from you! 💫"
            ],
            intro: [
                "Let me ask you a few quick questions so I can get back to you properly.",
                "I just need a few details to make sure I can help you out!",
                "Mind if I ask you some quick questions? It'll just take a moment!",
                "Let me grab some info real quick so we can connect properly!"
            ],
            askEmail: [
                "First things first - what's your email address?",
                "What's the best email to reach you at?",
                "Could I get your email so I can reply to you?",
                "What email should I use to get back to you?"
            ],
            emailConfirm: [
                "Perfect! Got it! 📧",
                "Awesome, thank you! ✨",
                "Great, saved! 💙",
                "Perfect, all set! 🌟"
            ],
            askName: [
                "Now, what should I call you? (Your name or username)",
                "What's your name? I'd love to know who I'm talking to!",
                "And who do I have the pleasure of chatting with?",
                "What would you like me to call you?"
            ],
            greetName: [
                "Nice to meet you, {username}! 💫",
                "Hey {username}! Love that name! ✨",
                "So good to meet you, {username}! 💙",
                "{username}! What a great name! 🌟"
            ],
            askTopic: [
                "What would you like to talk about? (Project collaboration, feedback, just saying hi, etc.)",
                "So what's on your mind? Projects, ideas, or just wanna chat?",
                "What brings you here today? I'm all ears!",
                "What can I help you with? (Collab ideas, questions, or just saying hello!)"
            ],
            topicTransition: [
                "Awesome! Last question - tell me more about it. What's on your mind?",
                "Love it! Give me the details - what are you thinking?",
                "Ooh interesting! Tell me more - what's the full story?",
                "Cool! Now spill - what's this all about?"
            ],
            thanks: [
                "Thank you so much for reaching out, {username}! 💙",
                "This was so nice, {username}! Thanks for chatting! ✨",
                "I really appreciate you taking the time, {username}! 💫",
                "You're awesome for reaching out, {username}! 🌟"
            ],
            followUp: [
                "I'll get back to you at {email} as soon as possible!",
                "Expect to hear from me at {email} super soon!",
                "I'll shoot you an email at {email} really quickly!",
                "Watch your inbox at {email} - I'll reply fast!"
            ],
            sending: [
                "Sending your message now... ✉️",
                "Alright, firing off your message! 🚀",
                "Okay, sending this over! 💌",
                "Message away! 📨"
            ]
        };

        this.skyeMessageSounds = [
            { sound: 'imessageReceived', volume: 0.4 },
            { sound: 'imessageSent', volume: 0.3 },
            { sound: 'imessageReceived', volume: 0.35 }
        ];

        this.userMessageSounds = [
            { sound: 'imessageSendFromUser', volume: 0.5 },
            { sound: 'imessageReceived', volume: 0.4 }
        ];

        this.conversationSteps = [
            {
                type: 'skye',
                messageKey: 'greeting',
                delay: 800
            },
            {
                type: 'skye',
                messageKey: 'intro',
                delay: 1200
            },
            {
                type: 'skye',
                messageKey: 'askEmail',
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
                messageKey: 'emailConfirm',
                delay: 600
            },
            {
                type: 'skye',
                messageKey: 'askName',
                delay: 800,
                waitForInput: true,
                inputType: 'username',
                validation: (value) => value.trim().length >= 2,
                errorMessage: "I need at least 2 characters for your name! ✨"
            },
            {
                type: 'skye',
                messageKey: 'greetName',
                delay: 700
            },
            {
                type: 'skye',
                messageKey: 'askTopic',
                delay: 1000,
                waitForInput: true,
                inputType: 'topic',
                validation: (value) => value.trim().length >= 3,
                errorMessage: "Could you give me a bit more detail? At least 3 characters! 💭",
                checkKeywords: true
            },
            {
                type: 'skye',
                messageKey: 'topicTransition',
                delay: 800,
                waitForInput: true,
                inputType: 'message',
                validation: (value) => value.trim().length >= 10,
                errorMessage: "I'd love to hear more! Please write at least 10 characters. 💬",
                checkKeywords: true
            },
            {
                type: 'skye',
                messageKey: 'thanks',
                delay: 1000
            },
            {
                type: 'skye',
                messageKey: 'followUp',
                delay: 1200
            },
            {
                type: 'skye',
                messageKey: 'sending',
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

        window.addEventListener('pageChanged', (e) => {
            if (e.detail.page === 'contact' && this.currentStep === 0) {
                setTimeout(() => this.startConversation(), 500);
            }
        });
    }

    getRandomMessage(messageKey) {
        const variations = this.dialogVariations[messageKey];
        if (!variations || variations.length === 0) return '';

        const randomIndex = Math.floor(Math.random() * variations.length);
        return variations[randomIndex];
    }

    getRandomSound(soundList) {
        const randomIndex = Math.floor(Math.random() * soundList.length);
        return soundList[randomIndex];
    }

    detectSpecialKeywords(text) {
        const lower = text.toLowerCase();

        if (lower.includes('love') || lower.includes('amo') || lower.includes('❤️') || lower.includes('💕')) {
            const responses = [
                "Aww, sending love right back!",
                "That's so sweet! ily ily ilyyyy",
                "My heart! Sending all the good vibes!"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lower.includes('urgent') || lower.includes('urgente') || lower.includes('asap') || lower.includes('emergency')) {
            const responses = [
                "Got it, I'll prioritize this! 🚀",
                "On it! I'll get back to you ASAP! ⚡",
                "Understood - marking this as urgent! 🔥"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lower.includes('thank') || lower.includes('gracias') || lower.includes('thanks')) {
            const responses = [
                "Of course! Happy to help! ✨",
                "No problem at all! 💙",
                "Anytime! That's what I'm here for! 🌟"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lower.includes('collab') || lower.includes('project') || lower.includes('trabajo') || lower.includes('partner')) {
            const responses = [
                "Ooh, I love collaborations! Can't wait to hear more! 🤝✨",
                "Collaboration? Yes please! Tell me everything! 💫",
                "I'm so down to work together! This is exciting! 🌟"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lower.includes('amazing') || lower.includes('awesome') || lower.includes('love your') || lower.includes('beautiful')) {
            const responses = [
                "Omg thank you so much! That means a lot!",
                "You're too kind! Thank you! 💙✨",
                "Aww, you're making me blush! Thanks! 💕"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if ((lower.includes('just saying hi') || lower.includes('say hello') || lower.includes('hi') && lower.length < 30)) {
            const responses = [
                "Hey! So nice of you to stop by! 👋💙",
                "Hi! Love that you're here! ✨",
                "Hello! Thanks for saying hi! 🌟"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lower.includes('question') || lower.includes('pregunta') || lower.includes('wondering') || lower.includes('?')) {
            const responses = [
                "Ask away! I'm all ears!",
                "I love questions! Fire away! 💭",
                "Ooh, let's figure this out together! 🤔💙"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        if (lower.includes('fan') || lower.includes('admire') || lower.includes('inspire') || lower.includes('inspiration')) {
            const responses = [
                "That's so incredibly sweet! Thank you! 🥺💕",
                "You're gonna make me cry! Thank you so much! 💙✨",
                "Wow, I'm honored! Thanks for the kind words! 🌟"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return null;
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

        let message = step.messageKey 
            ? this.getRandomMessage(step.messageKey)
            : step.message;

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

        const typingIndicator = this.createTypingIndicator();
        bubbleDiv.appendChild(typingIndicator);

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.style.backgroundImage = "url('https://dl.dropbox.com/scl/fi/nrgsz0vtcnwgd9msz1nzh/puppy.JPG?rlkey=jen8najj04sih3gw2pxeymq35&st=hvyte78j&dl=0')";

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubbleDiv);
        this.messagesContainer.appendChild(messageDiv);

        this.scrollToBottom();

        await this.delay(Math.min(text.length * 30, 2000));

        typingIndicator.remove();

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        bubbleDiv.appendChild(textSpan);

        const randomSound = this.getRandomSound(this.skyeMessageSounds);
        soundManager?.play(randomSound.sound, randomSound.volume);

        this.scrollToBottom();
    }

    addUserMessage(text) {
        const randomSound = this.getRandomSound(this.userMessageSounds);
        soundManager?.play(randomSound.sound, randomSound.volume);

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

        if (step.validation && !step.validation(value)) {
            await this.addSkyeMessage(step.errorMessage);
            soundManager?.play('knock', 0.3);
            return;
        }

        this.addUserMessage(value);

        this.userResponses[step.inputType] = value;

        if (step.checkKeywords) {
            const specialResponse = this.detectSpecialKeywords(value);
            if (specialResponse) {
                await this.delay(800);
                await this.addSkyeMessage(specialResponse);
                await this.delay(600);
            }
        }

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
            const response = await fetch(`${CONFIG.BACKEND_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CLIENT-KEY': CONFIG.CLIENT_KEY
                },
                body: JSON.stringify(this.userResponses)
            });

            const data = await response.json();

            if (response.ok) {
                await this.addSkyeMessage("Message sent successfully! ✨ I'll get back to you soon!");
                soundManager?.play('imessageSent', 0.6);
            } else {
                await this.addSkyeMessage(`Oops! ${data.error || 'Something went wrong.'} Could you try again or email me directly at luvrksnskyejourney@icloud.com? 💙`);
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