module TK.SpaceTac.UI {
    /**
     * Tooltip displaying action information
     */
    export class ActionTooltip {
        /**
         * Fill the tooltip
         */
        static fill(filler: TooltipFiller, ship: Ship, action: BaseAction, position: number) {
            let builder = filler.styled({ size: 20 });

            let icon = builder.image([`equipment-${action.equipment ? action.equipment.code : "---"}`, `action-${action.code}`]);
            icon.scale.set(0.5);

            builder.text(action.equipment ? action.equipment.name : action.name, 150, 0, { size: 24 });

            let cost = "";
            if (action instanceof MoveAction) {
                if (ship.getValue("power") == 0) {
                    cost = "Not enough power";
                } else {
                    cost = `Cost: 1 power per ${action.getDistanceByActionPoint(ship)}km`;
                }
            } else if (action.equipment) {
                let power_usage = action.getActionPointsUsage(ship, null);
                if (power_usage) {
                    if (ship.getValue("power") < power_usage) {
                        cost = "Not enough power";
                    } else {
                        cost = `Cost: ${power_usage} power`;
                    }
                }
            }
            if (cost) {
                builder.text(cost, 150, 40, { color: "#ffdd4b" });
            }

            if (action.equipment && action.equipment.cooldown.overheat) {
                let cooldown = action.equipment.cooldown;
                if (cooldown.heat > 0) {
                    builder.text("Cooling down ...", 150, 80, { color: "#c9604c" });
                } else if (cooldown.willOverheat() && cost != "Not enough power") {
                    if (cooldown.cooling > 1) {
                        let turns = cooldown.cooling - 1;
                        builder.text(`Unavailable for ${turns} turn${turns > 1 ? "s" : ""} if used`, 150, 80, { color: "#c9604c" });
                    } else {
                        builder.text("Unavailable until next turn if used", 150, 80, { color: "#c9604c" });
                    }
                }
            } else if (action instanceof ToggleAction && action.activated) {
                builder.text(`Activated`, 150, 80, { color: "#c9604c" });
            }

            let description = action.getEffectsDescription();
            if (description) {
                builder.text(description, 30, 170, { size: 16 });
            }

            let shortcut = "";
            if (action instanceof EndTurnAction) {
                shortcut = "[ space ]";
            } else if (position == 9) {
                shortcut = "[ 0 ]";
            } else if (position >= 0 && position < 9) {
                shortcut = `[ ${position + 1} ]`;
            }
            if (shortcut) {
                builder.text(shortcut, 150, 120, { color: "#aaaaaa", size: 12 });
            }
        }
    }
}
