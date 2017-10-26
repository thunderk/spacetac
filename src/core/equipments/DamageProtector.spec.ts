module TK.SpaceTac.Equipments {
    testing("DamageProtector", test => {
        test.case("generates equipment based on level", check => {
            let template = new DamageProtector();

            let equipment = template.generate(1);
            check.equals(equipment.requirements, { "skill_time": 3 });
            check.equals(equipment.action, new ToggleAction(equipment, 2, 300, [
                new DamageModifierEffect(-17)
            ]));

            equipment = template.generate(2);
            check.equals(equipment.requirements, { "skill_time": 4 });
            check.equals(equipment.action, new ToggleAction(equipment, 2, 310, [
                new DamageModifierEffect(-22)
            ]));

            equipment = template.generate(3);
            check.equals(equipment.requirements, { "skill_time": 5 });
            check.equals(equipment.action, new ToggleAction(equipment, 2, 322, [
                new DamageModifierEffect(-28)
            ]));

            equipment = template.generate(10);
            check.equals(equipment.requirements, { "skill_time": 22 });
            check.equals(equipment.action, new ToggleAction(equipment, 8, 462, [
                new DamageModifierEffect(-60)
            ]));
        });

        test.case("reduces damage around the ship", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            ship1.upgradeSkill("skill_time", 3);
            let protector = ship1.addSlot(SlotType.Weapon).attach(new DamageProtector().generate(1));
            let action = nn(protector.action);
            TestTools.setShipAP(ship1, 10);
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[0].addShip();
            ship1.setArenaPosition(0, 0);
            ship2.setArenaPosition(100, 0);
            ship3.setArenaPosition(800, 0);
            TestTools.setShipPlaying(battle, ship1);
            check.equals(ship1.getAvailableActions(), [action, new EndTurnAction()]);

            TestTools.setShipHP(ship1, 100, 0);
            TestTools.setShipHP(ship2, 100, 0);
            TestTools.setShipHP(ship3, 100, 0);

            iforeach(battle.iships(), ship => new DamageEffect(10).applyOnShip(ship, ship1));

            check.equals(ship1.getValue("power"), 10);
            check.equals(ship1.getValue("hull"), 90);
            check.equals(ship2.getValue("hull"), 90);
            check.equals(ship3.getValue("hull"), 90);

            let result = action.apply(ship1);
            check.equals(result, true);
            check.equals((<ToggleAction>protector.action).activated, true);

            iforeach(battle.iships(), ship => new DamageEffect(10).applyOnShip(ship, ship1));

            check.equals(ship1.getValue("power"), 8);
            check.equals(ship1.getValue("hull"), 82);
            check.equals(ship2.getValue("hull"), 82);
            check.equals(ship3.getValue("hull"), 80);

            result = action.apply(ship1);
            check.equals(result, true);
            check.equals((<ToggleAction>protector.action).activated, false);

            iforeach(battle.iships(), ship => new DamageEffect(10).applyOnShip(ship, ship1));

            check.equals(ship1.getValue("power"), 8);
            check.equals(ship1.getValue("hull"), 72);
            check.equals(ship2.getValue("hull"), 72);
            check.equals(ship3.getValue("hull"), 70);
        });
    });
}
