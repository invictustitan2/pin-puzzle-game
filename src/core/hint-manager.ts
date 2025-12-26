import { GameState, LevelData } from '../types';

export class HintManager {
  private idleTime: number = 0;
  private attemptCount: number = 0;
  private hintActive: boolean = false;

  constructor() {
    // Initialization
  }

  public update(deltaTime: number, _state: GameState): void {
    // Increment idle time using delta time (assuming deltaTime is in ms)
    this.idleTime += deltaTime / 1000;

    // Check conditions for suggesting a hint
    if (this.shouldShowHint(_state)) {
      this.hintActive = true;
    }
  }

  public recordAction(): void {
    this.idleTime = 0;
    this.hintActive = false;
  }

  public recordReset(): void {
    this.attemptCount++;
    this.recordAction();
  }

  public resetLevel(): void {
    this.idleTime = 0;
    this.hintActive = false;
    // Keep attemptCount per level session for now
  }

  public isHintAvailable(): boolean {
    return this.hintActive;
  }

  private shouldShowHint(_state: GameState): boolean {
    // Show hint if:
    // 1. Player has reset 3+ times
    // 2. Player has been idle for 15+ seconds
    return this.attemptCount >= 3 || this.idleTime > 15;
  }

  public getHint(_level: LevelData): string {
    // Basic logic: find the first unpulled pin that leads to water?
    // For now, generic messages based on state
    if (this.attemptCount >= 5) {
      return 'Try pulling pins in a different order!';
    }
    return 'Look for pins holding back water.';
  }
}
