/// <reference path="Maneuver.ts" />

module TS.SpaceTac.Specs {
    describe("TacticalAI", function () {
        class FixedManeuver extends Maneuver {
            score: number;
            constructor(score: number) {
                super(new Ship(), new Equipment(), new Target(0, 0));
                this.score = score;
            }
            apply() {
                applied.push(this.score);
            }
        }

        // producer of FixedManeuver from a list of scores
        let producer = (...scores: number[]) => imap(iarray(scores), score => new FixedManeuver(score));
        let applied = [];

        beforeEach(function () {
            applied = [];
        });

        it("applies the highest evaluated maneuver", function () {
            let ai = new TacticalAI(new Ship(), Timer.synchronous);
            ai.evaluators.push(maneuver => (<FixedManeuver>maneuver).score);
            ai.producers.push(producer(1, -8, 4));
            ai.producers.push(producer(3, 7, 0, 6, 1));

            ai.ship.playing = true;
            ai.play();
            expect(applied).toEqual([7]);
        });
    });
}
