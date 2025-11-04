# 📡 API Documentation

## Base URL
```
HTTP:  http://localhost:3000
WebSocket: ws://localhost:3000/game
```

## 🔌 WebSocket API

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000/game', {
  transports: ['websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

### Events from Client → Server

#### 1. Place Bet
**Event**: `place:bet`

**Payload**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "player1",
  "amount": 100
}
```

**Validation**:
- `userId`: UUID format
- `username`: Non-empty string
- `amount`: Number between 10 and 100,000

**Response Events**:
- Success: `bet:success`
- Error: `bet:error`

**Example**:
```javascript
socket.emit('place:bet', {
  userId: 'user-uuid',
  username: 'player1',
  amount: 100
});

socket.on('bet:success', (data) => {
  console.log('Bet placed:', data);
  // { message: "Bet placed successfully", bet: {...} }
});

socket.on('bet:error', (error) => {
  console.error('Bet failed:', error.message);
});
```

---

#### 2. Cashout
**Event**: `cashout`

**Payload**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Events**:
- Success: `cashout:success`
- Error: `cashout:error`

**Example**:
```javascript
socket.emit('cashout', {
  userId: 'user-uuid'
});

socket.on('cashout:success', (data) => {
  console.log('Cashed out:', data);
  // { message: "Cashed out successfully", payout: 245.50, multiplier: 2.45 }
});

socket.on('cashout:error', (error) => {
  console.error('Cashout failed:', error.message);
});
```

---

#### 3. Get State
**Event**: `get:state`

**Payload**: None

**Response Event**: `game:state`

**Example**:
```javascript
socket.emit('get:state');

socket.on('game:state', (state) => {
  console.log('Current game state:', state);
});
```

---

### Events from Server → Client

#### 1. Game State
**Event**: `game:state`

**Payload**:
```json
{
  "roundId": "uuid",
  "roundNumber": 42,
  "status": "betting",
  "crashPoint": 2.56,
  "currentMultiplier": 1.00,
  "bettingEndsAt": 1699123456789,
  "activeBets": [
    {
      "userId": "uuid",
      "username": "player1",
      "amount": 100,
      "betId": "uuid",
      "cashedOut": false
    }
  ],
  "connectedPlayers": 15
}
```

**Status Values**:
- `betting`: Accepting bets
- `flying`: Multiplier increasing
- `ended`: Round finished

---

#### 2. New Round
**Event**: `round:new`

**Payload**:
```json
{
  "roundId": "uuid",
  "roundNumber": 43,
  "status": "betting",
  "crashPoint": 3.14,
  "currentMultiplier": 1.00,
  "bettingEndsAt": 1699123461789
}
```

**Fired**: When new round starts (betting phase begins)

---

#### 3. Round Flying
**Event**: `round:flying`

**Payload**:
```json
{
  "roundId": "uuid",
  "startedAt": 1699123456789
}
```

**Fired**: When betting phase ends and multiplier starts increasing

---

#### 4. Multiplier Tick
**Event**: `multiplier:tick`

**Payload**:
```json
{
  "roundId": "uuid",
  "multiplier": 1.42,
  "elapsed": 3500
}
```

**Frequency**: Every 100ms during flying phase

**Note**: `elapsed` is milliseconds since round started

---

#### 5. Round Crash
**Event**: `round:crash`

**Payload**:
```json
{
  "roundId": "uuid",
  "crashPoint": 2.56,
  "roundNumber": 42
}
```

**Fired**: When multiplier reaches crash point

---

#### 6. Bet Placed
**Event**: `bet:placed`

**Payload**:
```json
{
  "userId": "uuid",
  "username": "player1",
  "amount": 100,
  "betId": "uuid",
  "cashedOut": false
}
```

**Fired**: When any player places a bet (broadcast to all)

---

#### 7. Bet Cashed Out
**Event**: `bet:cashout`

**Payload**:
```json
{
  "userId": "uuid",
  "username": "player1",
  "multiplier": 2.45,
  "payout": 245.50,
  "roundId": "uuid"
}
```

**Fired**: When any player cashes out (broadcast to all)

---

## 🌐 REST API

### Health Check

#### GET /health
**Description**: Check API health status

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-11-04T10:30:00.000Z",
  "service": "crash-game-api",
  "version": "1.0.0"
}
```

