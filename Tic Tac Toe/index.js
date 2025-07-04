let gameState = {
    currentPlayer: 'X',
    board: Array(9).fill(''),
    gameActive: true,
    scores: { X: 0, O: 0, ties: 0 },
    isOnlineGame: false,
    websocket: null,
    clientId: null,
    playerSymbol: null,
    opponentId: null,
    isPlayerTurn: false
};

// LAN/WebSocket server address configuration
// Change this value to your server's LAN IP when connecting from another device
const SERVER_ADDRESS = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'ws://localhost:3000'
    : `ws://${window.location.hostname}:3000`;

document.addEventListener('DOMContentLoaded', () => {
    createBoard();
    updateScores();
    setupEventListeners();
    connectToServer();
});

function connectToServer() {
    try {
        const websocket = new WebSocket(SERVER_ADDRESS);
        websocket.onopen = () => {
            console.log('Connected to WebSocket server');
            gameState.websocket = websocket;
            document.getElementById('connection-modal').classList.remove('hidden');
        };
        websocket.onmessage = (event) => handleServerMessage(JSON.parse(event.data));
        websocket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            gameState.websocket = null;
            if (gameState.isOnlineGame) resetToLocalGame();
        };
        websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
            gameState.websocket = null;
        };
    } catch (error) {
        console.error('Failed to connect to WebSocket server:', error);
    }
}

function handleServerMessage(message) {
    console.log('Received message:', message);
    switch (message.type) {
        case 'connected':
            gameState.clientId = message.clientId;
            break;
        case 'matchmaking':
            break;
        case 'game_start':
            gameState.isOnlineGame = true;
            gameState.opponentId = message.opponent;
            gameState.playerSymbol = message.symbol;
            gameState.isPlayerTurn = message.yourTurn;
            gameState.board = Array(9).fill('');
            gameState.currentPlayer = 'X';
            document.getElementById('matchmaking-modal').classList.add('hidden');
            const onlineInfo = document.getElementById('online-game-info');
            const playerSymbolEl = document.getElementById('player-symbol');
            if (onlineInfo && playerSymbolEl) {
                onlineInfo.classList.remove('hidden');
                playerSymbolEl.textContent = message.symbol;
            }
            resetGame(false);
            updateGameStatus(gameState.isPlayerTurn ? `Your turn (${gameState.playerSymbol})` : `Opponent's turn`);
            break;
        case 'opponent_move':
            if (gameState.isOnlineGame) {
                const cellIndex = message.index;
                if (cellIndex === undefined || cellIndex < 0 || cellIndex >= 9) return;
                const cell = document.querySelector(`[data-index="${cellIndex}"]`);
                if (!cell) return;
                // The opponent symbol is the one that's NOT the player's symbol
                const opponentSymbol = gameState.playerSymbol === 'X' ? 'O' : 'X';
                gameState.board[cellIndex] = opponentSymbol;
                updateCell(cell, opponentSymbol);
                if (checkWin(opponentSymbol)) {
                    handleWin(opponentSymbol);
                } else if (isBoardFull()) {
                    handleDraw();
                } else {
                    gameState.currentPlayer = gameState.playerSymbol;
                    gameState.isPlayerTurn = true;
                    updateGameStatus(`Your turn (${gameState.playerSymbol})`);
                }
            }
            break;
        case 'opponent_disconnected':
            if (gameState.isOnlineGame) {
                alert('Your opponent has disconnected');
                resetToLocalGame();
            }
            break;
        case 'game_reset':
            if (gameState.isOnlineGame) {
                resetGame(false);
                // Reset turn state properly - X always goes first
                gameState.isPlayerTurn = gameState.playerSymbol === 'X';
                updateGameStatus(gameState.isPlayerTurn ? `Your turn (${gameState.playerSymbol})` : `Opponent's turn`);
            }
            break;
    }
}

function resetToLocalGame() {
    gameState.isOnlineGame = false;
    gameState.opponentId = null;
    gameState.playerSymbol = null;
    document.getElementById('online-game-info').classList.add('hidden');
    resetGame();
    alert('Online game ended. Switched to local game mode.');
}

