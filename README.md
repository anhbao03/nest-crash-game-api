# 🎮 Crash Game API - Backend

A real-time multiplayer crash game backend built with NestJS, WebSocket, PostgreSQL, and Redis. Similar to Aviator/Bustabit style crash games with provably fair algorithm.

## 🚀 Features

### ✅ Completed Features

- **Real-time WebSocket Communication** - Socket.io for instant game updates
- **Provably Fair Algorithm** - SHA256-based crash point generation
- **Game Engine** - Automated round lifecycle management
- **Betting System** - Place bets and cash out with validation
- **Redis Pub/Sub** - Multi-instance synchronization support
- **REST API** - Comprehensive endpoints for history, stats, and verification
- **TypeORM Integration** - PostgreSQL database with entities and migrations
- **Clean Architecture** - Modular design with separation of concerns

### 📊 Data Models

```typescript
// Round Entity
- id: UUID
- roundNumber: Integer (unique)
- crashPoint: Decimal (2 decimal places)
- status: 'betting' | 'flying' | 'ended'
- serverSeed: String (for provably fair)
- clientSeed: String
- hash: String (SHA256)
- startedAt: Timestamp
- endedAt: Timestamp

// Bet Entity
- id: UUID
- userId: UUID
- roundId: UUID
- amount: Decimal
- cashoutMultiplier: Decimal (nullable)
- payout: Decimal (nullable)
- status: 'pending' | 'cashed_out' | 'lost'
- cashedOutAt: Timestamp

// User Entity
- id: UUID
- username: String (unique)
- balance: Decimal
- isActive: Boolean
```

### 🔌 WebSocket Events

**Client → Server:**
- `place:bet` - Place a bet during betting phase
- `cashout` - Cash out during flying phase
- `get:state` - Request current game state

**Server → Client:**
- `round:new` - New round started (betting phase)
- `round:flying` - Round flying (multiplier increasing)
- `multiplier:tick` - Current multiplier update (every 100ms)
- `round:crash` - Round crashed with final multiplier
- `bet:placed` - Bet placed by any player
- `bet:cashout` - Player cashed out
- `game:state` - Current game state snapshot
- `bet:success` - Your bet was accepted
- `bet:error` - Bet placement failed
- `cashout:success` - Cash out successful
- `cashout:error` - Cash out failed

### 🌐 REST API Endpoints

**Game State & Info:**
- `GET /api/game/state` - Get current game state
- `GET /api/health` - Health check

**Rounds:**
- `GET /api/game/rounds?page=1&limit=20` - Get round history
- `GET /api/game/rounds/:id` - Get specific round details

**Bets:**
- `GET /api/game/bets/user/:userId?page=1&limit=20` - Get user bet history with stats

**Statistics:**
- `GET /api/game/stats` - Get global game statistics
- `GET /api/game/leaderboard?period=all&limit=10` - Get leaderboard (all/today/week/month)

**Verification:**
- `POST /api/game/verify` - Verify round fairness
  ```json
  {
    "serverSeed": "abc123...",
    "clientSeed": "xyz789...",
    "roundNumber": 42,
    "crashPoint": 2.56
  }
  ```

## 🛠️ Tech Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Socket.io** - Real-time WebSocket communication
- **TypeORM** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching and Pub/Sub
- **Docker** - Containerization

## 📦 Installation

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 6
- Docker & Docker Compose (optional)

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/your-username/nest-crash-game-api.git
cd nest-crash-game-api
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start databases with Docker:**
```bash
npm run docker:up
```

Or manually start PostgreSQL and Redis, then update `.env` accordingly.

5. **Run application:**
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 🎮 How It Works

### Game Flow

1. **Betting Phase (5 seconds)**
   - Players can place bets
   - Server accepts bets and validates amounts
   - Crash point is pre-calculated using provably fair algorithm

2. **Flying Phase**
   - Multiplier starts at 1.00x and increases exponentially
   - Server broadcasts multiplier every 100ms
   - Players can cash out at any time
   - Formula: `multiplier = e^(0.00006 * elapsed_ms)`

3. **Crash**
   - When multiplier reaches crash point, game ends
   - All pending bets become losses
   - Cashed out bets receive their payouts

4. **Wait Period (3 seconds)**
   - Show results and prepare next round

### Provably Fair Algorithm

