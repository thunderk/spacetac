module SpaceTac.View {
    "use strict";

    // Tooltip to display action information
    export class ActionTooltip extends Phaser.Sprite {
        // Action name
        title: Phaser.Text;

        constructor(parent: ActionBar) {
            super(parent.game, 0, 0, "battle-action-tooltip");
            this.visible = false;

            this.title = new Phaser.Text(this.game, 0, 0, "", {font: "14px Arial", fill: "#000000"});
            this.addChild(this.title);
        }

        // Set current action to display, null to hide
        setAction(action: ActionIcon): void {
            if (action) {
                this.position.set(action.x, action.y + action.height + action.bar.actionpoints.height);
                this.title.setText(action.action.code);
                Animation.fadeIn(this.game, this, 200);
            } else {
                Animation.fadeOut(this.game, this, 200);
            }
        }
    }
}