function createBoard() {
    const gameBoard = document.getElementById('game');
    if (!gameBoard) return;
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'h-24', 'bg-white', 'rounded-lg', 'border', 'border-gray-200', 'flex', 'items-center', 'justify-center', 'cursor-pointer', 'relative');
        cell.dataset.index = i;
        const xMark = document.createElement('div');
        xMark.classList.add('x-mark', 'absolute', 'inset-0', 'hidden');
        xMark.innerHTML = `
            <svg class="w-full h-full p-6 text-violet-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        const oMark = document.createElement('div');
        oMark.classList.add('o-mark', 'absolute', 'inset-0', 'hidden');
        oMark.innerHTML = `
            <svg class="w-full h-full p-6 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="3"/>
            </svg>`;
        cell.appendChild(xMark);
        cell.appendChild(oMark);
        cell.addEventListener('click', () => handleCellClick(i));
        gameBoard.appendChild(cell);
    }
}

function handleCellClick(index) {
    if (gameState.board[index] !== '' || !gameState.gameActive || (gameState.isOnlineGame && !gameState.isPlayerTurn)) return;
    const cell = document.querySelector(`[data-index="${index}"]`);
    if (!cell) return;
    const symbol = gameState.isOnlineGame ? gameState.playerSymbol : gameState.currentPlayer;
    gameState.board[index] = symbol;
    updateCell(cell, symbol);
    if (gameState.isOnlineGame && gameState.websocket) {
        gameState.websocket.send(JSON.stringify({ type: 'game_move', index: index }));
        gameState.isPlayerTurn = false;
        updateGameStatus(`Opponent's turn`);
    }
    if (checkWin(symbol)) {
        handleWin(symbol);
    } else if (isBoardFull()) {
        handleDraw();
    } else if (!gameState.isOnlineGame) {
        gameState.currentPlayer = symbol === 'X' ? 'O' : 'X';
        updateGameStatus(`Player ${gameState.currentPlayer}'s turn`);
    }
}

function updateCell(cell, player) {
    cell.classList.add('filled');
    const xMark = cell.querySelector('.x-mark');
    const oMark = cell.querySelector('.o-mark');
    if (player === 'X') {
        xMark.classList.remove('hidden');
    } else {
        oMark.classList.remove('hidden');
    }
}

function checkWin(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        if (gameState.board[a] === player && gameState.board[b] === player && gameState.board[c] === player) {
            highlightWinningCells(pattern);
            return true;
        }
        return false;
    });
}

function highlightWinningCells(pattern) {
    pattern.forEach(index => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell) {
            cell.classList.add('bg-green-100', 'border-green-300');
        }
    });
}

function isBoardFull() {
    return gameState.board.every(cell => cell !== '');
}

function handleWin(winner) {
    gameState.gameActive = false;
    gameState.scores[winner]++;
    updateScores();
    const winnerText = document.getElementById('winner-text');
    const winnerIcon = document.getElementById('winner-icon');
    const winnerModal = document.getElementById('winner-modal');
    if (winnerText && winnerIcon && winnerModal) {
        winnerText.textContent = gameState.isOnlineGame
            ? (gameState.playerSymbol === winner ? 'You Win!' : 'You Lose!')
            : `Player ${winner} Wins!`;
        winnerIcon.innerHTML = winner === 'X'
            ? `<svg class="w-8 h-8 text-violet-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`
            : `<svg class="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="7" stroke="currentColor" stroke-width="3"/>
            </svg>`;
        winnerIcon.className = winner === 'X'
            ? 'mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-violet-100'
            : 'mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-indigo-100';
        setTimeout(() => {
            winnerModal.classList.remove('hidden');
            winnerModal.classList.add('show-modal');
        }, 500);
    }
}

function handleDraw() {
    gameState.gameActive = false;
    gameState.scores.ties++;
    updateScores();
    const winnerText = document.getElementById('winner-text');
    const winnerIcon = document.getElementById('winner-icon');
    const winnerModal = document.getElementById('winner-modal');
    if (winnerText && winnerIcon && winnerModal) {
        winnerText.textContent = 'It\'s a Draw!';
        winnerIcon.innerHTML = `
            <svg class="w-8 h-8 text-gray-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12H16M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`;
        winnerIcon.className = 'mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-gray-100';
        setTimeout(() => {
            winnerModal.classList.remove('hidden');
            winnerModal.classList.add('show-modal');
        }, 500);
    }
}

