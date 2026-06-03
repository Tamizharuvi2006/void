/* ═══════════════════════════════════════════════════════════════
   VOID DIRECTOR — Centralized Game Brain
   Manages Wave Progression, Events, Boss Spawns, and Lore Triggers
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // Constants
  const WAVE_DURATION_BASE = 30; // Seconds per regular wave

  function getDefaultState() {
    return {
      wave: 0,
      waveTimer: 0,
      spawnTimer: 0,
      waveEnemiesQueue: [],
      waveClearBreather: 0,
      nextMinorEventTimer: 75, // Seconds until first random minor event
      portalChallengeActive: false,
    };
  }

  function getWaveEnemies(wave) {
    const arr = [];
    const points = wave * 12 + 10;
    let spent = 0;
    while (spent < points) {
      if (wave >= 8 && Math.random() < 0.1) { arr.push('knight'); spent += 8; }
      else if (wave >= 5 && Math.random() < 0.15) { arr.push('shade'); spent += 6; }
      else if (wave >= 3 && Math.random() < 0.2) { arr.push('archer'); spent += 5; }
      else if (wave >= 2 && Math.random() < 0.3) { arr.push('specter'); spent += 2; }
      else if (Math.random() < 0.4) { arr.push('crawler'); spent += 1; }
      else { arr.push('wraith'); spent += 3; }
    }
    return arr;
  }

  function startNextWave(state, mainCallbacks) {
    state.wave++;
    state.waveEnemiesQueue = getWaveEnemies(state.wave);
    state.waveTimer = WAVE_DURATION_BASE + state.wave * 1.5;
    state.spawnTimer = 0;
    
    if (mainCallbacks && mainCallbacks.showWaveAnnounce) {
      mainCallbacks.showWaveAnnounce(state.wave);
    }

    // Major Milestone Events
    if (state.wave === 5) {
      // The First Rift Lord
      state.waveEnemiesQueue = ['boss', 'shade', 'shade', 'archer', 'archer'];
      state.waveTimer = 90; // Longer timer for boss
    } else if (state.wave === 10) {
      // Elite Hunt
      if (window.VoidEvents) window.VoidEvents.startEvent(state, 'elite_hunt');
      state.waveEnemiesQueue = ['knight', 'knight', 'knight']; // Minimal adds, focus elite
      state.waveTimer = 60;
    } else if (state.wave === 15) {
      // Portal Room Challenge
      if (window.VoidEvents) window.VoidEvents.startEvent(state, 'void_portal');
      state.waveEnemiesQueue = getWaveEnemies(state.wave); // Normal wave, portal is optional
    }

    // Lore Triggers (Handled by lore.js mapping)
    if (window.VoidLore) {
      const trigger = VoidLore.checkTriggers(state);
      if (trigger) {
        setTimeout(() => VoidLore.startLore(state, trigger), 1500);
      }
    }
    
    // Check save data
    if (typeof checkAchievements === 'function') checkAchievements();
  }

  function update(state, dt, mainCallbacks) {
    if (state.mode !== 'playing') return;

    // Portal Challenge Room Isolation Check
    if (state.portalChallengeActive) {
      // The player is inside the challenge room, standard wave timers pause
      return; 
    }

    // Spawn queue
    if (state.waveEnemiesQueue.length > 0) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        const batchSize = Math.min(3 + Math.floor(state.wave * 0.1), state.waveEnemiesQueue.length);
        for (let i = 0; i < batchSize; i++) {
          if (mainCallbacks.spawnEnemy) mainCallbacks.spawnEnemy(state.waveEnemiesQueue.pop());
        }
        state.spawnTimer = Math.max(0.15, 1.5 - state.wave * 0.08);
      }
    }

    // Minor Event Scheduler (60-90s rule)
    if (state.wave > 5) {
      state.nextMinorEventTimer -= dt;
      if (state.nextMinorEventTimer <= 0) {
        triggerRandomMinorEvent(state);
        state.nextMinorEventTimer = 60 + Math.random() * 30; // Every 60-90s
      }
    }

    state.waveTimer -= dt;

    // Brief breathing period between waves
    if (state.waveClearBreather > 0) {
      state.waveClearBreather -= dt;
      return;
    }

    // Wave Completion Logic
    if (state.waveTimer <= 0 && state.waveEnemiesQueue.length === 0) {
      // Spawn treasure chest on boss wave clears
      if (state.wave > 0 && state.wave % 5 === 0) {
        if (mainCallbacks.spawnChest) mainCallbacks.spawnChest(state.px + (Math.random()*200-100), state.py + (Math.random()*200-100), 'boss');
      }
      state.waveClearBreather = 3.0; // 3 second pause
      setTimeout(() => startNextWave(state, mainCallbacks), 3000);
    }
  }

  function triggerRandomMinorEvent(state) {
    const rand = Math.random();
    if (state.wave > 10 && rand < 0.3) {
      // Spawn Lost Wanderer randomly after wave 10
      spawnDynamicWanderer(state);
    } else if (window.VoidEvents) {
      // Random event from events.js (e.g. Void Crystal, Relic Defense)
      const minorEvents = ['void_crystal', 'corruption_storm', 'relic_defense'];
      const chosen = minorEvents[Math.floor(Math.random() * minorEvents.length)];
      VoidEvents.startEvent(state, chosen);
    }
  }

  function spawnDynamicWanderer(state) {
    if (!window.VoidWorld) return;
    // Spawn lost wanderer near player but out of screen
    const angle = Math.random() * Math.PI * 2;
    const dist = 600 + Math.random() * 400;
    const wx = state.px + Math.cos(angle) * dist;
    const wy = state.py + Math.sin(angle) * dist;
    
    state.worldObjects.push({
      id: `wanderer_random_${state.wave}`,
      type: 'wanderer',
      def: VoidWorld.WORLD_DEFS['wanderer'],
      x: wx, y: wy,
      used: false,
      interactProgress: 0,
      pulse: Math.random() * 6.28,
    });
    
    // Announce
    const container = document.getElementById('achievement-container');
    if (container) {
      const el = document.createElement('div');
      el.className = 'achievement-toast';
      el.style.borderLeftColor = '#ffc845';
      el.innerHTML = `<span class="achieve-icon">👤</span><div class="achieve-info"><span class="achieve-name">A Presence...</span><span class="achieve-reward">The Lost Wanderer has appeared nearby.</span></div>`;
      container.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }
  }

  // ─── Public API ───
  window.VoidDirector = {
    getDefaultState,
    startNextWave,
    update,
  };
})();
