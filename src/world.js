/* ═══════════════════════════════════════════════════════════════
   VOID WORLD — Shrines, NPCs, Crystal Nodes, Ruins, Towers
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const _dist = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); };
  const _rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const _clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const TWO_PI = Math.PI * 2;
  const ARENA_HALF = 2400;
  const INTERACT_RADIUS = 40;

  // ─── World Object Definitions ───
  const WORLD_DEFS = {
    shrine: {
      name: 'Void Shrine',
      icon: '🏛️',
      color: '#b44dff',
      radius: 20,
      interactTime: 0, // instant
      blessings: [
        { name: 'Blessing of Power', desc: '+15% Damage', apply: s => { s.dmgMult += 0.15; } },
        { name: 'Blessing of Vitality', desc: 'Heal 30 HP', apply: s => { s.hp = Math.min(s.hp + 30, s.maxHp); } },
        { name: 'Blessing of Haste', desc: '+10% Speed', apply: s => { s.speedMult += 0.10; } },
        { name: 'Curse of Greed', desc: '+50 Dust but -10 HP', apply: s => { s.dustEarned += 50; s.hp = Math.max(1, s.hp - 10); } },
      ],
    },
    wanderer: {
      name: 'Lost Wanderer',
      icon: '👤',
      color: '#ffc845',
      radius: 16,
      interactTime: 0,
      dialogue: [
        'I have wandered the Void for centuries.',
        'Take this... it is all I have left.',
      ],
      gifts: [
        { name: 'Ancient Blade', icon: '⚔️', effect: { dmgMult: 0.12 } },
        { name: 'Swift Boots', icon: '👟', effect: { speedMult: 0.10 } },
        { name: 'Void Heart', icon: '💜', effect: { maxHp: 25, hp: 25 } },
      ],
    },
    crystal_node: {
      name: 'Crystal Node',
      icon: '💎',
      color: '#00f0ff',
      radius: 14,
      interactTime: 3.0, // hold for 3s to mine
    },
    ruins: {
      name: 'Ancient Ruins',
      icon: '🏚️',
      color: '#7df3ff',
      radius: 22,
      interactTime: 1.5,
    },
    watchtower: {
      name: 'Watchtower',
      icon: '🗼',
      color: '#a8ff44',
      radius: 18,
      interactTime: 5.0, // stand near 5s to reveal map
    },
  };

  // ─── State ───
  function getDefaultState() {
    return {
      worldObjects: [],
      worldInteracting: null,  // ID of object being interacted with
      worldInteractTimer: 0,
      worldDialogue: null,     // Active NPC dialogue
      worldChoice: null,       // Active NPC choice
      discoveredRegions: new Set(),
    };
  }

  // ─── Spawn World Objects ───
  function generateInitialWorld(state) {
    state.worldObjects = [];
    if (!state.discoveredRegions) state.discoveredRegions = new Set();

    // North (Ruins & Crystals)
    for (let i = 0; i < 5; i++) _spawnObjectInRegion(state, 'ruins', 'north');
    for (let i = 0; i < 20; i++) _spawnObjectInRegion(state, 'crystal_node', 'north');
    
    // East (Watchtowers)
    for (let i = 0; i < 5; i++) _spawnObjectInRegion(state, 'watchtower', 'east');
    
    // West (Shrines)
    for (let i = 0; i < 10; i++) _spawnObjectInRegion(state, 'shrine', 'west');
    
    // Center (Chests)
    for (let i = 0; i < 8; i++) _spawnObjectInRegion(state, 'chest', 'center');
    
    // South Hazard Zones are handled in main loop (updateHazardZones) but we can let them spawn naturally
  }

  function _spawnObjectInRegion(state, type, region) {
    let minX, maxX, minY, maxY;
    switch(region) {
      case 'north': minX = -1500; maxX = 1500; minY = -2400; maxY = -600; break;
      case 'south': minX = -1500; maxX = 1500; minY = 600; maxY = 2400; break;
      case 'east': minX = 600; maxX = 2400; minY = -1500; maxY = 1500; break;
      case 'west': minX = -2400; maxX = -600; minY = -1500; maxY = 1500; break;
      case 'center': minX = -800; maxX = 800; minY = -800; maxY = 800; break;
      default: minX = -2000; maxX = 2000; minY = -2000; maxY = 2000; break;
    }
    
    let x, y, attempts = 0;
    do {
      x = _rand(minX, maxX);
      y = _rand(minY, maxY);
      attempts++;
    } while (attempts < 20 && _dist(x, y, state.px, state.py) < 400);

    // If type is chest, just push to chests array if it exists
    if (type === 'chest') {
      if (typeof spawnChest === 'function') spawnChest(x, y, 'normal');
      return;
    }

    const def = WORLD_DEFS[type];
    state.worldObjects.push({
      id: `${type}_${Math.random().toString(36).substr(2,9)}`,
      type,
      def,
      x, y,
      region,
      used: false,
      interactProgress: 0,
      pulse: _rand(0, TWO_PI),
    });
  }

  // ─── Update ───
  function update(state, dt) {
    if (!state || state.mode !== 'playing') return;

    for (const obj of state.worldObjects) {
      if (obj.used) continue;
      obj.pulse += dt;

      const playerDist = _dist(state.px, state.py, obj.x, obj.y);

      // Discovery Check
      if (playerDist < 300 && !state.discoveredRegions.has(obj.id)) {
        state.discoveredRegions.add(obj.id);
        state.xp += 50; 
        if (state.xp >= state.xpToNext && typeof showLevelUpUI === 'function') {
          // just grant the xp safely
        }
        _showWorldToast('🗺️', 'Area Discovered!', obj.def.name, '#ffffff');
        if (typeof playSound === 'function') playSound('achieve');
      }

      // Show interaction prompt when near
      if (playerDist < INTERACT_RADIUS + obj.def.radius) {
        // Timed interactions (crystal node, watchtower, ruins)
        if (obj.def.interactTime > 0) {
          obj.interactProgress += dt;
          if (obj.interactProgress >= obj.def.interactTime) {
            _activateObject(state, obj);
          }
        } else {
          // Instant interaction on proximity
          _activateObject(state, obj);
        }
      } else {
        // Reset progress if player walks away
        obj.interactProgress = 0;
      }
    }
  }

  // ─── Activate a World Object ───
  function _activateObject(state, obj) {
    if (obj.used) return;
    obj.used = true;

    if (typeof playSound === 'function') playSound('pickup');

    switch (obj.type) {
      case 'shrine': {
        const blessing = _pick(obj.def.blessings);
        blessing.apply(state);
        _showWorldToast(obj.def.icon, blessing.name, blessing.desc, obj.def.color);
        if (typeof spawnParticles === 'function') spawnParticles(obj.x, obj.y, obj.def.color, 16, 100);
        break;
      }

      case 'wanderer': {
        // Show NPC dialogue then gift choice
        const gifts = obj.def.gifts;
        _showNPCChoice(state, obj, gifts);
        break;
      }

      case 'crystal_node': {
        // Burst of XP gems
        const gemCount = 6 + Math.floor(state.wave * 0.5);
        for (let i = 0; i < gemCount; i++) {
          state.gems.push({
            x: obj.x + _rand(-25, 25), y: obj.y + _rand(-25, 25),
            xp: 4 + Math.floor(state.wave * 0.3), radius: 6, life: 20,
          });
        }
        _showWorldToast(obj.def.icon, 'Crystal Mined!', `+${gemCount} XP Gems`, obj.def.color);
        if (typeof spawnParticles === 'function') spawnParticles(obj.x, obj.y, obj.def.color, 20, 120);
        break;
      }

      case 'ruins': {
        // Random: chest or trap
        if (Math.random() < 0.6) {
          // Chest
          if (typeof spawnChest === 'function') spawnChest(obj.x, obj.y, 'boss');
          _showWorldToast(obj.def.icon, 'Hidden Treasure!', 'A chest was found!', '#ffc845');
        } else {
          // Trap: enemies burst
          for (let i = 0; i < 5; i++) {
            if (typeof spawnEnemy === 'function') spawnEnemy('shade');
          }
          _showWorldToast(obj.def.icon, 'Trap!', 'Enemies ambush you!', '#ff2d55');
        }
        if (typeof spawnParticles === 'function') spawnParticles(obj.x, obj.y, obj.def.color, 12, 80);
        break;
      }

      case 'watchtower': {
        // Reveal all enemies on minimap for 15s (visual only — handled by minimap render)
        state.watchtowerReveal = 15;
        _showWorldToast(obj.def.icon, 'Watchtower Activated!', 'All enemies revealed for 15s', obj.def.color);
        if (typeof spawnParticles === 'function') spawnParticles(obj.x, obj.y, obj.def.color, 14, 90);
        break;
      }
    }
  }

  // ─── Show NPC Choice Modal ───
  function _showNPCChoice(state, obj, gifts) {
    state.mode = 'npc_choice';

    const modal = document.getElementById('lore-modal');
    if (!modal) { state.mode = 'playing'; return; }

    modal.classList.remove('hidden');
    modal.className = 'overlay lore-overlay lost_wanderer';

    const speakerEl = document.getElementById('lore-speaker');
    const textEl = document.getElementById('lore-text');
    const contEl = document.getElementById('lore-continue');
    const choicesEl = document.getElementById('lore-choices');

    if (speakerEl) {
      speakerEl.textContent = `${obj.def.icon} ${obj.def.name}`;
      speakerEl.style.color = obj.def.color;
    }
    if (textEl) textEl.textContent = _pick(obj.def.dialogue);
    if (contEl) contEl.classList.add('hidden');

    if (choicesEl) {
      choicesEl.innerHTML = '';
      choicesEl.classList.remove('hidden');
      for (const gift of gifts) {
        const btn = document.createElement('button');
        btn.className = 'lore-choice-btn';
        btn.innerHTML = `<span class="lore-choice-icon">${gift.icon}</span><span class="lore-choice-name">${gift.name}</span>`;
        btn.addEventListener('click', () => {
          if (gift.effect.dmgMult) state.dmgMult += gift.effect.dmgMult;
          if (gift.effect.speedMult) state.speedMult += gift.effect.speedMult;
          if (gift.effect.maxHp) { state.maxHp += gift.effect.maxHp; state.hp = Math.min(state.hp + gift.effect.hp, state.maxHp); }
          if (typeof playSound === 'function') playSound('achieve');
          modal.classList.add('hidden');
          choicesEl.classList.add('hidden');
          state.mode = 'playing';
        });
        choicesEl.appendChild(btn);
      }
    }
  }

  // ─── Toast Notification ───
  function _showWorldToast(icon, title, desc, color) {
    const container = document.getElementById('achievement-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'achievement-toast';
    el.style.borderLeftColor = color;
    el.innerHTML = `<span class="achieve-icon">${icon}</span><div class="achieve-info"><span class="achieve-name">${title}</span><span class="achieve-reward">${desc}</span></div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // ─── Render World Objects ───
  function render(ctx, state, worldToScreen) {
    if (!state) return;

    for (const obj of state.worldObjects) {
      if (obj.used) continue;
      const p = worldToScreen(obj.x, obj.y);

      // Skip if off-screen
      if (p.x < -60 || p.x > ctx.canvas.width + 60 || p.y < -60 || p.y > ctx.canvas.height + 60) continue;

      const glow = 0.5 + 0.5 * Math.sin(obj.pulse * 2.5);

      ctx.save();
      ctx.shadowColor = obj.def.color;
      ctx.shadowBlur = 10 + glow * 10;

      switch (obj.type) {
        case 'shrine': {
          // Pillar with floating ring
          ctx.fillStyle = obj.def.color;
          ctx.fillRect(p.x - 5, p.y - 16, 10, 22);
          ctx.strokeStyle = `rgba(180,77,255,${0.4 + glow * 0.3})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y - 8, 14 + glow * 3, 0, TWO_PI);
          ctx.stroke();
          break;
        }
        case 'wanderer': {
          // Simple humanoid shape
          ctx.fillStyle = obj.def.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y - 10, 6, 0, TWO_PI); // head
          ctx.fill();
          ctx.fillRect(p.x - 4, p.y - 4, 8, 14); // body
          // Subtle float animation
          ctx.fillStyle = `rgba(255,200,69,${0.2 + glow * 0.15})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y + 2, 12, 0, TWO_PI);
          ctx.fill();
          break;
        }
        case 'crystal_node': {
          // Diamond crystal
          ctx.fillStyle = obj.def.color;
          const sz = obj.def.radius + glow * 3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - sz);
          ctx.lineTo(p.x + sz * 0.5, p.y);
          ctx.lineTo(p.x, p.y + sz * 0.6);
          ctx.lineTo(p.x - sz * 0.5, p.y);
          ctx.closePath();
          ctx.fill();
          // Progress bar if being mined
          if (obj.interactProgress > 0 && obj.def.interactTime > 0) {
            const pct = obj.interactProgress / obj.def.interactTime;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(p.x - 18, p.y + sz + 6, 36, 4);
            ctx.fillStyle = obj.def.color;
            ctx.fillRect(p.x - 18, p.y + sz + 6, 36 * pct, 4);
          }
          break;
        }
        case 'ruins': {
          // Broken walls
          ctx.fillStyle = `rgba(125,243,255,${0.4 + glow * 0.2})`;
          ctx.fillRect(p.x - 12, p.y - 10, 6, 16);
          ctx.fillRect(p.x + 4, p.y - 14, 6, 20);
          ctx.fillRect(p.x - 6, p.y + 2, 14, 5);
          break;
        }
        case 'watchtower': {
          // Tower shape
          ctx.fillStyle = obj.def.color;
          ctx.fillRect(p.x - 5, p.y - 20, 10, 26);
          ctx.fillRect(p.x - 8, p.y - 22, 16, 4);
          // Progress bar
          if (obj.interactProgress > 0 && obj.def.interactTime > 0) {
            const pct = obj.interactProgress / obj.def.interactTime;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(p.x - 18, p.y + 12, 36, 4);
            ctx.fillStyle = obj.def.color;
            ctx.fillRect(p.x - 18, p.y + 12, 36 * pct, 4);
          }
          break;
        }
      }

      // Label
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(255,255,255,${0.5 + glow * 0.3})`;
      ctx.font = '9px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obj.def.name, p.x, p.y + obj.def.radius + 18);

      ctx.restore();
    }
  }

  // ─── Minimap ───
  function renderMinimap(minimapCtx, state, scale, mmW, mmH) {
    const hw = mmW / 2, hh = mmH / 2;
    for (const obj of state.worldObjects) {
      if (obj.used) continue;
      const mx = hw + obj.x * scale;
      const my = hh + obj.y * scale;
      minimapCtx.fillStyle = obj.def.color;
      minimapCtx.fillRect(mx - 2, my - 2, 4, 4);
    }
  }

  // ─── Public API ───
  window.VoidWorld = {
    getDefaultState,
    generateInitialWorld,
    update,
    render,
    renderMinimap,
    WORLD_DEFS,
  };
})();
