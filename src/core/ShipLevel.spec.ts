module TK.SpaceTac.Specs {
    testing("ShipLevel", test => {
        test.case("level up from experience points", check => {
            let level = new ShipLevel();
            check.equals(level.get(), 1);
            check.equals(level.getNextGoal(), 100);
            check.equals(level.getSkillPoints(), 10);

            level.addExperience(60);  // 60
            check.equals(level.get(), 1);
            check.equals(level.checkLevelUp(), false);

            level.addExperience(70);  // 130
            check.equals(level.get(), 1);
            check.equals(level.checkLevelUp(), true);
            check.equals(level.get(), 2);
            check.equals(level.getNextGoal(), 300);
            check.equals(level.getSkillPoints(), 15);

            level.addExperience(200);  // 330
            check.equals(level.get(), 2);
            check.equals(level.checkLevelUp(), true);
            check.equals(level.get(), 3);
            check.equals(level.getNextGoal(), 600);
            check.equals(level.getSkillPoints(), 20);

            level.addExperience(320);  // 650
            check.equals(level.get(), 3);
            check.equals(level.checkLevelUp(), true);
            check.equals(level.get(), 4);
            check.equals(level.getNextGoal(), 1000);
            check.equals(level.getSkillPoints(), 25);
        });

        test.case("forces a given level", check => {
            let level = new ShipLevel();
            check.equals(level.get(), 1);

            level.forceLevel(10);
            check.equals(level.get(), 10);
        });

        test.case("computes needed level for given points", check => {
            check.equals(ShipLevel.getLevelForPoints(0), 1);
            check.equals(ShipLevel.getLevelForPoints(1), 1);
            check.equals(ShipLevel.getLevelForPoints(2), 1);
            check.equals(ShipLevel.getLevelForPoints(5), 1);
            check.equals(ShipLevel.getLevelForPoints(10), 1);
            check.equals(ShipLevel.getLevelForPoints(11), 2);
            check.equals(ShipLevel.getLevelForPoints(15), 2);
            check.equals(ShipLevel.getLevelForPoints(16), 3);
            check.equals(ShipLevel.getLevelForPoints(526), 105);
        });

        test.case("computes needed points for given level", check => {
            check.equals(ShipLevel.getPointsForLevel(1), 10);
            check.equals(ShipLevel.getPointsForLevel(2), 15);
            check.equals(ShipLevel.getPointsForLevel(3), 20);
            check.equals(ShipLevel.getPointsForLevel(105), 530);
        });
    });
}
