module TK.SpaceTac {
    /**
     * Targetting mode for an action.
     * 
     * This is a hint as to what type of target is required for this action.
     */
    export enum ActionTargettingMode {
        // Apply immediately on the ship owning the action, without confirmation
        SELF,
        // Apply on the ship owning the action, with a confirmation
        SELF_CONFIRM,
        // Apply on one selected ship
        SHIP,
        // Apply on a space area
        SPACE,
        // Apply on the ship owning the action, but has an effect on surroundings
        SURROUNDINGS
    }

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

        // Equipment that triggers this action
        equipment: Equipment | null

        // Create the action
        constructor(code = "nothing", name = "Idle", equipment: Equipment | null = null) {
            this.code = code;
            this.name = name;
            this.equipment = equipment;
        }

        /**
         * Get the relevent cooldown for this action
         */
        get cooldown(): Cooldown {
            return this.equipment ? this.equipment.cooldown : new Cooldown();
        }

        /**
         * Get the targetting mode
         */
        getTargettingMode(ship: Ship): ActionTargettingMode {
            let blast = this.getBlastRadius(ship);
            let range = this.getRangeRadius(ship);

            if (blast) {
                if (range) {
                    return ActionTargettingMode.SPACE;
                } else {
                    return ActionTargettingMode.SURROUNDINGS;
                }
            } else if (range) {
                return ActionTargettingMode.SHIP;
            } else {
                return ActionTargettingMode.SELF_CONFIRM;
            }
        }

        /**
         * Get a default target for this action
         */
        getDefaultTarget(ship: Ship): Target {
            return Target.newFromShip(ship);
        }

        /**
         * Get the number of turns this action is unavailable, because of overheating
         */
        getCooldownDuration(estimated = false): number {
            let cooldown = this.cooldown;
            return estimated ? this.cooldown.cooling : this.cooldown.heat;
        }

        /**
         * Get the number of remaining uses before overheat, infinity if there is no overheat
         */
        getUsesBeforeOverheat(): number {
            return this.cooldown.getRemainingUses();
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
            if (!this.cooldown.canUse()) {
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

        /**
         * Check if a target is suitable for this action
         * 
         * Will call checkLocationTarget or checkShipTarget by default
         */
        checkTarget(ship: Ship, target: Target): Target | null {
            if (this.checkCannotBeApplied(ship)) {
                return null;
            } else {
                if (target.ship) {
                    return this.checkShipTarget(ship, target);
                } else {
                    return this.checkLocationTarget(ship, target);
                }
            }
        }

        // Method to reimplement to check if a space target is suitable
        //  Must return null if the target can't be applied, an altered target, or the original target
        protected checkLocationTarget(ship: Ship, target: Target): Target | null {
            return null;
        }

        // Method to reimplement to check if a ship target is suitable
        //  Must return null if the target can't be applied, an altered target, or the original target
        protected checkShipTarget(ship: Ship, target: Target): Target | null {
            return null;
        }

        /**
         * Apply an action, returning true if it was successful
         */
        apply(ship: Ship, target = this.getDefaultTarget(ship)): boolean {
            let reject = this.checkCannotBeApplied(ship);
            if (reject == null) {
                let checked_target = this.checkTarget(ship, target);
                if (!checked_target) {
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
                }

                this.cooldown.use();

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

        /**
         * Method to reimplement to apply the action
         */
        protected customApply(ship: Ship, target: Target): void {
        }

        /**
         * Get textual description of effects
         */
        getEffectsDescription(): string {
            return "";
        }
    }
}
