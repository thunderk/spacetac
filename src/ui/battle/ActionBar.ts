module TK.SpaceTac.UI {
    // Bar with all available action icons displayed
    export class ActionBar extends Phaser.Group {
        // Link to the parent battleview
        battleview: BattleView

        // List of action icons
        actions: Phaser.Group
        action_icons: ActionIcon[]

        // Power indicator
        power: Phaser.Group
        power_icons!: Phaser.Group

        // Indicator of interaction disabled
        icon_waiting: Phaser.Image

        // Current ship, whose actions are displayed
        ship: Ship | null

        // Interactivity
        interactive = true;

        // Create an empty action bar
        constructor(battleview: BattleView) {
            super(battleview.game);

            this.battleview = battleview;
            this.action_icons = [];
            this.ship = null;

            battleview.layer_borders.add(this);

            let builder = new UIBuilder(battleview, this);

            // Background
            builder.image("battle-actionbar-background");

            // Group for actions
            this.actions = builder.group("actions", 86, 6);
            builder.in(this.actions).image("battle-actionbar-actions-background");

            // Power bar
            this.power = builder.group("power", 1466, 0);
            builder.in(this.power, builder => {
                builder.image("battle-actionbar-power-background", 0, 6);
                this.power_icons = builder.group("power icons", 50, 14);
            });

            // Playing ship
            builder.image("battle-actionbar-ship", 1735);

            // Waiting icon
            this.icon_waiting = new Phaser.Image(this.game, this.width / 2, this.height / 2, "common-waiting", 0);
            this.icon_waiting.anchor.set(0.5, 0.5);
            this.icon_waiting.animations.add("loop").play(9, true);
            this.add(this.icon_waiting);

            // Options button
            builder.button("battle-actionbar-button-menu", 0, 0, () => battleview.showOptions(), "Game options");

            // Log processing
            battleview.log_processor.register(diff => {
                if (!(diff instanceof BaseBattleShipDiff) || !this.ship || !this.ship.is(diff.ship_id)) {
                    return {};
                }

                if (diff instanceof ShipValueDiff && diff.code == "power") {
                    return {
                        background: async () => {
                            this.updatePower();
                            this.action_icons.forEach(action => action.refresh());
                        }
                    }
                } else if (diff instanceof ShipAttributeDiff && diff.code == "power_capacity") {
                    return {
                        background: async () => this.updatePower()
                    }
                } else if (diff instanceof ShipActionUsedDiff || diff instanceof ShipActionToggleDiff) {
                    return {
                        background: async () => this.action_icons.forEach(action => action.refresh())
                    }
                } else if (diff instanceof ShipCooldownDiff) {
                    return {
                        background: async () => {
                            let icons = this.action_icons.filter(icon => icon.action.is(diff.action));
                            icons.forEach(icon => icon.refresh());
                        }
                    }
                } else if (diff instanceof ShipChangeDiff) {
                    return {
                        background: async () => {
                            this.setShip(null);
                        }
                    }
                } else {
                    return {}
                }
            });

            battleview.log_processor.watchForShipChange(ship => {
                return {
                    background: async () => {
                        this.setShip(ship);
                    }
                }
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
                this.battleview.animations.setVisible(this.power, interactive, 100, 1, 0.3);
                this.battleview.animations.setVisible(this.actions, interactive, 100, 1, 0.3);
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

        /**
         * Remove all the action icons
         */
        clearAll(): void {
            this.action_icons.forEach(action => action.destroy());
            this.action_icons = [];
        }

        /**
         * Add an action icon
         */
        addAction(ship: Ship, action: BaseAction): ActionIcon {
            var icon = new ActionIcon(this, ship, action, this.action_icons.length);
            icon.moveTo(this.actions, 74 + this.action_icons.length * 138, 58);
            this.action_icons.push(icon);

            return icon;
        }

        /**
         * Update the power indicator
         */
        updatePower(move_power = 0, fire_power = 0): void {
            let power_capacity = this.ship ? this.ship.getAttribute("power_capacity") : 0;
            let power_value = this.ship ? this.ship.getValue("power") : 0;

            let current_power = this.power_icons.children.length;

            if (current_power > power_capacity) {
                destroyChildren(this.power_icons, power_capacity, current_power);
            } else if (power_capacity > current_power) {
                range(power_capacity - current_power).forEach(i => {
                    let x = (current_power + i) % 5;
                    let y = ((current_power + i) - x) / 5;
                    let image = this.battleview.newImage("battle-actionbar-power-used", x * 43, y * 22);
                    this.power_icons.add(image);
                });
            }

            let remaining_power = power_value - move_power - fire_power;
            this.power_icons.children.forEach((obj, idx) => {
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
            this.action_icons.forEach(icon => icon.refresh(action, move_power + fire_power));
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
        setShip(ship: Ship | null): void {
            this.clearAll();

            if (ship && this.battleview.player.is(ship.fleet.player) && ship.alive) {
                ship.actions.listAll().forEach(action => this.addAction(ship, action));
                this.ship = ship;
            } else {
                this.ship = null;
            }

            this.updatePower();
        }

        // Called by an action icon when the action is selected
        actionStarted(): void {
        }

        // Called by an action icon when the action has been applied
        actionEnded(): void {
            this.battleview.exitTargettingMode();

            this.updatePower();
            this.action_icons.forEach(action => action.refresh());
        }
    }
}
