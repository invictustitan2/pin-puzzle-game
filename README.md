# Pin Puzzle Game - Phase 1: Core Gameplay Validation

A physics-based pin puzzle game focused on player experience. This repository contains the Phase 1 implementation focused on establishing gameplay foundation and testability.

## 🎮 Game Concept

Pull pins to guide water to treasure while avoiding lava! Water extinguishes lava, creating steam and opening new paths. Master 20 handcrafted levels that progressively increase in complexity.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Playing the Game

1. Open your browser to the URL shown by `npm run dev` (typically `http://localhost:5173`)
2. Click or tap on pins to pull them
3. Guide water to the treasure chest
4. Avoid letting lava reach the treasure
5. Use water to extinguish lava and create safe paths

## 📋 Phase 1 Deliverables

### ✅ Completed

1. **PRD for Engine/Stack Decision** - `docs/PRD-Engine-Stack-Decision.md`
   - Evaluated Unity, Godot, and custom TypeScript+WebGL
   - Selected TypeScript + Canvas2D for optimal web performance and developer agility

2. **Core Game Mechanics**
   - Pin pulling with intuitive mouse/touch controls
   - Particle-based physics for water and lava
   - Water-lava interaction with steam effects
   - Realistic fluid dynamics (water flows naturally, lava is viscous)
   - Win/loss conditions with immediate feedback

3. **20 Handcrafted Levels** - `src/data/levels.json`
   - Levels 1-3: Tutorial basics (30-60s target)
   - Levels 4-10: Core mechanics (45-120s target)
   - Levels 11-17: Multi-step planning (120-180s target)
   - Levels 18-20: Master challenges (160-240s target)
   - Versioned JSON format for easy iteration

4. **Playable Demo**
   - Full web-based game with 20 levels
   - Clean UI with level info, stats, and controls
   - Reset and replay functionality
   - Level progression system

5. **Playtest Instrumentation**
   - Automatic metrics tracking (time, resets, pin pulls)
   - Session recording per level
   - Exportable JSON data for analysis
   - Anonymous player ID generation

6. **Documentation**
   - Playtest protocol with clear success criteria - `docs/Playtest-Protocol.md`
   - Feedback collection methodology
   - Analysis framework with go/no-go gates
   - Go/No-Go advancement checklist - `docs/Go-NoGo-Checklist.md`

## 🏗️ Architecture

### Technology Stack
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool with HMR
- **Canvas2D**: Rendering for optimal performance
- **Custom Physics**: Lightweight 2D physics engine tailored for puzzle mechanics

### Project Structure

```
src/
├── core/
│   ├── engine.ts      # Main game engine and loop
│   ├── physics.ts     # Physics simulation (gravity, collisions, interactions)
│   └── renderer.ts    # Canvas rendering (particles, pins, treasure)
├── data/
│   └── levels.json    # 20 handcrafted level definitions
├── types.ts           # TypeScript type definitions
├── main.ts           # Entry point and UI integration
└── style.css         # Minimal global styles

docs/
├── PRD-Engine-Stack-Decision.md    # Technical stack justification
├── Playtest-Protocol.md            # Testing methodology
└── Go-NoGo-Checklist.md           # Phase advancement criteria
```

## 🧪 Playtesting

### Running a Playtest

1. Deploy the game to a web host (Netlify, Vercel, or GitHub Pages)
2. Share the URL with testers
3. Follow the protocol in `docs/Playtest-Protocol.md`
4. Have testers click "Export Playtest Data" when finished
5. Analyze data using the criteria in the protocol

### Success Criteria (from Protocol)

**Critical Gates (ALL must pass):**
- 90%+ testers complete tutorial unaided
- Average enjoyment ≥ 7/10
- 80%+ complete 15+ levels
- 70%+ would continue playing

**Important Gates (3/4 must pass):**
- 80%+ rate difficulty as "Just Right"
- Average clarity ≥ 4/5
- Average physics realism ≥ 3.5/5
- Average NPS ≥ 7/10

### Analyzing Results

Playtest data exports to JSON with this structure:

```json
{
  "playerId": "player_abc123",
  "sessions": [
    {
      "levelId": 1,
      "startTime": "2025-12-26T00:00:00.000Z",
      "completionTime": 45.2,
      "resetCount": 2,
      "pinPullSequence": [1, 2],
      "success": true
    }
  ]
}
```

## 🎯 Design Philosophy

### Player Experience First
- **Zero friction**: No installation, instant play in browser
- **Clear feedback**: Immediate visual and gameplay response
- **Progressive learning**: Tutorial → Easy → Medium → Hard → Master
- **Satisfying mechanics**: Physics-based interactions feel natural and rewarding

### Development Principles
- **Rapid iteration**: Vite's HMR enables instant feedback
- **Data-driven design**: JSON levels for quick balancing
- **Measurable validation**: Instrumentation for objective assessment
- **Quality gates**: Clear criteria prevent premature feature expansion

## 🚦 Phase 1 to Phase 2 Advancement

Use `docs/Go-NoGo-Checklist.md` to determine readiness:

- **GO**: All critical gates pass, 3/4 important gates pass, no unresolved issues
- **NO-GO**: Iterate on identified problems, retest
- **PIVOT**: Fundamental issues require rethinking core mechanics

**Current Status**: Phase 1 implementation complete, ready for playtesting

## 🔧 Development

### Code Quality

```bash
# Lint TypeScript
npm run lint

# Format code
npm run format
```

### Performance Targets
- Bundle size: < 200 KB (gzipped)
- Load time: < 2s on 3G
- Frame rate: 60 FPS on mid-range devices
- Dev HMR: < 100ms

### Adding New Levels

Edit `src/data/levels.json`:

```json
{
  "id": 21,
  "title": "Level 21: New Challenge",
  "description": "Solve this puzzle!",
  "targetTime": 120,
  "pins": [...],
  "chambers": [...],
  "treasure": {"x": 400, "y": 500}
}
```

## 📊 Technical Implementation Highlights

### Physics Engine
- Gravity simulation with different densities (water vs. lava)
- Particle-particle collision and repulsion
- Wall collision detection with damping
- Water-lava interaction creates steam particles

### Rendering
- Particle system with type-based rendering
- Visual feedback for pin hover states
- Gradient effects for lava glow
- Win state animations

### Input Handling
- Mouse and touch support
- Hover detection for pins
- Click/tap to pull pins
- Responsive canvas sizing

## 🎨 Visual Design

- **Water**: Blue particles with natural flow behavior
- **Lava**: Orange/red particles with glow effect and viscous movement
- **Steam**: Gray particles that rise and dissipate
- **Pins**: Interactive with hover states
- **Treasure**: Golden chest with win animation

## 📝 License

MIT

## 🙏 Contributing

This is a Phase 1 validation project. Contributions should focus on:
- Bug fixes in core mechanics
- Playtest feedback and analysis
- Level balance suggestions
- Performance optimizations

Major feature additions should wait for Phase 2 after successful validation.

## 📞 Contact

For questions about the project structure or Phase 1 goals, see the documentation in `/docs`.

---

**Remember**: Phase 1 success is measured by player enjoyment and gameplay validation, not feature count. The goal is to perfect the core loop before expanding.
