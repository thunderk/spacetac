module TK.SpaceTac.UI {
    /**
     * Sequence of steps presenting the campaign intro.
     */
    export class IntroSteps {
        view: IntroView
        steps: Function[] = []
        current = 0
        layers: UIContainer[] = []

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
                this.simultaneous( [
                    this.exitftl(),
                    this.message("Your team has been sent through the Expeller jump system based in the Eros-MC galaxy, and just left quantum space in orbit of a Terranaxan star..."),
                ]),
            ];
        }

        /**
         * Display a rotating galaxy
         */
        protected galaxy(): Function {
            return () => {
                let layer = this.getLayer(0);
                let animations = this.view.animations;
                let mwidth = this.view.getMidWidth();
                let mheight = this.view.getMidHeight();

                let builder = new UIBuilder(this.view, layer);
                let random = RandomGenerator.global;

                let galaxy = builder.container("galaxy", 0, 0, false);
                galaxy.setPosition(mwidth, mheight);
                animations.show(galaxy, 3000);
                animations.addAnimation(galaxy, { rotation: Math.PI * 2 }, 150000, undefined, undefined, Infinity);

                builder.in(galaxy, builder => {
                    let back1 = builder.image("intro-galaxy1", 0, 0, true);
                    back1.setScale(2.5);
                    let back2 = builder.image("intro-galaxy2", 0, 0, true);
                    back2.setScale(1.5);
                    animations.addAnimation(back2, { rotation: Math.PI * 2 }, 300000, undefined, undefined, Infinity);

                    range(200).forEach(() => {
                        let distance = (0.3 + random.random() * 0.7) * mheight;
                        let angle = random.random() * Math.PI * 2;
                        let power = 0.4 + random.random() * 0.6;

                        let star = builder.image("intro-star", distance * Math.cos(angle), distance * Math.sin(angle), true);
                        star.setScale(0.15 + random.random() * 0.2);
                        star.setAlpha(power * 0.5);
                        this.view.tweens.add({
                            targets: star,
                            alpha: star.alpha + 0.5,
                            duration: 200 + random.random() * 500,
                            delay: 1000 + random.random() * 3000,
                            yoyo: true,
                            loop: Infinity,
                            loopDelay: 2000 + random.random() * 5000
                        });
                    });
                });
            }
        }

        /**
         * Display a fleet emerging from FTL
         */
        protected exitftl(): Function {
            return () => {
                let layer = this.getLayer(1);
                let builder = new UIBuilder(this.view, layer);

                let fleet = builder.image("intro-fleet", this.view.getMidWidth() + 1500, this.view.getMidHeight() - 750, true);
                this.view.animations.addAnimation(fleet, { x: this.view.getMidWidth(), y: this.view.getMidHeight() }, 5000, "Circ.easeOut");
                this.view.animations.addAnimation(fleet, { alpha: 0, scaleX: 1.5, scaleY: 1.5 }, 500, "Cubic.easeOut", 3500);

                let flash = builder.image("intro-flash", this.view.getMidWidth() + 60, this.view.getMidHeight() - 30, true);
                flash.setAlpha(0);
                flash.setScale(0.1);
                this.view.animations.addAnimation(flash, { alpha: 0.7, scaleX: 2.5, scaleY: 2.5 }, 300, "Quad.easeOut", 3500, undefined, true);
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
        protected message(message: string, layer = 2, clear = true): Function {
            return () => {
                let style = new UIConversationStyle();
                style.center = true;
                let parent = this.getLayer(layer, clear);
                let builder = new UIBuilder(this.view, parent);
                let display = new UIConversationMessage(builder, 900, 200, message, style);
                display.positionRelative(0.5, 0.9);
                display.setVisible(false);
                display.setVisible(true, 500);
            }
        }

        /**
         * Ensure that a layer exists, and if necessary, clean it
         */
        protected getLayer(layer: number, clear = false): UIContainer {
            while (this.layers.length <= layer) {
                this.layers.push(this.view.getLayer(`Layer ${this.layers.length}`));
            }

            if (clear) {
                this.layers[layer].removeAll(true);
            }

            return this.layers[layer];
        }
    }
}
