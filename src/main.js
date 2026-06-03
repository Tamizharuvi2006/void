/* ═══════════════════════════════════════════════════════════════
   VOID ASCENT — Roguelite Wave-Survival Game Engine
   ═══════════════════════════════════════════════════════════════ */

// ─── DOM References ───
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const menuEl = document.getElementById('menu');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const menuBtn = document.getElementById('menu-btn');
const levelupModal = document.getElementById('levelup-modal');
const gameoverModal = document.getElementById('gameover-modal');
const upgradeCardsEl = document.getElementById('upgrade-cards');
const weaponBarEl = document.getElementById('weapon-bar');
const hpBar = document.getElementById('hp-bar');
const hpText = document.getElementById('hp-text');
const xpBar = document.getElementById('xp-bar');
const xpText = document.getElementById('xp-text');
const waveDisplay = document.getElementById('wave-display');
const waveTimerEl = document.getElementById('wave-timer');
const killsEl = document.getElementById('kills');
const runDustEl = document.getElementById('run-dust');
const goWave = document.getElementById('go-wave');
const goKills = document.getElementById('go-kills');
const goLevel = document.getElementById('go-level');
const goDust = document.getElementById('go-dust');
const shopGrid = document.getElementById('shop-grid');
const shopDustEl = document.getElementById('shop-dust');
const bestWaveEl = document.getElementById('best-wave');
const totalKillsEl = document.getElementById('total-kills');
const totalRunsEl = document.getElementById('total-runs');
const hudEl = document.getElementById('hud');

// ─── Constants ───
const SAVE_KEY = 'void-ascent-save-v1';
const TWO_PI = Math.PI * 2;
const ARENA_HALF = 2400;
const WAVE_DURATION = 22;
const BOSS_INTERVAL = 5;
const XP_BASE = 20;
const XP_SCALE = 1.28;
const GEM_MAGNET_BASE = 60;
const GEM_SPEED = 320;
const PLAYER_SPEED_BASE = 180;
const PLAYER_RADIUS = 14;
const INVULN_TIME = 0.8;
const DAMAGE_FLASH = 0.15;
const SHAKE_DECAY = 8;
const MAX_PARTICLES = 600;
const MAX_DAMAGE_NUMS = 80;
const MAX_ENEMIES = 300;

// ─── Colors ───
const C = {
  bg: '#030609',
  gridLine: 'rgba(0,240,255,0.04)',
  gridLineBright: 'rgba(0,240,255,0.08)',
  player: '#00f0ff',
  playerGlow: 'rgba(0,240,255,0.3)',
  playerHit: '#ff2d55',
  xpGem: '#a8ff44',
  xpGemGlow: 'rgba(168,255,68,0.35)',
  cyan: '#00f0ff',
  magenta: '#ff2d95',
  amber: '#ffc845',
  lime: '#a8ff44',
  violet: '#b44dff',
  ice: '#7df3ff',
  white: '#eaf4ff',
};

