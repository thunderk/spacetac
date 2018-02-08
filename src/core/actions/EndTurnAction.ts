/// <reference path="BaseAction.ts" />

module TK.SpaceTac {
    /**
     * Action to end the ship's turn
     * 
     * This action is always available (through its singleton)
     */
    export class EndTurnAction extends BaseAction {
        // Singleton that may be used for all ships
        static SINGLETON = new EndTurnAction();

        constructor() {
            super("End turn");
        }

        getVerb(ship: Ship): string {
            return this.name;
        }

        getTitle(ship: Ship): string {
            return this.name;
        }

        getActionPointsUsage(ship: Ship, target: Target | null): number {
            let toggled_cost = isum(imap(ship.iToggleActions(true), action => action.power));
            return ship.getValue("power") + toggled_cost - ship.getAttribute("power_capacity");
        }

        getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            if (ship.is(battle.playing_ship)) {
                let result: BaseBattleDiff[] = [];
                let new_ship = battle.getNextShip();

                // Cool down actions
                ship.actions.listAll().forEach(action => {
                    if (ship.actions.getCooldown(action).heat > 0) {
                        result.push(new ShipCooldownDiff(ship, action, 1));
                    }
                })

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
