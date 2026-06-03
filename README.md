# 🕳️ Void Ascent

**A roguelite wave-survival browser game.** Survive infinite waves of spectral enemies, auto-attack with devastating weapons, level up with random upgrades, and see how far you can ascend through the void.

> Built with pure HTML5 Canvas + vanilla JavaScript — **zero dependencies, no build step.**

---

## 🎮 How to Play

| Control               | Action                                 |
| --------------------- | -------------------------------------- |
| **WASD / Arrow Keys** | Move your Void Walker                  |
| **Auto-Attack**       | Weapons fire automatically at enemies  |
| **Level-Up Cards**    | Click to choose 1 of 3 random upgrades |
| **SPACE**             | Activate Ultimate (when charged)       |
| **P**                 | Pause / Resume                         |
| **M**                 | Mute / Unmute sound                    |
| **F**                 | Toggle fullscreen                      |

### Core Loop

1. **Move** to dodge enemies and position yourself
2. **Kill enemies** — they drop green XP gems
3. **Collect gems** — fill your XP bar
4. **Level up** — choose 1 of 3 random upgrades (new weapons, weapon levels, passive boosts)
5. **Build combos** — kill enemies quickly for bonus XP and Stardust
6. **Charge your Ultimate** — dealing and receiving damage fills the meter; press SPACE to nuke
7. **Survive** as many waves as possible
8. **Die** → earn Stardust → buy permanent upgrades → try again

---

## ⚔️ Weapons (12 Types)

Each weapon fires **automatically** and can be upgraded to **Level 5** through level-up cards.

| Icon | Weapon              | Mechanic                                                                                               |
| ---- | ------------------- | ------------------------------------------------------------------------------------------------------ |
| 🔮   | **Void Bolt**       | Fires aimed projectiles at the nearest enemy. Multi-shot at higher levels.                             |
| 💠   | **Orbit Shards**    | Rotating crystals orbit around the player, damaging anything they touch. More shards at higher levels. |
| 💥   | **Nova Pulse**      | Periodic AoE explosion centered on the player. Larger radius and more damage as it levels.             |
| ❄️   | **Frost Ring**      | Expanding ring of ice that slows and damages enemies it passes through.                                |
| ⚡   | **Lightning Chain** | A bolt that strikes the nearest enemy and bounces to nearby targets. More bounces at higher levels.    |
| 💣   | **Phantom Mines**   | Drops proximity mines behind the player that explode when enemies approach.                            |
| 🌀   | **Death Blossom**   | Fires spinning blade projectiles in all directions simultaneously.                                     |
| 🕳️   | **Gravity Well**    | Creates a vortex that pulls enemies in and deals continuous damage.                                    |
| 🔥   | **Plasma Beam**     | Piercing laser that cuts through all enemies in a line.                                                |
| ☄️   | **Meteor Strike**   | Calls down a devastating AoE from the sky with a warning indicator.                                    |
| 🗡️   | **Spectral Whip**   | Sweeping arc attack in the direction you're moving.                                                    |
| 👤   | **Shadow Clones**   | Spectral copies orbit around you and fire bolts at enemies.                                            |

---

## 👾 Enemy Types (7)

Enemies scale in HP and damage with each wave.

| Enemy                     | Behavior                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| **Wraith** (Purple ◆)     | Basic melee chaser — follows the player directly                                         |
| **Specter** (Cyan ▲)      | Fast but fragile — dashes toward the player quickly                                      |
| **Shade** (Red ⬡)         | Tanky and slow — absorbs lots of damage                                                  |
| **Crawler** (Green ●)     | Tiny and fast — spawns in large swarms                                                   |
| **Archer** (Amber ■)      | Ranged — keeps distance and shoots projectiles at the player                             |
| **Knight** (Orange ⛊)     | Armored — charges at the player with devastating force                                   |
| **Rift Lord** (Magenta ✦) | **BOSS** — appears every 5 waves. Massive HP, unique star-shaped form, HP bar displayed. |

*(Note: Elite variants of these enemies can spawn with extra speed, armor, teleportation, or cloning abilities!)*

---

## 📈 Passive Upgrades (In-Run)

Offered alongside weapons during level-up:

| Icon | Passive           | Effect                                             |
| ---- | ----------------- | -------------------------------------------------- |
| ❤️   | Max HP +15        | Increases max health and heals 15                  |
| ⚔️   | Damage +10%       | All weapons deal 10% more damage                   |
| 👟   | Speed +8%         | Move 8% faster                                     |
| 📖   | XP Gain +15%      | Collect 15% more XP from gems                      |
| 🧲   | Pickup Range +20% | Gems are attracted from further away               |
| 💚   | Regen 1 HP/5s     | Slowly regenerate health over time                 |
| 🛡️   | Armor +1          | Reduce all incoming damage by 1                    |
| 🎯   | Crit Chance +5%   | Chance to deal 1.8× damage (shown as gold numbers) |

---

## ✦ Meta-Progression (Permanent Upgrades)

Earn **Stardust (✦)** each run based on kills and waves survived. Spend it in the main menu shop on permanent upgrades that carry across all future runs:

| Upgrade        | Max Level | Effect Per Level   |
| -------------- | --------- | ------------------ |
| **Vitality**   | 10        | +10 Max HP         |
| **Fury**       | 10        | +5% Damage         |
| **Swiftness**  | 5         | +4% Movement Speed |
| **Wisdom**     | 8         | +8% XP Gain        |
| **Magnetism**  | 5         | +15% Pickup Radius |
| **Resilience** | 5         | +1 Armor           |

---

## 🎁 Arena Events (Chests & Hazards)
- **Treasure Chests**: Spawn at certain milestones to grant huge burst healing and stardust.
- **Hazard Zones**: Keep moving! Fire, Ice, and Void zones randomly spawn on the arena floor and deal heavy damage if you stand in them.

