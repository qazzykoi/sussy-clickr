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
  equippedRelics: [],
  serverGrid: Array(9).fill(null),
  activeChallenge: null,
  completedChallenges: [],
  positions: [],
  lastSaved: 0
};

function deepMergeDefaults(defaults, saved) {
  const result = { ...defaults };
  for (const key in defaults) {
    if (saved && saved[key] !== undefined) {
      if (
        typeof defaults[key] === 'object' &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key]) &&
        typeof saved[key] === 'object' &&
        saved[key] !== null &&
        !Array.isArray(saved[key])
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
  const keys = [SAVE_KEY, 'sussy_clicker_save_v4', 'sussy_clicker_save', 'playerData'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const saved = JSON.parse(raw);
      if (saved.susPoints === undefined) {
        saved.susPoints = saved.sus ?? saved.points ?? saved.currency;
      }
      return deepMergeDefaults(DEFAULT_GAME, saved);
    } catch (error) {
      console.error('Unable to load the saved game data:', error);
    }
  }

  const legacyCash = Number(localStorage.getItem('playerSusCurrency'));
  return {
    ...DEFAULT_GAME,
    costs: { ...DEFAULT_GAME.costs },
    equippedRelics: [],
    serverGrid: [...DEFAULT_GAME.serverGrid],
    completedChallenges: [],
    positions: [],
    susPoints: Number.isFinite(legacyCash) ? legacyCash : DEFAULT_GAME.susPoints
  };
}

window.game = loadSharedGame();

function saveSharedGame() {
  window.game.lastSaved = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(window.game));
}

function getSus() {
  return Math.floor(game.susPoints);
}

function saveSus(newAmount) {
  game.susPoints = Math.max(0, newAmount);
  saveSharedGame();
  const el = document.getElementById('global-sus') || document.getElementById('balance-display');
  if (el) el.innerText = game.susPoints.toLocaleString();
}

function hasRelic(id) {
  return game.equippedRelics && game.equippedRelics.includes(id);
}
