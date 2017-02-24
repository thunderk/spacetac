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
            ai.evaluators.push(maneuver => maneuver.score);
            ai.producers.push(producer(1, -8, 4));
            ai.producers.push(producer(3, 7, 0, 6, 1));

            ai.ship.playing = true;
            ai.play();
            expect(applied).toEqual([7]);
        });

        it("produces direct weapon shots", function () {
            let battle = new Battle();
            let ship0a = battle.fleets[0].addShip(new Ship(null, "0A"));
            let ship0b = battle.fleets[0].addShip(new Ship(null, "0B"));
            let ship1a = battle.fleets[1].addShip(new Ship(null, "1A"));
            let ship1b = battle.fleets[1].addShip(new Ship(null, "1B"));

            let result = imaterialize(produceDirectWeapon(ship0a, battle));
            expect(result.length).toBe(0);

            let weapon1 = ship0a.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            let weapon2 = ship0a.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            result = imaterialize(produceDirectWeapon(ship0a, battle));
            expect(result.length).toBe(4);
            expect(result).toContain(new Maneuver(ship0a, weapon1, Target.newFromShip(ship1a)));
            expect(result).toContain(new Maneuver(ship0a, weapon1, Target.newFromShip(ship1b)));
            expect(result).toContain(new Maneuver(ship0a, weapon2, Target.newFromShip(ship1a)));
            expect(result).toContain(new Maneuver(ship0a, weapon2, Target.newFromShip(ship1b)));
        });
    });
}
