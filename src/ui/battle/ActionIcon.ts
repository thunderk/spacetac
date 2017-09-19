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
            super(bar.game, x, y, bar.battleview.getImageInfo("battle-actionbar-icon").key, () => this.processClick(),
                undefined, bar.battleview.getImageInfo("battle-actionbar-icon").frame, bar.battleview.getImageInfo("battle-actionbar-icon").frame);

            this.bar = bar;
            this.battleview = bar.battleview;
            this.ship = ship;
            this.action = action;

            bar.actions.add(this);

            // Icon layer
            let icon = this.battleview.getFirstImage(`action-${action.code}`, `equipment-${action.equipment ? action.equipment.code : "---"}`);
            this.layer_icon = new Phaser.Image(this.game, this.width / 2, this.height / 2, icon.key, icon.frame);
            this.layer_icon.anchor.set(0.5, 0.5);
            this.layer_icon.scale.set(0.35, 0.35);
            this.addChild(this.layer_icon);

            // Active layer
            this.active = false;
            this.layer_active = this.battleview.newImage("battle-actionbar-icon-available", this.width / 2, this.height / 2);
            this.layer_active.anchor.set(0.5, 0.5);
            this.layer_active.visible = false;
            this.addChild(this.layer_active);

            // Selected layer
            this.selected = false;
            this.layer_selected = this.battleview.newImage("battle-actionbar-icon-selected", this.width / 2, this.height / 2);
            this.layer_selected.anchor.set(0.5, 0.5);
            this.layer_selected.visible = false;
            this.addChild(this.layer_selected);

            // Cooldown layer
            this.cooldown = this.battleview.newImage("battle-actionbar-icon-cooldown", this.width / 2, this.height / 2);
            this.cooldown.anchor.set(0.5, 0.5);
            this.cooldown_count = new Phaser.Text(this.game, 0, 0, "", { align: "center", font: "bold 34pt SpaceTac", fill: "#aaaaaa" });
            this.cooldown_count.anchor.set(0.5, 0.45);
            this.cooldown.addChild(this.cooldown_count);
            this.addChild(this.cooldown);

            // Events
            this.battleview.tooltip.bind(this, filler => {
                ActionTooltip.fill(filler, this.ship, this.action, position);
                return true;
            });

            // Initialize
            this.updateActiveStatus(true);
            this.updateCooldownStatus(0);
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

            this.battleview.audio.playOnce("ui-button-click");

            if (this.selected) {
                this.bar.actionEnded();
                return;
            }

            // End any previously selected action
            this.bar.actionEnded();
            this.bar.actionStarted();

            // Set the selected state
            this.setSelected(true);

            let mode = this.action.getTargettingMode(this.ship);
            if (mode == ActionTargettingMode.SELF || mode == ActionTargettingMode.SELF_CONFIRM) {
                // Apply immediately on the ship
                // TODO Handle confirm
                this.processSelection(Target.newFromShip(this.ship));
            } else {
                let sprite = this.battleview.arena.findShipSprite(this.ship);
                if (sprite) {
                    // Switch to targetting mode (will apply action when a target is selected)
                    this.targetting = this.battleview.enterTargettingMode(this.action, mode);
                }
            }
        }

        /**
         * Called when a target is selected
         * 
         * This will effectively apply the action
         */
        processSelection(target: Target): void {
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
        updateCooldownStatus(animate = 300): void {
            let remaining = this.action.getUsesBeforeOverheat();
            if (this.selected && remaining == 1) {
                // will overheat, hint at the cooldown time
                let cooldown = this.action.getCooldownDuration(true);
                this.battleview.changeImage(this.cooldown, "battle-actionbar-icon-cooldown");
                this.cooldown.scale.set(0.7);
                this.cooldown_count.text = `${cooldown}`;
                this.battleview.animations.setVisible(this.cooldown, true, animate);
            } else if (remaining == 0) {
                // overheated, show cooldown time
                let cooldown = this.action.getCooldownDuration(false);
                this.battleview.changeImage(this.cooldown, "battle-actionbar-icon-cooldown");
                this.cooldown.scale.set(1);
                this.cooldown_count.text = `${cooldown}`;
                this.battleview.animations.setVisible(this.cooldown, true, animate);
            } else if (this.action instanceof ToggleAction && this.action.activated) {
                this.battleview.changeImage(this.cooldown, "battle-actionbar-icon-toggled");
                this.cooldown.scale.set(1);
                this.cooldown_count.text = "";
                this.battleview.animations.setVisible(this.cooldown, true, animate);
            } else {
                this.battleview.animations.setVisible(this.cooldown, false, animate);
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
