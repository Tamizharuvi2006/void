/* ═══════════════════════════════════════════════════════════════
   VOID ASCENT v2.0 — The Awakening: Mystery-Driven Roguelite
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
const ultBar = document.getElementById('ult-bar');
const ultText = document.getElementById('ult-text');
const dashBar = document.getElementById('dash-bar');
const waveDisplay = document.getElementById('wave-display');
const waveTimerEl = document.getElementById('wave-timer');
const killsEl = document.getElementById('kills');
const runDustEl = document.getElementById('run-dust');
const goWave = document.getElementById('go-wave');
const goKills = document.getElementById('go-kills');
const goLevel = document.getElementById('go-level');
const goDust = document.getElementById('go-dust');
const goCombo = document.getElementById('go-combo');
const shopGrid = document.getElementById('shop-grid');
const shopDustEl = document.getElementById('shop-dust');
const bestWaveEl = document.getElementById('best-wave');
const totalKillsEl = document.getElementById('total-kills');
const totalRunsEl = document.getElementById('total-runs');
const achieveCountEl = document.getElementById('achievement-count');
const hudEl = document.getElementById('hud');
const vignetteEl = document.getElementById('vignette');
const screenFlashEl = document.getElementById('screen-flash');
const comboDisplayEl = document.getElementById('combo-display');
const comboCountEl = document.getElementById('combo-count');
const comboMultEl = document.getElementById('combo-mult');
const waveAnnounceEl = document.getElementById('wave-announce');
const achieveContainer = document.getElementById('achievement-container');
const muteBtn = document.getElementById('mute-btn');
const minimapCanvas = document.getElementById('minimap');
const minimapCtx = minimapCanvas.getContext('2d');
const joystickZone = document.getElementById('joystick-zone');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');

// ─── Constants ───
const SAVE_KEY = 'void-ascent-save-v2';
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
const MAX_PARTICLES = 800;
const MAX_DAMAGE_NUMS = 80;
const MAX_ENEMIES = 300;
const TRAIL_LENGTH = 16;
const COMBO_DECAY = 3.0;
const ULT_MAX = 100;

// ─── Colors ───
const C = {
  bg: '#030609', gridLine: 'rgba(0,240,255,0.04)', gridLineBright: 'rgba(0,240,255,0.08)',
  player: '#00f0ff', playerGlow: 'rgba(0,240,255,0.3)', playerHit: '#ff2d55',
  xpGem: '#a8ff44', xpGemGlow: 'rgba(168,255,68,0.35)',
  cyan: '#00f0ff', magenta: '#ff2d95', amber: '#ffc845', lime: '#a8ff44',
  violet: '#b44dff', ice: '#7df3ff', white: '#eaf4ff', fire: '#ff6b2b',
};

// ─── Utilities ───
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function dist(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); }
function angle(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }
function rand(lo, hi) { return lo + Math.random() * (hi - lo); }
function randInt(lo, hi) { return Math.floor(rand(lo, hi + 1)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function hexToRgb(hex) { const v = parseInt(hex.replace('#', ''), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

// ═══════════════════════════════════════════
// SOUND SYSTEM (Web Audio API)
// ═══════════════════════════════════════════
let audioCtx = null;
let soundMuted = false;

function initAudio() {
  if (audioCtx) return;
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
}

function playSound(type) {
  if (soundMuted || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    switch (type) {
      case 'hit':
        osc.type = 'square'; osc.frequency.setValueAtTime(200, t); osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
        gain.gain.setValueAtTime(0.06, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t); osc.stop(t + 0.08); break;
      case 'kill':
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, t); osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
        gain.gain.setValueAtTime(0.06, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t); osc.stop(t + 0.12); break;
      case 'pickup':
        osc.type = 'sine'; osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(1200, t + 0.06);
        gain.gain.setValueAtTime(0.04, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t); osc.stop(t + 0.08); break;
      case 'levelup':
        osc.type = 'sine'; osc.frequency.setValueAtTime(523, t); osc.frequency.setValueAtTime(659, t + 0.08); osc.frequency.setValueAtTime(784, t + 0.16);
        gain.gain.setValueAtTime(0.08, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t); osc.stop(t + 0.35); break;
      case 'hurt':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        gain.gain.setValueAtTime(0.08, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.15); break;
      case 'ultimate':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(100, t); osc.frequency.exponentialRampToValueAtTime(2000, t + 0.4);
        gain.gain.setValueAtTime(0.1, t); gain.gain.linearRampToValueAtTime(0.12, t + 0.2); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t); osc.stop(t + 0.6); break;
      case 'achieve':
        osc.type = 'sine'; osc.frequency.setValueAtTime(880, t); osc.frequency.setValueAtTime(1047, t + 0.1); osc.frequency.setValueAtTime(1319, t + 0.2);
        gain.gain.setValueAtTime(0.06, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.4); break;
      case 'boss':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, t); osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);
        gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
        osc.start(t); osc.stop(t + 0.6); break;
    }
  } catch {}
}

// ─── Save System ───
function defaultSave() {
  return { stardust: 0, bestWave: 0, totalKills: 0, totalRuns: 0, achievements: [],
    upgrades: { maxHp: 0, damage: 0, speed: 0, xpGain: 0, pickupRadius: 0, armor: 0 } };
}
let save = loadSave();
function loadSave() {
  try {
    // Try v2 first, then migrate from v1
    let raw = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!raw) {
      raw = JSON.parse(localStorage.getItem('void-ascent-save-v1'));
      if (raw) { localStorage.removeItem('void-ascent-save-v1'); }
    }
    if (!raw) return defaultSave();
    const def = defaultSave();
    return { ...def, ...raw, upgrades: { ...def.upgrades, ...(raw.upgrades || {}) }, achievements: raw.achievements || [] };
  } catch { return defaultSave(); }
}
function persistSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch {} }

// ─── Meta Upgrades ───
const META_UPGRADES = [
  { key: 'maxHp', name: 'Vitality', max: 10, costs: i => 30 + i * 25, desc: l => `+${(l+1)*10} Max HP` },
  { key: 'damage', name: 'Fury', max: 10, costs: i => 40 + i * 30, desc: l => `+${(l+1)*5}% Damage` },
  { key: 'speed', name: 'Swiftness', max: 5, costs: i => 35 + i * 28, desc: l => `+${(l+1)*4}% Speed` },
  { key: 'xpGain', name: 'Wisdom', max: 8, costs: i => 25 + i * 22, desc: l => `+${(l+1)*8}% XP` },
  { key: 'pickupRadius', name: 'Magnetism', max: 5, costs: i => 30 + i * 24, desc: l => `+${(l+1)*15}% Radius` },
  { key: 'armor', name: 'Resilience', max: 5, costs: i => 50 + i * 35, desc: l => `+${l+1} Armor` },
];

// ─── Achievements ───
const ACHIEVEMENT_DEFS = [
  { id: 'first_blood', name: 'First Blood', desc: 'Kill your first enemy', icon: '🗡️', reward: 10, check: s => s.kills >= 1 },
  { id: 'century', name: 'Century', desc: 'Kill 100 enemies in one run', icon: '💯', reward: 30, check: s => s.kills >= 100 },
  { id: 'slaughter', name: 'Slaughter', desc: 'Kill 500 enemies in one run', icon: '☠️', reward: 80, check: s => s.kills >= 500 },
  { id: 'wave5', name: 'Rising Tide', desc: 'Reach wave 5', icon: '🌊', reward: 20, check: s => s.wave >= 5 },
  { id: 'wave10', name: 'Deep Void', desc: 'Reach wave 10', icon: '🕳️', reward: 50, check: s => s.wave >= 10 },
  { id: 'wave20', name: 'Void Master', desc: 'Reach wave 20', icon: '👑', reward: 120, check: s => s.wave >= 20 },
  { id: 'boss_kill', name: 'Rift Slayer', desc: 'Kill a Rift Lord boss', icon: '⚔️', reward: 40, check: s => s.bossKills >= 1 },
  { id: 'combo10', name: 'Combo Starter', desc: 'Reach 10x combo', icon: '🔥', reward: 25, check: s => s.bestCombo >= 10 },
  { id: 'combo30', name: 'Combo Master', desc: 'Reach 30x combo', icon: '💥', reward: 60, check: s => s.bestCombo >= 30 },
  { id: 'weapons4', name: 'Armed & Ready', desc: 'Have 4 weapons at once', icon: '🔮', reward: 35, check: s => s.weapons.length >= 4 },
  { id: 'weapons6', name: 'Arsenal', desc: 'Have 6 weapons at once', icon: '💠', reward: 70, check: s => s.weapons.length >= 6 },
  { id: 'level10', name: 'Ascendant', desc: 'Reach level 10', icon: '⬆️', reward: 25, check: s => s.level >= 10 },
  { id: 'level20', name: 'Transcendent', desc: 'Reach level 20', icon: '✨', reward: 60, check: s => s.level >= 20 },
  { id: 'ultimate', name: 'Void Nova', desc: 'Use your ultimate ability', icon: '💫', reward: 15, check: s => s.ultUsed },
];

// ─── Weapon Definitions (12 total) ───
const WEAPON_DEFS = [
  { id: 'void_bolt', name: 'Void Bolt', icon: '🔮', maxLv: 6, desc: 'Fires a bolt at the nearest enemy',
    stats: [{ dmg:12,cd:0.85,count:1,speed:420,size:5 },{ dmg:18,cd:0.75,count:1,speed:450,size:5 },{ dmg:22,cd:0.65,count:2,speed:480,size:6 },{ dmg:30,cd:0.55,count:2,speed:500,size:6 },{ dmg:42,cd:0.45,count:3,speed:540,size:7 },{ dmg:60,cd:0.35,count:4,speed:600,size:8,evolved:true }], evolvedName:'Void Barrage', evolvedIcon:'🌠' },
  { id: 'orbit_shards', name: 'Orbit Shards', icon: '💠', maxLv: 6, desc: 'Crystals orbit around you',
    stats: [{ dmg:8,count:2,radius:60,speed:2.2,size:7 },{ dmg:12,count:3,radius:70,speed:2.4,size:8 },{ dmg:16,count:3,radius:80,speed:2.6,size:9 },{ dmg:22,count:4,radius:90,speed:2.8,size:10 },{ dmg:30,count:5,radius:100,speed:3.0,size:11 },{ dmg:45,count:6,radius:120,speed:3.5,size:13,evolved:true }], evolvedName:'Aegis Crystals', evolvedIcon:'🌟' },
  { id: 'nova_pulse', name: 'Nova Pulse', icon: '💥', maxLv: 6, desc: 'Periodic explosion around you',
    stats: [{ dmg:15,cd:3.2,radius:90 },{ dmg:22,cd:2.8,radius:110 },{ dmg:32,cd:2.4,radius:130 },{ dmg:44,cd:2.0,radius:155 },{ dmg:60,cd:1.6,radius:180 },{ dmg:85,cd:1.2,radius:220,evolved:true }], evolvedName:'Supernova', evolvedIcon:'🎇' },
  { id: 'frost_ring', name: 'Frost Ring', icon: '❄️', maxLv: 6, desc: 'Expanding ring that slows enemies',
    stats: [{ dmg:6,cd:4.0,maxR:160,slow:0.4,dur:2 },{ dmg:10,cd:3.5,maxR:190,slow:0.45,dur:2.5 },{ dmg:14,cd:3.0,maxR:220,slow:0.5,dur:3 },{ dmg:20,cd:2.5,maxR:260,slow:0.55,dur:3.5 },{ dmg:28,cd:2.0,maxR:300,slow:0.6,dur:4 },{ dmg:40,cd:1.5,maxR:400,slow:0.75,dur:5,evolved:true }], evolvedName:'Blizzard Aura', evolvedIcon:'🌨️' },
  { id: 'lightning_chain', name: 'Lightning Chain', icon: '⚡', maxLv: 6, desc: 'Bolt bouncing between enemies',
    stats: [{ dmg:14,cd:1.8,bounces:2,range:120 },{ dmg:20,cd:1.6,bounces:3,range:140 },{ dmg:28,cd:1.4,bounces:3,range:160 },{ dmg:38,cd:1.2,bounces:4,range:180 },{ dmg:52,cd:1.0,bounces:5,range:200 },{ dmg:70,cd:0.8,bounces:7,range:250,evolved:true }], evolvedName:'Stormcaller', evolvedIcon:'🌩️' },
  { id: 'phantom_mines', name: 'Phantom Mines', icon: '💣', maxLv: 6, desc: 'Drops exploding mines behind you',
    stats: [{ dmg:20,cd:2.5,blastR:55,count:1 },{ dmg:30,cd:2.2,blastR:65,count:1 },{ dmg:40,cd:2.0,blastR:75,count:2 },{ dmg:55,cd:1.7,blastR:85,count:2 },{ dmg:75,cd:1.4,blastR:100,count:3 },{ dmg:100,cd:1.0,blastR:120,count:4,evolved:true }], evolvedName:'Void Charges', evolvedIcon:'🎆' },
  { id: 'death_blossom', name: 'Death Blossom', icon: '🌀', maxLv: 6, desc: 'Spinning blades in all directions',
    stats: [{ dmg:8,cd:1.6,count:4,speed:280,size:6 },{ dmg:12,cd:1.4,count:5,speed:300,size:6 },{ dmg:16,cd:1.2,count:6,speed:320,size:7 },{ dmg:22,cd:1.0,count:8,speed:350,size:7 },{ dmg:30,cd:0.8,count:10,speed:380,size:8 },{ dmg:45,cd:0.6,count:14,speed:420,size:10,evolved:true }], evolvedName:'Razor Storm', evolvedIcon:'🌪️' },
  { id: 'gravity_well', name: 'Gravity Well', icon: '🕳️', maxLv: 6, desc: 'Vortex that pulls and damages enemies',
    stats: [{ dmg:4,cd:6,radius:80,pull:60,dur:3 },{ dmg:6,cd:5.5,radius:95,pull:75,dur:3.5 },{ dmg:9,cd:5,radius:110,pull:90,dur:4 },{ dmg:13,cd:4.5,radius:130,pull:110,dur:4.5 },{ dmg:18,cd:4,radius:150,pull:130,dur:5 },{ dmg:28,cd:3.5,radius:200,pull:180,dur:6,evolved:true }], evolvedName:'Singularity', evolvedIcon:'🌌' },
  { id: 'plasma_beam', name: 'Plasma Beam', icon: '🔥', maxLv: 6, desc: 'Piercing laser through enemies',
    stats: [{ dmg:18,cd:2.0,length:300,width:6 },{ dmg:26,cd:1.8,length:350,width:7 },{ dmg:36,cd:1.5,length:400,width:8 },{ dmg:48,cd:1.3,length:450,width:9 },{ dmg:65,cd:1.0,length:500,width:11 },{ dmg:90,cd:0.8,length:600,width:15,evolved:true }], evolvedName:'Death Ray', evolvedIcon:'🌋' },
  { id: 'meteor_strike', name: 'Meteor Strike', icon: '☄️', maxLv: 6, desc: 'Devastating AoE from the sky',
    stats: [{ dmg:40,cd:5,radius:70,delay:1 },{ dmg:60,cd:4.5,radius:85,delay:0.9 },{ dmg:85,cd:4,radius:100,delay:0.8 },{ dmg:115,cd:3.5,radius:115,delay:0.7 },{ dmg:160,cd:3,radius:135,delay:0.6 },{ dmg:220,cd:2.5,radius:180,delay:0.5,evolved:true }], evolvedName:'Armageddon', evolvedIcon:'🌍' },
  { id: 'spectral_whip', name: 'Spectral Whip', icon: '🗡️', maxLv: 6, desc: 'Sweeping arc in move direction',
    stats: [{ dmg:14,cd:1.2,arc:1.2,range:80 },{ dmg:20,cd:1.1,arc:1.4,range:90 },{ dmg:28,cd:1.0,arc:1.6,range:100 },{ dmg:38,cd:0.9,arc:1.8,range:115 },{ dmg:52,cd:0.8,arc:2.0,range:130 },{ dmg:75,cd:0.6,arc:3.14,range:160,evolved:true }], evolvedName:'Void Cleaver', evolvedIcon:'⚔️' },
  { id: 'shadow_clones', name: 'Shadow Clones', icon: '👤', maxLv: 6, desc: 'Clones that orbit and shoot',
    stats: [{ count:1,dmg:8,fireRate:1.2,orbitR:80 },{ count:1,dmg:12,fireRate:1.0,orbitR:90 },{ count:2,dmg:14,fireRate:0.9,orbitR:95 },{ count:2,dmg:18,fireRate:0.8,orbitR:100 },{ count:3,dmg:24,fireRate:0.7,orbitR:110 },{ count:4,dmg:35,fireRate:0.5,orbitR:130,evolved:true }], evolvedName:'Legion', evolvedIcon:'👥' },
];

// ─── Passive Upgrade Definitions ───
const PASSIVE_DEFS = [
  { id: 'p_hp', name: 'Max HP +15', icon: '❤️', apply: s => { s.maxHp += 15; s.hp = Math.min(s.hp + 15, s.maxHp); } },
  { id: 'p_dmg', name: 'Damage +10%', icon: '⚔️', apply: s => { s.dmgMult += 0.10; } },
  { id: 'p_speed', name: 'Speed +8%', icon: '👟', apply: s => { s.speedMult += 0.08; } },
  { id: 'p_xp', name: 'XP Gain +15%', icon: '📖', apply: s => { s.xpMult += 0.15; } },
  { id: 'p_magnet', name: 'Pickup Range +20%', icon: '🧲', apply: s => { s.magnetMult += 0.20; } },
  { id: 'p_regen', name: 'Regen 1 HP/5s', icon: '💚', apply: s => { s.regenRate += 0.2; } },
  { id: 'p_armor', name: 'Armor +1', icon: '🛡️', apply: s => { s.armor += 1; } },
  { id: 'p_crit', name: 'Crit Chance +5%', icon: '🎯', apply: s => { s.critChance += 0.05; } },
];

// ─── Enemy Definitions ───
const ENEMY_TYPES = {
  wraith:  { name:'Wraith',  hp:20, speed:75, dmg:8,  xp:3, radius:12, color:'#b44dff', shape:'diamond' },
  specter: { name:'Specter', hp:10, speed:130,dmg:5,  xp:2, radius:9,  color:'#00f0ff', shape:'tri' },
  shade:   { name:'Shade',   hp:60, speed:45, dmg:12, xp:6, radius:18, color:'#ff4060', shape:'hex' },
  crawler: { name:'Crawler', hp:6,  speed:100,dmg:3,  xp:1, radius:6,  color:'#a8ff44', shape:'circle' },
  archer:  { name:'Archer',  hp:25, speed:55, dmg:10, xp:5, radius:12, color:'#ffc845', shape:'square', ranged:true, atkCd:2.0, projSpeed:200 },
  knight:  { name:'Knight',  hp:80, speed:40, dmg:18, xp:8, radius:16, color:'#ff8c42', shape:'shield', chargeSpeed:240, chargeDist:200 },
  boss:    { name:'Rift Lord',hp:500,speed:35, dmg:20, xp:50,radius:28, color:'#ff2d95', shape:'boss', isBoss:true },
};



// ─── Game State ───
let state = null, lastTime = 0, input = {}, cam = { x: 0, y: 0, shake: 0, shakeAngle: 0 };
let joystickInput = { x: 0, y: 0, active: false };
let ambientParticles = [];
let waveAnnounceTimeout = null;

function newState() {
  const metaHp = save.upgrades.maxHp * 10;
  const baseHp = 100 + metaHp;
  return {
    mode: 'menu', time: 0, runTime: 0,
    px: 0, py: 0, pvx: 0, pvy: 0, hp: baseHp, maxHp: baseHp,
    lastMoveAngle: -Math.PI / 2, // default facing up
    dashCd: 0, dashTime: 0, dashDir: {x: 0, y: -1},
    xp: 0, xpToNext: XP_BASE, level: 1, invuln: 0, dmgFlash: 0,
    dmgMult: 1 + save.upgrades.damage * 0.05, speedMult: 1 + save.upgrades.speed * 0.04,
    xpMult: 1 + save.upgrades.xpGain * 0.08, magnetMult: 1 + save.upgrades.pickupRadius * 0.15,
    armor: save.upgrades.armor, regenRate: 0, critChance: 0.05, regenAccum: 0,
    wave: 0, waveTimer: 0, waveEnemiesQueue: [], spawnTimer: 0, waveClearBreather: 0,
    weapons: [], enemies: [], projectiles: [], gems: [], effects: [],
    particles: [], damageNums: [], lightningFx: [], beams: [],
    kills: 0, bossKills: 0, dustEarned: 0, passiveCounts: {},
    trail: [],
    dpsStats: {}, // SourceId -> dmg accumulated
    combo: 0, comboTimer: 0, bestCombo: 0,
    ultCharge: 0, ultUsed: false,
    cloneTimers: [],
    chests: [], hazardZones: [],
    eliteModifiers: ['swift','armored','splitting','teleporter','berserker'],
    runAchievements: new Set(),
    ...( window.VoidEvents ? VoidEvents.getDefaultState() : {} ),
    ...( window.VoidLore ? VoidLore.getDefaultState() : {} ),
    ...( window.VoidClasses ? VoidClasses.getDefaultState() : {} ),
    ...( window.VoidWorld ? VoidWorld.getDefaultState() : {} ),
    ...( window.VoidDirector ? VoidDirector.getDefaultState() : {} ),
    watchtowerReveal: 0,
    dashCdBase: 3.0,
  };
}

// ─── Ambient Particles (background) ───
function initAmbientParticles() {
  ambientParticles = [];
  for (let i = 0; i < 50; i++) {
    ambientParticles.push({
      x: rand(-ARENA_HALF, ARENA_HALF), y: rand(-ARENA_HALF, ARENA_HALF),
      vx: rand(-8, 8), vy: rand(-8, 8),
      radius: rand(1, 3), alpha: rand(0.05, 0.2),
      color: pick([C.cyan, C.violet, C.magenta, C.amber]),
    });
  }
}

// ─── Camera ───
function updateCamera(dt) {
  cam.x = lerp(cam.x, state.px, 1 - Math.pow(0.001, dt));
  cam.y = lerp(cam.y, state.py, 1 - Math.pow(0.001, dt));
  if (cam.shake > 0.5) { cam.shake -= SHAKE_DECAY * dt * cam.shake; cam.shakeAngle = Math.random() * TWO_PI; }
  else cam.shake = 0;
}
function worldToScreen(wx, wy) {
  const sx = cam.shake * Math.cos(cam.shakeAngle), sy = cam.shake * Math.sin(cam.shakeAngle);
  return { x: (wx - cam.x) + canvas.width / 2 + sx, y: (wy - cam.y) + canvas.height / 2 + sy };
}

// ─── Input ───
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (['arrowleft','arrowright','arrowup','arrowdown',' ','w','a','s','d'].includes(k)) e.preventDefault();
  input[k] = true;
  if (k === 'p' && state) { if (state.mode === 'playing') state.mode = 'paused'; else if (state.mode === 'paused') state.mode = 'playing'; }
  if (k === 'f') toggleFullscreen();
  if (k === 'm') { soundMuted = !soundMuted; muteBtn.textContent = soundMuted ? '🔇' : '🔊'; }
  if (k === ' ' && state && state.mode === 'playing' && state.ultCharge >= ULT_MAX) { e.preventDefault(); activateUltimate(); }
});
window.addEventListener('keyup', e => { input[e.key.toLowerCase()] = false; });
function toggleFullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }

// ─── Mobile Joystick ───
let joystickTouchId = null;
joystickZone.addEventListener('touchstart', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  joystickTouchId = t.identifier;
  updateJoystick(t);
}, { passive: false });
joystickZone.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches) { if (t.identifier === joystickTouchId) { updateJoystick(t); break; } }
}, { passive: false });
joystickZone.addEventListener('touchend', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === joystickTouchId) {
      joystickTouchId = null; joystickInput.x = 0; joystickInput.y = 0; joystickInput.active = false;
      joystickKnob.style.transform = 'translate(0px, 0px)'; break;
    }
  }
}, { passive: false });

function updateJoystick(touch) {
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  let dx = touch.clientX - cx, dy = touch.clientY - cy;
  const maxDist = rect.width / 2 - 24;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d > maxDist) { dx = dx / d * maxDist; dy = dy / d * maxDist; }
  joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  joystickInput.x = dx / maxDist; joystickInput.y = dy / maxDist; joystickInput.active = true;
}

// ─── Resize ───
function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.floor(canvas.clientWidth * dpr), h = Math.floor(canvas.clientHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
}
window.addEventListener('resize', resize);

// ═══════════════════════════════════════════
// WEAPON SYSTEM
// ═══════════════════════════════════════════
function createWeaponInstance(defId, level = 0) {
  const def = WEAPON_DEFS.find(d => d.id === defId);
  return { defId, level, timer: 0, def };
}
function getWeaponStats(wep) { return wep.def.stats[clamp(wep.level, 0, wep.def.maxLv - 1)]; }

function fireVoidBolt(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  for (let i = 0; i < s.count; i++) {
    const target = findNearest(state.px, state.py, state.enemies, 400);
    if (!target) break;
    const a = angle(state.px, state.py, target.x, target.y) + (i - (s.count-1)/2) * 0.15;
    state.projectiles.push({ x:state.px, y:state.py, vx:Math.cos(a)*s.speed, vy:Math.sin(a)*s.speed, dmg:baseDmg, radius:s.size, life:2, pierce:0, color:C.cyan, owner:'void_bolt', trail:[] });
  }
  playSound('hit');
}

function fireDeathBlossom(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  for (let i = 0; i < s.count; i++) {
    const a = (TWO_PI / s.count) * i + state.time * 0.5;
    state.projectiles.push({ x:state.px, y:state.py, vx:Math.cos(a)*s.speed, vy:Math.sin(a)*s.speed, dmg:baseDmg, radius:s.size, life:1.5, pierce:0, color:C.magenta, owner:'death_blossom', trail:[] });
  }
}

function fireNovaPulse(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  state.effects.push({ type:'nova', x:state.px, y:state.py, radius:0, maxRadius:s.radius, life:0.4, maxLife:0.4, color:C.amber, dmg:baseDmg, hit:new Set(), isDamaging:true, sourceId:wep.defId });
  cam.shake = Math.max(cam.shake, 6); playSound('hit');
}

function fireFrostRing(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  state.effects.push({ type:'frost_ring', x:state.px, y:state.py, radius:10, maxRadius:s.maxR, life:0.8, maxLife:0.8, dmg:baseDmg, slow:s.slow, slowDur:s.dur, hit:new Set(), color:C.ice, sourceId:wep.defId });
}

function fireLightningChain(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  const first = findNearest(state.px, state.py, state.enemies, 300);
  if (!first) return;
  const chain = [{ x:state.px, y:state.py }]; let current = first; const hit = new Set();
  for (let b = 0; b <= s.bounces && current; b++) {
    hit.add(current); dealDamage(current, baseDmg, wep.defId); chain.push({ x:current.x, y:current.y });
    spawnParticles(current.x, current.y, C.cyan, 4, 80);
    let nextTarget = null, bestDist = s.range;
    for (const e of state.enemies) { if (hit.has(e) || e.hp <= 0) continue; const d = dist(current.x, current.y, e.x, e.y); if (d < bestDist) { bestDist = d; nextTarget = e; } }
    current = nextTarget;
  }
  state.lightningFx.push({ chain, life:0.25, maxLife:0.25 });
}

function firePhantomMines(wep) {
  const s = getWeaponStats(wep);
  for (let i = 0; i < s.count; i++) {
    const a = Math.random() * TWO_PI, d = 20 + Math.random() * 30;
    state.effects.push({ type:'mine', x:state.px+Math.cos(a)*d, y:state.py+Math.sin(a)*d, life:4, armTime:0.5, blastR:s.blastR, dmg:Math.round(s.dmg * state.dmgMult), triggered:false, color:C.amber, sourceId:wep.defId });
  }
}

function fireGravityWell(wep) {
  const s = getWeaponStats(wep); const target = findNearest(state.px, state.py, state.enemies, 300);
  const tx = target ? target.x : state.px + (Math.random()-0.5)*200, ty = target ? target.y : state.py + (Math.random()-0.5)*200;
  state.effects.push({ type:'gravity_well', x:tx, y:ty, radius:s.radius, pull:s.pull, dmg:s.dmg, life:s.dur, maxLife:s.dur, color:C.violet, dmgAccum:0, dmgInterval:0.5, dmgTimer:0, sourceId:wep.defId });
}

function firePlasmaBeam(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  const target = findNearest(state.px, state.py, state.enemies, 500);
  const a = target ? angle(state.px, state.py, target.x, target.y) : state.lastMoveAngle;
  const ex = state.px + Math.cos(a) * s.length, ey = state.py + Math.sin(a) * s.length;
  // Hit all enemies along the line
  for (const e of state.enemies) {
    if (e.dead || e.hp <= 0) continue;
    const d = pointToLineDist(e.x, e.y, state.px, state.py, ex, ey);
    if (d < s.width + e.radius) dealDamage(e, baseDmg, wep.defId);
  }
  state.beams.push({ x1:state.px, y1:state.py, x2:ex, y2:ey, width:s.width, life:0.2, maxLife:0.2, color:C.fire });
  cam.shake = Math.max(cam.shake, 4);
}

function pointToLineDist(px, py, x1, y1, x2, y2) {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D, lenSq = C * C + D * D;
  let t = lenSq !== 0 ? clamp(dot / lenSq, 0, 1) : 0;
  return dist(px, py, x1 + t * C, y1 + t * D);
}

function fireMeteorStrike(wep) {
  const s = getWeaponStats(wep);
  const target = findNearest(state.px, state.py, state.enemies, 400);
  const tx = target ? target.x + rand(-30,30) : state.px + rand(-150,150);
  const ty = target ? target.y + rand(-30,30) : state.py + rand(-150,150);
  state.effects.push({ type:'meteor_warning', x:tx, y:ty, radius:s.radius, life:s.delay, maxLife:s.delay, dmg:Math.round(s.dmg * state.dmgMult), color:'#ff4060', sourceId:wep.defId });
}

function fireSpectralWhip(wep) {
  const s = getWeaponStats(wep), baseDmg = Math.round(s.dmg * state.dmgMult);
  const dir = state.lastMoveAngle;
  for (const e of state.enemies) {
    if (e.dead || e.hp <= 0) continue;
    const d = dist(state.px, state.py, e.x, e.y);
    if (d > s.range + e.radius) continue;
    const a = angle(state.px, state.py, e.x, e.y);
    let diff = a - dir; while (diff > Math.PI) diff -= TWO_PI; while (diff < -Math.PI) diff += TWO_PI;
    if (Math.abs(diff) < s.arc / 2) dealDamage(e, baseDmg, wep.defId);
  }
  state.effects.push({ type:'whip_arc', x:state.px, y:state.py, dir, arc:s.arc, range:s.range, life:0.2, maxLife:0.2, color:C.violet });
  playSound('hit');
}

function updateShadowClones(dt) {
  const wep = state.weapons.find(w => w.defId === 'shadow_clones');
  if (!wep) return;
  const s = getWeaponStats(wep);
  // Ensure timers exist
  while (state.cloneTimers.length < s.count) state.cloneTimers.push(0);
  for (let i = 0; i < s.count; i++) {
    state.cloneTimers[i] -= dt;
    if (state.cloneTimers[i] <= 0) {
      state.cloneTimers[i] = s.fireRate;
      const a = state.time * 1.5 + (TWO_PI / s.count) * i;
      const cx = state.px + Math.cos(a) * s.orbitR, cy = state.py + Math.sin(a) * s.orbitR;
      const target = findNearest(cx, cy, state.enemies, 250);
      if (target) {
        const ta = angle(cx, cy, target.x, target.y);
        const proj = { x:cx, y:cy, vx:Math.cos(ta)*350, vy:Math.sin(ta)*350, dmg:Math.round(s.dmg*state.dmgMult), radius:4, life:1.5, pierce:0, color:C.ice, owner:wep.defId, trail:[] };
        if (window.VoidAwakenings && wep.awakenedClass) VoidAwakenings.modifyProjectile(state, wep, proj);
        state.projectiles.push(proj);
      }
    }
  }
}

function updateWeapons(dt) {
  for (const wep of state.weapons) {
    wep.timer -= dt;
    if (wep.timer > 0) continue;
    
    const prevProjCount = state.projectiles.length;
    const prevFxCount = state.effects.length;
    
    const s = getWeaponStats(wep);
    switch (wep.defId) {
      case 'void_bolt': wep.timer = s.cd; fireVoidBolt(wep); break;
      case 'death_blossom': wep.timer = s.cd; fireDeathBlossom(wep); break;
      case 'nova_pulse': wep.timer = s.cd; fireNovaPulse(wep); break;
      case 'frost_ring': wep.timer = s.cd; fireFrostRing(wep); break;
      case 'lightning_chain': wep.timer = s.cd; fireLightningChain(wep); break;
      case 'phantom_mines': wep.timer = s.cd; firePhantomMines(wep); break;
      case 'gravity_well': wep.timer = s.cd; fireGravityWell(wep); break;
      case 'plasma_beam': wep.timer = s.cd; firePlasmaBeam(wep); break;
      case 'meteor_strike': wep.timer = s.cd; fireMeteorStrike(wep); break;
      case 'spectral_whip': wep.timer = s.cd; fireSpectralWhip(wep); break;
      case 'orbit_shards': case 'shadow_clones': wep.timer = 999; break;
    }
    
    if (window.VoidAwakenings && wep.awakenedClass) {
      for (let i = prevProjCount; i < state.projectiles.length; i++) {
        VoidAwakenings.modifyProjectile(state, wep, state.projectiles[i]);
      }
      for (let i = prevFxCount; i < state.effects.length; i++) {
        VoidAwakenings.modifyProjectile(state, wep, state.effects[i]);
      }
    }
  }
}

function updateOrbitShards(dt) {
  const wep = state.weapons.find(w => w.defId === 'orbit_shards');
  if (!wep) return;
  const s = getWeaponStats(wep);
  let baseDmg = Math.round(s.dmg * state.dmgMult);
  if (wep.awakenedClass === 'ruin') baseDmg = Math.round(baseDmg * 1.5);
  
  const color = wep.awakenedColor || C.violet;

  for (let i = 0; i < s.count; i++) {
    const a = state.time * s.speed + (TWO_PI / s.count) * i;
    const sx = state.px + Math.cos(a) * s.radius, sy = state.py + Math.sin(a) * s.radius;
    for (const e of state.enemies) {
      if (e.dead || e.hp <= 0 || e.invuln > 0) continue;
      if (dist(sx, sy, e.x, e.y) < s.size + e.radius) { 
        dealDamage(e, baseDmg, wep.defId); 
        e.invuln = 0.25; 
        spawnParticles(sx, sy, color, 3, 60); 
        
        if (wep.awakenedClass === 'eternity') state.hp = Math.min(state.maxHp, state.hp + baseDmg * 0.05); // Heal on hit
      }
    }
  }
}

// ═══════════════════════════════════════════
// ENTITY HELPERS
// ═══════════════════════════════════════════
function findNearest(x, y, list, maxDist = Infinity) {
  let best = null, bestD = maxDist;
  for (const e of list) { if (e.hp <= 0) continue; const d = dist(x, y, e.x, e.y); if (d < bestD) { bestD = d; best = e; } }
  return best;
}

function dealDamage(enemy, dmg, sourceId = null) {
  const isCrit = Math.random() < state.critChance;
  const finalDmg = isCrit ? Math.round(dmg * 1.8) : dmg;

  // v2.0: Event targets
  if (enemy.isChampion) {
    if (window.VoidEvents) VoidEvents.damageChampion(state, finalDmg);
  } else {
    enemy.hp -= finalDmg; enemy.hitFlash = 0.1;
  }
  
  // DPS Tracking
  if (sourceId) {
    if (!state.dpsStats[sourceId]) state.dpsStats[sourceId] = 0;
    state.dpsStats[sourceId] += finalDmg;
  }
  
  // Damage Number Stacking
  if (enemy.recentDmgTimer > 0) {
    enemy.recentDmg += finalDmg;
    enemy.recentDmgCrit = enemy.recentDmgCrit || isCrit;
  } else {
    enemy.recentDmg = finalDmg;
    enemy.recentDmgCrit = isCrit;
    enemy.recentDmgTimer = 0.2; // 200ms stack window
  }

  state.ultCharge = Math.min(ULT_MAX, state.ultCharge + finalDmg * 0.04);
  if (!enemy.isChampion && enemy.hp <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
  enemy.dead = true; state.kills++;
  if (enemy.def.isBoss) state.bossKills++;
  // Combo
  state.combo++; state.comboTimer = COMBO_DECAY;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  // XP gems
  const gemCount = enemy.def.isBoss ? 12 : (enemy.def.xp >= 6 ? 3 : (enemy.def.xp >= 3 ? 2 : 1));
  const xpPer = Math.ceil(enemy.def.xp / gemCount);
  for (let i = 0; i < gemCount; i++) state.gems.push({ x:enemy.x+rand(-15,15), y:enemy.y+rand(-15,15), xp:xpPer, radius:clamp(3+xpPer,3,8), life:30 });
  // Stardust
  const comboMult = getComboMult();
  const dust = Math.round((enemy.def.isBoss ? 25 + state.wave*3 : Math.max(1, Math.floor(enemy.def.xp * 0.6))) * comboMult);
  state.dustEarned += dust;
  // Enhanced death particles
  const pCount = enemy.def.isBoss ? 40 : (enemy.def.xp >= 6 ? 16 : 10);
  spawnParticles(enemy.x, enemy.y, enemy.color, pCount, enemy.def.isBoss ? 180 : 100);
  // Death ring effect
  state.effects.push({ type:'nova', x:enemy.x, y:enemy.y, radius:0, maxRadius:enemy.radius*3, life:0.25, maxLife:0.25, color:enemy.color });
  if (enemy.def.isBoss) cam.shake = Math.max(cam.shake, 16);
  playSound('kill');
  checkAchievements();
}

function getComboMult() {
  if (state.combo >= 50) return 3.0;
  if (state.combo >= 20) return 2.0;
  if (state.combo >= 10) return 1.5;
  if (state.combo >= 5) return 1.2;
  return 1.0;
}

function spawnDamageNum(x, y, dmg, crit) {
  if (state.damageNums.length >= MAX_DAMAGE_NUMS) state.damageNums.shift();
  state.damageNums.push({ x, y, dmg, crit, vy:-60-Math.random()*30, life:0.7, maxLife:0.7 });
}

// ═══════════════════════════════════════════
// ULTIMATE ABILITY
// ═══════════════════════════════════════════
function activateUltimate() {
  state.ultCharge = 0; state.ultUsed = true;
  // Damage all enemies on screen
  const ultDmg = Math.round(80 * state.dmgMult * (1 + state.wave * 0.1));
  for (const e of state.enemies) {
    if (e.dead) continue;
    const d = dist(state.px, state.py, e.x, e.y);
    if (d < 600) dealDamage(e, ultDmg);
  }
  // Massive visual
  state.effects.push({ type:'nova', x:state.px, y:state.py, radius:0, maxRadius:600, life:0.6, maxLife:0.6, color:'#ffffff' });
  state.effects.push({ type:'nova', x:state.px, y:state.py, radius:0, maxRadius:500, life:0.5, maxLife:0.5, color:C.cyan });
  cam.shake = Math.max(cam.shake, 20);
  spawnParticles(state.px, state.py, '#ffffff', 40, 250);
  spawnParticles(state.px, state.py, C.cyan, 30, 200);
  // Screen flash
  screenFlashEl.classList.remove('active');
  void screenFlashEl.offsetWidth;
  screenFlashEl.classList.add('active');
  playSound('ultimate');
  checkAchievements();
}

// ═══════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════
function spawnParticles(x, y, color, count, speed = 100) {
  for (let i = 0; i < count && state.particles.length < MAX_PARTICLES; i++) {
    const a = Math.random() * TWO_PI, sp = rand(speed * 0.3, speed);
    state.particles.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:rand(0.3,0.7), maxLife:0.7, radius:rand(2,5), color });
  }
}

function updateParticles(dt) {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i]; p.life -= dt; if (p.life <= 0) { state.particles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96;
  }
}

// ═══════════════════════════════════════════
// ENEMY SPAWNING & AI
// ═══════════════════════════════════════════
function spawnEnemy(typeId) {
  if (state.enemies.length >= MAX_ENEMIES) return;
  const def = ENEMY_TYPES[typeId];
  const side = Math.random() * 4, margin = 80;
  // Use CSS pixels, not physical canvas pixels (fixes DPR/Retina bug)
  const hw = canvas.clientWidth / 2 + margin, hh = canvas.clientHeight / 2 + margin;
  let x, y;
  if (side < 1) { x = cam.x - hw; y = cam.y + rand(-hh, hh); }
  else if (side < 2) { x = cam.x + hw; y = cam.y + rand(-hh, hh); }
  else if (side < 3) { x = cam.x + rand(-hw, hw); y = cam.y - hh; }
  else { x = cam.x + rand(-hw, hw); y = cam.y + hh; }
  const hpScale = 1 + state.wave * 0.12, dmgScale = 1 + state.wave * 0.08;
  // Determine elite modifier (small chance on non-boss enemies at wave 4+)
  let elite = null;
  if (!def.isBoss && state.wave >= 4 && Math.random() < 0.08 + state.wave * 0.005) {
    elite = pick(state.eliteModifiers);
  }
  const e = { x, y, hp:Math.round(def.hp*hpScale), maxHp:Math.round(def.hp*hpScale), speed:def.speed, dmg:Math.round(def.dmg*dmgScale), radius:def.radius, color:def.color, def, hitFlash:0, invuln:0, slow:0, slowTimer:0, atkTimer:def.ranged?def.atkCd:0, chargeTimer:0, charging:false, dead:false, elite, teleportTimer:0, recentDmg:0, recentDmgTimer:0, recentDmgCrit:false };
  // Apply elite modifiers
  if (elite === 'swift') { e.speed *= 1.6; e.color = '#ffff00'; }
  else if (elite === 'armored') { e.hp *= 2.5; e.maxHp *= 2.5; e.speed *= 0.7; e.color = '#8888aa'; }
  else if (elite === 'berserker') { e.dmg *= 2; e.speed *= 1.2; e.color = '#ff3333'; }
  else if (elite === 'teleporter') { e.teleportTimer = rand(2, 4); e.color = '#cc44ff'; }
  // splitting is handled on death
  state.enemies.push(e);
  if (def.isBoss) playSound('boss');
}

function updateEnemies(dt) {
  if (state.mode !== 'playing') return;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i]; if (e.dead) { state.enemies.splice(i, 1); continue; }
    
    // Process Damage Stacking
    if (e.recentDmgTimer > 0) {
      e.recentDmgTimer -= dt;
      if (e.recentDmgTimer <= 0) {
        spawnDamageNum(e.x, e.y - e.radius, e.recentDmg, e.recentDmgCrit);
        e.recentDmg = 0;
      }
    }

    e.hitFlash = Math.max(0, e.hitFlash - dt); e.invuln = Math.max(0, e.invuln - dt); e.slowTimer = Math.max(0, e.slowTimer - dt);
    const speedMod = e.slowTimer > 0 ? (1 - e.slow) : 1;
    const a = angle(e.x, e.y, state.px, state.py), d = dist(e.x, e.y, state.px, state.py);
    // Elite: teleporter blinks toward player
    if (e.elite === 'teleporter') {
      e.teleportTimer -= dt;
      if (e.teleportTimer <= 0) {
        e.teleportTimer = rand(2.5, 4.5);
        const tpDist = Math.min(d * 0.6, 150);
        e.x += Math.cos(a) * tpDist; e.y += Math.sin(a) * tpDist;
        spawnParticles(e.x, e.y, '#cc44ff', 8, 80);
      }
    }
    if (e.def.ranged) {
      const pDist = 180;
      if (d > pDist + 20) { e.x += Math.cos(a)*e.speed*speedMod*dt; e.y += Math.sin(a)*e.speed*speedMod*dt; }
      else if (d < pDist - 20) { e.x -= Math.cos(a)*e.speed*speedMod*dt*0.5; e.y -= Math.sin(a)*e.speed*speedMod*dt*0.5; }
      e.atkTimer -= dt;
      if (e.atkTimer <= 0 && d < 350) {
        e.atkTimer = e.def.atkCd;
        state.projectiles.push({ x:e.x, y:e.y, vx:Math.cos(a)*e.def.projSpeed, vy:Math.sin(a)*e.def.projSpeed, dmg:e.dmg, radius:4, life:3, color:e.color, owner:'enemy', trail:[] });
      }
    } else if (e.def.chargeSpeed) {
      if (!e.charging && d < e.def.chargeDist && e.chargeTimer <= 0) { e.charging = true; e.chargeAngle = a; e.chargeTimer = 0.6; }
      if (e.charging) { e.chargeTimer -= dt; e.x += Math.cos(e.chargeAngle)*e.def.chargeSpeed*speedMod*dt; e.y += Math.sin(e.chargeAngle)*e.def.chargeSpeed*speedMod*dt; if (e.chargeTimer <= 0) { e.charging = false; e.chargeTimer = 2.5; } }
      else { e.chargeTimer -= dt; e.x += Math.cos(a)*e.speed*speedMod*dt; e.y += Math.sin(a)*e.speed*speedMod*dt; }
    } else { e.x += Math.cos(a)*e.speed*speedMod*dt; e.y += Math.sin(a)*e.speed*speedMod*dt; }
    // Clamp enemies inside arena
    e.x = clamp(e.x, -ARENA_HALF + e.radius, ARENA_HALF - e.radius);
    e.y = clamp(e.y, -ARENA_HALF + e.radius, ARENA_HALF - e.radius);
    // Collision with player
    if (d < e.radius + PLAYER_RADIUS && state.invuln <= 0) {
      const rawDmg = Math.max(1, e.dmg - state.armor); state.hp -= rawDmg; state.invuln = INVULN_TIME; state.dmgFlash = DAMAGE_FLASH;
      cam.shake = Math.max(cam.shake, 8); spawnParticles(state.px, state.py, C.playerHit, 12, 120);
      state.ultCharge = Math.min(ULT_MAX, state.ultCharge + 8);
      const pushA = angle(e.x, e.y, state.px, state.py);
      state.pvx += Math.cos(pushA)*200; state.pvy += Math.sin(pushA)*200;
      playSound('hurt');
      if (state.hp <= 0) { gameOver(); return; }
    }
  }
}

// ═══════════════════════════════════════════
// WAVE SYSTEM
// ═══════════════════════════════════════════


function showWaveAnnounce(wave) {
  if (waveAnnounceTimeout) clearTimeout(waveAnnounceTimeout);
  waveAnnounceEl.textContent = `WAVE ${wave}`;
  waveAnnounceEl.className = 'wave-announce' + (wave % BOSS_INTERVAL === 0 ? ' boss-wave' : '');
  void waveAnnounceEl.offsetWidth;
  waveAnnounceTimeout = setTimeout(() => { waveAnnounceEl.classList.add('hidden'); waveAnnounceTimeout = null; }, 1800);
}



// ═══════════════════════════════════════════
// TREASURE CHESTS
// ═══════════════════════════════════════════
function spawnChest(x, y, tier) {
  state.chests.push({ x, y, tier, radius: 14, life: 25, collected: false, pulse: 0 });
}

function updateChests(dt) {
  for (let i = state.chests.length - 1; i >= 0; i--) {
    const c = state.chests[i];
    c.life -= dt; c.pulse += dt;
    if (c.life <= 0 || c.collected) { state.chests.splice(i, 1); continue; }
    const d = dist(c.x, c.y, state.px, state.py);
    if (d < c.radius + PLAYER_RADIUS + 10) {
      c.collected = true;
      // Rewards based on tier
      if (c.tier === 'boss') {
        state.hp = Math.min(state.hp + 30, state.maxHp);
        state.dustEarned += 15 + state.wave * 2;
        const gemCount = 8;
        for (let j = 0; j < gemCount; j++) state.gems.push({ x:c.x+rand(-20,20), y:c.y+rand(-20,20), xp:5, radius:6, life:20 });
      } else {
        state.hp = Math.min(state.hp + 15, state.maxHp);
        state.dustEarned += 5 + state.wave;
        const gemCount = 4;
        for (let j = 0; j < gemCount; j++) state.gems.push({ x:c.x+rand(-15,15), y:c.y+rand(-15,15), xp:3, radius:5, life:20 });
      }
      spawnParticles(c.x, c.y, C.amber, 16, 120);
      state.effects.push({ type:'nova', x:c.x, y:c.y, radius:0, maxRadius:50, life:0.3, maxLife:0.3, color:C.amber });
      playSound('achieve');
    }
  }
}

// ═══════════════════════════════════════════
// ARENA HAZARD ZONES
// ═══════════════════════════════════════════
function spawnHazardZone() {
  const types = ['fire','ice','void'];
  const type = pick(types);
  const zx = rand(-ARENA_HALF * 0.6, ARENA_HALF * 0.6);
  const zy = rand(-ARENA_HALF * 0.6, ARENA_HALF * 0.6);
  state.hazardZones.push({ x:zx, y:zy, radius:rand(100,180), type, life:WAVE_DURATION * 2, maxLife:WAVE_DURATION * 2, dmgTimer:0 });
}

function updateHazardZones(dt) {
  for (let i = state.hazardZones.length - 1; i >= 0; i--) {
    const hz = state.hazardZones[i];
    hz.life -= dt;
    if (hz.life <= 0) { state.hazardZones.splice(i, 1); continue; }
    hz.dmgTimer -= dt;
    const pd = dist(hz.x, hz.y, state.px, state.py);
    if (pd < hz.radius && hz.dmgTimer <= 0 && state.invuln <= 0) {
      hz.dmgTimer = 0.8;
      const hazDmg = Math.max(1, Math.round(3 + state.wave * 0.5) - state.armor);
      state.hp -= hazDmg;
      spawnDamageNum(state.px, state.py - PLAYER_RADIUS, hazDmg, false);
      state.dmgFlash = DAMAGE_FLASH;
      if (hz.type === 'ice') { state.pvx *= 0.3; state.pvy *= 0.3; }
      if (state.hp <= 0) { gameOver(); return; }
    }
    // Hazards also slow/damage enemies inside them
    for (const e of state.enemies) {
      if (e.dead) continue;
      const ed = dist(hz.x, hz.y, e.x, e.y);
      if (ed < hz.radius) {
        if (hz.type === 'ice') { e.slow = 0.5; e.slowTimer = 0.5; }
        if (hz.type === 'fire' && Math.random() < dt * 2) { dealDamage(e, Math.round(2 + state.wave * 0.3)); }
      }
    }
  }
}

// ═══════════════════════════════════════════
// COMBO SYSTEM
// ═══════════════════════════════════════════
function updateCombo(dt) {
  if (state.combo > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) { state.combo = 0; state.comboTimer = 0; }
  }
  // Update combo UI
  if (state.combo >= 3) {
    comboDisplayEl.classList.remove('hidden', 'high', 'ultra');
    if (state.combo >= 30) comboDisplayEl.classList.add('ultra');
    else if (state.combo >= 10) comboDisplayEl.classList.add('high');
    comboCountEl.textContent = state.combo;
    comboMultEl.textContent = `×${getComboMult().toFixed(1)}`;
  } else {
    comboDisplayEl.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════
function checkAchievements() {
  for (const ach of ACHIEVEMENT_DEFS) {
    if (save.achievements.includes(ach.id) || state.runAchievements.has(ach.id)) continue;
    if (ach.check(state)) {
      state.runAchievements.add(ach.id);
      save.achievements.push(ach.id);
      save.stardust += ach.reward;
      state.dustEarned += ach.reward;
      persistSave();
      showAchievementToast(ach);
      playSound('achieve');
    }
  }
}

function showAchievementToast(ach) {
  const el = document.createElement('div');
  el.className = 'achievement-toast';
  el.innerHTML = `<span class="achieve-icon">${ach.icon}</span><div class="achieve-info"><span class="achieve-label">Achievement</span><span class="achieve-name">${ach.name}</span><span class="achieve-reward">+${ach.reward} ✦</span></div>`;
  achieveContainer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ═══════════════════════════════════════════
// XP & LEVELING
// ═══════════════════════════════════════════
function collectGem(gem) {
  const xpGain = Math.round(gem.xp * state.xpMult * getComboMult());
  state.xp += xpGain; playSound('pickup');
  // Only trigger one level-up at a time; subsequent ones queue for next gem
  if (state.xp >= state.xpToNext && state.mode === 'playing') {
    state.xp -= state.xpToNext; state.level++;
    state.xpToNext = Math.round(XP_BASE * Math.pow(XP_SCALE, state.level - 1));
    triggerLevelUp();
  }
}

function triggerLevelUp() {
  state.mode = 'levelup'; showLevelUpUI();
  spawnParticles(state.px, state.py, C.cyan, 20, 150);
  cam.shake = Math.max(cam.shake, 5);
  screenFlashEl.classList.remove('active'); void screenFlashEl.offsetWidth; screenFlashEl.classList.add('active');
  playSound('levelup'); checkAchievements();
}

// ═══════════════════════════════════════════
// UPGRADE SELECTION UI
// ═══════════════════════════════════════════
function getUpgradeOptions() {
  const options = [];
  const owned = new Set(state.weapons.map(w => w.defId));
  for (const d of WEAPON_DEFS) { if (!owned.has(d.id)) options.push({ type:'new_weapon', weaponDef:d, name:d.name, icon:d.icon, desc:d.desc, levelLabel:'NEW' }); }
  for (const wep of state.weapons) {
    if (wep.level < wep.def.maxLv - 1) {
      const isEvolution = wep.level === wep.def.maxLv - 2;
      const optName = isEvolution ? wep.def.evolvedName : wep.def.name;
      const optIcon = isEvolution ? wep.def.evolvedIcon : wep.def.icon;
      options.push({ type:'weapon_upgrade', weaponId:wep.defId, name:optName, icon:optIcon, desc:isEvolution ? 'Weapon Evolution!' : `Upgrade to Lv ${wep.level+2}`, levelLabel:isEvolution ? 'EVOLVE' : `LV ${wep.level+1} → ${wep.level+2}` });
    }
  }
  for (const p of PASSIVE_DEFS) options.push({ type:'passive', passive:p, name:p.name, icon:p.icon, desc:'', levelLabel:'PASSIVE' });
  // Shuffle
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  const wOpts = options.filter(o => o.type === 'new_weapon' || o.type === 'weapon_upgrade');
  const pOpts = options.filter(o => o.type === 'passive');
  const result = [];
  if (wOpts.length > 0) result.push(wOpts.shift());
  if (wOpts.length > 0 && Math.random() < 0.4) result.push(wOpts.shift());
  while (result.length < 3) { const pool = [...wOpts, ...pOpts]; if (pool.length === 0) break; const idx = Math.floor(Math.random() * pool.length); const item = pool[idx]; result.push(item); const wi = wOpts.indexOf(item); if (wi >= 0) wOpts.splice(wi, 1); const pi = pOpts.indexOf(item); if (pi >= 0) pOpts.splice(pi, 1); }
  return result.slice(0, 3);
}

function applyUpgrade(option) {
  switch (option.type) {
    case 'new_weapon': state.weapons.push(createWeaponInstance(option.weaponDef.id, 0)); break;
    case 'weapon_upgrade': { const wep = state.weapons.find(w => w.defId === option.weaponId); if (wep) wep.level = Math.min(wep.level + 1, wep.def.maxLv - 1); break; }
    case 'passive': option.passive.apply(state); state.passiveCounts[option.passive.id] = (state.passiveCounts[option.passive.id] || 0) + 1; break;
  }
  checkAchievements();
}

function showLevelUpUI() {
  const options = getUpgradeOptions(); upgradeCardsEl.innerHTML = ''; levelupModal.classList.remove('hidden');
  for (const opt of options) {
    const card = document.createElement('div'); card.className = 'upgrade-card';
    card.innerHTML = `<span class="card-icon">${opt.icon}</span><div class="card-name">${opt.name}</div><div class="card-desc">${opt.desc}</div><div class="card-level">${opt.levelLabel}</div>`;
    card.addEventListener('click', () => { applyUpgrade(opt); levelupModal.classList.add('hidden'); state.mode = 'playing'; syncWeaponBar(); });
    upgradeCardsEl.appendChild(card);
  }
}

// ═══════════════════════════════════════════
// EFFECTS UPDATE
// ═══════════════════════════════════════════
function updateEffects(dt) {
  // Gravity wells — fixed damage accumulator
  for (const fx of state.effects) {
    if (fx.type !== 'gravity_well') continue;
    fx.dmgTimer = (fx.dmgTimer || 0) - dt;
    const baseDmg = Math.round(fx.dmg * state.dmgMult);
    for (const e of state.enemies) {
      if (e.dead) continue;
      const d = dist(fx.x, fx.y, e.x, e.y);
      if (d < fx.radius && d > 5) {
        const a = angle(e.x, e.y, fx.x, fx.y);
        e.x += Math.cos(a)*fx.pull*dt; e.y += Math.sin(a)*fx.pull*dt;
        if (fx.dmgTimer <= 0) dealDamage(e, baseDmg, fx.sourceId);
      }
    }
    if (fx.dmgTimer <= 0) fx.dmgTimer = fx.dmgInterval || 0.5;
  }
  for (let i = state.effects.length - 1; i >= 0; i--) {
    const fx = state.effects[i];
    fx.life -= dt;

    // Handle effects that trigger on expiration BEFORE removal
    if (fx.life <= 0 && fx.type === 'meteor_warning') {
      for (const e of state.enemies) {
        if (e.dead) continue;
        if (dist(fx.x, fx.y, e.x, e.y) < fx.radius + e.radius) {
          let hitDmg = fx.dmg;
          if (fx.backstab) hitDmg = Math.round(hitDmg * 2.5);
          dealDamage(e, hitDmg, fx.sourceId);
          if (fx.healsPlayer) state.hp = Math.min(state.maxHp, state.hp + hitDmg * 0.05);
        }
      }
      state.effects.push({ type:'nova', x:fx.x, y:fx.y, radius:0, maxRadius:fx.radius*1.3, life:0.4, maxLife:0.4, color:'#ff4060' });
      spawnParticles(fx.x, fx.y, C.fire, 20, 150);
      cam.shake = Math.max(cam.shake, 10);
      playSound('hit');
    }

    if (fx.life <= 0) { state.effects.splice(i, 1); continue; }

    switch (fx.type) {
      case 'nova':
        fx.radius = fx.maxRadius * (1 - fx.life / fx.maxLife);
        // Damaging novas sync visual with damage (Bug 12 fix)
        if (fx.isDamaging && fx.hit) {
          for (const e of state.enemies) {
            if (e.dead || fx.hit.has(e)) continue;
            if (dist(fx.x, fx.y, e.x, e.y) < fx.radius + e.radius) {
              fx.hit.add(e);
              let hitDmg = fx.dmg;
              if (fx.backstab) hitDmg = Math.round(hitDmg * 2.5);
              dealDamage(e, hitDmg, fx.sourceId);
              if (fx.healsPlayer) state.hp = Math.min(state.maxHp, state.hp + hitDmg * 0.05);
            }
          }
        }
        break;
      case 'frost_ring':
        fx.radius = lerp(10, fx.maxRadius, 1 - fx.life / fx.maxLife);
        for (const e of state.enemies) {
          if (e.dead || fx.hit.has(e)) continue;
          const d = dist(fx.x, fx.y, e.x, e.y);
          if (Math.abs(d - fx.radius) < 20 + e.radius) {
            fx.hit.add(e);
            let hitDmg = fx.dmg;
            if (fx.backstab) hitDmg = Math.round(hitDmg * 2.5);
            dealDamage(e, hitDmg, fx.sourceId);
            if (fx.healsPlayer) state.hp = Math.min(state.maxHp, state.hp + hitDmg * 0.05);
            e.slow = fx.slow; e.slowTimer = fx.slowDur;
          }
        }
        break;
      case 'mine':
        fx.armTime -= dt;
        if (fx.armTime <= 0 && !fx.triggered) {
          for (const e of state.enemies) { if (!e.dead && dist(fx.x, fx.y, e.x, e.y) < fx.blastR * 0.5) { fx.triggered = true; break; } }
          if (fx.life < 0.3) fx.triggered = true;
        }
        if (fx.triggered && !fx.exploded) {
          fx.exploded = true;
          for (const e of state.enemies) {
            if (!e.dead && dist(fx.x, fx.y, e.x, e.y) < fx.blastR + e.radius) {
              let hitDmg = fx.dmg;
              if (fx.backstab) hitDmg = Math.round(hitDmg * 2.5);
              dealDamage(e, hitDmg, fx.sourceId);
              if (fx.healsPlayer) state.hp = Math.min(state.maxHp, state.hp + hitDmg * 0.05);
            }
          }
          state.effects.push({ type:'nova', x:fx.x, y:fx.y, radius:0, maxRadius:fx.blastR, life:0.3, maxLife:0.3, color:'#ff8c42' });
          cam.shake = Math.max(cam.shake, 5); fx.life = 0;
        }
        break;
      case 'meteor_warning': break; // handled above before splice
    }
  }
  // Lightning FX
  for (let i = state.lightningFx.length - 1; i >= 0; i--) { state.lightningFx[i].life -= dt; if (state.lightningFx[i].life <= 0) state.lightningFx.splice(i, 1); }
  // Beams
  for (let i = state.beams.length - 1; i >= 0; i--) { state.beams[i].life -= dt; if (state.beams[i].life <= 0) state.beams.splice(i, 1); }
  // Damage numbers
  for (let i = state.damageNums.length - 1; i >= 0; i--) { const dn = state.damageNums[i]; dn.life -= dt; dn.y += dn.vy * dt; dn.vy *= 0.95; if (dn.life <= 0) state.damageNums.splice(i, 1); }
}

// ═══════════════════════════════════════════
// PROJECTILE & GEM UPDATE
// ═══════════════════════════════════════════
function updateProjectiles(dt) {
  if (state.mode !== 'playing') return;
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const p = state.projectiles[i]; p.life -= dt; if (p.life <= 0) { state.projectiles.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    // Trail
    if (p.trail) { p.trail.push({ x:p.x, y:p.y }); if (p.trail.length > 6) p.trail.shift(); }
    if (p.teleports && p.life > 1.8) {
      const target = findNearest(p.x, p.y, state.enemies, 800);
      if (target) { p.x = target.x; p.y = target.y; p.teleports = false; spawnParticles(p.x, p.y, p.color, 5, 80); }
    }
    
    if (p.owner === 'enemy') {
      if (dist(p.x, p.y, state.px, state.py) < p.radius + PLAYER_RADIUS && state.invuln <= 0) {
        const rawDmg = Math.max(1, p.dmg - state.armor); state.hp -= rawDmg; state.invuln = INVULN_TIME; state.dmgFlash = DAMAGE_FLASH;
        cam.shake = Math.max(cam.shake, 5); spawnParticles(state.px, state.py, C.playerHit, 8, 100);
        state.projectiles.splice(i, 1); playSound('hurt');
        if (state.hp <= 0) { gameOver(); return; }
      }
    } else {
      for (const e of state.enemies) {
        if (e.dead || e.hp <= 0) continue;
        if (dist(p.x, p.y, e.x, e.y) < p.radius + e.radius) {
          let hitDmg = p.dmg;
          if (p.backstab) hitDmg = Math.round(hitDmg * 2.5); // 250% damage backstab

          dealDamage(e, hitDmg, p.owner); 
          spawnParticles(p.x, p.y, p.color, 3, 50);
          
          if (p.healsPlayer) state.hp = Math.min(state.maxHp, state.hp + hitDmg * 0.05);
          
          if (p.pierce > 0) p.pierce--; else { state.projectiles.splice(i, 1); } break;
        }
      }
    }
  }
}

function updateGems(dt) {
  const magnetRange = GEM_MAGNET_BASE * state.magnetMult;
  for (let i = state.gems.length - 1; i >= 0; i--) {
    const g = state.gems[i]; g.life -= dt; if (g.life <= 0) { state.gems.splice(i, 1); continue; }
    const d = dist(g.x, g.y, state.px, state.py);
    if (d < magnetRange) { const a = angle(g.x, g.y, state.px, state.py); const speed = GEM_SPEED*(1-d/magnetRange+0.3); g.x += Math.cos(a)*speed*dt; g.y += Math.sin(a)*speed*dt; }
    if (d < PLAYER_RADIUS + g.radius + 5) { collectGem(g); state.gems.splice(i, 1); }
  }
}

// ═══════════════════════════════════════════
// PLAYER UPDATE
// ═══════════════════════════════════════════
function updatePlayer(dt) {
  state.runTime += dt;
  let mx = 0, my = 0;
  if (input['a'] || input['arrowleft']) mx -= 1;
  if (input['d'] || input['arrowright']) mx += 1;
  if (input['w'] || input['arrowup']) my -= 1;
  if (input['s'] || input['arrowdown']) my += 1;
  // Mobile joystick
  if (joystickInput.active) { mx = joystickInput.x; my = joystickInput.y; }
  // Normalize diagonal so it's not faster than cardinal
  const mag = Math.sqrt(mx * mx + my * my);
  if (mag > 1) { mx /= mag; my /= mag; }
  // Track last move angle for weapon fallback direction (Bug 4 fix)
  if (mx !== 0 || my !== 0) state.lastMoveAngle = Math.atan2(my, mx);
  const speed = PLAYER_SPEED_BASE * state.speedMult;
  
  // Dash mechanics
  if (state.dashCd > 0) state.dashCd = Math.max(0, state.dashCd - dt);
  
  if (state.dashTime > 0) {
    state.dashTime -= dt;
    state.px += state.dashDir.x * (speed * 3) * dt;
    state.py += state.dashDir.y * (speed * 3) * dt;
    state.px = clamp(state.px, -ARENA_HALF, ARENA_HALF); state.py = clamp(state.py, -ARENA_HALF, ARENA_HALF);
    state.trail.push({ x: state.px, y: state.py, t: state.time });
    if (state.trail.length > TRAIL_LENGTH) state.trail.shift();
    return; // Skip normal movement
  } else if (input['shift'] && state.dashCd <= 0 && (mx !== 0 || my !== 0)) {
    state.dashCd = state.dashCdBase;
    state.dashTime = 0.2;
    state.dashDir = { x: mx, y: my };
    state.invuln = 0.25; // iframe
    playSound('pickup'); // temporary dash sound
    return; // Skip rest for this frame
  }
  
  state.pvx = lerp(state.pvx, mx * speed, 1 - Math.pow(0.0001, dt));
  state.pvy = lerp(state.pvy, my * speed, 1 - Math.pow(0.0001, dt));
  state.px += state.pvx * dt; state.py += state.pvy * dt;
  state.px = clamp(state.px, -ARENA_HALF, ARENA_HALF); state.py = clamp(state.py, -ARENA_HALF, ARENA_HALF);
  state.invuln = Math.max(0, state.invuln - dt); state.dmgFlash = Math.max(0, state.dmgFlash - dt);
  // Regen (only if alive — Bug 7 fix)
  if (state.regenRate > 0 && state.hp > 0) { state.regenAccum += state.regenRate * dt; if (state.regenAccum >= 1) { const heal = Math.floor(state.regenAccum); state.hp = Math.min(state.hp + heal, state.maxHp); state.regenAccum -= heal; } }
  // Trail
  state.trail.push({ x: state.px, y: state.py, t: state.time });
  if (state.trail.length > TRAIL_LENGTH) state.trail.shift();
}

// ═══════════════════════════════════════════
// GAME FLOW
// ═══════════════════════════════════════════
function startGame() {
  initAudio(); state = newState(); state.mode = 'playing';
  input = {}; // Reset input state (Bug 5 fix)
  state.weapons.push(createWeaponInstance('void_bolt', 0));
  cam.x = 0; cam.y = 0; cam.shake = 0;
  menuEl.classList.add('hidden'); gameoverModal.classList.add('hidden'); levelupModal.classList.add('hidden');
  hudEl.style.display = ''; weaponBarEl.style.display = '';
  minimapCanvas.style.display = ''; vignetteEl.style.display = '';
  const bgm = document.getElementById('bgm');
  if (bgm) { bgm.volume = 0.4; if (!soundMuted) bgm.play().catch(()=>{}); }
  syncWeaponBar(); 
  if (window.VoidWorld) VoidWorld.generateInitialWorld(state);
  if (window.VoidDirector) VoidDirector.startNextWave(state, {spawnEnemy, showWaveAnnounce, spawnChest});
  initAmbientParticles();
}

function gameOver() {
  state.mode = 'gameover';
  save.stardust += state.dustEarned; save.bestWave = Math.max(save.bestWave, state.wave);
  save.totalKills += state.kills; save.totalRuns++; persistSave();
  goWave.textContent = state.wave; goKills.textContent = state.kills;
  goLevel.textContent = state.level; goDust.textContent = `+${state.dustEarned}`;
  const rMin = Math.floor(state.runTime / 60), rSec = Math.floor(state.runTime % 60);
  document.getElementById('go-time').textContent = `${rMin}:${rSec < 10 ? '0' : ''}${rSec}`;
  goCombo.textContent = state.bestCombo;
  gameoverModal.classList.remove('hidden');
}

function showMenu() {
  if (!state) state = newState(); state.mode = 'menu';
  menuEl.classList.remove('hidden'); gameoverModal.classList.add('hidden'); levelupModal.classList.add('hidden');
  hudEl.style.display = 'none'; weaponBarEl.style.display = 'none';
  minimapCanvas.style.display = 'none'; vignetteEl.style.display = 'none';
  syncShopUI(); syncMenuStats();
}

// ═══════════════════════════════════════════
// UI SYNC
// ═══════════════════════════════════════════
function syncHUD() {
  if (!state || state.mode === 'menu') return;
  hpBar.style.width = clamp(state.hp / state.maxHp * 100, 0, 100) + '%';
  hpText.textContent = `${Math.ceil(state.hp)} / ${state.maxHp}`;
  xpBar.style.width = clamp(state.xp / state.xpToNext * 100, 0, 100) + '%';
  xpText.textContent = `Lv ${state.level}`;
  ultBar.style.width = clamp(state.ultCharge / ULT_MAX * 100, 0, 100) + '%';
  if (state.ultCharge >= ULT_MAX) { ultBar.classList.add('ready'); ultText.textContent = 'SPACE — ULTIMATE'; }
  else { ultBar.classList.remove('ready'); ultText.textContent = 'ULTIMATE'; }
  
  const dashPct = Math.max(0, 1 - (state.dashCd / state.dashCdBase));
  dashBar.style.width = `${dashPct * 100}%`;
  dashBar.classList.toggle('ready', dashPct === 1);
  
  waveDisplay.textContent = `WAVE ${state.wave}`;
  const secs = Math.max(0, Math.ceil(state.waveTimer));
  waveTimerEl.textContent = `0:${secs < 10 ? '0' : ''}${secs}`;
  const rMin = Math.floor(state.runTime / 60), rSec = Math.floor(state.runTime % 60);
  document.getElementById('run-timer').textContent = `${rMin < 10 ? '0' : ''}${rMin}:${rSec < 10 ? '0' : ''}${rSec}`;
  killsEl.textContent = state.kills; runDustEl.textContent = state.dustEarned;
  
  // Update DPS tooltips
  const slots = weaponBarEl.children;
  for (let i = 0; i < state.weapons.length; i++) {
    const wep = state.weapons[i];
    if (slots[i]) slots[i].dataset.dps = Math.round((state.dpsStats[wep.defId] || 0) / Math.max(1, state.runTime));
  }
  // Vignette HP feedback
  const hpPct = state.hp / state.maxHp;
  vignetteEl.classList.remove('danger', 'critical');
  if (hpPct < 0.2) vignetteEl.classList.add('critical');
  else if (hpPct < 0.4) vignetteEl.classList.add('danger');
}

function syncWeaponBar() {
  weaponBarEl.innerHTML = '';
  for (const wep of state.weapons) {
    const isEvolved = wep.level >= wep.def.maxLv - 1;
    const icon = isEvolved ? wep.def.evolvedIcon : wep.def.icon;
    const slot = document.createElement('div'); slot.className = 'weapon-slot';
    if (isEvolved) slot.classList.add('evolved');
    
    if (wep.awakenedClass) {
      slot.style.borderColor = wep.awakenedColor;
      slot.style.boxShadow = `0 0 10px ${wep.awakenedColor}`;
      slot.innerHTML = `<span style="color:${wep.awakenedColor}; font-size:24px; text-shadow:0 0 10px ${wep.awakenedColor}">${icon}</span><span class="wep-level" style="background:${wep.awakenedColor};color:#000;">AWK</span>`;
    } else {
      slot.innerHTML = `${icon}<span class="wep-level">${isEvolved ? 'MAX' : wep.level + 1}</span>`;
    }
    slot.dataset.dps = Math.round((state.dpsStats[wep.defId] || 0) / Math.max(1, state.runTime));
    weaponBarEl.appendChild(slot);
  }
}

function syncShopUI() {
  shopDustEl.textContent = save.stardust; shopGrid.innerHTML = '';
  for (const meta of META_UPGRADES) {
    const level = save.upgrades[meta.key], maxed = level >= meta.max, cost = maxed ? 0 : meta.costs(level), affordable = save.stardust >= cost;
    const item = document.createElement('div'); item.className = `shop-item${maxed ? ' maxed' : ''}${affordable && !maxed ? ' affordable' : ''}`;
    item.innerHTML = `<div class="si-name">${meta.name}</div><div class="si-level">${maxed ? `MAX (Lv ${level})` : `Lv ${level} → ${level + 1}`}</div><div class="si-cost">${maxed ? '—' : `✦ ${cost}`}</div>`;
    if (!maxed && affordable) item.addEventListener('click', () => { save.stardust -= cost; save.upgrades[meta.key]++; persistSave(); syncShopUI(); playSound('pickup'); });
    shopGrid.appendChild(item);
  }
}

function syncMenuStats() {
  bestWaveEl.textContent = save.bestWave; totalKillsEl.textContent = save.totalKills;
  totalRunsEl.textContent = save.totalRuns; shopDustEl.textContent = save.stardust;
  achieveCountEl.textContent = `${save.achievements.length}/${ACHIEVEMENT_DEFS.length}`;
}

// ═══════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════
function drawBackground() {
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Ambient particles
  for (const ap of ambientParticles) {
    const sp = worldToScreen(ap.x, ap.y);
    if (sp.x < -10 || sp.x > canvas.width + 10 || sp.y < -10 || sp.y > canvas.height + 10) continue;
    ctx.fillStyle = rgba(ap.color, ap.alpha + Math.sin(state.time * 0.5 + ap.x * 0.01) * 0.05);
    ctx.beginPath(); ctx.arc(sp.x, sp.y, ap.radius, 0, TWO_PI); ctx.fill();
  }
}

function drawGrid() {
  const gridSize = 80;
  const sx = Math.floor((cam.x - canvas.width/2) / gridSize) * gridSize, sy = Math.floor((cam.y - canvas.height/2) / gridSize) * gridSize;
  const ex = sx + canvas.width + gridSize*2, ey = sy + canvas.height + gridSize*2;
  ctx.lineWidth = 1;
  for (let x = sx; x <= ex; x += gridSize) { ctx.strokeStyle = x % (gridSize*4) === 0 ? C.gridLineBright : C.gridLine; const a = worldToScreen(x, sy), b = worldToScreen(x, ey); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
  for (let y = sy; y <= ey; y += gridSize) { ctx.strokeStyle = y % (gridSize*4) === 0 ? C.gridLineBright : C.gridLine; const a = worldToScreen(sx, y), b = worldToScreen(ex, y); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
}

function drawArenaBorder() {
  const tl = worldToScreen(-ARENA_HALF, -ARENA_HALF), br = worldToScreen(ARENA_HALF, ARENA_HALF);
  ctx.strokeStyle = rgba(C.magenta, 0.35); ctx.lineWidth = 3; ctx.strokeRect(tl.x, tl.y, br.x-tl.x, br.y-tl.y);
}

function drawPlayerTrail() {
  if (state.trail.length < 2) return;
  for (let i = 0; i < state.trail.length - 1; i++) {
    const alpha = (i / state.trail.length) * 0.3;
    const sp = worldToScreen(state.trail[i].x, state.trail[i].y);
    const r = PLAYER_RADIUS * (i / state.trail.length) * 0.6;
    ctx.fillStyle = rgba(state.dmgFlash > 0 ? C.playerHit : C.player, alpha);
    ctx.beginPath(); ctx.arc(sp.x, sp.y, r, 0, TWO_PI); ctx.fill();
  }
}

function drawPlayer() {
  const p = worldToScreen(state.px, state.py), r = PLAYER_RADIUS;
  const color = window.VoidClasses ? VoidClasses.getPlayerColor(state) : C.player;
  const glow = window.VoidClasses ? VoidClasses.getPlayerGlow(state) : rgba(C.player, 0.25);
  const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
  grd.addColorStop(0, state.dmgFlash > 0 ? rgba(C.playerHit, 0.4) : glow);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(p.x, p.y, r * 3, 0, TWO_PI); ctx.fill();
  ctx.save(); ctx.translate(p.x, p.y);
  const moveAngle = (state.pvx !== 0 || state.pvy !== 0) ? Math.atan2(state.pvy, state.pvx) : -Math.PI / 2;
  ctx.rotate(moveAngle + Math.PI / 2);
  if (state.invuln > 0 && Math.sin(state.time * 30) > 0) ctx.globalAlpha = 0.4;
  ctx.fillStyle = state.dmgFlash > 0 ? C.playerHit : color;
  ctx.shadowColor = state.dmgFlash > 0 ? C.playerHit : color; ctx.shadowBlur = 16;
  ctx.beginPath(); ctx.moveTo(0,-r*1.3); ctx.lineTo(r*0.8,r*0.3); ctx.lineTo(0,r); ctx.lineTo(-r*0.8,r*0.3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath(); ctx.moveTo(0,-r*0.5); ctx.lineTo(r*0.25,r*0.1); ctx.lineTo(0,r*0.5); ctx.lineTo(-r*0.25,r*0.1); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.globalAlpha = 1; ctx.restore();
}

function drawEnemies() {
  for (const e of state.enemies) {
    if (e.dead) continue;
    const p = worldToScreen(e.x, e.y);
    if (p.x < -50 || p.x > canvas.width+50 || p.y < -50 || p.y > canvas.height+50) continue;
    const r = e.radius, color = e.hitFlash > 0 ? '#ffffff' : e.color;
    const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r*2.5);
    grd.addColorStop(0, rgba(e.color, 0.2)); grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(p.x, p.y, r*2.5, 0, TWO_PI); ctx.fill();
    ctx.save(); ctx.translate(p.x, p.y); ctx.fillStyle = color; ctx.shadowColor = e.color; ctx.shadowBlur = 10;
    switch (e.def.shape) {
      case 'diamond': ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r,0); ctx.lineTo(0,r); ctx.lineTo(-r,0); ctx.closePath(); ctx.fill(); break;
      case 'tri': ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r*0.87,r*0.5); ctx.lineTo(-r*0.87,r*0.5); ctx.closePath(); ctx.fill(); break;
      case 'hex': ctx.beginPath(); for (let i=0;i<6;i++){const a=TWO_PI/6*i-Math.PI/6;ctx[i===0?'moveTo':'lineTo'](Math.cos(a)*r,Math.sin(a)*r);} ctx.closePath(); ctx.fill(); break;
      case 'circle': ctx.beginPath(); ctx.arc(0,0,r,0,TWO_PI); ctx.fill(); break;
      case 'square': ctx.fillRect(-r*0.8,-r*0.8,r*1.6,r*1.6); break;
      case 'shield': ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r,-r*0.3); ctx.lineTo(r,r*0.5); ctx.lineTo(0,r); ctx.lineTo(-r,r*0.5); ctx.lineTo(-r,-r*0.3); ctx.closePath(); ctx.fill(); break;
      case 'boss':
        ctx.beginPath(); for (let i=0;i<8;i++){const a=TWO_PI/8*i+state.time*0.5;const br2=i%2===0?r:r*0.6;ctx[i===0?'moveTo':'lineTo'](Math.cos(a)*br2,Math.sin(a)*br2);} ctx.closePath(); ctx.fill();
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,r*0.25,0,TWO_PI); ctx.fill();
        ctx.fillStyle=e.color; ctx.beginPath(); ctx.arc(0,0,r*0.12,0,TWO_PI); ctx.fill(); break;
      default: ctx.beginPath(); ctx.arc(0,0,r,0,TWO_PI); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.restore();
    if (e.def.isBoss) { const bw=60,bh=5,bx=p.x-bw/2,by=p.y-r-12; ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(bx-1,by-1,bw+2,bh+2); ctx.fillStyle=C.magenta; ctx.fillRect(bx,by,bw*clamp(e.hp/e.maxHp,0,1),bh); }
  }
}

function drawProjectiles() {
  for (const p of state.projectiles) {
    const sp = worldToScreen(p.x, p.y);
    if (sp.x < -20 || sp.x > canvas.width+20 || sp.y < -20 || sp.y > canvas.height+20) continue;
    // Trail
    if (p.trail && p.trail.length > 1) {
      for (let i = 0; i < p.trail.length - 1; i++) {
        const tp = worldToScreen(p.trail[i].x, p.trail[i].y);
        const alpha = (i / p.trail.length) * 0.4;
        ctx.fillStyle = rgba(p.color, alpha);
        ctx.beginPath(); ctx.arc(tp.x, tp.y, p.radius * (i/p.trail.length), 0, TWO_PI); ctx.fill();
      }
    }
    ctx.save(); ctx.shadowColor = p.color; ctx.shadowBlur = 8; ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(sp.x, sp.y, p.radius, 0, TWO_PI); ctx.fill(); ctx.shadowBlur = 0; ctx.restore();
  }
}

function drawGems() {
  for (const g of state.gems) {
    const sp = worldToScreen(g.x, g.y);
    if (sp.x < -20 || sp.x > canvas.width+20 || sp.y < -20 || sp.y > canvas.height+20) continue;
    const pulse = 0.8 + Math.sin(state.time*6+g.x*0.1)*0.2, r = g.radius*pulse;
    const grd = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r*3);
    grd.addColorStop(0, rgba(C.xpGem, 0.3)); grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(sp.x, sp.y, r*3, 0, TWO_PI); ctx.fill();
    ctx.fillStyle = C.xpGem; ctx.shadowColor = C.xpGem; ctx.shadowBlur = 6;
    ctx.beginPath(); ctx.moveTo(sp.x,sp.y-r); ctx.lineTo(sp.x+r,sp.y); ctx.lineTo(sp.x,sp.y+r); ctx.lineTo(sp.x-r,sp.y); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
  }
}

function drawOrbitShards() {
  const wep = state.weapons.find(w => w.defId === 'orbit_shards'); if (!wep) return;
  const s = getWeaponStats(wep);
  for (let i = 0; i < s.count; i++) {
    const a = state.time*s.speed+(TWO_PI/s.count)*i;
    const sp = worldToScreen(state.px+Math.cos(a)*s.radius, state.py+Math.sin(a)*s.radius);
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(a*2);
    const color = wep.awakenedColor || C.violet;
    ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(0,-s.size); ctx.lineTo(s.size*0.6,0); ctx.lineTo(0,s.size); ctx.lineTo(-s.size*0.6,0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
  }
}

function drawShadowClones() {
  const wep = state.weapons.find(w => w.defId === 'shadow_clones'); if (!wep) return;
  const s = getWeaponStats(wep);
  for (let i = 0; i < s.count; i++) {
    const a = state.time*1.5+(TWO_PI/s.count)*i;
    const sp = worldToScreen(state.px+Math.cos(a)*s.orbitR, state.py+Math.sin(a)*s.orbitR);
    ctx.save(); ctx.translate(sp.x, sp.y); ctx.rotate(a+Math.PI/2);
    const color = wep.awakenedColor || rgba(C.ice, 0.6);
    ctx.fillStyle = color; ctx.shadowColor = wep.awakenedColor || C.ice; ctx.shadowBlur = 8;
    const r = 8;
    ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r*0.6,r*0.3); ctx.lineTo(0,r*0.7); ctx.lineTo(-r*0.6,r*0.3); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.restore();
  }
}

function drawEffects() {
  for (const fx of state.effects) {
    const sp = worldToScreen(fx.x, fx.y);
    switch (fx.type) {
      case 'nova': { const alpha = clamp(fx.life/fx.maxLife,0,1); ctx.strokeStyle = rgba(fx.color, alpha*0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sp.x,sp.y,fx.radius,0,TWO_PI); ctx.stroke(); ctx.fillStyle = rgba(fx.color, alpha*0.1); ctx.fill(); break; }
      case 'frost_ring': { const alpha = clamp(fx.life/fx.maxLife,0,1); ctx.strokeStyle = rgba(fx.color,alpha*0.6); ctx.lineWidth = 4; ctx.setLineDash([8,6]); ctx.beginPath(); ctx.arc(sp.x,sp.y,fx.radius,0,TWO_PI); ctx.stroke(); ctx.setLineDash([]); break; }
      case 'mine': { if (fx.exploded) break; const armed = fx.armTime <= 0; const pulse = armed ? 0.6+Math.sin(state.time*12)*0.4 : 0.3; ctx.fillStyle = rgba(fx.color,pulse); ctx.beginPath(); ctx.arc(sp.x,sp.y,6,0,TWO_PI); ctx.fill(); if (armed) { ctx.strokeStyle = rgba(fx.color,0.4); ctx.lineWidth = 1; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.arc(sp.x,sp.y,fx.blastR*0.5,0,TWO_PI); ctx.stroke(); ctx.setLineDash([]); } break; }
      case 'gravity_well': { const alpha = clamp(fx.life/fx.maxLife,0,1); ctx.save(); ctx.translate(sp.x,sp.y); ctx.strokeStyle = rgba(fx.color,alpha*0.4); ctx.lineWidth = 1.5; for (let i=0;i<3;i++){ctx.beginPath(); for (let t=0;t<20;t++){const ang=t*0.3+state.time*3+i*TWO_PI/3;const r=(t/20)*fx.radius;const x=Math.cos(ang)*r,y=Math.sin(ang)*r;t===0?ctx.moveTo(x,y):ctx.lineTo(x,y);} ctx.stroke();} ctx.restore(); break; }
      case 'meteor_warning': { const alpha = clamp(fx.life/fx.maxLife,0,1); const pulse = 0.3+Math.sin(state.time*15)*0.2; ctx.strokeStyle = rgba(fx.color,pulse+alpha*0.3); ctx.lineWidth = 2; ctx.setLineDash([6,4]); ctx.beginPath(); ctx.arc(sp.x,sp.y,fx.radius,0,TWO_PI); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = rgba(fx.color,0.05+alpha*0.05); ctx.fill(); break; }
      case 'whip_arc': { const alpha = clamp(fx.life/fx.maxLife,0,1); ctx.save(); ctx.translate(sp.x,sp.y); ctx.fillStyle = rgba(fx.color,alpha*0.3); ctx.beginPath(); ctx.arc(0,0,fx.range,fx.dir-fx.arc/2,fx.dir+fx.arc/2); ctx.lineTo(0,0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = rgba(fx.color,alpha*0.6); ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); break; }
    }
  }
  // Beams
  for (const b of state.beams) {
    const s1 = worldToScreen(b.x1,b.y1), s2 = worldToScreen(b.x2,b.y2);
    const alpha = clamp(b.life/b.maxLife,0,1);
    ctx.save(); ctx.strokeStyle = rgba(b.color,alpha); ctx.lineWidth = b.width*2; ctx.shadowColor = b.color; ctx.shadowBlur = 20;
    ctx.beginPath(); ctx.moveTo(s1.x,s1.y); ctx.lineTo(s2.x,s2.y); ctx.stroke();
    ctx.strokeStyle = rgba('#ffffff',alpha*0.6); ctx.lineWidth = b.width*0.5;
    ctx.beginPath(); ctx.moveTo(s1.x,s1.y); ctx.lineTo(s2.x,s2.y); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();
  }
  // Lightning
  for (const lf of state.lightningFx) {
    const alpha = clamp(lf.life/lf.maxLife,0,1); ctx.strokeStyle = rgba(C.cyan,alpha); ctx.lineWidth = 2.5; ctx.shadowColor = C.cyan; ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i=0;i<lf.chain.length;i++){const sp=worldToScreen(lf.chain[i].x,lf.chain[i].y);if(i===0)ctx.moveTo(sp.x,sp.y);else{const prev=worldToScreen(lf.chain[i-1].x,lf.chain[i-1].y);ctx.lineTo((prev.x+sp.x)/2+(Math.random()-0.5)*20,(prev.y+sp.y)/2+(Math.random()-0.5)*20);ctx.lineTo(sp.x,sp.y);}}
    ctx.stroke(); ctx.shadowBlur = 0;
  }
}

function drawParticles() {
  for (const p of state.particles) {
    const sp = worldToScreen(p.x, p.y);
    if (sp.x < -10 || sp.x > canvas.width+10 || sp.y < -10 || sp.y > canvas.height+10) continue;
    const alpha = clamp(p.life/p.maxLife,0,1);
    ctx.fillStyle = rgba(p.color, alpha*0.8);
    ctx.beginPath(); ctx.arc(sp.x, sp.y, p.radius*alpha, 0, TWO_PI); ctx.fill();
  }
}

function drawDamageNums() {
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const dn of state.damageNums) {
    const sp = worldToScreen(dn.x, dn.y);
    const alpha = clamp(dn.life/dn.maxLife,0,1);
    ctx.font = dn.crit ? 'bold 16px Orbitron, monospace' : '13px Rajdhani, sans-serif';
    ctx.fillStyle = dn.crit ? rgba('#ffc845',alpha) : rgba('#ffffff',alpha*0.9);
    if (dn.crit) { ctx.shadowColor = '#ffc845'; ctx.shadowBlur = 8; }
    ctx.fillText(dn.dmg, sp.x, sp.y); ctx.shadowBlur = 0;
  }
}

function drawMinimap() {
  const mw = minimapCanvas.width, mh = minimapCanvas.height;
  const scale = mw / (ARENA_HALF * 2);
  // Clear previous frame completely
  minimapCtx.clearRect(0, 0, mw, mh);
  minimapCtx.fillStyle = 'rgba(3,6,9,0.85)';
  minimapCtx.fillRect(0, 0, mw, mh);
  // Arena border
  minimapCtx.strokeStyle = rgba(C.magenta, 0.3); minimapCtx.lineWidth = 1; minimapCtx.strokeRect(0, 0, mw, mh);
  // XP gems (subtle green dots)
  minimapCtx.fillStyle = rgba(C.lime, 0.3);
  for (const g of state.gems) {
    const gx = (g.x + ARENA_HALF) * scale, gy = (g.y + ARENA_HALF) * scale;
    minimapCtx.fillRect(gx, gy, 1, 1);
  }
  // Enemies
  for (const e of state.enemies) {
    if (e.dead) continue;
    const mx = (e.x + ARENA_HALF) * scale, my = (e.y + ARENA_HALF) * scale;
    if (e.def.isBoss) {
      // Pulsing boss dot
      const pulse = 2 + Math.sin(state.time * 4) * 1;
      minimapCtx.fillStyle = C.magenta;
      minimapCtx.beginPath(); minimapCtx.arc(mx, my, pulse, 0, TWO_PI); minimapCtx.fill();
    } else {
      minimapCtx.fillStyle = rgba(e.color, 0.6);
      minimapCtx.fillRect(mx - 1, my - 1, 2, 2);
    }
  }
  // Player
  minimapCtx.fillStyle = window.VoidClasses ? VoidClasses.getPlayerColor(state) : C.cyan;
  minimapCtx.beginPath(); minimapCtx.arc((state.px + ARENA_HALF) * scale, (state.py + ARENA_HALF) * scale, 3, 0, TWO_PI); minimapCtx.fill();

  // v2.0 systems
  if (window.VoidWorld) VoidWorld.renderMinimap(minimapCtx, state, scale, mw, mh);
  if (window.VoidEvents) VoidEvents.renderMinimap(minimapCtx, state, scale, mw, mh);

  // Camera viewport box
  const vw = canvas.width * scale, vh = canvas.height * scale;
  const px = (state.px + ARENA_HALF) * scale, py = (state.py + ARENA_HALF) * scale;
  minimapCtx.strokeStyle = rgba(C.cyan, 0.25); minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(px - vw/2, py - vh/2, vw, vh);
}

function drawPausedOverlay() {
  ctx.fillStyle = 'rgba(2,4,10,0.55)'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = rgba(C.cyan, 0.9); ctx.font = 'bold 36px Orbitron, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', canvas.width/2, canvas.height/2);
  ctx.font = '14px Rajdhani, sans-serif'; ctx.fillStyle = rgba(C.white, 0.5);
  ctx.fillText('Press P to resume', canvas.width/2, canvas.height/2+40);
}

function render() {
  if (!state) return;
  drawBackground(); drawGrid(); drawArenaBorder();
  // v2.0: Draw world objects (below entities)
  if (window.VoidWorld) VoidWorld.render(ctx, state, worldToScreen);
  drawGems(); drawEffects(); drawOrbitShards(); drawShadowClones();
  drawProjectiles(); drawPlayerTrail(); drawEnemies(); drawPlayer();
  // v2.0: Draw event visuals (above entities)
  if (window.VoidEvents) VoidEvents.render(ctx, state, worldToScreen);
  drawParticles(); drawDamageNums();
  if (state.mode === 'paused') drawPausedOverlay();
  if (state.mode !== 'menu') drawMinimap();
}

// ═══════════════════════════════════════════
// GAME LOOP
// ═══════════════════════════════════════════
function update(dt) {
  if (state.mode !== 'playing') return;
  state.time += dt;
  updatePlayer(dt); updateCamera(dt); updateWeapons(dt); updateOrbitShards(dt); updateShadowClones(dt);
  updateProjectiles(dt); updateEnemies(dt); updateGems(dt); updateEffects(dt); updateParticles(dt);
  updateChests(dt); updateHazardZones(dt);
  if (window.VoidDirector) VoidDirector.update(state, dt, { spawnEnemy, showWaveAnnounce, spawnChest });
  updateCombo(dt); syncHUD();
  // v2.0: Update new systems
  if (window.VoidEvents) VoidEvents.update(state, dt);
  if (window.VoidWorld) VoidWorld.update(state, dt);
  if (state.watchtowerReveal > 0) state.watchtowerReveal -= dt;
  // Update ambient particles
  for (const ap of ambientParticles) { ap.x += ap.vx * dt; ap.y += ap.vy * dt; if (ap.x < -ARENA_HALF) ap.x = ARENA_HALF; if (ap.x > ARENA_HALF) ap.x = -ARENA_HALF; if (ap.y < -ARENA_HALF) ap.y = ARENA_HALF; if (ap.y > ARENA_HALF) ap.y = -ARENA_HALF; }
}

function frame(time) {
  const dt = Math.min(0.05, (time - lastTime) / 1000 || 1/60); lastTime = time; resize();
  if (state) {
    if (state.mode === 'playing' || state.mode === 'paused') { update(dt); render(); }
    else if (state.mode === 'levelup' || state.mode === 'class_select' || state.mode === 'npc_choice') { updateCamera(dt); render(); }
    else if (state.mode === 'lore' || state.mode === 'lore_choice') { updateCamera(dt); render(); if (window.VoidLore) VoidLore.update(state, dt); }
    else if (state.mode === 'gameover') { updateCamera(dt); updateParticles(dt); render(); }
    else if (state.mode === 'menu') { state.time += dt; render(); }
  }
  requestAnimationFrame(frame);
}

// ═══════════════════════════════════════════
// EVENT LISTENERS & INIT
// ═══════════════════════════════════════════
startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', showMenu);
muteBtn.addEventListener('click', () => { 
  soundMuted = !soundMuted; 
  muteBtn.textContent = soundMuted ? '🔇' : '🔊'; 
  const bgm = document.getElementById('bgm');
  if (bgm) { if (soundMuted) bgm.pause(); else if (state && state.mode !== 'menu') bgm.play().catch(()=>{}); }
});

// v2.0: Lore modal click-to-advance
const loreModal = document.getElementById('lore-modal');
if (loreModal) {
  loreModal.addEventListener('click', (e) => {
    if (e.target.closest('.lore-choice-btn')) return; // Don't advance on choice clicks
    if (state && (state.mode === 'lore') && window.VoidLore) VoidLore.advance(state);
  });
}

state = newState(); resize(); showMenu(); initAmbientParticles(); requestAnimationFrame(frame);
