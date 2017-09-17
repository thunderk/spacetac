module TS.SpaceTac.Equipments {
    describe("DamageProtector", function () {
        it("generates equipment based on level", function () {
            let template = new DamageProtector();

            let equipment = template.generate(1);
            expect(equipment.requirements).toEqual({ "skill_time": 3 });
            expect(equipment.action).toEqual(new ToggleAction(equipment, 2, 300, [
                new DamageModifierEffect(-17)
            ]));

            equipment = template.generate(2);
            expect(equipment.requirements).toEqual({ "skill_time": 4 });
            expect(equipment.action).toEqual(new ToggleAction(equipment, 2, 310, [
                new DamageModifierEffect(-22)
            ]));

            equipment = template.generate(3);
            expect(equipment.requirements).toEqual({ "skill_time": 5 });
            expect(equipment.action).toEqual(new ToggleAction(equipment, 2, 322, [
                new DamageModifierEffect(-28)
            ]));

            equipment = template.generate(10);
            expect(equipment.requirements).toEqual({ "skill_time": 22 });
            expect(equipment.action).toEqual(new ToggleAction(equipment, 8, 462, [
                new DamageModifierEffect(-60)
            ]));
        });

        it("reduces damage around the ship", function () {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            ship1.upgradeSkill("skill_time", 3);
            let protector = ship1.addSlot(SlotType.Weapon).attach(new DamageProtector().generate(1));
            TestTools.setShipAP(ship1, 10);
            let ship2 = battle.fleets[0].addShip();
            let ship3 = battle.fleets[0].addShip();
            ship1.setArenaPosition(0, 0);
            ship2.setArenaPosition(100, 0);
            ship3.setArenaPosition(800, 0);
            battle.playing_ship = ship1;
            ship1.playing = true;
            expect(ship1.getAvailableActions()).toEqual([
                protector.action,
                new EndTurnAction()
            ]);

            TestTools.setShipHP(ship1, 100, 0);
            TestTools.setShipHP(ship2, 100, 0);
            TestTools.setShipHP(ship3, 100, 0);

            iforeach(battle.iships(), ship => new DamageEffect(10).applyOnShip(ship, ship1));

            expect(ship1.getValue("power")).toEqual(10);
            expect(ship1.getValue("hull")).toEqual(90);
            expect(ship2.getValue("hull")).toEqual(90);
            expect(ship3.getValue("hull")).toEqual(90);

            let result = protector.action.apply(ship1, null);
            expect(result).toBe(true);
            expect((<ToggleAction>protector.action).activated).toBe(true);

            iforeach(battle.iships(), ship => new DamageEffect(10).applyOnShip(ship, ship1));

            expect(ship1.getValue("power")).toEqual(8);
            expect(ship1.getValue("hull")).toEqual(82);
            expect(ship2.getValue("hull")).toEqual(82);
            expect(ship3.getValue("hull")).toEqual(80);

            result = protector.action.apply(ship1, null);
            expect(result).toBe(true);
            expect((<ToggleAction>protector.action).activated).toBe(false);

            iforeach(battle.iships(), ship => new DamageEffect(10).applyOnShip(ship, ship1));

            expect(ship1.getValue("power")).toEqual(8);
            expect(ship1.getValue("hull")).toEqual(72);
            expect(ship2.getValue("hull")).toEqual(72);
            expect(ship3.getValue("hull")).toEqual(70);
        });
    });
}
