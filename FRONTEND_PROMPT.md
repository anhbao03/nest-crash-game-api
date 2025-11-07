# 🎨 Frontend Development Prompt - Crash Game Client

## 📋 Project Overview

Develop a production-ready, scalable frontend application for the Crash Game using modern web technologies. The project should be structured as a **Turborepo monorepo** with clean architecture, reusable components, and optimized performance.

---

## 🏗️ Tech Stack Requirements

### Core Technologies
- **Monorepo**: Turborepo
- **Build Tool**: Vite 5.x
- **Framework**: React 18.x with TypeScript
- **Game Engine**: PixiJS v7.4.2
- **State Management**: Zustand or Redux Toolkit
- **Styling**: TailwindCSS + CSS Modules
- **WebSocket**: Socket.io-client
- **HTTP Client**: Axios
- **Animation**: GSAP or Framer Motion
- **UI Components**: shadcn/ui or custom components

### Additional Requirements
- **TypeScript**: Strict mode enabled
- **ESLint + Prettier**: Code quality
- **Husky + Lint-staged**: Pre-commit hooks
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Documentation**: Storybook for components

---

## 📦 Monorepo Structure (Turborepo)

```
crash-game-frontend/
├── apps/
│   ├── web/                          # Main web application
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── GamePage.tsx
│   │   │   │   ├── HistoryPage.tsx
│   │   │   │   ├── LeaderboardPage.tsx
│   │   │   │   └── ProfilePage.tsx
│   │   │   ├── layouts/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   └── GameLayout.tsx
│   │   │   └── routes/
│   │   │       └── index.tsx
│   │   ├── public/
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── docs/                         # Documentation site (optional)
│       └── Storybook configuration
│
├── packages/
│   ├── game-engine/                  # PixiJS Game Engine
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── Game.ts               # Main game class
│   │   │   ├── scenes/
│   │   │   │   ├── GameScene.ts      # Main game scene
│   │   │   │   └── LoadingScene.ts   # Loading scene
│   │   │   ├── managers/
│   │   │   │   ├── AssetManager.ts   # Asset loading & caching
│   │   │   │   ├── GraphManager.ts   # Multiplier graph
│   │   │   │   ├── ParticleManager.ts # Effects & animations
│   │   │   │   └── SoundManager.ts   # Audio management
│   │   │   ├── entities/
│   │   │   │   ├── Rocket.ts         # Rocket sprite
│   │   │   │   ├── Graph.ts          # Multiplier line
│   │   │   │   └── Explosion.ts      # Crash effect
│   │   │   ├── utils/
│   │   │   │   ├── ticker.ts
│   │   │   │   └── helpers.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui-components/                # Shared UI Components
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.test.tsx
│   │   │   │   │   └── Button.stories.tsx
│   │   │   │   ├── Card/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Toast/
│   │   │   │   └── BetControls/
│   │   │   │       ├── BetInput.tsx
│   │   │   │       ├── BetButton.tsx
│   │   │   │       └── CashoutButton.tsx
│   │   │   └── hooks/
│   │   │       ├── useToast.ts
│   │   │       └── useModal.ts
│   │   └── package.json
│   │
│   ├── websocket-client/             # WebSocket Client Package
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── WebSocketClient.ts    # Main WS client
│   │   │   ├── EventEmitter.ts       # Custom event emitter
│   │   │   ├── events/
│   │   │   │   ├── GameEvents.ts     # Game event types
│   │   │   │   └── handlers.ts       # Event handlers
│   │   │   ├── hooks/
│   │   │   │   ├── useWebSocket.ts
│   │   │   │   ├── useGameState.ts
│   │   │   │   └── useBetting.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   ├── api-client/                   # REST API Client
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── endpoints/
│   │   │   │   ├── game.ts           # Game API
│   │   │   │   ├── user.ts           # User API
│   │   │   │   └── stats.ts          # Statistics API
│   │   │   └── types/
│   │   │       └── index.ts
│   │   └── package.json
│   │
│   ├── store/                        # State Management
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── slices/
│   │   │   │   ├── gameSlice.ts      # Game state
│   │   │   │   ├── userSlice.ts      # User state
│   │   │   │   ├── bettingSlice.ts   # Betting state
│   │   │   │   └── historySlice.ts   # History state
│   │   │   └── hooks.ts
│   │   └── package.json
│   │
│   ├── utils/                        # Shared Utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── formatters.ts         # Number/date formatters
│   │   │   ├── validators.ts         # Input validators
│   │   │   ├── constants.ts          # App constants
│   │   │   └── helpers.ts
│   │   └── package.json
│   │
│   └── config/                       # Shared Configuration
│       ├── eslint-config/
│       ├── typescript-config/
│       └── tailwind-config/
│
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # PNPM workspace
└── README.md
```

