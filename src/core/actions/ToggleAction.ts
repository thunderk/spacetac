/// <reference path="BaseAction.ts"/>

module TK.SpaceTac {
    /**
     * Action to toggle some effects on the ship or around it, until next turn start
     * 
     * Toggle actions consume power when activated, and restore it when deactivated
     */
    export class ToggleAction extends BaseAction {
        // Power consumption (for activation)
        power: number

        // Effect radius
        radius: number

        // Effects applied
        effects: BaseEffect[]

        // Equipment cannot be null
        equipment: Equipment

        // Current activation status
        activated = false

        constructor(equipment: Equipment, power = 1, radius = 0, effects: BaseEffect[] = [], code = `toggle-${equipment.code}`) {
            super(code, equipment);

            this.power = power;
            this.radius = radius;
            this.effects = effects;
        }

        getVerb(): string {
            return this.activated ? "Deactivate" : "Activate";
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            if (this.activated || !this.radius) {
                return ActionTargettingMode.SELF_CONFIRM;
            } else {
                return ActionTargettingMode.SURROUNDINGS;
            }
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            return this.activated ? -this.power : this.power;
        }

        getRangeRadius(ship: Ship): number {
            return 0;
        }

        filterImpactedShips(source: ArenaLocation, target: Target, ships: Ship[]): Ship[] {
            return ships.filter(ship => arenaDistance(ship.location, source) <= this.radius);
        }

        checkShipTarget(ship: Ship, target: Target): Target | null {
            return ship.is(target.ship_id) ? target : null;
        }

        getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [
                new ShipActionToggleDiff(ship, this, !this.activated)
            ];

            let ships = this.getImpactedShips(ship, target, ship.location);
            ships.forEach(iship => {
                this.effects.forEach(effect => {
                    if (this.activated) {
                        result.push(new ShipEffectRemovedDiff(iship, effect));
                        result = result.concat(effect.getOffDiffs(iship));
                    } else {
                        result.push(new ShipEffectAddedDiff(iship, effect));
                        result = result.concat(effect.getOnDiffs(iship, ship));
                    }
                });
            });

            return result;
        }

        getEffectsDescription(): string {
            if (this.effects.length == 0) {
                return "";
            }

            let desc = `When active (power usage ${this.power})`;
            let effects = this.effects.map(effect => {
                let suffix = this.radius ? `in ${this.radius}km radius` : "on owner ship";
                return "• " + effect.getDescription() + " " + suffix;
            });
            return `${desc}:\n${effects.join("\n")}`;
        }
    }
}
