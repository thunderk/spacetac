module TK.SpaceTac.UI {
    /**
     * Icon to activate a ship ability
     */
    export class ActionIcon {
        // Link to parents
        bar: ActionBar
        view: BattleView

        // Container
        container: UIButton

        // Related ship
        ship: Ship

        // Related game action
        action: BaseAction

        // Current state
        fading = false
        disabled = true
        selected = false
        toggled = false
        targetting = false
        cooldown = 0

        // Images
        img_targetting!: UIImage
        img_bottom: UIImage
        img_cooldown_group: UIContainer
        img_cooldown: UIImage
        img_action: UIImage

        // Keyboard shortcut
        shortcut_container?: UIContainer

        // Power usage indicator
        power_container: UIContainer
        power_bg: UIImage
        power_text: UIText

        constructor(bar: ActionBar, ship: Ship, action: BaseAction, position: number) {
            this.bar = bar;
            this.view = bar.battleview;

            let builder = new UIBuilder(this.view);
            this.container = builder.button("battle-actionbar-frame-disabled", 0, 0, () => this.processClick(), filler => {
                ActionTooltip.fill(filler, this.ship, this.action, position);
                return true;
            }, undefined, { center: true, hover_bottom: true });
            builder = builder.in(this.container);

            this.ship = ship;
            this.action = action;

            // Action icon
            this.img_action = builder.image(`action-${action.code}`, 0, 0, true);
            this.img_action.setScale(0.35);
            this.img_action.setAlpha(0.2);

            // Hotkey indicator
            if (!(action instanceof EndTurnAction)) {
                this.shortcut_container = builder.container("shortcut", 0, -47);
                builder.in(this.shortcut_container, builder => {
                    builder.image("battle-actionbar-hotkey", 0, 0, true);
                    builder.text(`${(position + 1) % 10}`, 0, -4, {
                        size: 12, color: "#d1d1d1", shadow: true, center: true, vcenter: true
                    });
                });
            }

            // Bottom indicator
            this.img_bottom = builder.image("battle-actionbar-bottom-disabled", 0, 40, true);
            builder.in(this.img_bottom, builder => {
                this.img_targetting = builder.image("battle-actionbar-bottom-targetting", 0, 12, true);
                this.img_targetting.setVisible(false);
            });

            // Left indicator
            this.selected = false;
            this.power_container = builder.container("power", -46, -4, false);
            this.power_bg = builder.in(this.power_container).image("battle-actionbar-consumption-disabled", 0, 0, true);
            this.power_text = builder.in(this.power_container).text("", -2, 4, {
                size: 16, color: "#ffdd4b", shadow: true, center: true, vcenter: true
            });

            // Right indicator
            this.img_cooldown_group = builder.container("cooldown", 46, -4, action instanceof ToggleAction);
            this.img_cooldown = builder.in(this.img_cooldown_group).image("battle-actionbar-sticky-untoggled", 0, 0, true);

            // Initialize
            this.refresh();
        }

        /**
         * Destroy the icon
         */
        destroy(): void {
            this.container.destroy();
        }

        /**
         * Move to a given layer and position
         */
        moveTo(layer: UIContainer, x = 0, y = 0): void {
            layer.add(this.container);
            this.container.setPosition(x, y);
        }

        /**
         * Process a click event on the action icon
         * 
         * This will enter the action's targetting mode, waiting for a target or confirmation to apply the action
         */
        processClick(): void {
            if (!this.bar.interactive) {
                return;
            }
            if (this.action.checkCannotBeApplied(this.ship)) {
                return;
            }

            this.view.audio.playOnce("ui-button-click");

            if (this.selected) {
                this.bar.actionEnded();
                return;
            }

            // End any previously selected action
            this.bar.actionEnded();
            this.bar.actionStarted();

            let mode = this.action.getTargettingMode(this.ship);
            if (mode == ActionTargettingMode.SELF || mode == ActionTargettingMode.SELF_CONFIRM) {
                // Apply immediately on the ship
                // TODO Handle confirm
                this.processSelection(Target.newFromShip(this.ship));
            } else {
                // Switch to targetting mode (will apply action when a target is selected)
                this.view.enterTargettingMode(this.ship, this.action, mode);
            }
        }

        /**
         * Called when a target is selected
         * 
         * This will effectively apply the action
         */
        processSelection(target: Target): void {
            if (this.view.applyAction(this.action, target)) {
                this.bar.actionEnded();
            }
        }

        /**
         * Update the display elements
         * 
         * A currently targetting action may be passed, with power usage, to display potential fading and cooldown.
         */
        refresh(used: BaseAction | null = null, power_consumption = 0): void {
            let disabled = bool(this.action.checkCannotBeApplied(this.ship));
            let selected = (used === this.action);
            let toggled = (this.action instanceof ToggleAction) && this.ship.actions.isToggled(this.action);
            let fading = bool(this.action.checkCannotBeApplied(this.ship, this.ship.getValue("power") - power_consumption));
            let cooldown = this.ship.actions.getCooldown(this.action);
            let heat = cooldown.heat;
            let targetting = used !== null;
            if (this.action == used && cooldown.willOverheat()) {
                fading = true;
                heat = cooldown.cooling;
            }

            // inputs
            if (disabled != this.disabled) {
                //this.container.input.useHandCursor = !disabled;
            }

            // frame
            if (disabled != this.disabled || fading != this.fading) {
                let name = "battle-actionbar-frame-enabled";
                if (disabled) {
                    name = "battle-actionbar-frame-disabled";
                } else if (fading) {
                    name = "battle-actionbar-frame-fading";
                }
                this.container.setBaseImage(name);
            }

            // action icon
            if (disabled != this.disabled) {
                this.img_action.alpha = disabled ? 0.2 : 1;
            }

            // top
            if (this.shortcut_container && (targetting != this.targetting || disabled != this.disabled)) {
                this.view.animations.setVisible(this.shortcut_container, !targetting, 200, disabled ? 0.2 : 1);
            }

            // bottom
            if (disabled != this.disabled || toggled != this.toggled) {
                if (disabled) {
                    this.view.changeImage(this.img_bottom, "battle-actionbar-bottom-disabled");
                } else if (toggled) {
                    this.view.changeImage(this.img_bottom, "battle-actionbar-bottom-toggled");
                } else {
                    this.view.changeImage(this.img_bottom, "battle-actionbar-bottom-enabled");
                }
            }
            if (selected != this.selected) {
                this.view.animations.setVisible(this.img_targetting, selected, 200);
            }

            // left
            let cost = this.action.getPowerUsage(this.ship, null);
            this.power_container.setVisible(bool(cost));
            this.power_text.setText(`${Math.abs(cost)}\n${cost < 0 ? "+" : "-"}`);
            this.power_text.setColor((cost > 0) ? "#ffdd4b" : "#dbe748");
            this.power_text.setAlpha(disabled ? 0.2 : 1);
            if (disabled != this.disabled || selected != this.selected || toggled != this.toggled) {
                if (disabled) {
                    this.view.changeImage(this.power_bg, "battle-actionbar-consumption-disabled");
                } else if (toggled) {
                    this.view.changeImage(this.power_bg, "battle-actionbar-consumption-toggled");
                } else if (selected) {
                    this.view.changeImage(this.power_bg, "battle-actionbar-consumption-targetting");
                } else {
                    this.view.changeImage(this.power_bg, "battle-actionbar-consumption-enabled");
                }
            }

            // right
            if (toggled != this.toggled || disabled != this.disabled || heat != this.cooldown) {
                let builder = new UIBuilder(this.view, this.img_cooldown_group);
                destroyChildren(this.img_cooldown_group, 1);
                if (this.action instanceof ToggleAction) {
                    if (toggled) {
                        builder.change(this.img_cooldown, "battle-actionbar-sticky-toggled");
                    } else {
                        builder.change(this.img_cooldown, "battle-actionbar-sticky-untoggled");
                    }
                    this.img_cooldown.visible = !disabled;
                } else if (heat) {
                    if (disabled) {
                        builder.change(this.img_cooldown, "battle-actionbar-sticky-disabled");
                    } else {
                        builder.change(this.img_cooldown, "battle-actionbar-sticky-overheat");
                    }
                    range(Math.min(heat - 1, 4)).forEach(i => {
                        builder.image("battle-actionbar-cooldown-one", 0, 2 - i * 7);
                    });
                    builder.image("battle-actionbar-cooldown-front", -4, -20);
                    this.img_cooldown.visible = true;
                } else {
                    this.img_cooldown.visible = false;
                }
            }

            this.disabled = disabled;
            this.selected = selected;
            this.targetting = targetting;
            this.fading = fading;
            this.toggled = toggled;
            this.cooldown = heat;
        }
    }
}
