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
            let button = builder.button("character-portrait", x, y, onselect, this.ship.getName(), identity);
            button.anchor.set(0.5);

            builder.in(button, builder => {
                // FIXME Under hover/on
                let portrait = builder.image(`ship-${this.ship.model.code}-portrait`, 0, 0, true);
                portrait.scale.set(0.5);
            });

            return button;
        }
    }
}
