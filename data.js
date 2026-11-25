const SAVE_KEY = 'sussy_clicker_save_v5';
const SAVE_BACKUP_KEY = `${SAVE_KEY}_backup`;
const SAVE_VERSION = 1;

const DEFAULT_GAME = {
  saveVersion: SAVE_VERSION,
  susPoints: 0,
  basePointsPerClick: 1,
  baseAutoSusPerSecond: 0,
  prestigeMultiplier: 1,
  winPrice: 1000000000,
  baseWinPrice: 1000000000,
  worldOneWon: false,
  marsUnlocked: false,
  marsLandingSeen: false,
  marsWon: false,
  currentWorld: 'earth',
  marsBusinesses: {
    dustMine: 0,
    domeResort: 0,
    roverRacing: 0,
    relicExchange: 0,
    orbitalPort: 0,
    terraforming: 0
  },
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
  const result = { ...defaults, ...(saved || {}) };
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
  const keys = [SAVE_KEY, SAVE_BACKUP_KEY, 'sussy_clicker_save_v4', 'sussy_clicker_save', 'playerData'];
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    let saved;
    try {
      saved = JSON.parse(raw);
      if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
        throw new Error('Saved game has an invalid format.');
      }
      if (saved.susPoints === undefined) {
        saved.susPoints = saved.sus ?? saved.points ?? saved.currency;
      }
    } catch (error) {
      console.error('Unable to load the saved game data:', error);
      continue;
    }

    const migrated = deepMergeDefaults(DEFAULT_GAME, saved);
    migrated.saveVersion = Math.max(Number(saved.saveVersion) || 0, SAVE_VERSION);
    if (key !== SAVE_KEY || !Number.isFinite(Number(saved.saveVersion)) || Number(saved.saveVersion) < SAVE_VERSION) {
      try {
        if (key !== SAVE_BACKUP_KEY) localStorage.setItem(SAVE_BACKUP_KEY, raw);
        localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
      } catch (error) {
        console.error('Unable to migrate the saved game data:', error);
      }
    }
    return migrated;
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
  const previousSave = localStorage.getItem(SAVE_KEY);
  if (previousSave) {
    let parsedPrevious;
    try {
      parsedPrevious = JSON.parse(previousSave);
    } catch (error) {
      console.error('Unable to parse the previous save for backup:', error);
    }
    if (parsedPrevious && typeof parsedPrevious === 'object' && !Array.isArray(parsedPrevious)) {
      localStorage.setItem(SAVE_BACKUP_KEY, previousSave);
    }
  }
  window.game.saveVersion = Math.max(Number(window.game.saveVersion) || 0, SAVE_VERSION);
  localStorage.setItem(SAVE_KEY, JSON.stringify(window.game));
}

window.addEventListener('app:before-update', (event) => {
  try {
    saveSharedGame();
  } catch (error) {
    event.preventDefault();
    console.error('Unable to save the game before updating:', error);
  }
});

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
