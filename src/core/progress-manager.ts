export interface LevelResult {
  levelId: number;
  stars: number; // 0-3
  time: number;
  timestamp: number;
}

export interface PlayerProgress {
  unlockedLevels: number[];
  levelStars: Record<number, number>; // levelId -> stars
  achievements: string[];
  highScores?: Record<number, number[]>; // levelId -> list of completion times
}

export class ProgressManager {
  private readonly STORAGE_KEY = 'pin-puzzle-progress_v1';
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.load();
  }

  private load(): PlayerProgress {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }

    // Default state: Level 1 unlocked
    return {
      unlockedLevels: [1],
      levelStars: {},
      achievements: [],
      highScores: {},
    };
  }

  public save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.error('Failed to save progress', e);
    }
  }

  public isLevelUnlocked(levelId: number): boolean {
    return this.progress.unlockedLevels.includes(levelId);
  }

  public getLevelStars(levelId: number): number {
    return this.progress.levelStars[levelId] || 0;
  }

  public completeLevel(
    levelId: number,
    time: number,
    targetTime: number
  ): number {
    // Calculate stars
    let stars = 1;
    if (time <= targetTime) {
      stars = 3;
    } else if (time <= targetTime * 1.5) {
      stars = 2;
    }

    // Update stars if better
    const currentStars = this.getLevelStars(levelId);
    if (stars > currentStars) {
      this.progress.levelStars[levelId] = stars;
    }

    // Update high scores
    if (!this.progress.highScores) this.progress.highScores = {};
    if (!this.progress.highScores[levelId])
      this.progress.highScores[levelId] = [];

    this.progress.highScores[levelId].push(time);
    // Sort ascending (lower time is better) and keep top 5
    this.progress.highScores[levelId].sort((a, b) => a - b);
    this.progress.highScores[levelId] = this.progress.highScores[levelId].slice(
      0,
      5
    );

    // Unlock next level
    const nextLevelId = levelId + 1;
    if (!this.progress.unlockedLevels.includes(nextLevelId)) {
      // Simple check: keep unlocking until 60
      if (nextLevelId <= 60) {
        this.progress.unlockedLevels.push(nextLevelId);
      }
    }

    this.save();
    return stars;
  }

  public resetProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.progress = this.load(); // Reload defaults
  }

  public getUnlockedLevels(): number[] {
    return [...this.progress.unlockedLevels].sort((a, b) => a - b);
  }

  public getHighScores(levelId: number): number[] {
    return this.progress.highScores?.[levelId] || [];
  }
}
