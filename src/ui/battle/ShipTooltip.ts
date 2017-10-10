/// <reference path="../common/Tooltip.ts" />

module TK.SpaceTac.UI {
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
         * Set the current ship to display
         */
        setShip(ship: Ship): void {
            this.hide();

            let filler = this.getFiller();
            let sprite = this.battleview.arena.findShipSprite(ship);

            filler.configure(10, 6, this.battleview.arena.getBoundaries());

            let portrait = filler.image(`ship-${ship.model.code}-portrait`);
            portrait.scale.set(0.5);

            let enemy = ship.getPlayer() != this.battleview.player;
            filler.text(ship.getFullName(), 140, 0, { color: enemy ? "#cc0d00" : "#ffffff", size: 22, bold: true });

            if (ship.alive) {
                let turns = this.battleview.battle.getTurnsBefore(ship);
                filler.text((turns == 0) ? "Playing" : ((turns == 1) ? "Plays next" : `Plays in ${turns} turns`), 140, 36, { color: "#cccccc", size: 18 });

                let hsp_builder = filler.styled({ color: "#eb4e4a", size: 20, center: true, vcenter: true, bold: true });
                hsp_builder.text(`Hull\n${ship.getValue("hull")}/${ship.getAttribute("hull_capacity")}`, 200, 106, { color: "#eb4e4a" });
                hsp_builder.text(`Shield\n${ship.getValue("shield")}/${ship.getAttribute("shield_capacity")}`, 340, 106, { color: "#2ad8dc" });
                hsp_builder.text(`Power\n${ship.getValue("power")}/${ship.getAttribute("power_capacity")}`, 480, 106, { color: "#ffdd4b" });

                let iy = 148;

                if (sprite) {
                    let effects = sprite.active_effects.area.concat(sprite.active_effects.sticky);
                    if (effects.length > 0) {
                        filler.text("Active effects", 0, iy, { color: "#ffffff", size: 18, bold: true });
                        iy += 30;
                        effects.forEach(effect => {
                            filler.text(`• ${effect.getDescription()}`, 0, iy, { color: effect.isBeneficial() ? "#afe9c6" : "#e9afaf" });
                            iy += 26;
                        });
                    }
                }

                let weapons = ship.listEquipment(SlotType.Weapon);
                if (weapons.length > 0) {
                    filler.text("Weapons", 0, iy, { size: 18, bold: true });
                    iy += 30;
                    weapons.forEach(weapon => {
                        filler.text(`• ${weapon.getFullName()}`, 0, iy);
                        iy += 26;
                    });
                }
            } else {
                filler.text("Emergency Stasis Protocol\nship disabled", 140, 36, { color: "#a899db", size: 20, center: true, vcenter: true });
            }

            if (sprite) {
                this.container.show(sprite.frame.getBounds());
            }
        }
    }
}
