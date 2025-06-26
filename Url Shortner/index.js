class URLShortener {
    constructor() {
        this.urls = new Map();
        this.baseUrl = 'https://short.ly/';
        this.counter = 1000;
        this.init();
    }

    init() {
        const form = document.getElementById('urlForm');
        const copyBtn = document.getElementById('copyBtn');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.loadStats();
    }

    generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('resultContainer').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        this.hideLoading();
    }

    showResult(shortUrl) {
        document.getElementById('shortUrl').value = shortUrl;
        document.getElementById('resultContainer').style.display = 'block';
        this.hideLoading();
    }

    async handleSubmit(e) {
        e.preventDefault();
        const urlInput = document.getElementById('urlInput');
        const originalUrl = urlInput.value.trim();
        if (!originalUrl) {
            this.showError('Please enter a URL');
            return;
        }
        if (!this.isValidUrl(originalUrl)) {
            this.showError('Please enter a valid URL (include http:// or https://)');
            return;
        }
        this.showLoading();
        setTimeout(() => {
            const shortCode = this.generateShortCode();
            const shortUrl = this.baseUrl + shortCode;
            this.urls.set(shortCode, {
                originalUrl,
                shortUrl,
                clicks: 0,
                createdAt: new Date()
            });
            this.showResult(shortUrl);
            this.updateStats();
            this.updateUrlList();
            urlInput.value = '';
        }, 1500);
    }

    async copyToClipboard() {
        const shortUrl = document.getElementById('shortUrl').value;
        const copyBtn = document.getElementById('copyBtn');
        try {
            await navigator.clipboard.writeText(shortUrl);
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            const textArea = document.createElement('textarea');
            textArea.value = shortUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    }

    updateStats() {
        const totalUrls = this.urls.size;
        const totalClicks = Array.from(this.urls.values()).reduce((sum, url) => sum + url.clicks, 0);
        const avgClicks = totalUrls > 0 ? Math.round(totalClicks / totalUrls) : 0;
        document.getElementById('totalUrls').textContent = totalUrls;
        document.getElementById('totalClicks').textContent = totalClicks;
        document.getElementById('avgClicks').textContent = avgClicks;
        if (totalUrls > 0) {
            document.getElementById('stats').style.display = 'flex';
        }
    }

    updateUrlList() {
        const urlItems = document.getElementById('urlItems');
        const urlList = document.getElementById('urlList');
        if (this.urls.size === 0) {
            urlList.style.display = 'none';
            return;
        }
        urlList.style.display = 'block';
        urlItems.innerHTML = '';
        const recentUrls = Array.from(this.urls.values())
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);
        recentUrls.forEach(url => {
            const item = document.createElement('div');
            item.className = 'url-item';
            item.innerHTML = `
                <div class="original-url">${url.originalUrl}</div>
                <div class="shortened-url">${url.shortUrl}</div>
            `;
            urlItems.appendChild(item);
        });
    }

    loadStats() {
        this.updateStats();
        this.updateUrlList();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new URLShortener();
});
