import './style.css';
import { GameEngine } from './core/engine';
import type { GameState } from './types';

// Get DOM elements
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const levelTitle = document.getElementById('level-title') as HTMLElement;
const levelDescription = document.getElementById(
  'level-description'
) as HTMLElement;
const timeStat = document.getElementById('time-stat') as HTMLElement;
const resetsStat = document.getElementById('resets-stat') as HTMLElement;
const pinsStat = document.getElementById('pins-stat') as HTMLElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
const message = document.getElementById('message') as HTMLElement;

// Initialize game
const game = new GameEngine(canvas);

// Update UI when game state changes
game.onStateChange = (state: GameState) => {
  updateUI(state);
};

// Update UI function
function updateUI(state: GameState): void {
  const level = game.getCurrentLevel();

  levelTitle.textContent = level.title;
  levelDescription.textContent = level.description;
  resetsStat.textContent = state.resets.toString();
  pinsStat.textContent = state.pinsPulled.toString();

  if (state.gameStatus === 'won') {
    message.textContent = '🎉 Level Complete! Great job!';
    message.className = 'success';
    nextBtn.style.display = 'block';
  } else if (state.gameStatus === 'lost') {
    message.textContent = '💥 Lava reached the treasure! Try again.';
    message.className = 'failure';
    nextBtn.style.display = 'none';
  } else {
    message.style.display = 'none';
    nextBtn.style.display = 'none';
  }
}

// Update timer
setInterval(() => {
  timeStat.textContent = Math.floor(game.getElapsedTime()).toString();
}, 100);

// Event handlers
resetBtn.addEventListener('click', () => {
  game.reset();
});

nextBtn.addEventListener('click', () => {
  game.nextLevel();
  message.style.display = 'none';
});

exportBtn.addEventListener('click', () => {
  const data = game.exportMetrics();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `playtest-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert('Playtest data exported! Thank you for testing.');
});

// Initial UI update
updateUI(game.getState());

// Start game
game.start();

console.log('Pin Puzzle Game - Phase 1 Demo');
console.log('Pull pins to guide water to the treasure!');
console.log('Water extinguishes lava - use this to your advantage!');
