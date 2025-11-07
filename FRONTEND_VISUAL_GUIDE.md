# 🎨 Frontend Visual Design Guide

## 🎯 Design Philosophy

**Target**: Modern, sleek, gaming aesthetic with clear information hierarchy
**Style**: Dark theme with vibrant accent colors
**Animation**: Smooth, performant, attention-grabbing

---

## 🎨 Color Palette

### Primary Colors
```
Primary:    #667eea (Purple Blue)
Secondary:  #764ba2 (Deep Purple)
Accent:     #f59e0b (Amber)
Success:    #10b981 (Emerald)
Danger:     #ef4444 (Red)
Warning:    #f59e0b (Amber)
```

### Background Colors
```
Dark-900:   #0f172a (Darkest)
Dark-800:   #1e293b
Dark-700:   #334155
Dark-600:   #475569
```

### Text Colors
```
Primary:    #f1f5f9 (Almost white)
Secondary:  #cbd5e1 (Light gray)
Muted:      #64748b (Gray)
```

### Status Colors
```
Flying:     #10b981 (Green) - Game active
Betting:    #f59e0b (Amber) - Accepting bets
Crashed:    #ef4444 (Red) - Game ended
```

---

## 📐 Layout Specifications

### Desktop Layout (1920x1080)

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER (80px height)                                          │
│  ┌──────┐  Balance: $1,234.56    👤 Player1    ⚙️ Settings    │
│  │ LOGO │                                                       │
│  └──────┘                                                       │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────┐  ┌────────────────────┐  │
│  │                                 │  │                    │  │
│  │                                 │  │   BET CONTROLS     │  │
│  │     PIXI GAME CANVAS            │  │                    │  │
│  │     (1200x600px)                │  │   Bet Amount:      │  │
│  │                                 │  │   ┌──────────────┐ │  │
│  │   ┌─────────────────────────┐   │  │   │    $100      │ │  │
│  │   │  Multiplier: 2.45x      │   │  │   └──────────────┘ │  │
│  │   │  FLYING! 🚀              │   │  │                    │  │
│  │   └─────────────────────────┘   │  │   Quick Bets:      │  │
│  │                                 │  │   [10] [50] [100]  │  │
│  │                                 │  │   [500] [1000]     │  │
│  │                                 │  │                    │  │
│  │                                 │  │   ┌──────────────┐ │  │
│  └─────────────────────────────────┘  │   │ PLACE BET    │ │  │
│                                        │   └──────────────┘ │  │
│  ┌─────────────────────────────────┐  │                    │  │
│  │  ACTIVE BETS                    │  │   Auto Cashout:    │  │
│  │  ┌───────────────────────────┐  │  │   [ ] Enable      │  │
│  │  │ Player1  $100   2.3x ✓    │  │  │   At: [  2.00x ]  │  │
│  │  │ Player2  $50    -         │  │  │                    │  │
│  │  │ Player3  $200   -         │  │  └────────────────────┘  │
│  │  │ Player4  $75    1.8x ✓    │  │                          │
│  │  └───────────────────────────┘  │  ┌────────────────────┐  │
│  └─────────────────────────────────┘  │  ROUND HISTORY     │  │
│                                        │                    │  │
│  ┌─────────────────────────────────┐  │  #101 2.56x 🔴     │  │
│  │  MY STATS                       │  │  #100 1.87x 🟢     │  │
│  │  Total Wagered:  $5,000        │  │  #099 3.14x 🔴     │  │
│  │  Total Won:      $5,500        │  │  #098 1.23x 🟢     │  │
│  │  Profit:         +$500 (+10%)  │  │  #097 5.67x 🔴     │  │
│  │  Win Rate:       52%           │  │  #096 2.01x 🟢     │  │
│  └─────────────────────────────────┘  └────────────────────┘  │
│                                                                 │
├────────────────────────────────────────────────────────────────┤
│  FOOTER (60px height)                                          │
│  🎲 Provably Fair  |  📊 Statistics  |  🏆 Leaderboard        │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Layout (375x812 - iPhone)

