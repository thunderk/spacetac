module SpaceTac.View {
    // Bar with all available action icons displayed
    export class ActionBar extends Phaser.Group {
        // Link to the parent battleview
        battleview: BattleView;

        // List of action icons
        actions: ActionIcon[];

        // Create an empty action bar
        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.actions = [];

            super(battleview.game, battleview.ui);
            battleview.ui.add(this);

            this.update();
        }

        // Update the bar status (and position)
        update() {
            super.update();

            this.x = 100;
        }

        // Clear the action icons
        clearAll(): void {
            this.actions.forEach((action) => {
                action.destroy();
            });
            this.actions = [];
        }

        // Add an action icon
        addAction(ship: Game.Ship, action: Game.BaseAction): ActionIcon {
            var icon = new ActionIcon(this, this.actions.length * 50, 0, ship, action);
            this.actions.push(icon);
            return icon;
        }

        // Set action icons from selected ship
        setShip(ship: Game.Ship): void {
            var action_bar = this;
            this.clearAll();

            var actions = ship.getAvailableActions();
            actions.forEach((action) => {
                action_bar.addAction(ship, action);
            });
        }
    }
}