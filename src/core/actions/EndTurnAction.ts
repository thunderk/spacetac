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
            super("endturn", "End ship's turn");
        }

        protected getSpecificDiffs(ship: Ship, battle: Battle, target: Target): BaseBattleDiff[] {
            if (ship.is(battle.playing_ship)) {
                let result: BaseBattleDiff[] = [];
                let new_ship = battle.getNextShip();

                // Generate power
                result = result.concat(ship.getValueDiffs("power", ship.getAttribute("power_generation"), true));

                // Cool down equipment
                ship.listEquipment().filter(equ => equ.cooldown.heat > 0).forEach(equ => {
                    result.push(new ShipCooldownDiff(ship, equ, 1));
                });

                // Fade sticky effects
                iforeach(ship.active_effects.iterator(), effect => {
                    if (effect instanceof StickyEffect) {
                        if (effect.duration > 1) {
                            result.push(new ShipEffectChangedDiff(ship, effect, -1));
                        } else {
                            result = result.concat(effect.getOffDiffs(ship, ship));
                        }
                    }
                });

                // Change the active ship
                let cycle_diff = (battle.play_order.indexOf(new_ship) == 0) ? 1 : 0;
                result.push(new ShipChangeDiff(ship, new_ship, cycle_diff));

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
