module SpaceTac.Game {
    "use strict";

    // Action to move to a given location
    export class MoveAction extends BaseAction {
        constructor() {
            super("move", true);
        }

        canBeUsed(battle: Battle, ship: Ship): boolean {
            return ship.ap_current > 0;
        }

        checkLocationTarget(battle: Battle, ship: Ship, target: Target): Target {
            // TODO Should forbid to move too much near another ship
            var coords = ship.getLongestMove(target.x, target.y);
            return Target.newFromLocation(coords[0], coords[1]);
        }

        protected customApply(battle: Battle, ship: Ship, target: Target): boolean {
            ship.moveTo(target.x, target.y);
            battle.log.add(new MoveEvent(ship, target.x, target.y));
            return true;
        }
    }
}