// ─── Utilities ───
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function angle(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function randInt(lo, hi) { return Math.floor(rand(lo, hi + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function hexToRgb(hex) {
  const v = parseInt(hex.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

// ─── Save System ───
function defaultSave() {
  return {
    stardust: 0,
    bestWave: 0,
    totalKills: 0,
    totalRuns: 0,
    upgrades: { maxHp: 0, damage: 0, speed: 0, xpGain: 0, pickupRadius: 0, armor: 0 },
  };
}

let save = loadSave();

function loadSave() {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!raw) return defaultSave();
    const def = defaultSave();
    return { ...def, ...raw, upgrades: { ...def.upgrades, ...(raw.upgrades || {}) } };
  } catch { return defaultSave(); }
}

function persistSave() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {}
}

// ─── Meta Upgrades ───
const META_UPGRADES = [
  { key: 'maxHp',        name: 'Vitality',      max: 10, costs: i => 30 + i * 25,  desc: l => `+${(l+1)*10} Max HP` },
  { key: 'damage',       name: 'Fury',          max: 10, costs: i => 40 + i * 30,  desc: l => `+${(l+1)*5}% Damage` },
  { key: 'speed',        name: 'Swiftness',     max: 5,  costs: i => 35 + i * 28,  desc: l => `+${(l+1)*4}% Speed` },
  { key: 'xpGain',       name: 'Wisdom',        max: 8,  costs: i => 25 + i * 22,  desc: l => `+${(l+1)*8}% XP` },
  { key: 'pickupRadius', name: 'Magnetism',     max: 5,  costs: i => 30 + i * 24,  desc: l => `+${(l+1)*15}% Radius` },
  { key: 'armor',        name: 'Resilience',    max: 5,  costs: i => 50 + i * 35,  desc: l => `+${l+1} Armor` },
];

// ─── Weapon Definitions ───
const WEAPON_DEFS = [
  {
    id: 'void_bolt', name: 'Void Bolt', icon: '🔮', maxLv: 5,
    desc: 'Fires a bolt at the nearest enemy',
    stats: [
      { dmg: 12, cd: 0.85, count: 1, speed: 420, size: 5 },
      { dmg: 18, cd: 0.75, count: 1, speed: 450, size: 5 },
      { dmg: 22, cd: 0.65, count: 2, speed: 480, size: 6 },
      { dmg: 30, cd: 0.55, count: 2, speed: 500, size: 6 },
      { dmg: 42, cd: 0.45, count: 3, speed: 540, size: 7 },
    ],
  },
  {
    id: 'orbit_shards', name: 'Orbit Shards', icon: '💠', maxLv: 5,
    desc: 'Crystals orbit around you',
    stats: [
      { dmg: 8,  count: 2, radius: 60,  speed: 2.2, size: 7 },
      { dmg: 12, count: 3, radius: 70,  speed: 2.4, size: 8 },
      { dmg: 16, count: 3, radius: 80,  speed: 2.6, size: 9 },
      { dmg: 22, count: 4, radius: 90,  speed: 2.8, size: 10 },
      { dmg: 30, count: 5, radius: 100, speed: 3.0, size: 11 },
    ],
  },
  {
    id: 'nova_pulse', name: 'Nova Pulse', icon: '💥', maxLv: 5,
    desc: 'Periodic explosion around you',
    stats: [
      { dmg: 15, cd: 3.2, radius: 90 },
      { dmg: 22, cd: 2.8, radius: 110 },
      { dmg: 32, cd: 2.4, radius: 130 },
      { dmg: 44, cd: 2.0, radius: 155 },
      { dmg: 60, cd: 1.6, radius: 180 },
    ],
  },
  {
    id: 'frost_ring', name: 'Frost Ring', icon: '❄️', maxLv: 5,
    desc: 'Expanding ring that slows enemies',
    stats: [
      { dmg: 6,  cd: 4.0, maxR: 160, slow: 0.4, dur: 2.0 },
      { dmg: 10, cd: 3.5, maxR: 190, slow: 0.45, dur: 2.5 },
      { dmg: 14, cd: 3.0, maxR: 220, slow: 0.5, dur: 3.0 },
      { dmg: 20, cd: 2.5, maxR: 260, slow: 0.55, dur: 3.5 },
      { dmg: 28, cd: 2.0, maxR: 300, slow: 0.6, dur: 4.0 },
    ],
  },
  {
    id: 'lightning_chain', name: 'Lightning Chain', icon: '⚡', maxLv: 5,
    desc: 'Bolt bouncing between enemies',
    stats: [
      { dmg: 14, cd: 1.8, bounces: 2, range: 120 },
      { dmg: 20, cd: 1.6, bounces: 3, range: 140 },
      { dmg: 28, cd: 1.4, bounces: 3, range: 160 },
      { dmg: 38, cd: 1.2, bounces: 4, range: 180 },
      { dmg: 52, cd: 1.0, bounces: 5, range: 200 },
    ],
  },
  {
    id: 'phantom_mines', name: 'Phantom Mines', icon: '💣', maxLv: 5,
    desc: 'Drops exploding mines behind you',
    stats: [
      { dmg: 20, cd: 2.5, blastR: 55, count: 1 },
      { dmg: 30, cd: 2.2, blastR: 65, count: 1 },
      { dmg: 40, cd: 2.0, blastR: 75, count: 2 },
      { dmg: 55, cd: 1.7, blastR: 85, count: 2 },
      { dmg: 75, cd: 1.4, blastR: 100, count: 3 },
    ],
  },
  {
    id: 'death_blossom', name: 'Death Blossom', icon: '🌀', maxLv: 5,
    desc: 'Spinning blades in all directions',
    stats: [
      { dmg: 8,  cd: 1.6, count: 4,  speed: 280, size: 6 },
      { dmg: 12, cd: 1.4, count: 5,  speed: 300, size: 6 },
      { dmg: 16, cd: 1.2, count: 6,  speed: 320, size: 7 },
      { dmg: 22, cd: 1.0, count: 8,  speed: 350, size: 7 },
      { dmg: 30, cd: 0.8, count: 10, speed: 380, size: 8 },
    ],
  },
  {
    id: 'gravity_well', name: 'Gravity Well', icon: '🕳️', maxLv: 5,
    desc: 'Vortex that pulls and damages enemies',
    stats: [
      { dmg: 4,  cd: 6.0, radius: 80,  pull: 60,  dur: 3.0 },
      { dmg: 6,  cd: 5.5, radius: 95,  pull: 75,  dur: 3.5 },
      { dmg: 9,  cd: 5.0, radius: 110, pull: 90,  dur: 4.0 },
      { dmg: 13, cd: 4.5, radius: 130, pull: 110, dur: 4.5 },
      { dmg: 18, cd: 4.0, radius: 150, pull: 130, dur: 5.0 },
    ],
  },
];

// ─── Passive Upgrade Definitions (in-run) ───
const PASSIVE_DEFS = [
  { id: 'p_hp',     name: 'Max HP +15',       icon: '❤️',  apply: s => { s.maxHp += 15; s.hp = Math.min(s.hp + 15, s.maxHp); } },
  { id: 'p_dmg',    name: 'Damage +10%',      icon: '⚔️',  apply: s => { s.dmgMult += 0.10; } },
  { id: 'p_speed',  name: 'Speed +8%',        icon: '👟',  apply: s => { s.speedMult += 0.08; } },
  { id: 'p_xp',     name: 'XP Gain +15%',     icon: '📖',  apply: s => { s.xpMult += 0.15; } },
  { id: 'p_magnet', name: 'Pickup Range +20%', icon: '🧲',  apply: s => { s.magnetMult += 0.20; } },
  { id: 'p_regen',  name: 'Regen 1 HP/5s',    icon: '💚',  apply: s => { s.regenRate += 0.2; } },
  { id: 'p_armor',  name: 'Armor +1',         icon: '🛡️',  apply: s => { s.armor += 1; } },
  { id: 'p_crit',   name: 'Crit Chance +5%',  icon: '🎯',  apply: s => { s.critChance += 0.05; } },
];

// ─── Enemy Definitions ───
const ENEMY_TYPES = {
  wraith:   { name: 'Wraith',    hp: 20,  speed: 75,  dmg: 8,   xp: 3,  radius: 12, color: '#b44dff', shape: 'diamond' },
  specter:  { name: 'Specter',   hp: 10,  speed: 130, dmg: 5,   xp: 2,  radius: 9,  color: '#00f0ff', shape: 'tri' },
  shade:    { name: 'Shade',     hp: 60,  speed: 45,  dmg: 12,  xp: 6,  radius: 18, color: '#ff4060', shape: 'hex' },
  crawler:  { name: 'Crawler',   hp: 6,   speed: 100, dmg: 3,   xp: 1,  radius: 6,  color: '#a8ff44', shape: 'circle' },
  archer:   { name: 'Archer',    hp: 25,  speed: 55,  dmg: 10,  xp: 5,  radius: 12, color: '#ffc845', shape: 'square', ranged: true, atkCd: 2.0, projSpeed: 200 },
  knight:   { name: 'Knight',    hp: 80,  speed: 40,  dmg: 18,  xp: 8,  radius: 16, color: '#ff8c42', shape: 'shield', chargeSpeed: 240, chargeDist: 200 },
  boss:     { name: 'Rift Lord', hp: 500, speed: 35,  dmg: 20,  xp: 50, radius: 28, color: '#ff2d95', shape: 'boss', isBoss: true },
};

// Wave composition: which enemies spawn per wave tier
function getWaveEnemies(wave) {
  const count = Math.floor(8 + wave * 3.5 + wave * wave * 0.15);
  const types = ['wraith'];
  if (wave >= 2) types.push('specter');
  if (wave >= 3) types.push('crawler', 'crawler');
  if (wave >= 4) types.push('shade');
  if (wave >= 6) types.push('archer');
  if (wave >= 8) types.push('knight');
  const enemies = [];
  for (let i = 0; i < count; i++) enemies.push(pick(types));
  if (wave % BOSS_INTERVAL === 0) {
    enemies.push('boss');
  }
  return enemies;
}

// ─── Game State ───
let state = null;
let lastTime = 0;
let input = {};
let cam = { x: 0, y: 0, shake: 0, shakeAngle: 0 };

function newState() {
  const metaHp = save.upgrades.maxHp * 10;
  const baseHp = 100 + metaHp;
  return {
    mode: 'menu', // menu | playing | levelup | paused | gameover
    time: 0,
    // Player
    px: 0, py: 0,
    pvx: 0, pvy: 0,
    hp: baseHp,
    maxHp: baseHp,
    xp: 0,
    xpToNext: XP_BASE,
    level: 1,
    invuln: 0,
    dmgFlash: 0,
    // Multipliers (in-run, includes meta)
    dmgMult: 1 + save.upgrades.damage * 0.05,
    speedMult: 1 + save.upgrades.speed * 0.04,
    xpMult: 1 + save.upgrades.xpGain * 0.08,
    magnetMult: 1 + save.upgrades.pickupRadius * 0.15,
    armor: save.upgrades.armor,
    regenRate: 0,
    critChance: 0.05,
    regenAccum: 0,
    // Wave
    wave: 0,
    waveTimer: 0,
    waveEnemiesQueue: [],
    spawnTimer: 0,
    // Weapons (array of active weapon instances)
    weapons: [],
    // Collections
    enemies: [],
    projectiles: [],
    gems: [],
    effects: [], // orbit shards, gravity wells, frost rings, mines
    particles: [],
    damageNums: [],
    lightningFx: [],
    // Stats
    kills: 0,
    dustEarned: 0,
    // Passives applied (for tracking upgrades offered)
    passiveCounts: {},
  };
}

// ─── Camera ───
function updateCamera(dt) {
  cam.x = lerp(cam.x, state.px, 1 - Math.pow(0.001, dt));
  cam.y = lerp(cam.y, state.py, 1 - Math.pow(0.001, dt));
  if (cam.shake > 0.5) {
    cam.shake -= SHAKE_DECAY * dt * cam.shake;
    cam.shakeAngle = Math.random() * TWO_PI;
  } else {
    cam.shake = 0;
  }
}

function worldToScreen(wx, wy) {
  const sx = cam.shake * Math.cos(cam.shakeAngle);
  const sy = cam.shake * Math.sin(cam.shakeAngle);
  return {
    x: (wx - cam.x) + canvas.width / 2 + sx,
    y: (wy - cam.y) + canvas.height / 2 + sy,
  };
}

// ─── Input ───
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowleft','arrowright','arrowup','arrowdown',' ','w','a','s','d'].includes(k)) e.preventDefault();
  input[k] = true;
  if (k === 'p' && state) {
    if (state.mode === 'playing') { state.mode = 'paused'; }
    else if (state.mode === 'paused') { state.mode = 'playing'; }
  }
  if (k === 'f') toggleFullscreen();
});
window.addEventListener('keyup', e => { input[e.key.toLowerCase()] = false; });

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

// ─── Resize ───
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(canvas.clientWidth * dpr);
  const h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}
