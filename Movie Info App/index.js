class SimpleMovieApp {
    constructor() {
        this.apiKey = '';
        this.omdbURL = 'https://www.omdbapi.com/';
        
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.moviesContainer = document.getElementById('moviesContainer');
        this.loading = document.getElementById('loading');
        this.modal = document.getElementById('movieModal');
        this.movieDetails = document.getElementById('movieDetails');
        
        this.setupEventListeners();
        this.loadPopularMovies();
    }

    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchMovies());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchMovies();
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    async loadPopularMovies() {
        const popularMovies = ['Inception', 'The Dark Knight', 'Avengers', 'Titanic', 'Avatar'];
        this.showLoading();
        
        try {
            const moviePromises = popularMovies.map(movie => this.fetchMovie(movie));
            const movies = await Promise.all(moviePromises);
            this.displayMovies(movies.filter(movie => movie && movie.Response === 'True'));
        } catch (error) {
            console.error('Error loading popular movies:', error);
        } finally {
            this.hideLoading();
        }
    }

    async searchMovies() {
        const searchTerm = this.searchInput.value.trim();
        if (!searchTerm) return;

        this.showLoading();
        
        try {
            const searchResults = await this.searchMoviesByTitle(searchTerm);
            if (searchResults && searchResults.Search) {
                const detailedMovies = await Promise.all(
                    searchResults.Search.slice(0, 12).map(movie => this.fetchMovie(movie.Title, movie.Year))
                );
                this.displayMovies(detailedMovies.filter(movie => movie && movie.Response === 'True'));
            } else {
                this.displayNoResults();
            }
        } catch (error) {
            console.error('Search error:', error);
            this.displayError();
        } finally {
            this.hideLoading();
        }
    }

    async fetchMovie(title, year = '') {
        try {
            const yearParam = year ? `&y=${year}` : '';
            const response = await fetch(`${this.omdbURL}?t=${encodeURIComponent(title)}&apikey=${this.apiKey}${yearParam}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching movie:', error);
            return null;
        }
    }

    async searchMoviesByTitle(title) {
        try {
            const response = await fetch(`${this.omdbURL}?s=${encodeURIComponent(title)}&apikey=${this.apiKey}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching movies:', error);
            return null;
        }
    }

    displayMovies(movies) {
        if (!movies || movies.length === 0) {
            this.displayNoResults();
            return;
        }

        this.moviesContainer.innerHTML = movies.map(movie => this.createMovieCard(movie)).join('');
    }

    createMovieCard(movie) {
        const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/667eea/white?text=No+Image';
        const year = movie.Year || 'N/A';
        const rating = movie.imdbRating !== 'N/A' ? `⭐ ${movie.imdbRating}` : 'No rating';
        const plot = movie.Plot && movie.Plot !== 'N/A' ? movie.Plot : 'No description available.';

        return `
            <div class="movie-card" onclick="movieApp.showMovieDetails('${movie.imdbID}')">
                <img src="${poster}" alt="${movie.Title}" class="movie-poster" loading="lazy">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.Title}</h3>
                    <p class="movie-year">${year}</p>
                    <p class="movie-rating">${rating}</p>
                    <p class="movie-overview">${plot}</p>
                </div>
            </div>
        `;
    }

    async showMovieDetails(imdbID) {
        this.showLoading();
        
        try {
            const response = await fetch(`${this.omdbURL}?i=${imdbID}&apikey=${this.apiKey}&plot=full`);
            const movie = await response.json();
            
            if (movie.Response === 'True') {
                this.displayMovieModal(movie);
            }
        } catch (error) {
            console.error('Error fetching movie details:', error);
        } finally {
            this.hideLoading();
        }
    }

    displayMovieModal(movie) {
        const poster = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450/667eea/white?text=No+Image';
        const rating = movie.imdbRating !== 'N/A' ? movie.imdbRating : 'N/A';
        const runtime = movie.Runtime !== 'N/A' ? movie.Runtime : 'N/A';
        const genre = movie.Genre !== 'N/A' ? movie.Genre : 'N/A';
        const director = movie.Director !== 'N/A' ? movie.Director : 'N/A';
        const actors = movie.Actors !== 'N/A' ? movie.Actors : 'N/A';
        const plot = movie.Plot !== 'N/A' ? movie.Plot : 'No description available.';

        this.movieDetails.innerHTML = `
            <div class="movie-details">
                <img src="${poster}" alt="${movie.Title}" class="detail-poster">
                <div class="detail-info">
                    <h2>${movie.Title} (${movie.Year})</h2>
                    <p><strong>Rating:</strong> ⭐ ${rating}/10</p>
                    <p><strong>Runtime:</strong> ${runtime}</p>
                    <p><strong>Genre:</strong> ${genre}</p>
                    <p><strong>Director:</strong> ${director}</p>
                    <p><strong>Cast:</strong> ${actors}</p>
                    <p><strong>Plot:</strong> ${plot}</p>
                </div>
            </div>
        `;

        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    displayNoResults() {
        this.moviesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: white; padding: 50px;">
                <h3>No movies found</h3>
                <p>Try searching with a different keyword</p>
            </div>
        `;
    }

    displayError() {
        this.moviesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: white; padding: 50px;">
                <h3>Error loading movies</h3>
                <p>Please try again later</p>
            </div>
        `;
    }

    showLoading() {
        this.loading.style.display = 'block';
    }

    hideLoading() {
        this.loading.style.display = 'none';
    }
}

let movieApp;

document.addEventListener('DOMContentLoaded', function() {
    movieApp = new SimpleMovieApp();
    console.log('Simple Movie App initialized!');
});

document.addEventListener('keydown', function(e) {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        movieApp.searchInput.focus();
    }
    if (e.key === 'Escape') {
        movieApp.closeModal();
    }
});
