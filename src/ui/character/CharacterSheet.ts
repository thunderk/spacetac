module TK.SpaceTac.UI {
    export enum CharacterSheetMode {
        CREATION,
        EDITION,
        DISPLAY
    }

    /**
     * Character sheet, displaying ship characteristics
     */
    export class CharacterSheet {
        // Global sheet mode
        mode: CharacterSheetMode

        // Parent view
        view: BaseView

        // UI components builder
        container: UIContainer
        builder: UIBuilder

        // Close/validate button
        close_button: UIButton

        // X positions
        xshown = 0
        xhidden = -2000

        // Groups
        group_level: UIContainer
        group_portraits: UIContainer
        group_attributes: UIContainer
        group_actions: UIContainer
        group_upgrades: UIContainer

        // Currently displayed fleet
        fleet?: Fleet

        // Currently displayed ship
        ship?: Ship

        // Variable data
        personality?: CharacterPersonality
        image_portrait: UIImage
        text_model: UIText
        text_description: UIText
        text_name?: UIText
        text_level: UIText
        text_upgrade_points: UIText
        valuebar_experience: ValueBar

        constructor(view: BaseView, mode: CharacterSheetMode, onclose?: Function) {
            this.view = view;
            this.mode = mode;

            let builder = new UIBuilder(view);
            this.container = builder.container("character-sheet");

            builder = builder.in(this.container);
            let bg = builder.image("character-sheet");
            bg.setInteractive();

            this.builder = builder.styled({ color: "#dce9f9", size: 16, shadow: true });


            if (!onclose) {
                onclose = () => this.hide();
            }

            this.xhidden = -this.view.getWidth();
            this.container.x = this.xhidden;

            this.image_portrait = this.builder.image("common-transparent", 435, 271, true);

            this.builder.image("character-entry", 24, 740);

            this.group_portraits = this.builder.container("portraits", 90, 755);

            let model_bg = this.builder.image("character-ship-model", 434, 500, true);
            this.text_model = this.builder.in(model_bg).text("", 0, 0, { size: 28 });

            let description_bg = this.builder.image("character-ship-description", 434, 654, true);
            this.text_description = this.builder.in(description_bg).text("", 0, 0, { color: "#a0afc3", width: 510 });

            this.group_attributes = this.builder.container("attributes", 28, 28);
            this.group_actions = this.builder.container("actions", 698, 28);

            this.group_level = this.builder.container("level");
            let points_bg = this.builder.in(this.group_level).image("character-level-upgrades", 582, 986);
            this.builder.in(points_bg, builder => {
                builder.text("Upgrade points", 46, 10, { center: false, vcenter: false });
                builder.image("character-upgrade-point", 147, 59, true);
            });
            this.text_upgrade_points = this.builder.in(points_bg).text("", 106, 60, { size: 28 });

            let level_bg = this.builder.in(this.group_level).image("character-level-display", 434, 1032, true);
            this.text_level = this.builder.in(level_bg).text("", 0, 4, { size: 28 });
            this.valuebar_experience = this.builder.in(level_bg).valuebar("character-level-experience", -level_bg.width * 0.5, -level_bg.height * 0.5);

            this.group_upgrades = this.builder.container("upgrades");

            if (this.mode == CharacterSheetMode.CREATION) {
                this.builder.in(this.builder.image("character-section-title", 180, 30, false)).text("Ship", 80, 45, { color: "#dce9f9", size: 32 });

                this.personality = new CharacterPersonality(this.builder, 950, 30);

                this.close_button = this.builder.button("character-validate-creation", 140, 930, onclose,
                    "Validate the team, and start the campaign", undefined, {
                        hover_bottom: true,
                        text: "Validate team",
                        text_x: 295,
                        text_y: 57,
                        text_style: { size: 32, color: "#fff3df" }
                    }
                );

                this.builder.in(this.builder.image("character-creation-help", 970, 680), builder => {
                    builder.text("Compose your initial team by choosing a model for each ship, and customize the name and personality of the Artificial Intelligence pilot",
                        405, 150, { color: "#a3bbd9", size: 22, width: 500 });
                });

                this.builder.button("character-model-prev", 216, 500, () => this.changeModel(-1), "Select previous model", undefined, { center: true });
                this.builder.button("character-model-next", 654, 500, () => this.changeModel(1), "Select next model", undefined, { center: true });

                this.group_level.visible = false;
                this.group_upgrades.visible = false;
            } else {
                this.text_name = this.builder.in(this.builder.image("character-name-display", 434, 940, true)).text("", 0, 0, { size: 28 });

                this.close_button = this.builder.button("character-close-button", 1837, 0, onclose, "Close the character sheet");
            }

            this.refreshUpgrades();
            this.refreshAttributes();
            this.refreshActions();
        }

        /**
         * Move the sheet to a specific layer
         */
        moveToLayer(layer: UIContainer): void {
            layer.add(this.container);
        }

        /**
         * Check if the sheet should be interactive
         */
        isInteractive(): boolean {
            return this.ship ? (this.mode != CharacterSheetMode.DISPLAY && !this.ship.critical) : false;
        }

        /**
         * Change the ship model
         */
        changeModel(offset: number): void {
            if (this.mode == CharacterSheetMode.CREATION && this.ship) {
                let models = ShipModel.getDefaultCollection();

                let idx = models.map(model => model.code).indexOf(this.ship.model.code) + offset;
                if (idx < 0) {
                    idx = models.length - 1;
                } else if (idx >= models.length) {
                    idx = 0;
                }

                this.ship.setModel(models[idx]);
                this.refresh();
            }
        }

        /**
         * Refresh the ship information display
         */
        private refreshShipInfo(): void {
            if (this.ship) {
                let ship = this.ship;
                this.builder.change(this.image_portrait, `ship-${ship.model.code}-portrait`);
                if (this.text_name) {
                    this.text_name.setText(ship.name || "");
                }
                if (this.personality) {
                    this.personality.displayShip(ship);
                }
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

            if (!this.ship || this.mode == CharacterSheetMode.CREATION) {
                return;
            }
            let ship = this.ship;

            let initial = builder.image("character-initial", 970, 30);

            // Base equipment (level 1)
            builder.styled({ center: false, vcenter: false }).in(initial, builder => {
                builder.text("Base equipment", 32, 8, { color: "#e2e9d1" });

                builder.in(builder.container("attributes"), builder => {
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

                builder.in(builder.container("actions"), builder => {
                    let actions = ship.model.getActions(1, []);
                    actions.forEach(action => {
                        let button = builder.button("common-transparent", 0, 66, undefined, action.getEffectsDescription());

                        builder.in(button, builder => {
                            let icon = builder.image(`action-${action.code}`);
                            icon.setScale(0.1875);
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
                    color: ship.level.get() >= (i + 1) ? "#dce9f9" : "#293038"
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

            builder.image("character-ship-column-left", 0, 0);

            builder.text("Attributes", 74, 20, { color: "#a3bbd9" });

            if (this.ship) {
                let ship = this.ship;
                builder.in(builder.container("items"), builder => {
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

            builder.image("character-ship-column-right", 0, 0);

            builder.text("Actions", 74, 20, { color: "#a3bbd9" });

            if (this.ship) {
                let ship = this.ship;
                builder.in(builder.container("items"), builder => {
                    let actions = ship.actions.listAll().filter(action => !(action instanceof EndTurnAction));
                    actions.forEach(action => {
                        let button = builder.button(`action-${action.code}`, 24, 0, undefined,
                            action.getEffectsDescription());
                        button.setScale(0.375);
                    });
                    builder.distribute("y", 40, 688);
                });
            }
        }

        /**
         * Refresh the fleet display
         */
        private refreshFleet(): void {
            destroyChildren(this.group_portraits);

            if (this.fleet) {
                let builder = this.builder.in(this.group_portraits);
                this.fleet.ships.forEach((ship, idx) => {
                    let button: UIButton;
                    button = new CharacterPortrait(ship).draw(builder, 64 + idx * 140, 64, () => {
                        if (button) {
                            button.toggle(true, UIButtonUnicity.EXCLUSIVE_MIN);
                            this.ship = ship;

                            this.refreshShipInfo();
                            this.refreshActions();
                            this.refreshAttributes();
                            this.refreshUpgrades();
                        }
                    });

                    if (ship == this.ship) {
                        button.toggle(true);
                    }
                });
            }
        }

        /**
         * Check if the sheet is shown
         */
        isOpened(): boolean {
            return this.container.x != this.xhidden;
        }

        /**
         * Show the sheet for a given ship
         */
        show(ship: Ship, animate = true, sound = true) {
            this.ship = ship;
            this.fleet = ship.fleet;

            this.refreshShipInfo();
            this.refreshUpgrades();
            this.refreshAttributes();
            this.refreshActions();

            if (ship.fleet !== this.fleet || ship.fleet.ships.length != this.group_portraits.length) {
                this.refreshFleet();
            }

            if (sound) {
                this.view.audio.playOnce("ui-dialog-open");
            }

            if (animate) {
                this.view.tweens.add({
                    targets: this.container,
                    x: this.xshown,
                    duration: 400,
                    easing: 'Circ.easeInOut'
                });
            } else {
                this.container.x = this.xshown;
            }
        }

        /**
         * Hide the sheet
         */
        hide(animate = true) {
            this.view.audio.playOnce("ui-dialog-close");

            if (animate) {
                this.view.tweens.add({
                    targets: this.container,
                    x: this.xhidden,
                    duration: 400,
                    ease: 'Circ.easeInOut'
                });
            } else {
                this.container.x = this.xhidden;
            }
        }

        /**
         * Refresh the sheet display
         */
        refresh() {
            if (this.ship) {
                this.refreshShipInfo();
                this.refreshUpgrades();
                this.refreshAttributes();
                this.refreshActions();

                this.refreshFleet();
            }
        }
    }
}
