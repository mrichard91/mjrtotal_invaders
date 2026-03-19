# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a typing game called "Cyber Word Invaders" — a Space Invaders-style game where players type cybersecurity-related words (assembly instructions, YARA keywords, security concepts, APT terms) to destroy falling threats before they reach the bottom of the screen.

## Development Commands

- `node server.js` - Run dev server at http://localhost:5173
- Open `public/index.html` directly in a browser (ES modules require a server)

## Architecture

**Modular ES Modules** in `public/`:

| File | Role | Imports |
|------|------|---------|
| `levels.js` | Level config array + helpers (`getLevelConfig`, `isFinalLevel`, `getInitialLevel`) | None |
| `state.js` | State factory (`createInitialState`, `resetForLevel`) + word picking (`pickWord`, `markWordUsed`) | `levels.js` |
| `renderer.js` | All DOM rendering (`render`, `updateSize`) — no game logic | None |
| `game.js` | Entry point: boot, game loop, input, spawning, level transitions | All above |

Entry point: `<script type="module" src="game.js">` in `index.html`.

**Data-Driven Levels**: Each level is a config object in the `levels` array (`levels.js`). Adding a level = adding an entry. 6 levels total with a victory condition after the last.

Level config fields: `theme`, `words`, `wordsNeeded`, `maxOnScreen`, `spawnRateMs`, `baseSpeed`, `speedVariance`, `initialSpawnCount`.

**Key State Management**:
- Words are spawned at intervals and fall at varying speeds based on level config
- Game uses `requestAnimationFrame` for smooth word movement animation
- Level progression occurs when `wordsCleared >= wordsNeeded` and all on-screen words are cleared
- Typing progress is tracked per-word with partial highlighting (completed chars in green, remaining in red/yellow)
- Active word targeting: once you start typing a word, you're locked to that word until completion or reset
- `usedWordsThisLevel` Set prevents word repetition within a level
- `levelUpPaused` flag blocks spawning + movement during 2-second level transition
- `state.started` flag controls intro overlay (not fragile level check)
- Victory screen after completing all 6 levels

**Game Mechanics** (per-level config):
- Spawn rate: 2200ms (level 1) down to 750ms (level 6)
- Word speed: 0.45 (level 1) up to 0.95 (level 6) + random variance
- Max simultaneous words: 3 (level 1) up to 7 (level 6)
- Scoring: 10 points per character typed
- Game over: Any word reaching bottom of playfield
