/// <reference path="../common/Tooltip.ts" />

module TS.SpaceTac.UI {
    /**
     * Tooltip to display ship information on hover
     */
    export class ShipTooltip extends Tooltip {
        battleview: BattleView

        constructor(parent: BattleView) {
            super(parent);

            this.battleview = parent;
        }

        /**
         * Find ship sprite in the arena, to position next to it
         */
        getPosition(ship: Ship): [number, number] {
            let sprite = this.battleview.arena.findShipSprite(ship);
            if (sprite) {
                var x = sprite.worldPosition.x + sprite.width * sprite.worldScale.x * 0.5;
                var y = sprite.worldPosition.y - sprite.height * sprite.worldScale.y * 0.5;
                return [x, y];
            } else {
                return [0, 0];
            }
        }

        /**
         * Set the current ship to display
         */
        setShip(ship: Ship): void {
            this.hide();

            let filler = this.getFiller();

            filler.addImage(0, 0, `ship-${ship.model.code}-portrait`, 0.5);

            let enemy = ship.getPlayer() != this.battleview.player;
            filler.addText(140, 0, ship.name, enemy ? "#cc0d00" : "#ffffff", 22, false, true);

            if (ship.alive) {
                let turns = this.battleview.battle.getTurnsBefore(ship);
                filler.addText(140, 36, (turns == 0) ? "Playing" : ((turns == 1) ? "Plays next" : `Plays in ${turns} turns`), "#cccccc", 18);

                filler.addText(140, 72, `Hull\n${ship.getValue("hull")}`, "#eb4e4a", 20, true, true);
                filler.addText(228, 72, `Shield\n${ship.getValue("shield")}`, "#2ad8dc", 20, true, true);
                filler.addText(328, 72, `Power\n${ship.getValue("power")}`, "#ffdd4b", 20, true, true);

                let iy = 148;

                let effects = ship.sticky_effects;
                if (effects.length > 0) {
                    filler.addText(0, iy, "Active effects", "#ffffff", 18, false, true);
                    iy += 30;
                    effects.forEach(effect => {
                        filler.addText(0, iy, `• ${effect.getDescription()}`, effect.isBeneficial() ? "#afe9c6" : "#e9afaf", 16);
                        iy += 26;
                    });
                }

                let weapons = ship.listEquipment(SlotType.Weapon);
                if (weapons.length > 0) {
                    filler.addText(0, iy, "Weapons", "#ffffff", 18, false, true);
                    iy += 30;
                    weapons.forEach(weapon => {
                        filler.addText(0, iy, `• ${weapon.getFullName()}`, "#ffffff", 16);
                        iy += 26;
                    });
                }
            } else {
                filler.addText(140, 36, "Emergency Stasis Protocol\nship disabled", "#a899db", 20, true, true);
            }

            let [x, y] = this.getPosition(ship);
            this.container.show(x, y);
        }
    }
}