```
┌───────────────────┐
│  ⚙️  LOGO  👤 💰  │
├───────────────────┤
│                   │
│   GAME CANVAS     │
│   (375x280px)     │
│                   │
│  ┌─────────────┐  │
│  │  2.45x      │  │
│  │  FLYING! 🚀  │  │
│  └─────────────┘  │
│                   │
├───────────────────┤
│  BET CONTROLS     │
│  ┌─────────────┐  │
│  │   $100      │  │
│  └─────────────┘  │
│  [10][50][100]    │
│  ┌─────────────┐  │
│  │ PLACE BET   │  │
│  └─────────────┘  │
├───────────────────┤
│  📋 Bets  📜 Hist │
│  (Tabs)           │
│  ┌─────────────┐  │
│  │ Player1 $100│  │
│  │ Player2 $50 │  │
│  └─────────────┘  │
└───────────────────┘
```

---

## 🎮 PixiJS Game Canvas Design

### Visual Elements

#### 1. Background
- **Dark gradient**: From #0f172a to #1e293b
- **Grid lines**: Subtle white lines (opacity 0.1)
- **Stars/particles**: Slow moving background particles

#### 2. Rocket/Plane Sprite
```
Position: Starts bottom-left, moves up-right
Size: 80x80px
Animation: 
  - Idle: Slight bobbing (±2px)
  - Flying: Trail effect, rotation based on angle
  - Crash: Explosion particles, fade out
Asset: rocket.png or plane.png
```

#### 3. Multiplier Graph
```
Line Style:
  - Color: Gradient from #10b981 to #f59e0b
  - Width: 4px
  - Glow: 6px blur, same color
  - Smooth: Bezier curves

Points:
  - Every 100ms
  - Max 100 points visible
  - Auto-scroll horizontally

Grid:
  - X-axis: Time (0s, 5s, 10s, 15s)
  - Y-axis: Multiplier (1.0x, 2.0x, 3.0x, 5.0x, 10.0x)
```

#### 4. Multiplier Display
```
┌─────────────────────────┐
│      2.45x              │
│      ↗️ FLYING!          │
└─────────────────────────┘

Font: Bold, 72px
Color: White with glow
Position: Top-center
Animation: 
  - Scale pulse on increment
  - Color shift: green → yellow → red
  - Crash: Red flash + shake
```

#### 5. Particle Effects

**Launch Particles:**
- Smoke trails from rocket
- Sparks on ignition
- Fade out over 1 second

**Flight Particles:**
- Continuous trail
- 20 particles per second
- Velocity based on multiplier

**Crash Particles:**
- Explosion burst (50 particles)
- Radial spread
- Colors: Red, orange, yellow
- Duration: 1.5 seconds

---

## 🎨 UI Component Designs

### 1. BetControls Component

```
┌───────────────────────────────┐
│  BET CONTROLS                 │
├───────────────────────────────┤
│                               │
│  Bet Amount                   │
│  ┌─────────────────────────┐  │
│  │  $    100.00           │  │
│  └─────────────────────────┘  │
│                               │
│  Quick Amounts                │
│  ┌────┐ ┌────┐ ┌────┐       │
│  │ 10 │ │ 50 │ │100 │       │
│  └────┘ └────┘ └────┘       │
│  ┌────┐ ┌────┐              │
│  │500 │ │1000│              │
│  └────┘ └────┘              │
│                               │
│  ┌─────────────────────────┐  │
│  │    🎲 PLACE BET         │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ ☑️  Auto Cashout        │  │
│  │    At: 2.00x            │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘

States:
- Betting: Green button, enabled
- Flying: Yellow cashout button
- Crashed: Disabled, gray
```

### 2. ActiveBets Component

