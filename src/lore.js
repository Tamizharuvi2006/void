/* ═══════════════════════════════════════════════════════════════
   VOID LORE — Story dialogue system triggered at wave milestones
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Lore Trigger Definitions ───
  const LORE_TRIGGERS = [
    {
      wave: 5,
      id: 'the_void_speaks',
      type: 'cinematic',
      dialogue: [
        { speaker: 'VOID', text: 'You have survived.', pause: 1200 },
        { speaker: 'VOID', text: 'Impossible.', pause: 800 },
        { speaker: 'VOID', text: 'No soul survives this long.', pause: 1000 },
        { speaker: 'VOID', text: 'Who... are you?', pause: 1500 },
      ],
      afterEvent: 'class_selection',   // triggers class choice after dialogue
      visualEffect: 'void_eye',
    },
    {
      wave: 10,
      id: 'recognition',
      type: 'cinematic',
      dialogue: [
        { speaker: 'VOID', text: 'I remember you.', pause: 1200 },
        { speaker: 'VOID', text: 'You were among them.', pause: 1000 },
        { speaker: 'VOID', text: 'The ones who defied me.', pause: 1200 },
        { speaker: 'VOID', text: 'But your name... it is gone.', pause: 1500 },
      ],
      visualEffect: 'void_eye',
    },
    {
      wave: 15,
      id: 'the_forgotten_one',
      type: 'npc',
      npcName: 'The Forgotten One',
      npcIcon: '👻',
      dialogue: [
        { speaker: 'FORGOTTEN', text: 'Wait...', pause: 800 },
        { speaker: 'FORGOTTEN', text: 'You can see me?', pause: 1000 },
        { speaker: 'FORGOTTEN', text: 'I have been trapped here for eons.', pause: 1200 },
        { speaker: 'FORGOTTEN', text: 'You are not surviving.', pause: 1000 },
        { speaker: 'FORGOTTEN', text: 'You are remembering.', pause: 1500 },
      ],
      afterEvent: 'buff_choice',
      buffChoices: [
        { name: 'Strength of the Ancients', icon: '⚔️', effect: { dmgMult: 0.25 } },
        { name: 'Blessing of Eternity', icon: '💚', effect: { maxHp: 50, hp: 50 } },
        { name: 'Void Resonance', icon: '🌀', effect: { xpMult: 0.30 } },
      ],
    },
    {
      wave: 20,
      id: 'the_reveal',
      type: 'cinematic',
      dialogue: [
        { speaker: 'FORGOTTEN', text: 'I finally understand.', pause: 1000 },
        { speaker: 'FORGOTTEN', text: 'There were Seven Ascendants.', pause: 1200 },
        { speaker: 'FORGOTTEN', text: 'But there was an Eighth.', pause: 1000 },
        { speaker: 'FORGOTTEN', text: 'The strongest of all.', pause: 1200 },
        { speaker: 'FORGOTTEN', text: 'The one the Void feared.', pause: 1000 },
        { speaker: 'FORGOTTEN', text: 'The one it erased from existence.', pause: 1500 },
        { speaker: 'FORGOTTEN', text: 'That... is you.', pause: 2000 },
      ],
      visualEffect: 'purple_flash',
    },
    {
      wave: 30,
      id: 'void_weakening',
      type: 'cinematic',
      dialogue: [
        { speaker: 'VOID', text: 'You grow stronger.', pause: 1000 },
        { speaker: 'VOID', text: 'The prison weakens.', pause: 1200 },
        { speaker: 'VOID', text: 'Soon you will remember everything.', pause: 1500 },
        { speaker: 'VOID', text: 'And then... you will have to choose.', pause: 2000 },
      ],
      visualEffect: 'void_eye',
    },
  ];

  // ─── State ───
  function getDefaultState() {
    return {
      loreProgress: [],        // IDs of triggered lore events
      loreActive: null,        // Current active lore event
      loreDialogueIndex: 0,    // Current line being displayed
      loreCharIndex: 0,        // Typewriter char position
      loreCharTimer: 0,        // Timer for typewriter
      lorePauseTimer: 0,       // Pause between lines
      loreWaiting: false,      // Waiting for player click
    };
  }

  // ─── Check if a lore trigger should fire ───
  function checkTriggers(state) {
    for (const trigger of LORE_TRIGGERS) {
      if (state.wave === trigger.wave && !state.loreProgress.includes(trigger.id)) {
        return trigger;
      }
    }
    return null;
  }

  // ─── Start a Lore Event ───
  function startLore(state, trigger) {
    state.loreProgress.push(trigger.id);
    state.loreActive = trigger;
    state.loreDialogueIndex = 0;
    state.loreCharIndex = 0;
    state.loreCharTimer = 0;
    state.lorePauseTimer = 0;
    state.loreWaiting = false;
    state.mode = 'lore';  // Freeze gameplay

    // Show lore modal
    const modal = document.getElementById('lore-modal');
    if (modal) {
      modal.classList.remove('hidden');
      // Set visual effect class
      modal.className = 'overlay lore-overlay';
      if (trigger.visualEffect) modal.classList.add(trigger.visualEffect);
    }

    // Update speaker name
    _updateDialogueUI(state);
  }

  // ─── Update Typewriter Effect ───
  function update(state, dt) {
    if (!state.loreActive || state.mode !== 'lore') return;

    const trigger = state.loreActive;
    const line = trigger.dialogue[state.loreDialogueIndex];
    if (!line) return;

    // Pause between lines
    if (state.lorePauseTimer > 0) {
      state.lorePauseTimer -= dt * 1000;
      return;
    }

    // Typewriter effect
    if (state.loreCharIndex < line.text.length) {
      state.loreCharTimer += dt * 1000;
      const charSpeed = 35; // ms per character
      if (state.loreCharTimer >= charSpeed) {
        state.loreCharTimer = 0;
        state.loreCharIndex++;
        _updateDialogueUI(state);
      }
    } else if (!state.loreWaiting) {
      // Line fully displayed, wait for click/tap
      state.loreWaiting = true;
      const contEl = document.getElementById('lore-continue');
      if (contEl) contEl.classList.remove('hidden');
    }
  }

  // ─── Advance to Next Line (called on click) ───
  function advance(state) {
    if (!state.loreActive) return;

    const trigger = state.loreActive;
    const line = trigger.dialogue[state.loreDialogueIndex];

    // If still typing, skip to end
    if (state.loreCharIndex < line.text.length) {
      state.loreCharIndex = line.text.length;
      _updateDialogueUI(state);
      state.loreWaiting = true;
      const contEl = document.getElementById('lore-continue');
      if (contEl) contEl.classList.remove('hidden');
      return;
    }

    // Move to next line
    state.loreDialogueIndex++;
    state.loreCharIndex = 0;
    state.loreCharTimer = 0;
    state.loreWaiting = false;
    const contEl = document.getElementById('lore-continue');
    if (contEl) contEl.classList.add('hidden');

    // Check if dialogue is complete
    if (state.loreDialogueIndex >= trigger.dialogue.length) {
      endLore(state);
      return;
    }

    // Set pause before next line
    const prevLine = trigger.dialogue[state.loreDialogueIndex - 1];
    if (prevLine && prevLine.pause) {
      state.lorePauseTimer = prevLine.pause;
    }

    _updateDialogueUI(state);
  }

  // ─── End Lore Event ───
  function endLore(state) {
    const trigger = state.loreActive;

    // Hide modal
    const modal = document.getElementById('lore-modal');
    if (modal) modal.classList.add('hidden');

    state.loreActive = null;

    // Trigger after-event
    if (trigger.afterEvent === 'class_selection') {
      // Delegate to VoidClasses
      if (window.VoidClasses && !state.chosenClass) {
        window.VoidClasses.showSelection(state);
        return; // Don't resume playing yet
      }
    } else if (trigger.afterEvent === 'buff_choice' && trigger.buffChoices) {
      _showBuffChoice(state, trigger.buffChoices);
      return;
    }

    state.mode = 'playing';
  }

  // ─── Show Buff Choice UI ───
  function _showBuffChoice(state, choices) {
    state.mode = 'lore_choice';
    const modal = document.getElementById('lore-modal');
    if (!modal) { state.mode = 'playing'; return; }

    modal.classList.remove('hidden');
    modal.className = 'overlay lore-overlay';

    const speakerEl = document.getElementById('lore-speaker');
    const textEl = document.getElementById('lore-text');
    const contEl = document.getElementById('lore-continue');
    const choicesEl = document.getElementById('lore-choices');

    if (speakerEl) speakerEl.textContent = 'CHOOSE YOUR BLESSING';
    if (textEl) textEl.textContent = '';
    if (contEl) contEl.classList.add('hidden');

    if (choicesEl) {
      choicesEl.innerHTML = '';
      choicesEl.classList.remove('hidden');
      for (const choice of choices) {
        const btn = document.createElement('button');
        btn.className = 'lore-choice-btn';
        btn.innerHTML = `<span class="lore-choice-icon">${choice.icon}</span><span class="lore-choice-name">${choice.name}</span>`;
        btn.addEventListener('click', () => {
          // Apply effect
          if (choice.effect.dmgMult) state.dmgMult += choice.effect.dmgMult;
          if (choice.effect.maxHp) { state.maxHp += choice.effect.maxHp; state.hp = Math.min(state.hp + choice.effect.hp, state.maxHp); }
          if (choice.effect.xpMult) state.xpMult += choice.effect.xpMult;
          if (typeof playSound === 'function') playSound('achieve');
          modal.classList.add('hidden');
          choicesEl.classList.add('hidden');
          state.mode = 'playing';
        });
        choicesEl.appendChild(btn);
      }
    }
  }

  // ─── Update DOM ───
  function _updateDialogueUI(state) {
    if (!state.loreActive) return;
    const line = state.loreActive.dialogue[state.loreDialogueIndex];
    if (!line) return;

    const speakerEl = document.getElementById('lore-speaker');
    const textEl = document.getElementById('lore-text');

    const speakerNames = {
      VOID: '⦿ THE VOID',
      FORGOTTEN: '👻 THE FORGOTTEN ONE',
    };

    if (speakerEl) {
      speakerEl.textContent = speakerNames[line.speaker] || line.speaker;
      speakerEl.className = 'lore-speaker ' + (line.speaker || '').toLowerCase();
    }
    if (textEl) {
      textEl.textContent = line.text.substring(0, state.loreCharIndex);
    }
  }

  // ─── Public API ───
  window.VoidLore = {
    getDefaultState,
    checkTriggers,
    startLore,
    update,
    advance,
    endLore,
    LORE_TRIGGERS,
  };
})();
