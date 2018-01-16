module TK.SpaceTac.Specs {
    testing("BattleCheats", test => {
        test.case("wins a battle", check => {
            let battle = Battle.newQuickRandom();
            let cheats = new BattleCheats(battle, battle.fleets[0].player);

            cheats.win();

            check.equals(battle.ended, true, "ended");
            check.same(nn(battle.outcome).winner, battle.fleets[0], "winner");
            check.equals(any(battle.fleets[1].ships, ship => ship.alive), false, "all enemies dead");
        })

        test.case("loses a battle", check => {
            let battle = Battle.newQuickRandom();
            let cheats = new BattleCheats(battle, battle.fleets[0].player);

            cheats.lose();

            check.equals(battle.ended, true, "ended");
            check.same(nn(battle.outcome).winner, battle.fleets[1], "winner");
            check.equals(any(battle.fleets[0].ships, ship => ship.alive), false, "all allies dead");
        })

        test.case("adds an equipment", check => {
            let battle = new Battle();
            let ship = new Ship();
            TestTools.setShipPlaying(battle, ship);
            ship.upgradeSkill("skill_materials");
            let cheats = new BattleCheats(battle, battle.fleets[0].player);

            check.equals(ship.listEquipment(), []);

            cheats.equip("Iron Hull");

            let result = ship.listEquipment();
            check.equals(result.length, 1);
            check.containing(result[0], { name: "Iron Hull", level: 1 });
        })
    })
}
