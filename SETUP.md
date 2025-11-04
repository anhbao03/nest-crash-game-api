# 🚀 Setup Guide

Complete setup guide for the Crash Game API backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **PostgreSQL** >= 14 ([Download](https://www.postgresql.org/download/))
- **Redis** >= 6 ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional
- **Docker** & **Docker Compose** (for easy database setup)

---

## 🔧 Installation

### 1. Clone Repository

```bash
git clone https://github.com/anhbao03/nest-crash-game-api.git
cd nest-crash-game-api
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- NestJS core and platform
- TypeORM and PostgreSQL driver
- Socket.io for WebSocket
- Redis client (ioredis)
- Validation libraries

---

## 🗄️ Database Setup

You have two options: **Docker** (recommended) or **Manual**.

### Option A: Using Docker (Recommended)

Docker Compose will automatically start PostgreSQL and Redis:

```bash
# Start databases
npm run docker:up

# Check if running
docker ps

# View logs
npm run docker:logs

# Stop databases
npm run docker:down
```

**Default credentials**:
- PostgreSQL: `postgres:postgres@localhost:5432/crash_game`
- Redis: `localhost:6379` (no password)

### Option B: Manual Installation

#### PostgreSQL Setup

1. **Install PostgreSQL** for your OS

2. **Create Database**:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE crash_game;

# Create user (optional)
CREATE USER crash_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crash_game TO crash_user;

# Exit
\q
```

3. **Update `.env`** with your credentials

#### Redis Setup

1. **Install Redis** for your OS

2. **Start Redis**:
```bash
# Linux/Mac
redis-server

# Or with Homebrew (Mac)
brew services start redis

# Windows
redis-server.exe
```

3. **Verify Redis is running**:
```bash
redis-cli ping
# Should return: PONG
```

---

## ⚙️ Configuration

### 1. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Edit `.env` File

Open `.env` and configure:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=crash_game

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Application Configuration
PORT=3000
NODE_ENV=development

# Game Configuration
BETTING_DURATION=5000    # 5 seconds
MIN_BET=10
MAX_BET=100000
HOUSE_EDGE=0.01          # 1%

# Security
JWT_SECRET=change-this-in-production
```

### 3. Database Migrations

TypeORM will automatically run migrations on startup (in development mode).

To manually run migrations:

```bash
# The app will auto-sync schema in development
npm run start:dev

# For production, disable synchronize and use migrations
```

---

## 🚀 Running the Application

### Development Mode

```bash
# Start with hot reload
npm run start:dev
```

The application will be available at:
- **HTTP API**: http://localhost:3000
- **WebSocket**: ws://localhost:3000/game
- **Health Check**: http://localhost:3000/health

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

Attach your debugger to port 9229.

---

## 🧪 Testing the Application

### 1. Check Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-04T10:30:00.000Z",
  "service": "crash-game-api",
  "version": "1.0.0"
}
```

### 2. Get Current Game State

```bash
curl http://localhost:3000/api/game/state
```

### 3. Test WebSocket Connection

Create a test file `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Crash Game Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>Crash Game WebSocket Test</h1>
  <div id="status">Connecting...</div>
  <div id="state"></div>
  <div id="multiplier"></div>
  
  <script>
    const socket = io('ws://localhost:3000/game');
    
    socket.on('connect', () => {
      document.getElementById('status').textContent = 'Connected!';
      socket.emit('get:state');
    });
    
    socket.on('game:state', (state) => {
      document.getElementById('state').textContent = 
        `Round #${state.roundNumber} - Status: ${state.status}`;
    });
    
    socket.on('multiplier:tick', (data) => {
      document.getElementById('multiplier').textContent = 
        `Multiplier: ${data.multiplier}x`;
    });
    
    socket.on('round:crash', (data) => {
      document.getElementById('multiplier').textContent = 
        `CRASHED at ${data.crashPoint}x`;
    });
  </script>
</body>
</html>
```

Open this file in your browser to test WebSocket connection.

---

## 📊 Database Verification

### Check Tables Created

```bash
# Connect to PostgreSQL
psql -U postgres -d crash_game

