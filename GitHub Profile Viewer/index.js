class GitHubProfileViewer {
    constructor() {
        this.apiBase = 'https://api.github.com';
        this.currentUser = null;
        this.initializeEventListeners();
        this.languageColors = this.getLanguageColors();
    }

    initializeEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const usernameInput = document.getElementById('username');
        const shareBtn = document.getElementById('shareBtn');

        searchBtn.addEventListener('click', () => this.searchUser());
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchUser();
        });
        
        shareBtn.addEventListener('click', () => this.shareProfile());

        usernameInput.focus();
    }

    async searchUser() {
        const username = document.getElementById('username').value.trim();
        
        if (!username) {
            this.showError('Please enter a GitHub username');
            return;
        }

        this.showLoading();
        
        try {
            const userResponse = await fetch(`${this.apiBase}/users/${username}`);
            
            if (!userResponse.ok) {
                throw new Error('User not found');
            }
            
            const userData = await userResponse.json();
            this.currentUser = userData;
            
            const reposResponse = await fetch(`${this.apiBase}/users/${username}/repos?sort=stars&per_page=6`);
            const reposData = await reposResponse.json();
            
            this.displayProfile(userData, reposData);
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            this.showError();
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('profileContainer').style.display = 'none';
    }

    showError(message = 'User not found') {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('profileContainer').style.display = 'none';
        
        if (message !== 'User not found') {
            document.querySelector('#errorMessage p').textContent = message;
        }
    }

    displayProfile(userData, reposData) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'none';
        document.getElementById('profileContainer').style.display = 'block';

        document.getElementById('avatar').src = userData.avatar_url;
        document.getElementById('avatar').alt = `${userData.login} avatar`;
        document.getElementById('name').textContent = userData.name || userData.login;
        document.getElementById('username-display').textContent = `@${userData.login}`;
        document.getElementById('bio').textContent = userData.bio || 'No bio available';


        this.setElementText('location', userData.location, 'fas fa-map-marker-alt');
        this.setElementText('company', userData.company, 'fas fa-building');
        this.setElementText('blog', userData.blog, 'fas fa-link', userData.blog);
        this.setElementText('twitter', userData.twitter_username, 'fab fa-twitter', `https://twitter.com/${userData.twitter_username}`);


        const joinDate = new Date(userData.created_at);
        document.getElementById('joinDate').innerHTML = `
            <i class="fas fa-calendar-alt"></i> 
            Joined ${joinDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            })}
        `;


        document.getElementById('publicRepos').textContent = this.formatNumber(userData.public_repos);
        document.getElementById('followers').textContent = this.formatNumber(userData.followers);
        document.getElementById('following').textContent = this.formatNumber(userData.following);
        document.getElementById('publicGists').textContent = this.formatNumber(userData.public_gists);


        document.getElementById('profileLink').href = userData.html_url;
        document.getElementById('viewAllRepos').href = `${userData.html_url}?tab=repositories`;


        this.displayRepositories(reposData);
    }

    setElementText(elementId, value, iconClass, link = null) {
        const element = document.getElementById(elementId);
        if (value) {
            if (link) {
                element.innerHTML = `<i class="${iconClass}"></i> <a href="${link}" target="_blank" rel="noopener">${value}</a>`;
                element.style.display = 'flex';
            } else {
                element.innerHTML = `<i class="${iconClass}"></i> ${value}`;
                element.style.display = 'flex';
            }
        } else {
            element.style.display = 'none';
        }
    }

    displayRepositories(repos) {
        const container = document.getElementById('reposContainer');
        container.innerHTML = '';

        if (repos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">No public repositories found.</p>';
            return;
        }

        repos.forEach(repo => {
            const repoCard = this.createRepositoryCard(repo);
            container.appendChild(repoCard);
        });
    }

    createRepositoryCard(repo) {
        const card = document.createElement('div');
        card.className = 'repo-card';
        card.addEventListener('click', () => window.open(repo.html_url, '_blank'));

        const languageColor = this.languageColors[repo.language] || '#333';
        const updatedDate = new Date(repo.updated_at);
        const timeAgo = this.getTimeAgo(updatedDate);

        card.innerHTML = `
            <h4>${repo.name}</h4>
            <p>${repo.description || 'No description available'}</p>
            <div class="repo-meta">
                ${repo.language ? `
                    <span>
                        <span class="language-color" style="background-color: ${languageColor}"></span>
                        ${repo.language}
                    </span>
                ` : ''}
                ${repo.stargazers_count > 0 ? `
                    <span>
                        <i class="fas fa-star"></i>
                        ${this.formatNumber(repo.stargazers_count)}
                    </span>
                ` : ''}
                ${repo.forks_count > 0 ? `
                    <span>
                        <i class="fas fa-code-branch"></i>
                        ${this.formatNumber(repo.forks_count)}
                    </span>
                ` : ''}
                <span>
                    <i class="fas fa-clock"></i>
                    ${timeAgo}
                </span>
            </div>
        `;

        return card;
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day ago';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    shareProfile() {
        if (!this.currentUser) return;

        const profileUrl = this.currentUser.html_url;
        
        if (navigator.share) {
            navigator.share({
                title: `${this.currentUser.name || this.currentUser.login}'s GitHub Profile`,
                text: `Check out ${this.currentUser.login}'s GitHub profile!`,
                url: profileUrl
            }).catch(console.error);
        } else {

            navigator.clipboard.writeText(profileUrl).then(() => {
                this.showToast('Profile URL copied to clipboard!');
            }).catch(() => {

                const textArea = document.createElement('textarea');
                textArea.value = profileUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Profile URL copied to clipboard!');
            });
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    getLanguageColors() {
        return {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'C#': '#239120',
            'PHP': '#4F5D95',
            'Ruby': '#701516',
            'Go': '#00ADD8',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Rust': '#dea584',
            'Scala': '#c22d40',
            'Dart': '#00B4AB',
            'HTML': '#e34c26',
            'CSS': '#1572B6',
            'Vue': '#2c3e50',
            'React': '#61DAFB',
            'Angular': '#DD0031',
            'Shell': '#89e051',
            'PowerShell': '#012456',
            'Dockerfile': '#384d54',
            'Makefile': '#427819',
            'Objective-C': '#438eff',
            'Perl': '#0298c3',
            'R': '#198CE7',
            'MATLAB': '#e16737',
            'Lua': '#000080',
            'Haskell': '#5e5086',
            'Clojure': '#db5855',
            'Erlang': '#B83998',
            'Elixir': '#6e4a7e',
            'Nim': '#37775b',
            'Crystal': '#000100',
            'Zig': '#ec915c'
        };
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new GitHubProfileViewer();
});


window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
});
