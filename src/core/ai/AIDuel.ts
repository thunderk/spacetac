module TS.SpaceTac {
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
        update(winner: AbstractAI | null) {
            if (winner) {
                if (winner == this.ai1) {
                    this.win1 += 1;
                } else {
                    this.win2 += 1;
                }
                console.log(` => ${winner.name} wins`);
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
        next() {
            console.log(`${this.ai1.name} vs ${this.ai2.name} ...`);

            let battle = Battle.newQuickRandom();
            let playing = battle.playing_ship;

            while (!battle.ended && battle.turn < 100) {
                //console.debug(`Turn ${battle.turn} - Ship ${battle.play_order.indexOf(playing)}`);
                let ai = (playing.fleet == battle.fleets[0]) ? this.ai1 : this.ai2;
                ai.timer = Timer.synchronous;
                ai.ship = playing;
                ai.play();

                if (!battle.ended && battle.playing_ship == playing) {
                    console.error(`${ai.name} did not end its turn !`);
                    battle.advanceToNextShip();
                }
                playing = battle.playing_ship;
            }

            if (battle.ended && !battle.outcome.draw) {
                this.update(battle.outcome.winner == battle.fleets[0] ? this.ai1 : this.ai2);
            } else {
                this.update(null);
            }
            if (!this.stopped) {
                this.scheduled = Timer.global.schedule(100, () => this.next());
            }
        }

        /**
         * Setup the duel HTML page
         */
        static setup(element: HTMLElement) {
            let ais = [new BullyAI(null), new TacticalAI(null), new AbstractAI(null)];
            ais.forEach((ai, idx) => {
                let selects = element.getElementsByTagName("select");
                for (let i = 0; i < selects.length; i++) {
                    let option = document.createElement("option");
                    option.setAttribute("value", idx.toString());
                    option.textContent = ai.name;
                    selects[i].appendChild(option);
                }
            });

            let button = element.getElementsByTagName("button").item(0);
            button.onclick = () => {
                if (AIDuel.current) {
                    AIDuel.current.stop();
                    AIDuel.current = null;
                    button.textContent = "Start !";
                } else {
                    let ai1 = parseInt(element.getElementsByTagName("select").item(0).value);
                    let ai2 = parseInt(element.getElementsByTagName("select").item(1).value);
                    AIDuel.current = new AIDuel(ais[ai1], ais[ai2]);
                    AIDuel.current.start(() => {
                        element.getElementsByClassName("win1").item(0).textContent = AIDuel.current.win1.toString();
                        element.getElementsByClassName("win2").item(0).textContent = AIDuel.current.win2.toString();
                        element.getElementsByClassName("draw").item(0).textContent = AIDuel.current.draw.toString();
                    });
                    button.textContent = "Stop !";
                }
            }
        }
    }
}
