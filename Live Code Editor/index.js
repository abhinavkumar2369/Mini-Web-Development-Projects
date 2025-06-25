class LiveCodeEditor {
    constructor() {
        this.currentLang = 'html';
        this.editors = {};
        this.isPreviewLoading = false;
        this.updateTimer = null;
        this.isMobileView = false;
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.setupEventListeners();
        this.initializeLineNumbers();
        this.updatePreview();
        this.setupMobileView();
        
        console.log('🚀 Live Code Editor initialized successfully!');
    }
    
    cacheElements() {
        this.tabs = document.querySelectorAll('.tab');
        this.editorElements = document.querySelectorAll('.editor');
        this.lineNumbers = document.querySelectorAll('.line-numbers');
        
        this.preview = document.getElementById('preview');
        this.refreshBtn = document.getElementById('refresh-btn');
        this.fullscreenBtn = document.getElementById('fullscreen-btn');
        
        this.downloadCurrentBtn = document.getElementById('download-current');
        this.downloadAllBtn = document.getElementById('download-all');
        
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.container = document.querySelector('.container');
        
        this.editors = {
            html: document.getElementById('html-editor'),
            css: document.getElementById('css-editor'),
            js: document.getElementById('js-editor')
        };
    }
    
    setupEventListeners() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });
        
        Object.values(this.editors).forEach(editor => {
            editor.addEventListener('input', () => this.schedulePreviewUpdate());
            editor.addEventListener('scroll', (e) => this.syncLineNumbers(e.target));
            editor.addEventListener('keydown', (e) => this.handleKeyDown(e));
        });
        
        this.refreshBtn?.addEventListener('click', () => this.forceRefreshPreview());
        this.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
        
        this.downloadCurrentBtn?.addEventListener('click', () => this.downloadCurrentFile());
        this.downloadAllBtn?.addEventListener('click', () => this.downloadAllFiles());
        
        this.mobileToggle?.addEventListener('click', () => this.toggleMobileView());
        
        window.addEventListener('resize', () => this.handleResize());
        
        document.addEventListener('keydown', (e) => this.handleGlobalKeyDown(e));
    }
    
    switchTab(event) {
        const clickedTab = event.target.closest('.tab');
        const lang = clickedTab.dataset.lang;
        
        if (lang === this.currentLang) return;
        
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.style.transform = '';
        });
        clickedTab.classList.add('active');
        
        this.editorElements.forEach(editor => {
            editor.classList.remove('active');
        });
        
        const targetEditor = this.editors[lang];
        targetEditor.classList.add('active');
        
        this.currentLang = lang;
        
        setTimeout(() => {
            targetEditor.focus();
            this.updateLineNumbers(targetEditor);
        }, 100);
        
        clickedTab.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickedTab.style.transform = '';
        }, 150);
    }
    
    schedulePreviewUpdate() {
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => {
            this.updatePreview();
        }, 300);
    }
    
    updatePreview() {
        if (this.isPreviewLoading) return;
        
        this.isPreviewLoading = true;
        this.preview.classList.add('loading');
        
        try {
            const html = this.editors.html.value;
            const css = this.editors.css.value;
            const js = this.editors.js.value;
            
            const previewDocument = this.buildPreviewDocument(html, css, js);
            
            this.preview.srcdoc = previewDocument;
            
            this.preview.onload = () => {
                this.isPreviewLoading = false;
                this.preview.classList.remove('loading');
                this.showSuccessMessage('Preview updated successfully!');
            };
            
        } catch (error) {
            console.error('Preview update error:', error);
            this.showErrorMessage('Failed to update preview: ' + error.message);
            this.isPreviewLoading = false;
            this.preview.classList.remove('loading');
        }
    }
    
    buildPreviewDocument(html, css, js) {
        const cleanedHTML = html.replace(
            /<(!DOCTYPE[^>]*>|html[^>]*>|\/html>|head[^>]*>|\/head>|body[^>]*>|\/body>)/gi, 
            ''
        ).trim();
        
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Live Preview</title>
                <style>
                    * { box-sizing: border-box; }
                    ${css}
                    .error-boundary {
                        color: #e53e3e;
                        background: #fed7d7;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px;
                        border-left: 4px solid #e53e3e;
                        font-family: 'Consolas', monospace;
                    }
                </style>
            </head>
            <body>
                ${cleanedHTML}
                <script>
                    window.addEventListener('error', function(e) {
                        console.error('JavaScript Error in Preview:', e.error);
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-boundary';
                        errorDiv.innerHTML = \`
                            <strong>JavaScript Error:</strong><br>
                            \${e.error.message}<br>
                            <small>Line: \${e.lineno}, Column: \${e.colno}</small>
                        \`;
                        document.body.appendChild(errorDiv);
                    });
                    
                    try {
                        ${js}
                    } catch (error) {
                        console.error('JavaScript Compilation Error:', error);
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'error-boundary';
                        errorDiv.innerHTML = \`
                            <strong>JavaScript Compilation Error:</strong><br>
                            \${error.message}
                        \`;
                        document.body.appendChild(errorDiv);
                    }
                </script>
            </body>
            </html>
        `;
    }
    
    forceRefreshPreview() {
        this.refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.refreshBtn.style.transform = '';
        }, 500);
        
        this.updatePreview();
        this.showSuccessMessage('Preview refreshed!');
    }
    
    toggleFullscreen() {
        const previewPanel = document.querySelector('.preview-panel');
        
        if (!document.fullscreenElement) {
            previewPanel.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showErrorMessage('Fullscreen not supported');
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    initializeLineNumbers() {
        Object.values(this.editors).forEach(editor => {
            this.updateLineNumbers(editor);
        });
    }
    
    updateLineNumbers(editor) {
        const lineNumbersId = editor.id.replace('-editor', '-line-numbers');
        const lineNumbersElement = document.getElementById(lineNumbersId);
        
        if (!lineNumbersElement) return;
        
        const lines = editor.value.split('\n');
        const lineNumbers = lines.map((_, index) => index + 1).join('\n');
        lineNumbersElement.textContent = lineNumbers;
        
        this.syncLineNumbers(editor);
    }
    
    syncLineNumbers(editor) {
        const lineNumbersId = editor.id.replace('-editor', '-line-numbers');
        const lineNumbersElement = document.getElementById(lineNumbersId);
        
        if (!lineNumbersElement) return;
        
        lineNumbersElement.scrollTop = editor.scrollTop;
    }
    
    handleKeyDown(event) {
        const editor = event.target;
        
        if (event.key === 'Tab') {
            event.preventDefault();
            this.insertTab(editor);
        }
        
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.showSuccessMessage('Code saved locally!');
        }
        
        if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'y')) {
            setTimeout(() => this.updateLineNumbers(editor), 0);
        }
        
        if (event.key === 'Enter') {
            setTimeout(() => this.updateLineNumbers(editor), 0);
        }
        
        this.handleAutoComplete(event, editor);
    }
    
    insertTab(editor) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const spaces = '    ';
        
        editor.value = editor.value.substring(0, start) + spaces + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + spaces.length;
        
        this.updateLineNumbers(editor);
        this.schedulePreviewUpdate();
    }
    
    handleAutoComplete(event, editor) {
        const pairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'",
            '<': '>'
        };
        
        const char = event.key;
        if (pairs[char]) {
            event.preventDefault();
            
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const selectedText = editor.value.substring(start, end);
            
            const newText = char + selectedText + pairs[char];
            editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
            
            if (selectedText) {
                editor.selectionStart = start + 1;
                editor.selectionEnd = start + 1 + selectedText.length;
            } else {
                editor.selectionStart = editor.selectionEnd = start + 1;
            }
            
            this.updateLineNumbers(editor);
            this.schedulePreviewUpdate();
        }
    }
    
    handleGlobalKeyDown(event) {
        if ((event.ctrlKey || event.metaKey) && ['1', '2', '3'].includes(event.key)) {
            event.preventDefault();
            const tabIndex = parseInt(event.key) - 1;
            const tab = this.tabs[tabIndex];
            if (tab) tab.click();
        }
        
        if (event.key === 'Escape' && this.isMobileView) {
            this.toggleMobileView();
        }
    }
    
    setupMobileView() {
        this.handleResize();
    }
    
    toggleMobileView() {
        this.isMobileView = !this.isMobileView;
        this.container.classList.toggle('show-editor', this.isMobileView);
        this.mobileToggle.classList.toggle('active', this.isMobileView);
        
        const hamburgerIcon = this.mobileToggle.querySelector('.hamburger-icon');
        const closeIcon = this.mobileToggle.querySelector('.close-icon');
        
        if (this.isMobileView) {
            hamburgerIcon.style.display = 'none';
            closeIcon.style.display = 'block';
        } else {
            hamburgerIcon.style.display = 'block';
            closeIcon.style.display = 'none';
        }
    }
    
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile && this.isMobileView) {
            this.isMobileView = false;
            this.container.classList.remove('show-editor');
            this.mobileToggle.classList.remove('active');
        }
        
        Object.values(this.editors).forEach(editor => {
            this.updateLineNumbers(editor);
        });
    }
    
    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }
    
    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        const colors = {
            success: { bg: 'rgba(56, 161, 105, 0.9)', border: '#38a169' },
            error: { bg: 'rgba(229, 62, 62, 0.9)', border: '#e53e3e' },
            info: { bg: 'rgba(66, 153, 225, 0.9)', border: '#4299e1' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 1000;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            border-left: 4px solid ${color.border};
            max-width: 300px;
            word-wrap: break-word;
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    }
    
    downloadCurrentFile() {
        const lang = this.currentLang;
        const content = this.editors[lang].value;
        const fileName = this.getFileName(lang);
        
        this.downloadFile(fileName, content);
        this.showSuccessMessage(`${lang.toUpperCase()} file downloaded successfully!`);
    }
    
    downloadAllFiles() {
        const html = this.editors.html.value;
        const css = this.editors.css.value;
        const js = this.editors.js.value;
        
        const completeHTML = this.buildCompleteHTML(html, css, js);
        
        this.downloadFile('index.html', completeHTML);
        this.downloadFile('style.css', css);
        this.downloadFile('script.js', js);
        
        this.showSuccessMessage('All files downloaded successfully!');
    }
    
    getFileName(lang) {
        const fileNames = {
            html: 'index.html',
            css: 'style.css',
            js: 'script.js'
        };
        return fileNames[lang] || 'file.txt';
    }
    
    buildCompleteHTML(html, css, js) {
        const cleanedHTML = html.replace(
            /<(!DOCTYPE[^>]*>|html[^>]*>|\/html>|head[^>]*>|\/head>|body[^>]*>|\/body>)/gi, 
            ''
        ).trim();
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Code Editor Project</title>
    <style>
${css}
    </style>
</head>
<body>
${cleanedHTML}
    <script>
${js}
    </script>
</body>
</html>`;
    }
    
    downloadFile(fileName, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
    
    exportCode() {
        const code = {
            html: this.editors.html.value,
            css: this.editors.css.value,
            js: this.editors.js.value,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(code, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'live-code-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('Code exported successfully!');
    }
    
    importCode(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const code = JSON.parse(e.target.result);
                if (code.html) this.editors.html.value = code.html;
                if (code.css) this.editors.css.value = code.css;
                if (code.js) this.editors.js.value = code.js;
                Object.values(this.editors).forEach(editor => {
                    this.updateLineNumbers(editor);
                });
                this.updatePreview();
                this.showSuccessMessage('Code imported successfully!');
            } catch (error) {
                this.showErrorMessage('Failed to import code: Invalid file format');
            }
        };
        reader.readAsText(file);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.liveCodeEditor = new LiveCodeEditor();
});

window.addEventListener('beforeunload', (e) => {
    const hasContent = Object.values(window.liveCodeEditor?.editors || {}).some(
        editor => editor.value.trim().length > 0
    );
    if (hasContent) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/service-worker.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(registrationError => console.log('SW registration failed'));
    });
}
