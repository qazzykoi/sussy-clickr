const planet = document.body.dataset.planet;
const game = window.game;
const planetContent = document.getElementById('planet-content');
const planetNames = { void: 'VOID 3002' };
const planetBoosts = { void: 1.65 };
const unlocked = { void: Boolean(game.voidUnlocked || game.marsWon) };
const currency = (amount) => `$${formatCompactNumber(amount)}`;
const save = () => saveSharedGame();
const boost = planetBoosts[planet];

const diamonds = [
  { id: 'clear', name: 'Natural Clear', family: 'Earth · colorless', tier: 0, value: 30 },
  { id: 'lab', name: 'Lab-Grown', family: 'Earth · cultured', tier: 0, value: 24 },
  { id: 'blue', name: 'Blue Diamond', family: 'Earth · fancy color', tier: 1, value: 110 },
  { id: 'pink', name: 'Pink Diamond', family: 'Earth · fancy color', tier: 1, value: 135 },
  { id: 'yellow', name: 'Yellow Diamond', family: 'Earth · fancy color', tier: 1, value: 95 },
  { id: 'green', name: 'Green Diamond', family: 'Earth · fancy color', tier: 2, value: 210 },
  { id: 'red', name: 'Red Diamond', family: 'Earth · fancy color', tier: 2, value: 360 },
  { id: 'black', name: 'Black Diamond', family: 'Earth · carbonado', tier: 2, value: 175 },
  { id: 'orange', name: 'Orange Diamond', family: 'Earth · fancy color', tier: 3, value: 420 },
  { id: 'purple', name: 'Purple Diamond', family: 'Earth · fancy color', tier: 3, value: 490 },
  { id: 'boron', name: 'Boron-Blue Diamond', family: 'Metal-rich inclusion', tier: 4, value: 900 },
  { id: 'platinum', name: 'Platinum-Matrix Diamond', family: 'Rare-metal composite', tier: 5, value: 1800 },
  { id: 'palladium', name: 'Palladium Lattice', family: 'Rare-metal composite', tier: 6, value: 3400 },
  { id: 'iridium', name: 'Iridium Heart', family: 'Rare-metal composite', tier: 7, value: 6800 },
  { id: 'abyssal', name: 'Abyssal Prism', family: 'Neptune anomaly', tier: 8, value: 18000 },
  { id: 'chrono', name: 'Chronoheart', family: 'Neptune anomaly', tier: 9, value: 52000 },
  { id: 'singularity', name: 'Singularity Diamond', family: 'Neptune anomaly', tier: 10, value: 150000 }
];

function ensurePlanetState() {
  game.jupiterGame ||= { heroes: 0, heroLevel: 0, keisDefeated: 0, keisDefeatedTotal: 0, keisHp: 0 };
  game.neptuneGame ||= { excavators: 0, drillLevel: 0, diamondStock: {}, selectedDiamond: 'clear', memeCoin: { created: false, level: 0, treasury: 0 }, bankingApp: { created: false, level: 0, treasury: 0 }, lastSimulationAt: 0 };
  game.voidGame ||= { revenueLevel: 0, intervalLevel: 0, cycles: 0, lastPayout: 0, consoleCompany: { founded: false, level: 0 }, carCompany: { founded: false, level: 0 } };
  game.jupiterGame.keisDefeatedTotal ??= game.jupiterGame.keisDefeated || 0;
  game.jupiterGame.keisHp ??= 0;
  game.neptuneGame.diamondStock ||= {};
  game.neptuneGame.selectedDiamond ||= 'clear';
  game.neptuneGame.lastSimulationAt ||= (game.lastSaved > 0 ? game.lastSaved : Date.now());
  game.neptuneGame.memeCoin ||= { created: false, level: 0, treasury: 0, history: [] };
  game.neptuneGame.memeCoin.history ||= [];
  game.neptuneGame.bankingApp ||= { created: false, level: 0, treasury: 0, nodes: null, usage: 100 };
  game.neptuneGame.bankingApp.nodes ||= {
    auth: { x: 18, y: 30 }, wallet: { x: 72, y: 22 }, yield: { x: 68, y: 72 }, support: { x: 22, y: 78 }
  };
  game.neptuneGame.bankingApp.usage ||= 100;
  game.voidGame.consoleCompany ||= { founded: false, level: 0, features: { hardware: 0, studio: 0, ecosystem: 0 } };
  game.voidGame.consoleCompany.features ||= { hardware: 0, studio: 0, ecosystem: 0 };
  game.voidGame.carCompany ||= { founded: false, level: 0, features: { engine: 0, aero: 0, factory: 0 } };
  game.voidGame.carCompany.features ||= { engine: 0, aero: 0, factory: 0 };
}

function updateHeader(output = 0, unit = 'SUS / sec') {
  document.getElementById('planet-name').textContent = planetNames[planet];
  document.getElementById('wallet').textContent = currency(game.susPoints);
  document.getElementById('wallet').title = game.susPoints.toLocaleString();
  document.getElementById('planet-output').textContent = `${formatCompactNumber(output)} ${unit}`;
  document.getElementById('planet-output').title = `${Math.floor(output).toLocaleString()} ${unit}`;
  document.getElementById('planet-boost').textContent = `+${Math.round((boost - 1) * 100)}%`;
}

