/// <reference path="PersonalityReactions.ts" />

module TK.SpaceTac.Specs {
    describe("PersonalityReactions", function () {
        function apply(pool: ReactionPool): PersonalityReaction | null {
            let reactions = new PersonalityReactions();
            return reactions.check(new Player(), null, null, null, pool);
        }

        class FakeReaction extends PersonalityReactionConversation {
            ships: Ship[]
            constructor(ships: Ship[]) {
                super([]);
                this.ships = ships;
            }
            static cons(ships: Ship[]): FakeReaction {
                return new FakeReaction(ships);
            }
        }

        it("fetches ships from conditions", function () {
            let reaction = apply({});
            expect(reaction).toBeNull();

            let s1 = new Ship(null, "S1");
            let s2 = new Ship(null, "S2");

            reaction = apply({
                a: [() => [s1, s2], 1, [[() => 1, FakeReaction.cons]]],
            });
            expect(reaction).toEqual(new FakeReaction([s1, s2]));
        })

        it("applies weight on conditions", function () {
            let s1 = new Ship(null, "S1");
            let s2 = new Ship(null, "S2");

            let reaction = apply({
                a: [() => [s1], 1, [[() => 1, FakeReaction.cons]]],
                b: [() => [s2], 0, [[() => 1, FakeReaction.cons]]],
            });
            expect(reaction).toEqual(new FakeReaction([s1]));

            reaction = apply({
                a: [() => [s1], 0, [[() => 1, FakeReaction.cons]]],
                b: [() => [s2], 1, [[() => 1, FakeReaction.cons]]],
            });
            expect(reaction).toEqual(new FakeReaction([s2]));
        })

        it("checks for friendly fire", function () {
            let condition = BUILTIN_REACTION_POOL['friendly_fire'][0];
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            let ship1b = battle.fleets[0].addShip();
            let ship2a = battle.fleets[1].addShip();
            let ship2b = battle.fleets[1].addShip();

            expect(condition(ship1a.getPlayer(), battle, ship1a, new DamageEvent(ship1a, 50, 10))).toEqual([], "self shoot");
            expect(condition(ship1a.getPlayer(), battle, ship1a, new DamageEvent(ship1b, 50, 10))).toEqual([ship1b, ship1a]);
            expect(condition(ship1a.getPlayer(), battle, ship1a, new DamageEvent(ship2a, 50, 10))).toEqual([], "enemy shoot");
            expect(condition(ship1a.getPlayer(), battle, ship2a, new DamageEvent(ship2a, 50, 10))).toEqual([], "other player event");
        })
    })
}
