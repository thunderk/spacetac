module TK.SpaceTac.UI {
    /**
     * Icon to activate a ship ability
     */
    export class ActionIcon {
        // Link to parents
        bar: ActionBar
        view: BattleView

        // Container
        container: Phaser.Button

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
        img_targetting!: Phaser.Image
        img_top: Phaser.Image | null = null
        img_bottom: Phaser.Image
        img_power: Phaser.Image
        img_sticky: Phaser.Image
        img_action: Phaser.Image

        // Indicators
        text_power!: Phaser.Text

        constructor(bar: ActionBar, ship: Ship, action: BaseAction, position: number) {
            this.bar = bar;
            this.view = bar.battleview;

            let info = this.view.getImageInfo("battle-actionbar-frame-disabled");
            this.container = this.view.add.button(0, 0, info.key, () => this.processClick(), undefined, info.frame, info.frame);
            this.container.anchor.set(0.5);
            this.container.input.useHandCursor = false;

            this.ship = ship;
            this.action = action;

            let builder = new UIBuilder(this.view, this.container);

            // Action icon
            this.img_action = builder.image([`action-${action.code}`, `equipment-${action.equipment ? action.equipment.code : "---"}`]);
            this.img_action.anchor.set(0.5);
            this.img_action.scale.set(0.35);
            this.img_action.alpha = 0.2;

            // Hotkey indicator
            if (!(action instanceof EndTurnAction)) {
                this.img_top = builder.image("battle-actionbar-hotkey", 0, -47);
                this.img_top.anchor.set(0.5);
                builder.in(this.img_top, builder => {
                    builder.text(`${(position + 1) % 10}`, 0, 0, {
                        size: 12, color: "#d1d1d1", shadow: true, center: true, vcenter: true
                    });
                });
            }

            // Bottom indicator
            this.img_bottom = builder.image("battle-actionbar-bottom-disabled", 0, 40);
            this.img_bottom.anchor.set(0.5);
            builder.in(this.img_bottom, builder => {
                this.img_targetting = builder.image("battle-actionbar-bottom-targetting", 0, 12);
                this.img_targetting.anchor.set(0.5);
                this.img_targetting.visible = false;
            });

            // Left indicator
            this.selected = false;
            this.img_power = builder.image("battle-actionbar-consumption-disabled", -46);
            this.img_power.anchor.set(0.5);
            this.img_power.visible = false;
            builder.in(this.img_power, builder => {
                this.text_power = builder.text("", -2, 4, {
                    size: 16, color: "#ffdd4b", shadow: true, center: true, vcenter: true
                });
            });

            // Right indicator
            this.img_sticky = builder.image("battle-actionbar-sticky-untoggled", 46);
            this.img_sticky.anchor.set(0.5);
            this.img_sticky.visible = action instanceof ToggleAction;

            // Events
            this.view.tooltip.bind(this.container, filler => {
                ActionTooltip.fill(filler, this.ship, this.action, position);
                return true;
            });

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
        moveTo(layer: Phaser.Group, x = 0, y = 0): void {
            layer.add(this.container);
            this.container.position.set(x, y);
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
                this.view.enterTargettingMode(this.action, mode);
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
            let toggled = (this.action instanceof ToggleAction) && this.action.activated;
            let fading = bool(this.action.checkCannotBeApplied(this.ship, this.ship.getValue("power") - power_consumption));
            let cooldown = this.action.cooldown.heat;
            let targetting = used !== null;
            if (this.action == used && this.action.cooldown.willOverheat()) {
                fading = true;
                cooldown = this.action.cooldown.cooling;
            }

            // inputs
            if (disabled != this.disabled) {
                this.container.input.useHandCursor = !disabled;
            }

            // frame
            if (disabled != this.disabled || fading != this.fading) {
                let name = "battle-actionbar-frame-enabled";
                if (disabled) {
                    name = "battle-actionbar-frame-disabled";
                } else if (fading) {
                    name = "battle-actionbar-frame-fading";
                }

                let info = this.view.getImageInfo(name);
                this.container.name = name;
                this.container.loadTexture(info.key);
                this.container.setFrames(info.frame, info.frame, info.frame, info.frame);
            }

            // action icon
            if (disabled != this.disabled) {
                this.img_action.alpha = disabled ? 0.2 : 1;
            }

            // top
            if (this.img_top && (targetting != this.targetting || disabled != this.disabled)) {
                this.view.animations.setVisible(this.img_top, !targetting, 200, disabled ? 0.2 : 1);
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
            let cost = this.action.getActionPointsUsage(this.ship, null);
            this.img_power.visible = bool(cost);
            this.text_power.text = `${Math.abs(cost)}\n${cost < 0 ? "+" : "-"}`;
            this.text_power.fill = (cost > 0) ? "#ffdd4b" : "#dbe748";
            this.text_power.alpha = disabled ? 0.2 : 1;
            if (disabled != this.disabled || selected != this.selected || toggled != this.toggled) {
                if (disabled) {
                    this.view.changeImage(this.img_power, "battle-actionbar-consumption-disabled");
                } else if (toggled) {
                    this.view.changeImage(this.img_power, "battle-actionbar-consumption-toggled");
                } else if (selected) {
                    this.view.changeImage(this.img_power, "battle-actionbar-consumption-targetting");
                } else {
                    this.view.changeImage(this.img_power, "battle-actionbar-consumption-enabled");
                }
            }

            // right
            if (toggled != this.toggled || disabled != this.disabled || cooldown != this.cooldown) {
                destroyChildren(this.img_sticky);
                if (this.action instanceof ToggleAction) {
                    if (toggled) {
                        this.view.changeImage(this.img_sticky, "battle-actionbar-sticky-toggled");
                    } else {
                        this.view.changeImage(this.img_sticky, "battle-actionbar-sticky-untoggled");
                    }
                    this.img_sticky.visible = !disabled;
                } else if (cooldown) {
                    if (disabled) {
                        this.view.changeImage(this.img_sticky, "battle-actionbar-sticky-disabled");
                    } else {
                        this.view.changeImage(this.img_sticky, "battle-actionbar-sticky-overheat");
                    }
                    range(Math.min(cooldown - 1, 4)).forEach(i => {
                        this.img_sticky.addChild(this.view.newImage("battle-actionbar-cooldown-one", 0, 2 - i * 7));
                    });
                    this.img_sticky.addChild(this.view.newImage("battle-actionbar-cooldown-front", -4, -20));
                    this.img_sticky.visible = true;
                } else {
                    this.img_sticky.visible = false;
                }
            }

            this.disabled = disabled;
            this.selected = selected;
            this.targetting = targetting;
            this.fading = fading;
            this.toggled = toggled;
            this.cooldown = cooldown;
        }
    }
}