function showLocked() {
  const requirements = {
    void: 'Conquer Mars on the Clicker page to open the Void industries.'
  };
  document.getElementById('locked-message').innerHTML = `<h2>Planet locked</h2><p>${requirements[planet]}</p><a class="action" href="index.html">Return to the Clicker</a>`;
  document.getElementById('locked-message').classList.remove('hidden');
  document.getElementById('planet-content').classList.add('hidden');
}

function renderNeptune() {
  const state = game.neptuneGame;
  const tierLimit = Math.min(10, state.drillLevel + 1);
  const selected = diamonds.find((item) => item.id === state.selectedDiamond) || diamonds[0];
  const miningRate = state.excavators * (0.08 + state.drillLevel * 0.02) * boost;
  const excavatorCost = Math.floor(250 * Math.pow(1.58, state.excavators));
  const drillCost = Math.floor(800 * Math.pow(1.72, state.drillLevel));
  const coin = state.memeCoin;
  const bank = state.bankingApp;
  const coinCost = Math.floor(8000 * Math.pow(1.9, coin.level));
  const bankCost = Math.floor(12000 * Math.pow(1.9, bank.level));
  const coinRate = coin.created ? (8 + coin.level * 10) * boost : 0;
  const bankRate = bank.created ? (12 + bank.level * 15) * boost : 0;
  const diamondOptions = diamonds.filter((item) => item.tier <= tierLimit).map((item) => `<option value="${item.id}" ${item.id === selected.id ? 'selected' : ''}>${item.name} · ${item.family}</option>`).join('');
  const diamondRows = diamonds.map((item) => {
    const stock = Number(state.diamondStock[item.id]) || 0;
    const available = item.tier <= tierLimit;
    return `<article class="list-item"><div><h3>${available ? item.name : 'Uncharted seam'}</h3><p>${available ? `${item.family} · ${currency(item.value)} each · Stock ${stock.toFixed(1)}` : `Drill rank ${item.tier} required`}</p></div><button class="action secondary" data-action="sell-diamond" data-id="${item.id}" ${!available || stock < 1 ? 'disabled' : ''}>Sell ${Math.floor(stock)}</button></article>`;
  }).join('');
  updateHeader(miningRate + coinRate + bankRate, 'mixed units / sec');
  planetContent.innerHTML = `
    <div class="columns">
      <section>
        <div class="panel">
          <div class="section-heading"><h2>Diamond extraction</h2><span>DRILL RANK ${state.drillLevel}</span></div>
          <p>Excavators extract the selected seam automatically. Manual sampling adds a batch immediately.</p>
          <label for="diamond-select" class="eyebrow">Active seam</label><select class="select" id="diamond-select">${diamondOptions}</select>
          <div class="stat-row" style="margin-top:12px"><span>Excavators</span><strong>${state.excavators}</strong></div>
          <div class="stat-row"><span>Selected seam rate</span><strong>${miningRate.toFixed(2)} / sec</strong></div>
          <div class="button-row"><button class="action" data-action="buy-excavator" ${game.susPoints < excavatorCost ? 'disabled' : ''}>Buy excavator · ${currency(excavatorCost)}</button><button class="action secondary" data-action="upgrade-drill" ${game.susPoints < drillCost ? 'disabled' : ''}>Upgrade drill · ${currency(drillCost)}</button><button class="action secondary" data-action="manual-mine">Mine sample</button></div>
        </div>
        <div class="section-heading"><h2>Seam inventory</h2><span>SELL TO THE OFF-WORLD MARKET</span></div>
        <div class="list">${diamondRows}</div>
      </section>
      <section>
        <div class="notice">Earth's natural, lab-grown, and fancy-color stones sit beside metal-rich composites and Neptune-only anomalies. The +30% planetary boost applies to extraction and venture returns.</div>
        <div class="section-heading"><h2>Neptune ventures</h2><span>SEPARATE TREASURIES</span></div>
        <div class="panel">
          <h2>🪙 Meme coin launchpad</h2>
          ${coin.created ? `<div class="stat-row"><span>Launch treasury</span><strong>${currency(coin.treasury)}</strong></div><div class="stat-row"><span>Viral campaign rank ${coin.level}</span><strong>${currency(coinRate)} / sec</strong></div><div class="button-row"><button class="action" data-action="upgrade-coin" ${game.susPoints < coinCost ? 'disabled' : ''}>Boost hype · ${currency(coinCost)}</button><button class="action secondary" data-action="collect-coin">Collect treasury</button></div>` : `<p>Create an independent token treasury, then buy viral campaigns to grow its SUS yield.</p><button class="action" data-action="create-coin" ${game.susPoints < 15000 ? 'disabled' : ''}>Launch coin · ${currency(15000)}</button>`}
        </div>
        <div class="panel">
          <h2>🏦 Banking app</h2>
          ${bank.created ? `<div class="stat-row"><span>Deposit treasury</span><strong>${currency(bank.treasury)}</strong></div><div class="stat-row"><span>Yield engine rank ${bank.level}</span><strong>${currency(bankRate)} / sec</strong></div><div class="button-row"><button class="action" data-action="upgrade-bank" ${game.susPoints < bankCost ? 'disabled' : ''}>Upgrade yield · ${currency(bankCost)}</button><button class="action secondary" data-action="collect-bank">Collect deposits</button></div>` : `<p>Found a separate deposit and yield engine. Upgrades increase its own compounding cash stream.</p><button class="action" data-action="create-bank" ${game.susPoints < 25000 ? 'disabled' : ''}>Open bank · ${currency(25000)}</button>`}
        </div>
      </section>
    </div>`;
}

