module SpaceTac.View {
    "use strict";

    // Bar with all available action icons displayed
    export class ActionBar extends Phaser.Sprite {
        // Link to the parent battleview
        battleview: BattleView;

        // List of action icons
        actions: ActionIcon[];

        // Progress bar displaying action points
        actionpoints: ValueBar;

        // Current ship, whose actions are displayed
        ship: Game.Ship;

        // Create an empty action bar
        constructor(battleview: BattleView) {
            this.battleview = battleview;
            this.actions = [];
            this.ship = null;

            super(battleview.game, 170, 0, "ui-battle-actionbar");
            battleview.ui.add(this);

            // Action points progress bar
            this.actionpoints = new ValueBar(battleview.game, 119, 76, "ui-battle-actionpointsempty");
            this.actionpoints.setBarImage("ui-battle-actionpointsfull");
            this.addChild(this.actionpoints);
        }

        // Clear the action icons
        clearAll(): void {
            this.actions.forEach((action: ActionIcon) => {
                action.destroy();
            });
            this.actions = [];
        }

        // Add an action icon
        addAction(ship: Game.Ship, action: Game.BaseAction): ActionIcon {
            var icon = new ActionIcon(this, 110 + this.actions.length * 50, 25, ship, action);
            this.actions.push(icon);
            return icon;
        }

        // Update the action points indicator
        updateActionPoints(): void {
            if (this.ship) {
                this.actionpoints.setValue(this.ship.ap_current.current, this.ship.ap_current.maximal);
                this.actionpoints.visible = true;
            } else {
                this.actionpoints.visible = false;
            }
        }

        // Set action icons from selected ship
        setShip(ship: Game.Ship): void {
            var action_bar = this;
            this.clearAll();

            var actions = ship.getAvailableActions();
            actions.forEach((action: Game.BaseAction) => {
                action_bar.addAction(ship, action);
            });

            this.ship = ship;

            this.updateActionPoints();
        }

        // Called by an action icon when the action has been applied
        actionEnded(): void {
            this.updateActionPoints();
        }
    }
}
