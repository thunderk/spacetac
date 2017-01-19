module SpaceTac.View {
    // Icon to activate a ship capability (move, fire...)
    export class ActionIcon extends Phaser.Button {
        // Link to the parent bar
        bar: ActionBar;

        // Link to the parent battle view
        battleview: BattleView;

        // Related ship
        ship: Game.Ship;

        // Related game action
        action: Game.BaseAction;

        // True if the action can be used
        active: boolean;

        // True if an action is currently selected, and this one won't be available after its use
        fading: boolean;

        // Current targetting
        private targetting: Targetting;

        // Action icon - image representing the action
        private layer_icon: Phaser.Image;

        // Layer applied when the action is active
        private layer_active: Phaser.Image;

        // Create an icon for a single ship action
        constructor(bar: ActionBar, x: number, y: number, ship: Game.Ship, action: Game.BaseAction) {
            super(bar.game, x, y, "battle-action-inactive");

            this.bar = bar;
            this.battleview = bar.battleview;
            this.ship = ship;
            this.action = action;

            bar.addChild(this);

            // Active layer
            this.active = false;
            this.layer_active = new Phaser.Image(this.game, 0, 0, "battle-action-active", 0);
            this.layer_active.visible = false;
            this.addChild(this.layer_active);

            // Icon layer
            this.layer_icon = new Phaser.Image(this.game, this.layer_active.width / 2, this.layer_active.height / 2, "battle-actions-" + action.code, 0);
            this.layer_icon.anchor.set(0.5, 0.5);
            this.layer_icon.scale.set(0.25, 0.25);
            this.addChild(this.layer_icon);

            let show_info = () => {
                if (this.bar.ship) {
                    this.bar.tooltip.setAction(this);
                    this.battleview.arena.range_hint.setSecondary(this.ship, this.action);
                }
            };
            let hide_info = () => {
                this.bar.tooltip.setAction(null);
                this.battleview.arena.range_hint.clearSecondary();
            };

            // Events
            Tools.setHoverClick(this, show_info, hide_info, () => this.processClick());

            // Initialize
            this.updateActiveStatus();
        }

        // Process a click event on the action icon
        processClick(): void {
            if (!this.action.canBeUsed(this.battleview.battle, this.ship)) {
                return;
            }

            console.log("Action started", this.action);

            // End any previously selected action
            this.bar.actionEnded();
            this.bar.actionStarted();

            // Update range hint
            this.battleview.arena.range_hint.setPrimary(this.ship, this.action);

            // Update fading statuses
            this.bar.updateFadings(this.action.getActionPointsUsage(this.battleview.battle, this.ship, null));

            // Set the lighting color to highlight
            if (this.game.renderType !== Phaser.HEADLESS) {
                // Tint doesn't work in headless renderer
                this.layer_active.tint = 0xFFD060;
            }

            if (this.action.needs_target) {
                // Switch to targetting mode (will apply action when a target is selected)
                this.targetting = this.battleview.enterTargettingMode();
                this.targetting.setSource(this.battleview.arena.findShipSprite(this.ship));
                this.targetting.targetSelected.add(this.processSelection, this);
                this.targetting.targetHovered.add(this.processHover, this);
                if (this.action instanceof Game.MoveAction) {
                    this.targetting.setApIndicatorsInterval(this.action.getDistanceByActionPoint(this.ship));
                }
            } else {
                // No target needed, apply action immediately
                this.processSelection(null);
            }
        }

        // Called when a target is hovered
        //  This will check the target against current action and adjust it if needed
        processHover(target: Game.Target): void {
            target = this.action.checkTarget(this.battleview.battle, this.ship, target);
            this.targetting.setTarget(target, false, this.action.getBlastRadius(this.ship));
            this.bar.updateFadings(this.action.getActionPointsUsage(this.battleview.battle, this.ship, target));
        }

        // Called when a target is selected
        processSelection(target: Game.Target): void {
            console.log("Action target", this.action, target);

            if (this.action.apply(this.battleview.battle, this.ship, target)) {
                this.bar.actionEnded();
            }
        }

        // Called to clear the current state
        resetState(): void {
            if (this.targetting) {
                this.targetting = null;
            }
            this.layer_active.tint = 0xFFFFFF;
            this.updateActiveStatus();
            this.updateFadingStatus(this.ship.ap_current.current);
            this.battleview.arena.range_hint.clearPrimary();
        }

        // Update the active status, from the action canBeUsed result
        updateActiveStatus(): void {
            var old_active = this.active;
            this.active = this.action.canBeUsed(this.battleview.battle, this.ship);
            if (this.active != old_active) {
                Animation.setVisibility(this.game, this.layer_active, this.active, 500);
                this.game.tweens.create(this.layer_icon).to({ alpha: this.active ? 1 : 0.3 }, 500).start();
                this.input.useHandCursor = this.active;
            }
        }

        // Update the fading status, given an hypothetical remaining AP
        updateFadingStatus(remaining_ap: number): void {
            var old_fading = this.fading;
            this.fading = this.active && !this.action.canBeUsed(this.battleview.battle, this.ship, remaining_ap);
            if (this.fading != old_fading) {
                if (this.fading) {
                    this.game.tweens.create(this.layer_active).to({ alpha: 0.4 }, 100).delay(180).to({ alpha: 1 }, 90).to({ alpha: 0.4 }, 80).delay(130).to({ alpha: 1 }, 100).to({ alpha: 0.4 }, 90).delay(160).to({ alpha: 0.8 }, 70).loop(true).start();
                } else {
                    this.game.tweens.removeFrom(this.layer_active);
                    this.layer_active.alpha = this.active ? 1 : 0;
                }
            }
        }
    }
}