function voidInterval() {
  return Math.max(150000, 3600000 - game.voidGame.intervalLevel * 57000);
}

function voidBaseRevenue() {
  const state = game.voidGame;
  const consoleFeatures = state.consoleCompany.features;
  const carFeatures = state.carCompany.features;
  const consoleRevenue = state.consoleCompany.founded
    ? 200000 * (state.consoleCompany.level + 1) * (1 + consoleFeatures.hardware * 0.08 + consoleFeatures.studio * 0.12 + consoleFeatures.ecosystem * 0.1)
    : 0;
  const carRevenue = state.carCompany.founded
    ? 350000 * (state.carCompany.level + 1) * (1 + carFeatures.engine * 0.1 + carFeatures.aero * 0.08 + carFeatures.factory * 0.14)
    : 0;
  return (consoleRevenue + carRevenue) * (1 + state.revenueLevel * 0.4) * boost;
}

function voidPayout() {
  return voidBaseRevenue() * Math.pow(1.3, game.voidGame.cycles);
}

function durationLabel(milliseconds) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', `${seconds}s`].filter(Boolean).join(' ');
}

let activeVoidTab = 'mining';

function coinHistoryValue() {
  const coin = game.neptuneGame.memeCoin;
  if (!coin.created) return 0;
  return 0.25 + coin.level * 0.18 + coin.treasury / 100000;
}

