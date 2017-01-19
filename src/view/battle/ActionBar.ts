module SpaceTac.View {
    // Bar with all available action icons displayed
    export class ActionBar extends Phaser.Group {
        // Link to the parent battleview
        battleview: BattleView;

        // List of action icons
        actions: ActionIcon[];

        // Progress bar displaying action points
        actionpoints: ValueBar;
        actionpointstemp: ValueBar;

        // Tooltip to display hovered action info
        tooltip: ActionTooltip;

        // Current ship, whose actions are displayed
        ship: Game.Ship;

        // Create an empty action bar
        constructor(battleview: BattleView) {
            super(battleview.game);

            this.battleview = battleview;
            this.actions = [];
            this.ship = null;

            battleview.ui.add(this);

            // Background
            this.addChild(new Phaser.Image(this.game, 0, 0, "battle-actionbar", 0));

            // Action points progress bar
            this.actionpoints = new ValueBar(this.game, 190, 108, "battle-actionpointsempty");
            this.actionpoints.setBarImage("battle-actionpointspart");
            this.addChild(this.actionpoints);
            this.actionpointstemp = new ValueBar(this.game, 190, 108, "battle-actionpointsnone");
            this.actionpointstemp.setBarImage("battle-actionpointsfull");
            this.addChild(this.actionpointstemp);

            // Tooltip
            this.tooltip = new ActionTooltip(this);
            this.addChild(this.tooltip);
        }

        // Clear the action icons
        clearAll(): void {
            this.actions.forEach((action: ActionIcon) => {
                action.destroy();
            });
            this.actions = [];
            this.tooltip.setAction(null);
        }

        // Add an action icon
        addAction(ship: Game.Ship, action: Game.BaseAction): ActionIcon {
            var icon = new ActionIcon(this, 192 + this.actions.length * 88, 8, ship, action);
            this.actions.push(icon);

            this.tooltip.bringToTop();

            return icon;
        }

        // Update the action points indicator
        updateActionPoints(): void {
            if (this.ship) {
                this.actionpoints.setValue(this.ship.ap_current.current, this.ship.ap_current.maximal);
                this.actionpointstemp.setValue(this.ship.ap_current.current, this.ship.ap_current.maximal);
                this.actionpoints.visible = true;
                this.actionpointstemp.visible = true;
            } else {
                this.actionpoints.visible = false;
                this.actionpointstemp.visible = false;
            }
        }

        // Update fading flags
        //  ap_usage is the consumption of currently selected action
        updateFadings(ap_usage: number): void {
            var remaining_ap = this.ship.ap_current.current - ap_usage;
            if (remaining_ap < 0) {
                remaining_ap = 0;
            }

            this.actions.forEach((icon: ActionIcon) => {
                icon.updateFadingStatus(remaining_ap);
            });
            this.actionpointstemp.setValue(remaining_ap, this.ship.ap_current.maximal);
        }

        // Set action icons from selected ship
        setShip(ship: Game.Ship): void {
            this.clearAll();

            if (ship.getPlayer() === this.battleview.player) {
                var actions = ship.getAvailableActions();
                actions.forEach((action: Game.BaseAction) => {
                    this.addAction(ship, action);
                });

                this.ship = ship;
                this.game.tweens.create(this).to({ "alpha": 1 }, 400).start();
            } else {
                this.ship = null;
                this.game.tweens.create(this).to({ "alpha": 0.5 }, 400).start();
            }

            this.updateActionPoints();
        }

        // Called by an action icon when the action is selected
        actionStarted(): void {
        }

        // Called by an action icon when the action has been applied
        actionEnded(): void {
            this.updateActionPoints();
            this.actions.forEach((action: ActionIcon) => {
                action.resetState();
            });
            this.battleview.exitTargettingMode();
        }
    }
}
