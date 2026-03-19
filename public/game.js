import { getLevelConfig, getInitialLevel, isFinalLevel } from './levels.js';
import { createInitialState, resetForLevel, pickWord, markWordUsed } from './state.js';
import { render, updateSize } from './renderer.js';

let state = createInitialState(getInitialLevel());

// --- Helpers ---

const getSpawnX = (wordLength) => {
  const padding = 20;
  const estimatedWidth = Math.max(wordLength * 17, 40);
  const available = Math.max(state.playfieldWidth - padding * 2 - estimatedWidth, 20);
  return padding + Math.random() * available;
};

const getWordSpeed = (levelConfig) =>
  levelConfig.baseSpeed + Math.random() * levelConfig.speedVariance;

// --- Core mechanics ---

const explodeWord = (word) => {
  state.words = state.words.filter((w) => w.id !== word.id);
  state.score += word.text.length * 10;
  state.wordsCleared += 1;
  state.explosions.push({ x: word.x, y: word.y, time: Date.now() });
};

const cleanupExplosions = () => {
  const now = Date.now();
  state.explosions = state.explosions.filter((exp) => now - exp.time < 500);
};

const spawnWord = () => {
  if (state.levelUpPaused) return;

  const config = getLevelConfig(state.level);

  if (state.wordsSpawned >= state.wordsNeeded) return;
  if (state.wordsCleared + state.words.length >= state.wordsNeeded) return;
  if (state.words.length >= config.maxOnScreen) return;

  const nextWord = pickWord(state, config);
  if (!nextWord) return;

  markWordUsed(state, nextWord);
  state.words.push({
    id: Date.now() + Math.random(),
    text: nextWord,
    x: getSpawnX(nextWord.length),
    y: 0,
    speed: getWordSpeed(config),
    progress: 0,
  });
  state.wordsSpawned += 1;
};

const initWords = () => {
  if (state.initialized || state.gameOver) return;

  const config = getLevelConfig(state.level);
  const usedPositions = [];
  const isPositionValid = (x, positions) => !positions.some((pos) => Math.abs(pos - x) < 80);

  for (let i = 0; i < config.initialSpawnCount; i += 1) {
    const nextWord = pickWord(state, config);
    if (!nextWord) break;

    let wordX = getSpawnX(nextWord.length);
    let attempts = 0;
    while (!isPositionValid(wordX, usedPositions) && attempts < 20) {
      wordX = getSpawnX(nextWord.length);
      attempts += 1;
    }

    usedPositions.push(wordX);
    markWordUsed(state, nextWord);
    state.words.push({
      id: Date.now() + Math.random() + i,
      text: nextWord,
      x: wordX,
      y: Math.random() * -200,
      speed: getWordSpeed(config),
      progress: 0,
    });
  }

  state.wordsSpawned = state.words.length;
  state.initialized = true;
};

const scheduleSpawns = () => {
  if (state.spawnTimer) clearInterval(state.spawnTimer);
  const config = getLevelConfig(state.level);
  state.spawnTimer = setInterval(() => {
    if (state.gameOver || state.levelUpPaused) return;
    spawnWord();
    render(state, getLevelConfig(state.level));
  }, config.spawnRateMs);
};

const maybeAdvanceLevel = () => {
  if (state.wordsCleared < state.wordsNeeded) return;
  if (state.words.length > 0) return;

  // Victory — all levels done
  if (isFinalLevel(state.level)) {
    state.victory = true;
    if (state.spawnTimer) clearInterval(state.spawnTimer);
    return;
  }

  // Level-up pause
  state.levelUp = true;
  state.levelUpPaused = true;
  if (state.spawnTimer) clearInterval(state.spawnTimer);

  setTimeout(() => {
    state.levelUp = false;
    state.levelUpPaused = false;
    resetForLevel(state, state.level + 1);
    initWords();
    scheduleSpawns();
    render(state, getLevelConfig(state.level));
  }, 2000);
};

const animate = () => {
  if (state.gameOver || state.victory) {
    render(state, getLevelConfig(state.level));
    return;
  }

  if (!state.levelUpPaused) {
    const failY = state.playfieldHeight - 40;
    state.words = state.words.filter((word) => {
      word.y += word.speed;
      if (word.y > failY) {
        state.gameOver = true;
        return false;
      }
      return true;
    });

    maybeAdvanceLevel();
  }

  render(state, getLevelConfig(state.level));
  state.gameLoopId = requestAnimationFrame(animate);
};

const clearAllTimers = () => {
  if (state.spawnTimer) clearInterval(state.spawnTimer);
  if (state.gameLoopId) cancelAnimationFrame(state.gameLoopId);
  if (state.cleanupTimer) clearInterval(state.cleanupTimer);
};

const restartGame = () => {
  clearAllTimers();
  state = createInitialState(getInitialLevel());
  updateSize(state);
  initWords();
  scheduleSpawns();

  state.cleanupTimer = setInterval(() => {
    cleanupExplosions();
    render(state, getLevelConfig(state.level));
  }, 100);

  render(state, getLevelConfig(state.level));
  state.gameLoopId = requestAnimationFrame(animate);
};

const handleKeyDown = (event) => {
  if (state.gameOver || state.victory) {
    if (event.key === 'Enter') restartGame();
    return;
  }

  if (state.levelUpPaused) return;

  const key = event.key.toLowerCase();

  if (key.length === 1 && /[a-z0-9]/.test(key)) {
    if (!state.started) state.started = true;

    const newInput = state.currentInput + key;
    let targetWord = null;

    if (state.activeWordId) {
      targetWord = state.words.find((w) => w.id === state.activeWordId) || null;
    }

    if (!targetWord || !targetWord.text.startsWith(newInput)) {
      if (state.activeWordId) {
        state.words = state.words.map((w) =>
          w.id === state.activeWordId ? { ...w, progress: 0 } : w
        );
      }

      const matchingWords = state.words.filter(
        (w) => w.text.startsWith(newInput) && w.progress === 0
      );
      if (matchingWords.length > 0) {
        targetWord = matchingWords.reduce((lowest, cur) =>
          cur.y > lowest.y ? cur : lowest
        );
        state.activeWordId = targetWord.id;
      }
    }

    if (targetWord && targetWord.text.startsWith(newInput)) {
      state.currentInput = newInput;
      state.words = state.words.map((w) =>
        w.id === targetWord.id ? { ...w, progress: newInput.length } : w
      );

      if (newInput === targetWord.text) {
        explodeWord(targetWord);
        state.currentInput = '';
        state.activeWordId = null;
      }
    } else {
      state.currentInput = '';
      state.activeWordId = null;
    }
  } else if (event.key === 'Backspace') {
    state.currentInput = state.currentInput.slice(0, -1);
  } else if (event.key === 'Escape') {
    state.currentInput = '';
    state.activeWordId = null;
  }

  render(state, getLevelConfig(state.level));
};

// --- Boot ---

const boot = () => {
  updateSize(state);
  initWords();
  scheduleSpawns();

  window.addEventListener('resize', () => {
    updateSize(state);
    render(state, getLevelConfig(state.level));
  });
  window.addEventListener('keydown', handleKeyDown);

  state.cleanupTimer = setInterval(() => {
    cleanupExplosions();
    render(state, getLevelConfig(state.level));
  }, 100);

  render(state, getLevelConfig(state.level));
  state.gameLoopId = requestAnimationFrame(animate);
};

boot();
