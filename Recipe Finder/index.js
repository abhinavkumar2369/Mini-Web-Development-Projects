class RecipeFinder {
    constructor() {
        this.API_KEY = '';
        this.BASE_URL = 'https://api.spoonacular.com/recipes';
        this.currentRecipes = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPopularRecipes();
    }

    setupEventListeners() {

        document.getElementById('searchBtn').addEventListener('click', () => {
            this.searchRecipes();
        });

    
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchRecipes();
            }
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') {
                this.closeModal();
            }
        });
    }

    async loadPopularRecipes() {
        this.showLoading();
        try {
            const response = await fetch(`${this.BASE_URL}/random?number=12&apiKey=${this.API_KEY}`);
            const data = await response.json();
            
            if (data.recipes) {
                this.currentRecipes = data.recipes;
                this.displayRecipes(this.currentRecipes);
                this.showResultsTitle('Popular Recipes');
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.showError('Failed to load recipes. Please check your internet connection.');
        }
        this.hideLoading();
    }

    async searchRecipes() {
        const query = document.getElementById('searchInput').value.trim();
        
        if (!query) {
            alert('Please enter a search term');
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch(
                `${this.BASE_URL}/complexSearch?query=${encodeURIComponent(query)}&number=12&addRecipeInformation=true&apiKey=${this.API_KEY}`
            );
            const data = await response.json();
            
            if (data.results) {
                this.currentRecipes = data.results;
                this.displayRecipes(this.currentRecipes);
                this.showResultsTitle(`Search Results for "${query}"`);
            } else {
                this.showError('No recipes found. Try a different search term.');
            }
        } catch (error) {
            console.error('Error searching recipes:', error);
            this.showError('Failed to search recipes. Please try again.');
        }
        
        this.hideLoading();
    }

    displayRecipes(recipes) {
        const grid = document.getElementById('recipeGrid');
        
        if (!recipes || recipes.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; font-size: 1.2rem;">No recipes found</p>';
            return;
        }

        grid.innerHTML = recipes.map(recipe => this.createRecipeCard(recipe)).join('');
        
        grid.querySelectorAll('.recipe-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showModal(recipes[index]);
            });
        });
    }

    createRecipeCard(recipe) {
        const title = recipe.title || 'Untitled Recipe';
        const image = recipe.image || 'https://via.placeholder.com/300x200?text=No+Image';
        const summary = this.stripHtml(recipe.summary || 'No description available');
        const time = recipe.readyInMinutes || 'N/A';
        const servings = recipe.servings || 'N/A';

        return `
            <div class="recipe-card">
                <img src="${image}" alt="${title}" class="recipe-image">
                <div class="recipe-info">
                    <h3 class="recipe-title">${title}</h3>
                    <p class="recipe-summary">${summary}</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-clock"></i> ${time} min</span>
                        <span><i class="fas fa-users"></i> ${servings} servings</span>
                    </div>
                </div>
            </div>
        `;
    }

    showModal(recipe) {
        const modal = document.getElementById('modal');
        const title = recipe.title || 'Untitled Recipe';
        const image = recipe.image || 'https://via.placeholder.com/400x300?text=No+Image';
        const summary = this.stripHtml(recipe.summary || 'No description available');
        const time = recipe.readyInMinutes || 'N/A';
        const servings = recipe.servings || 'N/A';

        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalImage').src = image;
        document.getElementById('modalSummary').textContent = summary;
        document.getElementById('modalTime').innerHTML = `<i class="fas fa-clock"></i> ${time} min`;
        document.getElementById('modalServings').innerHTML = `<i class="fas fa-users"></i> ${servings} servings`;

        document.getElementById('viewRecipe').onclick = () => {
            const recipeUrl = recipe.sourceUrl || `https://spoonacular.com/recipes/${title.toLowerCase().replace(/\s+/g, '-')}-${recipe.id}`;
            window.open(recipeUrl, '_blank');
        };

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('recipeGrid').innerHTML = '';
        document.getElementById('resultsTitle').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showResultsTitle(title) {
        const titleElement = document.getElementById('resultsTitle');
        titleElement.textContent = title;
        titleElement.classList.remove('hidden');
    }

    showError(message) {
        document.getElementById('recipeGrid').innerHTML = `
            <div style="text-align: center; color: #e74c3c; font-size: 1.2rem; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
            </div>
        `;
    }

    stripHtml(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecipeFinder();
});
