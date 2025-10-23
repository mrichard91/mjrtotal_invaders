# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a typing game called "Cyber Word Invaders" built with React. It's a Space Invaders-style game where players type cybersecurity-related words (assembly instructions, malware terms, reverse engineering tools) to destroy falling threats before they reach the bottom of the screen.

## Development Commands

- `npm start` - Run development server at http://localhost:3000
- `npm test` - Run tests in interactive watch mode
- `npm run build` - Create production build in `/build` folder

## Architecture

**Single Component Design**: The entire game logic lives in `CyberWordInvaders.js` (430+ lines), which is rendered by a minimal `App.js` wrapper. All game state, rendering, and logic are handled in this one component.

**Key State Management**:
- Words are spawned at intervals and fall at varying speeds based on level
- Game uses `requestAnimationFrame` for smooth word movement animation
- Level progression occurs when `wordsCleared >= wordsNeeded` and all words are cleared
- Typing progress is tracked per-word with partial highlighting (completed chars in green, remaining in red/yellow)
- Active word targeting: once you start typing a word, you're locked to that word until completion or reset

**Game Mechanics**:
- Spawn rate: Decreases by 100ms per level (min 300ms)
- Word speed: Increases by 0.2px/frame per level + random variance
- Max simultaneous words: 3 + floor(level/2)
- Scoring: 10 points per character typed
- Game over: Any word reaching y > 520

**Word Pool**: Hardcoded array in `CyberWordInvaders.js:16-24` containing ~50 cybersecurity terms (yara, ghidra, shellcode, assembly instructions, etc.)

**Level Themes**: Cosmetic labels only, defined in `getLevelTheme()` (x86 ASSEMBLY, C++ STDLIB, PYTHON ASYNCIO, RUST, MALWARE ANALYSIS)
