// Rich Text Editor JavaScript

class RichTextEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.wordCount = document.getElementById('wordCount');
        this.charCount = document.getElementById('charCount');
        this.lineCount = document.getElementById('lineCount');
        this.cursorPosition = document.getElementById('cursorPosition');
        this.fileInput = document.getElementById('fileInput');
        this.isDarkMode = false;
        this.isFullscreen = false;
        
        // Check if all elements are found
        if (!this.editor) {
            console.error('Editor element not found!');
            return;
        }
        
        this.init();
    }

    init() {
        this.updateStats();
        this.setupEventListeners();
        this.loadFromLocalStorage();
    }

    setupEventListeners() {
        // Update stats on input
        this.editor.addEventListener('input', () => {
            this.updateStats();
            this.saveToLocalStorage();
        });

        // Update cursor position on keyup and click
        this.editor.addEventListener('keyup', () => this.updateCursorPosition());
        this.editor.addEventListener('click', () => this.updateCursorPosition());

        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileOpen(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auto-save every 30 seconds
        setInterval(() => this.saveToLocalStorage(), 30000);

        // Update toolbar button states
        this.editor.addEventListener('keyup', () => this.updateToolbarStates());
        this.editor.addEventListener('mouseup', () => this.updateToolbarStates());
    }

    updateStats() {
        const text = this.editor.innerText || '';
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const characters = text.length;
        const lines = text.split('\n').length;

        this.wordCount.textContent = `Words: ${words}`;
        this.charCount.textContent = `Characters: ${characters}`;
        this.lineCount.textContent = `Lines: ${lines}`;
    }

    updateCursorPosition() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(this.editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            
            const textBeforeCaret = preCaretRange.toString();
            const lines = textBeforeCaret.split('\n');
            const lineNumber = lines.length;
            const columnNumber = lines[lines.length - 1].length + 1;
            
            this.cursorPosition.textContent = `Line ${lineNumber}, Column ${columnNumber}`;
        }
    }

    updateToolbarStates() {
        const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
        commands.forEach(command => {
            const button = document.querySelector(`[onclick="formatText('${command}')"]`);
            if (button) {
                if (document.queryCommandState(command)) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            }
        });
    }

    // createRuler() function removed since ruler was removed from HTML

    saveToLocalStorage() {
        localStorage.setItem('richTextEditorContent', this.editor.innerHTML);
    }

    loadFromLocalStorage() {
        const savedContent = localStorage.getItem('richTextEditorContent');
        if (savedContent) {
            this.editor.innerHTML = savedContent;
            this.updateStats();
        }
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
                case 's':
                    e.preventDefault();
                    saveFile();
                    break;
                case 'o':
                    e.preventDefault();
                    openFile();
                    break;
                case 'n':
                    e.preventDefault();
                    newDocument();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        redoAction();
                    } else {
                        undoAction();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    redoAction();
                    break;
            }
        }

        // ESC key to exit fullscreen
        if (e.key === 'Escape' && this.isFullscreen) {
            toggleFullscreen();
        }
    }

    handleFileOpen(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                if (file.name.endsWith('.html')) {
                    this.editor.innerHTML = content;
                } else {
                    this.editor.innerHTML = content.replace(/\n/g, '<br>');
                }
                this.updateStats();
                this.saveToLocalStorage();
            };
            reader.readAsText(file);
        }
    }
}

// Initialize the editor when DOM is ready
let richTextEditor;

document.addEventListener('DOMContentLoaded', function() {
    richTextEditor = new RichTextEditor();
    console.log('Rich Text Editor initialized successfully!');
});

// Toolbar Functions
function formatText(command, value = null) {
    try {
        // Make sure the editor is initialized and focused
        if (richTextEditor && richTextEditor.editor) {
            richTextEditor.editor.focus();
            
            // Check if execCommand is supported
            if (document.execCommand) {
                const result = document.execCommand(command, false, value);
                if (!result) {
                    console.warn('Command not executed successfully:', command);
                }
            } else {
                console.warn('execCommand not supported for:', command);
            }
            
            richTextEditor.updateToolbarStates();
        } else {
            console.error('Editor not initialized or not found');
        }
    } catch (error) {
        console.error('Error executing command:', command, error);
    }
}

function changeFontFamily() {
    if (!richTextEditor) return;
    const fontFamily = document.getElementById('fontFamily').value;
    formatText('fontName', fontFamily);
}

function changeFontSize() {
    if (!richTextEditor) return;
    const fontSize = document.getElementById('fontSize').value;
    formatText('fontSize', fontSize);
}