window.addEventListener('resize', resize);

// ═══════════════════════════════════════════
// WEAPON SYSTEM
// ═══════════════════════════════════════════

function createWeaponInstance(defId, level = 0) {
  const def = WEAPON_DEFS.find(d => d.id === defId);
  return { defId, level, timer: 0, def };
}

function getWeaponStats(wep) {
  return wep.def.stats[clamp(wep.level, 0, wep.def.maxLv - 1)];
}

function fireVoidBolt(wep) {
  const s = getWeaponStats(wep);
  const baseDmg = Math.round(s.dmg * state.dmgMult);
  for (let i = 0; i < s.count; i++) {
    const target = findNearest(state.px, state.py, state.enemies, 400);
    if (!target) break;
    const a = angle(state.px, state.py, target.x, target.y) + (i - (s.count-1)/2) * 0.15;
    state.projectiles.push({
      x: state.px, y: state.py,
      vx: Math.cos(a) * s.speed,
      vy: Math.sin(a) * s.speed,
      dmg: baseDmg, radius: s.size,
      life: 2.0, pierce: 0, color: C.cyan,
      owner: 'void_bolt',
    });
  }
}

function fireDeathBlossom(wep) {
  const s = getWeaponStats(wep);
  const baseDmg = Math.round(s.dmg * state.dmgMult);
  for (let i = 0; i < s.count; i++) {
    const a = (TWO_PI / s.count) * i + state.time * 0.5;
    state.projectiles.push({
      x: state.px, y: state.py,
      vx: Math.cos(a) * s.speed,
      vy: Math.sin(a) * s.speed,
      dmg: baseDmg, radius: s.size,
      life: 1.5, pierce: 0, color: C.magenta,
      owner: 'death_blossom',
    });
  }
}

function fireNovaPulse(wep) {
  const s = getWeaponStats(wep);
  const baseDmg = Math.round(s.dmg * state.dmgMult);
  // Damage all enemies in radius
  for (const e of state.enemies) {
    const d = dist(state.px, state.py, e.x, e.y);
    if (d < s.radius + e.radius) {
      dealDamage(e, baseDmg);
    }
  }
  // Visual effect
  state.effects.push({ type: 'nova', x: state.px, y: state.py, radius: 0, maxRadius: s.radius, life: 0.4, maxLife: 0.4, color: C.amber });
  cam.shake = Math.max(cam.shake, 6);
}

function fireFrostRing(wep) {
  const s = getWeaponStats(wep);
  const baseDmg = Math.round(s.dmg * state.dmgMult);
  state.effects.push({
    type: 'frost_ring',
    x: state.px, y: state.py,
    radius: 10, maxRadius: s.maxR,
    life: 0.8, maxLife: 0.8,
    dmg: baseDmg, slow: s.slow, slowDur: s.dur,
    hit: new Set(), color: C.ice,
  });
}

function fireLightningChain(wep) {
  const s = getWeaponStats(wep);
  const baseDmg = Math.round(s.dmg * state.dmgMult);
  const first = findNearest(state.px, state.py, state.enemies, 300);
  if (!first) return;

  const chain = [{ x: state.px, y: state.py }];
  let current = first;
  const hit = new Set();

  for (let b = 0; b <= s.bounces && current; b++) {
    hit.add(current);
    dealDamage(current, baseDmg);
    chain.push({ x: current.x, y: current.y });
    spawnParticles(current.x, current.y, C.cyan, 4, 80);
    // Find next
    let nextTarget = null;
    let bestDist = s.range;
    for (const e of state.enemies) {
      if (hit.has(e) || e.hp <= 0) continue;
      const d = dist(current.x, current.y, e.x, e.y);
      if (d < bestDist) { bestDist = d; nextTarget = e; }
    }
    current = nextTarget;
  }

  state.lightningFx.push({ chain, life: 0.25, maxLife: 0.25 });
}

function firePhantomMines(wep) {
  const s = getWeaponStats(wep);
  for (let i = 0; i < s.count; i++) {
    const offsetAngle = Math.random() * TWO_PI;
    const offsetDist = 20 + Math.random() * 30;
    state.effects.push({
      type: 'mine',
      x: state.px + Math.cos(offsetAngle) * offsetDist,
      y: state.py + Math.sin(offsetAngle) * offsetDist,
      life: 4.0,
      armTime: 0.5,
      blastR: s.blastR,
      dmg: Math.round(s.dmg * state.dmgMult),
      triggered: false,
      color: C.amber,
    });
  }
}

function updateGravityWells(dt) {
  for (const fx of state.effects) {
    if (fx.type !== 'gravity_well') continue;
    // Pull enemies toward center and deal tick damage
    const tickDmg = Math.round(fx.dmg * state.dmgMult * dt);
    for (const e of state.enemies) {
      const d = dist(fx.x, fx.y, e.x, e.y);
      if (d < fx.radius && d > 5) {
        const a = angle(e.x, e.y, fx.x, fx.y);
        e.x += Math.cos(a) * fx.pull * dt;
        e.y += Math.sin(a) * fx.pull * dt;
        if (tickDmg > 0 && Math.random() < dt * 3) {
          dealDamage(e, tickDmg);
        }
      }
    }
  }
}

function fireGravityWell(wep) {
  const s = getWeaponStats(wep);
  const target = findNearest(state.px, state.py, state.enemies, 300);
  const tx = target ? target.x : state.px + (Math.random() - 0.5) * 200;
  const ty = target ? target.y : state.py + (Math.random() - 0.5) * 200;
  state.effects.push({
    type: 'gravity_well',
    x: tx, y: ty,
    radius: s.radius, pull: s.pull,
    dmg: s.dmg,
    life: s.dur, maxLife: s.dur,
    color: C.violet,
  });
}

function updateWeapons(dt) {
  for (const wep of state.weapons) {
    wep.timer -= dt;
    if (wep.timer > 0) continue;

    const s = getWeaponStats(wep);
    switch (wep.defId) {
      case 'void_bolt':
        wep.timer = s.cd;
        fireVoidBolt(wep);
        break;
      case 'death_blossom':
        wep.timer = s.cd;
        fireDeathBlossom(wep);
        break;
      case 'nova_pulse':
        wep.timer = s.cd;
        fireNovaPulse(wep);
        break;
      case 'frost_ring':
        wep.timer = s.cd;
        fireFrostRing(wep);
        break;
      case 'lightning_chain':
        wep.timer = s.cd;
        fireLightningChain(wep);
        break;
      case 'phantom_mines':
        wep.timer = s.cd;
        firePhantomMines(wep);
        break;
      case 'gravity_well':
        wep.timer = s.cd;
        fireGravityWell(wep);
        break;
      // orbit_shards doesn't fire — it's always active as an effect
      case 'orbit_shards':
        wep.timer = 999;
        break;
    }
  }
}