---

## 🎮 PixiJS Game Engine Architecture

### 1. Main Game Class

```typescript
// packages/game-engine/src/Game.ts

import * as PIXI from 'pixi.js';
import { AssetManager } from './managers/AssetManager';
import { GraphManager } from './managers/GraphManager';
import { GameScene } from './scenes/GameScene';
import { LoadingScene } from './scenes/LoadingScene';

export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: number;
  antialias: boolean;
  resolution: number;
}

export class Game {
  private app: PIXI.Application;
  private assetManager: AssetManager;
  private graphManager: GraphManager;
  private currentScene: GameScene | LoadingScene | null = null;
  
  constructor(container: HTMLElement, config: GameConfig) {
    // Initialize PixiJS Application
    // Setup managers
    // Load initial scene
  }

  public async init(): Promise<void> {
    // Initialize game
    // Load assets
    // Start game loop
  }

  public updateMultiplier(value: number): void {
    // Update multiplier display and graph
  }

  public triggerCrash(crashPoint: number): void {
    // Crash animation
  }

  public reset(): void {
    // Reset for new round
  }

  public destroy(): void {
    // Cleanup
  }
}
```

### 2. Asset Manager (Lazy Loading + Caching)

```typescript
// packages/game-engine/src/managers/AssetManager.ts

export class AssetManager {
  private assets: Map<string, PIXI.Texture>;
  private sounds: Map<string, Howl>;
  private loadQueue: Set<string>;
  private cache: Map<string, any>;

  // Lazy loading
  public async loadAsset(key: string, url: string): Promise<PIXI.Texture> {
    // Check cache first
    // Load if not cached
    // Store in cache
  }

  // Preload critical assets
  public async preloadGameAssets(): Promise<void> {
    // Load rocket, background, effects
  }

  // Lazy load on-demand assets
  public async loadOnDemand(assetList: string[]): Promise<void> {
    // Load assets as needed
  }

  // Asset categories
  public getAssetsByCategory(category: 'game' | 'ui' | 'effects'): Map<string, any> {
    // Return filtered assets
  }

  // Clear unused assets
  public clearCache(except?: string[]): void {
    // Memory management
  }
}
```

### 3. Graph Manager (Multiplier Display)

```typescript
// packages/game-engine/src/managers/GraphManager.ts

export class GraphManager {
  private graphics: PIXI.Graphics;
  private points: Array<{x: number, y: number}> = [];
  private multiplierHistory: number[] = [];

  public addPoint(multiplier: number, timestamp: number): void {
    // Add point to graph
    // Update line
  }

  public drawGraph(): void {
    // Render smooth curve
    // With glow effect
  }

  public clear(): void {
    // Clear for new round
  }

  public animateCrash(): void {
    // Crash effect on graph
  }
}
```

### 4. Scene Management

```typescript
// packages/game-engine/src/scenes/GameScene.ts

export class GameScene extends PIXI.Container {
  private rocket: PIXI.Sprite;
  private multiplierText: PIXI.Text;
  private graph: GraphManager;
  private particles: ParticleManager;

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    // Setup scene elements
  }

  public update(delta: number): void {
    // Update animations
    // Update positions
  }

  public startFlying(): void {
    // Rocket animation
  }

  public crash(crashPoint: number): void {
    // Crash effects
  }
}
```

---

## 🔌 WebSocket Client Architecture