---

### Game State

#### GET /api/game/state
**Description**: Get current game state

**Response**:
```json
{
  "success": true,
  "data": {
    "roundId": "uuid",
    "roundNumber": 42,
    "status": "flying",
    "crashPoint": 2.56,
    "currentMultiplier": 1.85,
    "startedAt": 1699123456789,
    "activeBets": [...]
  }
}
```

---

### Rounds

#### GET /api/game/rounds
**Description**: Get round history with pagination

**Query Parameters**:
- `page` (default: 1) - Page number
- `limit` (default: 20) - Results per page

**Example**: `/api/game/rounds?page=1&limit=10`

**Response**:
```json
{
  "success": true,
  "data": {
    "rounds": [
      {
        "id": "uuid",
        "roundNumber": 42,
        "crashPoint": 2.56,
        "status": "ended",
        "hash": "abc123...",
        "startedAt": "2024-11-04T10:20:00.000Z",
        "endedAt": "2024-11-04T10:20:15.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

---

#### GET /api/game/rounds/:id
**Description**: Get specific round details with all bets

**Parameters**:
- `id` - Round UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roundNumber": 42,
    "crashPoint": 2.56,
    "status": "ended",
    "serverSeed": "abc123...",
    "clientSeed": "xyz789...",
    "hash": "hash...",
    "startedAt": "2024-11-04T10:20:00.000Z",
    "endedAt": "2024-11-04T10:20:15.000Z",
    "bets": [
      {
        "id": "bet-uuid",
        "amount": 100,
        "cashoutMultiplier": 2.45,
        "payout": 245.50,
        "status": "cashed_out",
        "user": {
          "id": "user-uuid",
          "username": "player1"
        }
      }
    ]
  }
}
```

---

### Bets

#### GET /api/game/bets/user/:userId
**Description**: Get user's bet history with statistics

**Parameters**:
- `userId` - User UUID

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 20)

**Example**: `/api/game/bets/user/uuid?page=1&limit=5`

**Response**:
```json
{
  "success": true,
  "data": {
    "bets": [
      {
        "id": "uuid",
        "amount": 100,
        "cashoutMultiplier": 2.45,
        "payout": 245.50,
        "status": "cashed_out",
        "createdAt": "2024-11-04T10:20:00.000Z",
        "round": {
          "roundNumber": 42,
          "crashPoint": 2.56
        }
      }
    ],
    "stats": {
      "totalBets": 150,
      "wins": 75,
      "losses": 75,
      "totalWagered": 15000.00,
      "totalWon": 16500.00,
      "profit": 1500.00
    },
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 150,
      "totalPages": 30
    }
  }
}
```

---

### Statistics

#### GET /api/game/stats
**Description**: Get global game statistics

**Response**:
```json
{
  "success": true,
  "data": {
    "totalRounds": 1000,
    "totalBets": 50000,
    "totalUsers": 500,
    "totalWagered": 5000000.00,
    "totalWon": 4800000.00,
    "houseProfit": 200000.00,
    "avgBet": 100.00,
    "biggestWin": 50000.00,
    "avgCrashPoint": 1.98,
    "maxCrashPoint": 1000.00,
    "minCrashPoint": 1.00
  }
}
```

---

### Leaderboard

#### GET /api/game/leaderboard
**Description**: Get top players by profit

**Query Parameters**:
- `period` (default: 'all') - Time period: 'all', 'today', 'week', 'month'
- `limit` (default: 10) - Number of results

**Example**: `/api/game/leaderboard?period=today&limit=5`

**Response**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "username": "player1",
        "totalBets": 200,
        "totalWagered": 20000.00,
        "totalWon": 25000.00,
        "profit": 5000.00
      }
    ],
    "period": "today"
  }
}
```

---

### Verification

#### POST /api/game/verify
**Description**: Verify round fairness (provably fair)

**Request Body**:
```json
{
  "serverSeed": "abc123...",
  "clientSeed": "xyz789...",
  "roundNumber": 42,
  "crashPoint": 2.56
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "provided": {
      "serverSeed": "abc123...",
      "clientSeed": "xyz789...",
      "roundNumber": 42,
      "crashPoint": 2.56
    },
    "calculated": {
      "crashPoint": 2.56,
      "hash": "hash..."
    }
  }
}
```

---

## 📊 WebSocket Client Example

### Complete Integration Example

```javascript
import { io } from 'socket.io-client';