function updateOrbitShards(dt) {
  const wep = state.weapons.find(w => w.defId === 'orbit_shards');
  if (!wep) return;
  const s = getWeaponStats(wep);
  const baseDmg = Math.round(s.dmg * state.dmgMult);
  for (let i = 0; i < s.count; i++) {
    const a = state.time * s.speed + (TWO_PI / s.count) * i;
    const sx = state.px + Math.cos(a) * s.radius;
    const sy = state.py + Math.sin(a) * s.radius;
    for (const e of state.enemies) {
      if (e.invuln > 0) continue;
      const d = dist(sx, sy, e.x, e.y);
      if (d < s.size + e.radius) {
        dealDamage(e, baseDmg);
        e.invuln = 0.25;
        spawnParticles(sx, sy, C.violet, 3, 60);
      }
    }
  }
}

// ═══════════════════════════════════════════
// ENTITY HELPERS
// ═══════════════════════════════════════════

function findNearest(x, y, list, maxDist = Infinity) {
  let best = null, bestD = maxDist;
  for (const e of list) {
    if (e.hp <= 0) continue;
    const d = dist(x, y, e.x, e.y);
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
}

function dealDamage(enemy, dmg) {
  const isCrit = Math.random() < state.critChance;
  const finalDmg = isCrit ? Math.round(dmg * 1.8) : dmg;
  enemy.hp -= finalDmg;
  enemy.hitFlash = 0.1;
  spawnDamageNum(enemy.x, enemy.y - enemy.radius, finalDmg, isCrit);
  if (enemy.hp <= 0) {
    killEnemy(enemy);
  }
}

function killEnemy(enemy) {
  enemy.dead = true;
  state.kills++;
  // XP gems
  const gemCount = enemy.def.isBoss ? 12 : (enemy.def.xp >= 6 ? 3 : (enemy.def.xp >= 3 ? 2 : 1));
  const xpPer = Math.ceil(enemy.def.xp / gemCount);
  for (let i = 0; i < gemCount; i++) {
    state.gems.push({
      x: enemy.x + rand(-15, 15),
      y: enemy.y + rand(-15, 15),
      xp: xpPer,
      radius: clamp(3 + xpPer, 3, 8),
      life: 30,
    });
  }
  // Stardust
  const dust = enemy.def.isBoss ? 25 + state.wave * 3 : Math.max(1, Math.floor(enemy.def.xp * 0.6));
  state.dustEarned += dust;
  // Particles
  spawnParticles(enemy.x, enemy.y, enemy.color, enemy.def.isBoss ? 30 : 10, enemy.def.isBoss ? 140 : 80);
  if (enemy.def.isBoss) cam.shake = Math.max(cam.shake, 14);
}

function spawnDamageNum(x, y, dmg, crit) {
  if (state.damageNums.length >= MAX_DAMAGE_NUMS) state.damageNums.shift();
  state.damageNums.push({
    x, y, dmg, crit,
    vy: -60 - Math.random() * 30,
    life: 0.7, maxLife: 0.7,
  });
}

// ═══════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════

function spawnParticles(x, y, color, count, speed = 100) {
  for (let i = 0; i < count && state.particles.length < MAX_PARTICLES; i++) {
    const a = Math.random() * TWO_PI;
    const sp = rand(speed * 0.3, speed);
    state.particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: rand(0.3, 0.7),
      maxLife: 0.7,
      radius: rand(2, 5),
      color,
    });
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.life -= dt;
    if (p.life <= 0) { state.particles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.96;
    p.vy *= 0.96;
  }
}

// ═══════════════════════════════════════════
// ENEMY SPAWNING & AI
// ═══════════════════════════════════════════

function spawnEnemy(typeId) {
  if (state.enemies.length >= MAX_ENEMIES) return;
  const def = ENEMY_TYPES[typeId];
  // Spawn outside camera view
  const side = Math.random() * 4;
  const margin = 80;
  const hw = canvas.width / 2 + margin;
  const hh = canvas.height / 2 + margin;
  let x, y;
  if (side < 1) { x = cam.x - hw; y = cam.y + rand(-hh, hh); }
  else if (side < 2) { x = cam.x + hw; y = cam.y + rand(-hh, hh); }
  else if (side < 3) { x = cam.x + rand(-hw, hw); y = cam.y - hh; }
  else { x = cam.x + rand(-hw, hw); y = cam.y + hh; }

  const hpScale = 1 + state.wave * 0.12;
  const dmgScale = 1 + state.wave * 0.08;

  state.enemies.push({
    x, y,
    hp: Math.round(def.hp * hpScale),
    maxHp: Math.round(def.hp * hpScale),
    speed: def.speed,
    dmg: Math.round(def.dmg * dmgScale),
    radius: def.radius,
    color: def.color,
    def,
    hitFlash: 0,
    invuln: 0,
    slow: 0,
    slowTimer: 0,
    atkTimer: def.ranged ? def.atkCd : 0,
    chargeTimer: 0,
    charging: false,
    dead: false,
  });
}

function updateEnemies(dt) {
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (e.dead) { state.enemies.splice(i, 1); continue; }

    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.invuln = Math.max(0, e.invuln - dt);
    e.slowTimer = Math.max(0, e.slowTimer - dt);
    const speedMod = e.slowTimer > 0 ? (1 - e.slow) : 1;

    const a = angle(e.x, e.y, state.px, state.py);
    const d = dist(e.x, e.y, state.px, state.py);

    // AI behaviors
    if (e.def.ranged) {
      // Ranged: keep distance, shoot
      const preferDist = 180;
      if (d > preferDist + 20) {
        e.x += Math.cos(a) * e.speed * speedMod * dt;
        e.y += Math.sin(a) * e.speed * speedMod * dt;
      } else if (d < preferDist - 20) {
        e.x -= Math.cos(a) * e.speed * speedMod * dt * 0.5;
        e.y -= Math.sin(a) * e.speed * speedMod * dt * 0.5;
      }
      e.atkTimer -= dt;
      if (e.atkTimer <= 0 && d < 350) {
        e.atkTimer = e.def.atkCd;
        state.projectiles.push({
          x: e.x, y: e.y,
          vx: Math.cos(a) * e.def.projSpeed,
          vy: Math.sin(a) * e.def.projSpeed,
          dmg: e.dmg, radius: 4,
          life: 3.0, color: e.color,
          owner: 'enemy',
        });
      }
    } else if (e.def.chargeSpeed) {
      // Knight: charge behavior
      if (!e.charging && d < e.def.chargeDist && e.chargeTimer <= 0) {
        e.charging = true;
        e.chargeAngle = a;
        e.chargeTimer = 0.6;
      }
      if (e.charging) {
        e.chargeTimer -= dt;
        e.x += Math.cos(e.chargeAngle) * e.def.chargeSpeed * speedMod * dt;
        e.y += Math.sin(e.chargeAngle) * e.def.chargeSpeed * speedMod * dt;
        if (e.chargeTimer <= 0) { e.charging = false; e.chargeTimer = 2.5; }
      } else {
        e.chargeTimer -= dt;
        e.x += Math.cos(a) * e.speed * speedMod * dt;
        e.y += Math.sin(a) * e.speed * speedMod * dt;
      }
    } else {
      // Default: chase
      e.x += Math.cos(a) * e.speed * speedMod * dt;
      e.y += Math.sin(a) * e.speed * speedMod * dt;
    }

    // Collision with player
    if (d < e.radius + PLAYER_RADIUS && state.invuln <= 0) {
      const rawDmg = Math.max(1, e.dmg - state.armor);
      state.hp -= rawDmg;
      state.invuln = INVULN_TIME;
      state.dmgFlash = DAMAGE_FLASH;
      cam.shake = Math.max(cam.shake, 8);
      spawnParticles(state.px, state.py, C.playerHit, 12, 120);
      // Push player away
      const pushA = angle(e.x, e.y, state.px, state.py);
      state.pvx += Math.cos(pushA) * 200;
      state.pvy += Math.sin(pushA) * 200;
      if (state.hp <= 0) {
        gameOver();
        return;
      }
    }
  }
}

