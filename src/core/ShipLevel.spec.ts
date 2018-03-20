module TK.SpaceTac.Specs {
    testing("ShipLevel", test => {
        test.case("level up from experience points", check => {
            let level = new ShipLevel();
            check.equals(level.get(), 1);
            check.equals(level.getNextGoal(), 100);
            check.equals(level.getUpgradePoints(), 0);

            level.addExperience(60);  // 60
            check.equals(level.get(), 1);
            check.equals(level.checkLevelUp(), false);

            level.addExperience(70);  // 130
            check.equals(level.get(), 1);
            check.equals(level.checkLevelUp(), true);
            check.equals(level.get(), 2);
            check.equals(level.getNextGoal(), 300);
            check.equals(level.getUpgradePoints(), 6);

            level.addExperience(200);  // 330
            check.equals(level.get(), 2);
            check.equals(level.checkLevelUp(), true);
            check.equals(level.get(), 3);
            check.equals(level.getNextGoal(), 600);
            check.equals(level.getUpgradePoints(), 9);

            level.addExperience(320);  // 650
            check.equals(level.get(), 3);
            check.equals(level.checkLevelUp(), true);
            check.equals(level.get(), 4);
            check.equals(level.getNextGoal(), 1000);
            check.equals(level.getUpgradePoints(), 12);
        });

        test.case("forces a given level", check => {
            let level = new ShipLevel();
            check.equals(level.get(), 1);

            level.forceLevel(10);
            check.equals(level.get(), 10);
        });

        test.case("manages upgrades", check => {
            let up1 = { code: "test1" };
            let up2 = { code: "test2" };

            let level = new ShipLevel();
            check.equals(level.getUpgrades(), []);
            check.equals(level.hasUpgrade(up1), false);

            level.activateUpgrade(up1, true);
            check.equals(level.getUpgrades(), ["test1"]);
            check.equals(level.hasUpgrade(up1), true);

            level.activateUpgrade(up1, true);
            check.equals(level.getUpgrades(), ["test1"]);
            check.equals(level.hasUpgrade(up1), true);

            level.activateUpgrade(up1, false);
            check.equals(level.getUpgrades(), []);
            check.equals(level.hasUpgrade(up1), false);

            level.activateUpgrade(up1, true);
            level.activateUpgrade(up2, true);
            check.equals(level.getUpgrades(), ["test1", "test2"]);
            level.clearUpgrades();
            check.equals(level.getUpgrades(), []);
        });
    });
}
