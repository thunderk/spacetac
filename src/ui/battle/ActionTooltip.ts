module TS.SpaceTac.UI {
    // Tooltip to display action information
    export class ActionTooltip extends Phaser.Sprite {
        bar: ActionBar;
        icon: Phaser.Image | null;
        main_title: Phaser.Text;
        sub_title: Phaser.Text;
        cost: Phaser.Text;
        description: Phaser.Text;
        shortcut: Phaser.Text;

        constructor(parent: ActionBar) {
            super(parent.game, 0, 0, "battle-action-tooltip");
            this.bar = parent;
            this.visible = false;

            this.icon = null;

            this.main_title = new Phaser.Text(this.game, 325, 20, "", { font: "24pt Arial", fill: "#ffffff" });
            this.main_title.anchor.set(0.5, 0);
            this.addChild(this.main_title);

            this.sub_title = new Phaser.Text(this.game, 325, 60, "", { font: "22pt Arial", fill: "#ffffff" });
            this.sub_title.anchor.set(0.5, 0);
            this.addChild(this.sub_title);

            this.cost = new Phaser.Text(this.game, 325, 100, "", { font: "20pt Arial", fill: "#ffff00" });
            this.cost.anchor.set(0.5, 0);
            this.addChild(this.cost);

            this.description = new Phaser.Text(this.game, 21, 144, "", { font: "14pt Arial", fill: "#ffffff" });
            this.description.wordWrap = true;
            this.description.wordWrapWidth = 476;
            this.addChild(this.description);

            this.shortcut = new Phaser.Text(this.game, this.width - 5, this.height - 5, "", { font: "12pt Arial", fill: "#aaaaaa" });
            this.shortcut.anchor.set(1, 1);
            this.addChild(this.shortcut);
        }

        // Set current action to display, null to hide
        setAction(action: ActionIcon): void {
            if (action) {
                if (this.icon) {
                    this.icon.destroy(true);
                }
                this.icon = new Phaser.Image(this.game, 76, 72, "battle-actions-" + action.action.code);
                this.icon.anchor.set(0.5, 0.5);
                this.icon.scale.set(0.44, 0.44);
                this.addChild(this.icon);

                this.position.set(action.x, action.y + action.height + 44);
                this.main_title.setText(action.action.equipment ? action.action.equipment.name : action.action.name);
                this.sub_title.setText(action.action.equipment ? action.action.name : "");
                let cost = action.action.equipment ? `Cost: ${action.action.equipment.ap_usage} power` : "";
                if (action.action instanceof MoveAction) {
                    cost += ` per ${action.action.equipment.distance}km`;
                }
                this.cost.setText(cost);
                this.description.setText(action.action.equipment ? action.action.equipment.getActionDescription() : "");

                let position = this.bar.actions.indexOf(action);
                if (action.action instanceof EndTurnAction) {
                    this.shortcut.setText("[ space ]");
                } else if (position == 9) {
                    this.shortcut.setText("[ 0 ]");
                } else if (position >= 0 && position < 9) {
                    this.shortcut.setText(`[ ${position + 1} ]`);
                } else {
                    this.shortcut.setText("");
                }

                Animation.fadeIn(this.game, this, 200, 0.9);
            } else {
                Animation.fadeOut(this.game, this, 200);
            }
        }
    }
}
