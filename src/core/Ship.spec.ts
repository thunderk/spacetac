module TK.SpaceTac.Specs {
    testing("Ship", test => {
        test.case("creates a full name", check => {
            let ship = new Ship();
            check.equals(ship.getFullName(false), "Level 1 unnamed");

            ship.name = "Titan";
            check.equals(ship.getFullName(false), "Level 1 Titan");

            ship.level.forceLevel(3);
            check.equals(ship.getFullName(false), "Level 3 Titan");

            ship.fleet.player.name = "Emperor";
            check.equals(ship.getFullName(true), "Emperor's Level 3 Titan");
        });

        test.case("moves and computes facing angle", check => {
            let ship = new Ship(null, "Test");
            let engine = TestTools.addEngine(ship, 50);
            ship.setArenaFacingAngle(0);
            ship.setArenaPosition(50, 50);

            check.equals(ship.arena_x, 50);
            check.equals(ship.arena_y, 50);
            check.equals(ship.arena_angle, 0);

            ship.moveTo(51, 50, engine);
            check.equals(ship.arena_x, 51);
            check.equals(ship.arena_y, 50);
            check.equals(ship.arena_angle, 0);

            ship.moveTo(50, 50, engine);
            check.nears(ship.arena_angle, 3.14159265, 5);

            ship.moveTo(51, 51, engine);
            check.nears(ship.arena_angle, 0.785398, 5);

            ship.moveTo(51, 52, engine);
            check.nears(ship.arena_angle, 1.5707963, 5);

            ship.moveTo(52, 52, engine);
            check.equals(ship.arena_x, 52);
            check.equals(ship.arena_y, 52);
            check.equals(ship.arena_angle, 0);

            ship.moveTo(52, 50, engine);
            check.nears(ship.arena_angle, -1.5707963, 5);

            ship.moveTo(50, 50, engine);
            check.nears(ship.arena_angle, 3.14159265, 5);

            let battle = new Battle();
            battle.fleets[0].addShip(ship);
            check.equals(battle.log.events, []);

            ship.moveTo(70, 50, engine);
            check.equals(battle.log.events, [new MoveEvent(ship, new ArenaLocationAngle(50, 50, Math.PI), new ArenaLocationAngle(70, 50, 0), engine)]);

            battle.log.clear();
            ship.rotate(2.1);
            check.equals(battle.log.events, [
                new MoveEvent(ship, new ArenaLocationAngle(70, 50, 0), new ArenaLocationAngle(70, 50, 2.1))
            ]);

            battle.log.clear();
            ship.moveTo(0, 0, null);
            check.equals(battle.log.events, [
                new MoveEvent(ship, new ArenaLocationAngle(70, 50, 2.1), new ArenaLocationAngle(0, 0, 2.1))
            ]);
        });

        test.case("applies equipment cooldown", check => {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Weapon);
            equipment.cooldown.configure(1, 2);
            ship.addSlot(SlotType.Weapon).attach(equipment);

            check.same(equipment.cooldown.canUse(), true, "1");
            equipment.cooldown.use();
            check.same(equipment.cooldown.canUse(), false, "2");

            ship.startBattle();
            check.same(equipment.cooldown.canUse(), true, "3");

            ship.startTurn();
            equipment.cooldown.use();
            check.same(equipment.cooldown.canUse(), false, "4");
            ship.endTurn();
            check.same(equipment.cooldown.canUse(), false, "5");

            ship.startTurn();
            check.same(equipment.cooldown.canUse(), false, "6");
            ship.endTurn();
            check.same(equipment.cooldown.canUse(), true, "7");
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

            ship.setAttribute("hull_capacity", 120);
            ship.setAttribute("shield_capacity", 150);

            check.equals(ship.values.hull.get(), 0);
            check.equals(ship.values.shield.get(), 0);

            ship.restoreHealth();

            check.equals(ship.values.hull.get(), 120);
            check.equals(ship.values.shield.get(), 150);
        });

        test.case("applies and logs hull and shield damage", check => {
            var fleet = new Fleet();
            var battle = new Battle(fleet);
            var ship = new Ship(fleet);

            TestTools.setShipHP(ship, 150, 400);
            ship.restoreHealth();
            battle.log.clear();

            ship.addDamage(10, 20);
            check.equals(ship.values.hull.get(), 140);
            check.equals(ship.values.shield.get(), 380);
            check.equals(battle.log.events.length, 3);
            check.equals(battle.log.events[0], new ValueChangeEvent(ship, ship.values.shield, -20));
            check.equals(battle.log.events[1], new ValueChangeEvent(ship, ship.values.hull, -10));
            check.equals(battle.log.events[2], new DamageEvent(ship, 10, 20));

            battle.log.clear();

            ship.addDamage(15, 25, false);
            check.equals(ship.values.hull.get(), 125);
            check.equals(ship.values.shield.get(), 355);
            check.equals(battle.log.events.length, 0);

            ship.addDamage(125, 355, false);
            check.equals(ship.values.hull.get(), 0);
            check.equals(ship.values.shield.get(), 0);
            check.equals(ship.alive, false);
        });

        test.case("sets and logs sticky effects", check => {
            var ship = new Ship();
            var battle = new Battle(ship.fleet);

            ship.addStickyEffect(new StickyEffect(new BaseEffect("test"), 2, false, true));

            check.equals(ship.sticky_effects, [new StickyEffect(new BaseEffect("test"), 2, false, true)]);
            check.equals(battle.log.events, [
                new ActiveEffectsEvent(ship, [], [new StickyEffect(new BaseEffect("test"), 2, false, true)])
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            check.equals(ship.sticky_effects, [new StickyEffect(new BaseEffect("test"), 1, false, true)]);
            check.equals(battle.log.events, [
                new ActiveEffectsEvent(ship, [], [new StickyEffect(new BaseEffect("test"), 1, false, true)])
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            check.equals(ship.sticky_effects, []);
            check.equals(battle.log.events, [
                new ActiveEffectsEvent(ship, [], [new StickyEffect(new BaseEffect("test"), 0, false, true)]),
                new ActiveEffectsEvent(ship, [], [])
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            check.equals(ship.sticky_effects, []);
            check.equals(battle.log.events, []);
        });

        test.case("resets toggle actions at the start of turn", check => {
            let ship = new Ship();
            let equ = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            let action = equ.action = new ToggleAction(equ, 0, 10, [new AttributeEffect("power_capacity", 1)]);
            check.equals(action.activated, false);

            let battle = new Battle(ship.fleet);
            TestTools.setShipPlaying(battle, ship);

            ship.startTurn();
            check.equals(action.activated, false);

            let result = action.apply(ship);
            check.same(result, true, "Could not be applied");
            check.equals(action.activated, true);

            ship.endTurn();
            check.equals(action.activated, true);

            ship.startTurn();
            check.equals(action.activated, false);

            check.equals(battle.log.events, [
                new ActionAppliedEvent(ship, action, Target.newFromShip(ship), 0),
                new ToggleEvent(ship, action, true),
                new ActiveEffectsEvent(ship, [], [], [new AttributeEffect("power_capacity", 1)]),
                new ValueChangeEvent(ship, new ShipAttribute("power capacity", 1), 1),
                new ActionAppliedEvent(ship, action, Target.newFromShip(ship), 0),
                new ToggleEvent(ship, action, false),
                new ActiveEffectsEvent(ship, [], [], []),
                new ValueChangeEvent(ship, new ShipAttribute("power capacity", 0), -1),
            ]);
        });

        test.case("updates area effects when the ship moves", check => {
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            let ship2 = battle.fleets[0].addShip();
            ship2.setArenaPosition(10, 0);
            let ship3 = battle.fleets[0].addShip();
            ship3.setArenaPosition(20, 0);

            let shield = ship1.addSlot(SlotType.Shield).attach(new Equipment(SlotType.Shield));
            shield.action = new ToggleAction(shield, 0, 15, [new AttributeEffect("shield_capacity", 5)]);
            TestTools.setShipPlaying(battle, ship1);
            shield.action.apply(ship1);

            check.equals(ship1.getAttribute("shield_capacity"), 5);
            check.equals(ship2.getAttribute("shield_capacity"), 5);
            check.equals(ship3.getAttribute("shield_capacity"), 0);

            ship1.moveTo(15, 0);

            check.equals(ship1.getAttribute("shield_capacity"), 5);
            check.equals(ship2.getAttribute("shield_capacity"), 5);
            check.equals(ship3.getAttribute("shield_capacity"), 5);

            ship1.moveTo(30, 0);

            check.equals(ship1.getAttribute("shield_capacity"), 5);
            check.equals(ship2.getAttribute("shield_capacity"), 0);
            check.equals(ship3.getAttribute("shield_capacity"), 5);

            ship1.moveTo(50, 0);

            check.equals(ship1.getAttribute("shield_capacity"), 5);
            check.equals(ship2.getAttribute("shield_capacity"), 0);
            check.equals(ship3.getAttribute("shield_capacity"), 0);

            ship2.moveTo(40, 0);

            check.equals(ship1.getAttribute("shield_capacity"), 5);
            check.equals(ship2.getAttribute("shield_capacity"), 5);
            check.equals(ship3.getAttribute("shield_capacity"), 0);
        });

        test.case("sets and logs death state", check => {
            var fleet = new Fleet();
            var battle = new Battle(fleet);
            var ship = new Ship(fleet);

            check.equals(ship.alive, true);

            ship.values.hull.set(10);
            battle.log.clear();
            ship.addDamage(5, 0);

            check.equals(ship.alive, true);
            check.equals(battle.log.events.length, 2);
            check.equals(battle.log.events[0].code, "value");
            check.equals(battle.log.events[1].code, "damage");

            battle.log.clear();
            ship.addDamage(5, 0);

            check.equals(ship.alive, false);
            check.equals(battle.log.events.length, 3);
            check.equals(battle.log.events[0].code, "value");
            check.equals(battle.log.events[1].code, "damage");
            check.equals(battle.log.events[2].code, "death");
        });

        test.case("checks if a ship is able to play", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            check.equals(ship.isAbleToPlay(), false);
            check.equals(ship.isAbleToPlay(false), true);

            ship.values.power.set(5);

            check.equals(ship.isAbleToPlay(), true);
            check.equals(ship.isAbleToPlay(false), true);

            ship.values.hull.set(10);
            ship.addDamage(8, 0);

            check.equals(ship.isAbleToPlay(), true);
            check.equals(ship.isAbleToPlay(false), true);

            ship.addDamage(8, 0);

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

        test.case("recover action points at end of turn", check => {
            var ship = new Ship();

            let power_generator = new Equipment(SlotType.Power);
            power_generator.effects = [
                new AttributeEffect("power_capacity", 8),
                new AttributeEffect("power_generation", 3),
            ]
            ship.addSlot(SlotType.Power).attach(power_generator);

            check.equals(ship.values.power.get(), 0);
            ship.initializeActionPoints();
            check.equals(ship.values.power.get(), 8);
            ship.values.power.set(3);
            check.equals(ship.values.power.get(), 3);
            ship.recoverActionPoints();
            check.equals(ship.values.power.get(), 6);
            ship.recoverActionPoints();
            check.equals(ship.values.power.get(), 8);
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
            ship.addDamage(5, 5);
            ship.addStickyEffect(new StickyEffect(new DamageEffect(10), 8));
            ship.addStickyEffect(new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 12));
            ship.updateAttributes();

            check.equals(ship.getValue("hull"), 5);
            check.equals(ship.getValue("shield"), 15);
            check.equals(ship.getValue("power"), 3);
            check.equals(ship.sticky_effects.length, 2);
            check.equals(ship.getAttribute("power_capacity"), 3);

            ship.endBattle(1);

            check.equals(ship.getValue("hull"), 10);
            check.equals(ship.getValue("shield"), 20);
            check.equals(ship.getValue("power"), 5);
            check.equals(ship.sticky_effects.length, 0);
            check.equals(ship.getAttribute("power_capacity"), 5);
        });

        test.case("lists active effects", check => {
            let ship = new Ship();
            check.equals(imaterialize(ship.ieffects()), []);

            let equipment = ship.addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine));
            check.equals(imaterialize(ship.ieffects()), []);

            equipment.effects.push(new AttributeEffect("precision", 4));
            check.equals(imaterialize(ship.ieffects()), [
                new AttributeEffect("precision", 4)
            ]);

            ship.addStickyEffect(new StickyEffect(new AttributeLimitEffect("precision", 2), 4));
            check.equals(imaterialize(ship.ieffects()), [
                new AttributeEffect("precision", 4),
                new AttributeLimitEffect("precision", 2)
            ]);
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

            ship.addStickyEffect(new StickyEffect(new AttributeLimitEffect("skill_photons", 3)));
            check.equals(ship.getAttributeDescription("skill_photons"), "Forces of light, and electromagnetic radiation\n\nLevelled up: +2\nPhotonic engine Mk1: +4\n???: limit to 3");
        });
    });
}
