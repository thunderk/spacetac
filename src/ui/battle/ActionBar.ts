module TK.SpaceTac.UI {
    // Bar with all available action icons displayed
    export class ActionBar extends Phaser.Group {
        // Link to the parent battleview
        battleview: BattleView;

        // List of action icons
        actions: Phaser.Group;
        action_icons: ActionIcon[];

        // Power bar
        power: Phaser.Group;

        // Indicator of interaction disabled
        icon_waiting: Phaser.Image;

        // Current ship, whose actions are displayed
        ship: Ship | null;
        ship_power_capacity: number;
        ship_power_value: number;

        // Interactivity
        interactive = true;

        // Create an empty action bar
        constructor(battleview: BattleView) {
            super(battleview.game);

            this.battleview = battleview;
            this.action_icons = [];
            this.ship = null;

            battleview.layer_borders.add(this);

            // Background
            this.add(new Phaser.Image(this.game, 0, 0, "battle-actionbar-background", 0));

            // Power bar
            this.power = this.game.add.group();
            this.power.position.set(1600, 14);
            this.add(this.power);

            // Group for actions
            this.actions = new Phaser.Group(this.game);
            this.add(this.actions);

            // Waiting icon
            this.icon_waiting = new Phaser.Image(this.game, this.width / 2, this.height / 2, "common-waiting", 0);
            this.icon_waiting.anchor.set(0.5, 0.5);
            this.icon_waiting.animations.add("loop").play(9, true);
            this.add(this.icon_waiting);

            // Options button
            let button = battleview.add.button(1841, 0, "battle-actionbar-button-menu", () => battleview.showOptions(), null, 1, 0, 0, 1, this);
            battleview.tooltip.bindStaticText(button, "Game options");

            // Key bindings
            battleview.inputs.bind("Escape", "Cancel action", () => this.actionEnded());
            battleview.inputs.bind(" ", "End turn", () => this.keyActionPressed(-1));

            // Log processing
            battleview.log_processor.register(event => {
                if (event instanceof ShipChangeEvent) {
                    this.setShip(event.new_ship);
                } else if (event instanceof ValueChangeEvent) {
                    if (event.ship == this.ship) {
                        if (event.value.name == SHIP_ATTRIBUTES.power_capacity.name) {
                            this.ship_power_capacity = event.value.get();
                            this.updatePower();
                        } else if (event.value.name == SHIP_VALUES.power.name) {
                            this.ship_power_value = event.value.get();
                            this.updatePower();
                        }
                    }
                }
                return 0;
            });

            this.setInteractive(false);
        }

        /**
         * Check if an action is selected
         */
        hasActionSelected(): boolean {
            return any(this.action_icons, icon => icon.selected);
        }

        /**
         * Set the interactivity state
         */
        setInteractive(interactive: boolean) {
            if (this.interactive != interactive) {
                this.interactive = interactive;

                this.battleview.animations.setVisible(this.icon_waiting, !this.interactive, 100);
                this.battleview.animations.setVisible(this.actions, interactive, 100, 1, 0.2);
            }
        }

        /**
         * Called when an action shortcut key is pressed
         */
        keyActionPressed(position: number) {
            if (this.interactive) {
                if (position < 0) {
                    this.action_icons[this.action_icons.length - 1].processClick();
                } else if (position < this.action_icons.length - 1) {
                    this.action_icons[position].processClick();
                }
            }
        }

        // Clear the action icons
        clearAll(): void {
            this.action_icons.forEach((action: ActionIcon) => {
                action.destroy();
            });
            this.action_icons = [];
        }

        // Add an action icon
        addAction(ship: Ship, action: BaseAction): ActionIcon {
            var icon = new ActionIcon(this, 170 + this.action_icons.length * 124, 2, ship, action, this.action_icons.length);
            this.action_icons.push(icon);

            return icon;
        }

        /**
         * Update the power indicator
         */
        updatePower(move_power = 0, fire_power = 0): void {
            let current_power = this.power.children.length;
            let power_capacity = this.ship_power_capacity;

            if (current_power > power_capacity) {
                range(current_power - power_capacity).forEach(i => {
                    this.power.removeChildAt(current_power - 1 - i)
                });
                //this.power.removeChildren(ship_power, current_power);  // TODO bugged in phaser 2.6
            } else if (power_capacity > current_power) {
                range(power_capacity - current_power).forEach(i => {
                    let x = (current_power + i) % 5;
                    let y = ((current_power + i) - x) / 5;
                    let image = this.battleview.newImage("battle-actionbar-power-used", x * 43, y * 22);
                    this.power.add(image);
                });
            }

            let power_value = this.ship_power_value;
            let remaining_power = power_value - move_power - fire_power;
            this.power.children.forEach((obj, idx) => {
                let img = <Phaser.Image>obj;
                if (idx < remaining_power) {
                    this.battleview.changeImage(img, "battle-actionbar-power-available");
                } else if (idx < remaining_power + move_power) {
                    this.battleview.changeImage(img, "battle-actionbar-power-move");
                } else if (idx < power_value) {
                    this.battleview.changeImage(img, "battle-actionbar-power-fire");
                } else {
                    this.battleview.changeImage(img, "battle-actionbar-power-used");
                }
            });
        }

        /**
         * Temporarily set current action power usage.
         * 
         * When an action is selected, this will fade the icons not available after the action would be done.
         * This will also highlight power usage in the power bar.
         * 
         * *move_power* and *fire_power* is the consumption of currently selected action/target.
         */
        updateSelectedActionPower(move_power: number, fire_power: number, action: BaseAction): void {
            var remaining_ap = this.ship ? (this.ship.getValue("power") - move_power - fire_power) : 0;
            if (remaining_ap < 0) {
                remaining_ap = 0;
            }

            this.action_icons.forEach(icon => {
                icon.updateFadingStatus(remaining_ap, action);
            });
            this.updatePower(move_power, fire_power);
        }

        /**
         * Temporarily set power status for a given move-fire simulation
         */
        updateFromSimulation(action: BaseAction, simulation: MoveFireResult) {
            if (simulation.complete) {
                this.updateSelectedActionPower(simulation.total_move_ap, simulation.total_fire_ap, action);
            } else {
                this.updateSelectedActionPower(0, 0, action);
            }
        }

        /**
         * Set the bar to display a given ship
         */
        setShip(ship: Ship): void {
            this.clearAll();

            if (ship.getPlayer() === this.battleview.player && ship.alive) {
                var actions = ship.getAvailableActions();
                actions.forEach((action: BaseAction) => {
                    this.addAction(ship, action);
                });

                this.ship = ship;
                this.ship_power_capacity = ship.getAttribute("power_capacity");
                this.ship_power_value = ship.getValue("power");
            } else {
                this.ship = null;
                this.ship_power_capacity = 0;
                this.ship_power_value = 0;
            }

            this.updatePower();
            this.setInteractive(this.ship != null);
        }

        // Called by an action icon when the action is selected
        actionStarted(): void {
        }

        // Called by an action icon when the action has been applied
        actionEnded(): void {
            // TODO Lock interactivity until animation is ended
            this.updatePower();
            this.action_icons.forEach((action: ActionIcon) => {
                action.resetState();
            });
            this.battleview.exitTargettingMode();
        }
    }
}
