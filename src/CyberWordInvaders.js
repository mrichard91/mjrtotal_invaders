import React, { useState, useEffect, useRef, useCallback } from 'react';

const CyberWordInvaders = () => {
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [wordsCleared, setWordsCleared] = useState(0);
  const [wordsNeeded, setWordsNeeded] = useState(25);
  const [wordsSpawned, setWordsSpawned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [activeWordId, setActiveWordId] = useState(null);
  const [explosions, setExplosions] = useState([]);
  const [levelUp, setLevelUp] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const gameLoopRef = useRef();

  const wordLists = {
    1: ['mov', 'push', 'pop', 'jmp', 'call', 'ret', 'xor', 'lea', 'test', 'cmp', 'add', 'sub',
        'mul', 'div', 'inc', 'dec', 'nop', 'int', 'jne', 'je', 'jz', 'jnz', 'jg', 'jl', 'and',
        'or', 'not', 'shl', 'shr', 'rol', 'ror', 'neg', 'imul', 'idiv', 'cdq', 'cbw', 'lodsb',
        'stosb', 'movsb', 'scasb', 'cmpsb', 'rep', 'repe', 'repne', 'loop', 'jbe', 'ja', 'jna',
        'jge', 'jle', 'jc', 'jnc', 'jo', 'jno', 'js', ],
    2: ['printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc', 'strlen', 'strcpy', 'strcat',
        'strcmp', 'strncpy', 'memcpy', 'memset', 'memmove', 'fopen', 'fclose', 'fread', 'fwrite',
        'fprintf', 'fscanf', 'fgets', 'fputs', 'getchar', 'putchar', 'atoi', 'atof', 'sprintf',
        'sscanf', 'strstr', 'strchr', 'strtok', 'rand', 'srand', 'exit', 'abort'],
    3: ['shellcode', 'payload', 'exploit', 'backdoor', 'rootkit', 'ransomware', 'trojan',
        'malware', 'virus', 'worm', 'packer', 'unpacker', 'obfuscate', 'decompile'],
    4: ['firewall', 'encrypt', 'decrypt', 'sandbox', 'debugger', 'breakpoint', 'heap',
        'stack', 'buffer', 'overflow', 'injection', 'fuzzing', 'signature', 'heuristic']
  };

  const getRandomWord = useCallback(() => {
    const list = wordLists[Math.min(level, 4)] || wordLists[4];
    return list[Math.floor(Math.random() * list.length)];
  }, [level]);

  const getSpawnRate = useCallback(() => {
    return Math.max(600 - (level * 50), 150);
  }, [level]);

  const getWordSpeed = useCallback(() => {
    return 0.4 + (level * 0.2) + Math.random() * 0.4;
  }, [level]);

  const getMaxWords = useCallback(() => {
    return 10 + Math.floor(level / 2);
  }, [level]);

  const getLevelTheme = () => {
    const themes = {
      1: 'x86 ASSEMBLY',
      2: 'ANSI C FUNCTIONS',
      3: 'MALWARE TERMS',
      4: 'SECURITY CONCEPTS',
      5: 'ADVANCED THREATS'
    };
    return themes[Math.min(level, 5)] || themes[5];
  };

  // Initialize game with 5 words at start
  useEffect(() => {
    if (!initialized && !gameOver) {
      const initialWords = [];
      const usedPositions = [];

      for (let i = 0; i < 5; i++) {
        let wordX = Math.random() * 650 + 20;
        let attempts = 0;
        while (usedPositions.some(pos => Math.abs(pos - wordX) < 80) && attempts < 20) {
          wordX = Math.random() * 650 + 20;
          attempts++;
        }

        usedPositions.push(wordX);

        initialWords.push({
          id: Date.now() + Math.random() + i,
          text: getRandomWord(),
          x: wordX,
          y: Math.random() * -200,
          speed: getWordSpeed(),
          progress: 0,
        });
      }

      setWords(initialWords);
      setWordsSpawned(5);
      setInitialized(true);
    }
  }, [initialized, gameOver, getRandomWord, getWordSpeed]);

  useEffect(() => {
    if (wordsCleared >= wordsNeeded) {
      // Clear remaining words
      setWords([]);
      setLevel(prev => prev + 1);
      setWordsCleared(0);
      setWordsSpawned(0);
      setWordsNeeded(25);
      setLevelUp(true);
      setTimeout(() => setLevelUp(false), 2000);
    }
  }, [wordsCleared, wordsNeeded]);

  useEffect(() => {
    if (gameOver) return;

    const spawnInterval = setInterval(() => {
      let shouldIncrement = false;

      setWordsSpawned(currentSpawned => {
        // Stop spawning if we've spawned enough words for this level
        if (currentSpawned >= wordsNeeded) {
          return currentSpawned;
        }

        setWords(prev => {
          // Limit max words on screen based on level
          if (prev.length >= getMaxWords()) {
            return prev;
          }

          const newWord = {
            id: Date.now() + Math.random(),
            text: getRandomWord(),
            x: Math.random() * 550 + 20,
            y: 0,
            speed: getWordSpeed(),
            progress: 0,
          };
          shouldIncrement = true;
          return [...prev, newWord];
        });

        return shouldIncrement ? currentSpawned + 1 : currentSpawned;
      });
    }, getSpawnRate());

    return () => clearInterval(spawnInterval);
  }, [gameOver, wordsNeeded, getMaxWords, getRandomWord, getWordSpeed, getSpawnRate]);

  useEffect(() => {
    if (gameOver) return;

    const animate = () => {
      setWords(prev => {
        const updated = prev.map(word => ({
          ...word,
          y: word.y + word.speed
        })).filter(word => {
          if (word.y > 520) {
            setGameOver(true);
            return false;
          }
          return true;
        });
        return updated;
      });
      gameLoopRef.current = requestAnimationFrame(animate);
    };

    gameLoopRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameOver]);

  useEffect(() => {
    const timer = setInterval(() => {
      setExplosions(prev => prev.filter(e => Date.now() - e.time < 500));
    }, 100);
    return () => clearInterval(timer);
  }, [explosions]);

  const handleKeyPress = useCallback((e) => {
    if (gameOver) {
      if (e.key === 'Enter') restartGame();
      return;
    }

    const key = e.key.toLowerCase();

    if (key.length === 1 && key.match(/[a-z0-9]/)) {
      const newInput = currentInput + key;

      let targetWord = null;
      if (activeWordId) {
        targetWord = words.find(w => w.id === activeWordId);
      }

      if (!targetWord || !targetWord.text.startsWith(newInput)) {
        // Reset progress on previously active word
        if (activeWordId) {
          setWords(prev => prev.map(w =>
            w.id === activeWordId ? { ...w, progress: 0 } : w
          ));
        }

        // Find all matching words and pick the lowest one (highest y value)
        const matchingWords = words.filter(w => w.text.startsWith(newInput) && w.progress === 0);
        if (matchingWords.length > 0) {
          targetWord = matchingWords.reduce((lowest, current) =>
            current.y > lowest.y ? current : lowest
          );
          setActiveWordId(targetWord.id);
        }
      }

      if (targetWord && targetWord.text.startsWith(newInput)) {
        setCurrentInput(newInput);

        setWords(prev => prev.map(w =>
          w.id === targetWord.id
            ? { ...w, progress: newInput.length }
            : w
        ));

        if (newInput === targetWord.text) {
          explodeWord(targetWord);
          setCurrentInput('');
          setActiveWordId(null);
        }
      } else {
        setCurrentInput('');
        setActiveWordId(null);
      }
    } else if (e.key === 'Backspace') {
      setCurrentInput(prev => prev.slice(0, -1));
    } else if (e.key === 'Escape') {
      setCurrentInput('');
      setActiveWordId(null);
    }
  }, [gameOver, currentInput, activeWordId, words, explodeWord, restartGame]);

  const explodeWord = useCallback((word) => {
    setWords(prev => prev.filter(w => w.id !== word.id));
    setScore(s => s + word.text.length * 10);
    setWordsCleared(c => c + 1);
    setExplosions(e => [...e, { x: word.x, y: word.y, time: Date.now() }]);
  }, []);

  const restartGame = useCallback(() => {
    setWords([]);
    setScore(0);
    setLevel(1);
    setWordsCleared(0);
    setWordsSpawned(0);
    setWordsNeeded(25);
    setGameOver(false);
    setCurrentInput('');
    setActiveWordId(null);
    setExplosions([]);
    setLevelUp(false);
    setInitialized(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#000',
      margin: 0,
      padding: 20
    }}>
      <div style={{ 
        position: 'relative', 
        width: '800px', 
        height: '600px', 
        background: 'linear-gradient(to bottom, #1a1a2e, #000)',
        border: '4px solid #0f0',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(0, 255, 0, 0.3)'
      }}>
        
        {/* HUD */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px', 
          right: '20px', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          <div style={{ 
            color: '#0f0', 
            fontFamily: 'monospace', 
            fontSize: '18px',
            textShadow: '0 0 10px #0f0'
          }}>
            LEVEL {level}: {getLevelTheme()}
          </div>
          
          <div style={{ 
            color: '#0ff', 
            fontFamily: 'monospace', 
            fontSize: '18px',
            textShadow: '0 0 10px #0ff'
          }}>
            THREATS: {wordsCleared}/{wordsNeeded}
          </div>
          
          <div style={{ 
            color: '#0f0', 
            fontFamily: 'monospace', 
            fontSize: '18px',
            textShadow: '0 0 10px #0f0'
          }}>
            SCORE: {score}
          </div>
        </div>

        {/* Current input */}
        <div style={{ 
          position: 'absolute', 
          top: '60px', 
          left: '20px', 
          color: '#0ff', 
          fontFamily: 'monospace', 
          fontSize: '18px',
          textShadow: '0 0 10px #0ff'
        }}>
          {currentInput && `> ${currentInput}_`}
        </div>

        {/* Words */}
        {words.map(word => {
          const isActive = word.id === activeWordId;
          const completed = word.text.substring(0, word.progress);
          const remaining = word.text.substring(word.progress);
          
          return (
            <div
              key={word.id}
              style={{
                position: 'absolute',
                left: `${word.x}px`,
                top: `${word.y}px`,
                fontFamily: 'monospace',
                fontSize: '28px',
                fontWeight: 'bold',
                textShadow: isActive ? '0 0 15px #ff0' : '0 0 10px #f00',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: '#0f0' }}>{completed}</span>
              <span style={{ color: isActive ? '#ff0' : '#f00' }}>{remaining}</span>
            </div>
          );
        })}

        {/* Explosions */}
        {explosions.map((exp, i) => {
          const age = Date.now() - exp.time;
          const opacity = 1 - age / 500;
          const scale = 1 + age / 500;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${exp.x}px`,
                top: `${exp.y}px`,
                fontSize: '48px',
                opacity: opacity,
                transform: `scale(${scale})`,
                pointerEvents: 'none',
                transition: 'all 0.1s'
              }}
            >
              💥
            </div>
          );
        })}

        {/* Level Up notification */}
        {levelUp && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#0ff',
            fontFamily: 'monospace',
            fontSize: '48px',
            fontWeight: 'bold',
            textShadow: '0 0 30px #0ff',
            zIndex: 15,
            animation: 'pulse 0.5s ease-in-out'
          }}>
            LEVEL {level} COMPLETE!
          </div>
        )}

        {/* Game Over */}
        {gameOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                color: '#f00', 
                fontFamily: 'monospace', 
                fontSize: '60px', 
                marginBottom: '20px',
                textShadow: '0 0 20px #f00'
              }}>
                SYSTEM COMPROMISED
              </div>
              <div style={{ 
                color: '#0f0', 
                fontFamily: 'monospace', 
                fontSize: '30px', 
                marginBottom: '10px',
                textShadow: '0 0 10px #0f0'
              }}>
                Level Reached: {level}
              </div>
              <div style={{ 
                color: '#0f0', 
                fontFamily: 'monospace', 
                fontSize: '30px', 
                marginBottom: '40px',
                textShadow: '0 0 10px #0f0'
              }}>
                Final Score: {score}
              </div>
              <div style={{ 
                color: '#0ff', 
                fontFamily: 'monospace', 
                fontSize: '20px',
                textShadow: '0 0 10px #0ff'
              }}>
                Press ENTER to restart
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {words.length === 0 && !gameOver && level === 1 && wordsCleared === 0 && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', fontFamily: 'monospace', color: '#0f0' }}>
              <div style={{ fontSize: '36px', marginBottom: '20px', textShadow: '0 0 15px #0f0' }}>
                LEVEL 1: {getLevelTheme()}
              </div>
              <div style={{ fontSize: '20px', textShadow: '0 0 10px #0f0', marginBottom: '10px' }}>
                Type the falling words to neutralize threats
              </div>
              <div style={{ fontSize: '16px', textShadow: '0 0 10px #0f0' }}>
                Clear {wordsNeeded} words to advance to the next level!
              </div>
              <div style={{ fontSize: '16px', marginTop: '10px', textShadow: '0 0 10px #0f0' }}>
                Start typing to begin!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CyberWordInvaders;
