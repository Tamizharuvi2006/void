# 🕳️ Void Ascent

**A roguelite wave-survival browser game.** Survive infinite waves of spectral enemies, auto-attack with devastating weapons, level up with random upgrades, and see how far you can ascend through the void.

> Built with pure HTML5 Canvas + vanilla JavaScript — **zero dependencies, no build step.**

---

## 🎮 How to Play

| Control | Action |
|---|---|
| **WASD / Arrow Keys** | Move your Void Walker |
| **Auto-Attack** | Weapons fire automatically at enemies |
| **Level-Up Cards** | Click to choose 1 of 3 random upgrades |
| **P** | Pause / Resume |
| **F** | Toggle fullscreen |

### Core Loop
1. **Move** to dodge enemies and position yourself
2. **Kill enemies** — they drop green XP gems
3. **Collect gems** — fill your XP bar
4. **Level up** — choose 1 of 3 random upgrades (new weapons, weapon levels, passive boosts)
5. **Survive** as many waves as possible
6. **Die** → earn Stardust → buy permanent upgrades → try again

---

## ⚔️ Weapons (8 Types)

Each weapon fires **automatically** and can be upgraded to **Level 5** through level-up cards.

| Icon | Weapon | Mechanic |
|---|---|---|
| 🔮 | **Void Bolt** | Fires aimed projectiles at the nearest enemy. Multi-shot at higher levels. |
| 💠 | **Orbit Shards** | Rotating crystals orbit around the player, damaging anything they touch. More shards at higher levels. |
| 💥 | **Nova Pulse** | Periodic AoE explosion centered on the player. Larger radius and more damage as it levels. |
| ❄️ | **Frost Ring** | Expanding ring of ice that slows and damages enemies it passes through. |
| ⚡ | **Lightning Chain** | A bolt that strikes the nearest enemy and bounces to nearby targets. More bounces at higher levels. |
| 💣 | **Phantom Mines** | Drops proximity mines behind the player that explode when enemies approach. |
| 🌀 | **Death Blossom** | Fires spinning blade projectiles in all directions simultaneously. |
| 🕳️ | **Gravity Well** | Creates a vortex that pulls enemies in and deals continuous damage. |

---

## 👾 Enemy Types (7)

Enemies scale in HP and damage with each wave.

| Enemy | Behavior |
|---|---|
| **Wraith** (Purple ◆) | Basic melee chaser — follows the player directly |
| **Specter** (Cyan ▲) | Fast but fragile — dashes toward the player quickly |
| **Shade** (Red ⬡) | Tanky and slow — absorbs lots of damage |
| **Crawler** (Green ●) | Tiny and fast — spawns in large swarms |
| **Archer** (Amber ■) | Ranged — keeps distance and shoots projectiles at the player |
| **Knight** (Orange ⛊) | Armored — charges at the player with devastating force |
| **Rift Lord** (Magenta ✦) | **BOSS** — appears every 5 waves. Massive HP, unique star-shaped form, HP bar displayed. |

---

## 📈 Passive Upgrades (In-Run)

Offered alongside weapons during level-up:

| Icon | Passive | Effect |
|---|---|---|
| ❤️ | Max HP +15 | Increases max health and heals 15 |
| ⚔️ | Damage +10% | All weapons deal 10% more damage |
| 👟 | Speed +8% | Move 8% faster |
| 📖 | XP Gain +15% | Collect 15% more XP from gems |
| 🧲 | Pickup Range +20% | Gems are attracted from further away |
| 💚 | Regen 1 HP/5s | Slowly regenerate health over time |
| 🛡️ | Armor +1 | Reduce all incoming damage by 1 |
| 🎯 | Crit Chance +5% | Chance to deal 1.8× damage (shown as gold numbers) |

---

## ✦ Meta-Progression (Permanent Upgrades)

Earn **Stardust (✦)** each run based on kills and waves survived. Spend it in the main menu shop on permanent upgrades that carry across all future runs:

| Upgrade | Max Level | Effect Per Level |
|---|---|---|
| **Vitality** | 10 | +10 Max HP |
| **Fury** | 10 | +5% Damage |
| **Swiftness** | 5 | +4% Movement Speed |
| **Wisdom** | 8 | +8% XP Gain |
| **Magnetism** | 5 | +15% Pickup Radius |
| **Resilience** | 5 | +1 Armor |

---

## 🧠 Design Psychology

This game is engineered for **continuous engagement** using proven game design principles:

| Mechanic | Psychology |
|---|---|
| **Core Loop** (kill → collect → level → choose) | Dopamine hits every 15-30 seconds |
| **Random Upgrade Cards** | Variable reward schedule — each level-up is exciting because you don't know what you'll get |
| **Short Runs (~5-10 min)** | "One more run" effect — short enough to always justify another attempt |
| **Persistent Stardust** | Zeigarnik effect — you're always "almost" at the next permanent upgrade |
| **Best Wave Record** | Loss aversion — you don't want to lose your high score |
| **Power Fantasy** | Start weak with 1 weapon, end as a screen-clearing god with 6+ weapons |
| **Boss Waves** | Milestone markers that create anticipation and achievement |
| **Escalating Difficulty** | Adaptive challenge keeps the game from feeling stale |

---

## 🛠 Tech Stack

- **HTML5 Canvas** — all gameplay rendering
- **Vanilla CSS** — dark neon cyberpunk UI with glassmorphism
- **Vanilla JavaScript** — ~1600 line game engine, zero dependencies
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
│   └── main.js         # Full game engine (~1600 lines)
├── tools/
│   └── static-server.js # Simple Node.js dev server
├── output/             # Screenshots from previous version
└── README.md           # This file
```

---

## 📜 License

MIT — do whatever you want with it.
