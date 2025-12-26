import { AssetManager } from '../core/AssetManager'; // Import AssetManager
import { HintManager } from '../core/hint-manager';
import { PhysicsWorld } from '../core/PhysicsWorld'; // Changed from Physics to PhysicsWorld
import { ProgressManager } from '../core/progress-manager';
import { Renderer, VisualEffect } from '../core/renderer';
import levelsData from '../data/levels.json';
import type {
  GameState,
  LevelData,
  LevelSession,
  Monster,
  Particle,
  Pin,
  Vec2,
} from '../types';

export class GameEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: Renderer;
  private readonly assetManager: AssetManager; // Add AssetManager
  private physics: PhysicsWorld; // Changed type to PhysicsWorld
  private currentLevel: LevelData;
  private particles: Particle[] = [];
  private monsters: Monster[] = [];
  private pins: Pin[] = [];
  private walls: { x: number; y: number; width: number; height: number }[] = [];
  private treasure: Vec2 = { x: 0, y: 0 };
  private readonly gameState: GameState;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private levelStartTime: number = 0;
  private readonly sessions: LevelSession[] = [];
  private currentSession: LevelSession | null = null;

  private readonly playerId: string;
  private readonly hintManager: HintManager;
  private readonly progressManager: ProgressManager;
  private effects: VisualEffect[] = [];

  // UI callback
  public onStateChange?: (state: GameState) => void;
  public onHintAvailable?: () => void;
  public onAudioEvent?: (
    event: 'pull' | 'win' | 'lose' | 'steam' | 'water'
  ) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.assetManager = new AssetManager();
    this.assetManager.loadAll(); // Start loading
    this.renderer = new Renderer(canvas, this.assetManager);
    this.physics = new PhysicsWorld(); // Instantiated PhysicsWorld
    this.hintManager = new HintManager();
    this.progressManager = new ProgressManager();
    this.currentLevel = levelsData[0] as LevelData;
    this.gameState = {
      currentLevel: 1,
      levelStartTime: Date.now(),
      resets: 0,
      pinsPulled: 0,
      gameStatus: 'playing',
    };

    // Generate a player ID for metrics
    this.playerId = 'player_' + Math.random().toString(36).substring(2, 15);

    this.setupLevel(this.currentLevel);
    this.setupInputHandlers();
  }

  private setupLevel(levelData: LevelData): void {
    this.currentLevel = levelData;
    this.physics.clear(); // Clear physics world for new level

    // Reset local arrays
    this.particles = [];
    this.monsters = [];
    this.pins = [];
    this.walls = [];

    // Generate boundary walls based on adjacency
    const wallThickness = 20;

    for (const chamber of levelData.chambers) {
      // Add visual wall (chamber background)
      this.walls.push({
        x: chamber.x,
        y: chamber.y,
        width: chamber.width,
        height: chamber.height,
      });

      // 1. Top Wall
      // Check if there's a chamber directly above
      const hasTopNeighbor = levelData.chambers.some(
        (c) =>
          Math.abs(c.x - chamber.x) < 1 && // Same X column (approx) - ignoring complex overlaps for now
          Math.abs(c.y + c.height - chamber.y) < 5 && // Ends where we start
          c.width === chamber.width // Assuming same width logic for simplicity of "pipe"
      );

      if (!hasTopNeighbor) {
        this.physics.addWall(
          chamber.x - wallThickness,
          chamber.y - wallThickness,
          chamber.width + 2 * wallThickness,
          wallThickness
        );
      }

      // 2. Bottom Wall
      const hasBottomNeighbor = levelData.chambers.some(
        (c) =>
          Math.abs(c.x - chamber.x) < 1 &&
          Math.abs(c.y - (chamber.y + chamber.height)) < 5 &&
          c.width === chamber.width
      );

      if (!hasBottomNeighbor) {
        this.physics.addWall(
          chamber.x - wallThickness,
          chamber.y + chamber.height,
          chamber.width + 2 * wallThickness,
          wallThickness
        );
      }

      // 3. Left Wall
      const hasLeftNeighbor = levelData.chambers.some(
        (c) =>
          Math.abs(c.x + c.width - chamber.x) < 5 &&
          c.y === chamber.y && // Matches Y for horizontal pipe
          c.height === chamber.height
      );

      // Checking for arbitrary overlaps is hard.
      // Simplified: explicit adjacency for same-height/width blocks.
      // Ideally we'd use a more robust geometry union, but this fits the "grid-like" levels.

      if (!hasLeftNeighbor) {
        this.physics.addWall(
          chamber.x - wallThickness,
          chamber.y,
          wallThickness,
          chamber.height
        );
      }

      // 4. Right Wall
      const hasRightNeighbor = levelData.chambers.some(
        (c) =>
          Math.abs(c.x - (chamber.x + chamber.width)) < 5 &&
          c.y === chamber.y &&
          c.height === chamber.height
      );

      if (!hasRightNeighbor) {
        this.physics.addWall(
          chamber.x + chamber.width,
          chamber.y,
          wallThickness,
          chamber.height
        );
      }

      // Create particles if chamber has content
      if (chamber.type !== 'empty') {
        // Spawn slightly randomized to avoid stacking perfect columns if physics is sleepy
        this.spawnParticles(
          chamber.particleCount,
          chamber.x + chamber.width / 2,
          chamber.y + chamber.height / 2,
          chamber.type
        );
      }
    }

    // Setup pins
    for (const pinData of levelData.pins) {
      const pin: Pin = {
        id: pinData.id,
        x: pinData.x,
        y: pinData.y,
        angle: pinData.angle,
        length: pinData.length,
        pulled: false,
        hover: false,
      };
      this.pins.push(pin);
      this.physics.addPin(pin); // Add pin to physics world
    }

    // Setup monsters
    if (levelData.monsters) {
      for (const mData of levelData.monsters) {
        const monster: Monster = {
          id: mData.id,
          x: mData.x,
          y: mData.y,
          vx: (Math.random() - 0.5) * 2,
          vy: 0,
          type: mData.type,
          active: true,
        };
        this.monsters.push(monster);
        this.physics.addMonster(monster); // Add monster to physics world
      }
    }

    // Setup treasure
    this.treasure = levelData.treasure;
    this.physics.setTreasure(this.treasure); // Set treasure in physics world

    // Reset game state
    this.levelStartTime = Date.now();
    this.gameState.gameStatus = 'playing';
    this.gameState.levelStartTime = Date.now();

    // Start new session tracking
    this.currentSession = {
      levelId: levelData.id,
      startTime: new Date().toISOString(),
      completionTime: null,
      resetCount: 0,
      pinPullSequence: [],
      success: false,
    };

    this.hintManager.resetLevel();
  }

  private spawnParticles(
    count: number,
    x: number,
    y: number,
    type: 'water' | 'lava' | 'gas' | 'steam'
  ): void {
    console.log(
      `[GameEngine] Spawning ${count} particles of type ${type} at (${x}, ${y})`
    );
    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type,
        active: true,
        mass: 1, // Matter handles mass
      };
      // ID is index
      const id = this.particles.length;
      this.particles.push(particle);
      this.physics.addParticle(id, particle.x, particle.y, type);
    }
    console.log(`[GameEngine] Total particles: ${this.particles.length}`);
  }

  private setupInputHandlers(): void {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.handleMouseMove(mouseEvent);
    });
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.handleClick(mouseEvent);
    });
  }

  private getMousePos(e: MouseEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private handleMouseMove(e: MouseEvent): void {
    const pos = this.getMousePos(e);

    for (const pin of this.pins) {
      if (pin.pulled) continue;

      const dx = pos.x - pin.x;
      const dy = pos.y - pin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      pin.hover = dist < 15;
    }
  }

  private handleClick(e: MouseEvent): void {
    if (this.gameState.gameStatus !== 'playing') return;

    const pos = this.getMousePos(e);
    const x = pos.x;
    const y = pos.y;

    console.log(`[GameEngine] Click at (${x}, ${y})`);

    // Check pin click
    const pinIndex = this.pins.findIndex((p) => {
      if (p.pulled) return false;

      // Rotated check would be better, but circle check ok for now
      const dx = p.x - x;
      const dy = p.y - y;
      const distSq = dx * dx + dy * dy;
      console.log(
        `[GameEngine] Checking Pin ${p.id} at (${p.x}, ${p.y}). Dist: ${Math.sqrt(distSq)}`
      );

      return distSq < 1600; // 40px radius
    });

    if (pinIndex !== -1) {
      console.log(`[GameEngine] Pin ${this.pins[pinIndex].id} clicked!`);
      const pin = this.pins[pinIndex];

      pin.pulled = true;
      this.physics.removePin(pin.id); // Remove physical body

      this.gameState.pinsPulled++; // Use gameState
      if (this.onAudioEvent) this.onAudioEvent('pull'); // Use onAudioEvent

      // Track pin pull in session
      if (this.currentSession) {
        this.currentSession.pinPullSequence.push(pin.id);
      }

      this.notifyStateChange();

      // Add sparkle effect at pin head
      this.effects.push({
        x: pin.x,
        y: pin.y,
        type: 'sparkle',
        age: 0,
        maxAge: 20,
      });
    }

    // Reset idle timer on interaction
    this.hintManager.recordAction();
  }

  // Removed unused pullPin and pinIntersectsWall methods

  public start(): void {
    this.lastTime = performance.now();
    this.animate(this.lastTime);
  }

  public stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate(currentTime: number): void {
    const dt = Math.min((currentTime - this.lastTime) / 16, 2); // Cap at 2x normal speed
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  private update(dt: number): void {
    if (this.gameState.gameStatus !== 'playing') return;

    // Update physics
    this.physics.update(dt);

    // Sync PhysicsWorld bodies to renderer particles
    // Note: This is an expensive loop if we have many particles.
    // Optimization: Only update active particles? Matter.js handles active state.
    // For now, iterate our logical particles and fetch pos from physics.
    // Assuming this.state.isPlaying is equivalent to this.gameState.gameStatus === 'playing'
    // Sync positions back
    if (this.gameState.gameStatus === 'playing') {
      // Handle Fluid Collisions
      const steamPoints = this.physics.getAndClearFluidCollisions();
      for (const point of steamPoints) {
        // Spawn steam effect
        this.effects.push({
          x: point.x,
          y: point.y,
          type: 'steam',
          age: 0,
          maxAge: 40, // Longer life for steam
        });
        if (this.onAudioEvent) this.onAudioEvent('steam');
      }

      // Sync positions
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];
        if (!p.active) continue;

        const pos = this.physics.getParticlePosition(i);
        if (pos) {
          p.x = pos.x;
          p.y = pos.y;

          // Check bounds (Matter handles this usually, but for cleanup)
          if (p.y > this.canvas.height + 50) {
            p.active = false;
            this.physics.removeParticle(i); // Remove from physics world
          }
        } else {
          // Body removed (e.g. by collision)
          p.active = false;
        }
      }

      // Sync monster positions
      for (const monster of this.monsters) {
        if (!monster.active) continue;
        const pos = this.physics.getMonsterPosition(monster.id);
        if (pos) {
          monster.x = pos.x;
          monster.y = pos.y;
        }
      }
    }

    // Check win condition (water reaches treasure)
    if (this.physics.checkTreasureContact(this.particles, this.treasure)) {
      this.gameState.gameStatus = 'won';

      const elapsedTime = (Date.now() - this.gameState.levelStartTime) / 1000;
      this.progressManager.completeLevel(
        this.currentLevel.id,
        elapsedTime,
        this.currentLevel.targetTime
      );

      this.finishLevel(true);

      this.notifyStateChange();
      if (this.onAudioEvent) this.onAudioEvent('win');
    }

    // Check lose condition (lava reaches treasure)
    if (this.physics.checkLavaContact(this.particles, this.treasure)) {
      this.gameState.gameStatus = 'lost';
      this.finishLevel(false);
      this.notifyStateChange();
      if (this.onAudioEvent) this.onAudioEvent('lose');
    }

    // Check monster lose condition
    if (this.physics.checkMonsterContact(this.monsters, this.treasure)) {
      this.gameState.gameStatus = 'lost';
      this.finishLevel(false);
      this.notifyStateChange();
      if (this.onAudioEvent) this.onAudioEvent('lose');
    }

    // Update hints
    this.hintManager.update(dt * 16, this.gameState);
    if (this.hintManager.isHintAvailable() && this.onHintAvailable) {
      this.onHintAvailable();
    }

    // Update effects
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].age += dt;
      if (this.effects[i].age >= this.effects[i].maxAge) {
        this.effects.splice(i, 1);
      }
    }
  }

  private finishLevel(success: boolean): void {
    if (this.currentSession) {
      const completionTime = (Date.now() - this.levelStartTime) / 1000;
      this.currentSession.completionTime = completionTime;
      this.currentSession.success = success;
      this.sessions.push({ ...this.currentSession });
    }
  }

  private render(): void {
    this.renderer.clear();

    // Draw chambers
    for (const chamber of this.currentLevel.chambers) {
      this.renderer.drawChamber(
        chamber.x,
        chamber.y,
        chamber.width,
        chamber.height
      );
    }

    // Draw effects (behind particles/pins)
    this.renderer.drawEffects(this.effects);

    // Draw particles
    this.renderer.drawParticles(this.particles);

    // Draw monsters
    this.renderer.drawMonsters(this.monsters);

    // Draw treasure
    this.renderer.drawTreasure(
      this.treasure,
      this.gameState.gameStatus === 'won'
    );

    // Draw pins
    for (const pin of this.pins) {
      this.renderer.drawPin(pin);
    }

    // Draw win/lose message
    if (this.gameState.gameStatus === 'won') {
      this.renderer.drawMessage('Level Complete!', 100);
    } else if (this.gameState.gameStatus === 'lost') {
      this.renderer.drawMessage('Try Again!', 100);
    }
  }

  public reset(): void {
    this.gameState.resets++;
    if (this.currentSession) {
      this.currentSession.resetCount++;
    }
    this.setupLevel(this.currentLevel);
    this.notifyStateChange();
  }

  public nextLevel(): void {
    if (this.gameState.currentLevel < levelsData.length) {
      this.loadLevelIndex(this.gameState.currentLevel);
    }
  }

  public loadLevelIndex(index: number): void {
    if (index >= 0 && index < levelsData.length) {
      this.gameState.currentLevel = index + 1;
      this.gameState.resets = 0;
      this.gameState.pinsPulled = 0;
      this.currentLevel = levelsData[index] as LevelData;
      this.setupLevel(this.currentLevel);
      this.notifyStateChange();
    }
  }

  public loadLevel(levelId: number): void {
    const index = levelsData.findIndex((l) => l.id === levelId);
    if (index !== -1) {
      this.loadLevelIndex(index);
    } else {
      console.warn(`Level with ID ${levelId} not found.`);
    }
  }

  public loadLevelData(levelData: LevelData): void {
    // For custom levels, use a special ID or keep existing
    this.currentLevel = levelData;
    // Reset state for new level
    this.gameState.currentLevel = -1; // Indicator for custom level
    this.gameState.resets = 0;
    this.gameState.pinsPulled = 0;
    this.setupLevel(this.currentLevel);
    this.notifyStateChange();
  }

  public getState(): GameState {
    return { ...this.gameState };
  }

  public getCurrentLevel(): LevelData {
    return this.currentLevel;
  }

  public getElapsedTime(): number {
    return (Date.now() - this.levelStartTime) / 1000;
  }

  public exportMetrics(): string {
    const metrics = {
      playerId: this.playerId,
      exportTime: new Date().toISOString(),
      sessions: this.sessions,
    };
    return JSON.stringify(metrics, null, 2);
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
  public getProgressManager(): ProgressManager {
    return this.progressManager;
  }
}
