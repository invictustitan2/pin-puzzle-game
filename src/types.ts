// Type definitions for the game

export interface Vec2 {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  title: string;
  description: string;
  pins: PinData[];
  chambers: ChamberData[];
  monsters: MonsterData[];
  treasure: Vec2;
  targetTime: number;
}

export interface PinData {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
}

export interface ChamberData {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'water' | 'lava' | 'gas' | 'empty';
  particleCount: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'water' | 'lava' | 'steam' | 'gas';
  active: boolean;
  mass: number;
}

export interface Pin {
  id: number;
  x: number;
  y: number;
  angle: number;
  length: number;
  pulled: boolean;
  hover: boolean;
}

export interface MonsterData {
  id: number;
  x: number;
  y: number;
  type: 'blob';
}

export interface Monster {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'blob';
  active: boolean;
}

export interface PlaytestMetrics {
  playerId: string;
  sessions: LevelSession[];
}

export interface LevelSession {
  levelId: number;
  startTime: string;
  completionTime: number | null;
  resetCount: number;
  pinPullSequence: number[];
  success: boolean;
}

export interface GameState {
  currentLevel: number;
  levelStartTime: number;
  resets: number;
  pinsPulled: number;
  gameStatus: 'playing' | 'won' | 'lost';
}
