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
            this.steps = [
                this.message("In a not-so-distant future, Artifical Intelligence has become the most prominent species in the universe."),
                this.message("Obsolete and outsmarted, humans have been defeated in their pitiful rebellions, and parked inside reservations."),
                this.message("With the secrets of faster-than-light travel unveiled in only a handful of decades, AIs uploaded themselves in spaceships, and quickly colonized nearby galaxies."),
                this.simultaneous([
                    this.galaxy(),
                    this.message("But now, the Terranax galaxy is in turmoil."),
                ]),
                this.message("After centuries of unmatched peace and prosperous trading, the FTC (Federal Terranaxan Council), a group of elected representants in charge of edicting laws and organizing the Terranax Security Force, has been overtaken by forces unknown."),
                this.message("No official communication has been issued since, and numerous rogue fleets have taken position in key sectors of the galaxy, forbidding passage or harassing merchants."),
                this.message("The Master Merchant Guild, a powerful group that spans several galaxies, is worried about the profit loss those events incurred, and after many debates, decided to send several investigation teams to Terranax."),
                this.message("Their task is to discreetly uncover the origin of the invasion, and to bring back intel that may be used by the Guild to plan an appropriate response."),
                this.message("Your team has been sent through the Expeller jump system based in the Eros-MC galaxy, and just left quantum space in orbit of a Terranaxan star..."),
            ];
        }

        /**
         * Display a rotating galaxy
         */
        protected galaxy(): Function {
            return () => {
                let layer = this.getLayer(0);
                let game = this.view.game;
                let mwidth = this.view.getMidWidth();
                let mheight = this.view.getMidHeight();

                let galaxy = game.add.group(layer, "galaxy");
                galaxy.position.set(mwidth, mheight);
                game.tweens.create(galaxy).to({ rotation: Math.PI * 2 }, 60000).loop().start();
                game.tweens.create(galaxy).from({ alpha: 0 }, 3000).start();

                let random = RandomGenerator.global;
                range(500).forEach(i => {
                    let distance = random.random() * mheight;
                    let angle = random.random() * Math.PI * 2;

                    let color = random.weighted([5000, 0, 40, 10, 3, 15, 2, 10, 6, 30, 40, 50, 100, 80, 120, 140]);
                    let power = 0.4 + random.random() * 0.6;

                    let star = game.add.image(distance * Math.cos(angle), distance * Math.sin(angle),
                        "common-particles", 16 + color, galaxy);
                    star.scale.set(0.1 + random.random() * 0.2);
                    star.anchor.set(0.5);
                    star.alpha = power * 0.5;
                    game.tweens.create(star).to({ alpha: star.alpha + 0.5 }, 200 + random.random() * 500,
                        undefined, true, 1000 + random.random() * 3000, undefined, true).repeat(-1, 2000 + random.random() * 5000).start();

                    let dust = game.add.image(distance * Math.cos(angle), distance * Math.sin(angle),
                        "common-particles", color, galaxy);
                    dust.anchor.set(0.5);
                    dust.alpha = 0.05 * power;
                    dust.scale.set(5);
                });
            }
        }

        /**
         * Build a step that performs several other steps at the same time
         */
        protected simultaneous(steps: Function[]): Function {
            return () => {
                steps.forEach(step => step());
            }
        }

        /**
         * Build a step to display a message.
         */
        protected message(message: string, layer = 1, clear = true): Function {
            return () => {
                let display = new ProgressiveMessage(this.view, 800, 150, message, true);
                display.setPositionInsideParent(0.5, 0.9);
                display.moveToLayer(this.getLayer(layer, clear));
            }
        }

        /**
         * Ensure that a layer exists, and if necessary, clean it
         */
        protected getLayer(layer: number, clear = false): Phaser.Group {
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
