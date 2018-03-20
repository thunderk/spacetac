module TK.SpaceTac.UI {
    /**
     * Character personality traits editor
     */
    export class CharacterPersonality {
        private view: BaseView
        private background: UIImage
        private name: UIText
        private ship?: Ship

        constructor(builder: UIBuilder, x: number, y: number) {
            this.view = builder.view;

            this.background = builder.image("character-personality-background", x, y);
            builder = builder.in(this.background);

            builder.in(builder.image("character-section-title", 0, 0, false)).text("Pilot", 80, 45, { color: "#dce9f9", size: 32 });

            this.name = builder.in(builder.image("character-name-display", 430, 50, true)).text("", 0, 0, { size: 28 });

            builder.button("character-name-button", 664, 0, () => this.renamePersonality(), "Rename personality");

            builder.text("AVAILABLE SOON !", 690, 528, { size: 20, color: "#a7b3db" });

            builder.styled({ size: 24, color: "#dbeff9" }, builder => {
                builder.image("character-personality-trait-base", 420, 198, true);
                builder.text("Courageous", 144, 140);
                builder.text("Wise", 725, 140);

                builder.image("character-personality-trait-base", 420, 316, true);
                builder.text("Kind", 144, 268);
                builder.text("Resilient", 725, 268);

                builder.image("character-personality-trait-base", 420, 444, true);
                builder.text("Shrewd", 144, 388);
                builder.text("Funny", 725, 388);
            });
        }

        /**
         * Change the content to display a ship's personality
         */
        displayShip(ship: Ship) {
            let builder = new UIBuilder(this.view);
            this.ship = ship;

            builder.change(this.name, ship.name || "");
        }

        /**
         * Open a dialog to rename the ship's personality
         */
        renamePersonality(): void {
            if (!this.ship) {
                return;
            }
            let ship = this.ship;

            UITextDialog.ask(this.view, "Choose a name for this ship's personality", ship.name || undefined).then(name => {
                if (bool(name)) {
                    ship.name = name;
                    this.displayShip(ship);
                }
            });
        }
    }
}
