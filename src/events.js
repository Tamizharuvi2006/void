/* ═══════════════════════════════════════════════════════════════
   VOID EVENTS — Decision-forcing events every 2-3 minutes
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Tiny Utilities (self-contained) ───
  const _dist = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return Math.sqrt(dx * dx + dy * dy); };
  const _rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const _pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const _clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
  const TWO_PI = Math.PI * 2;
  const ARENA_HALF = 2400;

  // ─── Event Definitions ───
  const EVENT_DEFS = {
    void_crystal: {
      name: 'Void Crystal',
      icon: '🟣',
      desc: 'A Void Crystal has appeared! Collect it!',
      duration: 30,
      color: '#b44dff',
      minWave: 2,
    },
    corruption_storm: {
      name: 'Corruption Storm',
      icon: '🔴',
      desc: 'The Void contracts! Stay inside the safe zone!',
      duration: 25,
      color: '#ff2d55',
      minWave: 3,
    },
    elite_hunt: {
      name: 'Elite Hunt',
      icon: '⚔️',
      desc: 'A Void Champion has emerged! Destroy it!',
      duration: 45,
      color: '#ffc845',
      minWave: 4,
    },
    relic_defense: {
      name: 'Relic Defense',
      icon: '🛡️',
      desc: 'An Ancient Relic is under attack! Protect it!',
      duration: 40,
      color: '#00f0ff',
      minWave: 5,
    },
    void_portal: {
      name: 'Void Portal',
      icon: '🌀',
      desc: 'A Void Portal has opened! Dare you enter?',
      duration: 20, // window to enter
      color: '#b44dff',
      minWave: 6,
    },
  };

  // ─── Cooldown Config ───
  const EVENT_CD_MIN = 90;   // Minimum seconds between events
  const EVENT_CD_MAX = 150;  // Maximum seconds between events

  // ─── State Fields (added to newState by main.js) ───
  function getDefaultState() {
    return {
      event: null,             // Current active event or null
      eventCooldown: 60,       // First event fires ~60s in (give player time to settle)
      eventHistory: [],        // Track which events have fired
      // Fields used by specific events:
      // event.type, event.timer, event.maxTimer, event.data, event.completed, event.failed
    };
  }

  // ─── Start an Event ───
  function startEvent(state, type) {
    const def = EVENT_DEFS[type];
    if (!def) return;

    const evt = {
      type,
      def,
      timer: def.duration,
      maxTimer: def.duration,
      completed: false,
      failed: false,
      data: {},
    };

    // Event-specific init
    switch (type) {
      case 'void_crystal': {
        // Spawn crystal far from player
        const angle = Math.random() * TWO_PI;
        const distance = _rand(600, 1200);
        let cx = state.px + Math.cos(angle) * distance;
        let cy = state.py + Math.sin(angle) * distance;
        cx = _clamp(cx, -ARENA_HALF + 100, ARENA_HALF - 100);
        cy = _clamp(cy, -ARENA_HALF + 100, ARENA_HALF - 100);
        evt.data = { x: cx, y: cy, radius: 18, pulse: 0, collected: false };
        break;
      }
      case 'corruption_storm': {
        evt.data = {
          safeRadius: ARENA_HALF,                       // Starts at full arena
          minRadius: 300,                               // Shrinks to this
          centerX: state.px + _rand(-200, 200),         // Safe zone center (near player)
          centerY: state.py + _rand(-200, 200),
          dmgTimer: 0,
        };
        break;
      }
      case 'elite_hunt': {
        // Spawn a champion enemy — data holds its info
        const angle = Math.random() * TWO_PI;
        const spawnDist = 500;
        evt.data = {
          x: state.px + Math.cos(angle) * spawnDist,
          y: state.py + Math.sin(angle) * spawnDist,
          hp: 200 + state.wave * 80,
          maxHp: 200 + state.wave * 80,
          radius: 32,
          speed: 50,
          dmg: 15 + state.wave * 2,
          hitFlash: 0,
          color: '#ffc845',
          killed: false,
        };
        break;
      }
      case 'relic_defense': {
        evt.data = {
          x: state.px + _rand(-80, 80),
          y: state.py + _rand(-80, 80),
          hp: 150 + state.wave * 20,
          maxHp: 150 + state.wave * 20,
          radius: 20,
          pulse: 0,
        };
        break;
      }
      case 'void_portal': {
        const angle = Math.random() * TWO_PI;
        const d = _rand(300, 600);
        evt.data = {
          x: _clamp(state.px + Math.cos(angle) * d, -ARENA_HALF + 100, ARENA_HALF - 100),
          y: _clamp(state.py + Math.sin(angle) * d, -ARENA_HALF + 100, ARENA_HALF - 100),
          radius: 30,
          entered: false,
          portalPhase: 'waiting', // 'waiting' -> 'inside' -> 'done'
          insideTimer: 0,
          insideDuration: 15,
          pulse: 0,
        };
        break;
      }
    }

    state.event = evt;

    // Show event HUD
    const hudEl = document.getElementById('event-hud');
    if (hudEl) {
      hudEl.classList.remove('hidden');
      const nameEl = document.getElementById('event-name');
      const descEl = document.getElementById('event-desc');
      const iconEl = document.getElementById('event-icon');
      if (nameEl) nameEl.textContent = def.name;
      if (descEl) descEl.textContent = def.desc;
      if (iconEl) iconEl.textContent = def.icon;
      hudEl.style.borderColor = def.color;
    }
  }

  // ─── Pick a Random Event ───
  function pickEvent(state) {
    const eligible = Object.keys(EVENT_DEFS).filter(k => {
      const def = EVENT_DEFS[k];
      return state.wave >= def.minWave;
    });
    if (eligible.length === 0) return null;
    return _pick(eligible);
  }

  // ─── Complete an Event ───
  function completeEvent(state, success) {
    if (!state.event) return;
    const evt = state.event;

    if (success) {
      evt.completed = true;
      // Rewards
      switch (evt.type) {
        case 'void_crystal':
          // +2 levels
          for (let i = 0; i < 2; i++) {
            state.xp = state.xpToNext; // Force level up
          }
          break;
        case 'corruption_storm':
          state.dustEarned += 20 + state.wave * 5;
          state.hp = Math.min(state.hp + 20, state.maxHp);
          break;
        case 'elite_hunt':
          // Spawn rare chest near player
          if (typeof spawnChest === 'function') spawnChest(state.px + _rand(-60, 60), state.py + _rand(-60, 60), 'boss');
          break;
        case 'relic_defense':
          state.dustEarned += 30 + state.wave * 5;
          // Big XP burst
          const gemCount = 12;
          for (let i = 0; i < gemCount; i++) {
            state.gems.push({
              x: state.event.data.x + _rand(-30, 30),
              y: state.event.data.y + _rand(-30, 30),
              xp: 8, radius: 7, life: 25,
            });
          }
          break;
        case 'void_portal':
          // Legendary reward: +3 levels
          for (let i = 0; i < 3; i++) {
            state.xp = state.xpToNext;
          }
          state.dustEarned += 50 + state.wave * 8;
          break;
      }

      // Play success sound
      if (typeof playSound === 'function') playSound('achieve');

      // Show completion flash
      const flashEl = document.getElementById('screen-flash');
      if (flashEl) {
        flashEl.style.background = evt.def.color;
        flashEl.classList.add('active');
        setTimeout(() => flashEl.classList.remove('active'), 200);
      }
    } else {
      evt.failed = true;
    }

    // Cleanup after short delay
    setTimeout(() => {
      state.event = null;
      const hudEl = document.getElementById('event-hud');
      if (hudEl) hudEl.classList.add('hidden');
    }, success ? 1500 : 500);

    // Reset cooldown
    state.eventCooldown = _rand(EVENT_CD_MIN, EVENT_CD_MAX);
  }

  // ─── Update Loop ───
  function update(state, dt) {
    if (!state || state.mode !== 'playing') return;

    // Cooldown to next event
    if (!state.event) {
      state.eventCooldown -= dt;
      if (state.eventCooldown <= 0 && state.wave >= 2) {
        const evtType = pickEvent(state);
        if (evtType) startEvent(state, evtType);
      }
      return;
    }

    const evt = state.event;
    if (evt.completed || evt.failed) return;

    // Countdown
    evt.timer -= dt;

    // Update event HUD timer bar
    const barEl = document.getElementById('event-timer-bar');
    if (barEl) {
      const pct = Math.max(0, evt.timer / evt.maxTimer) * 100;
      barEl.style.width = pct + '%';
      barEl.style.background = evt.def.color;
      // Flash when low
      if (pct < 25) barEl.style.opacity = (Math.sin(state.time * 10) > 0) ? '1' : '0.4';
      else barEl.style.opacity = '1';
    }

    // Time ran out
    if (evt.timer <= 0) {
      completeEvent(state, false);
      return;
    }

    // Event-specific update
    switch (evt.type) {
      case 'void_crystal': {
        const d = evt.data;
        d.pulse += dt;
        // Check if player collected it
        const playerDist = _dist(state.px, state.py, d.x, d.y);
        if (playerDist < d.radius + 14 + 10) {
          d.collected = true;
          // Particle burst
          if (typeof spawnParticles === 'function') spawnParticles(d.x, d.y, evt.def.color, 24, 150);
          completeEvent(state, true);
        }
        break;
      }

      case 'corruption_storm': {
        const d = evt.data;
        const progress = 1 - (evt.timer / evt.maxTimer);
        d.safeRadius = ARENA_HALF - (ARENA_HALF - d.minRadius) * progress;
        // Damage player if outside safe zone
        d.dmgTimer -= dt;
        const playerDist = _dist(state.px, state.py, d.centerX, d.centerY);
        if (playerDist > d.safeRadius && d.dmgTimer <= 0 && state.invuln <= 0) {
          d.dmgTimer = 0.5;
          const dmg = Math.max(1, Math.round(5 + state.wave * 0.5) - state.armor);
          state.hp -= dmg;
          if (typeof spawnDamageNum === 'function') spawnDamageNum(state.px, state.py - 14, dmg, false);
          state.dmgFlash = 0.15;
          if (state.hp <= 0 && typeof gameOver === 'function') gameOver();
        }
        // Completed if timer runs out and player alive
        if (evt.timer <= 2 && state.hp > 0 && !evt.completed) {
          completeEvent(state, true);
        }
        break;
      }

      case 'elite_hunt': {
        const d = evt.data;
        d.hitFlash = Math.max(0, d.hitFlash - dt);
        // Move toward player
        const dx = state.px - d.x, dy = state.py - d.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 5) {
          d.x += (dx / len) * d.speed * dt;
          d.y += (dy / len) * d.speed * dt;
        }
        // Collision with player
        if (len < d.radius + 14 && state.invuln <= 0) {
          const rawDmg = Math.max(1, d.dmg - state.armor);
          state.hp -= rawDmg;
          state.invuln = 0.8;
          state.dmgFlash = 0.15;
          if (typeof spawnDamageNum === 'function') spawnDamageNum(state.px, state.py - 14, rawDmg, false);
          if (typeof spawnParticles === 'function') spawnParticles(state.px, state.py, '#ff2d55', 10, 100);
          if (typeof cam !== 'undefined') cam.shake = Math.max(cam.shake || 0, 10);
          if (state.hp <= 0 && typeof gameOver === 'function') gameOver();
        }
        // Check if killed
        if (d.killed || d.hp <= 0) {
          if (typeof spawnParticles === 'function') spawnParticles(d.x, d.y, d.color, 30, 160);
          completeEvent(state, true);
        }
        break;
      }

      case 'relic_defense': {
        const d = evt.data;
        d.pulse += dt;
        // Enemies attack the relic
        for (const e of state.enemies) {
          if (e.dead) continue;
          const ed = _dist(e.x, e.y, d.x, d.y);
          // Enemies are drawn toward the relic
          if (ed < 400) {
            const ax = d.x - e.x, ay = d.y - e.y;
            const al = Math.sqrt(ax * ax + ay * ay);
            if (al > 1) {
              e.x += (ax / al) * e.speed * 0.3 * dt;
              e.y += (ay / al) * e.speed * 0.3 * dt;
            }
          }
          // Damage relic on contact
          if (ed < e.radius + d.radius) {
            d.hp -= e.dmg * dt;
            e.hitFlash = 0.1;
          }
        }
        // Relic destroyed
        if (d.hp <= 0) {
          if (typeof spawnParticles === 'function') spawnParticles(d.x, d.y, '#ff2d55', 20, 120);
          completeEvent(state, false);
          return;
        }
        // Survived the full duration
        if (evt.timer <= 1 && !evt.completed) {
          completeEvent(state, true);
        }
        break;
      }

      case 'void_portal': {
        const d = evt.data;
        d.pulse += dt;
        if (d.portalPhase === 'waiting') {
          // Check if player enters portal
          const playerDist = _dist(state.px, state.py, d.x, d.y);
          if (playerDist < d.radius + 14) {
            d.portalPhase = 'inside';
            d.entered = true;
            d.insideTimer = d.insideDuration;
            // Spawn hard enemies around player
            for (let i = 0; i < 8 + state.wave; i++) {
              const a = Math.random() * TWO_PI;
              const sd = _rand(200, 400);
              if (typeof spawnEnemy === 'function') spawnEnemy(_pick(['shade', 'knight', 'archer']));
            }
            if (typeof playSound === 'function') playSound('boss');
          }
        } else if (d.portalPhase === 'inside') {
          d.insideTimer -= dt;
          // Update the event timer to show inside timer
          evt.timer = d.insideTimer;
          evt.maxTimer = d.insideDuration;
          // Survived the challenge
          if (d.insideTimer <= 0) {
            d.portalPhase = 'done';
            completeEvent(state, true);
          }
        }
        break;
      }
    }
  }

  // ─── Deal damage to elite hunt champion ───
  function damageChampion(state, dmg) {
    if (!state.event || state.event.type !== 'elite_hunt') return false;
    const d = state.event.data;
    if (d.killed) return false;
    d.hp -= dmg;
    d.hitFlash = 0.1;
    if (d.hp <= 0) d.killed = true;
    return true;
  }

  // ─── Render (called from main render pipeline) ───
  function render(ctx, state, worldToScreen) {
    if (!state || !state.event) return;
    const evt = state.event;
    if (evt.completed || evt.failed) return;

    switch (evt.type) {
      case 'void_crystal': {
        const d = evt.data;
        if (d.collected) break;
        const p = worldToScreen(d.x, d.y);
        const glow = 0.5 + 0.5 * Math.sin(d.pulse * 4);
        // Outer glow
        ctx.save();
        ctx.shadowColor = evt.def.color;
        ctx.shadowBlur = 20 + glow * 15;
        // Crystal shape (diamond)
        ctx.fillStyle = evt.def.color;
        ctx.beginPath();
        const sz = d.radius + glow * 4;
        ctx.moveTo(p.x, p.y - sz);
        ctx.lineTo(p.x + sz * 0.6, p.y);
        ctx.lineTo(p.x, p.y + sz);
        ctx.lineTo(p.x - sz * 0.6, p.y);
        ctx.closePath();
        ctx.fill();
        // Inner white core
        ctx.fillStyle = `rgba(255,255,255,${0.5 + glow * 0.3})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 0.25, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
        // Direction arrow from player to crystal
        _drawDirectionArrow(ctx, state, d.x, d.y, evt.def.color, worldToScreen);
        break;
      }

      case 'corruption_storm': {
        const d = evt.data;
        const center = worldToScreen(d.centerX, d.centerY);
        // Draw safe zone circle
        ctx.save();
        ctx.strokeStyle = `rgba(255,45,85,${0.4 + 0.3 * Math.sin(state.time * 3)})`;
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.arc(center.x, center.y, d.safeRadius, 0, TWO_PI);
        ctx.stroke();
        ctx.setLineDash([]);
        // Danger overlay outside safe zone (subtle red tint)
        ctx.fillStyle = 'rgba(255,20,20,0.04)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
        break;
      }

      case 'elite_hunt': {
        const d = evt.data;
        if (d.killed) break;
        const p = worldToScreen(d.x, d.y);
        ctx.save();
        // Glow
        ctx.shadowColor = d.color;
        ctx.shadowBlur = 20;
        // Body
        ctx.fillStyle = d.hitFlash > 0 ? '#fff' : d.color;
        ctx.beginPath();
        // Star shape for champion
        for (let i = 0; i < 8; i++) {
          const a = (TWO_PI / 8) * i + state.time * 0.5;
          const r = i % 2 === 0 ? d.radius : d.radius * 0.55;
          const sx = p.x + Math.cos(a) * r, sy = p.y + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
        // HP bar
        const barW = 50, barH = 5;
        const hpPct = _clamp(d.hp / d.maxHp, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(p.x - barW / 2, p.y - d.radius - 14, barW, barH);
        ctx.fillStyle = hpPct > 0.5 ? '#a8ff44' : hpPct > 0.25 ? '#ffc845' : '#ff2d55';
        ctx.fillRect(p.x - barW / 2, p.y - d.radius - 14, barW * hpPct, barH);
        ctx.restore();
        // Direction arrow
        _drawDirectionArrow(ctx, state, d.x, d.y, d.color, worldToScreen);
        break;
      }

      case 'relic_defense': {
        const d = evt.data;
        const p = worldToScreen(d.x, d.y);
        ctx.save();
        const glow = 0.5 + 0.5 * Math.sin(d.pulse * 3);
        ctx.shadowColor = evt.def.color;
        ctx.shadowBlur = 15 + glow * 10;
        // Relic: glowing pillar
        ctx.fillStyle = evt.def.color;
        ctx.fillRect(p.x - 6, p.y - d.radius, 12, d.radius * 2);
        // Floating ring
        ctx.strokeStyle = `rgba(0,240,255,${0.5 + glow * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, d.radius + 10 + glow * 5, 0, TWO_PI);
        ctx.stroke();
        // HP bar
        const barW = 44, barH = 5;
        const hpPct = _clamp(d.hp / d.maxHp, 0, 1);
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(p.x - barW / 2, p.y - d.radius - 16, barW, barH);
        ctx.fillStyle = hpPct > 0.5 ? '#00f0ff' : hpPct > 0.25 ? '#ffc845' : '#ff2d55';
        ctx.fillRect(p.x - barW / 2, p.y - d.radius - 16, barW * hpPct, barH);
        ctx.restore();
        break;
      }

      case 'void_portal': {
        const d = evt.data;
        if (d.portalPhase === 'done') break;
        const p = worldToScreen(d.x, d.y);
        ctx.save();
        const glow = 0.5 + 0.5 * Math.sin(d.pulse * 5);
        ctx.shadowColor = evt.def.color;
        ctx.shadowBlur = 20 + glow * 15;
        // Swirling portal
        for (let i = 0; i < 3; i++) {
          ctx.strokeStyle = `rgba(180,77,255,${0.3 + glow * 0.2 - i * 0.08})`;
          ctx.lineWidth = 3 - i;
          ctx.beginPath();
          ctx.arc(p.x, p.y, d.radius + i * 8 - glow * 4, state.time * (2 + i), state.time * (2 + i) + Math.PI * 1.5);
          ctx.stroke();
        }
        // Center
        ctx.fillStyle = `rgba(180,77,255,${0.2 + glow * 0.15})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, d.radius * 0.6, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
        // Label
        if (d.portalPhase === 'waiting') {
          ctx.fillStyle = `rgba(180,77,255,${0.7 + glow * 0.3})`;
          ctx.font = 'bold 11px Orbitron, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('ENTER?', p.x, p.y + d.radius + 18);
          _drawDirectionArrow(ctx, state, d.x, d.y, evt.def.color, worldToScreen);
        }
        break;
      }
    }
  }

  // ─── Direction Arrow (points from screen edge toward offscreen target) ───
  function _drawDirectionArrow(ctx, state, targetX, targetY, color, worldToScreen) {
    const p = worldToScreen(targetX, targetY);
    const w = ctx.canvas.width, h = ctx.canvas.height;
    const margin = 60;
    // Only show arrow if target is off-screen
    if (p.x > margin && p.x < w - margin && p.y > margin && p.y < h - margin) return;

    const cx = w / 2, cy = h / 2;
    const ang = Math.atan2(p.y - cy, p.x - cx);
    const arrowDist = Math.min(w, h) * 0.4;
    const ax = cx + Math.cos(ang) * arrowDist;
    const ay = cy + Math.sin(ang) * arrowDist;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ─── Minimap render ───
  function renderMinimap(minimapCtx, state, scale, mmW, mmH) {
    if (!state.event) return;
    const evt = state.event;
    const hw = mmW / 2, hh = mmH / 2;

    function toMinimap(wx, wy) {
      return { x: hw + wx * scale, y: hh + wy * scale };
    }

    switch (evt.type) {
      case 'void_crystal': {
        if (evt.data.collected) break;
        const mp = toMinimap(evt.data.x, evt.data.y);
        minimapCtx.fillStyle = evt.def.color;
        minimapCtx.beginPath();
        minimapCtx.arc(mp.x, mp.y, 4, 0, TWO_PI);
        minimapCtx.fill();
        break;
      }
      case 'elite_hunt': {
        if (evt.data.killed) break;
        const mp = toMinimap(evt.data.x, evt.data.y);
        minimapCtx.fillStyle = evt.def.color;
        minimapCtx.beginPath();
        minimapCtx.arc(mp.x, mp.y, 4, 0, TWO_PI);
        minimapCtx.fill();
        break;
      }
      case 'relic_defense': {
        const mp = toMinimap(evt.data.x, evt.data.y);
        minimapCtx.fillStyle = evt.def.color;
        minimapCtx.fillRect(mp.x - 3, mp.y - 3, 6, 6);
        break;
      }
      case 'void_portal': {
        const mp = toMinimap(evt.data.x, evt.data.y);
        minimapCtx.strokeStyle = evt.def.color;
        minimapCtx.lineWidth = 1.5;
        minimapCtx.beginPath();
        minimapCtx.arc(mp.x, mp.y, 4, 0, TWO_PI);
        minimapCtx.stroke();
        break;
      }
    }
  }

  // ─── Public API ───
  window.VoidEvents = {
    getDefaultState,
    update,
    render,
    renderMinimap,
    startEvent,
    damageChampion,
    completeEvent,
    EVENT_DEFS,
  };
})();
