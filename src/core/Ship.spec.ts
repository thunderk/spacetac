module TK.SpaceTac.Specs {
    testing("Ship", test => {
        test.case("creates a full name", check => {
            let ship = new Ship();
            check.equals(ship.getName(false), "Ship");
            check.equals(ship.getName(true), "Level 1 Ship");

            ship.model = new ShipModel("test", "Hauler");
            check.equals(ship.getName(false), "Hauler");
            check.equals(ship.getName(true), "Level 1 Hauler");

            ship.name = "Titan-W12";
            check.equals(ship.getName(false), "Titan-W12");
            check.equals(ship.getName(true), "Level 1 Titan-W12");

            ship.level.forceLevel(3);
            check.equals(ship.getName(false), "Titan-W12");
            check.equals(ship.getName(true), "Level 3 Titan-W12");
        });

        test.case("moves in the arena", check => {
            let ship = new Ship(null, "Test");
            let engine = TestTools.addEngine(ship, 50);

            check.equals(ship.arena_x, 0);
            check.equals(ship.arena_y, 0);
            check.equals(ship.arena_angle, 0);

            ship.setArenaFacingAngle(1.2);
            ship.setArenaPosition(12, 50);

            check.equals(ship.arena_x, 12);
            check.equals(ship.arena_y, 50);
            check.nears(ship.arena_angle, 1.2);
        });

        test.case("lists available actions from attached equipment", check => {
            var ship = new Ship(null, "Test");
            var actions: BaseAction[];
            var slot: Slot;
            var equipment: Equipment;

            actions = ship.getAvailableActions();
            check.equals(actions.length, 1);
            check.equals(actions[0].code, "endturn");

            slot = ship.addSlot(SlotType.Engine);
            equipment = new Equipment(slot.type);
            equipment.action = new MoveAction(equipment);
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Weapon);
            equipment = new Equipment(slot.type);
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Power);
            equipment = new Equipment(slot.type);
            equipment.action = new TriggerAction(equipment);
            slot.attach(equipment);

            actions = ship.getAvailableActions();
            check.equals(actions.length, 3);
            check.equals(actions[0].code, "move");
            check.equals(actions[1].code, "fire-equipment");
            check.equals(actions[2].code, "endturn");
        });

        test.case("applies permanent effects of equipments on attributes", check => {
            var ship = new Ship(null, "Test");
            var slot: Slot;
            var equipment: Equipment;

            slot = ship.addSlot(SlotType.Power);
            equipment = new Equipment();
            equipment.slot_type = slot.type;
            equipment.effects.push(new AttributeEffect("power_capacity", 4));
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Power);
            equipment = new Equipment();
            equipment.slot_type = slot.type;
            equipment.effects.push(new AttributeEffect("power_capacity", 5));
            slot.attach(equipment);

            ship.updateAttributes();
            check.equals(ship.attributes.power_capacity.get(), 9);
        });

        test.case("repairs hull and recharges shield", check => {
            var ship = new Ship(null, "Test");

            TestTools.setAttribute(ship, "hull_capacity", 120);
            TestTools.setAttribute(ship, "shield_capacity", 150);

            check.equals(ship.getValue("hull"), 0);
            check.equals(ship.getValue("shield"), 0);

            ship.restoreHealth();

            check.equals(ship.getValue("hull"), 120);
            check.equals(ship.getValue("shield"), 150);
        });

        test.case("checks if a ship is able to play", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();
            ship.setValue("hull", 10);

            check.equals(ship.isAbleToPlay(), false);
            check.equals(ship.isAbleToPlay(false), true);

            ship.setValue("power", 5);

            check.equals(ship.isAbleToPlay(), true);
            check.equals(ship.isAbleToPlay(false), true);

            ship.setDead();

            check.equals(ship.isAbleToPlay(), false);
            check.equals(ship.isAbleToPlay(false), false);
        });

        test.case("counts attached equipment", check => {
            var ship = new Ship();

            check.equals(ship.getEquipmentCount(), 0);

            ship.addSlot(SlotType.Hull).attach(new Equipment(SlotType.Hull));
            ship.addSlot(SlotType.Shield);
            ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));

            check.equals(ship.getEquipmentCount(), 2);
        });

        test.case("can pick a random attached equipment", check => {
            var ship = new Ship();

            check.equals(ship.getRandomEquipment(), null);

            ship.addSlot(SlotType.Hull).attach(new Equipment(SlotType.Hull));
            ship.addSlot(SlotType.Shield);
            ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));

            var random = new SkewedRandomGenerator([0.2]);
            var picked = ship.getRandomEquipment(random);
            check.notequals(picked, null);
            check.same(picked, ship.slots[0].attached);

            random = new SkewedRandomGenerator([0.999999]);
            picked = ship.getRandomEquipment(random);
            check.notequals(picked, null);
            check.same(picked, ship.slots[2].attached);
        });

        test.case("checks if a ship is inside a given circle", check => {
            let ship = new Ship();
            ship.arena_x = 5;
            ship.arena_y = 8;

            check.equals(ship.isInCircle(5, 8, 0), true);
            check.equals(ship.isInCircle(5, 8, 1), true);
            check.equals(ship.isInCircle(5, 7, 1), true);
            check.equals(ship.isInCircle(6, 9, 1.7), true);
            check.equals(ship.isInCircle(5, 8.1, 0), false);
            check.equals(ship.isInCircle(5, 7, 0.9), false);
            check.equals(ship.isInCircle(12, -4, 5), false);
        });

        test.case("stores items in cargo space", check => {
            let ship = new Ship();
            let equipment1 = new Equipment();
            let equipment2 = new Equipment();

            let result = ship.addCargo(equipment1);
            check.equals(result, false);
            check.equals(ship.cargo, []);
            check.equals(ship.getFreeCargoSpace(), 0);

            ship.setCargoSpace(1);
            check.equals(ship.getFreeCargoSpace(), 1);

            result = ship.addCargo(equipment1);
            check.equals(result, true);
            check.equals(ship.cargo, [equipment1]);
            check.equals(ship.getFreeCargoSpace(), 0);

            result = ship.addCargo(equipment1);
            check.equals(result, false);
            check.equals(ship.cargo, [equipment1]);

            result = ship.addCargo(equipment2);
            check.equals(result, false);
            check.equals(ship.cargo, [equipment1]);

            ship.setCargoSpace(2);
            check.equals(ship.getFreeCargoSpace(), 1);

            result = ship.addCargo(equipment2);
            check.equals(result, true);
            check.equals(ship.cargo, [equipment1, equipment2]);
            check.equals(ship.getFreeCargoSpace(), 0);

            ship.setCargoSpace(1);
            check.equals(ship.cargo, [equipment1]);
            check.equals(ship.getFreeCargoSpace(), 0);

            ship.setCargoSpace(2);
            check.equals(ship.cargo, [equipment1]);
            check.equals(ship.getFreeCargoSpace(), 1);
        });

        test.case("equips items from cargo", check => {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Weapon);
            let slot = ship.addSlot(SlotType.Weapon);
            check.equals(ship.listEquipment(), []);

            let result = ship.equip(equipment);
            check.equals(result, false);
            check.equals(ship.listEquipment(), []);

            ship.setCargoSpace(1);
            ship.addCargo(equipment);

            result = ship.equip(equipment);
            check.equals(result, true);
            check.equals(ship.listEquipment(SlotType.Weapon), [equipment]);
            check.equals(equipment.attached_to, slot);
        });

        test.case("removes equipped items", check => {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Weapon);
            let slot = ship.addSlot(SlotType.Weapon);
            slot.attach(equipment);

            check.equals(ship.listEquipment(), [equipment]);
            check.same(slot.attached, equipment);
            check.same(equipment.attached_to, slot);

            let result = ship.unequip(equipment);
            check.equals(result, false);
            check.equals(ship.listEquipment(), [equipment]);
            check.equals(ship.cargo, []);

            ship.setCargoSpace(10);

            result = ship.unequip(equipment);
            check.equals(result, true);
            check.equals(ship.listEquipment(), []);
            check.equals(ship.cargo, [equipment]);
            check.equals(slot.attached, null);
            check.equals(equipment.attached_to, null);

            result = ship.unequip(equipment);
            check.equals(result, false);
            check.equals(ship.listEquipment(), []);
            check.equals(ship.cargo, [equipment]);
        });

        test.case("checks equipment requirements", check => {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Hull);
            check.equals(ship.canEquip(equipment), null);

            ship.addSlot(SlotType.Engine);
            check.equals(ship.canEquip(equipment), null);

            let slot = ship.addSlot(SlotType.Hull);
            check.same(ship.canEquip(equipment), slot);

            equipment.requirements["skill_photons"] = 2;
            check.equals(ship.canEquip(equipment), null);

            ship.upgradeSkill("skill_photons");
            check.equals(ship.canEquip(equipment), null);

            ship.upgradeSkill("skill_photons");
            check.same(ship.canEquip(equipment), slot);

            slot.attach(new Equipment(SlotType.Hull));
            check.equals(ship.canEquip(equipment), null);
        });

        test.case("allow skills upgrading from current level", check => {
            let ship = new Ship();
            check.equals(ship.level.get(), 1);
            check.equals(ship.getAvailableUpgradePoints(), 10);

            ship.level.forceLevel(2);
            check.equals(ship.level.get(), 2);
            check.equals(ship.getAvailableUpgradePoints(), 15);

            check.equals(ship.getAttribute("skill_photons"), 0);
            ship.upgradeSkill("skill_photons");
            check.equals(ship.getAttribute("skill_photons"), 1);

            range(50).forEach(() => ship.upgradeSkill("skill_gravity"));
            check.equals(ship.getAttribute("skill_photons"), 1);
            check.equals(ship.getAttribute("skill_gravity"), 14);
            check.equals(ship.getAvailableUpgradePoints(), 0);

            ship.updateAttributes();
            check.equals(ship.getAttribute("skill_photons"), 1);
            check.equals(ship.getAttribute("skill_gravity"), 14);
        });

        test.case("restores as new at the end of battle", check => {
            let ship = new Ship();
            TestTools.setShipHP(ship, 10, 20);
            TestTools.setShipAP(ship, 5, 0);
            ship.setValue("hull", 5);
            ship.setValue("shield", 15);
            ship.setValue("power", 2);
            ship.active_effects.add(new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 12));
            ship.updateAttributes();

            check.in("before", check => {
                check.equals(ship.getValue("hull"), 5, "hull");
                check.equals(ship.getValue("shield"), 15, "shield");
                check.equals(ship.getValue("power"), 2, "power");
                check.equals(ship.active_effects.count(), 1, "effects count");
                check.equals(ship.getAttribute("power_capacity"), 3, "power capacity");
            });

            ship.restoreInitialState();

            check.in("after", check => {
                check.equals(ship.getValue("hull"), 10, "hull");
                check.equals(ship.getValue("shield"), 20, "shield");
                check.equals(ship.getValue("power"), 5, "power");
                check.equals(ship.active_effects.count(), 0, "effects count");
                check.equals(ship.getAttribute("power_capacity"), 5, "power capacity");
            });
        });

        test.case("lists active effects", check => {
            let ship = new Ship();
            check.equals(imaterialize(ship.ieffects()), []);

            let equipment = ship.addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine));
            check.equals(imaterialize(ship.ieffects()), []);

            let effect1 = new AttributeEffect("precision", 4);
            equipment.effects.push(effect1);
            check.equals(imaterialize(ship.ieffects()), [effect1]);

            let effect2 = new AttributeLimitEffect("precision", 2);
            ship.active_effects.add(new StickyEffect(effect2, 4));
            check.equals(imaterialize(ship.ieffects()), [effect1, effect2]);
        });

        test.case("gets a textual description of an attribute", check => {
            let ship = new Ship();
            check.equals(ship.getAttributeDescription("skill_photons"), "Forces of light, and electromagnetic radiation");

            let equipment = new Equipment(SlotType.Engine);
            equipment.effects = [new AttributeEffect("skill_photons", 4)];
            equipment.name = "Photonic engine";
            ship.addSlot(SlotType.Engine).attach(equipment);
            check.equals(ship.getAttribute("skill_photons"), 4);
            check.equals(ship.getAttributeDescription("skill_photons"), "Forces of light, and electromagnetic radiation\n\nPhotonic engine Mk1: +4");

            ship.level.forceLevelUp();
            ship.upgradeSkill("skill_photons");
            ship.upgradeSkill("skill_photons");
            check.equals(ship.getAttributeDescription("skill_photons"), "Forces of light, and electromagnetic radiation\n\nLevelled up: +2\nPhotonic engine Mk1: +4");

            ship.active_effects.add(new StickyEffect(new AttributeLimitEffect("skill_photons", 3)));
            check.equals(ship.getAttributeDescription("skill_photons"), "Forces of light, and electromagnetic radiation\n\nLevelled up: +2\nPhotonic engine Mk1: +4\n???: limit to 3");
        });

        test.case("produces death diffs", check => {
            let battle = TestTools.createBattle(1);
            let ship = nn(battle.playing_ship);

            check.equals(ship.getDeathDiffs(battle), [
                new ShipValueDiff(ship, "hull", -1),
                new ShipDeathDiff(battle, ship),
            ]);

            let effect1 = ship.active_effects.add(new AttributeEffect("skill_quantum", 2));
            let effect2 = ship.active_effects.add(new StickyEffect(new AttributeEffect("skill_materials", 4)));
            let weapon1 = TestTools.addWeapon(ship);
            weapon1.action = new ToggleAction(weapon1, 3);
            let weapon2 = TestTools.addWeapon(ship);
            let action = weapon2.action = new ToggleAction(weapon2, 3);
            action.activated = true;

            check.equals(ship.getDeathDiffs(battle), [
                new ShipEffectRemovedDiff(ship, effect1),
                new ShipAttributeDiff(ship, "skill_quantum", {}, { cumulative: 2 }),
                new ShipEffectRemovedDiff(ship, effect2),
                new ShipAttributeDiff(ship, "skill_materials", {}, { cumulative: 4 }),
                new ShipActionToggleDiff(ship, action, false),
                new ShipValueDiff(ship, "hull", -1),
                new ShipDeathDiff(battle, ship),
            ]);
        });
    });
}
