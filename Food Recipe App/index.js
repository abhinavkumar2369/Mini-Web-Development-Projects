let recipes = [
    {
        id: 1,
        name: "Classic Chocolate Chip Cookies",
        cookingTime: 25,
        servings: 24,
        ingredients: ["2 cups all-purpose flour", "1 tsp baking soda", "1 tsp salt", "1 cup butter", "3/4 cup brown sugar", "1/2 cup white sugar", "2 large eggs", "2 tsp vanilla", "2 cups chocolate chips"],
        instructions: ["Preheat oven to 375°F", "Mix dry ingredients in a bowl", "Cream butter and sugars", "Add eggs and vanilla", "Combine wet and dry ingredients", "Fold in chocolate chips", "Drop spoonfuls on baking sheet", "Bake for 9-11 minutes"],
        description: "Soft and chewy chocolate chip cookies that are perfect for any occasion.",
        emoji: "🍪"
    },
    {
        id: 2,
        name: "Spaghetti Carbonara",
        cookingTime: 20,
        servings: 4,
        ingredients: ["400g spaghetti", "200g pancetta", "4 large eggs", "100g Parmesan cheese", "2 cloves garlic", "Black pepper", "Salt"],
        instructions: ["Cook spaghetti according to package instructions", "Fry pancetta until crispy", "Whisk eggs with cheese and pepper", "Drain pasta, reserve pasta water", "Mix hot pasta with pancetta", "Add egg mixture off heat", "Toss quickly to create creamy sauce", "Serve immediately"],
        description: "A classic Italian pasta dish with a rich, creamy sauce made from eggs and cheese.",
        emoji: "🍝"
    },
    {
        id: 3,
        name: "Fresh Garden Salad",
        cookingTime: 10,
        servings: 2,
        ingredients: ["Mixed greens", "Cherry tomatoes", "Cucumber", "Red onion", "Olive oil", "Balsamic vinegar", "Salt", "Pepper"],
        instructions: ["Wash and dry greens", "Chop vegetables", "Combine in large bowl", "Whisk oil and vinegar", "Toss with dressing", "Season to taste"],
        description: "A refreshing and healthy salad perfect for lunch or as a side dish.",
        emoji: "🥗"
    }
];

let filteredRecipes = [...recipes];

// Initialize the app
function init() {
    renderRecipes();
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('addRecipeForm').addEventListener('submit', handleAddRecipe);
    // Close modal when clicking outside
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
}

// Render recipes
function renderRecipes() {
    const grid = document.getElementById('recipesGrid');
    if (filteredRecipes.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <h3>No recipes found</h3>
                <p>Try adjusting your search or add a new recipe!</p>
            </div>
        `;
        return;
    }
    grid.innerHTML = filteredRecipes.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-image">${recipe.emoji}</div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.name}</h3>
                <div class="recipe-meta">
                    <span>⏱️ ${recipe.cookingTime} min</span>
                    <span>👥 ${recipe.servings} servings</span>
                </div>
                <p class="recipe-description">${recipe.description}</p>
                <div class="recipe-actions">
                    <button class="btn btn-secondary btn-small" onclick="viewRecipe(${recipe.id})">View Recipe</button>
                    <button class="btn btn-primary btn-small" onclick="deleteRecipe(${recipe.id})">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    filteredRecipes = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))
    );
    renderRecipes();
}

// Open add modal
function openAddModal() {
    document.getElementById('addModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Handle add recipe
function handleAddRecipe(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newRecipe = {
        id: Date.now(),
        name: document.getElementById('recipeName').value,
        cookingTime: parseInt(document.getElementById('cookingTime').value),
        servings: parseInt(document.getElementById('servings').value),
        ingredients: document.getElementById('ingredients').value.split('\n').filter(item => item.trim()),
        instructions: document.getElementById('instructions').value.split('\n').filter(item => item.trim()),
        description: document.getElementById('description').value,
        emoji: getRandomEmoji()
    };
    recipes.push(newRecipe);
    filteredRecipes = [...recipes];
    renderRecipes();
    closeModal('addModal');
    // Reset form
    event.target.reset();
}

// Get random emoji
function getRandomEmoji() {
    const emojis = ['🍕', '🍔', '🌮', '🍜', '🍲', '🥘', '🍱', '🍳', '🥞', '🧁', '🍰', '🥧', '🍪', '🍩'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// View recipe
function viewRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    document.getElementById('viewTitle').textContent = recipe.name;
    document.getElementById('viewContent').innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 4rem; margin-bottom: 10px;">${recipe.emoji}</div>
            <div style="color: #666; margin-bottom: 20px;">
                ⏱️ ${recipe.cookingTime} minutes | 👥 ${recipe.servings} servings
            </div>
            <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">${recipe.description}</p>
        </div>
        <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 15px; color: #333;">Ingredients:</h3>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
        <div>
            <h3 style="margin-bottom: 15px; color: #333;">Instructions:</h3>
            <ol class="instructions-list">
                ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
        </div>
    `;
    document.getElementById('viewModal').style.display = 'block';
}

// Delete recipe
function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        recipes = recipes.filter(r => r.id !== id);
        filteredRecipes = [...recipes];
        renderRecipes();
    }
}

// Initialize app when page loads
init();