// ═══════════════════════════════════════════
// WAVE SYSTEM
// ═══════════════════════════════════════════

function startNextWave() {
  state.wave++;
  state.waveTimer = WAVE_DURATION;
  state.waveEnemiesQueue = getWaveEnemies(state.wave);
  state.spawnTimer = 0;
  showToast(`WAVE ${state.wave}`);
}

function updateWaves(dt) {
  // Spawn queued enemies
  if (state.waveEnemiesQueue.length > 0) {
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      const batchSize = Math.min(3, state.waveEnemiesQueue.length);
      for (let i = 0; i < batchSize; i++) {
        spawnEnemy(state.waveEnemiesQueue.pop());
      }
      state.spawnTimer = Math.max(0.15, 1.5 - state.wave * 0.08);
    }
  }

  state.waveTimer -= dt;
  if (state.waveTimer <= 0 && state.waveEnemiesQueue.length === 0) {
    startNextWave();
  }
}

// ═══════════════════════════════════════════
// XP & LEVELING
// ═══════════════════════════════════════════

function collectGem(gem) {
  const xpGain = Math.round(gem.xp * state.xpMult);
  state.xp += xpGain;
  while (state.xp >= state.xpToNext) {
    state.xp -= state.xpToNext;
    state.level++;
    state.xpToNext = Math.round(XP_BASE * Math.pow(XP_SCALE, state.level - 1));
    triggerLevelUp();
  }
}

function triggerLevelUp() {
  state.mode = 'levelup';
  showLevelUpUI();
  spawnParticles(state.px, state.py, C.cyan, 20, 150);
  cam.shake = Math.max(cam.shake, 5);
}

// ═══════════════════════════════════════════
// UPGRADE SELECTION UI
// ═══════════════════════════════════════════

function getUpgradeOptions() {
  const options = [];

  // Weapons not yet owned
  const owned = new Set(state.weapons.map(w => w.defId));
  const available = WEAPON_DEFS.filter(d => !owned.has(d.id));
  for (const d of available) {
    options.push({
      type: 'new_weapon',
      weaponDef: d,
      name: d.name,
      icon: d.icon,
      desc: d.desc,
      levelLabel: 'NEW',
    });
  }

  // Weapon upgrades
  for (const wep of state.weapons) {
    if (wep.level < wep.def.maxLv - 1) {
      options.push({
        type: 'weapon_upgrade',
        weaponId: wep.defId,
        name: wep.def.name,
        icon: wep.def.icon,
        desc: `Upgrade to Lv ${wep.level + 2}`,
        levelLabel: `LV ${wep.level + 1} → ${wep.level + 2}`,
      });
    }
  }

  // Passives
  for (const p of PASSIVE_DEFS) {
    options.push({
      type: 'passive',
      passive: p,
      name: p.name,
      icon: p.icon,
      desc: '',
      levelLabel: 'PASSIVE',
    });
  }

  // Shuffle and pick 3
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Prioritize: try to include at least 1 weapon option if possible
  const weaponOpts = options.filter(o => o.type === 'new_weapon' || o.type === 'weapon_upgrade');
  const otherOpts = options.filter(o => o.type === 'passive');

  const result = [];
  if (weaponOpts.length > 0) result.push(weaponOpts.shift());
  if (weaponOpts.length > 0 && Math.random() < 0.4) result.push(weaponOpts.shift());

  while (result.length < 3) {
    const pool = [...weaponOpts, ...otherOpts];
    if (pool.length === 0) break;
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
    // Also remove from source arrays
    const wIdx = weaponOpts.indexOf(result[result.length-1]);
    if (wIdx >= 0) weaponOpts.splice(wIdx, 1);
    const oIdx = otherOpts.indexOf(result[result.length-1]);
    if (oIdx >= 0) otherOpts.splice(oIdx, 1);
  }

  return result.slice(0, 3);
}

function applyUpgrade(option) {
  switch (option.type) {
    case 'new_weapon':
      state.weapons.push(createWeaponInstance(option.weaponDef.id, 0));
      break;
    case 'weapon_upgrade': {
      const wep = state.weapons.find(w => w.defId === option.weaponId);
      if (wep) wep.level = Math.min(wep.level + 1, wep.def.maxLv - 1);
      break;
    }
    case 'passive':
      option.passive.apply(state);
      state.passiveCounts[option.passive.id] = (state.passiveCounts[option.passive.id] || 0) + 1;
      break;
  }
}

function showLevelUpUI() {
  const options = getUpgradeOptions();
  upgradeCardsEl.innerHTML = '';
  levelupModal.classList.remove('hidden');

  for (const opt of options) {
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    card.innerHTML = `
      <span class="card-icon">${opt.icon}</span>
      <div class="card-name">${opt.name}</div>
      <div class="card-desc">${opt.desc}</div>
      <div class="card-level">${opt.levelLabel}</div>
    `;
    card.addEventListener('click', () => {
      applyUpgrade(opt);
      levelupModal.classList.add('hidden');
      state.mode = 'playing';
      syncWeaponBar();
    });
    upgradeCardsEl.appendChild(card);
  }
}

// ═══════════════════════════════════════════
// EFFECTS UPDATE (mines, frost rings, novas, gravity wells)
// ═══════════════════════════════════════════

function updateEffects(dt) {
  updateGravityWells(dt);

  for (let i = state.effects.length - 1; i >= 0; i--) {
    const fx = state.effects[i];
    fx.life -= dt;
    if (fx.life <= 0) { state.effects.splice(i, 1); continue; }

    switch (fx.type) {
      case 'nova':
        fx.radius = fx.maxRadius * (1 - fx.life / fx.maxLife);
        break;

      case 'frost_ring':
        fx.radius = lerp(10, fx.maxRadius, 1 - fx.life / fx.maxLife);
        // Damage & slow enemies touched by the ring edge
        for (const e of state.enemies) {
          if (fx.hit.has(e)) continue;
          const d = dist(fx.x, fx.y, e.x, e.y);
          if (Math.abs(d - fx.radius) < 20 + e.radius) {
            fx.hit.add(e);
            dealDamage(e, fx.dmg);
            e.slow = fx.slow;
            e.slowTimer = fx.slowDur;
          }
        }
        break;

      case 'mine':
        fx.armTime -= dt;
        if (fx.armTime <= 0 && !fx.triggered) {
          // Check for nearby enemies
          for (const e of state.enemies) {
            if (dist(fx.x, fx.y, e.x, e.y) < fx.blastR * 0.5) {
              fx.triggered = true;
              break;
            }
          }
          // Also trigger if life is almost up
          if (fx.life < 0.3) fx.triggered = true;
        }
        if (fx.triggered && !fx.exploded) {
          fx.exploded = true;
          for (const e of state.enemies) {
            if (dist(fx.x, fx.y, e.x, e.y) < fx.blastR + e.radius) {
              dealDamage(e, fx.dmg);
            }
          }
          state.effects.push({ type: 'nova', x: fx.x, y: fx.y, radius: 0, maxRadius: fx.blastR, life: 0.3, maxLife: 0.3, color: '#ff8c42' });
          cam.shake = Math.max(cam.shake, 5);
          fx.life = 0;
        }
        break;
    }
  }

  // Lightning FX
  for (let i = state.lightningFx.length - 1; i >= 0; i--) {
    state.lightningFx[i].life -= dt;
    if (state.lightningFx[i].life <= 0) state.lightningFx.splice(i, 1);
  }

  // Damage numbers
  for (let i = state.damageNums.length - 1; i >= 0; i--) {
    const dn = state.damageNums[i];
    dn.life -= dt;
    dn.y += dn.vy * dt;
    dn.vy *= 0.95;
    if (dn.life <= 0) state.damageNums.splice(i, 1);
  }
}

