# Playtest Protocol

## Objective
Validate core puzzle mechanics and ensure gameplay is intuitive, enjoyable, and appropriately challenging before proceeding to Phase 2.

## Test Environment Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Mouse or touchscreen device
- Quiet testing environment
- 30-45 minutes of uninterrupted time

### Preparation
1. Provide tester with game URL
2. Brief tester on basic concept: "You'll play a physics puzzle game where you pull pins to guide water to treasure while avoiding lava"
3. **Do not** provide detailed instructions - tutorial must be self-explanatory
4. Start metrics tracking automatically on first interaction

## Testing Protocol

### Phase 1: Unguided Tutorial (Levels 1-3)
**Goal**: Validate tutorial clarity

**Process**:
1. Tester plays levels 1-3 without any assistance
2. Observer notes:
   - Did tester understand mechanics without help?
   - Were any clarifying questions asked?
   - Time spent on each level
   - Number of resets per level

**Success Criteria**:
- ✅ Tester completes all 3 tutorial levels unaided
- ✅ No requests for clarification on basic mechanics
- ✅ Average time per level < 60 seconds

### Phase 2: Core Mechanics (Levels 4-10)
**Goal**: Validate basic puzzle difficulty curve

**Process**:
1. Tester continues through levels 4-10
2. Observer tracks:
   - Completion time per level
   - Number of resets per level
   - Signs of frustration or confusion
   - Moments of delight or "aha!"

**Success Criteria**:
- ✅ Tester completes levels within target times (see Level Targets below)
- ✅ Average resets per level: 1-3 (indicates challenge without frustration)
- ✅ No levels cause tester to get stuck for > 3 minutes

### Phase 3: Advanced Puzzles (Levels 11-20)
**Goal**: Validate multi-step puzzle design and satisfaction

**Process**:
1. Tester continues through levels 11-20
2. Observer tracks:
   - Completion time per level
   - Planning behavior (pauses before pulling pins)
   - Completion rate
   - Verbal feedback and body language

**Success Criteria**:
- ✅ Tester completes at least 80% of levels (16/20)
- ✅ Evidence of strategic thinking (pauses, careful observation)
- ✅ Tester continues voluntarily (doesn't ask to stop early)

## Level Target Times

| Level Range | Target Completion Time | Max Acceptable Resets |
|-------------|------------------------|----------------------|
| 1-3 (Tutorial) | 30-60s | 0-1 |
| 4-7 (Easy) | 45-90s | 1-3 |
| 8-12 (Medium) | 60-120s | 2-5 |
| 13-17 (Hard) | 90-180s | 3-7 |
| 18-20 (Very Hard) | 120-240s | 4-10 |

## Feedback Collection

### During Gameplay (Observer Notes)
- Facial expressions and body language
- Verbal reactions
- Mouse/touch interaction patterns
- Pauses and planning behavior
- Signs of confusion or frustration
- Moments of delight or satisfaction

### Post-Gameplay Survey (Required)

#### Enjoyment & Satisfaction
1. How much did you enjoy this game? (1-10 scale)
2. Would you continue playing more levels? (Yes/No/Maybe)
3. Would you recommend this to a friend? (1-10 scale)

#### Mechanics & Clarity
4. Were the game mechanics easy to understand? (1-5: Very Confusing → Very Clear)
5. Did the tutorial teach you what you needed to know? (Yes/No + comments)
6. Which level(s) felt unclear or frustrating? (Free text)

#### Difficulty & Progression
7. How was the difficulty curve? (Too Easy/Just Right/Too Hard)
8. Did you feel rewarded for solving puzzles? (1-5 scale)
9. Which level was your favorite? Why? (Free text)
10. Which level was your least favorite? Why? (Free text)

#### Physics & Polish
11. Did the water and lava physics feel realistic? (1-5 scale)
12. Were visual effects helpful in understanding interactions? (Yes/No + comments)
13. Any technical issues? (Free text)

### Open Feedback
14. What did you like most about the game?
15. What frustrated you or would you change?
16. Any other comments?

## Data Collection

### Automated Metrics (Captured per Level)
```json
{
  "level_id": 1,
  "start_time": "ISO 8601 timestamp",
  "completion_time": 45.2,
  "reset_count": 2,
  "pin_pull_sequence": [3, 1, 2],
  "success": true,
  "player_id": "anonymous_uuid"
}
```

### Aggregate Metrics
- Average completion time by level
- Reset rate by level
- Drop-off points (levels not completed)
- Overall completion rate

## Analysis Criteria

### Success Gates for Phase 1 Completion

#### Critical (Must Pass All)
- [ ] **Tutorial Clarity**: 90%+ of testers complete levels 1-3 unaided
- [ ] **Core Enjoyment**: Average enjoyment rating ≥ 7/10
- [ ] **Completion Rate**: 80%+ of testers complete at least 15/20 levels
- [ ] **Continuation Intent**: 70%+ of testers would continue playing more levels

#### Important (Must Pass 3/4)
- [ ] **Difficulty Curve**: 80%+ of testers rate difficulty as "Just Right"
- [ ] **Mechanics Clarity**: Average clarity rating ≥ 4/5
- [ ] **Physics Polish**: Average physics realism rating ≥ 3.5/5
- [ ] **Recommendation Score**: Average NPS ≥ 7/10

### Problem Identification

**Red Flags** (Require Level Redesign):
- Level completion rate < 50%
- Average resets > 10
- Average completion time > 2× target
- Multiple testers mention same level as "frustrating"

**Yellow Flags** (Consider Adjustments):
- Level completion rate 50-70%
- Average resets 7-10
- Average completion time 1.5-2× target
- Mixed feedback on level clarity

## Testing Cadence

### Minimum Sample Size
- **Alpha Test**: 5 testers (internal team or close friends)
- **Beta Test**: 15 testers (diverse player backgrounds)
- **Final Validation**: 30 testers (target audience)

### Iteration Cycle
1. Conduct playtest with 5 testers
2. Analyze data and identify problem levels
3. Redesign/adjust problematic levels
4. Repeat until success gates are met
5. Expand to larger beta test

## Go/No-Go Decision Matrix

### GO to Phase 2 if:
- All Critical success gates passed
- At least 3/4 Important success gates passed
- No unresolved red flags
- At least 2 successful playtest iterations

### NO-GO (Iterate Phase 1) if:
- Any Critical success gate fails
- More than 1 Important success gate fails
- Unresolved red flags exist
- Testers report fundamental mechanic issues

### PIVOT if:
- Core concept doesn't resonate (enjoyment < 5/10)
- Completion rate < 50% after 3 iterations
- Fundamental physics or gameplay issues identified

## Documentation Requirements

### Per Playtest Session
- Observer notes (written during test)
- Automated metrics export (JSON)
- Survey responses (spreadsheet)
- Video recording (optional, with consent)

### Per Iteration
- Summary analysis report
- Problem levels identified
- Design changes made
- Updated level files (version controlled)

### Final Phase 1 Report
- Aggregate metrics across all testers
- Final level design documentation
- Key learnings and insights
- Recommendations for Phase 2
- Go/No-Go decision with justification

## Ethical Considerations
- Obtain consent for data collection
- Anonymize player data
- Allow testers to skip questions or stop testing
- Compensate testers appropriately (if applicable)
- Thank testers and acknowledge their contribution
