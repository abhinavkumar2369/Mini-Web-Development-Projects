const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3000, host: '0.0.0.0' });

console.log('WebSocket server started on port 3000 (LAN enabled)');

const clients = new Map();
const waitingPlayers = [];
const gameSessions = new Map();

wss.on('connection', (ws) => {
    const clientId = generateId();
    clients.set(ws, { id: clientId, opponent: null });
    
    console.log(`Client connected: ${clientId}`);
    
    ws.send(JSON.stringify({
        type: 'connected',
        clientId: clientId
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data);
        } catch (e) {
            console.error('Error parsing message:', e);
        }
    });
    
    ws.on('close', () => {
        const clientInfo = clients.get(ws);
        if (clientInfo) {
            console.log(`Client disconnected: ${clientInfo.id}`);
            
            if (clientInfo.opponent) {
                const opponentWs = [...clients.keys()].find(
                    client => clients.get(client).id === clientInfo.opponent
                );
                
                if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
                    opponentWs.send(JSON.stringify({
                        type: 'opponent_disconnected'
                    }));
                    clients.get(opponentWs).opponent = null;
                }
                
                gameSessions.delete(clientInfo.id);
                gameSessions.delete(clientInfo.opponent);
            } else {
                const index = waitingPlayers.findIndex(id => id === clientInfo.id);
                if (index !== -1) {
                    waitingPlayers.splice(index, 1);
                }
            }
            
            clients.delete(ws);
        }
    });
});

function handleMessage(ws, data) {
    const clientInfo = clients.get(ws);
    
    if (!clientInfo) return;
    
    switch(data.type) {
        case 'find_game':
            findGame(ws, clientInfo);
            break;
            
        case 'game_move':
            relayMove(ws, clientInfo, data);
            break;
            
        case 'game_reset':
            relayGameReset(clientInfo);
            break;
            
        case 'cancel_matchmaking':
            cancelMatchmaking(clientInfo);
            break;
    }
}

function findGame(ws, clientInfo) {
    if (waitingPlayers.length > 0) {
        const opponentId = waitingPlayers.shift();
        const opponentWs = [...clients.keys()].find(
            client => clients.get(client).id === opponentId
        );
        
        if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
            clientInfo.opponent = opponentId;
            clients.get(opponentWs).opponent = clientInfo.id;
            
            const gameId = generateId();
            gameSessions.set(clientInfo.id, { 
                id: gameId,
                xPlayer: clientInfo.id
            });
            gameSessions.set(opponentId, { 
                id: gameId,
                xPlayer: clientInfo.id
            });
            
            ws.send(JSON.stringify({
                type: 'game_start',
                opponent: opponentId,
                symbol: 'X',
                yourTurn: true
            }));
            
            opponentWs.send(JSON.stringify({
                type: 'game_start',
                opponent: clientInfo.id,
                symbol: 'O',
                yourTurn: false
            }));
            
            console.log(`Game started between ${clientInfo.id} (X) and ${opponentId} (O)`);
        } else {
            waitingPlayers.push(clientInfo.id);
            ws.send(JSON.stringify({ 
                type: 'matchmaking',
                status: 'searching'
            }));
        }
    } else {
        waitingPlayers.push(clientInfo.id);
        ws.send(JSON.stringify({ 
            type: 'matchmaking',
            status: 'waiting'
        }));
    }
}

function relayMove(ws, clientInfo, data) {
    if (!clientInfo.opponent) return;
    
    const opponentWs = [...clients.keys()].find(
        client => clients.get(client).id === clientInfo.opponent
    );
    
    if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
        console.log(`Relaying move from ${clientInfo.id} to ${clientInfo.opponent}: cell ${data.index}`);
        
        opponentWs.send(JSON.stringify({
            type: 'opponent_move',
            index: data.index
        }));
    }
}

function relayGameReset(clientInfo) {
    if (!clientInfo.opponent) return;
    
    const opponentWs = [...clients.keys()].find(
        client => clients.get(client).id === clientInfo.opponent
    );
    
    if (opponentWs && opponentWs.readyState === WebSocket.OPEN) {
        opponentWs.send(JSON.stringify({
            type: 'game_reset'
        }));
    }
}

function cancelMatchmaking(clientInfo) {
    const index = waitingPlayers.findIndex(id => id === clientInfo.id);
    if (index !== -1) {
        waitingPlayers.splice(index, 1);
    }
}

function generateId() {
    return Math.random().toString(36).substring(2, 10);
}
