/// <reference path="BaseBattleDiff.ts"/>

module TK.SpaceTac {
    /**
     * A ship's action cools down
     */
    export class ShipCooldownDiff extends BaseBattleShipDiff {
        // Action to cool
        action: RObjectId

        // Quantity of heat to dissipate
        heat: number

        constructor(ship: Ship | RObjectId, action: BaseAction | RObjectId, heat: number) {
            super(ship);

            this.action = (action instanceof BaseAction) ? action.id : action;
            this.heat = heat;
        }

        applyOnShip(ship: Ship, battle: Battle) {
            let action = ship.actions.getById(this.action);
            if (action) {
                let cooldown = ship.actions.getCooldown(action);
                cooldown.heat -= this.heat;
                if (cooldown.heat == 0) {
                    cooldown.uses = 0;
                }
            } else {
                console.error("Cannot apply diff, action not found", this, ship.actions);
            }
        }

        revertOnShip(ship: Ship, battle: Battle) {
            let action = ship.actions.getById(this.action);
            if (action) {
                let cooldown = ship.actions.getCooldown(action);
                if (cooldown.heat == 0) {
                    cooldown.uses = cooldown.overheat;
                }
                cooldown.heat += this.heat;
            } else {
                console.error("Cannot revert diff, action not found", this, ship.actions);
            }
        }
    }
}
