module SpaceTac.View {
    // Icon to activate a ship capability (move, fire...)
    export class ActionIcon extends Phaser.Button {

        // Link to the parent battle view
        battleview: BattleView;

        // Related ship
        ship: Game.Ship;

        // Related game action
        action: Game.BaseAction;

        // Create an icon for a single ship action
        constructor(bar: ActionBar, x: number, y:number, ship: Game.Ship, action: Game.BaseAction) {
            this.battleview = bar.battleview;
            this.ship = ship;
            this.action = action;

            super(bar.game, x, y, 'action-' + action.code);
            bar.add(this);

            this.onInputUp.add(() => {
                this.processClick();
            }, this);
        }

        // Process a click event on the action icon
        processClick() {
            console.log("Action started", this.action);

            var targetting = this.battleview.enterTargettingMode();
            targetting.targetSelected.add(this.processTarget, this);
        }

        // Receive a target for the action
        processTarget(target: Game.Target) {
            console.log("Action target", this.action, target);

            this.action.apply(this.battleview.battle, this.ship, target);
        }
    }
}