import { getLevelConfig, getInitialLevel } from './levels.js';

export const createInitialState = (startLevel) => {
  const config = getLevelConfig(startLevel);
  return {
    words: [],
    playfieldWidth: 800,
    playfieldHeight: 720,
    score: 0,
    level: startLevel,
    wordsCleared: 0,
    wordsNeeded: config.wordsNeeded,
    wordsSpawned: 0,
    gameOver: false,
    victory: false,
    started: false,
    currentInput: '',
    activeWordId: null,
    explosions: [],
    levelUp: false,
    levelUpPaused: false,
    initialized: false,
    spawnTimer: null,
    gameLoopId: null,
    cleanupTimer: null,
    usedWordsThisLevel: new Set(),
  };
};

export const resetForLevel = (state, levelNumber) => {
  const config = getLevelConfig(levelNumber);
  state.level = levelNumber;
  state.words = [];
  state.wordsCleared = 0;
  state.wordsSpawned = 0;
  state.wordsNeeded = config.wordsNeeded;
  state.activeWordId = null;
  state.currentInput = '';
  state.explosions = [];
  state.levelUp = false;
  state.levelUpPaused = false;
  state.gameOver = false;
  state.victory = false;
  state.initialized = false;
  state.usedWordsThisLevel = new Set();
};

export const pickWord = (state, levelConfig) => {
  const onScreenTexts = state.words.map((w) => w.text);
  let available = levelConfig.words.filter(
    (w) => !onScreenTexts.includes(w) && !state.usedWordsThisLevel.has(w)
  );
  if (available.length === 0) {
    // Pool exhausted — reset used set and try again (excluding on-screen)
    state.usedWordsThisLevel = new Set(onScreenTexts);
    available = levelConfig.words.filter((w) => !onScreenTexts.includes(w));
  }
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};

export const markWordUsed = (state, text) => {
  state.usedWordsThisLevel.add(text);
};
