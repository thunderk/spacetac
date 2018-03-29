/// <reference path="BaseAction.ts"/>

module TK.SpaceTac {
    /** 
     * Configuration of a toggle action
     */
    export interface ToggleActionConfig {
        // Power consumption (while active)
        power: number
        // Effect radius
        radius: number
        // Effects applied
        effects: BaseEffect[]
        // Filtering ships that will receive the effects
        filter: ActionTargettingFilter
    }

    /**
     * Action to toggle some effects on the ship or around it, until next turn start
     * 
     * Toggle actions consume power when activated, and restore it when deactivated
     */
    export class ToggleAction extends BaseAction {
        power = 1
        radius = 0
        effects: BaseEffect[] = []
        filter = ActionTargettingFilter.ALL

        constructor(name: string, config?: Partial<ToggleActionConfig>, code?: string) {
            super(name, code);

            if (config) {
                this.configureToggle(config);
            }
        }

        /**
         * Configure the toggling
         */
        configureToggle(config: Partial<ToggleActionConfig>): void {
            copyfields(config, this);
        }

        getVerb(ship: Ship): string {
            return ship.actions.isToggled(this) ? "Deactivate" : "Activate";
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            if (ship.actions.isToggled(this) || !this.radius) {
                return ActionTargettingMode.SELF_CONFIRM;
            } else {
                return ActionTargettingMode.SURROUNDINGS;
            }
        }

        getPowerUsage(ship: Ship, target: Target | null): number {
            return ship.actions.isToggled(this) ? -this.power : this.power;
        }

        getRangeRadius(ship: Ship): number {
            return 0;
        }

        filterImpactedShips(ship: Ship, source: ArenaLocation, target: Target, ships: Ship[]): Ship[] {
            let result = ships.filter(iship => arenaDistance(iship.location, source) <= this.radius);
            result = BaseAction.filterTargets(ship, result, this.filter);
            return result;
        }

        checkShipTarget(ship: Ship, target: Target): Target | null {
            return ship.is(target.ship_id) ? target : null;
        }

        getSpecificDiffs(ship: Ship, battle: Battle, target: Target, apply_effects = true): BaseBattleDiff[] {
            let activated = ship.actions.isToggled(this);

            let result: BaseBattleDiff[] = [
                new ShipActionToggleDiff(ship, this, !activated)
            ];

            let ships = this.getImpactedShips(ship, target, ship.location);
            ships.forEach(iship => {
                this.effects.forEach(effect => {
                    if (activated) {
                        result.push(new ShipEffectRemovedDiff(iship, effect));
                        if (apply_effects) {
                            result = result.concat(effect.getOffDiffs(iship));
                        }
                    } else {
                        result.push(new ShipEffectAddedDiff(iship, effect));
                        if (apply_effects) {
                            result = result.concat(effect.getOnDiffs(iship, ship));
                        }
                    }
                });
            });

            return result;
        }

        getEffectsDescription(): string {
            if (this.effects.length == 0) {
                return "";
            }

            // TODO filter
            let desc = `When active (power usage ${this.power})`;
            let effects = this.effects.map(effect => {
                let suffix = this.radius ? `on ${BaseAction.getFilterDesc(this.filter)} in ${this.radius}km radius` : "on owner ship";
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}
