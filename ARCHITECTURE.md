# 🏗️ Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Browser/Mobile App with Socket.io Client + REST Client)   │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ WebSocket + HTTP
                 │
┌────────────────▼─────────────────────────────────────────────┐
│                     NestJS Application                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         WebSocket Gateway (Socket.io)                 │   │
│  │  - Real-time events broadcasting                      │   │
│  │  - Client connection management                       │   │
│  └──────────────────┬────────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼────────────────────────────────────┐   │
│  │              Game Engine Service                       │   │
│  │  - Round lifecycle management                          │   │
│  │  - Betting/Flying/Crash state machine                  │   │
│  │  - Multiplier calculation                              │   │
│  │  - Bet & Cashout processing                            │   │
│  └──────────────────┬────────────────────────────────────┘   │
│                     │                                         │
│  ┌──────────────────▼────────────────────────────────────┐   │
│  │          Provably Fair Service                         │   │
│  │  - Crash point generation (SHA256)                     │   │
│  │  - Seed management                                     │   │
│  │  - Verification algorithm                              │   │
│  └──────────────────┬────────────────────────────────────┘   │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
┌───────▼────────┐          ┌────────▼────────┐
│  PostgreSQL    │          │     Redis       │
│  (TypeORM)     │          │   (ioredis)     │
│                │          │                 │
│  - Users       │          │  - Pub/Sub      │
│  - Rounds      │          │  - Caching      │
│  - Bets        │          │  - Sessions     │
└────────────────┘          └─────────────────┘
```

## Module Structure

### 1. Game Module (`src/game/`)

**Responsibility**: Core game logic and business rules

**Services**:
- `GameEngineService`: Main game loop and state management
- `ProvablyFairService`: Cryptographic fairness calculations
- `RedisService`: Pub/Sub and caching layer

**Controllers**:
- `GameController`: REST API endpoints

**DTOs**:
- `PlaceBetDto`: Bet placement validation
- `CashoutDto`: Cashout request validation

**Interfaces**:
- `GameState`: Current game state structure
- `PlayerBet`: Active bet information
- `RoundResult`: Round completion data

### 2. WebSocket Module (`src/websocket/`)

**Responsibility**: Real-time communication with clients

**Gateway**:
- `GameGateway`: Socket.io gateway for WebSocket events

**Features**:
- Client connection/disconnection handling
- Real-time event broadcasting
- Redis Pub/Sub integration for multi-instance sync

### 3. Database Module (`src/database/`)

**Responsibility**: Data persistence layer

**Entities**:
- `User`: Player accounts and balances
- `Round`: Game rounds with provably fair data
- `Bet`: Player bets and outcomes

### 4. Config Module (`src/config/`)

**Responsibility**: Application configuration

**Config Files**:
- `database.config.ts`: TypeORM/PostgreSQL settings
- `redis.config.ts`: Redis connection settings
- `game.config.ts`: Game mechanics parameters

## Data Flow

### 1. Betting Phase Flow

```
Client                Gateway              GameEngine           Database
  │                     │                      │                   │
  │──place:bet──────────▶│                     │                   │
  │                     │──placeBet()─────────▶│                   │
  │                     │                      │──validate()       │
  │                     │                      │──create bet───────▶│
  │                     │                      │◀──bet saved───────│
  │                     │◀──bet object────────│                   │
  │◀──bet:success───────│                     │                   │
  │                     │                      │                   │
  │                     │◀──Redis Pub/Sub─────│                   │
  │◀──bet:placed────────│ (broadcast to all)  │                   │
```

### 2. Flying Phase Flow

```
GameEngine           Redis               Gateway            Clients
    │                  │                    │                  │
    │──start flying────▶│                   │                  │
    │                  │──publish───────────▶│                 │
    │                  │  round:flying      │──broadcast──────▶│
    │                  │                    │                  │
  ┌─┴─ tick loop (100ms)                    │                  │
  │ │──calculate mult──│                    │                  │
  │ │                  │──publish───────────▶│                 │
  │ │                  │  multiplier:tick   │──broadcast──────▶│
  │ │                  │                    │                  │
  └─┤──check crash─────│                    │                  │
    │                  │                    │                  │
```

### 3. Cashout Flow

```
Client               Gateway            GameEngine          Database
  │                    │                    │                  │
  │──cashout───────────▶│                   │                  │
  │                    │──cashOut()────────▶│                  │
  │                    │                    │──validate()      │
  │                    │                    │──calculate       │
  │                    │                    │──update bet──────▶│
  │                    │                    │◀──saved──────────│
  │                    │◀──result──────────│                  │
  │◀──cashout:success──│                   │                  │
  │                    │                   │                  │
  │                    │◀──Redis Pub/Sub───│                  │
  │◀──bet:cashout──────│  (broadcast)      │                  │
```

### 4. Crash Flow

```
GameEngine           Database            Redis             Gateway
    │                   │                  │                  │
    │──crash reached────│                  │                  │
    │──update round─────▶│                 │                  │
    │──update bets──────▶│                 │                  │
    │◀──saved───────────│                 │                  │
    │                   │                  │                  │
    │──publish crash────────────────────▶│                  │
    │                   │                  │──broadcast───────▶│
    │                   │                  │   round:crash     │
    │                   │                  │                  │
    │──wait 3s──────────│                  │                  │
    │──start new round──│                  │                  │
