# Pin Puzzle Game - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# First time setup
npm install

# Development
npm run dev          # Start dev server at http://localhost:5173

# Production
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/main.ts` | Entry point, UI integration |
| `src/core/engine.ts` | Game loop, state, input |
| `src/core/physics.ts` | Physics simulation |
| `src/core/renderer.ts` | Canvas rendering |
| `src/data/levels.json` | All 20 level definitions |
| `src/types.ts` | TypeScript type definitions |
| `index.html` | Game HTML with embedded styles |

## 📚 Documentation

| Guide | Use When |
|-------|----------|
| `README.md` | Getting started, overview |
| `docs/PRD-Engine-Stack-Decision.md` | Understanding tech choices |
| `docs/Deployment-Guide.md` | Deploying to web |
| `docs/Playtest-Protocol.md` | Running playtests |
| `docs/Go-NoGo-Checklist.md` | Deciding Phase 2 readiness |
| `docs/Level-Design-Guide.md` | Creating/editing levels |
| `docs/Phase-1-Summary.md` | Complete implementation details |

## 🎮 Game Mechanics

**Controls:**
- Click/tap pin to pull it
- Click "Reset Level" to restart
- Click "Next Level" after winning
- Click "Export Playtest Data" to download metrics

**Physics:**
- Water flows naturally (blue particles)
- Lava moves slowly (orange/red particles)
- Water + Lava = Steam (gray particles rise)
- Water reaching treasure = WIN
- Lava reaching treasure = LOSE

## 📊 Level Categories

| Levels | Type | Pins | Target Time | Completion Target |
|--------|------|------|-------------|-------------------|
| 1-3 | Tutorial | 1-2 | 30-60s | 95%+ |
| 4-7 | Easy | 3 | 45-90s | 90%+ |
| 8-12 | Medium | 3-4 | 60-140s | 80%+ |
| 13-17 | Hard | 4 | 90-180s | 70%+ |
| 18-20 | Master | 5-6 | 120-240s | 60%+ |

## 🧪 Playtest Success Criteria

### Critical (ALL must pass)
- ✅ 90%+ complete tutorial unaided
- ✅ Enjoyment ≥ 7/10
- ✅ 80%+ complete 15+ levels
- ✅ 70%+ would continue

### Important (3/4 must pass)
- ✅ 80%+ rate difficulty "Just Right"
- ✅ Clarity ≥ 4/5
- ✅ Physics realism ≥ 3.5/5
- ✅ NPS ≥ 7/10

## 🚀 Deployment Quick Steps

### Netlify (Recommended)
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

### Vercel
```bash
npm install -g vercel
vercel
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
# Add to package.json: "deploy": "npm run build && gh-pages -d dist"
npm run deploy
```

## 🔧 Editing Levels

Edit `src/data/levels.json`:

```json
{
  "id": 1,
  "title": "Level Name",
  "description": "Instructions",
  "targetTime": 60,
  "pins": [
    {"id": 1, "x": 400, "y": 200, "angle": 1.57, "length": 100}
  ],
  "chambers": [
    {"x": 350, "y": 100, "width": 100, "height": 100, 
     "type": "water", "particleCount": 50}
  ],
  "treasure": {"x": 400, "y": 450}
}
```

**Angles**: 0=right, 1.57=down, 3.14=left, 4.71=up
**Types**: "water", "lava", "empty"

## 📈 Metrics Tracked

- Time per level (seconds)
- Reset count per level
- Pin pull sequence (IDs in order)
- Success/failure per level
- Anonymous player ID

Export format: JSON file downloadable from game

## 🐛 Troubleshooting

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Types error:**
```bash
npm run build  # TypeScript will show errors
# Fix errors in indicated files
```

**Dev server issues:**
```bash
# Kill any process on port 5173
lsof -ti:5173 | xargs kill -9
npm run dev
```

**Canvas not showing:**
- Check browser console for errors
- Verify Canvas2D is supported
- Try different browser

## 📞 Phase 1 Status

**✅ COMPLETE - Ready for deployment and playtesting**

**Next Actions:**
1. Deploy to hosting platform
2. Recruit 5+ playtesters
3. Collect playtest data
4. Analyze results
5. Make Phase 2 decision

## 🎯 Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Bundle Size | < 200 KB | 5.76 KB ✅ |
| Load Time | < 2s | < 1s ✅ |
| Frame Rate | 60 FPS | 60 FPS ✅ |
| Build Time | Fast | < 1s ✅ |

## 📦 Tech Stack

- **Language**: TypeScript
- **Build**: Vite 5.x
- **Runtime**: Browser (Canvas2D)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Deployment**: Static hosting

## 🔗 Useful Links

- Vite Docs: https://vitejs.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

---

**Keep this card handy for quick reference during development and playtesting!**
