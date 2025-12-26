import { AudioManager } from './core/audio-manager';
import { GameEngine } from './core/engine';
import levelsData from './data/levels.json'; // Import levels directly for grid
import { Editor } from './editor/editor';
import './style.css';
import type { GameState } from './types';

// Get DOM elements
const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const menuScreen = document.getElementById('menu-screen')!;
const levelGrid = document.getElementById('level-grid')!;
const gameUI = document.getElementById('game-ui')!;
const menuBtn = document.getElementById('menu-btn')!;
const customLevelBtn = document.createElement('button');
customLevelBtn.textContent = '📥 Import Level';
customLevelBtn.className = 'secondary-btn'; // Re-use style
customLevelBtn.style.marginTop = '20px';

const levelTitle = document.getElementById('level-title')!;
const levelDescription = document.getElementById('level-description')!;
const timeStat = document.getElementById('time-stat')!;
const resetsStat = document.getElementById('resets-stat')!;
const pinsStat = document.getElementById('pins-stat')!;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
// const exportBtn = document.getElementById('export-btn') as HTMLButtonElement;
const hintBtn = document.getElementById('hint-btn') as HTMLButtonElement;
const settingsBtn = document.getElementById(
  'settings-btn'
) as HTMLButtonElement;
const message = document.getElementById('message')!;
const hintModal = document.getElementById('hint-modal')!;
const hintText = document.getElementById('hint-text')!;
const settingsModal = document.getElementById('settings-modal')!;

// Check for Editor mode
const urlParams = new URLSearchParams(window.location.search);
const isEditor = urlParams.has('editor');

