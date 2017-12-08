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
    export class BaseAction extends RObject {
        // Identifier code for the type of action
        code: string

        // Equipment that triggers this action
        equipment: Equipment | null

        // Create the action
        constructor(code = "nothing", equipment: Equipment | null = null) {
            super();

            this.code = code;
            this.equipment = equipment;
        }

        /**
         * Get the verb for this action
         */
        getVerb(): string {
            return "Idle";
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
            return ActionTargettingMode.SELF;
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
                remaining_ap = ship.getValue("power");
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

        /**
         * Get the number of action points the action applied to a target would use
         * 
         * If target is null, an estimated cost is returned.
         */
        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return 0;
        }

        /**
         * Get the range of this action, for targetting purpose
         */
        getRangeRadius(ship: Ship): number {
            return 0;
        }

        /**
         * Filter a list of ships to return only those impacted by this action
         * 
         * This may be used as an indicator for helping the player in targetting, or to effectively apply the effects
         */
        filterImpactedShips(source: IArenaLocation, target: Target, ships: Ship[]): Ship[] {
            return [];
        }

        /**
         * Get a list of ships impacted by this action
         */
        getImpactedShips(ship: Ship, target: Target, source: IArenaLocation = ship.location): Ship[] {
            let battle = ship.getBattle();
            if (battle) {
                return this.filterImpactedShips(source, target, imaterialize(battle.iships(true)));
            } else {
                return [];
            }
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
                if (target.isShip()) {
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
         * Get the full list of diffs caused by applying this action
         */
        getDiffs(ship: Ship, battle: Battle, target = this.getDefaultTarget(ship)): BaseBattleDiff[] {
            let reject = this.checkCannotBeApplied(ship);
            if (reject) {
                console.warn(`Action rejected - ${reject}`, ship, this, target);
                return [];
            }

            let checked_target = this.checkTarget(ship, target);
            if (!checked_target) {
                console.warn("Action rejected - invalid target", ship, this, target);
                return [];
            }

            let cost = this.getActionPointsUsage(ship, checked_target);
            if (ship.getValue("power") < cost) {
                console.warn("Action rejected - not enough power", ship, this, checked_target);
                return [];
            }

            let result: BaseBattleDiff[] = [];

            // Action usage
            result.push(new ShipActionUsedDiff(ship, this, checked_target));

            // Power usage
            if (cost) {
                result = result.concat(ship.getValueDiffs("power", -cost, true));
            }

            // Action effects
            result = result.concat(this.getSpecificDiffs(ship, battle, checked_target));

            return result;
        }

        /**
         * Method to reimplement to return the diffs specific to this action
         */
        protected getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            return []
        }

        /**
         * Apply the action on a battle state
         */
        apply(battle: Battle, ship: Ship, target = this.getDefaultTarget(ship)): boolean {
            if (this.checkTarget(ship, target)) {
                let diffs = this.getDiffs(ship, battle, target);
                if (diffs.length) {
                    battle.applyDiffs(diffs);
                    return true;
                } else {
                    console.error("Could not apply action, no diff produced");
                    return false;
                }
            } else {
                console.error("Could not apply action, target rejected");
                return false;
            }
        }

        /**
         * Get textual description of effects
         */
        getEffectsDescription(): string {
            return "";
        }
    }
}
