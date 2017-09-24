module TK.SpaceTac {
    /**
     * Duel between two AIs, over multiple battles
     */
    export class AIDuel {
        static current: AIDuel | null = null

        ai1: AbstractAI
        ai2: AbstractAI
        win1 = 0
        win2 = 0
        draw = 0
        scheduled = null
        stopped = false
        onupdate: Function | null = null

        constructor(ai1: AbstractAI, ai2: AbstractAI) {
            this.ai1 = ai1;
            this.ai2 = ai2;
        }

        /**
         * Start the duel
         */
        start(onupdate: Function | null = null) {
            if (!this.scheduled) {
                this.stopped = false;
                this.scheduled = Timer.global.schedule(100, () => this.next());
                this.onupdate = onupdate;
            }
        }

        /**
         * Stop the duel
         */
        stop() {
            this.stopped = true;
            if (this.scheduled) {
                Timer.global.cancel(this.scheduled);
                this.scheduled = null;
            }
        }

        /**
         * Update the result of a single battle
         */
        update(winner: number) {
            if (winner >= 0) {
                if (winner == 0) {
                    this.win1 += 1;
                    console.log(` => Player 1 wins (${this.ai1})`);
                } else {
                    this.win2 += 1;
                    console.log(` => Player 2 wins (${this.ai2})`);
                }
            } else {
                this.draw += 1;
                console.log(" => draw");
            }

            if (this.onupdate) {
                this.onupdate();
            }
        }

        /**
         * Perform the next battle
         */
        async next() {
            console.log(`${this.ai1.name} vs ${this.ai2.name} ...`);

            // Prepare battle
            let battle = Battle.newQuickRandom();
            battle.fleets.forEach((fleet, findex) => {
                fleet.ships.forEach((ship, sindex) => {
                    ship.name = `F${findex + 1}S${sindex + 1} (${ship.model.name})`;
                });
            });

            // Run battle
            while (!battle.ended && battle.turn < 100) {
                if (this.stopped) {
                    return;
                }

                let playing = battle.playing_ship;
                if (playing) {
                    let ai = (playing.fleet == battle.fleets[0]) ? this.ai1 : this.ai2;
                    ai.ship = playing;
                    await ai.play();
                }
            }

            // Update results, and go on to next battle
            if (!battle.outcome.draw && battle.outcome.winner) {
                this.update(battle.fleets.indexOf(battle.outcome.winner));
            } else {
                this.update(-1);
            }
            this.scheduled = Timer.global.schedule(100, () => this.next());
        }

        /**
         * Setup the duel HTML page
         */
        static setup(element: HTMLElement) {
            let fakeship = new Ship();
            let ais = [new TacticalAI(fakeship), new AbstractAI(fakeship)];
            ais.forEach((ai, idx) => {
                let selects = element.getElementsByTagName("select");
                for (let i = 0; i < selects.length; i++) {
                    let option = document.createElement("option");
                    option.setAttribute("value", idx.toString());
                    option.textContent = ai.name;
                    selects[i].appendChild(option);
                }
                ai.name += `${idx + 1}`;
                ai.timer = new Timer();
                ai.timer.schedule = (delay, callback) => Timer.global.schedule(1, callback);
            });

            let button = element.getElementsByTagName("button").item(0);
            button.onclick = () => {
                if (AIDuel.current) {
                    AIDuel.current.stop();
                    AIDuel.current = null;
                    button.textContent = "Start !";
                } else {
                    console.clear();
                    let ai1 = parseInt(element.getElementsByTagName("select").item(0).value);
                    let ai2 = parseInt(element.getElementsByTagName("select").item(1).value);
                    let duel = new AIDuel(ais[ai1], ais[ai2]);
                    AIDuel.current = duel;
                    duel.start(() => {
                        element.getElementsByClassName("win1").item(0).textContent = duel.win1.toString();
                        element.getElementsByClassName("win2").item(0).textContent = duel.win2.toString();
                        element.getElementsByClassName("draw").item(0).textContent = duel.draw.toString();
                    });
                    button.textContent = "Stop !";
                }
            }
        }
    }
}
