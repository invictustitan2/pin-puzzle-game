# Level Design Documentation

## Level Progression Philosophy

The 20 levels are designed with a carefully crafted difficulty curve that teaches mechanics progressively while maintaining player engagement.

## Level Categories

### Tutorial Levels (1-3)
**Goal**: Teach basic mechanics without frustration

| Level | Title | Concept | Pins | Target Time |
|-------|-------|---------|------|-------------|
| 1 | First Drop | Basic pin pulling | 1 | 30s |
| 2 | Avoid the Lava | Introduce lava danger | 2 | 45s |
| 3 | Water Wins | Water extinguishes lava | 2 | 60s |

**Design Notes:**
- Level 1: Single pin, direct path - teaches core mechanic
- Level 2: Two paths, one dangerous - teaches avoidance
- Level 3: Water neutralizes lava - teaches key interaction

### Easy Levels (4-7)
**Goal**: Build confidence with simple planning

| Level | Title | Concept | Pins | Target Time |
|-------|-------|---------|------|-------------|
| 4 | Left or Right? | Path choice | 3 | 60s |
| 5 | The Bridge | Use water strategically | 3 | 75s |
| 6 | Timing Matters | Pin pull order | 3 | 90s |
| 7 | The Funnel | Direct flow through obstacles | 3 | 75s |

**Design Notes:**
- Introduce planning: "Which pin first?"
- Multiple valid solutions possible
- Mistakes are recoverable

### Medium Levels (8-12)
**Goal**: Require multi-step thinking

| Level | Title | Concept | Pins | Target Time |
|-------|-------|---------|------|-------------|
| 8 | Double Trouble | Two water sources | 3 | 90s |
| 9 | The Maze | Navigate chambers | 3 | 120s |
| 10 | Cascade | Sequential drops | 3 | 100s |
| 11 | The Split | Divide resources | 4 | 120s |
| 12 | The Chamber | Fill and manage | 3 | 140s |

**Design Notes:**
- Increased chamber complexity
- More pins = more planning required
- Strategic resource management

### Hard Levels (13-17)
**Goal**: Test mastery of mechanics

| Level | Title | Concept | Pins | Target Time |
|-------|-------|---------|------|-------------|
| 13 | Precision Drop | Exact timing crucial | 4 | 150s |
| 14 | The Gauntlet | Multiple obstacles | 4 | 160s |
| 15 | Multi-Step | Long-term planning | 4 | 180s |
| 16 | The Reservoir | Resource management | 4 | 170s |
| 17 | Chain Reaction | Cascade sequences | 4 | 160s |

**Design Notes:**
- Require understanding of physics behavior
- Single wrong move can fail level
- Reward careful observation

### Master Levels (18-20)
**Goal**: Ultimate challenge combining all mechanics

| Level | Title | Concept | Pins | Target Time |
|-------|-------|---------|------|-------------|
| 18 | The Ultimate Test | Everything combined | 5 | 200s |
| 19 | Patience | Precise sequential timing | 5 | 210s |
| 20 | Grand Finale | Final challenge | 6 | 240s |

**Design Notes:**
- Most complex layouts
- Multiple stages of planning
- Satisfying final challenge

## Level Design Patterns

### Pattern 1: Direct Path
**Used in**: Levels 1, 4
- One or two chambers
- Clear visual flow
- Teaches basic mechanics

### Pattern 2: Choice
**Used in**: Levels 2, 4, 7
- Multiple paths available
- One correct choice
- Teaches decision-making

### Pattern 3: Neutralization
**Used in**: Levels 3, 5, 11, 17
- Water must extinguish lava
- Strategic resource use
- Teaches core interaction

### Pattern 4: Sequence
**Used in**: Levels 6, 9, 10, 13, 19
- Pin order matters
- Step-by-step thinking
- Teaches patience

### Pattern 5: Split/Combine
**Used in**: Levels 8, 11, 12, 16
- Multiple water sources
- Resource management
- Teaches advanced strategy

## JSON Level Structure

