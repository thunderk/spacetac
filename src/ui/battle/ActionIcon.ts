module TS.SpaceTac.UI {
    // Icon to activate a ship capability (move, fire...)
    export class ActionIcon extends Phaser.Button {
        // Link to the parent bar
        bar: ActionBar

        // Link to the parent battle view
        battleview: BattleView

        // Related ship
        ship: Ship

        // Related game action
        action: BaseAction

        // True if the action can be used
        active: boolean

        // True if the action is selected for use
        selected: boolean

        // True if an action is currently selected, and this one won't be available after its use
        fading: boolean

        // Current targetting
        private targetting: Targetting | null

        // Action icon - image representing the action
        private layer_icon: Phaser.Image

        // Layer applied when the action is active
        private layer_active: Phaser.Image

        // Layer applied when the action is selected
        private layer_selected: Phaser.Image

        // Cooldown indicators
        private cooldown: Phaser.Image
        private cooldown_count: Phaser.Text

        // Create an icon for a single ship action
        constructor(bar: ActionBar, x: number, y: number, ship: Ship, action: BaseAction, position: number) {
            super(bar.game, x, y, "battle-actionbar-icon");

            this.bar = bar;
            this.battleview = bar.battleview;
            this.ship = ship;
            this.action = action;

            bar.actions.addChild(this);

            // Active layer
            this.active = false;
            this.layer_active = new Phaser.Image(this.game, this.width / 2, this.height / 2, "battle-actionbar-icon", 1);
            this.layer_active.anchor.set(0.5, 0.5);
            this.layer_active.visible = false;
            this.addChild(this.layer_active);

            // Selected layer
            this.selected = false;
            this.layer_selected = new Phaser.Image(this.game, this.width / 2, this.height / 2, "battle-actionbar-icon", 2);
            this.layer_selected.anchor.set(0.5, 0.5);
            this.layer_selected.visible = false;
            this.addChild(this.layer_selected);

            // Icon layer
            let icon = this.battleview.getImage(`battle-actionbar-action-${action.code}`, `equipment-${action.equipment ? action.equipment.code : "---"}`);
            this.layer_icon = new Phaser.Image(this.game, this.width / 2, this.height / 2, icon, 0);
            this.layer_icon.anchor.set(0.5, 0.5);
            this.layer_icon.scale.set(0.25, 0.25);
            this.addChild(this.layer_icon);

            // Cooldown layer
            this.cooldown = new Phaser.Image(this.game, this.width / 2, this.height / 2, "battle-actionbar-icon", 3);
            this.cooldown.anchor.set(0.5, 0.5);
            this.cooldown_count = new Phaser.Text(this.game, 0, 0, "", { align: "center", font: "36pt Arial", fill: "#aaaaaa" });
            this.cooldown_count.anchor.set(0.5, 0.5);
            this.cooldown.addChild(this.cooldown_count);
            this.addChild(this.cooldown);

            // Events
            this.battleview.tooltip.bind(this, filler => {
                ActionTooltip.fill(filler, this.ship, this.action, position);
                return true;
            });
            UITools.setHoverClick(this,
                () => {
                    if (!this.bar.hasActionSelected()) {
                        this.battleview.arena.range_hint.update(this.ship, this.action);
                    }
                },
                () => {
                    if (!this.bar.hasActionSelected()) {
                        this.battleview.arena.range_hint.clear();
                    }
                },
                () => this.processClick()
            );

            // Initialize
            this.updateActiveStatus(true);
            this.updateCooldownStatus();
        }

        // Process a click event on the action icon
        processClick(): void {
            if (!this.bar.interactive) {
                return;
            }
            if (this.action.checkCannotBeApplied(this.ship)) {
                return;
            }
            if (this.selected) {
                this.bar.actionEnded();
                return;
            }

            // End any previously selected action
            this.bar.actionEnded();
            this.bar.actionStarted();

            // Update range hint
            if (this.battleview.arena.range_hint) {
                this.battleview.arena.range_hint.update(this.ship, this.action);
            }

            // Update fading statuses
            this.bar.updateSelectedActionPower(this.action.getActionPointsUsage(this.ship, null), this.action);

            // Set the selected state
            this.setSelected(true);

            if (this.action.needs_target) {
                let sprite = this.battleview.arena.findShipSprite(this.ship);
                if (sprite) {
                    // Switch to targetting mode (will apply action when a target is selected)
                    this.targetting = this.battleview.enterTargettingMode();
                    if (this.targetting) {
                        this.targetting.setSource(sprite);
                        this.targetting.targetSelected.add(this.processSelection, this);
                        this.targetting.targetHovered.add(this.processHover, this);
                        if (this.action instanceof MoveAction) {
                            this.targetting.setApIndicatorsInterval(this.action.getDistanceByActionPoint(this.ship));
                        }
                    }
                }
            } else {
                // No target needed, apply action immediately
                this.processSelection(null);
            }
        }

        // Called when a target is hovered
        //  This will check the target against current action and adjust it if needed
        processHover(target: Target): void {
            let correct_target = this.action.checkTarget(this.ship, target);
            if (this.targetting) {
                this.targetting.setTarget(correct_target, false, this.action.getBlastRadius(this.ship));
            }
            this.bar.updateSelectedActionPower(this.action.getActionPointsUsage(this.ship, correct_target), this.action);
        }

        // Called when a target is selected
        processSelection(target: Target | null): void {
            if (this.action.apply(this.ship, target)) {
                this.bar.actionEnded();
            }
        }

        // Called to clear the current state
        resetState(): void {
            if (this.targetting) {
                this.targetting = null;
            }
            this.setSelected(false);
            this.updateCooldownStatus();
            this.updateActiveStatus();
            this.updateFadingStatus(this.ship.values.power.get());
            this.battleview.arena.range_hint.clear();
        }

        // Set the selected state on this icon
        setSelected(selected: boolean) {
            this.selected = selected;
            this.battleview.animations.setVisible(this.layer_selected, this.selected, 300);
            this.updateCooldownStatus();
        }

        // Update the cooldown status
        updateCooldownStatus(): void {
            let remaining = this.action.getUsesBeforeOverheat();
            if (this.selected && remaining == 1) {
                // will overheat, hint at the cooldown time
                let cooldown = this.action.getCooldownDuration(true);
                this.cooldown.scale.set(0.7);
                this.cooldown_count.text = `${cooldown}`;
                this.battleview.animations.setVisible(this.cooldown, true, 300);
            } else if (remaining == 0) {
                // overheated, show cooldown time
                let cooldown = this.action.getCooldownDuration(false);
                this.cooldown.scale.set(1);
                this.cooldown_count.text = `${cooldown}`;
                this.battleview.animations.setVisible(this.cooldown, true, 300);
            } else {
                this.battleview.animations.setVisible(this.cooldown, false, 300);
            }
        }

        // Update the active status, from the action canBeUsed result
        updateActiveStatus(force = false): void {
            var old_active = this.active;
            this.active = !this.action.checkCannotBeApplied(this.ship);
            if (force || (this.active != old_active)) {
                this.battleview.animations.setVisible(this.layer_active, this.active, 500);
                this.game.tweens.create(this.layer_icon).to({ alpha: this.active ? 1 : 0.3 }, 500).start();
                this.input.useHandCursor = this.active;
            }
        }

        // Update the fading status, given an hypothetical remaining AP
        updateFadingStatus(remaining_ap: number, action: BaseAction | null = null): void {
            let old_fading = this.fading;
            let overheat = (action == this.action && this.action.equipment !== null && this.action.equipment.cooldown.willOverheat());
            this.fading = this.active && (this.action.checkCannotBeApplied(this.ship, remaining_ap) != null || overheat);
            if (this.fading != old_fading) {
                this.battleview.animations.setVisible(this.layer_active, this.active && !this.fading, 500);
            }
        }
    }
}
