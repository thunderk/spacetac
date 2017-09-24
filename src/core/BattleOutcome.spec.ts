module TK.SpaceTac.Specs {
    describe("BattleOutcome", () => {
        it("generates loot from defeated ships", () => {
            var fleet1 = new Fleet();
            fleet1.addShip(new Ship());
            var fleet2 = new Fleet();
            fleet2.addShip(new Ship());
            fleet2.addShip(new Ship());
            fleet2.addShip(new Ship());
            fleet2.addShip(new Ship());

            fleet2.ships[2].level.forceLevel(5);
            fleet2.ships[3].level.forceLevel(5);

            fleet2.ships[0].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "0a"));
            fleet2.ships[0].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "0b"));
            fleet2.ships[1].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "1a"));
            fleet2.ships[2].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "2b"));
            fleet2.ships[3].addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon, "3b"));

            var battle = new Battle(fleet1, fleet2);
            var outcome = new BattleOutcome(fleet1);

            var random = new SkewedRandomGenerator([
                0.6,    // standard loot on first ship
                0,      //  - take first equipment
                0,      // leave second ship alone
                0.95,   // lucky loot on third ship
                0,      //  - lower end of level range (ship has 5, so range is 4-6)
                0.5,    //  - common quality
                0,      //  - take first generated equipment (there is only one anyway)
                0.96,   // lucky loot on fourth ship
                0.999,  //  - higher end of level range
                0.98    //  - premium quality
            ]);

            // Force lucky finds with one template
            var looter = new LootGenerator(random, false);
            var template = new LootTemplate(SlotType.Power, "Nuclear Reactor");
            template.setSkillsRequirements({ "skill_photons": istep(4) });
            template.addAttributeEffect("power_capacity", istep(1));
            looter.templates = [template];
            spyOn(outcome, "getLootGenerator").and.returnValue(looter);

            outcome.createLoot(battle, random);

            expect(outcome.loot.length).toBe(3);
            expect(outcome.loot[0].name).toBe("0a");
            expect(outcome.loot[1].name).toBe("Nuclear Reactor");
            expect(outcome.loot[1].level).toBe(4);
            expect(outcome.loot[1].quality).toBe(EquipmentQuality.COMMON);
            expect(outcome.loot[1].requirements).toEqual({ "skill_photons": 7 });
            expect(outcome.loot[2].name).toBe("Nuclear Reactor");
            expect(outcome.loot[2].level).toBe(6);
            expect(outcome.loot[2].quality).toBe(EquipmentQuality.PREMIUM);
            expect(outcome.loot[2].requirements).toEqual({ "skill_photons": 9 });
        });

        it("grants experience", function () {
            let fleet1 = new Fleet();
            let ship1a = fleet1.addShip(new Ship());
            ship1a.level.forceLevel(3);
            let ship1b = fleet1.addShip(new Ship());
            ship1b.level.forceLevel(4);
            let fleet2 = new Fleet();
            let ship2a = fleet2.addShip(new Ship());
            ship2a.level.forceLevel(6);
            let ship2b = fleet2.addShip(new Ship());
            ship2b.level.forceLevel(8);
            expect(ship1a.level.getExperience()).toEqual(300);
            expect(ship1b.level.getExperience()).toEqual(600);
            expect(ship2a.level.getExperience()).toEqual(1500);
            expect(ship2b.level.getExperience()).toEqual(2800);

            // draw
            let outcome = new BattleOutcome(null);
            outcome.grantExperience([fleet1, fleet2]);
            expect(ship1a.level.getExperience()).toEqual(345);
            expect(ship1b.level.getExperience()).toEqual(645);
            expect(ship2a.level.getExperience()).toEqual(1511);
            expect(ship2b.level.getExperience()).toEqual(2811);

            // win/lose
            outcome = new BattleOutcome(fleet1);
            outcome.grantExperience([fleet1, fleet2]);
            expect(ship1a.level.getExperience()).toEqual(480);
            expect(ship1b.level.getExperience()).toEqual(780);
            expect(ship2a.level.getExperience()).toEqual(1518);
            expect(ship2b.level.getExperience()).toEqual(2818);
        });
    });
}
