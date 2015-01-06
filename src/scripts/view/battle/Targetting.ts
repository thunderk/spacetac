module SpaceTac.View {
    // Targetting system
    //  Allows to pick a target for an action
    export class Targetting {
        // Access to the parent battle view
        private battleview: BattleView;

        // Source of the targetting
        private source: PIXI.Sprite;

        // Current target
        private target: Game.Target;

        // Signal to receive hovering events
        targetHovered: Phaser.Signal;

        // Signal to receive targetting events
        targetSelected: Phaser.Signal;

        // Target visual line
        line: Phaser.Graphics;

        // Create a default targetting mode
        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.targetHovered = new Phaser.Signal();
            this.targetSelected = new Phaser.Signal();

            // Visual effects
            if (battleview) {
                this.line = new Phaser.Graphics(battleview.game, 0, 0);
                battleview.arena.add(this.line);
            }

            this.source = null;
            this.target = null;
        }

        // Destructor
        destroy(): void {
            this.targetHovered.dispose();
            this.targetSelected.dispose();
            if (this.line) {
                this.line.destroy();
            }
        }

        // Update visual effects for current targetting
        update(): void {
            if (this.battleview) {
                if (this.source && this.target) {
                    this.line.clear();
                    this.line.lineStyle(3, 0xFFFFFF);
                    this.line.moveTo(this.source.x, this.source.y);
                    this.line.lineTo(this.target.x, this.target.y);
                    this.line.visible = true;
                } else {
                    this.line.visible = false;
                }
            }
        }

        // Set the source sprite for the targetting (for visual effects)
        setSource(sprite: PIXI.Sprite) {
            this.source = sprite;
        }

        // Set a target from a target object
        setTarget(target: Game.Target, dispatch: boolean = true):void {
            this.target = target;
            if (dispatch) {
                this.targetHovered.dispatch(this.target);
            }
            this.update();
        }

        // Set no target
        unsetTarget(dispatch: boolean = true): void {
            this.setTarget(null, dispatch);
        }

        // Set the current target ship (when hovered)
        setTargetShip(ship: Game.Ship, dispatch: boolean = true): void {
            this.setTarget(Game.Target.newFromShip(ship), dispatch);
        }

        // Set the current target in space (when hovered)
        setTargetSpace(x: number, y: number, dispatch: boolean = true): void {
            this.setTarget(Game.Target.newFromLocation(x, y));
        }

        // Validate the current target (when clicked)
        //  This will broadcast the targetSelected signal
        validate(): void {
            this.targetSelected.dispatch(this.target);
        }
    }
}