### 1. WebSocket Client Class

```typescript
// packages/websocket-client/src/WebSocketClient.ts

import { io, Socket } from 'socket.io-client';
import { EventEmitter } from './EventEmitter';
import { GameEvents } from './events/GameEvents';

export class WebSocketClient extends EventEmitter {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string) {
    super();
  }

  public connect(): void {
    // Establish connection
    // Setup event listeners
    // Handle reconnection
  }

  public disconnect(): void {
    // Clean disconnect
  }

  // Emit events
  public placeBet(data: PlaceBetData): void {
    this.socket?.emit('place:bet', data);
  }

  public cashout(userId: string): void {
    this.socket?.emit('cashout', { userId });
  }

  public getState(): void {
    this.socket?.emit('get:state');
  }

  // Private event handlers
  private setupListeners(): void {
    // Listen to all server events
    // Emit to application
  }
}
```

### 2. React Hooks for WebSocket

```typescript
// packages/websocket-client/src/hooks/useWebSocket.ts

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const wsClient = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    // Initialize WebSocket
    // Setup listeners
    // Cleanup on unmount
  }, [url]);

  return {
    isConnected,
    gameState,
    placeBet: (data: PlaceBetData) => wsClient.current?.placeBet(data),
    cashout: (userId: string) => wsClient.current?.cashout(userId),
  };
}
```

### 3. Game State Hook

```typescript
// packages/websocket-client/src/hooks/useGameState.ts

export function useGameState() {
  const { gameState } = useWebSocket(WS_URL);
  
  return {
    roundId: gameState?.roundId,
    roundNumber: gameState?.roundNumber,
    status: gameState?.status,
    multiplier: gameState?.currentMultiplier,
    crashPoint: gameState?.crashPoint,
    isFlying: gameState?.status === 'flying',
    isBetting: gameState?.status === 'betting',
  };
}
```

---

## 🎨 UI Component Requirements

### 1. Main Game Page Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Balance | Profile | Settings            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌───────────────────────────────┐  ┌─────────────────┐ │
│  │                               │  │                 │ │
│  │     PixiJS Game Canvas        │  │  Bet Controls   │ │
│  │   (Rocket, Graph, Effects)    │  │                 │ │
│  │                               │  │  - Bet Amount   │ │
│  │     Multiplier: 2.45x         │  │  - Bet Button   │ │
│  │     Status: FLYING!           │  │  - Cashout Btn  │ │
│  │                               │  │  - Auto Settings│ │
│  │                               │  │                 │ │
│  └───────────────────────────────┘  └─────────────────┘ │
│                                                           │
│  ┌───────────────────────────────┐  ┌─────────────────┐ │
│  │  Active Bets (Live)           │  │  Round History  │ │
│  │  - Player1: $100 (2.3x) ✓     │  │  #101: 2.56x    │ │
│  │  - Player2: $50  (-)          │  │  #100: 1.87x    │ │
│  │  - Player3: $200 (1.8x) ✓     │  │  #099: 3.14x    │ │
│  └───────────────────────────────┘  └─────────────────┘ │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  Footer: Stats | Provably Fair | Help                   │
└─────────────────────────────────────────────────────────┘
```

### 2. Core Components

#### BetControls Component
```typescript
// apps/web/src/components/BetControls/BetControls.tsx

interface BetControlsProps {
  disabled?: boolean;
  onPlaceBet: (amount: number) => void;
  onCashout: () => void;
  gameStatus: 'betting' | 'flying' | 'ended';
}

export function BetControls({ disabled, onPlaceBet, onCashout, gameStatus }: BetControlsProps) {
  // Bet amount input
  // Quick bet buttons (10, 50, 100, 500)
  // Place Bet / Cashout button logic
  // Auto-cashout settings
}
```

#### ActiveBets Component
```typescript
// apps/web/src/components/ActiveBets/ActiveBets.tsx

interface ActiveBetsProps {
  bets: PlayerBet[];
  currentMultiplier: number;
}

