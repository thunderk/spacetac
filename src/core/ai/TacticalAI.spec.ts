/// <reference path="Maneuver.ts" />

module TS.SpaceTac.Specs {
    describe("TacticalAI", function () {
        class FixedManeuver extends Maneuver {
            score: number;
            constructor(score: number) {
                let battle = new Battle();
                let ship = battle.fleets[0].addShip();
                super(ship, new BaseAction("nothing", "Do nothing"), new Target(0, 0));
                this.score = score;
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
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            battle.playing_ship = ship;
            ship.playing = true;
            let ai = new TacticalAI(ship, Timer.synchronous);

            spyOn(ai, "getDefaultProducers").and.returnValue([
                producer(1, -8, 4),
                producer(3, 7, 0, 6, 1)
            ]);
            spyOn(ai, "getDefaultEvaluators").and.returnValue([
                (maneuver: Maneuver) => (<FixedManeuver>maneuver).score
            ]);
            spyOn(ai, "applyManeuver").and.callFake((maneuver: FixedManeuver) => applied.push(maneuver.score));

            ai.play();
            expect(applied).toEqual([7]);
        });
    });
}