```
┌───────────────────────────────┐
│  ACTIVE BETS (24)             │
├───────────────────────────────┤
│  ┌─────────────────────────┐  │
│  │ 👤 Player1              │  │
│  │ 💰 $100.00              │  │
│  │ 📈 2.35x  ✅ Cashed Out │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 👤 Player2              │  │
│  │ 💰 $50.00               │  │
│  │ ⏳ Waiting...           │  │
│  └─────────────────────────┘  │
│                               │
│  ┌─────────────────────────┐  │
│  │ 👤 YOU (Player3)        │  │
│  │ 💰 $200.00              │  │
│  │ 📈 2.35x  ⏳ Flying     │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘

Colors:
- Own bet: Highlighted with border
- Cashed out: Green background
- Waiting: Yellow/amber
- Lost: Red background (after crash)
```

### 3. History Component

```
┌───────────────────────────────┐
│  ROUND HISTORY                │
├───────────────────────────────┤
│  #101  2.56x  🔴             │
│  #100  1.87x  🟢             │
│  #099  3.14x  🔴             │
│  #098  1.23x  🟢             │
│  #097  5.67x  🔴             │
│  #096  2.01x  🟢             │
│  #095  1.45x  🟢             │
│  #094  8.92x  🔴             │
│  #093  1.98x  🟢             │
│  #092  3.33x  🔴             │
└───────────────────────────────┘

Color Coding:
- 🟢 < 2.0x (Common)
- 🟡 2.0x - 5.0x (Uncommon)
- 🔴 > 5.0x (Rare)

Click to expand:
Shows detailed stats, bets, winners
```

### 4. Stats Panel

```
┌───────────────────────────────┐
│  YOUR STATISTICS              │
├───────────────────────────────┤
│                               │
│  Total Bets:     150          │
│  ───────────────────────────  │
│  Total Wagered:  $5,000       │
│  Total Won:      $5,500       │
│  Profit:         +$500        │
│  ROI:            +10.0%       │
│  ───────────────────────────  │
│  Win Rate:       52%          │
│  Avg Cashout:    2.14x        │
│  Biggest Win:    $1,250       │
│  ───────────────────────────  │
│                               │
│  📊 Performance Graph         │
│  ┌─────────────────────────┐  │
│  │   ╱╲    ╱╲              │  │
│  │  ╱  ╲  ╱  ╲   ╱╲        │  │
│  │ ╱    ╲╱    ╲ ╱  ╲       │  │
│  └─────────────────────────┘  │
│                               │
└───────────────────────────────┘
```

---

## 🎬 Animations & Transitions

### 1. Round Transitions

**New Round Start:**
```
1. Fade out old multiplier (300ms)
2. Show "BETTING PHASE" (scale in, 500ms)
3. Countdown timer (5, 4, 3, 2, 1)
4. "GO!" flash
5. Rocket appears with launch animation
```

**Flying Phase:**
```
1. Rocket lifts off (ease-out, 500ms)
2. Graph starts drawing
3. Multiplier starts counting
4. Particle trail activates
5. Background music intensifies
```

**Crash:**
```
1. Screen shake (200ms)
2. Explosion particles burst
3. Red flash overlay (300ms)
4. Multiplier turns red + scale up
5. "CRASHED!" text appears
6. Results summary (after 2s)
```

### 2. Button Animations

**Hover:**
- Scale: 1.0 → 1.05 (150ms ease-out)
- Shadow: Increase blur
- Glow: Increase intensity

**Click:**
- Scale: 1.0 → 0.95 → 1.0 (300ms)
- Haptic feedback (mobile)
- Sound effect

**Disabled:**
- Opacity: 0.5
- Grayscale filter
- No hover effects

### 3. Number Animations

**Multiplier Count:**
- Increment every 100ms
- Ease-in-out interpolation
- Scale pulse on each increment
- Color transition (green → yellow → red)

**Balance Update:**
- Count up/down animation (1 second)
- Glow effect on change
- Green for wins, red for losses

### 4. List Animations

**Bet Added:**
- Slide in from top (300ms)
- Fade in opacity
- Highlight flash (500ms)

**Bet Cashout:**
- Background color change (green)
- Scale pulse
- Check mark animation

---

## 🔊 Sound Design

### Sound Effects

