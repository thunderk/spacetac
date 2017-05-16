module TS.SpaceTac.UI {
    /**
     * Tooltip displaying action information
     */
    export class ActionTooltip {
        /**
         * Fill the tooltip
         */
        static fill(filler: TooltipFiller, ship: Ship, action: BaseAction, position: number) {
            filler.addImage(0, 0, "battle-actions-" + action.code, 0.5);

            filler.addText(150, 0, action.equipment ? action.equipment.name : action.name, "#ffffff", 24);

            let cost = "";
            if (action instanceof MoveAction) {
                if (ship.getValue("power") == 0) {
                    cost = "Not enough power";
                } else {
                    cost = `Cost: 1 power per ${action.distance_per_power}km`;
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
                filler.addText(150, 50, cost, "#ffdd4b", 20);
            }

            if (action.equipment && action.equipment.cooldown.overheat) {
                let cooldown = action.equipment.cooldown;
                let uses = cooldown.getRemainingUses();
                let uses_message = "";
                if (uses == 0) {
                    uses_message = "Overheated !";
                    if (cooldown.heat == 1) {
                        uses_message += " Available next turn";
                    } else if (cooldown.heat == 2) {
                        uses_message += " Unavailable next turn";
                    } else {
                        uses_message += ` Unavailable next ${cooldown.heat - 1} turns`;
                    }
                } else {
                    uses_message = uses == 1 ? "Overheats if used" : `${uses} uses before overheat`;
                    if (cooldown.cooling) {
                        uses_message += ` (for ${cooldown.cooling} turn${cooldown.cooling ? "s" : ""})`;
                    }
                }
                if (uses_message) {
                    filler.addText(150, 90, uses_message, "#c9604c", 20);
                }
            }

            let description = action.getEffectsDescription();
            if (description) {
                filler.addText(0, 150, description, "#ffffff", 14);
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
                filler.addText(0, 0, shortcut, "#aaaaaa", 12);
            }
        }
    }
}