```typescript
// Crash point calculation (based on Bustabit)
const combined = `${serverSeed}:${clientSeed}:${roundNumber}`;
const hash = SHA256(combined);
const hexValue = hash.substring(0, 13); // First 52 bits
const normalized = parseInt(hexValue, 16) / Math.pow(2, 52);
const crashPoint = (99 / (1 - normalized)) * (1 - houseEdge);
```

Players can verify any round by:
1. Getting serverSeed (revealed after round ends)
2. Using clientSeed and roundNumber
3. Recalculating crash point with same formula
4. Using `/api/game/verify` endpoint

## 🧪 Testing

### Manual Testing with WebSocket Client

```javascript
// Connect to WebSocket
const socket = io('ws://localhost:3000/game');

// Listen to events
socket.on('game:state', (data) => {
  console.log('Current state:', data);
});

socket.on('multiplier:tick', (data) => {
  console.log('Multiplier:', data.multiplier);
});

socket.on('round:crash', (data) => {
  console.log('Crashed at:', data.crashPoint);
});

// Place bet
socket.emit('place:bet', {
  userId: 'uuid-here',
  username: 'player1',
  amount: 100
});

// Cash out
socket.emit('cashout', {
  userId: 'uuid-here'
});
```

### Test REST API

```bash
# Get current state
curl http://localhost:3000/api/game/state

# Get round history
curl http://localhost:3000/api/game/rounds?page=1&limit=5

# Get leaderboard
curl http://localhost:3000/api/game/leaderboard?period=today&limit=10

# Verify round
curl -X POST http://localhost:3000/api/game/verify \
  -H "Content-Type: application/json" \
  -d '{
    "serverSeed": "abc123",
    "clientSeed": "xyz789",
    "roundNumber": 1,
    "crashPoint": 2.56
  }'
```

## 📁 Project Structure

```
nest-crash-game-api/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── game.config.ts
│   ├── database/
│   │   └── entities/        # TypeORM entities
│   │       ├── user.entity.ts
│   │       ├── round.entity.ts
│   │       └── bet.entity.ts
│   ├── game/
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── interfaces/      # TypeScript interfaces
│   │   ├── services/        # Business logic
│   │   │   ├── game-engine.service.ts
│   │   │   ├── provably-fair.service.ts
│   │   │   └── redis.service.ts
│   │   ├── game.controller.ts
│   │   └── game.module.ts
│   ├── websocket/
│   │   ├── game.gateway.ts  # WebSocket gateway
│   │   └── websocket.module.ts
│   ├── app.module.ts
│   └── main.ts
├── docker-compose.yml
├── .env
├── .env.example
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | 3000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | Database user | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_DATABASE` | Database name | crash_game |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `BETTING_DURATION` | Betting phase duration (ms) | 5000 |
| `MIN_BET` | Minimum bet amount | 10 |
| `MAX_BET` | Maximum bet amount | 100000 |
| `HOUSE_EDGE` | House edge percentage | 0.01 |

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Manual Deployment

1. Build application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start:prod
```

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable SSL for PostgreSQL in production
- Configure Redis authentication
- Implement rate limiting for API endpoints
- Add authentication/authorization for user actions

## 📈 Scaling

The architecture supports horizontal scaling:

1. **Redis Pub/Sub** - Synchronizes game state across multiple instances
2. **Stateless Design** - WebSocket gateway can run on multiple servers
3. **Database Replication** - PostgreSQL primary/replica setup
4. **Load Balancer** - Distribute WebSocket connections

## 🐛 Known Issues & Future Improvements

### Not Yet Implemented:

- [ ] User authentication/authorization (JWT)
- [ ] User wallet/balance management
- [ ] Transaction history and audit logs
- [ ] Admin panel and dashboard
- [ ] Rate limiting and DDoS protection
- [ ] Automated testing (unit + e2e)
- [ ] Database migrations management
- [ ] Monitoring and logging (Prometheus/Grafana)
- [ ] Anti-cheat system
- [ ] Chat system for players

### Recommended Next Steps:

1. **Implement Authentication** - Add JWT-based auth for users
2. **User Management** - Create user registration and profile endpoints
3. **Wallet System** - Integrate balance management with deposits/withdrawals
4. **Testing** - Write comprehensive unit and e2e tests
5. **Monitoring** - Add logging, metrics, and alerting
6. **Admin Panel** - Build admin interface for game management

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using NestJS
