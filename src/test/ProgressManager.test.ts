import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProgressManager } from '../core/progress-manager';

describe('ProgressManager', () => {
  let progressManager: ProgressManager;

  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      clear: vi.fn(() => {
        for (const key in store) delete store[key];
      }),
    });

    progressManager = new ProgressManager();
    // Force reset for test isolation
    // (ProgressManager loads in constructor, so we might need to test saving/loading immediately)
  });

  it('should save and load progress', () => {
    progressManager.completeLevel(1, 30, 45); // Unlocks level 2

    // Simulate reload
    const newManager = new ProgressManager();
    const unlocked = newManager.getUnlockedLevels();

    expect(unlocked).toContain(1);
    expect(unlocked).toContain(2);
  });

  it('should calculate stars correctly', () => {
    // Target time 60s
    progressManager.completeLevel(1, 40, 60); // < Target = 3 stars
    expect(progressManager.getLevelStars(1)).toBe(3);

    progressManager.completeLevel(2, 70, 60); // < 1.5x Target = 2 stars
    expect(progressManager.getLevelStars(2)).toBe(2);

    progressManager.completeLevel(3, 100, 60); // > 1.5x Target = 1 star
    expect(progressManager.getLevelStars(3)).toBe(1);
  });

  it('should track high scores', () => {
    progressManager.completeLevel(1, 50, 60);
    progressManager.completeLevel(1, 30, 60); // Better time

    const scores = progressManager.getHighScores(1);
    expect(scores[0]).toBe(30);
    expect(scores[1]).toBe(50);
  });
});
