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

            let builder = this.getBuilder();

            builder.configure(10, 6, this.battleview.arena.getBoundaries());

            let portrait_bg = builder.image("battle-tooltip-ship-portrait");
            builder.in(portrait_bg, builder => {
                let portrait = builder.image(`ship-${ship.model.code}-portrait`, portrait_bg.width / 2, portrait_bg.height / 2);
                portrait.anchor.set(0.5);
                portrait.scale.set(0.5);
            });

            let enemy = !ship.getPlayer().is(this.battleview.player);
            builder.text(ship.getFullName(), 168, 0, { color: enemy ? "#cc0d00" : "#ffffff", size: 22, bold: true });

            if (ship.alive) {
                let turns = this.battleview.battle.getPlayOrder(ship);
                builder.text((turns == 0) ? "Playing" : ((turns == 1) ? "Plays next" : `Plays in ${turns} turns`), 168, 36, { color: "#cccccc", size: 18 });

                ShipTooltip.addValue(builder, 0, "#aa6f33", "character-attribute-precision", ship.getAttribute("precision"));
                ShipTooltip.addValue(builder, 1, "#c1f06b", "character-attribute-maneuvrability", ship.getAttribute("maneuvrability"));
                ShipTooltip.addValue(builder, 2, "#ffdd4b", "character-value-power", ship.getValue("power"), ship.getAttribute("power_capacity"));
                ShipTooltip.addValue(builder, 3, "#eb4e4a", "character-value-hull", ship.getValue("hull"), ship.getAttribute("hull_capacity"));
                ShipTooltip.addValue(builder, 4, "#2ad8dc", "character-value-shield", ship.getValue("shield"), ship.getAttribute("shield_capacity"));

                let iy = 170;
                let effects = ship.active_effects.list();
                if (effects.length > 0) {
                    builder.text("Active effects", 0, iy, { color: "#ffffff", size: 18, bold: true });
                    iy += 30;
                    effects.forEach(effect => {
                        builder.text(`• ${effect.getDescription()}`, 0, iy, { color: effect.isBeneficial() ? "#afe9c6" : "#e9afaf" });
                        iy += 26;
                    });
                }

                let weapons = ship.listEquipment(SlotType.Weapon);
                if (weapons.length > 0) {
                    builder.text("Weapons", 0, iy, { size: 18, bold: true });
                    iy += 30;
                    weapons.forEach(weapon => {
                        let icon = builder.image(`equipment-${weapon.code}`, 0, iy);
                        icon.scale.set(0.1);
                        builder.text(weapon.getFullName(), 32, iy);
                        iy += 26;
                    });
                }
            } else {
                builder.text("Emergency Stasis Protocol\nship disabled", 140, 36, { color: "#a899db", size: 20, center: true, vcenter: true });
            }

            let sprite = this.battleview.arena.findShipSprite(ship);
            if (sprite) {
                this.container.show(sprite.frame.getBounds());
            }
        }

        private static addValue(builder: UIBuilder, idx: number, color: string, icon: string, val: number, max?: number) {
            let bg = builder.image("battle-tooltip-ship-value", 190 + idx * 72, 110, true);

            builder.in(bg).styled({ color: color, size: 18, center: true, vcenter: true, bold: true }, builder => {
                builder.image(icon, 0, -14, true);
                builder.text(`${val}`, 0, 28);
                if (max) {
                    builder.text("max", 0, 58, { size: 10 });
                    builder.text(`${max}`, 0, 72, { size: 10 });
                }
            });
        }
    }
}
