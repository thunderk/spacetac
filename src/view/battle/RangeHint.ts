module TS.SpaceTac.View {
    // Graphical hints for movement and weapon range
    export class RangeHint extends Phaser.Group {
        // Link to the arena
        parent: Arena;

        // Displayed circle
        circle: Phaser.Graphics;

        // Stored information of primary circle, when secondary one overrides it
        primary: Phaser.Circle;

        constructor(parent: Arena) {
            super(parent.game, parent);

            this.parent = parent;

            this.circle = new Phaser.Graphics(this.game, 0, 0);
            this.addChild(this.circle);

            this.primary = null;
        }

        // Clear the primary hint
        clearPrimary(): void {
            this.primary = null;
            this.circle.visible = false;
        }

        // Clear the secondary hint
        clearSecondary(): void {
            if (this.primary) {
                this.draw(this.primary);
            } else {
                this.circle.visible = false;
            }
        }

        // Set currently selected action
        setPrimary(ship: Game.Ship, action: Game.BaseAction): void {
            var radius = action.getRangeRadius(ship);
            if (radius) {
                this.primary = new Phaser.Circle(ship.arena_x, ship.arena_y, radius * 2);
                this.draw(this.primary);
            } else {
                this.circle.visible = false;
            }
        }

        // Set currently hovered action
        setSecondary(ship: Game.Ship, action: Game.BaseAction): void {
            var radius = action.getRangeRadius(ship);
            if (radius) {
                this.draw(new Phaser.Circle(ship.arena_x, ship.arena_y, radius * 2));
            } else {
                this.circle.visible = false;
            }
        }

        // Draw a circle, hinting available range
        private draw(circle: Phaser.Circle): void {
            this.circle.clear();
            this.circle.lineStyle(5, 0x862080, 0.4);
            this.circle.beginFill(0xD860D0, 0.2);
            this.circle.drawCircle(circle.x, circle.y, circle.diameter);
            this.circle.endFill();
            this.circle.visible = true;
        }
    }
}
