import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameEngine } from '../core/engine';

// Mock Canvas and Context
const mockContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillText: vi.fn(),
} as unknown as CanvasRenderingContext2D;

const mockCanvas = {
  getContext: vi.fn(() => mockContext),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 600,
  })),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  width: 800,
  height: 600,
} as unknown as HTMLCanvasElement;

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new GameEngine(mockCanvas);
  });

  it('should initialize with default level', () => {
    expect(engine.getCurrentLevel().id).toBe(1);
  });

  it('should load a specific level by ID', () => {
    engine.loadLevel(2);
    expect(engine.getState().currentLevel).toBe(2);
    expect(engine.getCurrentLevel().id).toBe(2);
  });

  it('should reset level state', () => {
    engine.getState().pinsPulled = 5;
    engine.reset();
    expect(engine.getState().pinsPulled).toBe(0);
    expect(engine.getState().resets).toBe(1); // Reset increments count
  });

  it('should export metrics in JSON format', () => {
    const metrics = engine.exportMetrics();
    const data = JSON.parse(metrics);
    expect(data).toHaveProperty('playerId');
    expect(data).toHaveProperty('sessions');
  });
});
