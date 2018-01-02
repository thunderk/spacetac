module TK.SpaceTac.Specs {
    testing("EndBattleDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();

            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[1].addShip();

            let equ1 = new Equipment(SlotType.Weapon);
            equ1.price = 10000;
            ship1.addSlot(SlotType.Weapon).attach(equ1);
            let equ2 = new Equipment(SlotType.Weapon);
            equ2.price = 20000;
            ship2.addSlot(SlotType.Weapon).attach(equ2);

            battle.start();

            TestTools.diffChain(check, battle, [
                new EndBattleDiff(battle.fleets[1], 4)
            ], [
                    check => {
                        check.equals(battle.ended, false, "battle is ongoing");
                        check.equals(battle.outcome, null, "battle has no outcome");
                        check.equals(equ1.wear, 0, "equipment1 wear");
                        check.equals(equ2.wear, 0, "equipment2 wear");
                        check.equals(battle.stats.getImportant(1), [
                            { name: 'Equipment wear (zotys)', attacker: 10000, defender: 20000 }
                        ], "stats stores equipment value");
                    },
                    check => {
                        check.equals(battle.ended, true, "battle is ended");
                        check.same(nn(battle.outcome).winner, battle.fleets[1], "battle has an outcome");
                        check.equals(equ1.wear, 4, "equipment1 wear");
                        check.equals(equ2.wear, 4, "equipment2 wear");
                        check.equals(battle.stats.getImportant(1), [
                            { name: 'Equipment wear (zotys)', attacker: 80, defender: 159 }
                        ], "stats stores equipment wear");
                    },
                ]);
        });
    });
}