function updateGameStatus(message) {
    const gameStatus = document.getElementById('game-status');
    if (gameStatus) {
        gameStatus.textContent = message;
    }
}

function updateScores() {
    const xScoreEl = document.getElementById('x-score');
    const oScoreEl = document.getElementById('o-score');
    const tiesEl = document.getElementById('ties');
    if (xScoreEl) xScoreEl.textContent = gameState.scores.X;
    if (oScoreEl) oScoreEl.textContent = gameState.scores.O;
    if (tiesEl) tiesEl.textContent = gameState.scores.ties;
}

function resetGame(sendReset = true) {
    gameState.board = Array(9).fill('');
    gameState.gameActive = true;
    if (!gameState.isOnlineGame) {
        gameState.currentPlayer = 'X';
        updateGameStatus(`Player X's turn`);
    } else {
        gameState.currentPlayer = 'X';
        // In online games, X always goes first
        gameState.isPlayerTurn = gameState.playerSymbol === 'X';
        updateGameStatus(gameState.isPlayerTurn ? `Your turn (${gameState.playerSymbol})` : `Opponent's turn`);
        if (sendReset && gameState.websocket) {
            gameState.websocket.send(JSON.stringify({ type: 'game_reset' }));
        }
    }
    const winnerModal = document.getElementById('winner-modal');
    if (winnerModal) {
        winnerModal.classList.add('hidden');
        winnerModal.classList.remove('show-modal');
    }
    createBoard();
}

function newGame() {
    resetGame();
    gameState.scores = { X: 0, O: 0, ties: 0 };
    updateScores();
}

function findOnlineGame() {
    if (!gameState.websocket) return;
    document.getElementById('matchmaking-modal').classList.remove('hidden');
    gameState.websocket.send(JSON.stringify({ type: 'find_game' }));
}

function cancelMatchmaking() {
    if (!gameState.websocket) return;
    document.getElementById('matchmaking-modal').classList.add('hidden');
    gameState.websocket.send(JSON.stringify({ type: 'cancel_matchmaking' }));
}

function setupEventListeners() {
    const startBtn = document.getElementById('start');
    if (startBtn) startBtn.addEventListener('click', () => {
        document.getElementById('welcome-screen').style.left = '-100vw';
        document.getElementById('play').style.left = '0';
    });
    const aboutBtn = document.getElementById('about');
    if (aboutBtn) aboutBtn.addEventListener('click', () => {
        document.getElementById('play').style.left = '-100vw';
        document.getElementById('about-this-project').style.left = '0';
    });
    const backToRulesBtn = document.getElementById('back-b1');
    if (backToRulesBtn) backToRulesBtn.addEventListener('click', () => {
        document.getElementById('about-this-project').style.left = '-100vw';
        document.getElementById('play').style.left = '0';
    });
    const playGameBtn = document.getElementById('play-game');
    if (playGameBtn) playGameBtn.addEventListener('click', () => {
        document.getElementById('play').style.left = '-100vw';
        document.getElementById('main').style.transform = 'translateY(0)';
    });
    const backPlayBtn = document.getElementById('back-play');
    if (backPlayBtn) backPlayBtn.addEventListener('click', () => {
        document.getElementById('main').style.transform = 'translateY(100vh)';
        document.getElementById('play').style.left = '0';
    });
    const resetBtn = document.getElementById('reset');
    if (resetBtn) resetBtn.addEventListener('click', () => resetGame(true));
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
        document.getElementById('winner-modal').classList.add('hidden');
    });
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) playAgainBtn.addEventListener('click', () => resetGame(true));
    const playLocalBtn = document.getElementById('play-local-btn');
    if (playLocalBtn) playLocalBtn.addEventListener('click', () => {
        document.getElementById('connection-modal').classList.add('hidden');
        gameState.isOnlineGame = false;
    });
    const playOnlineBtn = document.getElementById('play-online-btn');
    if (playOnlineBtn) playOnlineBtn.addEventListener('click', () => {
        document.getElementById('connection-modal').classList.add('hidden');
        findOnlineGame();
    });
    const cancelMatchmakingBtn = document.getElementById('cancel-matchmaking-btn');
    if (cancelMatchmakingBtn) cancelMatchmakingBtn.addEventListener('click', cancelMatchmaking);
}