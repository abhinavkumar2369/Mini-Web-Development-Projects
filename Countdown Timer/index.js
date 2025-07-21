class TimerStopwatch {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        // Mode elements
        this.timerModeBtn = document.getElementById('timerModeBtn');
        this.stopwatchModeBtn = document.getElementById('stopwatchModeBtn');
        this.timerSection = document.getElementById('timerSection');
        this.stopwatchSection = document.getElementById('stopwatchSection');

        // Input elements
        this.hoursInput = document.getElementById('hours');
        this.minutesInput = document.getElementById('minutes');
        this.secondsInput = document.getElementById('seconds');

        // Display elements
        this.timeDisplay = document.getElementById('timeDisplay');
        this.millisecondsDisplay = document.getElementById('millisecondsDisplay');
        this.progressRing = document.getElementById('progressRing');
        this.progressPercent = document.getElementById('progressPercent');

        // Control elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');

        // Other elements
        this.statusMessage = document.getElementById('statusMessage');
        this.lapsList = document.getElementById('lapsList');
        this.clearLapsBtn = document.getElementById('clearLapsBtn');
        this.quickTimers = document.querySelectorAll('.quick-timer');
        this.timerCompleteSound = document.getElementById('timerCompleteSound');
    }

    initializeState() {
        this.mode = 'timer';
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.totalTime = 0;
        this.laps = [];
        this.lastLapTime = 0;
    }

    bindEvents() {
        // Mode switching
        this.timerModeBtn.addEventListener('click', () => this.switchMode('timer'));
        this.stopwatchModeBtn.addEventListener('click', () => this.switchMode('stopwatch'));

        // Control buttons
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.addLap());

        // Input validation
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.validateInput(input));
            input.addEventListener('change', () => this.updateTimerFromInputs());
        });

        // Quick timer buttons
        this.quickTimers.forEach(btn => {
            btn.addEventListener('click', () => {
                const seconds = parseInt(btn.dataset.time);
                this.setTimer(seconds);
            });
        });

        // Clear laps
        this.clearLapsBtn.addEventListener('click', () => this.clearLaps());

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    switchMode(mode) {
        if (this.isRunning) {
            this.showStatus('Please stop the current timer before switching modes.', 'warning');
            return;
        }

        this.mode = mode;
        this.reset();

        // Update UI
        if (mode === 'timer') {
            this.timerModeBtn.classList.add('active');
            this.stopwatchModeBtn.classList.remove('active');
            this.timerSection.classList.add('active');
            this.stopwatchSection.classList.remove('active');
            this.lapBtn.style.display = 'none';
            this.updateTimerFromInputs();
        } else {
            this.stopwatchModeBtn.classList.add('active');
            this.timerModeBtn.classList.remove('active');
            this.stopwatchSection.classList.add('active');
            this.timerSection.classList.remove('active');
            this.lapBtn.style.display = 'inline-flex';
            this.elapsedTime = 0;
            this.updateDisplay();
        }
    }

    validateInput(input) {
        const value = parseInt(input.value);
        const max = parseInt(input.max);
        const min = parseInt(input.min);

        if (value > max) input.value = max;
        if (value < min) input.value = min;
    }

    updateTimerFromInputs() {
        if (this.mode !== 'timer' || this.isRunning) return;

        const hours = parseInt(this.hoursInput.value) || 0;
        const minutes = parseInt(this.minutesInput.value) || 0;
        const seconds = parseInt(this.secondsInput.value) || 0;

        this.totalTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        this.elapsedTime = 0;
        this.updateDisplay();
    }

    setTimer(seconds) {
        if (this.isRunning) return;

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        this.hoursInput.value = hours;
        this.minutesInput.value = minutes;
        this.secondsInput.value = remainingSeconds;

        this.updateTimerFromInputs();
    }

    start() {
        if (this.mode === 'timer' && this.totalTime <= 0) {
            this.showStatus('Please set a timer duration.', 'warning');
            return;
        }

        this.isRunning = true;
        this.isPaused = false;
        this.startTime = Date.now() - this.elapsedTime;

        this.intervalId = setInterval(() => {
            this.tick();
        }, 10);

        this.updateControls();
        this.showStatus(this.mode === 'timer' ? 'Timer started!' : 'Stopwatch started!', 'success');
    }

    pause() {
        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.intervalId);
        this.updateControls();
        this.showStatus(this.mode === 'timer' ? 'Timer paused.' : 'Stopwatch paused.', 'warning');
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        this.lastLapTime = 0;
        clearInterval(this.intervalId);

        if (this.mode === 'timer') {
            this.updateTimerFromInputs();
        }

        this.updateControls();
        this.updateDisplay();
        this.timeDisplay.classList.remove('flash', 'pulse');
        this.showStatus('', '');
    }

    tick() {
        this.elapsedTime = Date.now() - this.startTime;

        if (this.mode === 'timer') {
            const remaining = this.totalTime - this.elapsedTime;
            
            if (remaining <= 0) {
                this.timerComplete();
                return;
            }
            
            if (remaining <= 10000 && !this.timeDisplay.classList.contains('flash')) {
                this.timeDisplay.classList.add('flash');
            }
        }

        this.updateDisplay();
    }

    timerComplete() {
        this.isRunning = false;
        this.elapsedTime = this.totalTime;
        clearInterval(this.intervalId);
        
        this.updateDisplay();
        this.updateControls();
        this.timeDisplay.classList.remove('flash');
        this.timeDisplay.classList.add('pulse');
        
        this.showStatus('Time\'s up! 🎉', 'success');
        this.playNotificationSound();
        
        this.showNotification();
    }

    addLap() {
        if (!this.isRunning || this.mode !== 'stopwatch') return;

        const lapTime = this.elapsedTime;
        const splitTime = lapTime - this.lastLapTime;
        
        this.laps.unshift({
            number: this.laps.length + 1,
            total: lapTime,
            split: splitTime
        });
        
        this.lastLapTime = lapTime;
        this.updateLapsList();
        this.showStatus(`Lap ${this.laps.length} recorded!`, 'success');
    }

    clearLaps() {
        this.laps = [];
        this.lastLapTime = 0;
        this.updateLapsList();
        this.showStatus('Laps cleared.', 'warning');
    }

    updateLapsList() {
        this.lapsList.innerHTML = '';
        
        this.laps.forEach(lap => {
            const lapElement = document.createElement('div');
            lapElement.className = 'lap-item';
            lapElement.innerHTML = `
                <span class="lap-number">Lap ${lap.number}</span>
                <span class="lap-time">${this.formatTime(lap.split)} (+${this.formatTime(lap.total)})</span>
            `;
            this.lapsList.appendChild(lapElement);
        });

        this.clearLapsBtn.disabled = this.laps.length === 0;
    }

    updateDisplay() {
        let displayTime;
        
        if (this.mode === 'timer') {
            displayTime = Math.max(0, this.totalTime - this.elapsedTime);
        } else {
            displayTime = this.elapsedTime;
        }

        const totalSeconds = Math.floor(displayTime / 1000);
        const milliseconds = Math.floor((displayTime % 1000) / 10);
        
        this.timeDisplay.textContent = this.formatTime(displayTime);
        this.millisecondsDisplay.textContent = milliseconds.toString().padStart(2, '0');
        
        this.updateProgressRing();
    }

    updateProgressRing() {
        const circumference = 2 * Math.PI * 65;
        let progress = 0;
        
        if (this.mode === 'timer' && this.totalTime > 0) {
            progress = (this.totalTime - Math.max(0, this.totalTime - this.elapsedTime)) / this.totalTime;
            this.progressRing.style.stroke = '#f44336';
        } else if (this.mode === 'stopwatch') {

            const seconds = Math.floor(this.elapsedTime / 1000);
            progress = (seconds % 60) / 60;
            this.progressRing.style.stroke = '#4CAF50';
        }
        
        const offset = circumference - (progress * circumference);
        this.progressRing.style.strokeDashoffset = offset;
        this.progressPercent.textContent = Math.round(progress * 100) + '%';
    }

    updateControls() {
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.lapBtn.disabled = !this.isRunning || this.mode === 'timer';
        
        if (this.isPaused) {
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        }
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        
        if (message) {
            setTimeout(() => {
                this.statusMessage.textContent = '';
                this.statusMessage.className = 'status-message';
            }, 3000);
        }
    }

    playNotificationSound() {
        try {

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not supported');
        }
    }

    showNotification() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Timer Complete!', {
                    body: 'Your countdown timer has finished.',
                    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0Q0FGNTACIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PHBvbHlsaW5lIHBvaW50cz0iMTIgNiAxMiAxMiAxNiAxNCI+PC9wb2x5bGluZT48L3N2Zz4='
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showNotification();
                    }
                });
            }
        }
    }

    handleKeyboard(event) {

        if (event.target.tagName === 'INPUT') return;
        
        switch (event.key) {
            case ' ':
                event.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                this.reset();
                break;
            case 'l':
            case 'L':
                if (this.mode === 'stopwatch' && this.isRunning) {
                    event.preventDefault();
                    this.addLap();
                }
                break;
            case 't':
            case 'T':
                event.preventDefault();
                this.switchMode('timer');
                break;
            case 's':
            case 'S':
                event.preventDefault();
                this.switchMode('stopwatch');
                break;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TimerStopwatch();
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
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
