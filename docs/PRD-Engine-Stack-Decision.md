# Product Requirements Document: Engine/Stack Decision

## Executive Summary

This document outlines the technical stack selection for the Pin Puzzle Game, justifying the choice of a custom TypeScript + WebGL implementation over alternative solutions like Unity or Godot.

## Requirements Analysis

### Core Requirements

1. **Cross-Platform Support**: Web (primary), mobile web, potential native builds
2. **Physics Simulation**: Custom fluid dynamics for water/lava with realistic behavior
3. **Developer Agility**: Rapid iteration and prototyping capabilities
4. **Security**: Secure client-side execution, no server dependencies for core gameplay
5. **Performance**: 60 FPS gameplay with fluid physics simulations
6. **Long-term UX**: Modern, responsive, accessible interface

### Stack Comparison

#### Option 1: Unity

**Pros:**

- Mature physics engine
- Rich tooling and asset ecosystem
- Strong mobile support

**Cons:**

- WebGL builds are large (5-10 MB minimum)
- Licensing concerns for revenue
- Overkill for 2D puzzle mechanics
- Slower iteration for web deployment
- Requires engine-specific knowledge

#### Option 2: Godot

**Pros:**

- Open source and free
- Good 2D support
- Lighter WebGL exports than Unity

**Cons:**

- Less mature web export
- Smaller community/resources
- Custom shaders needed for fluid effects
- Still overhead for simple 2D puzzle

#### Option 3: Custom TypeScript + WebGL/Canvas (RECOMMENDED)

**Pros:**

- **Zero installation barrier**: Instant play in any browser
- **Minimal bundle size**: ~100-200 KB vs 5+ MB
- **Maximum agility**: Instant hot-reload development
- **Full control**: Custom physics tuned exactly for our mechanics
- **Modern web stack**: TypeScript, Vite, standard tooling
- **Easy deployment**: Static hosting (Netlify, Vercel, GitHub Pages)
- **No licensing fees**: MIT/Apache libraries
- **Security**: Standard web security model
- **Accessible**: Built with web accessibility in mind
- **Future-proof**: Progressive Web App capabilities

**Cons:**

- Custom physics implementation required
- No built-in editor (use JSON for levels)
- Need to build own tooling

## Decision: TypeScript + WebGL/Canvas2D

### Justification

1. **Target Audience Focus**: Web-first approach means zero friction for players
2. **Rapid Prototyping**: Modern web tooling (Vite) enables instant feedback loops
3. **Physics Fit**: Our fluid mechanics are simple enough (2D top-down) that custom implementation is optimal
4. **Bundle Size**: Critical for user retention - sub-second load times
5. **Development Velocity**: Team JavaScript/TypeScript expertise accelerates development
6. **Deployment Simplicity**: CI/CD to static hosting with zero infrastructure costs
7. **Playtesting**: Shareable URLs for instant feedback collection

### Technology Stack

#### Core Technologies

- **TypeScript**: Type-safe development
- **Vite**: Build tool with HMR (Hot Module Replacement)
- **Canvas2D/WebGL**: Rendering (Canvas2D for simplicity, WebGL if needed)

#### Libraries

- **Custom Physics**: Lightweight 2D physics for pins, water particles, lava viscosity
- **Particle System**: For water droplets, steam effects
- **Audio**: Web Audio API for SFX

#### Development Tools

- **ESLint**: Code quality
- **Prettier**: Code formatting
- **Jest**: Unit testing (if needed)

#### Hosting

- **Netlify/Vercel**: Free tier with instant deployments
- **GitHub Pages**: Alternative zero-cost option

### Implementation Architecture

```
src/
  core/
    engine.ts       # Game loop, update/render cycle
    physics.ts      # Physics simulation
    renderer.ts     # Canvas rendering
  entities/
    pin.ts          # Pin mechanics
    water.ts        # Water fluid simulation
    lava.ts         # Lava fluid simulation
    treasure.ts     # Player objective
  systems/
    level.ts        # Level loading and management
    input.ts        # Mouse/touch input
    audio.ts        # Sound effects
  ui/
    game-ui.ts      # UI controls (reset, replay)
    metrics.ts      # Playtest instrumentation
  data/
    levels.json     # Level definitions
```

### Risk Mitigation

**Risk**: Custom physics may be complex
**Mitigation**: Start with simple particle-based approach, iterate based on feel

**Risk**: Performance on low-end devices
**Mitigation**: Canvas2D primary, optimize particle counts, provide quality settings

**Risk**: No built-in editor
**Mitigation**: JSON-based levels are human-readable, can build simple editor later if needed

### Success Metrics

- Bundle size < 200 KB (gzipped)
- Load time < 2 seconds on 3G
- 60 FPS on mid-range devices (iPhone X, Galaxy S9 equivalent)
- Dev hot-reload < 100ms
- Deployment time < 2 minutes

## Conclusion

A custom TypeScript + WebGL/Canvas2D stack optimally balances all requirements:

- **UX**: Instant web access, fast loads, smooth performance
- **Cross-platform**: Works everywhere with a browser
- **Security**: Standard web security model
- **Developer Agility**: Modern tooling, instant iteration
- **Long-term**: Maintainable, extensible, no vendor lock-in

This decision prioritizes player experience and development velocity, both critical for Phase 1 validation of core gameplay mechanics.
