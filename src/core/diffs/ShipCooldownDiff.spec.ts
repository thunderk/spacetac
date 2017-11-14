module TK.SpaceTac.Specs {
    testing("ShipCooldownDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            let weapon = TestTools.addWeapon(ship);
            weapon.cooldown.configure(1, 3);
            weapon.cooldown.use();

            TestTools.diffChain(check, battle, [
                new ShipCooldownDiff(ship, weapon, 1),
                new ShipCooldownDiff(ship, weapon, 2),
            ], [
                    check => {
                        check.equals(weapon.cooldown.heat, 3, "in cooldown for 3 turns");
                    },
                    check => {
                        check.equals(weapon.cooldown.heat, 2, "in cooldown for 2 turns");
                    },
                    check => {
                        check.equals(weapon.cooldown.heat, 0, "not in cooldown");
                    },
                ]);
        });
    });
}