```json
{
  "id": 1,                           // Unique level identifier
  "title": "Level 1: First Drop",   // Display name
  "description": "Pull the pin!",    // Instruction text
  "targetTime": 30,                  // Target completion time (seconds)
  "pins": [                          // Pin definitions
    {
      "id": 1,                       // Pin identifier
      "x": 400,                      // X position on canvas
      "y": 200,                      // Y position on canvas
      "angle": 1.57,                 // Angle in radians (1.57 ≈ 90°)
      "length": 100                  // Pin length in pixels
    }
  ],
  "chambers": [                      // Chamber definitions
    {
      "x": 350,                      // X position
      "y": 100,                      // Y position
      "width": 100,                  // Width in pixels
      "height": 100,                 // Height in pixels
      "type": "water",               // "water", "lava", or "empty"
      "particleCount": 50            // Number of particles to spawn
    }
  ],
  "treasure": {                      // Treasure location
    "x": 400,                        // X position
    "y": 450                         // Y position
  }
}
```

## Design Guidelines

### Pin Placement
- Pins should be at chamber boundaries
- Typical angles:
  - 0° (0 rad): Horizontal right →
  - 90° (1.57 rad): Vertical down ↓
  - 180° (3.14 rad): Horizontal left ←
  - 270° (4.71 rad): Vertical up ↑
- Length typically 60-100 pixels

### Chamber Layout
- Standard chamber sizes: 100×70, 100×100, 100×150
- Leave space between chambers for pins
- Canvas is 800×600 pixels
- Keep important elements within 700×550 for safety

### Particle Counts
- Water chambers: 40-100 particles
  - Small puzzle: 40-60
  - Medium puzzle: 60-80
  - Large puzzle: 80-120
- Lava chambers: 30-70 particles
  - Less lava = easier to neutralize
  - More lava = requires more water
- Empty chambers: 0 particles

### Difficulty Tuning
**Easy Level Characteristics:**
- 1-2 pins
- Clear visual flow
- Obvious solution
- Forgiving timing

**Medium Level Characteristics:**
- 3-4 pins
- Multiple chambers
- Requires thinking ahead
- Order matters

**Hard Level Characteristics:**
- 4-5 pins
- Complex layouts
- Precise execution needed
- Multiple failure points

**Master Level Characteristics:**
- 5-6 pins
- Maximum complexity
- Multi-stage planning
- Showcase all mechanics

## Playtesting Metrics

### Expected Performance

| Level Type | Avg Completion Time | Acceptable Resets | Success Rate Target |
|------------|-------------------|------------------|-------------------|
| Tutorial | 30-60s | 0-1 | 95%+ |
| Easy | 45-90s | 1-3 | 90%+ |
| Medium | 60-140s | 2-5 | 80%+ |
| Hard | 90-180s | 3-7 | 70%+ |
| Master | 120-240s | 4-10 | 60%+ |

### Red Flags (Require Redesign)
- Completion rate < 50%
- Average resets > 10
- Average time > 2× target
- Multiple testers mention "unclear" or "unfair"

### Yellow Flags (Consider Adjustment)
- Completion rate 50-70%
- Average resets 7-10
- Average time 1.5-2× target
- Mixed feedback

## Iteration Process

1. **Initial Design**: Create level in JSON
2. **Self-Test**: Play level 5 times
3. **Adjust**: Fix obvious issues
4. **Internal Test**: 3-5 team members
5. **Refine**: Based on internal feedback
6. **External Test**: Real playtesters
7. **Final Tuning**: Address playtest data

## Level Editing Tips

### Common Adjustments After Playtesting

**If too hard:**
- Reduce lava particle count
- Increase water particle count
- Add more obvious visual cues
- Reduce number of pins
- Make chamber layout clearer

**If too easy:**
- Add decoy paths
- Increase lava obstacles
- Add more pins
- Reduce water resources
- Make success path less obvious

**If unclear:**
- Simplify chamber layout
- Reduce visual complexity
- Adjust pin positions for clarity
- Change pin angles to be more intuitive

### Testing Checklist for New Levels

- [ ] Level can be completed
- [ ] Multiple attempts tested
- [ ] No impossible situations
- [ ] Physics behaves as expected
- [ ] Pin collision detection works
- [ ] Treasure is reachable
- [ ] Visual layout is clear
- [ ] Target time is reasonable
- [ ] Difficulty matches intended tier

## Future Expansion Ideas

If Phase 1 is successful, consider:
- Collectible stars for time/reset performance
- Alternative solutions tracking
- Daily challenge levels
- User-generated content
- Level themes/environments
- New mechanics (portals, switches, etc.)

---

**Remember**: Phase 1 focuses on perfecting these 20 levels. Quality over quantity!
