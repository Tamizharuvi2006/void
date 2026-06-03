/* ═══════════════════════════════════════════════════════════════
   VOID CLASSES — Path system (recovered memories of Ascendants)
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Class Definitions ───
  const CLASS_DEFS = [
    {
      id: 'ruin',
      name: 'Path of Ruin',
      ascendant: 'The Reaper',
      icon: '⚔️',
      quote: 'I taught worlds how to die.',
      color: '#ff2d55',
      glowColor: 'rgba(255,45,85,0.35)',
      stats: {
        dmgMult: 0.30,
        critChance: 0.10,
        maxHp: 20,
      },
      desc: '+30% Damage  ·  +10% Crit  ·  +20 HP',
    },
    {
      id: 'eternity',
      name: 'Path of Eternity',
      ascendant: 'The Guardian',
      icon: '🛡️',
      quote: 'Even time broke before me.',
      color: '#00f0ff',
      glowColor: 'rgba(0,240,255,0.35)',
      stats: {
        maxHp: 60,
        armor: 2,
        regenRate: 0.5,
      },
      desc: '+60 HP  ·  +2 Armor  ·  +2.5 HP/5s Regen',
    },
    {
      id: 'knowledge',
      name: 'Path of Knowledge',
      ascendant: 'The Sage',
      icon: '🌀',
      quote: 'I learned the language of stars.',
      color: '#b44dff',
      glowColor: 'rgba(180,77,255,0.35)',
      stats: {
        cdReduction: 0.20,     // 20% cooldown reduction
        aoeMult: 0.30,         // 30% AoE radius increase
        xpMult: 0.15,
      },
      desc: '-20% Cooldowns  ·  +30% AoE  ·  +15% XP',
    },
    {
      id: 'shadows',
      name: 'Path of Shadows',
      ascendant: 'The Phantom',
      icon: '👤',
      quote: 'The Void itself could not find me.',
      color: '#a8ff44',
      glowColor: 'rgba(168,255,68,0.35)',
      stats: {
        speedMult: 0.25,
        dodgeChance: 0.15,     // 15% chance to avoid damage
        dashCdReduction: 1.0,  // -1s dash cooldown
      },
      desc: '+25% Speed  ·  15% Dodge  ·  -1s Dash CD',
    },
  ];

  // ─── Secret Class (unlocked later) ───
  const SECRET_CLASS = {
    id: 'sovereign',
    name: 'Path of Sovereignty',
    ascendant: 'The Eighth Ascendant',
    icon: '👑',
    quote: 'I am the Void\'s one true fear.',
    color: '#ffc845',
    glowColor: 'rgba(255,200,69,0.4)',
    stats: {
      dmgMult: 0.20,
      maxHp: 40,
      speedMult: 0.15,
      cdReduction: 0.10,
      critChance: 0.05,
    },
    desc: '+20% Damage  ·  +40 HP  ·  +15% Speed  ·  -10% CD  ·  +5% Crit',
    unlockReq: { wave: 20, achievements: 20, kills: 1000 },
  };

  // ─── State ───
  function getDefaultState() {
    return {
      chosenClass: null,       // Class ID or null
      classDef: null,          // Full class definition
      cdReduction: 0,          // Cooldown reduction multiplier
      aoeMult: 1.0,            // AoE radius multiplier
      dodgeChance: 0,          // Dodge probability
    };
  }

  // ─── Show Class Selection UI ───
  function showSelection(state) {
    state.mode = 'class_select';

    const modal = document.getElementById('class-modal');
    if (!modal) { state.mode = 'playing'; return; }

    modal.classList.remove('hidden');
    const cardsEl = document.getElementById('class-cards');
    if (!cardsEl) return;

    cardsEl.innerHTML = '';

    // Check if secret class is unlocked
    const classes = [...CLASS_DEFS];
    if (_isSecretUnlocked(state)) {
      classes.push(SECRET_CLASS);
    }

    for (let i = 0; i < classes.length; i++) {
      const cls = classes[i];
      const card = document.createElement('div');
      card.className = 'class-card';
      card.style.borderColor = cls.color;
      card.style.animationDelay = `${i * 0.15}s`;
      card.innerHTML = `
        <div class="class-icon" style="color:${cls.color}">${cls.icon}</div>
        <div class="class-name" style="color:${cls.color}">${cls.name}</div>
        <div class="class-ascendant">${cls.ascendant}</div>
        <div class="class-quote">"${cls.quote}"</div>
        <div class="class-desc">${cls.desc}</div>
      `;
      card.addEventListener('click', () => {
        applyClass(state, cls);
        modal.classList.add('hidden');
      });
      cardsEl.appendChild(card);
    }
  }

  // ─── Apply Class Stats ───
  function applyClass(state, cls) {
    state.chosenClass = cls.id;
    state.classDef = cls;

    const s = cls.stats;
    if (s.dmgMult) state.dmgMult += s.dmgMult;
    if (s.critChance) state.critChance += s.critChance;
    if (s.maxHp) { state.maxHp += s.maxHp; state.hp = Math.min(state.hp + s.maxHp, state.maxHp); }
    if (s.armor) state.armor += s.armor;
    if (s.regenRate) state.regenRate += s.regenRate;
    if (s.speedMult) state.speedMult += s.speedMult;
    if (s.xpMult) state.xpMult += s.xpMult;
    if (s.cdReduction) state.cdReduction = (state.cdReduction || 0) + s.cdReduction;
    if (s.aoeMult) state.aoeMult = (state.aoeMult || 1.0) + s.aoeMult;
    if (s.dodgeChance) state.dodgeChance = (state.dodgeChance || 0) + s.dodgeChance;
    if (s.dashCdReduction) {
      // Will be read by dash logic in updatePlayer
      state.dashCdBase = (state.dashCdBase || 3.0) - s.dashCdReduction;
    }

    // Visual feedback
    if (typeof playSound === 'function') playSound('levelup');
    const flashEl = document.getElementById('screen-flash');
    if (flashEl) {
      flashEl.style.background = cls.color;
      flashEl.classList.add('active');
      setTimeout(() => flashEl.classList.remove('active'), 300);
    }

    // Update class badge in HUD
    const badgeEl = document.getElementById('class-badge');
    if (badgeEl) {
      badgeEl.textContent = `${cls.icon} ${cls.name}`;
      badgeEl.style.color = cls.color;
      badgeEl.classList.remove('hidden');
    }

    state.mode = 'playing';
  }

  // ─── Check Secret Class Unlock ───
  function _isSecretUnlocked(state) {
    if (typeof save === 'undefined') return false;
    return (
      save.bestWave >= 20 &&
      save.achievements && save.achievements.length >= 20 &&
      save.totalKills >= 1000
    );
  }

  // ─── Get Player Glow Color (for rendering) ───
  function getPlayerGlow(state) {
    if (state.classDef) return state.classDef.glowColor;
    return 'rgba(0,240,255,0.3)';
  }

  function getPlayerColor(state) {
    if (state.classDef) return state.classDef.color;
    return '#00f0ff';
  }

  // ─── Public API ───
  window.VoidClasses = {
    getDefaultState,
    showSelection,
    applyClass,
    getPlayerGlow,
    getPlayerColor,
    CLASS_DEFS,
    SECRET_CLASS,
  };
})();
