document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const scoreDisplay = document.getElementById('score');
    const bestDisplay = document.getElementById('best');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const winOverlay = document.getElementById('win-overlay');
    const finalScoreDisplay = document.getElementById('final-score');
    const newGameBtn = document.getElementById('new-game-btn');
    const tryAgainBtn = document.getElementById('try-again-btn');
    const continueBtn = document.getElementById('continue-btn');
    const restartBtn = document.getElementById('restart-btn');

    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let grid = [];
    let hasWon = false;
    let gameEnded = false;
    let startX, startY;

    // Initialize game
    function init() {
        score = 0;
        hasWon = false;
        gameEnded = false;
        grid = [];
        
        for (let i = 0; i < 4; i++) {
            grid[i] = [];
            for (let j = 0; j < 4; j++) {
                grid[i][j] = 0;
            }
        }
        
        addRandomTile();
        addRandomTile();
        updateBoard();
        updateScore();
        hideOverlays();
    }

    // Update the board display
    function updateBoard() {
        board.innerHTML = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                
                if (grid[i][j] !== 0) {
                    tile.textContent = grid[i][j];
                    tile.classList.add(`tile-${grid[i][j]}`);
                } else {
                    tile.style.background = 'rgba(237, 242, 247, 0.6)';
                    tile.style.border = '2px solid rgba(66, 153, 225, 0.1)';
                    tile.style.boxShadow = 'inset 0 2px 8px rgba(0, 0, 0, 0.05)';
                }
                
                board.appendChild(tile);
            }
        }
    }

    // Update score display
    function updateScore() {
        scoreDisplay.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
        }
        bestDisplay.textContent = bestScore;
    }

    // Add score animation
    function showScoreAddition(points, element) {
        const scoreAdd = document.createElement('div');
        scoreAdd.className = 'score-addition';
        scoreAdd.textContent = `+${points}`;
        
        const rect = element.getBoundingClientRect();
        const containerRect = board.getBoundingClientRect();
        
        scoreAdd.style.left = `${rect.left - containerRect.left + rect.width/2}px`;
        scoreAdd.style.top = `${rect.top - containerRect.top + rect.height/2}px`;
        
        board.appendChild(scoreAdd);
        
        setTimeout(() => {
            if (scoreAdd.parentNode) {
                scoreAdd.parentNode.removeChild(scoreAdd);
            }
        }, 1000);
    }

    // Add a random tile (2 or 4)
    function addRandomTile() {
        let emptyTiles = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyTiles.push({ x: i, y: j });
                }
            }
        }
        if (emptyTiles.length > 0) {
            const { x, y } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // Hide overlays
    function hideOverlays() {
        gameOverOverlay.classList.add('hidden');
        winOverlay.classList.add('hidden');
    }

    // Show game over
    function showGameOver() {
        gameEnded = true;
        finalScoreDisplay.textContent = score;
        gameOverOverlay.classList.remove('hidden');
    }

    // Show win screen
    function showWin() {
        if (!hasWon) {
            hasWon = true;
            winOverlay.classList.remove('hidden');
        }
    }

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
        if (gameEnded) return;
        
        let moved = false;
        e.preventDefault();
        
        switch (e.key) {
            case 'ArrowUp':
                moved = moveUp();
                break;
            case 'ArrowDown':
                moved = moveDown();
                break;
            case 'ArrowLeft':
                moved = moveLeft();
                break;
            case 'ArrowRight':
                moved = moveRight();
                break;
        }
        
        if (moved) {
            addRandomTile();
            updateBoard();
            updateScore();
            
            if (checkWin() && !hasWon) {
                showWin();
            } else if (isGameOver()) {
                showGameOver();
            }
        }
    });

    // Touch controls for mobile
    board.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    board.addEventListener('touchend', (e) => {
        if (gameEnded) return;
        e.preventDefault();
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        let moved = false;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    moved = moveRight();
                } else {
                    moved = moveLeft();
                }
            }
        } else {
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    moved = moveDown();
                } else {
                    moved = moveUp();
                }
            }
        }
        
        if (moved) {
            addRandomTile();
            updateBoard();
            updateScore();
            
            if (checkWin() && !hasWon) {
                showWin();
            } else if (isGameOver()) {
                showGameOver();
            }
        }
    });

    // Move functions with improved logic
    function moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = grid[i].filter(val => val);
            let merged = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1] && !merged.includes(j)) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                    merged.push(j);
                }
            }
            
            while (row.length < 4) {
                row.push(0);
            }
            
            if (JSON.stringify(grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            grid[i] = row;
        }
        return moved;
    }

    function moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            let row = grid[i].filter(val => val);
            let merged = [];
            
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1] && !merged.includes(j)) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j - 1, 1);
                    merged.push(j - 1);
                    j--;
                }
            }
            
            while (row.length < 4) {
                row.unshift(0);
            }
            
            if (JSON.stringify(grid[i]) !== JSON.stringify(row)) {
                moved = true;
            }
            grid[i] = row;
        }
        return moved;
    }

    function moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
            let newColumn = column.filter(val => val);
            let merged = [];
            
            for (let i = 0; i < newColumn.length - 1; i++) {
                if (newColumn[i] === newColumn[i + 1] && !merged.includes(i)) {
                    newColumn[i] *= 2;
                    score += newColumn[i];
                    newColumn.splice(i + 1, 1);
                    merged.push(i);
                }
            }
            
            while (newColumn.length < 4) {
                newColumn.push(0);
            }
            
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    function moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
            let newColumn = column.filter(val => val);
            let merged = [];
            
            for (let i = newColumn.length - 1; i > 0; i--) {
                if (newColumn[i] === newColumn[i - 1] && !merged.includes(i)) {
                    newColumn[i] *= 2;
                    score += newColumn[i];
                    newColumn.splice(i - 1, 1);
                    merged.push(i - 1);
                    i--;
                }
            }
            
            while (newColumn.length < 4) {
                newColumn.unshift(0);
            }
            
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    // Check for win condition
    function checkWin() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    // Check for game over
    function isGameOver() {
        // Check for empty spaces
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i < 3 && grid[i][j] === grid[i + 1][j]) {
                    return false;
                }
                if (j < 3 && grid[i][j] === grid[i][j + 1]) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // Event listeners for buttons
    newGameBtn.addEventListener('click', init);
    tryAgainBtn.addEventListener('click', init);
    restartBtn.addEventListener('click', init);
    continueBtn.addEventListener('click', () => {
        winOverlay.classList.add('hidden');
    });

    // Initialize best score display
    bestDisplay.textContent = bestScore;
    
    // Start the game
    init();
});
