/// <reference path="Maneuver.ts" />

module TK.SpaceTac.Specs {
    testing("TacticalAI", test => {
        class FixedManeuver extends Maneuver {
            score: number;
            constructor(score: number) {
                let battle = new Battle();
                let ship = battle.fleets[0].addShip();
                super(ship, new BaseAction("nothing"), new Target(0, 0));
                this.score = score;
            }
        }

        // producer of FixedManeuver from a list of scores
        let producer = (...scores: number[]) => imap(iarray(scores), score => new FixedManeuver(score));
        let applied: number[] = [];

        test.setup(function () {
            test.check.patch(console, "log", null);
            applied = [];
        });

        test.case("applies the highest evaluated maneuver", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            TestTools.setShipPlaying(battle, ship);
            ship.playing = true;

            let ai = new TacticalAI(ship, maneuver => {
                if (maneuver instanceof FixedManeuver) {
                    applied.push(maneuver.score);
                }
                return false;
            }, false, Timer.synchronous);

            check.patch(ai, "getDefaultProducers", () => [
                producer(1, -8, 4),
                producer(3, 7, 0, 6, 1)
            ]);
            check.patch(ai, "getDefaultEvaluators", () => [
                (maneuver: Maneuver) => (<FixedManeuver>maneuver).score
            ]);

            ai.play();
            check.equals(applied, [7]);
        });
    });
}
