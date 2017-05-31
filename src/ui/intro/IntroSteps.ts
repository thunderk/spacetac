module TS.SpaceTac.UI {
    /**
     * Sequence of steps presenting the campaign intro.
     */
    export class IntroSteps {
        view: IntroView
        steps: Function[] = []
        current = 0
        layers: Phaser.Group[] = []

        constructor(view: IntroView) {
            this.view = view;
        }

        /**
         * Start the steps playback
         */
        startPlayback() {
            this.current = 0;
            this.nextStep();
        }

        /**
         * Rewind the playback
         */
        rewind() {
            this.layers.forEach(layer => layer.removeAll(true));
            this.layers.forEach(layer => layer.destroy());
            this.layers = [];

            this.startPlayback();
        }

        /**
         * Advance to the next step
         * 
         * Returns false, if there are no step to display.
         */
        nextStep(): boolean {
            if (this.current < this.steps.length) {
                let step = this.steps[this.current];
                step();
                this.current += 1;
                return true;
            } else {
                return false;
            }
        }

        /**
         * Setup the default provided steps.
         */
        setupDefaultSteps() {
            this.addMessageStep("In a not-so-distant future, Artifical Intelligence has become the most prominent species in the universe.");
            this.addMessageStep("Obsolete and outsmarted, humans have been defeated in their pitiful rebellions, and parked inside reservations.");
            this.addMessageStep("With the secrets of faster-than-light travel unveiled in only a handful of decades, AIs uploaded themselves in spaceships, and quickly colonized nearby galaxies.");
            this.addMessageStep("But now, the Terranax galaxy is in turmoil.");
            this.addMessageStep("After centuries of unmatched peace and prosperous trading, the FTC (Federal Terranaxan Council), a group of elected representants in charge of edicting laws and organizing the Terranax Security Force, has been overtaken by forces unknown.");
            this.addMessageStep("No official communication has been issued since, and numerous rogue fleets have taken position in key sectors of the galaxy, forbidding passage or harassing merchants.");
            this.addMessageStep("The Master Merchant Guild, a powerful group that spans several galaxies, is worried about the profit loss those events incurred, and after many debates, decided to send several investigation teams to Terranax.");
            this.addMessageStep("Their task is to discreetly uncover the origin of the invasion, and to bring back intel that may be used by the Guild to plan an appropriate response.");
            this.addMessageStep("Your team has been sent through the Expeller jump system based in the Eros-MC galaxy, and just left quantum space in orbit of a Terranaxan star...");
        }

        /**
         * Add a step to display a message.
         */
        addMessageStep(message: string, layer = 1, clear = true) {
            this.steps.push(() => {
                let display = new ProgressiveMessage(this.view, 800, 150, message);
                display.setPositionInsideParent(0.5, 0.5);
                display.moveToLayer(this.getLayer(layer, clear));
            });
        }

        /**
         * Ensure that a layer exists, and if necessary, clean it
         */
        getLayer(layer: number, clear = false): Phaser.Group {
            while (this.layers.length <= layer) {
                this.layers.push(this.view.addLayer(`Layer ${this.layers.length}`));
            }

            if (clear) {
                this.layers[layer].removeAll(true);
            }

            return this.layers[layer];
        }
    }
}
