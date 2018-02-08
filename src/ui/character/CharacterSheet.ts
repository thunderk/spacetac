module TK.SpaceTac.UI {
    /**
     * Character sheet, displaying ship characteristics
     */
    export class CharacterSheet extends Phaser.Image {
        // Globally interactive sheet (equipment can be moved, points upgraded)
        interactive = true

        // Parent view
        view: BaseView

        // UI components builder
        builder: UIBuilder

        // X positions
        xshown = 0
        xhidden = -2000

        // Groups
        group_portraits: Phaser.Group
        group_attributes: Phaser.Image
        group_actions: Phaser.Image
        group_upgrades: Phaser.Group

        // Close button
        close_button: Phaser.Button

        // Currently displayed fleet
        fleet?: Fleet

        // Currently displayed ship
        ship?: Ship

        // Variable data
        image_portrait: Phaser.Image
        text_model: Phaser.Text
        text_description: Phaser.Text
        text_name: Phaser.Text
        text_level: Phaser.Text
        text_upgrade_points: Phaser.Text
        valuebar_experience: ValueBar

        constructor(view: BaseView, onclose?: Function) {
            super(view.game, 0, 0, "character-sheet");

            this.view = view;
            this.builder = new UIBuilder(view, this).styled({ color: "#e7ebf0", size: 16, shadow: true });

            this.xhidden = -this.view.getWidth();
            this.x = this.xhidden;
            this.inputEnabled = true;

            if (!onclose) {
                onclose = () => this.hide();
            }
            this.close_button = this.builder.button("character-close-button", 1920, 0, onclose, "Close the character sheet");
            this.close_button.anchor.set(1, 0);

            this.image_portrait = this.builder.image("translucent", 435, 271, true);

            this.builder.image("character-entry", 28, 740);

            this.group_portraits = this.builder.group("portraits", 90, 755);

            let model_bg = this.builder.image("character-ship-model", 434, 500, true);
            this.text_model = this.builder.in(model_bg).text("", 0, 0, { size: 28 });

            let description_bg = this.builder.image("character-ship-description", 434, 654, true);
            this.text_description = this.builder.in(description_bg).text("", 0, 0, { color: "#a0afc3", width: 510 });

            this.group_attributes = this.builder.image("character-ship-column", 30, 30);
            this.group_actions = this.builder.image("character-ship-column", 698, 30);

            let name_bg = this.builder.image("character-name-display", 434, 940, true);
            this.text_name = this.builder.in(name_bg).text("", 0, 0, { size: 28 });

            this.builder.button("character-name-button", 656, 890, () => this.renamePersonality(), "Rename personality");

            let points_bg = this.builder.image("character-level-upgrades", 582, 986);
            this.builder.in(points_bg, builder => {
                builder.text("Upgrade points", 46, 10, { center: false, vcenter: false });
                builder.image("character-upgrade-point", 147, 59, true);
            });
            this.text_upgrade_points = this.builder.in(points_bg).text("", 106, 60, { size: 28 });

            let level_bg = this.builder.image("character-level-display", 434, 1032, true);
            this.text_level = this.builder.in(level_bg).text("", 0, 4, { size: 28 });
            this.valuebar_experience = this.builder.in(level_bg).valuebar("character-level-experience", -level_bg.width * 0.5, -level_bg.height * 0.5);

            this.group_upgrades = this.builder.group("upgrades");

            this.refreshUpgrades();
            this.refreshAttributes();
            this.refreshActions();
        }

        /**
         * Check if the sheet should be interactive
         */
        isInteractive(): boolean {
            return this.ship ? (this.interactive && !this.ship.critical) : false;
        }

        /**
         * Open a dialog to rename the ship's personality
         */
        renamePersonality(): void {
            // TODO
        }

        /**
         * Refresh the ship information display
         */
        private refreshShipInfo(): void {
            if (this.ship) {
                let ship = this.ship;
                this.builder.change(this.image_portrait, `ship-${ship.model.code}-portrait`);
                this.text_name.setText(ship.name || "");
                this.text_model.setText(ship.model.name);
                this.text_level.setText(`Level ${ship.level.get()}`);
                this.text_description.setText(ship.model.getDescription());
                this.text_upgrade_points.setText(`${ship.getAvailableUpgradePoints()}`);
                this.valuebar_experience.setValue(ship.level.getExperience(), ship.level.getNextGoal());
            }
        }

        /**
         * Refresh the upgrades display
         */
        private refreshUpgrades(): void {
            let builder = this.builder.in(this.group_upgrades);
            builder.clear();

            if (!this.ship) {
                return;
            }
            let ship = this.ship;

            let initial = builder.image("character-initial", 970, 30);

            // Base equipment (level 1)
            builder.styled({ center: false, vcenter: false }).in(initial, builder => {
                builder.text("Base equipment", 32, 8, { color: "#e2e9d1" });

                builder.in(builder.group("attributes"), builder => {
                    let effects = cfilter(ship.model.getEffects(1, []), AttributeEffect);
                    effects.forEach(effect => {
                        let button = builder.button(`attribute-${effect.attrcode}`, 0, 8, undefined,
                            `${capitalize(SHIP_VALUES_NAMES[effect.attrcode])} - ${SHIP_VALUES_DESCRIPTIONS[effect.attrcode]}`);

                        builder.in(button, builder => {
                            builder.text(`${effect.value}`, 56, 8, { size: 22 });
                        });
                    });
                    builder.distribute("x", 236, 870);
                });

                builder.in(builder.group("actions"), builder => {
                    let actions = ship.model.getActions(1, []);
                    actions.forEach(action => {
                        let button = builder.button("translucent", 0, 66, undefined, action.getEffectsDescription());

                        builder.in(button, builder => {
                            let icon = builder.image(`action-${action.code}`);
                            icon.scale.set(0.1875);
                            if (actions.length < 5) {
                                builder.text(`${action.name}`, 56, 12, { size: 16 });
                            }
                        });
                    });
                    builder.distribute("x", 28, 888);
                });
            });

            // Level number
            range(10).forEach(i => {
                builder.text(`${i + 1}`, 920, i == 0 ? 92 : (110 + i * 100), {
                    center: true,
                    vcenter: true,
                    size: 28,
                    color: ship.level.get() >= (i + 1) ? "#e7ebf0" : "#808285"
                });
            });

            // Level upgrades
            range(9).forEach(i => {
                builder.image("character-level-separator", 844, 154 + i * 100);

                let level = i + 2;
                let upgrades = ship.model.getLevelUpgrades(level);
                upgrades.forEach((upgrade, j) => {
                    let onchange = (selected: boolean) => {
                        this.refreshShipInfo();  // TODO Only upgrade points
                        this.refreshActions();
                        this.refreshAttributes();
                    };
                    new CharacterUpgrade(ship, upgrade, level).draw(builder, 970 + j * 315, 170 + i * 100,
                        this.isInteractive() ? onchange : undefined);
                });
            });
        }

        /**
         * Refresh the attributes display
         */
        private refreshAttributes(): void {
            let builder = this.builder.in(this.group_attributes);
            builder.clear();

            builder.text("Attributes", 74, 20, { color: "#a0afc3" });

            if (this.ship) {
                let ship = this.ship;
                builder.in(builder.group("items"), builder => {
                    keys(SHIP_ATTRIBUTES).forEach(attribute => {
                        let button = builder.button(`attribute-${attribute}`, 24, 0, undefined,
                            ship.getAttributeDescription(attribute));

                        builder.in(button).text(`${ship.getAttribute(attribute)}`, 78, 27, { size: 22 });
                    });
                    builder.distribute("y", 40, 688);
                });
            }
        }

        /**
         * Refresh the actions display
         */
        private refreshActions(): void {
            let builder = this.builder.in(this.group_actions);
            builder.clear();

            builder.text("Actions", 74, 20, { color: "#a0afc3" });

            if (this.ship) {
                let ship = this.ship;
                builder.in(builder.group("items"), builder => {
                    let actions = ship.actions.listAll().filter(action => !(action instanceof EndTurnAction));
                    actions.forEach(action => {
                        let button = builder.button(`action-${action.code}`, 24, 0, undefined,
                            action.getEffectsDescription());
                        button.scale.set(0.375);
                    });
                    builder.distribute("y", 40, 688);
                });
            }
        }

        /**
         * Update the fleet sidebar
         */
        updateFleet(fleet: Fleet) {
            if (fleet !== this.fleet || fleet.ships.length != this.group_portraits.length) {
                destroyChildren(this.group_portraits);
                this.fleet = fleet;

                let builder = this.builder.in(this.group_portraits);
                fleet.ships.forEach((ship, idx) => {
                    let button: UIButton
                    button = new CharacterPortrait(ship).draw(builder, 64 + idx * 140, 64, () => {
                        if (button) {
                            builder.select(button);
                            this.ship = ship;
                            this.refreshShipInfo();
                            this.refreshActions();
                            this.refreshAttributes();
                            this.refreshUpgrades();
                        }
                    });
                });
            }
        }

        /**
         * Check if the sheet is shown
         */
        isOpened(): boolean {
            return this.x != this.xhidden;
        }

        /**
         * Show the sheet for a given ship
         */
        show(ship: Ship, animate = true, sound = true, interactive?: boolean) {
            this.ship = ship;
            if (typeof interactive != "undefined") {
                this.interactive = interactive;
            }

            this.refreshShipInfo();
            this.refreshUpgrades();
            this.refreshAttributes();
            this.refreshActions();

            this.updateFleet(ship.fleet);

            if (sound) {
                this.view.audio.playOnce("ui-dialog-open");
            }

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xshown }, 400, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xshown;
            }
        }

        /**
         * Hide the sheet
         */
        hide(animate = true) {
            this.view.audio.playOnce("ui-dialog-close");

            if (animate) {
                this.game.tweens.create(this).to({ x: this.xhidden }, 400, Phaser.Easing.Circular.InOut, true);
            } else {
                this.x = this.xhidden;
            }
        }

        /**
         * Refresh the sheet display
         */
        refresh() {
            if (this.ship) {
                this.show(this.ship, false, false);
            }
        }
    }
}
