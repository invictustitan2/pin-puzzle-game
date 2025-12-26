import type { LevelData, Particle, Pin, Vec2, GameState, LevelSession } from '../types';
import { Physics } from '../core/physics';
import { Renderer } from '../core/renderer';
import levelsData from '../data/levels.json';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private physics: Physics;
  private currentLevel: LevelData;
  private particles: Particle[] = [];
  private pins: Pin[] = [];
  private walls: { x: number; y: number; width: number; height: number }[] = [];
  private treasure: Vec2 = { x: 0, y: 0 };
  private gameState: GameState;
  private lastTime: number = 0;
  private animationId: number | null = null;
  private levelStartTime: number = 0;
  private sessions: LevelSession[] = [];
  private currentSession: LevelSession | null = null;
  private playerId: string;

  // UI callback
  public onStateChange?: (state: GameState) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.physics = new Physics();
    this.currentLevel = levelsData[0] as LevelData;
    this.gameState = {
      currentLevel: 1,
      levelStartTime: Date.now(),
      resets: 0,
      pinsPulled: 0,
      gameStatus: 'playing'
    };
    
    // Generate a player ID for metrics
    this.playerId = 'player_' + Math.random().toString(36).substring(2, 15);

    this.setupLevel(this.currentLevel);
    this.setupInputHandlers();
  }

  private setupLevel(levelData: LevelData): void {
    this.currentLevel = levelData;
    this.particles = [];
    this.pins = [];
    this.walls = [];

    // Setup pins
    for (const pinData of levelData.pins) {
      this.pins.push({
        id: pinData.id,
        x: pinData.x,
        y: pinData.y,
        angle: pinData.angle,
        length: pinData.length,
        pulled: false,
        hover: false
      });
    }

    // Setup chambers and particles
    for (const chamber of levelData.chambers) {
      this.walls.push({
        x: chamber.x,
        y: chamber.y,
        width: chamber.width,
        height: chamber.height
      });

      // Create particles if chamber has content
      if (chamber.type !== 'empty') {
        for (let i = 0; i < chamber.particleCount; i++) {
          this.particles.push({
            x: chamber.x + Math.random() * chamber.width,
            y: chamber.y + Math.random() * chamber.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            type: chamber.type,
            active: true,
            mass: chamber.type === 'lava' ? 1.2 : 1.0
          });
        }
      }
    }

    // Setup treasure
    this.treasure = levelData.treasure;

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
      success: false
    };
  }

  private setupInputHandlers(): void {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleMouseMove(mouseEvent);
    });
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('click', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.handleClick(mouseEvent);
    });
  }

  private getMousePos(e: MouseEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
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
    
    for (const pin of this.pins) {
      if (pin.pulled) continue;
      
      const dx = pos.x - pin.x;
      const dy = pos.y - pin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 15) {
        this.pullPin(pin);
        break;
      }
    }
  }

  private pullPin(pin: Pin): void {
    pin.pulled = true;
    this.gameState.pinsPulled++;

    // Track pin pull in session
    if (this.currentSession) {
      this.currentSession.pinPullSequence.push(pin.id);
    }

    // Remove wall associated with this pin
    // The wall is removed by finding chambers that this pin was blocking
    for (let i = this.walls.length - 1; i >= 0; i--) {
      const wall = this.walls[i];
      
      // Check if pin intersects this wall's boundary
      if (this.pinIntersectsWall(pin, wall)) {
        this.walls.splice(i, 1);
        break;
      }
    }

    this.notifyStateChange();
  }

  private pinIntersectsWall(pin: Pin, wall: { x: number; y: number; width: number; height: number }): boolean {
    // Check if pin crosses any edge of the wall
    // Simplified: check if pin endpoints are on different sides of wall boundaries
    const tolerance = 5;

    // Check horizontal walls (top and bottom)
    if (Math.abs(pin.y - wall.y) < tolerance || Math.abs(pin.y - (wall.y + wall.height)) < tolerance) {
      if (pin.x >= wall.x - tolerance && pin.x <= wall.x + wall.width + tolerance) {
        return true;
      }
    }

    // Check vertical walls (left and right)
    if (Math.abs(pin.x - wall.x) < tolerance || Math.abs(pin.x - (wall.x + wall.width)) < tolerance) {
      if (pin.y >= wall.y - tolerance && pin.y <= wall.y + wall.height + tolerance) {
        return true;
      }
    }

    return false;
  }

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
    this.physics.update(this.particles, this.walls, dt);

    // Check win condition (water reaches treasure)
    if (this.physics.checkTreasureContact(this.particles, this.treasure)) {
      this.gameState.gameStatus = 'won';
      this.finishLevel(true);
      this.notifyStateChange();
    }

    // Check lose condition (lava reaches treasure)
    if (this.physics.checkLavaContact(this.particles, this.treasure)) {
      this.gameState.gameStatus = 'lost';
      this.finishLevel(false);
      this.notifyStateChange();
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
      this.renderer.drawChamber(chamber.x, chamber.y, chamber.width, chamber.height);
    }

    // Draw particles
    this.renderer.drawParticles(this.particles);

    // Draw treasure
    this.renderer.drawTreasure(this.treasure, this.gameState.gameStatus === 'won');

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
      this.gameState.currentLevel++;
      this.gameState.resets = 0;
      this.gameState.pinsPulled = 0;
      this.currentLevel = levelsData[this.gameState.currentLevel - 1] as LevelData;
      this.setupLevel(this.currentLevel);
      this.notifyStateChange();
    }
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
      sessions: this.sessions
    };
    return JSON.stringify(metrics, null, 2);
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}