function changeTextColor() {
    if (!richTextEditor) return;
    const color = document.getElementById('textColor').value;
    formatText('foreColor', color);
}

function changeBackgroundColor() {
    if (!richTextEditor) return;
    const color = document.getElementById('backgroundColor').value;
    formatText('backColor', color);
}

function alignText(alignment) {
    const commands = {
        'left': 'justifyLeft',
        'center': 'justifyCenter',
        'right': 'justifyRight',
        'justify': 'justifyFull'
    };
    formatText(commands[alignment]);
}

function insertList(type) {
    const command = type === 'ordered' ? 'insertOrderedList' : 'insertUnorderedList';
    formatText(command);
}

function insertLink() {
    const url = prompt('Enter the URL:');
    if (url) {
        const text = window.getSelection().toString() || prompt('Enter link text:') || url;
        const link = `<a href="${url}" target="_blank">${text}</a>`;
        formatText('insertHTML', link);
    }
}

function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
        const img = `<img src="${url}" alt="Inserted image" style="max-width: 100%; height: auto;">`;
        formatText('insertHTML', img);
    }
}

function insertTable() {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    
    if (rows && cols) {
        let table = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
        
        // Header row
        table += '<tr>';
        for (let j = 0; j < cols; j++) {
            table += '<th style="padding: 8px; background-color: #f8f9fa;">Header ' + (j + 1) + '</th>';
        }
        table += '</tr>';
        
        // Data rows
        for (let i = 1; i < rows; i++) {
            table += '<tr>';
            for (let j = 0; j < cols; j++) {
                table += '<td style="padding: 8px;">Cell ' + i + ',' + (j + 1) + '</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        
        formatText('insertHTML', table);
    }
}

function undoAction() {
    formatText('undo');
}

function redoAction() {
    formatText('redo');
}

function newDocument() {
    if (!richTextEditor) return;
    if (confirm('Are you sure you want to create a new document? Any unsaved changes will be lost.')) {
        richTextEditor.editor.innerHTML = '<p>Start typing here...</p>';
        richTextEditor.updateStats();
        richTextEditor.saveToLocalStorage();
    }
}

function openFile() {
    if (!richTextEditor) return;
    richTextEditor.fileInput.click();
}

function saveFile() {
    if (!richTextEditor) return;
    const content = richTextEditor.editor.innerHTML;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show save confirmation
    showNotification('Document saved successfully!', 'success');
}

function toggleFullscreen() {
    const container = document.querySelector('.editor-container');
    const fullscreenIcon = document.querySelector('[onclick="toggleFullscreen()"] i');
    
    if (!richTextEditor.isFullscreen) {
        container.classList.add('fullscreen');
        fullscreenIcon.className = 'fas fa-compress';
        richTextEditor.isFullscreen = true;
    } else {
        container.classList.remove('fullscreen');
        fullscreenIcon.className = 'fas fa-expand';
        richTextEditor.isFullscreen = false;
    }
}

function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.querySelector('[onclick="toggleDarkMode()"] i');
    
    if (!richTextEditor.isDarkMode) {
        body.classList.add('dark-mode');
        darkModeIcon.className = 'fas fa-sun';
        richTextEditor.isDarkMode = true;
        localStorage.setItem('darkMode', 'true');
    } else {
        body.classList.remove('dark-mode');
        darkModeIcon.className = 'fas fa-moon';
        richTextEditor.isDarkMode = false;
        localStorage.setItem('darkMode', 'false');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Load dark mode preference
document.addEventListener('DOMContentLoaded', () => {
    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'true') {
        toggleDarkMode();
    }
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Prevent image drag and drop issues
richTextEditor.editor.addEventListener('dragover', (e) => {
    e.preventDefault();
});

richTextEditor.editor.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = `<img src="${e.target.result}" alt="Dropped image" style="max-width: 100%; height: auto;">`;
                formatText('insertHTML', img);
            };
            reader.readAsDataURL(file);
        }
    }
});

// Add print functionality
function printDocument() {
    const printWindow = window.open('', '_blank');
    const content = richTextEditor.editor.innerHTML;
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Document</title>
            <style>
                body { font-family: 'Times New Roman', serif; line-height: 1.6; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f8f9fa; }
                img { max-width: 100%; height: auto; }
            </style>
        </head>
        <body>${content}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Add keyboard shortcut for print (Ctrl+P)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        printDocument();
    }
});

console.log('Rich Text Editor loaded successfully!');
