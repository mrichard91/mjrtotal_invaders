// Level configuration — add a level by adding an entry to this array.

export const levels = [
  {
    theme: 'x86 ASSEMBLY',
    words: [
      'mov', 'push', 'pop', 'jmp', 'call', 'ret', 'add', 'sub', 'inc', 'dec',
      'cmp', 'test', 'jz', 'jnz', 'int', 'xor', 'and', 'or', 'shl', 'shr',
      'lea', 'nop', 'mul', 'div', 'neg'
    ],
    wordsNeeded: 12,
    maxOnScreen: 3,
    spawnRateMs: 2200,
    baseSpeed: 0.45,
    speedVariance: 0.2,
    initialSpawnCount: 2,
  },
  {
    theme: 'ANSI C FUNCTIONS',
    words: [
      'printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc', 'strlen', 'strcpy', 'strcat',
      'strcmp', 'strncpy', 'memcpy', 'memset', 'memmove', 'fopen', 'fclose', 'fread', 'fwrite',
      'fprintf', 'fscanf', 'fgets', 'fputs', 'getchar', 'putchar', 'atoi', 'atof', 'sprintf',
      'sscanf', 'strstr', 'strchr', 'strtok', 'rand', 'srand', 'exit', 'abort'
    ],
    wordsNeeded: 15,
    maxOnScreen: 3,
    spawnRateMs: 2000,
    baseSpeed: 0.48,
    speedVariance: 0.2,
    initialSpawnCount: 2,
  },
  {
    theme: 'YARA RULES',
    words: [
      'all', 'and', 'any', 'ascii', 'at', 'base64', 'base64wide', 'condition',
      'contains', 'endswith', 'entrypoint', 'false', 'filesize', 'for', 'fullword', 'global',
      'import', 'icontains', 'iendswith', 'iequals', 'in', 'include', 'int16', 'int16be',
      'int32', 'int32be', 'int8', 'int8be', 'istartswith', 'matches', 'meta', 'nocase',
      'none', 'not', 'of', 'or', 'private', 'rule', 'startswith', 'strings',
      'them', 'true', 'uint16', 'uint16be', 'uint32', 'uint32be', 'uint8', 'uint8be',
      'wide', 'xor', 'defined'
    ],
    wordsNeeded: 18,
    maxOnScreen: 5,
    spawnRateMs: 1400,
    baseSpeed: 0.65,
    speedVariance: 0.2,
    initialSpawnCount: 3,
  },
  {
    theme: 'SECURITY CONCEPTS',
    words: [
      'firewall', 'encrypt', 'decrypt', 'sandbox', 'debugger', 'breakpoint', 'heap',
      'stack', 'buffer', 'overflow', 'injection', 'fuzzing', 'signature', 'heuristic',
      'rootkit', 'keylogger', 'phishing', 'payload', 'exploit', 'shellcode',
      'backdoor', 'trojan', 'ransomware', 'botnet', 'sniffer'
    ],
    wordsNeeded: 20,
    maxOnScreen: 5,
    spawnRateMs: 1100,
    baseSpeed: 0.75,
    speedVariance: 0.2,
    initialSpawnCount: 3,
  },
  {
    theme: 'ADVANCED THREATS',
    words: [
      'polymorphic', 'obfuscation', 'persistence', 'exfiltration', 'lateral',
      'privilege', 'escalation', 'credential', 'hijacking', 'enumeration',
      'reconnaissance', 'pivoting', 'evasion', 'implant', 'beacon',
      'callback', 'dropper', 'stager', 'loader', 'packer'
    ],
    wordsNeeded: 22,
    maxOnScreen: 6,
    spawnRateMs: 900,
    baseSpeed: 0.85,
    speedVariance: 0.2,
    initialSpawnCount: 3,
  },
  {
    theme: 'BOSS: APT CAMPAIGN',
    words: [
      'supplychain', 'zeroday', 'cobaltstrike', 'lazarus', 'sandworm',
      'diamondmodel', 'killchain', 'threatactor', 'commandcontrol', 'wateringhole',
      'spearphish', 'livingoffland', 'fileless', 'credential', 'doublepulsar',
      'eternalblue', 'wannacry', 'notpetya', 'stuxnet', 'solarwinds',
      'mitrattack', 'iocfeed', 'sigmarule', 'yarascan', 'volatility'
    ],
    wordsNeeded: 25,
    maxOnScreen: 7,
    spawnRateMs: 750,
    baseSpeed: 0.95,
    speedVariance: 0.25,
    initialSpawnCount: 3,
  },
];

export const getLevelConfig = (levelNumber) =>
  levels[Math.min(levelNumber - 1, levels.length - 1)];

export const isFinalLevel = (levelNumber) => levelNumber >= levels.length;

export const getInitialLevel = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const levelParam = parseInt(params.get('level'), 10);
    if (Number.isFinite(levelParam)) {
      return Math.min(Math.max(levelParam, 1), levels.length);
    }
  } catch (_) {
    return 1;
  }
  return 1;
};
