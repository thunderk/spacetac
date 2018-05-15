module TK.SpaceTac.UI {
    /**
     * Display the portrait of a fleet member on a character sheet
     */
    export class CharacterPortrait {
        constructor(readonly ship: Ship) {
        }

        /**
         * Draw the portrait (anchored at the center)
         */
        draw(builder: UIBuilder, x: number, y: number, onselect: () => void): UIButton {
            let button = builder.button("character-portrait", x, y, onselect, this.ship.getName(), identity, { center: true });

            builder.in(button, builder => {
                let portrait = builder.image(`ship-${this.ship.model.code}-portrait`, 0, 0, true);
                portrait.setScale(0.5);
            });

            return button;
        }
    }
}