---

## 🔥 Combo System

Kill enemies rapidly to build a **combo multiplier** that boosts both XP and Stardust:

| Combo     | Multiplier |
| --------- | ---------- |
| 5+ kills  | ×1.2       |
| 10+ kills | ×1.5       |
| 20+ kills | ×2.0       |
| 50+ kills | ×3.0       |

The combo resets after 3 seconds without a kill. Your best combo is tracked in the game-over screen.

---

## 💫 Ultimate Ability

- **Charge meter** fills as you deal and receive damage
- When full, press **SPACE** to unleash a devastating **Void Nova**
- Damages all enemies within a massive radius
- Dramatic screen flash, shake, and particle effects
- Scales with wave number and your damage multiplier

---

## 🏆 Achievements (14)

Unlock achievements to earn bonus Stardust:

| Achievement      | Requirement           | Reward |
| ---------------- | --------------------- | ------ |
| 🗡️ First Blood   | Kill your first enemy | +10 ✦  |
| 💯 Century       | 100 kills in one run  | +30 ✦  |
| ☠️ Slaughter     | 500 kills in one run  | +80 ✦  |
| 🌊 Rising Tide   | Reach wave 5          | +20 ✦  |
| 🕳️ Deep Void     | Reach wave 10         | +50 ✦  |
| 👑 Void Master   | Reach wave 20         | +120 ✦ |
| ⚔️ Rift Slayer   | Kill a Rift Lord boss | +40 ✦  |
| 🔥 Combo Starter | 10× combo             | +25 ✦  |
| 💥 Combo Master  | 30× combo             | +60 ✦  |
| 🔮 Armed & Ready | 4 weapons at once     | +35 ✦  |
| 💠 Arsenal       | 6 weapons at once     | +70 ✦  |
| ⬆️ Ascendant     | Reach level 10        | +25 ✦  |
| ✨ Transcendent  | Reach level 20        | +60 ✦  |
| 💫 Void Nova     | Use your ultimate     | +15 ✦  |

---

## 🔊 Sound System

Procedurally generated retro sound effects via the **Web Audio API** — no audio files needed:

- **Hit/shoot** sounds for weapon fire
- **Kill** confirmation bleeps
- **Pickup** chimes for XP gems
- **Level-up** ascending arpeggio
- **Hurt** feedback when taking damage
- **Boss spawn** rumbling warning
- **Achievement** unlock fanfare
- **Ultimate** activation whoosh

Press **M** to toggle mute.

---

## 📱 Mobile Support

- **Virtual joystick** appears automatically on touch devices
- Touch-optimized UI with larger buttons and cards
- Responsive layout adapts to any screen size

---

## 🗺️ Minimap

- Bottom-right corner shows the full arena
- Cyan dot = your position
- Colored dots = enemies (pulsing for bosses)
- Green dots = XP gems
- Rectangle = your current camera view

---

## 🎨 Visual Effects

- **Player motion trail** — glowing afterimage when moving
- **Projectile trails** — each bullet leaves a fading streak
- **Floating ambient particles** — drifting motes in cyan, violet, magenta
- **Screen vignette** — dark edges that pulse red when HP is critical
- **Death explosions** — expanding ring + particle burst on every kill
- **Lightning rendering** — jagged bolts with glow
- **Plasma beam** — thick laser with inner white core
- **Wave announce** — dramatic text animation for each wave
- **Screen flash** — brief white flash on level-up and ultimate
- **Damage numbers** — floating text, gold for crits

---

## 🧠 Design Psychology

This game is engineered for **continuous engagement** using proven game design principles:

| Mechanic                                        | Psychology                                             |
| ----------------------------------------------- | ------------------------------------------------------ |
| **Core Loop** (kill → collect → level → choose) | Dopamine hits every 15-30 seconds                      |
| **Random Upgrade Cards**                        | Variable reward schedule — each level-up is exciting   |
| **Combo System**                                | Flow state — encourages aggressive, risky play         |
| **Ultimate Ability**                            | Power fantasy — save it for the perfect moment         |
| **Short Runs (~5-10 min)**                      | "One more run" effect                                  |
| **Persistent Stardust**                         | Zeigarnik effect — always "almost" at the next upgrade |
| **Achievements**                                | Collection drive — completionists want them all        |
| **Power Fantasy**                               | Start with 1 weapon, end with 6+ filling the screen    |
| **Boss Waves**                                  | Milestone markers creating anticipation                |
| **Escalating Difficulty**                       | Adaptive challenge keeps the game from feeling stale   |

---

## 🛠 Tech Stack

- **HTML5 Canvas** — all gameplay rendering
- **Vanilla CSS** — dark neon cyberpunk UI with glassmorphism
- **Vanilla JavaScript** — ~1300 line game engine, zero dependencies
- **Web Audio API** — procedural sound synthesis
- **Google Fonts** — Orbitron (display) + Rajdhani (body)
- **localStorage** — persistent save data for meta-progression

---

## 🚀 Run Locally

```bash
# Option 1: Use the included dev server
node tools/static-server.js
# → Opens at http://127.0.0.1:5173

# Option 2: Just open the file directly
# Open index.html in any modern browser
```

No build step. No npm install. No framework. Just open and play.

---

## 📁 Project Structure

```
void/
├── index.html          # Game HTML with HUD, menus, modals
├── styles.css          # Dark neon cyberpunk design system
├── src/
│   └── main.js         # Full game engine (~1300 lines)
├── tools/
│   └── static-server.js # Simple Node.js dev server
└── README.md           # This file
```

---

## 📜 License

MIT — do whatever you want with it.
