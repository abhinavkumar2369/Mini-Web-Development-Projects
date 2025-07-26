class GradientGenerator {
    constructor() {
        this.colors = ['#ff6b6b', '#4ecdc4'];
        this.direction = 'to right';
        this.useCustomAngle = false;
        this.customAngle = 90;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generatePresets();
        this.updateGradient();
    }

    initializeElements() {
        this.color1Input = document.getElementById('color1');
        this.color2Input = document.getElementById('color2');
        this.color1Text = document.getElementById('color1-text');
        this.color2Text = document.getElementById('color2-text');
        this.addColorBtn = document.getElementById('add-color');
        this.directionBtns = document.querySelectorAll('.direction-btn');
        this.angleSlider = document.getElementById('angle-slider');
        this.angleValue = document.getElementById('angle-value');
        this.preview = document.getElementById('gradient-preview');
        this.cssOutput = document.getElementById('css-output');
        this.tailwindOutput = document.getElementById('tailwind-output');
        this.copyCssBtn = document.getElementById('copy-css');
        this.copyTailwindBtn = document.getElementById('copy-tailwind');
        this.presetsContainer = document.getElementById('presets');
    }

    setupEventListeners() {
        // Color inputs
        this.color1Input.addEventListener('input', (e) => {
            this.colors[0] = e.target.value;
            this.color1Text.value = e.target.value;
            this.updateGradient();
        });

        this.color2Input.addEventListener('input', (e) => {
            this.colors[1] = e.target.value;
            this.color2Text.value = e.target.value;
            this.updateGradient();
        });

        // Text inputs
        this.color1Text.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                this.colors[0] = e.target.value;
                this.color1Input.value = e.target.value;
                this.updateGradient();
            }
        });

        this.color2Text.addEventListener('input', (e) => {
            if (this.isValidHexColor(e.target.value)) {
                this.colors[1] = e.target.value;
                this.color2Input.value = e.target.value;
                this.updateGradient();
            }
        });

        // Direction buttons
        this.directionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.directionBtns.forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
                btn.classList.add('active', 'bg-blue-500', 'text-white');
                this.direction = btn.dataset.direction;
                this.useCustomAngle = false;
                this.updateGradient();
            });
        });

        // Angle slider
        this.angleSlider.addEventListener('input', (e) => {
            this.customAngle = e.target.value;
            this.angleValue.textContent = `${e.target.value}°`;
            this.useCustomAngle = true;
            this.directionBtns.forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
            this.updateGradient();
        });

        // Copy buttons
        this.copyCssBtn.addEventListener('click', () => this.copyToClipboard(this.cssOutput.value, 'CSS'));
        this.copyTailwindBtn.addEventListener('click', () => this.copyToClipboard(this.tailwindOutput.value, 'Tailwind'));
    }

    isValidHexColor(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    updateGradient() {
        const gradient = this.generateGradient();
        this.preview.style.background = gradient.css;
        this.cssOutput.value = `background: ${gradient.css};`;
        this.tailwindOutput.value = gradient.tailwind;
    }

    generateGradient() {
        const colorStops = this.colors.join(', ');
        let direction = this.useCustomAngle ? `${this.customAngle}deg` : this.direction;
        
        const css = `linear-gradient(${direction}, ${colorStops})`;
        const tailwind = this.generateTailwindClasses();
        
        return { css, tailwind };
    }

    generateTailwindClasses() {
        const directionMap = {
            'to right': 'bg-gradient-to-r',
            'to left': 'bg-gradient-to-l',
            'to bottom': 'bg-gradient-to-b',
            'to top': 'bg-gradient-to-t',
            'to bottom right': 'bg-gradient-to-br',
            'to top left': 'bg-gradient-to-tl',
            'to bottom left': 'bg-gradient-to-bl',
            'to top right': 'bg-gradient-to-tr'
        };

        let gradientClass = this.useCustomAngle ? 'bg-gradient-to-r' : directionMap[this.direction] || 'bg-gradient-to-r';
        
        const fromColor = this.hexToTailwindColor(this.colors[0]);
        const toColor = this.hexToTailwindColor(this.colors[1]);
        
        return `${gradientClass} from-${fromColor} to-${toColor}`;
    }

    hexToTailwindColor(hex) {
        const colorMap = {
            '#ff6b6b': 'red-400',
            '#4ecdc4': 'teal-400',
            '#45b7d1': 'blue-400',
            '#96ceb4': 'green-300',
            '#feca57': 'yellow-400',
            '#ff9ff3': 'pink-300',
            '#54a0ff': 'blue-500',
            '#5f27cd': 'purple-600'
        };
        
        return colorMap[hex.toLowerCase()] || 'gray-500';
    }

    generatePresets() {
        const presets = [
            { name: 'Sunset', colors: ['#ff6b6b', '#feca57'], direction: 'to right' },
            { name: 'Ocean', colors: ['#45b7d1', '#96ceb4'], direction: 'to right' },
            { name: 'Purple', colors: ['#5f27cd', '#ff9ff3'], direction: 'to bottom' },
            { name: 'Fire', colors: ['#ff6348', '#ffad42'], direction: 'to top' },
            { name: 'Cool', colors: ['#74b9ff', '#0984e3'], direction: 'to right' },
            { name: 'Mint', colors: ['#00b894', '#55efc4'], direction: 'to bottom' },
            { name: 'Rose', colors: ['#fd79a8', '#fdcb6e'], direction: 'to right' },
            { name: 'Dark', colors: ['#2d3436', '#636e72'], direction: 'to bottom' }
        ];

        presets.forEach(preset => {
            const presetDiv = document.createElement('div');
            presetDiv.className = 'h-16 rounded-lg cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-end p-2';
            presetDiv.style.background = `linear-gradient(${preset.direction}, ${preset.colors.join(', ')})`;
            presetDiv.innerHTML = `<span class="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">${preset.name}</span>`;
            
            presetDiv.addEventListener('click', () => {
                this.colors = [...preset.colors];
                this.direction = preset.direction;
                this.useCustomAngle = false;
                
                // Update UI
                this.color1Input.value = preset.colors[0];
                this.color2Input.value = preset.colors[1];
                this.color1Text.value = preset.colors[0];
                this.color2Text.value = preset.colors[1];
                
                // Update direction buttons
                this.directionBtns.forEach(btn => {
                    btn.classList.remove('active', 'bg-blue-500', 'text-white');
                    if (btn.dataset.direction === preset.direction) {
                        btn.classList.add('active', 'bg-blue-500', 'text-white');
                    }
                });
                
                this.updateGradient();
            });
            
            this.presetsContainer.appendChild(presetDiv);
        });
    }

    async copyToClipboard(text, type) {
        try {
            await navigator.clipboard.writeText(text);
            // Show feedback
            const button = type === 'CSS' ? this.copyCssBtn : this.copyTailwindBtn;
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('bg-green-500');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('bg-green-500');
                if (type === 'CSS') {
                    button.classList.add('bg-blue-500');
                } else {
                    button.classList.add('bg-green-500');
                }
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GradientGenerator();
});
