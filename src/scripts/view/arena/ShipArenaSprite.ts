module SpaceTac.Arena {
    // Ship sprite in the arena (BattleView)
    export class ShipArenaSprite extends Phaser.Sprite {
        constructor(arena: Phaser.Group, ship: Game.Ship) {
            super(arena.game, ship.arena_x, ship.arena_y, "arena-ship");

            this.scale.set(0.1, 0.1);
            this.rotation = ship.arena_angle;
            this.anchor.set(0.5, 0.5);

            arena.add(this);
        }
    }
}
