/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

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

            fleet1.ships[0].setDead();
            fleet1.ships[0].addSlot(SlotType.Armor).attach(new Equipment(SlotType.Armor));
            fleet1.ships[1].setDead();
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.1"));
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.2"));
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.3"));
            fleet1.ships[1].addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine, "1.1.4"));
            fleet2.ships[0].setDead();
            fleet2.ships[1].setDead();
            fleet2.ships[2].setDead();

            var battle = new Battle(fleet1, fleet2);
            var outcome = new BattleOutcome(fleet1);

            var random = new RandomGenerator(
                0,      // leave first ship alone
                0.45,   // take 2 equipments from the 4 of second ship
                1,      //  - take last equipment
                0       //  - take first equipment
            );
            outcome.createLoot(battle, random);

            expect(outcome.loot.length).toBe(2);
            expect(outcome.loot[0].name).toBe("1.1.4");
            expect(outcome.loot[1].name).toBe("1.1.1");
        });
    });
}
