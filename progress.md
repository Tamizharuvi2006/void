# Void Ascent — Project Progress & Architecture

> **For agents**: This document is the single source of truth for the project's history, architecture, file map, and conventions. Read this before making changes.

---

## Project Identity

| Field | Value |
|---|---|
| **Name** | Void Ascent |
| **Genre** | Top-down roguelite wave-survival (Vampire Survivors-like) |
| **Tech** | Vanilla HTML5 Canvas + CSS + JavaScript — zero dependencies |
| **Repo** | https://github.com/Tamizharuvi2006/void.git |
| **Branch** | `main` |
| **Local Path** | `d:\projects\client\game\` |
| **Dev Server** | `node tools/static-server.js` → http://127.0.0.1:5173 |
| **Current Version** | v1.2 |

---

## File Map

```
d:\projects\client\game\
├── index.html           # Single-page HTML: canvas, HUD overlays, modals, menus
├── styles.css           # Full design system: dark neon cyberpunk, glassmorphism
├── src/
│   └── main.js          # Complete game engine (~1300 lines)
├── tools/
│   ├── static-server.js         # Node.js static file server (port 5173)
│   ├── playtest-actions.json    # Legacy test actions (from Rift Runner era)
│   └── playtest-controls.json   # Legacy test controls
├── output/web-game/     # Legacy screenshots from Rift Runner 3D
├── README.md            # Full feature documentation for GitHub
├── progress.md          # THIS FILE — project history & architecture
└── .gitignore
```

### Key Files in Detail

#### `index.html`
- Single `<canvas id="game">` fills viewport — all gameplay renders here
- HUD overlay: HP bar, XP bar, Ultimate bar, wave badge, timer, kill/stardust pills, combo display, mute button
- Weapon bar at bottom center (dynamic slots)
- Minimap `<canvas id="minimap">` at bottom-right (140×140)
- Vignette overlay `<div id="vignette">` with CSS danger pulse
- Screen flash `<div id="screen-flash">` for level-up/ultimate
- Wave announce `<div id="wave-announce">` with CSS animation
- Achievement toast container at top-right
- Mobile joystick zone (auto-shown via `@media (pointer: coarse)`)
- Level-up modal with 3 upgrade cards
- Game-over modal with 5 stats (wave, kills, level, best combo, stardust)
- Main menu with title, description, shop panel, records, controls hint
- Google Fonts: Orbitron (display) + Rajdhani (body)

#### `styles.css`
- CSS custom properties for full color palette (`--cyan`, `--magenta`, `--amber`, etc.)
- Fonts: `--font-display: Orbitron`, `--font-body: Rajdhani`
- Glassmorphism panels via `backdrop-filter: blur()`
- Animated upgrade cards with staggered entrance (`cardIn` keyframes)
- HP-reactive vignette (`.danger` at <40% HP, `.critical` at <20% with pulse animation)
- Combo display tiers (`.high` at 10+, `.ultra` at 30+ with pulse)
- Ultimate bar with `.ready` glow animation when full
- Mobile joystick styles (only shown on touch devices)
- Achievement toast slide-in animation
- Wave announce scale/fade animation (boss waves in magenta)
- Responsive breakpoints at 640px
- `prefers-reduced-motion` support

#### `src/main.js` — Engine Architecture

The engine is a single-file monolith organized into clear sections:

```
DOM References (lines 5-50)
Constants (lines 52-72)
Colors (lines 74-81)
Utilities (lines 83-88)
Sound System — Web Audio API (lines 90-130)
Save System — localStorage with v1→v2 migration (lines 132-165)
Meta Upgrades — 6 permanent upgrade defs (lines 167-175)
Achievement Definitions — 14 achievements (lines 177-192)
Weapon Definitions — 12 weapons with 5-level stat arrays (lines 194-260)
Passive Upgrade Definitions — 8 passives (lines 262-272)
Enemy Type Definitions — 7 enemy types (lines 274-285)
Wave Composition — scaling spawn formula (lines 287-297)
Game State Factory — newState() (lines 299-330)
Ambient Particles (lines 332-340)
Camera System — smooth follow + screen shake (lines 342-355)
Input System — keyboard + mobile joystick (lines 357-400)
Weapon System — fire functions for all 12 weapons (lines 402-530)
Entity Helpers — findNearest, dealDamage, killEnemy (lines 532-580)
Ultimate Ability (lines 582-615)
Particle System (lines 617-630)
Enemy Spawning & AI — 4 AI behaviors (lines 632-680)
Wave System (lines 682-710)
Combo System (lines 712-730)
Achievements (lines 732-755)
XP & Leveling (lines 757-775)
Upgrade Selection UI (lines 777-812)
Effects Update — nova, frost ring, mine, meteor, gravity well (lines 814-870)
Projectile Update (lines 872-895)
Gem (XP pickup) Update (lines 897-920)
Player Update — movement, regen, trail (lines 922-950)
Game Flow — startGame, gameOver, showMenu (lines 952-980)
UI Sync — HUD, weapon bar, shop, menu stats (lines 982-1035)
Rendering — all draw* functions (lines 1037-1250)
Game Loop — update() + frame() (lines 1252-1290)
Event Listeners & Init (lines 1292-1300)
```

---

## Game Systems

### 1. Weapon System
- 12 weapon types, each with 5-level stat progression
- Weapons fire **automatically** via cooldown timers
- Player starts with Void Bolt; new weapons acquired through level-up cards
- Special weapons: `orbit_shards` and `shadow_clones` are always-active (no cooldown fire, timer set to 999)
- Each weapon has a unique `fire*()` function

| ID | Name | Mechanic Type |
|---|---|---|
| `void_bolt` | Void Bolt | Targeted projectile |
| `orbit_shards` | Orbit Shards | Persistent orbiting entities |
| `nova_pulse` | Nova Pulse | Instant AoE around player |
| `frost_ring` | Frost Ring | Expanding ring effect |
| `lightning_chain` | Lightning Chain | Bouncing damage + visual chain |
| `phantom_mines` | Phantom Mines | Placed effect with proximity trigger |
| `death_blossom` | Death Blossom | Radial projectile burst |
| `gravity_well` | Gravity Well | Placed persistent AoE with pull |
| `plasma_beam` | Plasma Beam | Line-of-sight pierce (beam visual) |
| `meteor_strike` | Meteor Strike | Delayed AoE (warning → explosion) |
| `spectral_whip` | Spectral Whip | Arc damage in move direction |
| `shadow_clones` | Shadow Clones | Orbiting AI that fires projectiles |

### 2. Enemy AI
- 4 behavior types:
  - **Chase** (wraith, shade, crawler, boss): move directly toward player
  - **Ranged** (archer): maintain ~180px distance, shoot projectiles
  - **Charge** (knight): sprint at player when within range, then cooldown
  - **Boss** (rift lord): chase + unique 8-pointed star visual
- All enemies scale with wave number: `hp * (1 + wave * 0.12)`, `dmg * (1 + wave * 0.08)`
- Enemy hit = contact damage to player (respects armor, invulnerability timer)
- Slow debuff from Frost Ring reduces speed for a duration

### 3. Effects System
- Effects are stored in `state.effects[]` array
- Types: `nova`, `frost_ring`, `mine`, `gravity_well`, `meteor_warning`, `whip_arc`
- **IMPORTANT**: `meteor_warning` triggers its explosion BEFORE the splice check (fixed in v1.1 — this was a critical bug)
- Gravity wells process in a separate loop before the main effect loop (to pull enemies each tick)
- Mines have an `armTime` delay before they can trigger

### 4. Combo System
- `state.combo` increments on each kill
- `state.comboTimer` resets to `COMBO_DECAY` (3 seconds) on each kill
- Combo resets to 0 when timer expires
- Multiplier tiers: 5→×1.2, 10→×1.5, 20→×2.0, 50→×3.0
- Multiplier applies to: XP from gems, Stardust from kills
- UI tiers: hidden <3, normal 3-9, `.high` 10-29, `.ultra` 30+

### 5. Ultimate Ability
- `state.ultCharge` (0-100), filled by dealing damage (+0.04 per damage point) and taking hits (+8 per hit)
- Activated with SPACE (only during `playing` mode)
- Deals `80 * dmgMult * (1 + wave * 0.1)` to all enemies within radius 600
- Creates massive visual: dual nova rings, 70 particles, screen flash, camera shake 20

### 6. Achievement System
- 14 achievements defined in `ACHIEVEMENT_DEFS[]`
- Checked after: kills, wave start, level-up, upgrade applied, ultimate used
- Each achievement: `{ id, name, desc, icon, reward, check: state => boolean }`
- Unlocked achievements stored in `save.achievements[]` (persisted to localStorage)
- `state.runAchievements` Set prevents duplicate unlocks within a run
- Toast notification via DOM element with CSS animation (3.2s lifetime)

### 7. Sound System
- Web Audio API with `OscillatorNode` + `GainNode`
- 8 sound types: `hit`, `kill`, `pickup`, `levelup`, `hurt`, `ultimate`, `achieve`, `boss`
- Each sound uses different waveform (sine/square/sawtooth), frequency ramps, and gain envelopes
- `soundMuted` flag, toggle with M key or mute button
- `initAudio()` called on first game start (requires user interaction for AudioContext)

### 8. Save System
- Key: `void-ascent-save-v2` in localStorage
- Migrates from `void-ascent-save-v1` if v2 not found
- Persisted data: `stardust`, `bestWave`, `totalKills`, `totalRuns`, `achievements[]`, `upgrades{}`
- 6 meta upgrades: `maxHp`, `damage`, `speed`, `xpGain`, `pickupRadius`, `armor`
- Shop UI in main menu renders from `META_UPGRADES[]` definitions

### 9. Rendering Pipeline
- Draw order (back to front): background → grid → arena border → gems → effects → orbit shards → shadow clones → projectiles → player trail → enemies → player → particles → damage numbers
- Minimap renders separately on its own canvas (with `clearRect` first)
- All world positions use `worldToScreen()` which applies camera offset + shake
- Enemy culling: skip draw if screen position is outside viewport ± 50px
- Boss HP bars rendered inline above boss enemies

### 10. Camera
- Smooth follow via exponential lerp: `lerp(cam, player, 1 - pow(0.001, dt))`
- Screen shake: additive sin/cos offset, decays via `SHAKE_DECAY * dt * shake`
- Shake sources: enemy hit (8), boss death (16), nova pulse (6), ultimate (20)

### 11. Level-Up Flow
- XP collected → if `xp >= xpToNext` AND `mode === 'playing'` → trigger level-up
- **Only one level-up per gem collection** (prevents stacked modals, fixed in v1.1)
- Extra XP carries over; next gem can trigger another level-up
- 3 upgrade cards offered: prioritizes 1 weapon option, fills rest randomly
- Card types: `new_weapon`, `weapon_upgrade`, `passive`

---

## Project History

### Phase 1: Rift Runner 3D (Original)
- Forward-scrolling corridor runner with pseudo-3D perspective
- Dodge hazards, collect energy cores, reach exit gate
- 4 procedural worlds (Neon Rift, Ember Dunes, Cryo Circuit, Void Bloom)
- Save gates/checkpoints, upgrades, missions
- **User verdict**: "this game sucks... don't make it only like that moving"

### Phase 2: Void Ascent v1.0 (Complete Rewrite)
- Researched addictive game mechanics: Vampire Survivors, idle games, roguelites
- Identified core hooks: variable rewards, short runs, meta-progression, power fantasy
- Built from scratch as a top-down roguelite wave-survival game
- 8 weapons, 7 enemy types, wave system with bosses, XP/leveling, meta-progression shop
- Dark neon cyberpunk aesthetic with Orbitron/Rajdhani typography
- **Pushed to GitHub** as first commit

### Phase 3: Void Ascent v1.1
- Added 4 new weapons (12 total): Plasma Beam, Meteor Strike, Spectral Whip, Shadow Clones
- Added combo system with multiplier tiers
- Added ultimate ability (SPACE)
- Added 14 achievements with toast notifications
- Added Web Audio API sound effects (procedural, no files)
- Added minimap with gem/enemy/boss tracking
- Added mobile touch joystick
- Added visual enhancements: player trail, projectile trails, ambient particles, vignette, wave announce, screen flash
- **8 critical bugfixes** (see below)
- **Pushed to GitHub**

### Phase 4: Void Ascent v1.2 (Current)
- Added **Weapon Evolution** system (Level 6 ultimate forms)
- Added **Elite Enemies** with modifiers (Swift, Armored, Splitting, Teleporting, Berserker)
- Added **Treasure Chests** for burst healing and rewards
- Added **Arena Hazard Zones** (fire, ice, void)
- Added **Run Timer** and **DPS Tooltips**
- Added **Damage Number Stacking** for cleaner UI
- Replaced frame-based damage with accumulators for framerate independence
- Fixed input leak, double gameover, and various logic issues
- **Pushed to GitHub**

### Bugs Fixed in v1.1 & v1.2
**v1.1 Fixes:**
1. **Meteor Strike never exploded** — `fx.life <= 0` splice happened before the switch case ran. Fix: handle meteor detonation BEFORE the splice check.
2. **Minimap went solid black** — `fillRect` with alpha 0.6 accumulated. Fix: `clearRect` before drawing.
3. **Save data lost on upgrade** — v2 key didn't read v1 data. Fix: migration code.
4. **Diagonal movement 41% faster** — Keyboard diagonal wasn't normalized when joystick wasn't active. Fix: magnitude-based normalization for all input.
5. **Wave announce stacking** — Multiple `setTimeout` calls. Fix: track and clear timeout ID.
6. **Multi-levelup stacked modals** — `while` loop calling `triggerLevelUp()` re-entered modal show. Fix: only one level-up per gem, extras queue.
7. **Dead enemies hit by effects** — Frost ring and mine blast didn't check `e.dead`. Fix: added guards.
8. **Ultimate during non-playing** — Could fire during levelup/gameover. Fix: mode check + `e.preventDefault()`.

**v1.2 Fixes:**
9. **Gravity Well zero damage**: Replaced `dt`-based frame tick damage with an accumulator-based system.
10. **Double gameOver guard**: Added `state.mode = 'gameover'` to prevent multiple triggers.
11. **Orbit Shards dead enemy check**: Added explicit dead checks before applying damage.
12. **Weapon directional memory**: Track `state.lastMoveAngle` so directional weapons still function when standing still.
13. **Input state leak**: Input state arrays are completely cleared on run restart.
14. **Enemy arena boundary clamping**: Enemies strictly stay within `ARENA_HALF`.
15. **HP regen death check**: Prevented "zombie" HP regeneration when HP <= 0.
16. **Canvas DPR distance scaling**: Switched DOM measurements to logical `clientWidth/Height` for correct visual distance offsets.
17. **Nova Pulse sync**: Damage now expands matching the visual radius instead of instantaneous whole-screen hit.
18. **Wave breathing period**: Ensured no instant-spawning upon wave completion.
19. **Projectile Pierce logic**: Prevented projectiles from hitting the same enemy multiple times per frame.

---

## Conventions & Patterns

### Naming
- State fields: camelCase (`state.ultCharge`, `state.bestCombo`)
- Constants: UPPER_SNAKE (`MAX_ENEMIES`, `COMBO_DECAY`)
- Colors: `C.cyan`, `C.magenta` etc.
- DOM refs: camelCase (`levelupModal`, `comboDisplayEl`)

### Adding a New Weapon
1. Add definition to `WEAPON_DEFS[]` with `id`, `name`, `icon`, `maxLv`, `desc`, `stats[]` (5 level objects)
2. Create `fire<WeaponName>(wep)` function
3. Add case in `updateWeapons()` switch
4. If always-active (like orbit_shards), set `wep.timer = 999` and create a dedicated update function
5. If it has unique visuals, add a `draw<WeaponName>()` function and call it in `render()`

### Adding a New Enemy
1. Add to `ENEMY_TYPES` object with `name`, `hp`, `speed`, `dmg`, `xp`, `radius`, `color`, `shape`
2. Add shape rendering in `drawEnemies()` switch
3. Add to `getWaveEnemies()` spawn pool at appropriate wave threshold
4. If special AI, add behavior branch in `updateEnemies()`

### Adding an Achievement
1. Add to `ACHIEVEMENT_DEFS[]` with `id`, `name`, `desc`, `icon`, `reward`, `check: state => boolean`
2. Ensure `checkAchievements()` is called at the right moment (kill, wave, etc.)

### Effect Lifecycle
1. Push to `state.effects[]` with `type`, `x`, `y`, `life`, `maxLife`, and type-specific fields
2. `updateEffects()` decrements life, runs type-specific logic, splices when life ≤ 0
3. **If an effect must trigger on expiration**, handle it BEFORE the splice check (see meteor pattern)
4. `drawEffects()` renders based on type

---

## Known Limitations / Future Work
- No persistent leaderboard (only local best wave)
- No weapon evolution/fusion system (common in Vampire Survivors)
- Enemy variety could expand (teleporters, splitters, healers)
- No biome/environment changes (always the same dark arena)
- Minimap could show weapon effect ranges
- Could add daily challenges or seeded runs
- Sound uses simple oscillators — could be richer with multiple layered oscillators
- No gamepad support (only keyboard + touch)
- The `output/` folder contains legacy screenshots from Rift Runner 3D and can be cleaned up
