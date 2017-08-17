module TS.SpaceTac.Specs {
    describe("ExclusionAreas", function () {
        it("constructs from a ship or battle", function () {
            let battle = new Battle();
            battle.border = 17;
            battle.ship_separation = 31;
            let ship1 = battle.fleets[0].addShip();
            ship1.setArenaPosition(12, 5);
            let ship2 = battle.fleets[1].addShip();
            ship2.setArenaPosition(43, 89);

            let exclusion = ExclusionAreas.fromBattle(battle);
            expect(exclusion.hard_border).toEqual(17);
            expect(exclusion.effective_obstacle).toEqual(31);
            expect(exclusion.obstacles).toEqual([new ArenaLocationAngle(12, 5), new ArenaLocationAngle(43, 89)]);

            exclusion = ExclusionAreas.fromBattle(battle, [ship1], 120);
            expect(exclusion.hard_border).toEqual(17);
            expect(exclusion.effective_obstacle).toEqual(120);
            expect(exclusion.obstacles).toEqual([new ArenaLocationAngle(43, 89)]);

            exclusion = ExclusionAreas.fromBattle(battle, [ship2], 10);
            expect(exclusion.hard_border).toEqual(17);
            expect(exclusion.effective_obstacle).toEqual(31);
            expect(exclusion.obstacles).toEqual([new ArenaLocationAngle(12, 5)]);

            exclusion = ExclusionAreas.fromShip(ship1);
            expect(exclusion.hard_border).toEqual(17);
            expect(exclusion.effective_obstacle).toEqual(31);
            expect(exclusion.obstacles).toEqual([new ArenaLocationAngle(43, 89)]);

            exclusion = ExclusionAreas.fromShip(ship2, 99);
            expect(exclusion.hard_border).toEqual(17);
            expect(exclusion.effective_obstacle).toEqual(99);
            expect(exclusion.obstacles).toEqual([new ArenaLocationAngle(12, 5)]);

            exclusion = ExclusionAreas.fromShip(ship2, 10, false);
            expect(exclusion.hard_border).toEqual(17);
            expect(exclusion.effective_obstacle).toEqual(31);
            expect(exclusion.obstacles).toEqual([new ArenaLocationAngle(12, 5), new ArenaLocationAngle(43, 89)]);
        })
    })
}