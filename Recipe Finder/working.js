// Recipe Finder App using TheMealDB API (Free, no API key required)
class RecipeFinder {
    constructor() {
        this.BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
        this.currentRecipes = [];
        
        console.log('RecipeFinder initialized with TheMealDB API');
        this.init();
    }

    init() {
        console.log('Setting up event listeners...');
        this.setupEventListeners();
        console.log('Loading popular recipes...');
        this.loadPopularRecipes();
    }

    setupEventListeners() {
        // Search button click
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const closeModal = document.getElementById('closeModal');
        const modal = document.getElementById('modal');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                console.log('Search button clicked');
                this.searchRecipes();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed');
                    this.searchRecipes();
                }
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'modal') {
                    this.closeModal();
                }
            });
        }
    }

    async loadPopularRecipes() {
        console.log('Loading popular recipes...');
        this.showLoading();
        try {
            const categories = ['Chicken', 'Beef', 'Pasta', 'Dessert'];
            const allRecipes = [];
            
            for (const category of categories) {
                try {
                    const response = await fetch(`${this.BASE_URL}/filter.php?c=${category}`);
                    const data = await response.json();
                    if (data.meals) {
                        allRecipes.push(...data.meals.slice(0, 3));
                    }
                } catch (error) {
                    console.error(`Error loading ${category} recipes:`, error);
                }
            }
            
            console.log('Total recipes loaded:', allRecipes.length);
            
            if (allRecipes.length > 0) {
                this.currentRecipes = allRecipes;
                this.displayRecipes(this.currentRecipes);
                this.showResultsTitle('Popular Recipes');
            } else {
                this.showError('No recipes found. Please try again.');
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            this.showError('Failed to load recipes. Please check your internet connection.');
        }
        this.hideLoading();
    }

    async searchRecipes() {
        const query = document.getElementById('searchInput').value.trim();
        console.log('Search query:', query);
        
        if (!query) {
            alert('Please enter a search term');
            return;
        }

        this.showLoading();
        
        try {
            const response = await fetch(`${this.BASE_URL}/search.php?s=${encodeURIComponent(query)}`);
            const data = await response.json();
            console.log('Search results:', data);
            
            if (data.meals && data.meals.length > 0) {
                this.currentRecipes = data.meals;
                this.displayRecipes(this.currentRecipes);
                this.showResultsTitle(`Search Results for "${query}"`);
                console.log('Search completed:', data.meals.length, 'recipes found');
            } else {
                console.log('No search results found');
                this.showError('No recipes found. Try a different search term.');
            }
        } catch (error) {
            console.error('Error searching recipes:', error);
            this.showError('Failed to search recipes. Please try again.');
        }
        
        this.hideLoading();
    }

    displayRecipes(recipes) {
        console.log('Displaying recipes:', recipes.length);
        const grid = document.getElementById('recipeGrid');
        
        if (!grid) {
            console.error('Recipe grid element not found!');
            return;
        }
        
        if (!recipes || recipes.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: white; font-size: 1.2rem;">No recipes found</p>';
            return;
        }

        grid.innerHTML = recipes.map((recipe, index) => {
            return this.createRecipeCard(recipe);
        }).join('');
        
        grid.querySelectorAll('.recipe-card').forEach((card, index) => {
            card.addEventListener('click', async () => {
                console.log('Recipe card clicked:', recipes[index].strMeal);
                await this.showModal(recipes[index]);
            });
        });
    }

    createRecipeCard(recipe) {
        const title = recipe.strMeal || 'Untitled Recipe';
        const image = recipe.strMealThumb || 'https://via.placeholder.com/300x200?text=No+Image';
        const category = recipe.strCategory || 'Unknown';
        const area = recipe.strArea || 'International';

        return `
            <div class="recipe-card">
                <img src="${image}" alt="${title}" class="recipe-image">
                <div class="recipe-info">
                    <h3 class="recipe-title">${title}</h3>
                    <p class="recipe-summary">${category} • ${area} Cuisine</p>
                    <div class="recipe-meta">
                        <span><i class="fas fa-utensils"></i> ${category}</span>
                        <span><i class="fas fa-globe"></i> ${area}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async showModal(recipe) {
        console.log('Showing modal for recipe:', recipe.strMeal);
        
        try {
            const response = await fetch(`${this.BASE_URL}/lookup.php?i=${recipe.idMeal}`);
            const data = await response.json();
            const detailedRecipe = data.meals[0];
            
            const modal = document.getElementById('modal');
            const title = detailedRecipe.strMeal || 'Untitled Recipe';
            const image = detailedRecipe.strMealThumb || 'https://via.placeholder.com/400x300?text=No+Image';
            const instructions = detailedRecipe.strInstructions || 'No instructions available';
            const category = detailedRecipe.strCategory || 'Unknown';
            const area = detailedRecipe.strArea || 'International';

            // Populate modal content
            document.getElementById('modalTitle').textContent = title;
            document.getElementById('modalImage').src = image;
            document.getElementById('modalSummary').textContent = instructions.substring(0, 300) + '...';
            document.getElementById('modalTime').innerHTML = `<i class="fas fa-utensils"></i> ${category}`;
            document.getElementById('modalServings').innerHTML = `<i class="fas fa-globe"></i> ${area}`;

            // Set up view recipe button
            document.getElementById('viewRecipe').onclick = () => {
                if (detailedRecipe.strSource) {
                    window.open(detailedRecipe.strSource, '_blank');
                } else if (detailedRecipe.strYoutube) {
                    window.open(detailedRecipe.strYoutube, '_blank');
                } else {
                    alert('Full recipe instructions:\n\n' + instructions);
                }
            };

            // Show modal
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        } catch (error) {
            console.error('Error loading recipe details:', error);
            alert('Error loading recipe details');
        }
    }

    closeModal() {
        document.getElementById('modal').classList.add('hidden');
        document.body.style.overflow = '';
    }

    showLoading() {
        console.log('Showing loading...');
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('recipeGrid').innerHTML = '';
        document.getElementById('resultsTitle').classList.add('hidden');
    }

    hideLoading() {
        console.log('Hiding loading...');
        document.getElementById('loading').classList.add('hidden');
    }

    showResultsTitle(title) {
        console.log('Showing results title:', title);
        const titleElement = document.getElementById('resultsTitle');
        titleElement.textContent = title;
        titleElement.classList.remove('hidden');
    }

    showError(message) {
        console.error('Showing error:', message);
        document.getElementById('recipeGrid').innerHTML = `
            <div style="text-align: center; color: white; font-size: 1.2rem; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the app when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Recipe Finder...');
    new RecipeFinder();
});