export function ActiveBets({ bets, currentMultiplier }: ActiveBetsProps) {
  // Real-time list of active bets
  // Show username, amount, cashout status
  // Highlight own bet
  // Auto-scroll to new bets
}
```

#### History Component
```typescript
// apps/web/src/components/History/History.tsx

export function History() {
  // Last 10 rounds
  // Crash point display
  // Visual representation (color-coded)
  // Click to view details
}
```

#### Stats Panel
```typescript
// apps/web/src/components/StatsPanel/StatsPanel.tsx

export function StatsPanel() {
  // Total wagered
  // Total won
  // Win rate
  // Biggest win
  // Recent performance graph
}
```

---

## 🎯 Key Features to Implement

### Phase 1: Core Gameplay (MVP)
- [x] PixiJS game canvas with rocket and graph
- [x] Real-time multiplier display
- [x] WebSocket connection
- [x] Bet placement
- [x] Cashout functionality
- [x] Active bets list
- [x] Round history
- [x] Connection status indicator

### Phase 2: Enhanced UX
- [ ] Sound effects (rocket launch, tick, crash)
- [ ] Background music with volume control
- [ ] Particle effects (smoke, explosion)
- [ ] Smooth animations (GSAP)
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design

### Phase 3: Advanced Features
- [ ] Auto-cashout settings
- [ ] Betting strategies (Martingale, etc.)
- [ ] Multi-bet (place multiple bets)
- [ ] Chat system
- [ ] Provably fair verification UI
- [ ] Statistics dashboard
- [ ] Leaderboard page
- [ ] User profile

### Phase 4: Optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Asset optimization
- [ ] Performance monitoring
- [ ] SEO optimization
- [ ] PWA support

---

## 🏗️ Base Project Requirements

### 1. Development Environment
```json
// package.json (root)
{
  "name": "crash-game-frontend",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "latest",
    "@types/node": "latest",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

### 2. TypeScript Configuration
```json
// packages/config/typescript-config/base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "jsx": "react-jsx",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. ESLint Configuration
```javascript
// packages/config/eslint-config/index.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'no-console': 'warn'
  }
};
```

### 4. TailwindCSS Configuration
```javascript
// packages/config/tailwind-config/index.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
      }
    }
  },
  plugins: []
};
```

### 5. Environment Variables
```env
# apps/web/.env

# API Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/game

# Feature Flags
VITE_ENABLE_CHAT=false
VITE_ENABLE_SOUND=true
VITE_ENABLE_ANIMATIONS=true

# Analytics (optional)
VITE_ANALYTICS_ID=

# Debug
VITE_DEBUG_MODE=true
```

### 6. CI/CD Configuration
```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run typecheck
      - run: pnpm run test
      - run: pnpm run build
```

---

## 📚 Additional Suggestions for Base Project

### 1. Documentation
- [ ] **README.md** in each package
- [ ] **CONTRIBUTING.md** - Contribution guidelines
- [ ] **ARCHITECTURE.md** - Frontend architecture
- [ ] **DESIGN_SYSTEM.md** - Design tokens and components
- [ ] **API_INTEGRATION.md** - Backend integration guide
- [ ] **Storybook** - Component documentation

### 2. Testing Strategy
```typescript
// Vitest config
// apps/web/vitest.config.ts

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx']
    }
  }
});
```

### 3. Performance Monitoring
```typescript
// apps/web/src/utils/performance.ts

export class PerformanceMonitor {
  public measureFPS(): void {
    // Track FPS
  }

  public measureLoadTime(): void {
    // Track page load
  }

  public trackWebSocketLatency(): void {
    // Track WS response time
  }
}
```

### 4. Error Boundary
```typescript
// apps/web/src/components/ErrorBoundary.tsx

export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error tracking service
    // Show user-friendly message
  }
}
```

### 5. Internationalization (i18n)
```typescript
// packages/utils/src/i18n.ts

