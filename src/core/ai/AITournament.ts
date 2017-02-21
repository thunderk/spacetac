module TS.SpaceTac {
    /**
     * Tournament to test AIs against each other, over a lot of battles
     */
    export class AITournament {
        duels: [AbstractAI, number, AbstractAI, number][] = [];

        constructor() {
            this.addDuel(new AbstractAI(null), new BullyAI(null));
            this.addDuel(new AbstractAI(null), new TacticalAI(null));
            this.addDuel(new BullyAI(null), new TacticalAI(null));

            this.start();
        }

        addDuel(ai1: AbstractAI, ai2: AbstractAI) {
            ai1.timer = Timer.synchronous;
            ai2.timer = Timer.synchronous;
            this.duels.push([ai1, 0, ai2, 0]);
        }

        start(rounds = 100) {
            if (this.duels.length == 0) {
                console.error("No duel to perform");
                return;
            }

            while (rounds--) {
                this.duels.forEach(duel => {
                    console.log(`${duel[0].name} vs ${duel[2].name}`);

                    let winner = this.doOneBattle(duel[0], duel[2]);

                    if (winner) {
                        if (winner == duel[0]) {
                            duel[1] += 1;
                        } else {
                            duel[3] += 1;
                        }
                        console.log(` => ${winner.name} wins`);
                    } else {
                        console.log(" => draw");
                    }
                });
            }

            console.log("--------------------------------------------------------");
            console.log("Final result :");
            this.duels.forEach(duel => {
                let message = `${duel[0].name} ${duel[1]} - ${duel[2].name} ${duel[3]}`
                console.log(message);
                if (typeof document != "undefined") {
                    let line = document.createElement("div");
                    line.textContent = message;
                    document.body.appendChild(line);
                }
            });
        }

        doOneBattle(ai1: AbstractAI, ai2: AbstractAI): AbstractAI | null {
            let battle = Battle.newQuickRandom();
            let playing = battle.playing_ship;
            while (!battle.ended && battle.turn < 100) {
                //console.debug(`Turn ${battle.turn} - Ship ${battle.play_order.indexOf(playing)}`);
                let ai = (playing.fleet == battle.fleets[0]) ? ai1 : ai2;

                ai.ship = playing;
                ai.play();

                if (!battle.ended && battle.playing_ship == playing) {
                    console.error(`${ai.name} did not end its turn !`);
                    battle.advanceToNextShip();
                }
                playing = battle.playing_ship;
            }

            if (battle.ended && !battle.outcome.draw) {
                return (battle.outcome.winner == battle.fleets[0]) ? ai1 : ai2;
            } else {
                return null;
            }
        }
    }
}
