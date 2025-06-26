class TextEncryptor {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.updateShiftControl();
    }

    initializeElements() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.methodSelect = document.getElementById('method');
        this.shiftInput = document.getElementById('shift');
        this.shiftControl = document.getElementById('shiftControl');
        this.encryptBtn = document.getElementById('encryptBtn');
        this.decryptBtn = document.getElementById('decryptBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.clearBtn = document.getElementById('clearBtn');
    }

    bindEvents() {
        this.encryptBtn.addEventListener('click', () => this.encrypt());
        this.decryptBtn.addEventListener('click', () => this.decrypt());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.methodSelect.addEventListener('change', () => this.updateShiftControl());
        
        // Add enter key support for inputs
        this.inputText.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.encrypt();
            }
        });
    }

    updateShiftControl() {
        const method = this.methodSelect.value;
        if (method === 'caesar') {
            this.shiftControl.classList.remove('hidden');
        } else {
            this.shiftControl.classList.add('hidden');
        }
    }

    encrypt() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.showError('Please enter some text to encrypt');
            return;
        }

        const method = this.methodSelect.value;
        const shift = parseInt(this.shiftInput.value) || 3;

        let encryptedText = '';

        try {
            switch (method) {
                case 'caesar':
                    encryptedText = this.caesarCipher(text, shift);
                    break;
                case 'base64':
                    encryptedText = this.base64Encode(text);
                    break;
                case 'reverse':
                    encryptedText = this.reverseText(text);
                    break;
                case 'atbash':
                    encryptedText = this.atbashCipher(text);
                    break;
                default:
                    throw new Error('Unknown encryption method');
            }

            this.outputText.value = encryptedText;
            this.showSuccess('Text encrypted successfully!');
        } catch (error) {
            this.showError('Encryption failed: ' + error.message);
        }
    }

    decrypt() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.showError('Please enter some text to decrypt');
            return;
        }

        const method = this.methodSelect.value;
        const shift = parseInt(this.shiftInput.value) || 3;

        let decryptedText = '';

        try {
            switch (method) {
                case 'caesar':
                    decryptedText = this.caesarCipher(text, -shift);
                    break;
                case 'base64':
                    decryptedText = this.base64Decode(text);
                    break;
                case 'reverse':
                    decryptedText = this.reverseText(text);
                    break;
                case 'atbash':
                    decryptedText = this.atbashCipher(text);
                    break;
                default:
                    throw new Error('Unknown decryption method');
            }

            this.outputText.value = decryptedText;
            this.showSuccess('Text decrypted successfully!');
        } catch (error) {
            this.showError('Decryption failed: ' + error.message);
        }
    }

    // Encryption Methods
    caesarCipher(text, shift) {
        return text.replace(/[a-zA-Z]/g, (char) => {
            const start = char <= 'Z' ? 65 : 97;
            const code = char.charCodeAt(0);
            let shifted = ((code - start + shift) % 26 + 26) % 26;
            return String.fromCharCode(shifted + start);
        });
    }

    base64Encode(text) {
        try {
            return btoa(unescape(encodeURIComponent(text)));
        } catch (error) {
            throw new Error('Invalid characters for Base64 encoding');
        }
    }

    base64Decode(text) {
        try {
            return decodeURIComponent(escape(atob(text)));
        } catch (error) {
            throw new Error('Invalid Base64 string');
        }
    }

    reverseText(text) {
        return text.split('').reverse().join('');
    }

    atbashCipher(text) {
        return text.replace(/[a-zA-Z]/g, (char) => {
            if (char >= 'a' && char <= 'z') {
                return String.fromCharCode(122 - char.charCodeAt(0) + 97);
            } else if (char >= 'A' && char <= 'Z') {
                return String.fromCharCode(90 - char.charCodeAt(0) + 65);
            }
            return char;
        });
    }

    // Utility Methods
    async copyToClipboard() {
        const text = this.outputText.value;
        if (!text) {
            this.showError('No text to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showCopySuccess();
        } catch (error) {
            // Fallback for older browsers
            this.outputText.select();
            document.execCommand('copy');
            this.showCopySuccess();
        }
    }

    showCopySuccess() {
        const originalText = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Copied!
        `;
        this.copyBtn.classList.add('copied');
        
        setTimeout(() => {
            this.copyBtn.innerHTML = originalText;
            this.copyBtn.classList.remove('copied');
        }, 2000);
    }

    clearAll() {
        this.inputText.value = '';
        this.outputText.value = '';
        this.inputText.focus();
        this.showSuccess('All text cleared');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${type === 'success' ? 
                        '<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' :
                        '<path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
                    }
                </svg>
                <span>${message}</span>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#48bb78' : '#f56565'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Add CSS animation
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 3000);
    }

    // Demo functionality
    loadDemo() {
        this.inputText.value = "Hello, World! This is a demo of the Text Encryptor.";
        this.methodSelect.value = "caesar";
        this.shiftInput.value = "3";
        this.updateShiftControl();
        this.showSuccess('Demo text loaded! Try encrypting it.');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const encryptor = new TextEncryptor();
    
    // Add demo functionality
    const demoBtn = document.createElement('button');
    demoBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Load Demo
    `;
    demoBtn.className = 'btn btn-demo';
    demoBtn.style.cssText = `
        background: #ed8936;
        color: white;
        font-size: 0.85rem;
        padding: 0.75rem 1.2rem;
        margin-left: auto;
    `;
    demoBtn.addEventListener('click', () => encryptor.loadDemo());
    
    // Add demo button to controls section
    const controls = document.querySelector('.controls');
    controls.appendChild(demoBtn);

    // Add keyboard shortcuts info
    const keyboardInfo = document.createElement('div');
    keyboardInfo.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.8rem;
        z-index: 1000;
        opacity: 0.7;
    `;
    keyboardInfo.innerHTML = 'Tip: Press Ctrl+Enter in text area to encrypt';
    document.body.appendChild(keyboardInfo);

    // Hide keyboard info after 5 seconds
    setTimeout(() => {
        keyboardInfo.style.animation = 'fadeOut 0.5s ease-out';
        setTimeout(() => keyboardInfo.remove(), 500);
    }, 5000);

    // Add fade out animation
    const fadeOutStyles = document.createElement('style');
    fadeOutStyles.textContent = `
        @keyframes fadeOut {
            from { opacity: 0.7; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(fadeOutStyles);
});

// Add service worker for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but app still works
        });
    });
}
