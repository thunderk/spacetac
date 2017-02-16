module TS.SpaceTac.UI {
    // Bar with all available action icons displayed
    export class ActionBar extends Phaser.Group {
        // Link to the parent battleview
        battleview: BattleView;

        // List of action icons
        group: Phaser.Group;
        actions: ActionIcon[];

        // Progress bar displaying action points
        actionpoints: ValueBar;
        actionpointstemp: ValueBar;

        // Tooltip to display hovered action info
        tooltip: ActionTooltip;

        // Indicator of interaction disabled
        icon_waiting: Phaser.Image;

        // Current ship, whose actions are displayed
        ship: Ship;

        // Interactivity
        interactive = false;

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

            // Group for actions
            this.group = new Phaser.Group(this.game);
            this.addChild(this.group);

            // Waiting icon
            this.icon_waiting = new Phaser.Image(this.game, this.width / 2, 50, "battle-waiting", 0);
            this.icon_waiting.anchor.set(0.5, 0.5);
            this.icon_waiting.scale.set(0.5, 0.5);
            this.game.tweens.create(this.icon_waiting).to({ "angle": 360 }, 3000).loop().start();
            this.addChild(this.icon_waiting);

            // Tooltip
            this.tooltip = new ActionTooltip(this);
            this.addChild(this.tooltip);

            // Key bindings
            battleview.inputs.bind(Phaser.Keyboard.ESC, "Cancel action", () => this.actionEnded());
            battleview.inputs.bind(Phaser.Keyboard.SPACEBAR, "End turn", () => this.keyActionPressed(-1));
            battleview.inputs.bind(Phaser.Keyboard.ONE, "Action 1", () => this.keyActionPressed(0));
            battleview.inputs.bind(Phaser.Keyboard.TWO, "Action 2", () => this.keyActionPressed(1));
            battleview.inputs.bind(Phaser.Keyboard.THREE, "Action 3", () => this.keyActionPressed(2));
            battleview.inputs.bind(Phaser.Keyboard.FOUR, "Action 4", () => this.keyActionPressed(3));
            battleview.inputs.bind(Phaser.Keyboard.FIVE, "Action 5", () => this.keyActionPressed(4));
            battleview.inputs.bind(Phaser.Keyboard.SIX, "Action 6", () => this.keyActionPressed(5));
            battleview.inputs.bind(Phaser.Keyboard.SEVEN, "Action 7", () => this.keyActionPressed(6));
            battleview.inputs.bind(Phaser.Keyboard.EIGHT, "Action 8", () => this.keyActionPressed(7));
            battleview.inputs.bind(Phaser.Keyboard.NINE, "Action 9", () => this.keyActionPressed(8));
            battleview.inputs.bind(Phaser.Keyboard.ZERO, "Action 10", () => this.keyActionPressed(9));
        }

        /**
         * Set the interactivity state
         */
        setInteractive(interactive: boolean) {
            this.interactive = interactive;

            Animation.setVisibility(this.game, this.icon_waiting, !this.interactive, 100);
        }

        /**
         * Called when an action shortcut key is pressed
         */
        keyActionPressed(position: number) {
            if (this.interactive) {
                if (position < 0) {
                    this.actions[this.actions.length - 1].processClick();
                } else if (position < this.actions.length) {
                    this.actions[position].processClick();
                }
            }
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
        addAction(ship: Ship, action: BaseAction): ActionIcon {
            var icon = new ActionIcon(this, 192 + this.actions.length * 88, 8, ship, action);
            this.actions.push(icon);

            this.tooltip.bringToTop();

            return icon;
        }

        // Update the action points indicator
        updateActionPoints(): void {
            if (this.ship) {
                this.actionpoints.setValue(this.ship.values.power.get(), this.ship.attributes.power_capacity.get());
                this.actionpointstemp.setValue(this.ship.values.power.get(), this.ship.attributes.power_capacity.get());
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
            var remaining_ap = this.ship.values.power.get() - ap_usage;
            if (remaining_ap < 0) {
                remaining_ap = 0;
            }

            this.actions.forEach((icon: ActionIcon) => {
                icon.updateFadingStatus(remaining_ap);
            });
            this.actionpointstemp.setValue(remaining_ap, this.ship.attributes.power_capacity.get());
        }

        // Set action icons from selected ship
        setShip(ship: Ship): void {
            this.clearAll();

            if (ship.getPlayer() === this.battleview.player && ship.alive) {
                var actions = ship.getAvailableActions();
                actions.forEach((action: BaseAction) => {
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