// ═══════════════════════════════════════════
// PROJECTILE UPDATE
// ═══════════════════════════════════════════

function updateProjectiles(dt) {
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i];
    p.life -= dt;
    if (p.life <= 0) { state.projectiles.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.owner === 'enemy') {
      // Hit player
      if (dist(p.x, p.y, state.px, state.py) < p.radius + PLAYER_RADIUS && state.invuln <= 0) {
        const rawDmg = Math.max(1, p.dmg - state.armor);
        state.hp -= rawDmg;
        state.invuln = INVULN_TIME;
        state.dmgFlash = DAMAGE_FLASH;
        cam.shake = Math.max(cam.shake, 5);
        spawnParticles(state.px, state.py, C.playerHit, 8, 100);
        state.projectiles.splice(i, 1);
        if (state.hp <= 0) { gameOver(); return; }
      }
    } else {
      // Hit enemies
      for (const e of state.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (dist(p.x, p.y, e.x, e.y) < p.radius + e.radius) {
          dealDamage(e, p.dmg);
          spawnParticles(p.x, p.y, p.color, 3, 50);
          if (p.pierce > 0) {
            p.pierce--;
          } else {
            state.projectiles.splice(i, 1);
          }
          break;
        }
      }
    }
  }
}

// ═══════════════════════════════════════════
// GEMS UPDATE
// ═══════════════════════════════════════════

function updateGems(dt) {
  const magnetRange = GEM_MAGNET_BASE * state.magnetMult;
  for (let i = state.gems.length - 1; i >= 0; i--) {
    const g = state.gems[i];
    g.life -= dt;
    if (g.life <= 0) { state.gems.splice(i, 1); continue; }
    const d = dist(g.x, g.y, state.px, state.py);
    if (d < magnetRange) {
      const a = angle(g.x, g.y, state.px, state.py);
      const speed = GEM_SPEED * (1 - d / magnetRange + 0.3);
      g.x += Math.cos(a) * speed * dt;
      g.y += Math.sin(a) * speed * dt;
    }
    if (d < PLAYER_RADIUS + g.radius + 5) {
      collectGem(g);
      state.gems.splice(i, 1);
    }
  }
}

// ═══════════════════════════════════════════
// PLAYER UPDATE
// ═══════════════════════════════════════════

function updatePlayer(dt) {
  let mx = 0, my = 0;
  if (input['a'] || input['arrowleft']) mx -= 1;
  if (input['d'] || input['arrowright']) mx += 1;
  if (input['w'] || input['arrowup']) my -= 1;
  if (input['s'] || input['arrowdown']) my += 1;
  // Normalize diagonal
  if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }

  const speed = PLAYER_SPEED_BASE * state.speedMult;
  state.pvx = lerp(state.pvx, mx * speed, 1 - Math.pow(0.0001, dt));
  state.pvy = lerp(state.pvy, my * speed, 1 - Math.pow(0.0001, dt));

  state.px += state.pvx * dt;
  state.py += state.pvy * dt;

  // Clamp to arena
  state.px = clamp(state.px, -ARENA_HALF, ARENA_HALF);
  state.py = clamp(state.py, -ARENA_HALF, ARENA_HALF);

  state.invuln = Math.max(0, state.invuln - dt);
  state.dmgFlash = Math.max(0, state.dmgFlash - dt);

  // Regen
  if (state.regenRate > 0) {
    state.regenAccum += state.regenRate * dt;
    if (state.regenAccum >= 1) {
      const heal = Math.floor(state.regenAccum);
      state.hp = Math.min(state.hp + heal, state.maxHp);
      state.regenAccum -= heal;
    }
  }
}

// ═══════════════════════════════════════════
// GAME FLOW
// ═══════════════════════════════════════════

function startGame() {
  state = newState();
  state.mode = 'playing';
  // Start with Void Bolt
  state.weapons.push(createWeaponInstance('void_bolt', 0));
  cam.x = 0; cam.y = 0; cam.shake = 0;
  menuEl.classList.add('hidden');
  gameoverModal.classList.add('hidden');
  levelupModal.classList.add('hidden');
  hudEl.style.display = '';
  weaponBarEl.style.display = '';
  syncWeaponBar();
  startNextWave();
}

function gameOver() {
  state.mode = 'gameover';
  // Bank stardust
  save.stardust += state.dustEarned;
  save.bestWave = Math.max(save.bestWave, state.wave);
  save.totalKills += state.kills;
  save.totalRuns++;
  persistSave();
  // Show game over
  goWave.textContent = state.wave;
  goKills.textContent = state.kills;
  goLevel.textContent = state.level;
  goDust.textContent = `+${state.dustEarned}`;
  gameoverModal.classList.remove('hidden');
}

function showMenu() {
  if (!state) state = newState();
  state.mode = 'menu';
  menuEl.classList.remove('hidden');
  gameoverModal.classList.add('hidden');
  levelupModal.classList.add('hidden');
  hudEl.style.display = 'none';
  weaponBarEl.style.display = 'none';
  syncShopUI();
  syncMenuStats();
}