function updateCoinChart() {
  const coin = game.neptuneGame.memeCoin;
  if (!coin.created) return;
  let history = coin.history;
  if (!history.length) history = [coinHistoryValue()];
  if (history.length < 2) history = [...history, coinHistoryValue()];
  const min = Math.min(...history);
  const max = Math.max(...history);
  const spread = Math.max(0.01, max - min);
  const points = history.map((value, index) => {
    const x = history.length === 1 ? 0 : index / (history.length - 1) * 320;
    const y = 220 - ((value - min) / spread) * 180;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const line = document.querySelector('[data-void-chart-line]');
  const fill = document.querySelector('[data-void-chart-fill]');
  if (line) line.setAttribute('points', points);
  if (fill) fill.setAttribute('points', `0,250 ${points} 320,250`);
  const price = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : price;
  const change = previous ? (price - previous) / previous * 100 : 0;
  const priceLabel = document.querySelector('[data-void-coin-price]');
  const changeLabel = document.querySelector('[data-void-coin-change]');
  if (priceLabel) priceLabel.textContent = `$${price.toFixed(4)}`;
  if (changeLabel) {
    changeLabel.textContent = `${change >= 0 ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}% · live market`;
    changeLabel.style.color = change >= 0 ? '#00ff66' : '#ff444f';
  }
}

function bankUsageValue() {
  const nodes = game.neptuneGame.bankingApp.nodes;
  const targetX = 50;
  const targetY = 50;
  const spread = Object.values(nodes).reduce((total, node) => {
    return total + Math.max(0, 30 - Math.abs(node.x - targetX) - Math.abs(node.y - targetY) * 0.35);
  }, 0);
  return Math.min(999, Math.round(100 + game.neptuneGame.bankingApp.level * 38 + spread * 1.8));
}

function renderVoid() {
  const state = game.voidGame;
  const neptune = game.neptuneGame;
  const interval = voidInterval();
  const elapsed = Math.max(0, Date.now() - state.lastPayout);
  const remaining = Math.max(0, interval - elapsed);
  const intervalCost = Math.floor(750000 * Math.pow(1.68, state.intervalLevel));
  const revenueCost = Math.floor(900000 * Math.pow(1.85, state.revenueLevel));
  const consoleCost = state.consoleCompany.founded ? Math.floor(5000000 * Math.pow(1.75, state.consoleCompany.level)) : 25000000;
  const carCost = state.carCompany.founded ? Math.floor(9000000 * Math.pow(1.78, state.carCompany.level)) : 45000000;
  const tierLimit = Math.min(10, neptune.drillLevel + 1);
  const selected = diamonds.find((item) => item.id === neptune.selectedDiamond) || diamonds[0];
  const miningRate = neptune.excavators * (0.08 + neptune.drillLevel * 0.02) * boost;
  const excavatorCost = Math.floor(250 * Math.pow(1.58, neptune.excavators));
  const drillCost = Math.floor(800 * Math.pow(1.72, neptune.drillLevel));
  const coin = neptune.memeCoin;
  const bank = neptune.bankingApp;
  const coinCost = Math.floor(8000 * Math.pow(1.9, coin.level));
  const bankCost = Math.floor(12000 * Math.pow(1.9, bank.level));
  const coinRate = coin.created ? (8 + coin.level * 10) * boost : 0;
  const bankRate = bank.created ? (12 + bank.level * 15) * boost : 0;
  const diamondOptions = diamonds.filter((item) => item.tier <= tierLimit).map((item) => `<option value="${item.id}" ${item.id === selected.id ? 'selected' : ''}>${item.name} · ${item.family}</option>`).join('');
  const diamondRows = diamonds.map((item) => {
    const stock = Number(neptune.diamondStock[item.id]) || 0;
    const available = item.tier <= tierLimit;
    return `<article class="list-item"><div><h3>${available ? item.name : 'Uncharted seam'}</h3><p>${available ? `${item.family} · ${currency(item.value)} each · Stock <span data-void-diamond-stock="${item.id}">${stock.toFixed(1)}</span>` : `Drill rank ${item.tier} required`}</p></div><button class="action secondary" data-action="sell-diamond" data-id="${item.id}" data-void-sell="${item.id}" ${!available || stock < 1 ? 'disabled' : ''}>Sell ${Math.floor(stock)}</button></article>`;
  }).join('');
  const output = voidPayout() / (interval / 1000) + miningRate + coinRate + bankRate;
  updateHeader(output, 'combined output / sec');
  planetContent.innerHTML = `
    <nav class="void-tabs" role="tablist" aria-label="Void industries">
      <button role="tab" aria-selected="${activeVoidTab === 'mining'}" data-void-tab="mining">💎 Mining</button>
      <button role="tab" aria-selected="${activeVoidTab === 'treasury'}" data-void-tab="treasury">⏱️ Treasury</button>
      <button role="tab" aria-selected="${activeVoidTab === 'coin'}" data-void-tab="coin">🪙 Meme Coin</button>
      <button role="tab" aria-selected="${activeVoidTab === 'bank'}" data-void-tab="bank">🏦 Banking</button>
      <button role="tab" aria-selected="${activeVoidTab === 'companies'}" data-void-tab="companies">🎮 Companies</button>
    </nav>
    <section class="void-tab-panel" role="tabpanel" data-void-panel="mining" ${activeVoidTab === 'mining' ? '' : 'hidden'}>
      <div class="panel">
        <div class="section-heading"><h2>Diamond extraction</h2><span>DRILL RANK ${neptune.drillLevel}</span></div>
        <label for="diamond-select" class="eyebrow">Active seam</label><select class="select" id="diamond-select">${diamondOptions}</select>
        <div class="stat-row"><span>Excavators</span><strong>${neptune.excavators} · <span data-void-selected-rate>${selected.name} · ${miningRate.toFixed(2)} / sec</span></strong></div>
        <div class="button-row"><button class="action" data-action="buy-excavator" ${game.susPoints < excavatorCost ? 'disabled' : ''}>Buy excavator · ${currency(excavatorCost)}</button><button class="action secondary" data-action="upgrade-drill" ${game.susPoints < drillCost ? 'disabled' : ''}>Upgrade drill · ${currency(drillCost)}</button><button class="action secondary" data-action="manual-mine">Mine sample</button></div>
        <div class="section-heading"><h2>Seam inventory</h2><span>SELL FOR SUS</span></div>
        <div class="list">${diamondRows}</div>
      </div>
    </section>
    <section class="void-tab-panel" role="tabpanel" data-void-panel="treasury" ${activeVoidTab === 'treasury' ? '' : 'hidden'}>
      <div class="panel">
        <div class="section-heading"><h2>Automatic treasury</h2><span data-void-cycle>CYCLE ${state.cycles + 1}</span></div>
        <p class="big-number"><span data-void-payout>${currency(voidPayout())}</span><em style="font-size:12px;color:var(--muted)"> / payout</em></p>
        <div class="track"><div class="fill" data-void-progress style="width:${Math.min(100, elapsed / interval * 100)}%"></div></div>
        <div class="stat-row"><span>Next payment</span><strong data-void-remaining>${durationLabel(remaining)}</strong></div>
        <div class="stat-row"><span>Cycle growth</span><strong>+30% each payout</strong></div>
        <div class="stat-row"><span>Revenue boost rank ${state.revenueLevel}</span><strong>+${state.revenueLevel * 40}% production</strong></div>
        <div class="button-row"><button class="action" data-action="upgrade-revenue" ${game.susPoints < revenueCost ? 'disabled' : ''}>Upgrade revenue · ${currency(revenueCost)}</button><button class="action secondary" data-action="upgrade-interval" ${interval <= 150000 || game.susPoints < intervalCost ? 'disabled' : ''}>Shorten cycle · ${currency(intervalCost)}</button></div>
        <p>Cycle length: ${durationLabel(interval)} · minimum 2m 30s. Each completed cycle grows the next payout by 30%.</p>
      </div>
    </section>
    <section class="void-tab-panel" role="tabpanel" data-void-panel="coin" ${activeVoidTab === 'coin' ? '' : 'hidden'}>
      <div class="panel coin-terminal">
        <div class="section-heading"><h2>VOID · MEME MARKET</h2><span data-void-market-status>${coin.created ? 'MARKET OPEN' : 'NOT LAUNCHED'}</span></div>
        ${coin.created ? `<div class="coin-topline"><div><span class="eyebrow">$VOID / SUS</span><div class="coin-price" data-void-coin-price>$0.00</div></div><div class="coin-change" data-void-coin-change>-- · live market</div></div>
          <div class="market-tape"><div><small>TREASURY</small><strong data-void-coin-treasury>${currency(coin.treasury)}</strong></div><div><small>HYPE RANK</small><strong>${coin.level}</strong></div><div><small>PER SECOND</small><strong>${currency(coinRate)}</strong></div></div>
          <div class="coin-chart" aria-label="Live meme coin price chart"><svg viewBox="0 0 320 250" preserveAspectRatio="none"><defs><linearGradient id="coinGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00ff66"/><stop offset="1" stop-color="#00ff66" stop-opacity="0"/></linearGradient></defs><polygon class="chart-fill" data-void-chart-fill points="0,250 320,250 320,250"></polygon><polyline data-void-chart-line points="0,250 320,250"></polyline></svg><span class="coin-axis">36 SEC LIVE</span></div>
          <div class="button-row"><button class="action" data-action="upgrade-coin" ${game.susPoints < coinCost ? 'disabled' : ''}>Boost hype · ${currency(coinCost)}</button><button class="action secondary" data-action="collect-coin">Collect treasury</button></div>` : `<p>Launch an independent token treasury. The market terminal activates after launch.</p><button class="action" data-action="create-coin" ${game.susPoints < 15000 ? 'disabled' : ''}>Launch coin · ${currency(15000)}</button>`}
      </div>
    </section>
    <section class="void-tab-panel" role="tabpanel" data-void-panel="bank" ${activeVoidTab === 'bank' ? '' : 'hidden'}>
      <div class="panel bank-workbench">
        <div class="section-heading"><h2>VANTA Banking OS</h2><span>${bank.created ? 'APP LIVE' : 'NOT DEPLOYED'}</span></div>
        ${bank.created ? `<div class="bank-dashboard"><div class="usage-ring"><div><strong data-void-bank-usage>100%</strong><small>USAGE</small></div></div><div><div class="stat-row"><span>Bank treasury</span><strong data-void-bank-treasury>${currency(bank.treasury)}</strong></div><div class="stat-row"><span>Yield rank ${bank.level}</span><strong>${currency(bankRate)} / sec</strong></div></div></div>
          <div class="bank-node-map" data-bank-map>
            <svg class="bank-wires" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="18" y1="30" x2="72" y2="22"/><line x1="72" y1="22" x2="68" y2="72"/><line x1="68" y1="72" x2="22" y2="78"/><line x1="22" y1="78" x2="18" y2="30"/><line x1="18" y1="30" x2="68" y2="72"/></svg>
            ${Object.entries(bank.nodes).map(([id, node]) => `<button class="bank-node" data-bank-node="${id}" style="left:${node.x}%;top:${node.y}%"><strong>${({auth:'AUTH CORE',wallet:'WALLET API',yield:'YIELD ENGINE',support:'USER VAULT'})[id]}</strong><small>Drag to route usage</small></button>`).join('')}
          </div>
          <div class="button-row"><button class="action" data-action="upgrade-bank" ${game.susPoints < bankCost ? 'disabled' : ''}>Upgrade yield · ${currency(bankCost)}</button><button class="action secondary" data-action="collect-bank">Collect treasury</button></div>` : `<p>Deploy the banking app, then arrange service nodes to improve user usage.</p><button class="action" data-action="create-bank" ${game.susPoints < 25000 ? 'disabled' : ''}>Open bank · ${currency(25000)}</button>`}
      </div>
    </section>
    <section class="void-tab-panel" role="tabpanel" data-void-panel="companies" ${activeVoidTab === 'companies' ? '' : 'hidden'}>
      <div class="company-grid">
        <div class="panel console-workspace">
          <div class="section-heading"><h2>🎮 NullByte Systems</h2><span>${state.consoleCompany.founded ? `LINE RANK ${state.consoleCompany.level}` : 'NOT FOUNDED'}</span></div>
          ${state.consoleCompany.founded ? `<div class="console-rig"><div class="console-chip"></div><div class="console-rig-screen"></div><div class="console-chip"></div></div>
            <div class="company-metrics"><div><small>HARDWARE DPS</small><strong>${state.consoleCompany.features.hardware * 18 + 30}%</strong></div><div><small>EXCLUSIVE STUDIOS</small><strong>${state.consoleCompany.features.studio}</strong></div><div><small>ECOSYSTEM</small><strong>${100 + state.consoleCompany.features.ecosystem * 24}</strong></div></div>
            <div class="feature-list">
              <div class="feature-row"><div><strong>VoidRay Hardware</strong><small>Rank ${state.consoleCompany.features.hardware}</small></div><button class="action" data-action="upgrade-console-hardware" ${game.susPoints < 6000000 * Math.pow(1.8, state.consoleCompany.features.hardware) ? 'disabled' : ''}>Upgrade · ${currency(6000000 * Math.pow(1.8, state.consoleCompany.features.hardware))}</button></div>
              <div class="feature-row"><div><strong>Launch Studios</strong><small>Rank ${state.consoleCompany.features.studio}</small></div><button class="action" data-action="upgrade-console-studio" ${game.susPoints < 9000000 * Math.pow(1.82, state.consoleCompany.features.studio) ? 'disabled' : ''}>Fund · ${currency(9000000 * Math.pow(1.82, state.consoleCompany.features.studio))}</button></div>
              <div class="feature-row"><div><strong>Online Ecosystem</strong><small>Rank ${state.consoleCompany.features.ecosystem}</small></div><button class="action" data-action="upgrade-console-ecosystem" ${game.susPoints < 12000000 * Math.pow(1.85, state.consoleCompany.features.ecosystem) ? 'disabled' : ''}>Expand · ${currency(12000000 * Math.pow(1.85, state.consoleCompany.features.ecosystem))}</button></div>
            </div>
            <div class="button-row"><button class="action" data-action="upgrade-console" ${game.susPoints < consoleCost ? 'disabled' : ''}>Expand console line · ${currency(consoleCost)}</button></div>` : `<p>Build Void-native hardware, fund first-party studios, and launch a connected game ecosystem.</p><button class="action" data-action="found-console" ${game.susPoints < consoleCost ? 'disabled' : ''}>Start console company · ${currency(consoleCost)}</button>`}
        </div>
        <div class="panel car-workspace">
          <div class="section-heading"><h2>🚘 Eventide Motors</h2><span>${state.carCompany.founded ? `LINE RANK ${state.carCompany.level}` : 'NOT FOUNDED'}</span></div>
          ${state.carCompany.founded ? `<div class="car-bay"><div class="car-silhouette"></div></div>
            <div class="company-metrics"><div><small>POWERTRAIN</small><strong>${state.carCompany.features.engine * 22 + 40}%</strong></div><div><small>AERO SCORE</small><strong>${state.carCompany.features.aero * 15 + 50}</strong></div><div><small>FACTORY UNITS</small><strong>${1 + state.carCompany.features.factory * 3}/cycle</strong></div></div>
            <div class="feature-list">
              <div class="feature-row"><div><strong>Ion Engine</strong><small>Rank ${state.carCompany.features.engine}</small></div><button class="action" data-action="upgrade-car-engine" ${game.susPoints < 11000000 * Math.pow(1.82, state.carCompany.features.engine) ? 'disabled' : ''}>Tune · ${currency(11000000 * Math.pow(1.82, state.carCompany.features.engine))}</button></div>
              <div class="feature-row"><div><strong>Void Aerodynamics</strong><small>Rank ${state.carCompany.features.aero}</small></div><button class="action" data-action="upgrade-car-aero" ${game.susPoints < 13000000 * Math.pow(1.84, state.carCompany.features.aero) ? 'disabled' : ''}>Design · ${currency(13000000 * Math.pow(1.84, state.carCompany.features.aero))}</button></div>
              <div class="feature-row"><div><strong>Assembly Factory</strong><small>Rank ${state.carCompany.features.factory}</small></div><button class="action" data-action="upgrade-car-factory" ${game.susPoints < 16000000 * Math.pow(1.86, state.carCompany.features.factory) ? 'disabled' : ''}>Build · ${currency(16000000 * Math.pow(1.86, state.carCompany.features.factory))}</button></div>
            </div>
            <div class="button-row"><button class="action" data-action="upgrade-car" ${game.susPoints < carCost ? 'disabled' : ''}>Expand vehicle line · ${currency(carCost)}</button></div>` : `<p>Engineer ion powertrains, optimize deep-space aerodynamics, and automate a vehicle assembly plant.</p><button class="action" data-action="found-car" ${game.susPoints < carCost ? 'disabled' : ''}>Start car company · ${currency(carCost)}</button>`}
        </div>
      </div>
    </section>`;
}

function checkPlanetProgress() {
  if (game.marsWon) game.voidUnlocked = true;
}

function updateVoidLiveUI() {
  const neptune = game.neptuneGame;
  const state = game.voidGame;
  const interval = voidInterval();
  const selected = diamonds.find((item) => item.id === neptune.selectedDiamond) || diamonds[0];
  const miningRate = neptune.excavators * (0.08 + neptune.drillLevel * 0.02) * boost;
  const coinRate = neptune.memeCoin.created ? (8 + neptune.memeCoin.level * 10) * boost : 0;
  const bankRate = neptune.bankingApp.created ? (12 + neptune.bankingApp.level * 15) * boost : 0;
  const remaining = Math.max(0, interval - (Date.now() - state.lastPayout));
  const output = voidPayout() / (interval / 1000) + miningRate + coinRate + bankRate;

  document.getElementById('wallet').textContent = currency(game.susPoints);
  document.getElementById('wallet').title = game.susPoints.toLocaleString();
  document.getElementById('planet-output').textContent = `${formatCompactNumber(output)} combined output / sec`;
  document.getElementById('planet-output').title = `${Math.floor(output).toLocaleString()} combined output / sec`;
  document.querySelector('[data-void-cycle]').textContent = `CYCLE ${state.cycles + 1}`;
  document.querySelector('[data-void-payout]').textContent = currency(voidPayout());
  document.querySelector('[data-void-progress]').style.width = `${Math.min(100, (interval - remaining) / interval * 100)}%`;
  document.querySelector('[data-void-remaining]').textContent = durationLabel(remaining);
  const selectedRate = document.querySelector('[data-void-selected-rate]');
  selectedRate.textContent = `${selected.name} · ${miningRate.toFixed(2)} / sec`;
  const coinTreasury = document.querySelector('[data-void-coin-treasury]');
  if (coinTreasury) coinTreasury.textContent = currency(neptune.memeCoin.treasury);
  const bankTreasury = document.querySelector('[data-void-bank-treasury]');
  if (bankTreasury) bankTreasury.textContent = currency(neptune.bankingApp.treasury);
  document.querySelectorAll('[data-void-diamond-stock]').forEach((element) => {
    const stock = Number(neptune.diamondStock[element.dataset.voidDiamondStock]) || 0;
    element.textContent = stock.toFixed(1);
  });
  document.querySelectorAll('[data-void-sell]').forEach((button) => {
    const stock = Number(neptune.diamondStock[button.dataset.voidSell]) || 0;
    button.textContent = `Sell ${Math.floor(stock)}`;
    button.disabled = stock < 1;
  });
  updateCoinChart();
  const bankUsage = document.querySelector('[data-void-bank-usage]');
  if (bankUsage) bankUsage.textContent = `${bankUsageValue()}%`;
}

function spend(cost) {
  if (game.susPoints < cost) return false;
  game.susPoints -= cost;
  return true;
}

function handleAction(action) {
  const neptune = game.neptuneGame;
  const state = game.voidGame;
  if (action === 'buy-excavator') {
    const cost = Math.floor(250 * Math.pow(1.58, neptune.excavators));
    if (spend(cost)) neptune.excavators += 1;
  }
  if (action === 'upgrade-drill') {
    const cost = Math.floor(800 * Math.pow(1.72, neptune.drillLevel));
    if (spend(cost)) neptune.drillLevel += 1;
  }
  if (action === 'manual-mine') {
    const picked = diamonds.find((item) => item.id === neptune.selectedDiamond) || diamonds[0];
    if (picked.tier <= Math.min(10, neptune.drillLevel + 1)) neptune.diamondStock[picked.id] = (Number(neptune.diamondStock[picked.id]) || 0) + 1 + neptune.drillLevel * 0.5;
  }
  if (action === 'sell-diamond') {
    const picked = diamonds.find((item) => item.id === actionTarget.dataset.id);
    if (picked) {
      const units = Math.floor(Number(neptune.diamondStock[picked.id]) || 0);
      if (units > 0) { neptune.diamondStock[picked.id] -= units; game.susPoints += Math.floor(units * picked.value * boost); }
    }
  }
  if (action === 'create-coin' && !neptune.memeCoin.created && spend(15000)) neptune.memeCoin.created = true;
  if (action === 'create-bank' && !neptune.bankingApp.created && spend(25000)) neptune.bankingApp.created = true;
  if (action === 'upgrade-coin' && neptune.memeCoin.created) {
    const cost = Math.floor(8000 * Math.pow(1.9, neptune.memeCoin.level));
    if (spend(cost)) neptune.memeCoin.level += 1;
  }
  if (action === 'upgrade-bank' && neptune.bankingApp.created) {
    const cost = Math.floor(12000 * Math.pow(1.9, neptune.bankingApp.level));
    if (spend(cost)) neptune.bankingApp.level += 1;
  }
  if (action === 'collect-coin') { game.susPoints += neptune.memeCoin.treasury; neptune.memeCoin.treasury = 0; }
  if (action === 'collect-bank') { game.susPoints += neptune.bankingApp.treasury; neptune.bankingApp.treasury = 0; }
  if (action === 'upgrade-revenue') {
    const cost = Math.floor(900000 * Math.pow(1.85, state.revenueLevel));
    if (spend(cost)) state.revenueLevel += 1;
  }
  if (action === 'upgrade-interval' && voidInterval() > 150000) {
    const cost = Math.floor(750000 * Math.pow(1.68, state.intervalLevel));
    if (spend(cost)) state.intervalLevel += 1;
  }
  if (action === 'found-console' && !state.consoleCompany.founded && spend(25000000)) state.consoleCompany.founded = true;
  if (action === 'found-car' && !state.carCompany.founded && spend(45000000)) state.carCompany.founded = true;
  if (action === 'upgrade-console' && state.consoleCompany.founded) {
    const cost = Math.floor(5000000 * Math.pow(1.75, state.consoleCompany.level));
    if (spend(cost)) state.consoleCompany.level += 1;
  }
  if (action === 'upgrade-car' && state.carCompany.founded) {
    const cost = Math.floor(9000000 * Math.pow(1.78, state.carCompany.level));
    if (spend(cost)) state.carCompany.level += 1;
  }
  const consoleFeatureCosts = { hardware: 6000000, studio: 9000000, ecosystem: 12000000 };
  const consoleFeatureGrowth = { hardware: 1.8, studio: 1.82, ecosystem: 1.85 };
  if (action.startsWith('upgrade-console-')) {
    const feature = action.replace('upgrade-console-', '');
    if (state.consoleCompany.founded && consoleFeatureCosts[feature]) {
      const cost = Math.floor(consoleFeatureCosts[feature] * Math.pow(consoleFeatureGrowth[feature], state.consoleCompany.features[feature]));
      if (spend(cost)) state.consoleCompany.features[feature] += 1;
    }
  }
  const carFeatureCosts = { engine: 11000000, aero: 13000000, factory: 16000000 };
  const carFeatureGrowth = { engine: 1.82, aero: 1.84, factory: 1.86 };
  if (action.startsWith('upgrade-car-')) {
    const feature = action.replace('upgrade-car-', '');
    if (state.carCompany.founded && carFeatureCosts[feature]) {
      const cost = Math.floor(carFeatureCosts[feature] * Math.pow(carFeatureGrowth[feature], state.carCompany.features[feature]));
      if (spend(cost)) state.carCompany.features[feature] += 1;
    }
  }
  checkPlanetProgress();
  save();
  render();
}

let actionTarget = null;
planetContent.addEventListener('click', (event) => {
  const tab = event.target.closest('[data-void-tab]');
  if (tab) {
    activeVoidTab = tab.dataset.voidTab;
    planetContent.querySelectorAll('[data-void-tab]').forEach((button) => {
      button.setAttribute('aria-selected', String(button === tab));
    });
    planetContent.querySelectorAll('[data-void-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.voidPanel !== tab.dataset.voidTab;
    });
    return;
  }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  actionTarget = button;
  handleAction(button.dataset.action);
});
planetContent.addEventListener('change', (event) => {
  if (event.target.id === 'diamond-select') {
    game.neptuneGame.selectedDiamond = event.target.value;
    save();
    render();
  }
});

let draggedBankNode = null;
planetContent.addEventListener('pointerdown', (event) => {
  const node = event.target.closest('[data-bank-node]');
  if (!node) return;
  draggedBankNode = node;
  node.setPointerCapture(event.pointerId);
});
planetContent.addEventListener('pointermove', (event) => {
  if (!draggedBankNode) return;
  const map = draggedBankNode.closest('[data-bank-map]');
  if (!map) return;
  const rect = map.getBoundingClientRect();
  const x = Math.min(88, Math.max(12, (event.clientX - rect.left) / rect.width * 100));
  const y = Math.min(88, Math.max(12, (event.clientY - rect.top) / rect.height * 100));
  draggedBankNode.style.left = `${x}%`;
  draggedBankNode.style.top = `${y}%`;
  game.neptuneGame.bankingApp.nodes[draggedBankNode.dataset.bankNode] = { x, y };
  game.neptuneGame.bankingApp.usage = bankUsageValue();
  const usage = document.querySelector('[data-void-bank-usage]');
  if (usage) usage.textContent = `${game.neptuneGame.bankingApp.usage}%`;
});
planetContent.addEventListener('pointerup', (event) => {
  if (!draggedBankNode) return;
  if (draggedBankNode.hasPointerCapture(event.pointerId)) draggedBankNode.releasePointerCapture(event.pointerId);
  draggedBankNode = null;
  save();
});

function tick() {
  const neptune = game.neptuneGame;
  const state = game.voidGame;
  const now = Date.now();
  const elapsedSeconds = Math.max(0, (now - (neptune.lastSimulationAt || now)) / 1000);
  neptune.lastSimulationAt = now;

  neptune.memeCoin.treasury += (neptune.memeCoin.created ? (8 + neptune.memeCoin.level * 10) * boost : 0) * elapsedSeconds;
  neptune.bankingApp.treasury += (neptune.bankingApp.created ? (12 + neptune.bankingApp.level * 15) * boost : 0) * elapsedSeconds;
  if (neptune.memeCoin.created) {
    const base = coinHistoryValue();
    const wave = Math.sin(now / 2400) * 0.055;
    neptune.memeCoin.history.push(Math.max(0.01, base + wave));
    if (neptune.memeCoin.history.length > 36) neptune.memeCoin.history.shift();
  }
  if (neptune.bankingApp.created) neptune.bankingApp.usage = bankUsageValue();
  if (neptune.excavators > 0) {
    const picked = diamonds.find((item) => item.id === neptune.selectedDiamond) || diamonds[0];
    if (picked.tier <= Math.min(10, neptune.drillLevel + 1)) {
      neptune.diamondStock[picked.id] = (Number(neptune.diamondStock[picked.id]) || 0) + neptune.excavators * (0.08 + neptune.drillLevel * 0.02) * boost * elapsedSeconds;
    }
  }
  if (!state.lastPayout) state.lastPayout = now;
  const interval = voidInterval();
  const completedCycles = Math.floor((now - state.lastPayout) / interval);
  if (completedCycles > 0) {
    const basePayout = voidBaseRevenue();
    const firstCycleGrowth = Math.pow(1.3, state.cycles);
    const growthSum = (Math.pow(1.3, completedCycles) - 1) / 0.3;
    game.susPoints += basePayout * firstCycleGrowth * growthSum;
    state.cycles += completedCycles;
    state.lastPayout += completedCycles * interval;
    save();
  }
  checkPlanetProgress();
  updateVoidLiveUI();
}

function render() {
  renderVoid();
}

ensurePlanetState();
if (!unlocked[planet]) showLocked();
else {
  if (planet === 'void' && !game.voidGame.lastPayout) game.voidGame.lastPayout = Date.now();
  render();
  tick();
  setInterval(tick, 1000);
  setInterval(save, 10000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) tick();
  });
}
