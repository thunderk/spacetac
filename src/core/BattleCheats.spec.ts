module TK.SpaceTac.Specs {
    testing("BattleCheats", test => {
        test.case("wins a battle", check => {
            let battle = Battle.newQuickRandom();

            battle.cheats.win();
            check.same(battle.ended, true, "ended");
            check.same(battle.outcome.winner, battle.fleets[0], "winner");
            check.equals(battle.log.events.filter(event => event instanceof DeathEvent).map(event => event.ship), battle.fleets[1].ships, "all mark dead");
            check.same(any(battle.fleets[1].ships, ship => !ship.alive), false, "all restored");
        })

        test.case("loses a battle", check => {
            let battle = Battle.newQuickRandom();

            battle.cheats.lose();
            check.same(battle.ended, true, "ended");
            check.same(battle.outcome.winner, battle.fleets[1], "winner");
            check.equals(battle.log.events.filter(event => event instanceof DeathEvent).map(event => event.ship), battle.fleets[0].ships, "all mark dead");
            check.same(any(battle.fleets[0].ships, ship => !ship.alive), false, "all restored");
        })

        test.case("adds an equipment", check => {
            let battle = new Battle();
            let ship = new Ship();
            TestTools.setShipPlaying(battle, ship);
            ship.upgradeSkill("skill_materials");

            check.equals(ship.listEquipment(), []);
            battle.cheats.equip("Iron Hull");
            check.equals(ship.listEquipment(), [<any>jasmine.objectContaining({ name: "Iron Hull", level: 1 })]);
        })
    })
}