function showToast(text) {
  const existing = document.querySelectorAll('.toast');
  existing.forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

// ═══════════════════════════════════════════
// UI SYNC
// ═══════════════════════════════════════════

function syncHUD() {
  if (!state || state.mode === 'menu') return;
  const hpPct = clamp(state.hp / state.maxHp * 100, 0, 100);
  const xpPct = clamp(state.xp / state.xpToNext * 100, 0, 100);
  hpBar.style.width = hpPct + '%';
  hpText.textContent = `${Math.ceil(state.hp)} / ${state.maxHp}`;
  xpBar.style.width = xpPct + '%';
  xpText.textContent = `Lv ${state.level}`;
  waveDisplay.textContent = `WAVE ${state.wave}`;
  const secs = Math.max(0, Math.ceil(state.waveTimer));
  waveTimerEl.textContent = `0:${secs < 10 ? '0' : ''}${secs}`;
  killsEl.textContent = state.kills;
  runDustEl.textContent = state.dustEarned;
}

function syncWeaponBar() {
  weaponBarEl.innerHTML = '';
  for (const wep of state.weapons) {
    const slot = document.createElement('div');
    slot.className = 'weapon-slot';
    slot.innerHTML = `${wep.def.icon}<span class="wep-level">${wep.level + 1}</span>`;
    weaponBarEl.appendChild(slot);
  }
}

function syncShopUI() {
  shopDustEl.textContent = save.stardust;
  shopGrid.innerHTML = '';
  for (const meta of META_UPGRADES) {
    const level = save.upgrades[meta.key];
    const maxed = level >= meta.max;
    const cost = maxed ? 0 : meta.costs(level);
    const affordable = save.stardust >= cost;
    const item = document.createElement('div');
    item.className = `shop-item${maxed ? ' maxed' : ''}${affordable && !maxed ? ' affordable' : ''}`;
    item.innerHTML = `
      <div class="si-name">${meta.name}</div>
      <div class="si-level">${maxed ? `MAX (Lv ${level})` : `Lv ${level} → ${level + 1}`}</div>
      <div class="si-cost">${maxed ? '—' : `✦ ${cost}`}</div>
    `;
    if (!maxed && affordable) {
      item.addEventListener('click', () => {
        save.stardust -= cost;
        save.upgrades[meta.key]++;
        persistSave();
        syncShopUI();
      });
    }
    shopGrid.appendChild(item);
  }
}

function syncMenuStats() {
  bestWaveEl.textContent = save.bestWave;
  totalKillsEl.textContent = save.totalKills;
  totalRunsEl.textContent = save.totalRuns;
  shopDustEl.textContent = save.stardust;
}

// ═══════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════

function drawGrid() {
  const gridSize = 80;
  const startX = Math.floor((cam.x - canvas.width / 2) / gridSize) * gridSize;
  const startY = Math.floor((cam.y - canvas.height / 2) / gridSize) * gridSize;
  const endX = startX + canvas.width + gridSize * 2;
  const endY = startY + canvas.height + gridSize * 2;

  ctx.lineWidth = 1;
  for (let x = startX; x <= endX; x += gridSize) {
    const big = x % (gridSize * 4) === 0;
    ctx.strokeStyle = big ? C.gridLineBright : C.gridLine;
    const s = worldToScreen(x, startY);
    const e = worldToScreen(x, endY);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
  }
  for (let y = startY; y <= endY; y += gridSize) {
    const big = y % (gridSize * 4) === 0;
    ctx.strokeStyle = big ? C.gridLineBright : C.gridLine;
    const s = worldToScreen(startX, y);
    const e = worldToScreen(endX, y);
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
  }
}

function drawArenaBorder() {
  const tl = worldToScreen(-ARENA_HALF, -ARENA_HALF);
  const br = worldToScreen(ARENA_HALF, ARENA_HALF);
  ctx.strokeStyle = rgba(C.magenta, 0.35);
  ctx.lineWidth = 3;
  ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
}

function drawPlayer() {
  const p = worldToScreen(state.px, state.py);
  const r = PLAYER_RADIUS;

  // Glow
  const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
  grd.addColorStop(0, state.dmgFlash > 0 ? rgba(C.playerHit, 0.4) : rgba(C.player, 0.25));
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 3, 0, TWO_PI);
  ctx.fill();

  // Body (diamond shape)
  ctx.save();
  ctx.translate(p.x, p.y);
  // Point in movement direction
  const moveAngle = (state.pvx !== 0 || state.pvy !== 0) ? Math.atan2(state.pvy, state.pvx) : -Math.PI / 2;
  ctx.rotate(moveAngle + Math.PI / 2);

  // Invuln blink
  if (state.invuln > 0 && Math.sin(state.time * 30) > 0) {
    ctx.globalAlpha = 0.4;
  }

  ctx.fillStyle = state.dmgFlash > 0 ? C.playerHit : C.player;
  ctx.shadowColor = state.dmgFlash > 0 ? C.playerHit : C.player;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.3);
  ctx.lineTo(r * 0.8, r * 0.3);
  ctx.lineTo(0, r);
  ctx.lineTo(-r * 0.8, r * 0.3);
  ctx.closePath();
  ctx.fill();

  // Inner detail
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5);
  ctx.lineTo(r * 0.25, r * 0.1);
  ctx.lineTo(0, r * 0.5);
  ctx.lineTo(-r * 0.25, r * 0.1);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawEnemies() {
  for (const e of state.enemies) {
    if (e.dead) continue;
    const p = worldToScreen(e.x, e.y);

    // Check if on screen
    if (p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) continue;

    const r = e.radius;
    const color = e.hitFlash > 0 ? '#ffffff' : e.color;

    // Glow
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2.5);
    grd.addColorStop(0, rgba(e.color, 0.2));
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 2.5, 0, TWO_PI);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = color;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 10;

    switch (e.def.shape) {
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0);
        ctx.closePath(); ctx.fill();
        break;
      case 'tri':
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r * 0.87, r * 0.5); ctx.lineTo(-r * 0.87, r * 0.5);
        ctx.closePath(); ctx.fill();
        break;
      case 'hex':
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = TWO_PI / 6 * i - Math.PI / 6;
          const method = i === 0 ? 'moveTo' : 'lineTo';
          ctx[method](Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath(); ctx.fill();
        break;
      case 'circle':
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TWO_PI); ctx.fill();
        break;
      case 'square':
        ctx.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6);
        break;
      case 'shield':
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, -r * 0.3); ctx.lineTo(r, r * 0.5);
        ctx.lineTo(0, r); ctx.lineTo(-r, r * 0.5); ctx.lineTo(-r, -r * 0.3);
        ctx.closePath(); ctx.fill();
        break;
      case 'boss':
        // Multi-layered boss shape
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = TWO_PI / 8 * i + state.time * 0.5;
          const br = i % 2 === 0 ? r : r * 0.6;
          const method = i === 0 ? 'moveTo' : 'lineTo';
          ctx[method](Math.cos(a) * br, Math.sin(a) * br);
        }
        ctx.closePath(); ctx.fill();
        // Inner eye
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(0, 0, r * 0.25, 0, TWO_PI); ctx.fill();
        ctx.fillStyle = e.color;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.12, 0, TWO_PI); ctx.fill();
        break;
      default:
        ctx.beginPath(); ctx.arc(0, 0, r, 0, TWO_PI); ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();

    // Boss HP bar
    if (e.def.isBoss) {
      const bw = 60, bh = 5;
      const bx = p.x - bw / 2, by = p.y - r - 12;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      ctx.fillStyle = C.magenta;
      ctx.fillRect(bx, by, bw * clamp(e.hp / e.maxHp, 0, 1), bh);
    }
  }
}

