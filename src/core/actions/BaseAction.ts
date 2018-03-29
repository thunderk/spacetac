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
     * Targetting filter for an action.
     * 
     * This will filter ships inside the targetted area, to determine which will receive the action effects.
     */
    export enum ActionTargettingFilter {
        // Apply on all ships
        ALL,
        // Apply on all ships except the actor
        ALL_BUT_SELF,
        // Apply on all allies, including the actor
        ALLIES,
        // Apply on all allies, except the actor
        ALLIES_BUT_SELF,
        // Apply on all enemies
        ENEMIES
    }

    /**
     * Base class for a battle action.
     * 
     * An action should be the only way to modify a battle state.
     */
    export class BaseAction extends RObject {
        // Identifier code for the type of action
        readonly code: string

        // Full name of the action
        readonly name: string

        // Cooldown configuration
        private cooldown = new Cooldown()

        // Create the action
        constructor(name = "Nothing", code?: string) {
            super();

            this.code = code ? code : name.toLowerCase().replace(" ", "");
            this.name = name;
        }

        /**
         * Get the verb for this action
         */
        getVerb(ship: Ship): string {
            return "Do";
        }

        /**
         * Get the full title for this action (verb and name)
         */
        getTitle(ship: Ship): string {
            return `${this.getVerb(ship)} ${this.name}`;
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
         * Configure the cooldown for this action
         */
        configureCooldown(overheat: number, cooling: number): void {
            this.cooldown.configure(overheat, cooling);
        }

        /**
         * Get the cooldown configuration
         */
        getCooldown(): Cooldown {
            // TODO Split configuration (readonly) and usage
            return this.cooldown;
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

            if (!ship.actions.getById(this.id)) {
                return "action not available";
            }

            // Check AP usage
            if (remaining_ap === null) {
                remaining_ap = ship.getValue("power");
            }
            var ap_usage = this.getPowerUsage(ship, null);
            if (remaining_ap < ap_usage) {
                return "not enough power";
            }

            // Check cooldown
            if (!ship.actions.isUsable(this)) {
                return "overheated";
            }

            return null;
        }

        /**
         * Get the power usage, for applying this action on an hypothetical target
         * 
         * If target is null, an estimated cost is returned.
         */
        getPowerUsage(ship: Ship, target: Target | null): number {
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
        filterImpactedShips(ship: Ship, source: IArenaLocation, target: Target, ships: Ship[]): Ship[] {
            return [];
        }

        /**
         * Get a list of ships impacted by this action
         */
        getImpactedShips(ship: Ship, target: Target, source: IArenaLocation = ship.location): Ship[] {
            let battle = ship.getBattle();
            if (battle) {
                return this.filterImpactedShips(ship, source, target, imaterialize(battle.iships(true)));
            } else {
                return [];
            }
        }

        /**
         * Helper to apply a targetting filter on a list of ships, to determine which ones are impacted
         */
        static filterTargets(source: Ship, ships: Ship[], filter: ActionTargettingFilter): Ship[] {
            return ships.filter(ship => {
                if (filter == ActionTargettingFilter.ALL) {
                    return true;
                } else if (filter == ActionTargettingFilter.ALL_BUT_SELF) {
                    return !ship.is(source);
                } else if (filter == ActionTargettingFilter.ALLIES) {
                    return ship.fleet.player.is(source.fleet.player);
                } else if (filter == ActionTargettingFilter.ALLIES_BUT_SELF) {
                    return ship.fleet.player.is(source.fleet.player) && !ship.is(source);
                } else if (filter == ActionTargettingFilter.ENEMIES) {
                    return !ship.fleet.player.is(source.fleet.player);
                } else {
                    return false;
                }
            });
        }

        /**
         * Get a name to represent the group of ships specified by a target filter
         */
        static getFilterDesc(filter: ActionTargettingFilter, plural = true): string {
            if (filter == ActionTargettingFilter.ALL) {
                return plural ? "ships" : "ship";
            } else if (filter == ActionTargettingFilter.ALL_BUT_SELF) {
                return plural ? "other ships" : "other ship";
            } else if (filter == ActionTargettingFilter.ALLIES) {
                return plural ? "team members" : "team member";
            } else if (filter == ActionTargettingFilter.ALLIES_BUT_SELF) {
                return plural ? "teammates" : "teammates";
            } else if (filter == ActionTargettingFilter.ENEMIES) {
                return plural ? "enemies" : "enemy";
            } else {
                return "";
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
         * 
         * This does not perform any check, and assumes the action is doable
         */
        getDiffs(ship: Ship, battle: Battle, target = this.getDefaultTarget(ship)): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            // Action usage
            result.push(new ShipActionUsedDiff(ship, this, target));

            // Power usage
            let cost = this.getPowerUsage(ship, target);
            if (cost) {
                result = result.concat(ship.getValueDiffs("power", -cost, true));
            }

            // Action effects
            result = result.concat(this.getSpecificDiffs(ship, battle, target));

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
         * 
         * This will first check that the action can be done, then get the battle diffs and apply them.
         */
        apply(battle: Battle, ship: Ship, target = this.getDefaultTarget(ship)): boolean {
            let reject = this.checkCannotBeApplied(ship);
            if (reject) {
                console.warn(`Action rejected - ${reject}`, ship, this, target);
                return false;
            }

            let checked_target = this.checkTarget(ship, target);
            if (!checked_target) {
                console.warn("Action rejected - invalid target", ship, this, target);
                return false;
            }

            let cost = this.getPowerUsage(ship, checked_target);
            if (ship.getValue("power") < cost) {
                console.warn("Action rejected - not enough power", ship, this, checked_target);
                return false;
            }

            let diffs = this.getDiffs(ship, battle, checked_target);
            if (diffs.length) {
                battle.applyDiffs(diffs);
                return true;
            } else {
                console.error("Could not apply action, no diff produced");
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
