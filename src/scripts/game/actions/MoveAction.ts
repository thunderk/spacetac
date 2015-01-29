module SpaceTac.Game {
    "use strict";

    // Action to move to a given location
    export class MoveAction extends BaseAction {
        constructor(equipment: Equipment) {
            super("move", true, equipment);
        }

        canBeUsed(battle: Battle, ship: Ship): boolean {
            return ship.ap_current.current > 0;
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            // TODO Should forbid to move too much near another ship
            var max_distance = this.equipment.distance * ship.ap_current.current / this.equipment.ap_usage;
            return target.constraintInRange(ship.arena_x, ship.arena_y, max_distance);
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            var distance = Target.newFromShip(ship).getDistanceTo(target);
            ship.moveTo(target.x, target.y);
            var cost = this.equipment.ap_usage * distance / this.equipment.distance;
            ship.useActionPoints(cost);
            return true;
        }
    }
}
