/// <reference path="PersonalityReactions.ts" />

module TK.SpaceTac.Specs {
    testing("PersonalityReactions", test => {
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

        test.case("fetches ships from conditions", check => {
            let reaction = apply({});
            check.equals(reaction, null);

            let s1 = new Ship(null, "S1");
            let s2 = new Ship(null, "S2");

            reaction = apply({
                a: [() => [s1, s2], 1, [[() => 1, FakeReaction.cons]]],
            });
            check.equals(reaction, new FakeReaction([s1, s2]));
        })

        test.case("applies weight on conditions", check => {
            let s1 = new Ship(null, "S1");
            let s2 = new Ship(null, "S2");

            let reaction = apply({
                a: [() => [s1], 1, [[() => 1, FakeReaction.cons]]],
                b: [() => [s2], 0, [[() => 1, FakeReaction.cons]]],
            });
            check.equals(reaction, new FakeReaction([s1]));

            reaction = apply({
                a: [() => [s1], 0, [[() => 1, FakeReaction.cons]]],
                b: [() => [s2], 1, [[() => 1, FakeReaction.cons]]],
            });
            check.equals(reaction, new FakeReaction([s2]));
        })

        test.case("checks for friendly fire", check => {
            let condition = BUILTIN_REACTION_POOL['friendly_fire'][0];
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            let ship1b = battle.fleets[0].addShip();
            let ship2a = battle.fleets[1].addShip();
            let ship2b = battle.fleets[1].addShip();

            check.equals(condition(ship1a.getPlayer(), battle, ship1a, new ShipDamageDiff(ship1a, 50, 10)), [], "self shoot");
            check.equals(condition(ship1a.getPlayer(), battle, ship1a, new ShipDamageDiff(ship1b, 50, 10)), [ship1b, ship1a]);
            check.equals(condition(ship1a.getPlayer(), battle, ship1a, new ShipDamageDiff(ship2a, 50, 10)), [], "enemy shoot");
            check.equals(condition(ship1a.getPlayer(), battle, ship2a, new ShipDamageDiff(ship2a, 50, 10)), [], "other player event");
        })
    })
}
