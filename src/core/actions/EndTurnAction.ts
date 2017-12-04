/// <reference path="BaseAction.ts" />

module TK.SpaceTac {
    /**
     * Action to end the ship's turn
     * 
     * This action is not provided by an equipment and is always available
     */
    export class EndTurnAction extends BaseAction {
        // Singleton that may be used for all ships
        static SINGLETON = new EndTurnAction();

        constructor() {
            super("endturn");
        }

        getVerb(): string {
            return "End ship's turn";
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            let toggled_cost = isum(imap(ship.iToggleActions(true), action => action.power));
            let power_diff = ship.getAttribute("power_generation") - toggled_cost;
            let power_excess = ship.getValue("power") + power_diff - ship.getAttribute("power_capacity");
            if (power_excess > 0) {
                power_diff -= power_excess;
            }
            return -power_diff;
        }

        protected getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            if (ship.is(battle.playing_ship)) {
                let result: BaseBattleDiff[] = [];
                let new_ship = battle.getNextShip();

                // Cool down equipment
                ship.listEquipment().filter(equ => equ.cooldown.heat > 0).forEach(equ => {
                    result.push(new ShipCooldownDiff(ship, equ, 1));
                });

                // "On turn end" effects
                iforeach(ship.active_effects.iterator(), effect => {
                    result = result.concat(effect.getTurnEndDiffs(ship));
                });

                // Change the active ship
                let cycle_diff = (battle.play_order.indexOf(new_ship) == 0) ? 1 : 0;
                result.push(new ShipChangeDiff(ship, new_ship, cycle_diff));

                // "On turn start" effects
                iforeach(new_ship.active_effects.iterator(), effect => {
                    result = result.concat(effect.getTurnStartDiffs(ship));
                });

                return result;
            } else {
                return [];
            }
        }

        protected checkShipTarget(ship: Ship, target: Target): Target | null {
            return ship.is(target.ship_id) ? target : null;
        }

        getTargettingMode(ship: Ship): ActionTargettingMode {
            return ship.getValue("power") ? ActionTargettingMode.SELF_CONFIRM : ActionTargettingMode.SELF;
        }

        getEffectsDescription(): string {
            return "End the current ship's turn.\nWill also generate power and cool down equipments.";
        }
    }
}
