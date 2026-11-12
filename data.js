const SAVE_KEY = 'sussy_clicker_save_v5';

const DEFAULT_GAME = {
  susPoints: 0,
  basePointsPerClick: 1,
  baseAutoSusPerSecond: 0,
  prestigeMultiplier: 1,
  winPrice: 1000000000,
  baseWinPrice: 1000000000,
  totalLosses: 0,
  costs: { disguise: 15, vent: 100 },
  equippedRelics: [], // Up to 2 active relics across all pages
  serverGrid: Array(9).fill(null), // 3x3 synergy grid
  activeChallenge: null,
  completedChallenges: [],
  lastSaved: 0
};

let game = loadSharedGame();

function loadSharedGame() {
  // Migrate from v4 if present
  const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('sussy_clicker_save_v4');
  if (!raw) return JSON.parse(JSON.stringify(DEFAULT_GAME));
  try {
    return Object.assign(JSON.parse(JSON.stringify(DEFAULT_GAME)), JSON.parse(raw));
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_GAME));
  }
}

function saveSharedGame() {
  game.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function hasRelic(id) {
  return game.equippedRelics && game.equippedRelics.includes(id);
}
function deepMergeDefaults(defaults, saved) {
  const result = { ...defaults };
  for (const key in defaults) {
    if (saved && saved[key] !== undefined) {
      // If both are plain objects (like game.costs), merge inside them too
      if (
        typeof defaults[key] === 'object' &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key])
      ) {
        result[key] = deepMergeDefaults(defaults[key], saved[key]);
      } else {
        result[key] = saved[key];
      }
    }
  }
  return result;
}

function loadSharedGame() {
  const raw = localStorage.getItem(SAVE_KEY) || localStorage.getItem('sussy_clicker_save_v4');
  if (!raw) return JSON.parse(JSON.stringify(DEFAULT_GAME));
  try {
    const parsed = JSON.parse(raw);
    return deepMergeDefaults(DEFAULT_GAME, parsed);
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_GAME));
  }
}
