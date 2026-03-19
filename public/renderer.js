// All DOM rendering — receives state and levelConfig as arguments.

const playfield = document.getElementById('playfield');
const hudLevel = document.getElementById('hud-level');
const hudThreats = document.getElementById('hud-threats');
const hudScore = document.getElementById('hud-score');
const currentInputEl = document.getElementById('current-input');
const wordLayer = document.getElementById('word-layer');
const explosionLayer = document.getElementById('explosion-layer');
const levelUpEl = document.getElementById('level-up');
const overlay = document.getElementById('overlay');

const renderHud = (state, levelConfig) => {
  hudLevel.textContent = `LEVEL ${state.level}: ${levelConfig.theme}`;
  hudThreats.textContent = `THREATS: ${state.wordsCleared}/${state.wordsNeeded}`;
  hudScore.textContent = `SCORE: ${state.score}`;
};

const renderInput = (state) => {
  currentInputEl.textContent = state.currentInput ? `> ${state.currentInput}_` : '';
};

const renderWords = (state) => {
  wordLayer.textContent = '';
  state.words.forEach((word) => {
    const wordEl = document.createElement('div');
    wordEl.className = word.id === state.activeWordId ? 'word active' : 'word';
    wordEl.style.left = `${word.x}px`;
    wordEl.style.top = `${word.y}px`;

    const completed = document.createElement('span');
    completed.className = 'completed';
    completed.textContent = word.text.slice(0, word.progress);

    const remaining = document.createElement('span');
    remaining.className = 'remaining';
    remaining.textContent = word.text.slice(word.progress);

    wordEl.append(completed, remaining);
    wordLayer.append(wordEl);
  });
};

const renderExplosions = (state) => {
  explosionLayer.textContent = '';
  const now = Date.now();
  state.explosions.forEach((exp) => {
    const age = now - exp.time;
    const opacity = Math.max(1 - age / 500, 0);
    const scale = 1 + age / 500;

    const expEl = document.createElement('div');
    expEl.className = 'explosion';
    expEl.style.left = `${exp.x}px`;
    expEl.style.top = `${exp.y}px`;
    expEl.style.opacity = String(opacity);
    expEl.style.transform = `scale(${scale})`;
    expEl.textContent = '*';

    explosionLayer.append(expEl);
  });
};

const renderLevelUp = (state) => {
  if (state.levelUp) {
    levelUpEl.classList.remove('hidden');
    levelUpEl.textContent = `LEVEL ${state.level} COMPLETE!`;
  } else {
    levelUpEl.classList.add('hidden');
    levelUpEl.textContent = '';
  }
};

const renderOverlay = (state, levelConfig) => {
  if (state.victory) {
    overlay.classList.remove('hidden');
    overlay.classList.remove('intro');
    overlay.classList.remove('gameover');
    overlay.classList.add('victory');
    overlay.innerHTML = `
      <div>
        <div class="victory-title">SYSTEM SECURED</div>
        <div class="stat">All threats neutralized</div>
        <div class="stat">Final Score: ${state.score}</div>
        <div class="prompt">Press ENTER to play again</div>
      </div>
    `;
    return;
  }

  if (state.gameOver) {
    overlay.classList.remove('hidden');
    overlay.classList.remove('intro');
    overlay.classList.remove('victory');
    overlay.classList.add('gameover');
    overlay.innerHTML = `
      <div>
        <div class="title">SYSTEM COMPROMISED</div>
        <div class="stat">Level Reached: ${state.level}</div>
        <div class="stat">Final Score: ${state.score}</div>
        <div class="prompt">Press ENTER to restart</div>
      </div>
    `;
    return;
  }

  if (!state.started) {
    overlay.classList.remove('hidden');
    overlay.classList.remove('gameover');
    overlay.classList.remove('victory');
    overlay.classList.add('intro');
    overlay.innerHTML = `
      <div>
        <div class="intro-title">LEVEL ${state.level}: ${levelConfig.theme}</div>
        <div class="intro-text">Type the falling words to neutralize threats</div>
        <div class="intro-text">Clear ${state.wordsNeeded} words to advance to the next level!</div>
        <div class="intro-hint">Start typing to begin!</div>
      </div>
    `;
    return;
  }

  overlay.classList.add('hidden');
  overlay.classList.remove('intro');
  overlay.classList.remove('gameover');
  overlay.classList.remove('victory');
  overlay.textContent = '';
};

export const render = (state, levelConfig) => {
  renderHud(state, levelConfig);
  renderInput(state);
  renderWords(state);
  renderExplosions(state);
  renderLevelUp(state);
  renderOverlay(state, levelConfig);
};

export const updateSize = (state) => {
  const newWidth = Math.max(Math.floor(window.innerWidth * 0.9), 400);
  const targetHeight = 720;
  const viewportHeight = Math.floor(window.innerHeight * 0.9);
  const newHeight = Math.max(Math.min(viewportHeight, targetHeight), 500);

  state.playfieldWidth = newWidth;
  state.playfieldHeight = newHeight;
  playfield.style.width = `${newWidth}px`;
  playfield.style.height = `${newHeight}px`;
};
