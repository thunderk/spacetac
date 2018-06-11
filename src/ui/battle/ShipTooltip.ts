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

            ShipTooltip.fillInfo(builder, ship, this.battleview.battle, this.battleview.player);

            let sprite = this.battleview.arena.findShipSprite(ship);
            if (sprite) {
                this.container.show(UITools.getBounds(sprite.frame_owner));
            }
        }

        static fillInfo(builder: TooltipBuilder, ship: Ship, battle?: Battle, player?: Player): boolean {
            let portrait_bg = builder.image("battle-tooltip-ship-portrait", 0, 0);
            builder.in(portrait_bg, builder => {
                let portrait = builder.image(`ship-${ship.model.code}-portrait`, 1, 1);
                portrait.setScale(0.75);
            });

            let enemy = player && !player.is(ship.fleet.player);
            builder.text(ship.getName(), 230, 0, { color: enemy ? "#cc0d00" : "#ffffff", size: 22, bold: true });

            if (ship.alive) {
                if (battle) {
                    let turns = battle.getPlayOrder(ship);
                    builder.text((turns == 0) ? "Playing" : ((turns == 1) ? "Plays next" : `Plays in ${turns} turns`), 230, 36, { color: "#cccccc", size: 18 });
                }

                ShipTooltip.addValue(builder, 0, "#eb4e4a", "attribute-hull_capacity", ship.getValue("hull"), ship.getAttribute("hull_capacity"));
                ShipTooltip.addValue(builder, 1, "#2ad8dc", "attribute-shield_capacity", ship.getValue("shield"), ship.getAttribute("shield_capacity"));
                ShipTooltip.addValue(builder, 2, "#c1f06b", "attribute-evasion", ship.getAttribute("evasion"));
                ShipTooltip.addValue(builder, 3, "#ffdd4b", "attribute-power_capacity", ship.getValue("power"), ship.getAttribute("power_capacity"));

                let iy = 210;

                ship.actions.listAll().forEach(action => {
                    if (!(action instanceof EndTurnAction) && !(action instanceof MoveAction)) {
                        let icon = builder.image(`action-${action.code}`, 0, iy);
                        icon.setScale(0.15);
                        builder.text(action.name, 46, iy + 8);
                        iy += 40;
                    }
                });

                ship.active_effects.list().forEach(effect => {
                    if (!effect.isInternal()) {
                        builder.text(`• ${effect.getDescription()}`, 0, iy, { color: effect.isBeneficial() ? "#afe9c6" : "#e9afaf" });
                        iy += 32;
                    }
                });

                builder.text(ship.model.getDescription(), 0, iy + 4, { size: 14, color: "#999999", width: 540 });
            } else {
                builder.text("Emergency Stasis Protocol\nship disabled", 230, 36,
                    { color: "#a899db", size: 20, center: false, vcenter: false });
            }

            return true;
        }

        private static addValue(builder: UIBuilder, idx: number, color: string, icon: string, val: number, max?: number) {
            let bg = builder.image("battle-tooltip-ship-value", 252 + idx * 68, 116, true);

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
