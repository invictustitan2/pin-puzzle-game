import { beforeEach, describe, expect, it } from 'vitest';
import { HintManager } from '../core/hint-manager';
import type { GameState } from '../types';

describe('HintManager', () => {
  let hintManager: HintManager;
  const mockState: GameState = {
    currentLevel: 1,
    levelStartTime: Date.now(),
    resets: 0,
    pinsPulled: 0,
    gameStatus: 'playing',
  };

  beforeEach(() => {
    hintManager = new HintManager();
  });

  it('should not show hint initially', () => {
    expect(hintManager.isHintAvailable()).toBe(false);
  });

  it('should show hint after idle time', () => {
    // Simulate 16 seconds of idle time
    hintManager.update(16000, mockState);
    expect(hintManager.isHintAvailable()).toBe(true);
  });

  it('should show hint after multiple attempts', () => {
    hintManager.recordReset();
    hintManager.recordReset();
    hintManager.recordReset();

    // Update to trigger check
    hintManager.update(0, mockState);
    expect(hintManager.isHintAvailable()).toBe(true);
  });

  it('should reset idle time on action', () => {
    hintManager.update(10000, mockState);
    hintManager.recordAction();
    hintManager.update(1000, mockState);
    expect(hintManager.isHintAvailable()).toBe(false);
  });
});
