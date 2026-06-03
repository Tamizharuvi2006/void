# Void Ascent - Progress Report

## v1.2 Complete
All features and bugfixes for v1.2 have been fully implemented. 

### Resolved Bugs
1. **Gravity Well zero damage**: Replaced `dt`-based frame tick damage with an accumulator-based system.
2. **Double gameOver guard**: Added `state.mode = 'gameover'` to prevent multiple triggers.
3. **Orbit Shards dead enemy check**: Added explicit dead checks before applying damage.
4. **Weapon directional memory**: Track `state.lastMoveAngle` so directional weapons still function when standing still.
5. **Input state leak**: Input state arrays are completely cleared on run restart.
6. **Enemy arena boundary clamping**: Enemies strictly stay within `ARENA_HALF`.
7. **HP regen death check**: Prevented "zombie" HP regeneration when HP <= 0.
8. **Canvas DPR distance scaling**: Switched DOM measurements to logical `clientWidth/Height` for correct visual distance offsets.
9. **Nova Pulse sync**: Damage now expands matching the visual radius instead of instantaneous whole-screen hit.
10. **Wave breathing period**: Ensured no instant-spawning upon wave completion.
11. **Projectile Pierce logic**: Prevented projectiles from hitting the same enemy multiple times per frame.

### New Features (v1.2)
1. **Weapon Evolution**: Weapons hitting Level 6 (Max Level) now visually and functionally evolve into powerful ultimate variants with custom icons.
2. **Elite Enemies**: In later waves, some enemies spawn with elite modifiers (Swift, Armored, Splitting, Teleporting, Berserker).
3. **Treasure Chests**: Chests spawn during milestones, providing burst healing and dust rewards.
4. **Arena Hazard Zones**: Fire, ice, and void hazards appear randomly across the arena during waves.
5. **UI & UX Improvements**: 
   - A dedicated run timer tracks total elapsed game time.
   - Weapons display real-time accumulated DPS tracking on hover.
   - Damage numbers stack into a single larger value per target if hit repeatedly within 200ms.

## Next Steps for Future Upgrades (v1.3+)
- Save states / Loadouts for meta-progression
- More interactive arena events / mini-bosses
- Complex synergies between weapons (e.g. frost + lightning bonus)
