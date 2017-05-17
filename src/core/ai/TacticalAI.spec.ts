/// <reference path="Maneuver.ts" />

module TS.SpaceTac.Specs {
    describe("TacticalAI", function () {
        class FixedManeuver extends Maneuver {
            score: number;
            constructor(score: number) {
                super(new Ship(), new BaseAction("nothing", "Do nothing", true), new Target(0, 0));
                this.score = score;
            }
            apply() {
                applied.push(this.score);
            }
        }

        // producer of FixedManeuver from a list of scores
        let producer = (...scores: number[]) => imap(iarray(scores), score => new FixedManeuver(score));
        let applied: number[] = [];

        beforeEach(function () {
            spyOn(console, "log").and.stub();
            applied = [];
        });

        it("applies the highest evaluated maneuver", function () {
            let ai = new TacticalAI(new Ship(), Timer.synchronous);

            spyOn(ai, "getDefaultProducers").and.returnValue([
                producer(1, -8, 4),
                producer(3, 7, 0, 6, 1)
            ]);
            spyOn(ai, "getDefaultEvaluators").and.returnValue([
                (maneuver: Maneuver) => (<FixedManeuver>maneuver).score
            ]);

            ai.ship.playing = true;
            ai.play();
            expect(applied).toEqual([7]);
        });
    });
}
