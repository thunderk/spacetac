module TK.SpaceTac.Specs {
    testing("ShipCooldownDiff", test => {
        test.case("applies and reverts", check => {
            let battle = TestTools.createBattle();
            let ship = battle.play_order[0];
            let weapon = TestTools.addWeapon(ship);
            weapon.configureCooldown(1, 3);
            let cooldown = ship.actions.getCooldown(weapon);
            cooldown.use();

            TestTools.diffChain(check, battle, [
                new ShipCooldownDiff(ship, weapon, 1),
                new ShipCooldownDiff(ship, weapon, 2),
            ], [
                    check => {
                        check.equals(cooldown.heat, 3, "heat");
                        check.equals(cooldown.uses, 1, "uses");
                    },
                    check => {
                        check.equals(cooldown.heat, 2, "heat");
                        check.equals(cooldown.uses, 1, "uses");
                    },
                    check => {
                        check.equals(cooldown.heat, 0, "heat");
                        check.equals(cooldown.uses, 0, "uses");
                    },
                ]);
        });
    });
}