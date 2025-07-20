import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiChatBot {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.chat = null;
        this.chatHistory = [];
        this.apiKey = localStorage.getItem('gemini-api-key') || '';
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadChatHistory();
        this.autoResizeTextarea();
        
        if (this.apiKey) {
            this.initializeGemini();
        } else {
            this.showSettings();
        }
    }

    initializeElements() {
        // Chat elements
        this.chatContainer = document.getElementById('chat-container');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.welcomeMessage = document.getElementById('welcome-message');
        this.charCount = document.getElementById('char-count');
        
        // Control elements
        this.clearChatBtn = document.getElementById('clear-chat');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.cancelSettingsBtn = document.getElementById('cancel-settings');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.apiKeyInput = document.getElementById('api-key-input');
        
        // Status elements
        this.statusIndicator = document.getElementById('status-indicator');
        this.errorToast = document.getElementById('error-toast');
        this.errorMessage = document.getElementById('error-message');
        
        // Suggestion buttons
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
    }

    setupEventListeners() {
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Input handling
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.toggleSendButton();
            this.autoResizeTextarea();
        });
        
        // Clear chat
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        
        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.hideSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        
        // Modal backdrop click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.hideSettings();
            }
        });
        
        // Suggestion buttons
        this.suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.messageInput.value = btn.textContent.trim();
                this.updateCharCount();
                this.toggleSendButton();
                this.sendMessage();
            });
        });
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.settingsModal.classList.contains('hidden')) {
                this.hideSettings();
            }
        });
    }

    initializeGemini() {
        try {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            });
            this.chat = this.model.startChat({
                history: this.chatHistory.map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.message }]
                }))
            });
            this.updateStatus('online');
        } catch (error) {
            this.showError('Failed to initialize Gemini AI. Please check your API key.');
            this.updateStatus('offline');
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.model) return;

        // Clear input and hide welcome
        this.messageInput.value = '';
        this.updateCharCount();
        this.toggleSendButton();
        this.hideWelcome();
        this.autoResizeTextarea();

        // Add user message
        this.addMessage(message, 'user');
        this.showTypingIndicator();

        try {
            // Send message to Gemini
            const result = await this.chat.sendMessage(message);
            const response = await result.response;
            const text = response.text();

            this.hideTypingIndicator();
            this.addMessage(text, 'bot');
            
        } catch (error) {
            this.hideTypingIndicator();
            this.showError('Failed to get response from Gemini. Please try again.');
            console.error('Gemini API error:', error);
        }
    }

    addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up message-enter`;
        
        const avatar = sender === 'user' 
            ? '<div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-medium">U</div>'
            : '<div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-white text-xs"></i></div>';
        
        const messageClass = sender === 'user' ? 'user-message' : 'bot-message';
        const textColor = sender === 'user' ? 'text-white' : 'text-gray-800';
        
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 max-w-3xl ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}">
                ${avatar}
                <div class="message-bubble ${messageClass} ${textColor}">
                    <div class="whitespace-pre-wrap break-words">${this.formatMessage(message)}</div>
                    <div class="text-xs ${sender === 'user' ? 'text-blue-100' : 'text-gray-500'} mt-1">
                        ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Save to history
        this.chatHistory.push({
            message,
            sender,
            timestamp: new Date().toISOString()
        });
        this.saveChatHistory();
    }

    formatMessage(message) {
        // Basic markdown-like formatting
        return message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
    }

    hideWelcome() {
        if (this.welcomeMessage) {
            this.welcomeMessage.style.display = 'none';
        }
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatContainer.innerHTML = '';
            this.chatHistory = [];
            this.saveChatHistory();
            this.welcomeMessage.style.display = 'block';
            
            // Reinitialize chat
            if (this.model) {
                this.chat = this.model.startChat({ history: [] });
            }
        }
    }

    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = count;
        
        if (count > 1800) {
            this.charCount.className = 'text-red-500';
        } else if (count > 1500) {
            this.charCount.className = 'text-yellow-500';
        } else {
            this.charCount.className = 'text-gray-400';
        }
    }

    toggleSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendBtn.disabled = !hasText || !this.model;
        
        if (hasText && this.model) {
            this.sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            this.sendBtn.classList.add('hover:shadow-lg');
        } else {
            this.sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
            this.sendBtn.classList.remove('hover:shadow-lg');
        }
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        const scrollHeight = this.messageInput.scrollHeight;
        const maxHeight = 120;
        
        if (scrollHeight <= maxHeight) {
            this.messageInput.style.height = scrollHeight + 'px';
        } else {
            this.messageInput.style.height = maxHeight + 'px';
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    showSettings() {
        this.apiKeyInput.value = this.apiKey;
        this.settingsModal.style.display = 'flex';
        this.settingsModal.classList.remove('hidden');
        this.apiKeyInput.focus();
    }

    hideSettings() {
        this.settingsModal.style.display = 'none';
        this.settingsModal.classList.add('hidden');
    }

    saveSettings() {
        const newApiKey = this.apiKeyInput.value.trim();
        
        if (!newApiKey) {
            this.showError('Please enter a valid API key');
            return;
        }
        
        this.apiKey = newApiKey;
        localStorage.setItem('gemini-api-key', this.apiKey);
        this.initializeGemini();
        this.hideSettings();
        this.toggleSendButton();
        
        this.showSuccess('API key saved successfully!');
    }

    updateStatus(status) {
        const indicator = this.statusIndicator.querySelector('div');
        const text = this.statusIndicator.querySelector('span');
        
        if (status === 'online') {
            indicator.className = 'w-2 h-2 bg-green-500 rounded-full animate-pulse';
            text.textContent = 'Online';
        } else {
            indicator.className = 'w-2 h-2 bg-red-500 rounded-full';
            text.textContent = 'Offline';
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorToast.classList.remove('hidden');
        setTimeout(() => {
            this.errorToast.classList.add('hidden');
        }, 5000);
    }

    showSuccess(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
        toast.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    loadChatHistory() {
        const saved = localStorage.getItem('gemini-chat-history');
        if (saved) {
            try {
                this.chatHistory = JSON.parse(saved);
                // Restore messages
                this.chatHistory.forEach(({ message, sender }) => {
                    this.addMessageWithoutSaving(message, sender);
                });
                if (this.chatHistory.length > 0) {
                    this.hideWelcome();
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
                this.chatHistory = [];
            }
        }
    }

    addMessageWithoutSaving(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        const avatar = sender === 'user' 
            ? '<div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-medium">U</div>'
            : '<div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><i class="fas fa-robot text-white text-xs"></i></div>';
        
        const messageClass = sender === 'user' ? 'user-message' : 'bot-message';
        const textColor = sender === 'user' ? 'text-white' : 'text-gray-800';
        
        messageDiv.innerHTML = `
            <div class="flex items-start space-x-3 max-w-3xl ${sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}">
                ${avatar}
                <div class="message-bubble ${messageClass} ${textColor}">
                    <div class="whitespace-pre-wrap break-words">${this.formatMessage(message)}</div>
                </div>
            </div>
        `;
        
        this.chatContainer.appendChild(messageDiv);
    }

    saveChatHistory() {
        try {
            localStorage.setItem('gemini-chat-history', JSON.stringify(this.chatHistory));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GeminiChatBot();
});