class CrashGameClient {
  constructor() {
    this.socket = io('ws://localhost:3000/game');
    this.setupListeners();
  }

  setupListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to game server');
      this.requestState();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from game server');
    });

    // Game state
    this.socket.on('game:state', (state) => {
      this.updateUI(state);
    });

    // Round events
    this.socket.on('round:new', (data) => {
      console.log('New round:', data.roundNumber);
      this.resetUI();
    });

    this.socket.on('round:flying', (data) => {
      console.log('Round flying!');
      this.startMultiplierAnimation();
    });

    this.socket.on('multiplier:tick', (data) => {
      this.updateMultiplier(data.multiplier);
    });

    this.socket.on('round:crash', (data) => {
      console.log('Crashed at:', data.crashPoint);
      this.showCrash(data.crashPoint);
    });

    // Bet events
    this.socket.on('bet:placed', (bet) => {
      this.addBetToList(bet);
    });

    this.socket.on('bet:cashout', (data) => {
      this.showCashout(data);
    });

    // Personal events
    this.socket.on('bet:success', (data) => {
      this.showSuccess('Bet placed!');
    });

    this.socket.on('bet:error', (error) => {
      this.showError(error.message);
    });

    this.socket.on('cashout:success', (data) => {
      this.showSuccess(`Cashed out at ${data.multiplier}x!`);
    });

    this.socket.on('cashout:error', (error) => {
      this.showError(error.message);
    });
  }

  requestState() {
    this.socket.emit('get:state');
  }

  placeBet(userId, username, amount) {
    this.socket.emit('place:bet', {
      userId,
      username,
      amount
    });
  }

  cashout(userId) {
    this.socket.emit('cashout', { userId });
  }

  // UI methods (implement based on your frontend)
  updateUI(state) { /* ... */ }
  resetUI() { /* ... */ }
  startMultiplierAnimation() { /* ... */ }
  updateMultiplier(mult) { /* ... */ }
  showCrash(point) { /* ... */ }
  addBetToList(bet) { /* ... */ }
  showCashout(data) { /* ... */ }
  showSuccess(msg) { /* ... */ }
  showError(msg) { /* ... */ }
}

// Usage
const game = new CrashGameClient();

// Place bet
document.getElementById('betButton').addEventListener('click', () => {
  const amount = document.getElementById('betAmount').value;
  game.placeBet('user-uuid', 'player1', parseFloat(amount));
});

// Cashout
document.getElementById('cashoutButton').addEventListener('click', () => {
  game.cashout('user-uuid');
});
```

---

## 🔒 Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `BET_001` | Betting phase has ended | Round is in flying/ended state |
| `BET_002` | You have already placed a bet this round | Duplicate bet attempt |
| `BET_003` | Invalid bet amount | Amount outside min/max range |
| `CASH_001` | Cannot cash out during this phase | Not in flying phase |
| `CASH_002` | No active bet found | User hasn't placed bet |
| `CASH_003` | Already cashed out | Duplicate cashout attempt |
| `AUTH_001` | Invalid user ID | UUID validation failed |
| `CONN_001` | Connection timeout | WebSocket connection issue |

---

## 📈 Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| WebSocket connect | 10 connections | 1 minute |
| Place bet | 20 requests | 1 minute |
| Cashout | 50 requests | 1 minute |
| REST API | 100 requests | 1 minute |

**Note**: Rate limiting is not implemented yet. Add in production.

---

## 🧪 Testing with cURL

```bash
# Get current state
curl http://localhost:3000/api/game/state

# Get round history
curl http://localhost:3000/api/game/rounds?page=1&limit=5

# Get user bets
curl http://localhost:3000/api/game/bets/user/USER_UUID?page=1

# Get leaderboard
curl http://localhost:3000/api/game/leaderboard?period=today&limit=10

# Get statistics
curl http://localhost:3000/api/game/stats

# Verify round
curl -X POST http://localhost:3000/api/game/verify \
  -H "Content-Type: application/json" \
  -d '{
    "serverSeed": "abc123",
    "clientSeed": "xyz789",
    "roundNumber": 42,
    "crashPoint": 2.56
  }'
```

---

**Last Updated**: 2024-11-04
**Version**: 1.0.0