function drawProjectiles() {
  for (const p of state.projectiles) {
    const sp = worldToScreen(p.x, p.y);
    if (sp.x < -20 || sp.x > canvas.width + 20 || sp.y < -20 || sp.y > canvas.height + 20) continue;

    ctx.save();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, p.radius, 0, TWO_PI);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function drawGems() {
  for (const g of state.gems) {
    const sp = worldToScreen(g.x, g.y);
    if (sp.x < -20 || sp.x > canvas.width + 20 || sp.y < -20 || sp.y > canvas.height + 20) continue;

    const pulse = 0.8 + Math.sin(state.time * 6 + g.x * 0.1) * 0.2;
    const r = g.radius * pulse;

    // Glow
    const grd = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 3);
    grd.addColorStop(0, rgba(C.xpGem, 0.3));
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, r * 3, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = C.xpGem;
    ctx.shadowColor = C.xpGem;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    // Diamond shape
    ctx.moveTo(sp.x, sp.y - r);
    ctx.lineTo(sp.x + r, sp.y);
    ctx.lineTo(sp.x, sp.y + r);
    ctx.lineTo(sp.x - r, sp.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawOrbitShards() {
  const wep = state.weapons.find(w => w.defId === 'orbit_shards');
  if (!wep) return;
  const s = getWeaponStats(wep);
  for (let i = 0; i < s.count; i++) {
    const a = state.time * s.speed + (TWO_PI / s.count) * i;
    const wx = state.px + Math.cos(a) * s.radius;
    const wy = state.py + Math.sin(a) * s.radius;
    const sp = worldToScreen(wx, wy);

    ctx.save();
    ctx.translate(sp.x, sp.y);
    ctx.rotate(a * 2);
    ctx.fillStyle = C.violet;
    ctx.shadowColor = C.violet;
    ctx.shadowBlur = 10;
    // Diamond
    ctx.beginPath();
    ctx.moveTo(0, -s.size);
    ctx.lineTo(s.size * 0.6, 0);
    ctx.lineTo(0, s.size);
    ctx.lineTo(-s.size * 0.6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

function drawEffects() {
  for (const fx of state.effects) {
    const sp = worldToScreen(fx.x, fx.y);

    switch (fx.type) {
      case 'nova': {
        const alpha = clamp(fx.life / fx.maxLife, 0, 1);
        ctx.strokeStyle = rgba(fx.color, alpha * 0.8);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, fx.radius, 0, TWO_PI);
        ctx.stroke();
        // Inner fill
        ctx.fillStyle = rgba(fx.color, alpha * 0.1);
        ctx.fill();
        break;
      }

      case 'frost_ring': {
        const alpha = clamp(fx.life / fx.maxLife, 0, 1);
        ctx.strokeStyle = rgba(fx.color, alpha * 0.6);
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, fx.radius, 0, TWO_PI);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'mine': {
        if (fx.exploded) break;
        const armed = fx.armTime <= 0;
        const pulse = armed ? 0.6 + Math.sin(state.time * 12) * 0.4 : 0.3;
        ctx.fillStyle = rgba(fx.color, pulse);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 6, 0, TWO_PI);
        ctx.fill();
        if (armed) {
          ctx.strokeStyle = rgba(fx.color, 0.4);
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, fx.blastR * 0.5, 0, TWO_PI);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        break;
      }

      case 'gravity_well': {
        const alpha = clamp(fx.life / fx.maxLife, 0, 1);
        const pulse = 0.8 + Math.sin(state.time * 8) * 0.2;
        ctx.save();
        ctx.translate(sp.x, sp.y);
        // Spiral lines
        ctx.strokeStyle = rgba(fx.color, alpha * 0.4);
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          for (let t = 0; t < 20; t++) {
            const angle = t * 0.3 + state.time * 3 + i * TWO_PI / 3;
            const r = (t / 20) * fx.radius * pulse;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.restore();
        break;
      }
    }
  }

  // Lightning effects
  for (const lf of state.lightningFx) {
    const alpha = clamp(lf.life / lf.maxLife, 0, 1);
    ctx.strokeStyle = rgba(C.cyan, alpha);
    ctx.lineWidth = 2.5;
    ctx.shadowColor = C.cyan;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i = 0; i < lf.chain.length; i++) {
      const sp = worldToScreen(lf.chain[i].x, lf.chain[i].y);
      if (i === 0) ctx.moveTo(sp.x, sp.y);
      else {
        // Jagged line
        const prev = worldToScreen(lf.chain[i-1].x, lf.chain[i-1].y);
        const mx = (prev.x + sp.x) / 2 + (Math.random() - 0.5) * 20;
        const my = (prev.y + sp.y) / 2 + (Math.random() - 0.5) * 20;
        ctx.lineTo(mx, my);
        ctx.lineTo(sp.x, sp.y);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const sp = worldToScreen(p.x, p.y);
    if (sp.x < -10 || sp.x > canvas.width + 10 || sp.y < -10 || sp.y > canvas.height + 10) continue;
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = rgba(p.color, alpha * 0.8);
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, p.radius * alpha, 0, TWO_PI);
    ctx.fill();
  }
}

function drawDamageNums() {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const dn of state.damageNums) {
    const sp = worldToScreen(dn.x, dn.y);
    const alpha = clamp(dn.life / dn.maxLife, 0, 1);
    ctx.font = dn.crit ? 'bold 16px Orbitron, monospace' : '13px Rajdhani, sans-serif';
    ctx.fillStyle = dn.crit ? rgba('#ffc845', alpha) : rgba('#ffffff', alpha * 0.9);
    ctx.shadowColor = dn.crit ? '#ffc845' : 'transparent';
    ctx.shadowBlur = dn.crit ? 8 : 0;
    ctx.fillText(dn.dmg, sp.x, sp.y);
    ctx.shadowBlur = 0;
  }
}

function drawBackground() {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ambient particles (stars)
  const starSeed = 42;
  for (let i = 0; i < 60; i++) {
    const hash = (i * 137 + starSeed) % 1000;
    const sx = ((hash * 3.7 + cam.x * (0.02 + (i % 5) * 0.004)) % canvas.width + canvas.width) % canvas.width;
    const sy = ((hash * 7.3 + cam.y * (0.015 + (i % 3) * 0.003)) % canvas.height + canvas.height) % canvas.height;
    const brightness = 0.15 + Math.sin(state.time * 0.8 + i * 0.7) * 0.1;
    ctx.fillStyle = `rgba(160,200,255,${brightness})`;
    ctx.fillRect(sx, sy, i % 4 === 0 ? 2 : 1, 1);
  }
}

function drawPausedOverlay() {
  ctx.fillStyle = 'rgba(2,4,10,0.55)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = rgba(C.cyan, 0.9);
  ctx.font = 'bold 36px Orbitron, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  ctx.font = '14px Rajdhani, sans-serif';
  ctx.fillStyle = rgba(C.white, 0.5);
  ctx.fillText('Press P to resume', canvas.width / 2, canvas.height / 2 + 40);
}

function render() {
  if (!state) return;
  drawBackground();
  drawGrid();
  drawArenaBorder();
  drawGems();
  drawEffects();
  drawOrbitShards();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawParticles();
  drawDamageNums();

  if (state.mode === 'paused') drawPausedOverlay();
}

// ═══════════════════════════════════════════
// GAME LOOP
// ═══════════════════════════════════════════

function update(dt) {
  if (state.mode !== 'playing') return;
  state.time += dt;

  updatePlayer(dt);
  updateCamera(dt);
  updateWeapons(dt);
  updateOrbitShards(dt);
  updateProjectiles(dt);
  updateEnemies(dt);
  updateGems(dt);
  updateEffects(dt);
  updateParticles(dt);
  updateWaves(dt);
  syncHUD();
}

function frame(time) {
  const dt = Math.min(0.05, (time - lastTime) / 1000 || 1 / 60);
  lastTime = time;
  resize();

  if (state) {
    if (state.mode === 'playing' || state.mode === 'paused') {
      update(dt);
      render();
    } else if (state.mode === 'levelup') {
      // Still render but don't update
      updateCamera(dt);
      render();
    } else if (state.mode === 'gameover') {
      updateCamera(dt);
      updateParticles(dt);
      render();
    } else if (state.mode === 'menu') {
      // Animate background
      state.time += dt;
      render();
    }
  }

  requestAnimationFrame(frame);
}

// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════

startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', showMenu);

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

state = newState();
resize();
showMenu();
requestAnimationFrame(frame);