**Game Sounds:**
```
1. bet_placed.mp3       - Chip sound
2. rocket_launch.mp3    - Whoosh + engine
3. multiplier_tick.mp3  - Subtle beep (pitch increases)
4. cashout.mp3          - Cha-ching!
5. crash.mp3            - Explosion + alarm
6. button_click.mp3     - UI feedback
7. win.mp3              - Victory fanfare
8. lose.mp3             - Sad trombone
```

**Background Music:**
```
1. game_ambient.mp3     - Looping tension music
   - Low intensity during betting
   - Increases during flying
   - Peaks near typical crash points
2. menu_music.mp3       - Calm lobby music
```

**Volume Levels:**
- Master: 0-100%
- SFX: 0-100%
- Music: 0-100%
- Mute toggle

---

## 📱 Responsive Breakpoints

### Desktop (1920px+)
- Full layout as shown
- All panels visible
- Game canvas: 1200x600px

### Laptop (1366px)
- Slightly compressed layout
- Game canvas: 1000x500px
- Reduce padding

### Tablet (768px)
- Stack panels vertically
- Game canvas: 700x400px
- Collapsible history/stats

### Mobile (375px)
- Single column
- Game canvas: 375x280px
- Tabs for bets/history
- Floating bet button
- Simplified controls

---

## ♿ Accessibility

### Keyboard Navigation
- Tab order: Bet input → Quick bets → Place bet → Cashout
- Enter to confirm bet
- Escape to cancel/close modals
- Arrow keys for amount adjustment

### Screen Readers
- ARIA labels on all interactive elements
- Live region for multiplier updates
- Status announcements (betting, flying, crashed)
- Button state descriptions

### Color Blindness
- Don't rely solely on color
- Use icons + text
- Patterns for different states
- High contrast mode option

### Reduced Motion
- Respect `prefers-reduced-motion`
- Disable particle effects
- Reduce animation speed
- Keep core functionality

---

## 🎯 Performance Targets

### PixiJS Canvas
- 60 FPS stable
- < 100ms input lag
- < 50MB memory usage
- Efficient particle culling

### React UI
- < 100ms interaction response
- Virtualized lists for long histories
- Debounced inputs
- Lazy load images

### Network
- WebSocket latency < 100ms
- Reconnection < 2 seconds
- Optimistic UI updates
- Offline detection

---

## 🎨 Component Library Preview

### Button Variants
```tsx
<Button variant="primary">Place Bet</Button>
<Button variant="success">Cash Out</Button>
<Button variant="danger">Cancel</Button>
<Button variant="ghost">Settings</Button>
<Button size="sm">Small</Button>
<Button size="lg" loading>Loading...</Button>
<Button disabled>Disabled</Button>
```

### Input Variants
```tsx
<Input type="number" prefix="$" />
<Input type="text" icon={<SearchIcon />} />
<Input error="Invalid amount" />
<Input success="Valid!" />
```

### Card Variants
```tsx
<Card>Basic Card</Card>
<Card variant="elevated">Elevated</Card>
<Card variant="outlined">Outlined</Card>
<Card hover>Hoverable</Card>
```

---

## 🎭 Theme Customization

```typescript
// Custom theme configuration
export const customTheme = {
  // Override default colors
  colors: {
    primary: '#667eea',
    // ... more colors
  },
  
  // Custom game visuals
  game: {
    rocketColor: '#667eea',
    graphColor: ['#10b981', '#f59e0b'],
    particleCount: 20,
    effectsIntensity: 'high',
  },
  
  // Custom sounds
  sounds: {
    enabled: true,
    volume: {
      master: 0.8,
      sfx: 1.0,
      music: 0.5,
    }
  }
};
```

---

## 📚 Additional Resources

### Design Tools
- **Figma**: UI mockups
- **Spline**: 3D elements (optional)
- **After Effects**: Animation references
- **Rive**: Interactive animations

### Inspiration
- Aviator by Spribe
- Bustabit
- Crash games on Stake.com
- Roobet

### Assets
- Rocket sprites: itch.io
- Particle effects: Kenney.nl
- Sound effects: Freesound.org
- Music: Incompetech

---

**This visual guide provides comprehensive design specifications for building a polished, professional Crash Game frontend! 🎨🚀**
