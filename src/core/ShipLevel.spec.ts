module TK.SpaceTac.Specs {
    describe("ShipLevel", () => {
        it("level up from experience points", () => {
            let level = new ShipLevel();
            expect(level.get()).toEqual(1);
            expect(level.getNextGoal()).toEqual(100);
            expect(level.getSkillPoints()).toEqual(10);

            level.addExperience(60);  // 60
            expect(level.get()).toEqual(1);
            expect(level.checkLevelUp()).toBe(false);

            level.addExperience(70);  // 130
            expect(level.get()).toEqual(1);
            expect(level.checkLevelUp()).toBe(true);
            expect(level.get()).toEqual(2);
            expect(level.getNextGoal()).toEqual(300);
            expect(level.getSkillPoints()).toEqual(15);

            level.addExperience(200);  // 330
            expect(level.get()).toEqual(2);
            expect(level.checkLevelUp()).toBe(true);
            expect(level.get()).toEqual(3);
            expect(level.getNextGoal()).toEqual(600);
            expect(level.getSkillPoints()).toEqual(20);

            level.addExperience(320);  // 650
            expect(level.get()).toEqual(3);
            expect(level.checkLevelUp()).toBe(true);
            expect(level.get()).toEqual(4);
            expect(level.getNextGoal()).toEqual(1000);
            expect(level.getSkillPoints()).toEqual(25);
        });

        it("forces a given level", () => {
            let level = new ShipLevel();
            expect(level.get()).toEqual(1);

            level.forceLevel(10);
            expect(level.get()).toEqual(10);
        });

        it("computes needed level for given points", function () {
            expect(ShipLevel.getLevelForPoints(0)).toBe(1);
            expect(ShipLevel.getLevelForPoints(1)).toBe(1);
            expect(ShipLevel.getLevelForPoints(2)).toBe(1);
            expect(ShipLevel.getLevelForPoints(5)).toBe(1);
            expect(ShipLevel.getLevelForPoints(10)).toBe(1);
            expect(ShipLevel.getLevelForPoints(11)).toBe(2);
            expect(ShipLevel.getLevelForPoints(15)).toBe(2);
            expect(ShipLevel.getLevelForPoints(16)).toBe(3);
            expect(ShipLevel.getLevelForPoints(526)).toBe(105);
        });

        it("computes needed points for given level", function () {
            expect(ShipLevel.getPointsForLevel(1)).toBe(10);
            expect(ShipLevel.getPointsForLevel(2)).toBe(15);
            expect(ShipLevel.getPointsForLevel(3)).toBe(20);
            expect(ShipLevel.getPointsForLevel(105)).toBe(530);
        });
    });
}
