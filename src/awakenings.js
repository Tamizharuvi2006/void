/* ═══════════════════════════════════════════════════════════════
   VOID AWAKENINGS — Weapon Transformation System (Build Crafting)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Weapon Awakening Names & Colors ───
  // Format: [WeaponID]: { [ClassID]: { name, color, desc } }
  const AWAKENING_DATA = {
    void_bolt: {
      ruin:      { name: 'Blood Lance',      color: '#ff2d55', desc: 'Infinite pierce & bleeding trail' },
      eternity:  { name: 'Guardian Sigil',   color: '#00f0ff', desc: 'Slower, grants shields on hit' },
      knowledge: { name: 'Arcane Fragment',  color: '#b44dff', desc: 'Splits into 3 smaller bolts' },
      shadows:   { name: 'Shadow Fang',      color: '#a8ff44', desc: 'Teleports & 3x Backstab damage' },
    },
    orbit_shards: {
      ruin:      { name: 'Burning Blades',   color: '#ff2d55', desc: 'Shatters into fire on impact' },
      eternity:  { name: 'Shield Orbs',      color: '#00f0ff', desc: 'Absorbs hits, restores HP' },
      knowledge: { name: 'Mind Shards',      color: '#b44dff', desc: 'Massive orbit radius & counts' },
      shadows:   { name: 'Phantom Orbs',     color: '#a8ff44', desc: 'Invisible until they strike' },
    },
    nova_pulse: {
      ruin:      { name: 'Hell Pulse',       color: '#ff2d55', desc: 'Leaves a burning zone' },
      eternity:  { name: 'Healing Pulse',    color: '#00f0ff', desc: 'Heals you for 2% per hit' },
      knowledge: { name: 'Echo Pulse',       color: '#b44dff', desc: 'Pulses 3 times rapidly' },
      shadows:   { name: 'Void Collapse',    color: '#a8ff44', desc: 'Implodes, sucking enemies in' },
    },
    frost_ring: {
      ruin:      { name: 'Flash Freeze',     color: '#ff2d55', desc: 'Shatters frozen enemies' },
      eternity:  { name: 'Glacial Armor',    color: '#00f0ff', desc: 'Grants massive armor inside' },
      knowledge: { name: 'Time Stop',        color: '#b44dff', desc: '100% slow (complete halt)' },
      shadows:   { name: 'Black Ice',        color: '#a8ff44', desc: 'Enemies take double damage' },
    },
    lightning_chain: {
      ruin:      { name: 'Hell Lightning',   color: '#ff2d55', desc: 'Leaves fire on bounced targets' },
      eternity:  { name: 'Holy Chain',       color: '#00f0ff', desc: 'Bounces to you to heal' },
      knowledge: { name: 'Infinite Chain',   color: '#b44dff', desc: 'Bounces 5x more times' },
      shadows:   { name: 'Dark Spark',       color: '#a8ff44', desc: 'Instant kill on low HP' },
    },
    phantom_mines: {
      ruin:      { name: 'Nuke Charges',     color: '#ff2d55', desc: 'Massive blast radius & damage' },
      eternity:  { name: 'Defensive Totems', color: '#00f0ff', desc: 'Taunts enemies before blasting' },
      knowledge: { name: 'Cluster Mines',    color: '#b44dff', desc: 'Splits into 4 micro-mines' },
      shadows:   { name: 'Shadow Traps',     color: '#a8ff44', desc: 'Triggers only on elites/bosses' },
    },
    death_blossom: {
      ruin:      { name: 'Blood Blossom',    color: '#ff2d55', desc: 'Projectiles return to you' },
      eternity:  { name: 'Aegis Blossom',    color: '#00f0ff', desc: 'Destroys enemy projectiles' },
      knowledge: { name: 'Lotus of Mind',    color: '#b44dff', desc: 'Fires 3x as many daggers' },
      shadows:   { name: 'Phantom Daggers',  color: '#a8ff44', desc: 'Invisible, massive backstab' },
    },
    gravity_well: {
      ruin:      { name: 'Black Hole',       color: '#ff2d55', desc: 'Crushes enemies instantly' },
      eternity:  { name: 'Sanctuary Well',   color: '#00f0ff', desc: 'Pushes enemies away instead' },
      knowledge: { name: 'Time Distortion',  color: '#b44dff', desc: 'Lasts 3x longer, huge area' },
      shadows:   { name: 'Void Tear',        color: '#a8ff44', desc: 'Teleports you to its center' },
    },
    plasma_beam: {
      ruin:      { name: 'Hell Beam',        color: '#ff2d55', desc: 'Leaves a wall of fire' },
      eternity:  { name: 'Holy Ray',         color: '#00f0ff', desc: 'Shields you while firing' },
      knowledge: { name: 'Prism Beam',       color: '#b44dff', desc: 'Splits into 3 beams' },
      shadows:   { name: 'Dark Laser',       color: '#a8ff44', desc: 'Fires instantly from shadows' },
    },
    meteor_strike: {
      ruin:      { name: 'Infernal Meteor',  color: '#ff2d55', desc: 'Leaves a permanent fire zone' },
      eternity:  { name: 'Celestial Drop',   color: '#00f0ff', desc: 'Drops healing orbs on hit' },
      knowledge: { name: 'Time Meteor',      color: '#b44dff', desc: 'Drops 5 meteors in a row' },
      shadows:   { name: 'Eclipse Strike',   color: '#a8ff44', desc: 'Blinds and assassinates' },
    },
    spectral_whip: {
      ruin:      { name: 'Blood Whip',       color: '#ff2d55', desc: 'Heals you for damage dealt' },
      eternity:  { name: 'Guardian Chain',   color: '#00f0ff', desc: 'Stuns enemies in the arc' },
      knowledge: { name: 'Arcane Slash',     color: '#b44dff', desc: 'Hits 360 degrees around you' },
      shadows:   { name: 'Shadow Slash',     color: '#a8ff44', desc: 'Massive damage from behind' },
    },
    shadow_clones: {
      ruin:      { name: 'Blood Clones',     color: '#ff2d55', desc: 'Clones explode on death' },
      eternity:  { name: 'Guardian Spirits', color: '#00f0ff', desc: 'Clones absorb damage for you' },
      knowledge: { name: 'Mirror Images',    color: '#b44dff', desc: 'Double the number of clones' },
      shadows:   { name: 'Assassin Clones',  color: '#a8ff44', desc: 'Clones teleport to assassinate' },
    },
  };

  // ─── State ───
  function getDefaultState() {
    return {
      awakeningsDone: 0,      // Number of weapons awakened so far (max 3 at waves 10,20,30)
      awakeningPending: false, // Flag to show modal
    };
  }

  // ─── Show Awakening Selection Modal ───
  function showModal(state) {
    if (!state.chosenClass) return; // Cannot awaken without a class

    // Can only awaken weapons that are NOT already awakened
    const eligibleWeapons = state.weapons.filter(w => !w.awakenedClass);

    // If no eligible weapons, just skip
    if (eligibleWeapons.length === 0) {
      state.mode = 'playing';
      return;
    }

    state.mode = 'awakening_select';
    state.awakeningPending = true;

    const modal = document.getElementById('awakening-modal');
    const cardsEl = document.getElementById('awakening-cards');
    if (!modal || !cardsEl) { state.mode = 'playing'; return; }

    modal.classList.remove('hidden');
    cardsEl.innerHTML = '';

    // Create a card for each eligible weapon
    for (const wep of eligibleWeapons) {
      const db = AWAKENING_DATA[wep.defId];
      if (!db) continue;
      
      const classId = state.chosenClass;
      // Handle secret class by defaulting to knowledge/ruin themes if missing
      const awakenData = db[classId] || db['ruin']; 

      const card = document.createElement('div');
      card.className = 'awakening-card';
      card.style.borderColor = awakenData.color;
      
      card.innerHTML = `
        <div class="awk-old">
          <span class="awk-icon">${wep.def.icon}</span>
          <span class="awk-name">${wep.def.name}</span>
        </div>
        <div class="awk-arrow" style="color:${awakenData.color}">▼</div>
        <div class="awk-new" style="color:${awakenData.color}">
          <span class="awk-new-name">${awakenData.name}</span>
          <span class="awk-desc">${awakenData.desc}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        applyAwakening(state, wep, classId, awakenData);
        modal.classList.add('hidden');
      });

      cardsEl.appendChild(card);
    }
  }

  // ─── Apply the Awakening ───
  function applyAwakening(state, wep, classId, awakenData) {
    wep.awakenedClass = classId;
    wep.awakenedName = awakenData.name;
    wep.awakenedColor = awakenData.color;

    state.awakeningsDone++;
    state.awakeningPending = false;
    state.mode = 'playing';

    // Cinematic Flash
    if (typeof playSound === 'function') playSound('levelup'); // Need a grander sound?
    const flashEl = document.getElementById('screen-flash');
    if (flashEl) {
      flashEl.style.background = awakenData.color;
      flashEl.classList.add('active');
      setTimeout(() => flashEl.classList.remove('active'), 400);
    }

    // Force weapon bar sync
    if (typeof syncHUD === 'function') syncHUD();
    if (typeof syncWeaponBar === 'function') syncWeaponBar();
  }

  // ─── Apply Systemic Modifiers to Projectiles/Effects ───
  // Called by main.js fire functions
  function modifyProjectile(state, wep, proj) {
    if (!wep.awakenedClass) return proj;
    
    proj.color = wep.awakenedColor || proj.color;
    proj.isAwakened = true;
    proj.awakenedClass = wep.awakenedClass;

    switch (wep.awakenedClass) {
      case 'ruin':
        proj.pierce = 999; // Infinite pierce
        proj.dmg = Math.round(proj.dmg * 1.5); // 50% more damage
        proj.leavesFireTrail = true;
        break;
      case 'eternity':
        if (proj.vx !== undefined && proj.vy !== undefined) {
          proj.vx *= 0.6; proj.vy *= 0.6;
        } else if (proj.speed !== undefined) {
          proj.speed *= 0.6;
        }
        proj.life *= 1.5; // Lasts longer
        proj.healsPlayer = true; // Handled in dealDamage
        break;
      case 'knowledge':
        // Splitting logic handled in the fire function if possible, 
        // or we just increase projectile count dynamically in updateWeapons
        break;
      case 'shadows':
        // Teleport behavior
        proj.teleports = true; // Instantly moves to nearest enemy
        proj.backstab = true; // Multiplier applied in dealDamage
        break;
      case 'sovereign':
        proj.pierce += 2;
        proj.dmg = Math.round(proj.dmg * 2.0);
        break;
    }
    return proj;
  }

  // ─── Public API ───
  window.VoidAwakenings = {
    getDefaultState,
    showModal,
    applyAwakening,
    modifyProjectile,
    AWAKENING_DATA,
  };
})();