export const translations = {
  en: {
    game: {
      placeBet: 'Place Bet',
      cashout: 'Cash Out',
      betting: 'Betting Phase',
      flying: 'Flying!',
      crashed: 'Crashed!'
    }
  },
  vi: {
    game: {
      placeBet: 'Đặt Cược',
      cashout: 'Rút Tiền',
      betting: 'Đang Nhận Cược',
      flying: 'Đang Bay!',
      crashed: 'Nổ Rồi!'
    }
  }
};
```

### 6. Theme System
```typescript
// packages/ui-components/src/theme/index.ts

export const theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    // ... more colors
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  }
};
```

### 7. Analytics Integration
```typescript
// apps/web/src/utils/analytics.ts

export class Analytics {
  public trackEvent(event: string, data?: any): void {
    // Google Analytics
    // Mixpanel
    // Custom analytics
  }

  public trackBet(amount: number): void {
    this.trackEvent('bet_placed', { amount });
  }

  public trackCashout(multiplier: number, payout: number): void {
    this.trackEvent('cashout', { multiplier, payout });
  }
}
```

### 8. Security Best Practices
- [ ] **XSS Protection**: Sanitize user inputs
- [ ] **CSRF Protection**: Token validation
- [ ] **Rate Limiting**: Client-side throttling
- [ ] **Secure WebSocket**: WSS in production
- [ ] **Content Security Policy**: CSP headers
- [ ] **Input Validation**: Validate all inputs

### 9. Accessibility (a11y)
- [ ] **Keyboard Navigation**: Full keyboard support
- [ ] **Screen Reader**: ARIA labels
- [ ] **Color Contrast**: WCAG AA compliance
- [ ] **Focus Management**: Visible focus states
- [ ] **Alternative Text**: Image descriptions

### 10. SEO & Meta Tags
```tsx
// apps/web/src/components/Head.tsx

export function Head() {
  return (
    <Helmet>
      <title>Crash Game - Real-time Multiplayer Betting</title>
      <meta name="description" content="..." />
      <meta property="og:title" content="..." />
      <meta property="og:image" content="..." />
    </Helmet>
  );
}
```

---

## 🎯 Implementation Priority

### Sprint 1 (Week 1-2): Core Setup
1. Setup Turborepo structure
2. Initialize packages (game-engine, websocket-client, ui-components)
3. PixiJS basic integration
4. WebSocket connection
5. Basic UI layout

### Sprint 2 (Week 3-4): Game Functionality
1. PixiJS game scenes
2. Asset manager with lazy loading
3. Graph rendering
4. Multiplier display
5. Bet placement

### Sprint 3 (Week 5-6): Enhanced Features
1. Animations and effects
2. Sound system
3. Active bets display
4. History component
5. Responsive design

### Sprint 4 (Week 7-8): Polish & Optimization
1. Testing (unit + e2e)
2. Performance optimization
3. Error handling
4. Documentation
5. Deployment

---

## 📖 Development Guidelines

### Code Style
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused
- Use TypeScript strict mode
- Write self-documenting code

### Git Workflow
- Feature branches: `feature/bet-controls`
- Conventional commits: `feat: add bet controls component`
- PR reviews required
- CI must pass

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- FPS: 60fps stable
- WebSocket latency: < 100ms
- Bundle size: < 500KB (main chunk)

---

## 🚀 Getting Started Command

```bash
# Initialize project
pnpm create turbo@latest crash-game-frontend

# Navigate to project
cd crash-game-frontend

# Install dependencies
pnpm install

# Add packages
cd packages
mkdir game-engine websocket-client ui-components store api-client utils

# Start development
pnpm dev

# Access app
# http://localhost:5173
```

---

## 📝 Final Notes

This prompt provides a comprehensive blueprint for building a production-ready, scalable frontend for the Crash Game. The architecture is designed to be:

- **Maintainable**: Clean code, clear separation of concerns
- **Scalable**: Monorepo structure, reusable packages
- **Performant**: Optimized assets, lazy loading, code splitting
- **Testable**: Unit tests, integration tests, e2e tests
- **Documented**: Comprehensive docs, Storybook

**Key Success Factors:**
1. Start with solid architecture
2. Implement core features first
3. Test thoroughly
4. Optimize progressively
5. Document continuously

**Ready to build an amazing Crash Game frontend! 🚀**
