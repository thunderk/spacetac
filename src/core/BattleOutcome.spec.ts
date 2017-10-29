module TK.SpaceTac.Specs {
    testing("BattleOutcome", test => {
        test.case("generates loot from defeated ships", check => {
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
            check.patch(outcome, "getLootGenerator", () => looter);

            outcome.createLoot(battle, random);

            check.equals(outcome.loot.length, 3);
            check.equals(outcome.loot[0].name, "0a");
            check.equals(outcome.loot[1].name, "Nuclear Reactor");
            check.equals(outcome.loot[1].level, 4);
            check.same(outcome.loot[1].quality, EquipmentQuality.COMMON);
            check.equals(outcome.loot[1].requirements, { "skill_photons": 7 });
            check.equals(outcome.loot[2].name, "Nuclear Reactor");
            check.equals(outcome.loot[2].level, 6);
            check.same(outcome.loot[2].quality, EquipmentQuality.PREMIUM);
            check.equals(outcome.loot[2].requirements, { "skill_photons": 9 });
        });

        test.case("grants experience", check => {
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
            check.equals(ship1a.level.getExperience(), 300);
            check.equals(ship1b.level.getExperience(), 600);
            check.equals(ship2a.level.getExperience(), 1500);
            check.equals(ship2b.level.getExperience(), 2800);

            // draw
            let outcome = new BattleOutcome(null);
            outcome.grantExperience([fleet1, fleet2]);
            check.equals(ship1a.level.getExperience(), 345);
            check.equals(ship1b.level.getExperience(), 645);
            check.equals(ship2a.level.getExperience(), 1511);
            check.equals(ship2b.level.getExperience(), 2811);

            // win/lose
            outcome = new BattleOutcome(fleet1);
            outcome.grantExperience([fleet1, fleet2]);
            check.equals(ship1a.level.getExperience(), 480);
            check.equals(ship1b.level.getExperience(), 780);
            check.equals(ship2a.level.getExperience(), 1518);
            check.equals(ship2b.level.getExperience(), 2818);
        });
    });
}
