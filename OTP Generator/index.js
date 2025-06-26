class OTPGenerator {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.timer = null;
        this.currentOTP = null;
        this.timerDuration = 30;
    }

    initializeElements() {
        this.otpLengthSelect = document.getElementById('otpLength');
        this.otpTypeSelect = document.getElementById('otpType');
        this.otpValue = document.getElementById('otpValue');
        this.copyBtn = document.getElementById('copyBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.timerContainer = document.getElementById('timerContainer');
        this.timerValue = document.getElementById('timerValue');
        this.progressFill = document.getElementById('progressFill');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateOTP());
        this.refreshBtn.addEventListener('click', () => this.refreshOTP());
        this.copyBtn.addEventListener('click', () => this.copyOTP());
        
        this.otpLengthSelect.addEventListener('change', () => this.generateOTP());
        this.otpTypeSelect.addEventListener('change', () => this.generateOTP());
        
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'g') {
                e.preventDefault();
                this.generateOTP();
            } else if (e.ctrlKey && e.key === 'c' && this.currentOTP) {
                e.preventDefault();
                this.copyOTP();
            } else if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.refreshOTP();
            }
        });
    }

    generateOTP() {
        const length = parseInt(this.otpLengthSelect.value);
        const type = this.otpTypeSelect.value;
        
        let characters = '';
        
        switch (type) {
            case 'numeric':
                characters = '0123456789';
                break;
            case 'alphanumeric':
                characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                break;
            case 'alphabetic':
                characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                break;
        }

        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        this.currentOTP = otp;
        this.displayOTP(otp);
        this.startTimer();
        
        this.otpValue.classList.add('highlight');
        setTimeout(() => {
            this.otpValue.classList.remove('highlight');
        }, 300);

        this.showNotification('OTP generated successfully!', 'success');
    }

    displayOTP(otp) {
        const formattedOTP = otp.split('').join(' ');
        this.otpValue.textContent = formattedOTP;
    }

    refreshOTP() {
        const refreshIcon = this.refreshBtn.querySelector('i');
        refreshIcon.classList.add('fa-spin');
        
        setTimeout(() => {
            this.generateOTP();
            refreshIcon.classList.remove('fa-spin');
        }, 500);
    }

    copyOTP() {
        if (!this.currentOTP) {
            this.showNotification('No OTP to copy!', 'error');
            return;
        }

        const textarea = document.createElement('textarea');
        textarea.value = this.currentOTP;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        const copyIcon = this.copyBtn.querySelector('i');
        const originalClass = copyIcon.className;
        copyIcon.className = 'fas fa-check';
        
        setTimeout(() => {
            copyIcon.className = originalClass;
        }, 1000);

        this.showNotification('OTP copied to clipboard!', 'success');
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        let timeLeft = this.timerDuration;
        this.timerContainer.style.display = 'block';
        this.updateTimer(timeLeft);

        this.timer = setInterval(() => {
            timeLeft--;
            this.updateTimer(timeLeft);

            if (timeLeft <= 0) {
                clearInterval(this.timer);
                this.onTimerExpired();
            }
        }, 1000);
    }

    updateTimer(timeLeft) {
        this.timerValue.textContent = timeLeft;
        const progress = ((this.timerDuration - timeLeft) / this.timerDuration) * 100;
        this.progressFill.style.width = `${progress}%`;

        if (timeLeft <= 10) {
            this.timerContainer.style.background = 'linear-gradient(135deg, #f8d7da, #f5c6cb)';
            this.timerValue.style.color = '#721c24';
        } else {
            this.timerContainer.style.background = 'linear-gradient(135deg, #fff3cd, #ffeaa7)';
            this.timerValue.style.color = '#856404';
        }
    }

    onTimerExpired() {
        this.timerContainer.style.display = 'none';
        this.otpValue.textContent = '- - - - - -';
        this.currentOTP = null;
        this.showNotification('OTP has expired! Generate a new one.', 'error');
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.add('show');

        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    window.otpGenerator = new OTPGenerator();
    console.log('OTP Generator initialized successfully!');
});


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
