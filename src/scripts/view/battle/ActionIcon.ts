module SpaceTac.View {
    "use strict";

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

        // Current targetting
        private targetting: Targetting;

        // Layer applied when the action is active
        private active: Phaser.Image;

        // Create an icon for a single ship action
        constructor(bar: ActionBar, x: number, y: number, ship: Game.Ship, action: Game.BaseAction) {
            this.bar = bar;
            this.battleview = bar.battleview;
            this.ship = ship;
            this.action = action;

            super(bar.game, x, y, "battle-action-inactive");
            bar.addChild(this);

            // Active layer
            this.active = new Phaser.Image(this.game, 0, 0, "battle-action-active", 0);
            this.addChild(this.active);

            // Click process
            this.onInputUp.add(() => {
                this.processClick();
            }, this);

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

            // Set the lighting color to highlight
            this.active.tint = 0xFFD060;

            if (this.action.needs_target) {
                // Switch to targetting mode (will apply action when a target is selected)
                this.targetting = this.battleview.enterTargettingMode();
                this.targetting.setSource(this.battleview.arena.findShipSprite(this.ship));
                this.targetting.targetSelected.add(this.processSelection, this);
                this.targetting.targetHovered.add(this.processHover, this);
            } else {
                // No target needed, apply action immediately
                this.processSelection(null);
            }
        }

        // Called when a target is hovered
        //  This will check the target against current action and adjust it if needed
        processHover(target: Game.Target): void {
            target = this.action.checkTarget(this.battleview.battle, this.ship, target);
            this.targetting.setTarget(target, false);
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
            this.active.tint = 0xFFFFFF;
            this.updateActiveStatus();
        }

        // Update the active status, from the action canBeUsed result
        updateActiveStatus(): void {
            var active = this.action.canBeUsed(this.battleview.battle, this.ship);

            var tween = this.game.tweens.create(this.active);
            tween.to({alpha: active ? 1 : 0});
            tween.start();

            this.input.useHandCursor = active;
        }
    }
}