# List tables
\dt

# Should show:
# - users
# - rounds
# - bets

# View table structure
\d users
\d rounds
\d bets

# Check data
SELECT COUNT(*) FROM rounds;
SELECT * FROM rounds LIMIT 5;
```

### Redis Verification

```bash
# Connect to Redis
redis-cli

# Check keys
KEYS *

# Subscribe to events (in another terminal)
redis-cli
SUBSCRIBE round:*
SUBSCRIBE bet:*
SUBSCRIBE multiplier:*
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env
PORT=3001
```

#### 2. Database Connection Failed

**Error**: `ECONNREFUSED 127.0.0.1:5432`

**Solution**:
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `.env`
- Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql-*.log`

#### 3. Redis Connection Failed

**Error**: `Error: Redis connection to localhost:6379 failed`

**Solution**:
- Check Redis is running: `redis-cli ping`
- Start Redis: `redis-server`
- Check Redis logs

#### 4. TypeORM Sync Issues

**Error**: `QueryFailedError: relation "users" does not exist`

**Solution**:
```bash
# Ensure synchronize is enabled in development
# Check src/config/database.config.ts
synchronize: process.env.NODE_ENV === 'development',

# Restart the application
npm run start:dev
```

#### 5. WebSocket Connection Issues

**Error**: WebSocket fails to connect

**Solution**:
- Check CORS settings in `src/websocket/game.gateway.ts`
- Verify port 3000 is accessible
- Check firewall settings
- Try different transport: `transports: ['polling', 'websocket']`

---

## 🔍 Monitoring & Logs

### Application Logs

Logs are output to console by default:

```bash
# View logs in real-time
npm run start:dev

# Filter logs
npm run start:dev | grep "ERROR"
npm run start:dev | grep "GameEngine"
```

### Log Levels

The application uses NestJS logger with levels:
- `error` - Errors and exceptions
- `warn` - Warnings
- `log` - General information
- `debug` - Debug information
- `verbose` - Detailed information

### Database Query Logs

Enable in development (already configured):

```typescript
// src/config/database.config.ts
logging: process.env.NODE_ENV === 'development',
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use strong database passwords
- [ ] Enable PostgreSQL SSL/TLS
- [ ] Configure Redis authentication
- [ ] Set `NODE_ENV=production`
- [ ] Disable TypeORM `synchronize` in production
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting

---

## 🚢 Deployment

### Environment Setup

1. **Set Environment Variables**:
```bash
export NODE_ENV=production
export DB_HOST=your-production-db-host
export REDIS_HOST=your-production-redis-host
# ... set all other variables
```

2. **Build Application**:
```bash
npm run build
```

3. **Run with PM2** (recommended for production):
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name crash-game-api

# Setup auto-restart on system reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs crash-game-api
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main"]
```

Build and run:

```bash
# Build image
docker build -t crash-game-api .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name crash-game-api \
  crash-game-api
```

---

## 📈 Performance Tuning

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_rounds_number ON rounds(round_number);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_round ON bets(round_id);
CREATE INDEX idx_bets_status ON bets(status);

-- Analyze tables
ANALYZE users;
ANALYZE rounds;
ANALYZE bets;
```

### Redis Configuration

```bash
# Edit redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Node.js Configuration

```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 dist/main
```

---

## 🔄 Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild
npm run build

# Restart (with PM2)
pm2 restart crash-game-api

# Or without PM2
npm run start:prod
```

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

## 💬 Support

If you encounter issues:

1. Check this SETUP.md guide
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Check [API.md](./API.md) for API usage
4. Open an issue on GitHub

---

## 🎉 Next Steps

After successful setup:

1. ✅ Test all API endpoints
2. ✅ Test WebSocket events
3. ✅ Verify provably fair calculations
4. ✅ Monitor logs for errors
5. ✅ Set up your frontend client
6. ✅ Implement user authentication
7. ✅ Add monitoring and alerting

---

**Last Updated**: 2024-11-04
**Version**: 1.0.0
