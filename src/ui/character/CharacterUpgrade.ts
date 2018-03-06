module TK.SpaceTac.UI {
    /**
     * Display a single upgrade options
     */
    export class CharacterUpgrade {
        constructor(
            readonly ship: Ship,
            readonly upgrade: ShipUpgrade,
            readonly level: number
        ) {
        }

        /**
         * Draw the upgrade button
         */
        draw(builder: UIBuilder, x: number, y: number, onchange?: (selected: boolean) => void): void {
            let active = this.ship.level.hasUpgrade(this.upgrade);
            let enabled = onchange ? (this.ship.level.get() >= this.level) : active;
            let tooltip = enabled ? ((filler: TooltipBuilder) => this.fillTooltip(filler)) : undefined;
            let selector = (enabled && onchange) ? ((on: boolean) => this.activate(on, onchange)) : undefined;
            let button = builder.button("character-upgrade", x, y, undefined, tooltip, selector);

            if (active) {
                builder.switch(button, true);
            }

            builder.in(button, builder => {
                if (enabled) {
                    builder.text(this.upgrade.code, 166, 40, { size: 16, color: "#e7ebf0", width: 210 });

                    let icon = builder.image(this.getIcon(), 40, 40, true);
                    if (icon.width && icon.width > 64) {
                        icon.scale.set(64 / icon.width);
                    }

                    range(this.upgrade.cost || 0).forEach(i => {
                        builder.image("character-upgrade-point", 275, 64 - i * 24, true);
                    });
                } else {
                    builder.image("character-upgrade-locked");
                }
            });
        }

        /**
         * Activate or deactivate the upgrade
         */
        private activate(on: boolean, onchange: (selected: boolean) => void): boolean {
            let oldval = this.ship.level.hasUpgrade(this.upgrade);
            this.ship.activateUpgrade(this.upgrade, on);
            let newval = this.ship.level.hasUpgrade(this.upgrade);

            if (newval != oldval) {
                onchange(newval);
            }

            return newval;
        }

        /**
         * Fill the tooltip for this upgrade
         */
        fillTooltip(builder: TooltipBuilder): boolean {
            builder.text(this.upgrade.code, 0, 0, { size: 20 });

            let y = 42;

            if (bool(this.upgrade.effects)) {
                builder.text("Permanent effects:", 0, y);
                y += 30;
                this.upgrade.effects.forEach(effect => {
                    builder.text(`• ${effect.getDescription()}`, 0, y);
                    y += 30;
                });
            }

            if (bool(this.upgrade.actions)) {
                this.upgrade.actions.forEach(action => {
                    action.getEffectsDescription().split('\n').forEach(line => {
                        builder.text(line, 0, y);
                        y += 30;
                    })
                });
            }

            if (bool(this.upgrade.description)) {
                y += 10;
                builder.text(this.upgrade.description, 0, y, { size: 14, color: "#999999", width: 540 });
            }

            return true;
        }

        /**
         * Get an icon code for an upgrade
         */
        getIcon(): string {
            let upgrade = this.upgrade;

            if (upgrade.actions && upgrade.actions.length) {
                return `action-${upgrade.actions[0].code}`;
            } else if (upgrade.effects && upgrade.effects.length) {
                let effects = upgrade.effects;
                let attr = first(effects, effect => effect instanceof AttributeEffect || effect instanceof AttributeMultiplyEffect);
                if (attr && (attr instanceof AttributeEffect || attr instanceof AttributeMultiplyEffect)) {
                    return `attribute-${attr.attrcode}`;
                } else {
                    return "translucent";
                }
            } else {
                return "translucent";
            }
        }
    }
}
