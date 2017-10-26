module TK.SpaceTac.Specs {
    testing("ExclusionAreas", test => {
        test.case("constructs from a ship or battle", check => {
            let battle = new Battle();
            battle.border = 17;
            battle.ship_separation = 31;
            let ship1 = battle.fleets[0].addShip();
            ship1.setArenaPosition(12, 5);
            let ship2 = battle.fleets[1].addShip();
            ship2.setArenaPosition(43, 89);

            let exclusion = ExclusionAreas.fromBattle(battle);
            check.equals(exclusion.hard_border, 17);
            check.equals(exclusion.effective_obstacle, 31);
            check.equals(exclusion.obstacles, [new ArenaLocationAngle(12, 5), new ArenaLocationAngle(43, 89)]);

            exclusion = ExclusionAreas.fromBattle(battle, [ship1], 120);
            check.equals(exclusion.hard_border, 17);
            check.equals(exclusion.effective_obstacle, 120);
            check.equals(exclusion.obstacles, [new ArenaLocationAngle(43, 89)]);

            exclusion = ExclusionAreas.fromBattle(battle, [ship2], 10);
            check.equals(exclusion.hard_border, 17);
            check.equals(exclusion.effective_obstacle, 31);
            check.equals(exclusion.obstacles, [new ArenaLocationAngle(12, 5)]);

            exclusion = ExclusionAreas.fromShip(ship1);
            check.equals(exclusion.hard_border, 17);
            check.equals(exclusion.effective_obstacle, 31);
            check.equals(exclusion.obstacles, [new ArenaLocationAngle(43, 89)]);

            exclusion = ExclusionAreas.fromShip(ship2, 99);
            check.equals(exclusion.hard_border, 17);
            check.equals(exclusion.effective_obstacle, 99);
            check.equals(exclusion.obstacles, [new ArenaLocationAngle(12, 5)]);

            exclusion = ExclusionAreas.fromShip(ship2, 10, false);
            check.equals(exclusion.hard_border, 17);
            check.equals(exclusion.effective_obstacle, 31);
            check.equals(exclusion.obstacles, [new ArenaLocationAngle(12, 5), new ArenaLocationAngle(43, 89)]);
        })
    })
}