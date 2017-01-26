module TS.SpaceTac.Game.Specs {
    describe("BattleOutcome", () => {
        it("generates loot from dead ships, for the winner to take", () => {
            var fleet1 = new Fleet();
            fleet1.addShip(new Ship(fleet1));
            fleet1.addShip(new Ship(fleet1));
            fleet1.addShip(new Ship(fleet1));
            var fleet2 = new Fleet();
            fleet2.addShip(new Ship(fleet2));
            fleet2.addShip(new Ship(fleet2));
            fleet2.addShip(new Ship(fleet2));
            fleet2.addShip(new Ship(fleet2));

            fleet2.ships[2].level = 5;
            fleet2.ships[3].level = 5;

            fleet1.ships[0].setDead();
            fleet1.ships[0].addSlot(SlotType.Armor).attach(new Equipment(SlotType.Armor));
            fleet1.ships[1].setDead();
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.1"));
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.2"));
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.3"));
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.4"));
            fleet2.ships[0].setDead();
            fleet2.ships[0].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "2.0.1"));
            fleet2.ships[1].setDead();
            fleet2.ships[1].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "2.1.1"));
            fleet2.ships[2].setDead();
            fleet2.ships[2].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "2.2.1"));
            fleet2.ships[3].setDead();
            fleet2.ships[3].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "2.3.1"));

            var battle = new Battle(fleet1, fleet2);
            var outcome = new BattleOutcome(fleet1);

            var random = new RandomGenerator(
                0,      // leave first ship alone
                0.45,   // take 2 equipments from the 4 of second ship
                1,      //  - take last equipment
                0,      //  - take first equipment
                0.6,    // standard loot on first ship of second fleet
                0,      //  - take first equipment
                0.4,    // no loot on second ship
                0.95,   // lucky loot on third ship
                0,      //  - lower end of level range (dead ship has 5, so range is 4-6)
                0,      //  - take first generated equipment (there is only one anyway)
                0.96,   // lucky loot on fourth ship
                1       //  - higher end of level range
            );

            // Force lucky finds with one template
            var looter = new LootGenerator(random, false);
            var template = new LootTemplate(SlotType.Power, "Nuclear Reactor");
            template.min_level.set(3, 7);
            template.distance.set(0, 5);
            looter.templates = [template];
            spyOn(outcome, "getLootGenerator").and.returnValue(looter);

            outcome.createLoot(battle, random);

            expect(outcome.loot.length).toBe(5);
            expect(outcome.loot[0].name).toBe("1.1.4");
            expect(outcome.loot[1].name).toBe("1.1.1");
            expect(outcome.loot[2].name).toBe("2.0.1");
            expect(outcome.loot[3].name).toBe("Nuclear Reactor");
            expect(outcome.loot[3].min_level).toBe(4);
            expect(outcome.loot[3].distance).toEqual(1);
            expect(outcome.loot[4].name).toBe("Nuclear Reactor");
            expect(outcome.loot[4].min_level).toBe(6);
            expect(outcome.loot[4].distance).toBeCloseTo(4, 0.000001);
        });
    });
}