if (isEditor) {
  // --- EDITOR MODE ---
  menuScreen.style.display = 'none';
  gameUI.style.display = 'none';
  new Editor(canvas);
  console.log('Started in Editor Mode');
} else {
  // --- GAME MODE ---
  const audioManager = new AudioManager();
  const game = new GameEngine(canvas);
  const progressManager = game.getProgressManager();

  // Audio integration
  game.onAudioEvent = (event) => {
    audioManager.play(event);
  };

  const initAudio = () => {
    audioManager.initialize();
    document.removeEventListener('click', initAudio);
    document.removeEventListener('keydown', initAudio);
  };
  document.addEventListener('click', initAudio);
  document.addEventListener('keydown', initAudio);

  // --- MENU LOGIC ---
  const showMenu = () => {
    game.stop(); // Stop game loop if running
    menuScreen.style.display = 'flex';
    gameUI.style.display = 'none';
    message.style.display = 'none';

    // Build Level Grid
    levelGrid.innerHTML = '';
    const unlocked = progressManager.getUnlockedLevels();

    levelsData.forEach((level) => {
      const btn = document.createElement('div');
      btn.className = 'level-btn';

      const isUnlocked = unlocked.includes(level.id);
      if (!isUnlocked) {
        btn.classList.add('locked');
        btn.innerHTML = `<span>🔒</span><span>${level.id}</span>`;
      } else {
        const stars = progressManager.getLevelStars(level.id);
        let starsHtml = '';
        for (let i = 0; i < 3; i++) {
          starsHtml += `<span class="star ${i < stars ? 'filled' : ''}">★</span>`;
        }

        btn.innerHTML = `
                <span style="font-size: 1.2rem; font-weight: bold;">${level.id}</span>
                <div class="stars">${starsHtml}</div>
            `;

        btn.onclick = () => {
          startGame(level.id);
        };
      }
      levelGrid.appendChild(btn);
    });

    // Add Custom Level Button to entry
    menuScreen.appendChild(customLevelBtn);
    customLevelBtn.onclick = () => {
      const code = prompt('Paste Level Code:');
      if (code) {
        try {
          const json = atob(code);
          const levelData = JSON.parse(json);
          game.loadLevelData(levelData);
          menuScreen.style.display = 'none';
          gameUI.style.display = 'block';
          game.start();
        } catch (e) {
          alert('Invalid level code! Make sure you copied the full string.');
          console.error(e);
        }
      }
    };
  };

  const startGame = (levelId: number) => {
    // Find level index
    const levelIndex = levelsData.findIndex((l) => l.id === levelId);
    if (levelIndex === -1) return;

    // Force engine to specific level
    // Accessing private/protected methods is tricky, but we can rely on
    // the engine's public interface if we add a 'loadLevel' method or
    // just manipulate the state if we must.
    // Actually, GameEngine uses `currentLevel` from `levelsData[0]` initially.
    // We should arguably add a method to GameEngine to load a specific level by ID.
    // For now, we can iterate `nextLevel` or just reset the internal state to the specific level.
    // But `nextLevel` increments.
    // Let's rely on a hack or update Engine.
    // Update: engine.ts doesn't have loadLevelById.
    // Let's update Engine to allow loading by ID or just use internal `gameState.currentLevel` assignment if accessible or add a method.
    // HACK: We will add a method to proper implementation later, but for now let's assume valid start.
    // Actually, let's fix Engine first? No, let's use what we have.
    // We can use the 'nextLevel' logic but that's messy.
    // Best approach: Add `loadLevel(id)` to GameEngine.
    // For this step, I'll modify GameEngine one more time to add `loadLevel`.
    // Wait, I can't modify Engine inside this tool call easily without breaking flow.
    // I'll stick to a simpler approach:
    // Just manually setting the property if I can, or re-creating GameEngine? No.
    // I'll assume I can modify Engine in the next step or I'll implement it blindly here and fix Engine immediately after.

    // Force engine to specific level
    game.loadLevelIndex(levelIndex);

    menuScreen.style.display = 'none';
    gameUI.style.display = 'block';
    game.start();
  };

  // --- GAME UI LOGIC ---
  game.onStateChange = (state: GameState) => {
    updateUI(state);
  };

  const updateUI = (state: GameState): void => {
    const level = game.getCurrentLevel();

    levelTitle.textContent = level.title;
    levelDescription.textContent = level.description;
    resetsStat.textContent = state.resets.toString();
    pinsStat.textContent = state.pinsPulled.toString();

    if (state.gameStatus === 'won') {
      const stars = progressManager.getLevelStars(level.id);
      let starsHtml = '';
      for (let i = 0; i < 3; i++) starsHtml += i < stars ? '★' : '☆';

      const highScores = progressManager.getHighScores(level.id);
      let scoreText = '';
      if (highScores.length > 0) {
        scoreText =
          '\n\n🏆 Top Times:\n' +
          highScores.map((t, i) => `${i + 1}. ${t.toFixed(1)}s`).join('\n');
      }

      message.textContent = `🎉 Level Complete! \n ${starsHtml}${scoreText}`;
      message.className = 'success';
      message.style.whiteSpace = 'pre';
      message.style.display = 'block';
      nextBtn.style.display = 'block';
      menuBtn.style.display = 'inline-block';
    } else if (state.gameStatus === 'lost') {
      message.textContent = '💥 Lava reached the treasure!';
      message.className = 'failure';
      message.style.display = 'block';
      nextBtn.style.display = 'none';
      menuBtn.style.display = 'inline-block';
      hintBtn.style.display = 'none';
    } else {
      message.style.display = 'none';
      nextBtn.style.display = 'none';
      menuBtn.style.display = 'none';
    }
  };

  // Update timer
  setInterval(() => {
    timeStat.textContent = Math.floor(game.getElapsedTime()).toString();
  }, 100);

  // Event handlers
  resetBtn.addEventListener('click', () => game.reset());

  nextBtn.addEventListener('click', () => {
    game.nextLevel();
    message.style.display = 'none';
    hintBtn.style.display = 'none';
  });

  menuBtn.addEventListener('click', () => {
    showMenu();
  });

  hintBtn.addEventListener('click', () => {
    hintText.textContent =
      'Look for pins that are blocking water flow or holding back lava!';
    hintModal.classList.add('active');
  });

  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
  });

  // Start at Menu
  showMenu();
}
