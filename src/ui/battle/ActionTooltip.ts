module TK.SpaceTac.UI {
    /**
     * Tooltip displaying action information
     */
    export class ActionTooltip {
        /**
         * Fill the tooltip
         */
        static fill(filler: TooltipBuilder, ship: Ship, action: BaseAction, position: number) {
            let builder = filler.styled({ size: 20 });

            let icon = builder.image(`action-${action.code}`);
            icon.setScale(0.5);

            builder.text(action.getTitle(ship), 150, 0, { size: 24 });

            let unavailable = action.checkCannotBeApplied(ship);
            if (unavailable != null) {
                builder.text(unavailable, 150, 40, { color: "#e54d2b" });
            } else if (action instanceof MoveAction) {
                let cost = `Cost: 1 power per ${action.distance_per_power}km`;
                builder.text(cost, 150, 40, { color: "#ffdd4b" });
            } else {
                let power_usage = action.getPowerUsage(ship, null);
                if (power_usage) {
                    let cost = (power_usage > 0) ? `Cost: ${power_usage} power` : `Recover: ${-power_usage} power`;
                    builder.text(cost, 150, 40, { color: "#ffdd4b" });
                }
            }

            let cooldown = ship.actions.getCooldown(action);
            if (cooldown.overheat) {
                if (cooldown.heat > 0) {
                    builder.text("Cooling down ...", 150, 80, { color: "#d8894d" });
                } else if (!unavailable && cooldown.willOverheat()) {
                    if (cooldown.cooling > 1) {
                        let turns = cooldown.cooling - 1;
                        builder.text(`Unavailable for ${turns} turn${turns > 1 ? "s" : ""} if used`, 150, 80, { color: "#d8894d" });
                    } else {
                        builder.text("Unavailable until next turn if used", 150, 80, { color: "#d8894d" });
                    }
                }
            } else if (action instanceof ToggleAction && ship.actions.isToggled(action)) {
                builder.text(`Activated`, 150, 80, { color: "#dbe748" });
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
