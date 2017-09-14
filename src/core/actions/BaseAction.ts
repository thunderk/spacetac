module TS.SpaceTac {
    /**
     * Base class for a battle action.
     * 
     * An action should be the only way to modify a battle state.
     */
    export class BaseAction {
        // Identifier code for the type of action
        code: string

        // Human-readable name
        name: string

        // Boolean at true if the action needs a target
        needs_target: boolean

        // Equipment that triggers this action
        equipment: Equipment | null

        // Create the action
        constructor(code: string, name: string, needs_target: boolean, equipment: Equipment | null = null) {
            this.code = code;
            this.name = name;
            this.needs_target = needs_target;
            this.equipment = equipment;
        }

        /**
         * Get the number of turns this action is unavailable, because of overheating
         */
        getCooldownDuration(estimated = false): number {
            if (this.equipment) {
                return estimated ? this.equipment.cooldown.cooling : this.equipment.cooldown.heat;
            } else {
                return 0;
            }
        }

        /**
         * Get the number of remaining uses before overheat, infinity if there is no overheat
         */
        getUsesBeforeOverheat(): number {
            if (this.equipment) {
                return this.equipment.cooldown.getRemainingUses();
            } else {
                return Infinity;
            }
        }

        /**
         * Check basic conditions to know if the ship can use this action at all
         * 
         * Method to extend to set conditions
         * 
         * Returns an informative message indicating why the action cannot be used, null otherwise
         */
        checkCannotBeApplied(ship: Ship, remaining_ap: number | null = null): string | null {
            let battle = ship.getBattle();
            if (battle && battle.playing_ship !== ship) {
                // Ship is not playing
                return "ship not playing";
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.values.power.get();
            }
            var ap_usage = this.getActionPointsUsage(ship, null);
            if (remaining_ap < ap_usage) {
                return "not enough power";
            }

            // Check cooldown
            if (this.equipment && !this.equipment.cooldown.canUse()) {
                return "overheated";
            }

            return null;
        }

        // Get the number of action points the action applied to a target would use
        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return 0;
        }

        // Get the range of this action
        getRangeRadius(ship: Ship): number {
            return 0;
        }

        // Get the effect area radius of this action
        getBlastRadius(ship: Ship): number {
            return 0;
        }

        // Method to check if a target is applicable for this action
        //  Will call checkLocationTarget or checkShipTarget by default
        checkTarget(ship: Ship, target: Target | null): Target | null {
            if (this.checkCannotBeApplied(ship)) {
                return null;
            } else if (target) {
                if (target.ship) {
                    return this.checkShipTarget(ship, target);
                } else {
                    return this.checkLocationTarget(ship, target);
                }
            } else {
                return null;
            }
        }

        // Method to reimplement to check if a space target is applicable
        //  Must return null if the target can't be applied, an altered target, or the original target
        checkLocationTarget(ship: Ship, target: Target): Target | null {
            return null;
        }

        // Method to reimplement to check if a ship target is applicable
        //  Must return null if the target can't be applied, an altered target, or the original target
        checkShipTarget(ship: Ship, target: Target): Target | null {
            return null;
        }

        // Apply an action, returning true if it was successful
        apply(ship: Ship, target: Target | null): boolean {
            let reject = this.checkCannotBeApplied(ship);
            if (reject == null) {
                let checked_target = this.checkTarget(ship, target);
                if (!checked_target && this.needs_target) {
                    console.warn("Action rejected - invalid target", ship, this, target);
                    return false;
                }

                let cost = this.getActionPointsUsage(ship, checked_target);
                if (!ship.useActionPoints(cost)) {
                    console.warn("Action rejected - not enough power", ship, this, checked_target);
                    return false;
                }

                if (this.equipment) {
                    this.equipment.addWear(1);
                    ship.listEquipment(SlotType.Power).forEach(equipment => equipment.addWear(1));

                    this.equipment.cooldown.use();
                }

                let battle = ship.getBattle();
                if (battle) {
                    battle.log.add(new ActionAppliedEvent(ship, this, checked_target, cost));
                }

                this.customApply(ship, checked_target);
                return true;
            } else {
                console.warn(`Action rejected - ${reject}`, ship, this, target);
                return false;
            }
        }

        // Method to reimplement to apply a action
        protected customApply(ship: Ship, target: Target | null) {
        }

        /**
         * Get textual description of effects
         */
        getEffectsDescription(): string {
            return "";
        }
    }
}
