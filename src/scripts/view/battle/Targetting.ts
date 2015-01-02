module SpaceTac.View {
    // Targetting system
    //  Allows to pick a target for an action
    export class Targetting {
        // Access to the parent battle view
        private battleview: BattleView;

        // Current target
        private target: Game.Target;

        // Signal to receive hovering events
        targetHovered: Phaser.Signal;

        // Signal to receive targetting events
        targetSelected: Phaser.Signal;

        // Create a default targetting mode
        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.targetHovered = new Phaser.Signal();
            this.targetSelected = new Phaser.Signal();
        }

        // Destructor
        destroy(): void {
            this.targetHovered.dispose();
            this.targetSelected.dispose();
        }

        // Set the current target ship (when hovered)
        setTargetShip(ship: Game.Ship): void {
            this.target = Game.Target.newFromShip(ship);
            this.targetHovered.dispatch(this.target);
        }

        // Set the current target in space (when hovered)
        setTargetSpace(x: number, y: number): void {
            this.target = Game.Target.newFromLocation(x, y);
            this.targetHovered.dispatch(this.target);
        }

        // Validate the current target (when clicked)
        //  This will broadcast the targetSelected signal
        validate(): void {
            this.targetSelected.dispatch(this.target);
        }
    }
}