```

## Scalability Design

### Horizontal Scaling with Redis Pub/Sub

```
                  ┌──────────────┐
                  │  Load Balancer│
                  └───────┬───────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼─────┐      ┌────▼─────┐     ┌────▼─────┐
   │Instance 1│      │Instance 2│     │Instance 3│
   │WebSocket │      │WebSocket │     │WebSocket │
   │Gateway   │      │Gateway   │     │Gateway   │
   └────┬─────┘      └────┬─────┘     └────┬─────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    ┌─────▼──────┐
                    │Redis Pub/Sub│
                    │  Broadcast  │
                    └─────┬──────┘
                          │
              ┌───────────┼───────────┐
              │                       │
        ┌─────▼──────┐         ┌──────▼─────┐
        │PostgreSQL  │         │  Redis     │
        │(Primary)   │         │  Cache     │
        └────────────┘         └────────────┘
```

**Benefits**:
- Multiple instances can run simultaneously
- Redis Pub/Sub ensures all instances receive game events
- WebSocket connections distributed across instances
- Shared database state ensures consistency

### Database Optimization

**Indexes**:
```sql
-- Round lookups by number
CREATE INDEX idx_rounds_number ON rounds(round_number);

-- Round status queries
CREATE INDEX idx_rounds_status ON rounds(status);

-- User bet history
CREATE INDEX idx_bets_user ON bets(user_id);

-- Round bets
CREATE INDEX idx_bets_round ON bets(round_id);

-- Cashout queries
CREATE INDEX idx_bets_status ON bets(status);
```

**Partitioning Strategy** (for future):
- Partition `rounds` table by date
- Partition `bets` table by date
- Archive old data to cold storage

## Security Considerations

### 1. Input Validation
- All DTOs use `class-validator` decorators
- Min/max bet amounts enforced
- UUID validation for user IDs

### 2. Race Condition Prevention
- Database transactions for bet placement
- Status checks before cashout
- Multiplier validation against crash point

### 3. Provably Fair Integrity
- Server seed hidden until round ends
- Client seed can be user-provided
- SHA256 ensures deterministic results
- Public verification endpoint

### 4. DDoS Protection (recommended)
- Rate limiting on WebSocket events
- Connection limits per IP
- Request throttling on REST APIs

## Performance Metrics

### Target Performance

| Metric | Target | Current |
|--------|--------|---------|
| Concurrent Players | 10,000+ | Not tested |
| Multiplier Update Rate | 100ms | ✅ 100ms |
| Bet Processing Time | < 50ms | Not measured |
| Cashout Latency | < 100ms | Not measured |
| Database Query Time | < 10ms | Not measured |

### Monitoring Points

1. **Game Engine**
   - Round duration
   - Bets per round
   - Cashout success rate

2. **WebSocket**
   - Connected clients
   - Message throughput
   - Connection errors

3. **Database**
   - Query performance
   - Connection pool usage
   - Lock contention

4. **Redis**
   - Pub/Sub latency
   - Memory usage
   - Cache hit rate

## Testing Strategy

### Unit Tests
- Provably Fair calculations
- Multiplier formula
- Bet validation logic
- Cashout calculation

### Integration Tests
- WebSocket event flow
- Database transactions
- Redis Pub/Sub

### Load Tests
- Concurrent connections
- Bets per second
- Database throughput

### End-to-End Tests
- Complete game rounds
- Multi-player scenarios
- Crash scenarios

## Future Enhancements

### Phase 1: Core Features
- [ ] User authentication (JWT)
- [ ] User registration/login
- [ ] Balance management
- [ ] Transaction history

### Phase 2: Advanced Features
- [ ] Auto-cashout settings
- [ ] Betting history export
- [ ] Statistics dashboard
- [ ] Referral system

### Phase 3: Scalability
- [ ] Kubernetes deployment
- [ ] Database replication
- [ ] CDN for static assets
- [ ] Microservices architecture

### Phase 4: Monitoring
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] Error tracking (Sentry)
- [ ] APM (Application Performance Monitoring)

## Deployment Architecture

### Development
```
Local Machine
├── NestJS (npm run start:dev)
├── PostgreSQL (Docker)
└── Redis (Docker)
```

### Production (Recommended)
```
Cloud Provider (AWS/GCP/Azure)
├── Load Balancer (ALB/NLB)
├── Auto-scaling Group
│   └── NestJS Instances (ECS/K8s)
├── RDS PostgreSQL (Multi-AZ)
├── ElastiCache Redis (Cluster Mode)
└── CloudWatch/Monitoring
```

## Configuration Management

### Environment-based Config

```typescript
// .env.development
NODE_ENV=development
DB_HOST=localhost
REDIS_HOST=localhost

// .env.production
NODE_ENV=production
DB_HOST=production-db.rds.amazonaws.com
REDIS_HOST=production-redis.cache.amazonaws.com
```

### Feature Flags (Future)

```typescript
// For gradual rollout
const features = {
  autoCashout: process.env.FEATURE_AUTO_CASHOUT === 'true',
  chat: process.env.FEATURE_CHAT === 'true',
  tournaments: process.env.FEATURE_TOURNAMENTS === 'true',
};
```

---

**Last Updated**: 2024-11-04
**Version**: 1.0.0
**Maintained by**: Ricardo
