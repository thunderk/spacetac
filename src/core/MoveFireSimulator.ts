module TS.SpaceTac {

    /**
     * A single action in the sequence result from the simulator
     */
    type MoveFirePart = {
        action: BaseAction
        target: Target
        ap: number
    }

    /**
     * A simulation result
     */
    class MoveFireResult {
        // Simulation success, false only if no route can be found
        success = false
        // Ideal successive parts to make the full move+fire
        parts: MoveFirePart[] = []

        need_move = false
        can_move = false
        can_end_move = false
        total_move_ap = 0
        move_location = new Target(0, 0, null)

        need_fire = false
        can_fire = false
        total_fire_ap = 0
        fire_location = new Target(0, 0, null)
    };

    /**
     * Utility to simulate a move+fire action.
     * 
     * This is also a helper to bring a ship in range to fire a weapon.
     */
    export class MoveFireSimulator {
        ship: Ship;

        constructor(ship: Ship) {
            this.ship = ship;
        }

        /**
         * Find the best available engine for moving
         */
        findBestEngine(): Equipment | null {
            let engines = this.ship.listEquipment(SlotType.Engine);
            if (engines.length == 0) {
                return null;
            } else {
                engines.sort((a, b) => cmp(b.distance, a.distance));
                return engines[0];
            }
        }

        /**
         * Simulate a given action on a given valid target.
         */
        simulateAction(action: BaseAction, target: Target): MoveFireResult {
            let dx = target.x - this.ship.arena_x;
            let dy = target.y - this.ship.arena_y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let result = new MoveFireResult();
            let ap = this.ship.values.power.get();

            if (distance > action.getRangeRadius(this.ship)) {
                result.need_move = true;
                let move_distance = distance - action.getRangeRadius(this.ship);
                let move_target = new Target(this.ship.arena_x + dx * move_distance / distance, this.ship.arena_y + dy * move_distance / distance, null);
                let engine = this.findBestEngine();
                if (engine) {
                    result.total_move_ap = engine.action.getActionPointsUsage(this.ship.getBattle(), this.ship, move_target);
                    result.can_move = ap > 0;
                    result.can_end_move = result.total_move_ap <= ap;
                    result.move_location = move_target;
                    result.parts.push({ action: engine.action, target: move_target, ap: result.total_move_ap });

                    ap -= result.total_move_ap;
                    distance -= move_distance;
                }
            }

            if (distance <= action.getRangeRadius(this.ship)) {
                result.success = true;
                if (!(action instanceof MoveAction)) {
                    result.need_fire = true;
                    result.total_fire_ap = action.getActionPointsUsage(this.ship.getBattle(), this.ship, target);
                    result.can_fire = result.total_fire_ap <= ap;
                    result.fire_location = target;
                    result.parts.push({ action: action, target: target, ap: result.total_fire_ap });
                }
            } else {
                result.success = false;
            }

            return result;
        }
    }
}
