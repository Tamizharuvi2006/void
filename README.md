# Void Ascent

A fast-paced, wave-based roguelite survival game built entirely in Vanilla JS and HTML5 Canvas.

## Features (As of v1.2)
- **12 Unique Weapons**: From homing Void Bolts to the devastating Meteor Strike.
- **Weapon Evolutions**: Upgrade weapons to maximum level to unlock powerful evolved forms.
- **Dynamic Upgrades**: Rogue-lite draft system providing weapons and passive boosts.
- **Meta Progression**: Earn Stardust during runs to buy permanent upgrades (HP, Damage, Speed, etc.).
- **Elite Enemies**: Face off against special foes with enhanced abilities like teleportation and splitting.
- **Arena Hazards & Chests**: Navigate through elemental hazard zones and hunt down treasure chests for massive rewards.
- **Rich Visuals**: Pure canvas rendering with particles, glow effects, post-processing damage flashes, and a dynamic mini-map.
- **Audio Synthesis**: Zero-dependency procedural sound effects using the Web Audio API.

## How to Play
1. **Move**: Use `W, A, S, D` or `Arrow Keys`.
2. **Survive**: Avoid enemies. Weapons auto-fire based on cooldowns.
3. **Level Up**: Collect EXP gems dropped by defeated enemies.
4. **Ultimate**: Press `Spacebar` when your Ultimate charge (cyan bar) is full to unleash a massive blast.
5. **Upgrade**: Spend Stardust in the main menu to purchase permanent passive boosts.

## Architecture & Codebase
The game is completely standalone with zero external libraries or dependencies.
- `index.html`: Holds the game container, UI overlays, and menus.
- `styles.css`: Uses pure CSS variables for theming, animations, and glassmorphic UI.
- `src/main.js`: Contains the entire engine (Game Loop, Rendering, Web Audio, Entities, Weapons).

### Custom Engine Features
- **Canvas DPR Scaling**: Supports high-DPI (Retina) displays.
- **State Machine**: Completely decoupled state object (`state`) allows for easy restarts and resets without page reloads.
- **Entity Component System (Lite)**: Entities are simple JS objects processed in bulk by tight loops for maximum performance.
- **Procedural Audio**: No MP3/WAV files. All sounds are generated via `AudioContext` oscillators.
