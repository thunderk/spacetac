module TK.SpaceTac.Specs {
    describe("Ship", function () {
        it("creates a full name", function () {
            let ship = new Ship();
            expect(ship.getFullName(false)).toEqual("Level 1 unnamed");

            ship.name = "Titan";
            expect(ship.getFullName(false)).toEqual("Level 1 Titan");

            ship.level.forceLevel(3);
            expect(ship.getFullName(false)).toEqual("Level 3 Titan");

            ship.fleet.player.name = "Emperor";
            expect(ship.getFullName(true)).toEqual("Emperor's Level 3 Titan");
        });

        it("moves and computes facing angle", function () {
            let ship = new Ship(null, "Test");
            let engine = TestTools.addEngine(ship, 50);
            ship.setArenaFacingAngle(0);
            ship.setArenaPosition(50, 50);

            expect(ship.arena_x).toEqual(50);
            expect(ship.arena_y).toEqual(50);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(51, 50, engine);
            expect(ship.arena_x).toEqual(51);
            expect(ship.arena_y).toEqual(50);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(50, 50, engine);
            expect(ship.arena_angle).toBeCloseTo(3.14159265, 0.00001);

            ship.moveTo(51, 51, engine);
            expect(ship.arena_angle).toBeCloseTo(0.785398, 0.00001);

            ship.moveTo(51, 52, engine);
            expect(ship.arena_angle).toBeCloseTo(1.5707963, 0.00001);

            ship.moveTo(52, 52, engine);
            expect(ship.arena_x).toEqual(52);
            expect(ship.arena_y).toEqual(52);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(52, 50, engine);
            expect(ship.arena_angle).toBeCloseTo(-1.5707963, 0.00001);

            ship.moveTo(50, 50, engine);
            expect(ship.arena_angle).toBeCloseTo(3.14159265, 0.00001);

            let battle = new Battle();
            battle.fleets[0].addShip(ship);
            expect(battle.log.events).toEqual([]);

            ship.moveTo(70, 50, engine);
            expect(battle.log.events).toEqual([new MoveEvent(ship, new ArenaLocationAngle(50, 50, Math.PI), new ArenaLocationAngle(70, 50, 0), engine)]);

            battle.log.clear();
            ship.rotate(2.1);
            expect(battle.log.events).toEqual([
                new MoveEvent(ship, new ArenaLocationAngle(70, 50, 0), new ArenaLocationAngle(70, 50, 2.1))
            ]);

            battle.log.clear();
            ship.moveTo(0, 0, null);
            expect(battle.log.events).toEqual([
                new MoveEvent(ship, new ArenaLocationAngle(70, 50, 2.1), new ArenaLocationAngle(0, 0, 2.1))
            ]);
        });

        it("applies equipment cooldown", function () {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Weapon);
            equipment.cooldown.configure(1, 2);
            ship.addSlot(SlotType.Weapon).attach(equipment);

            expect(equipment.cooldown.canUse()).toBe(true, 1);
            equipment.cooldown.use();
            expect(equipment.cooldown.canUse()).toBe(false, 2);

            ship.startBattle();
            expect(equipment.cooldown.canUse()).toBe(true, 3);

            ship.startTurn();
            equipment.cooldown.use();
            expect(equipment.cooldown.canUse()).toBe(false, 4);
            ship.endTurn();
            expect(equipment.cooldown.canUse()).toBe(false, 5);

            ship.startTurn();
            expect(equipment.cooldown.canUse()).toBe(false, 6);
            ship.endTurn();
            expect(equipment.cooldown.canUse()).toBe(true, 7);
        });

        it("lists available actions from attached equipment", function () {
            var ship = new Ship(null, "Test");
            var actions: BaseAction[];
            var slot: Slot;
            var equipment: Equipment;

            actions = ship.getAvailableActions();
            expect(actions.length).toBe(1);
            expect(actions[0].code).toEqual("endturn");

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
            expect(actions.length).toBe(3);
            expect(actions[0].code).toEqual("move");
            expect(actions[1].code).toEqual("fire-equipment");
            expect(actions[2].code).toEqual("endturn");
        });

        it("applies permanent effects of equipments on attributes", function () {
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
            expect(ship.attributes.power_capacity.get()).toBe(9);
        });

        it("repairs hull and recharges shield", function () {
            var ship = new Ship(null, "Test");

            ship.setAttribute("hull_capacity", 120);
            ship.setAttribute("shield_capacity", 150);

            expect(ship.values.hull.get()).toEqual(0);
            expect(ship.values.shield.get()).toEqual(0);

            ship.restoreHealth();

            expect(ship.values.hull.get()).toEqual(120);
            expect(ship.values.shield.get()).toEqual(150);
        });

        it("applies and logs hull and shield damage", function () {
            var fleet = new Fleet();
            var battle = new Battle(fleet);
            var ship = new Ship(fleet);

            TestTools.setShipHP(ship, 150, 400);
            ship.restoreHealth();
            battle.log.clear();

            ship.addDamage(10, 20);
            expect(ship.values.hull.get()).toEqual(140);
            expect(ship.values.shield.get()).toEqual(380);
            expect(battle.log.events.length).toBe(3);
            expect(battle.log.events[0]).toEqual(new ValueChangeEvent(ship, ship.values.shield, -20));
            expect(battle.log.events[1]).toEqual(new ValueChangeEvent(ship, ship.values.hull, -10));
            expect(battle.log.events[2]).toEqual(new DamageEvent(ship, 10, 20));

            battle.log.clear();

            ship.addDamage(15, 25, false);
            expect(ship.values.hull.get()).toEqual(125);
            expect(ship.values.shield.get()).toEqual(355);
            expect(battle.log.events.length).toBe(0);

            ship.addDamage(125, 355, false);
            expect(ship.values.hull.get()).toEqual(0);
            expect(ship.values.shield.get()).toEqual(0);
            expect(ship.alive).toBe(false);
        });

        it("sets and logs sticky effects", function () {
            var ship = new Ship();
            var battle = new Battle(ship.fleet);

            ship.addStickyEffect(new StickyEffect(new BaseEffect("test"), 2, false, true));

            expect(ship.sticky_effects).toEqual([new StickyEffect(new BaseEffect("test"), 2, false, true)]);
            expect(battle.log.events).toEqual([
                new ActiveEffectsEvent(ship, [], [new StickyEffect(new BaseEffect("test"), 2, false, true)])
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            expect(ship.sticky_effects).toEqual([new StickyEffect(new BaseEffect("test"), 1, false, true)]);
            expect(battle.log.events).toEqual([
                new ActiveEffectsEvent(ship, [], [new StickyEffect(new BaseEffect("test"), 1, false, true)])
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            expect(ship.sticky_effects).toEqual([]);
            expect(battle.log.events).toEqual([
                new ActiveEffectsEvent(ship, [], [new StickyEffect(new BaseEffect("test"), 0, false, true)]),
                new ActiveEffectsEvent(ship, [], [])
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            expect(ship.sticky_effects).toEqual([]);
            expect(battle.log.events).toEqual([]);
        });

        it("resets toggle actions at the start of turn", function () {
            let ship = new Ship();
            let equ = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            let action = equ.action = new ToggleAction(equ, 0, 10, [new AttributeEffect("power_capacity", 1)]);
            expect(action.activated).toBe(false);

            let battle = new Battle(ship.fleet);
            TestTools.setShipPlaying(battle, ship);

            ship.startTurn();
            expect(action.activated).toBe(false);

            let result = action.apply(ship);
            expect(result).toBe(true, "Could not be applied");
            expect(action.activated).toBe(true);

            ship.endTurn();
            expect(action.activated).toBe(true);

            ship.startTurn();
            expect(action.activated).toBe(false);

            expect(battle.log.events).toEqual([
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

        it("updates area effects when the ship moves", function () {
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

            expect(ship1.getAttribute("shield_capacity")).toBe(5);
            expect(ship2.getAttribute("shield_capacity")).toBe(5);
            expect(ship3.getAttribute("shield_capacity")).toBe(0);

            ship1.moveTo(15, 0);

            expect(ship1.getAttribute("shield_capacity")).toBe(5);
            expect(ship2.getAttribute("shield_capacity")).toBe(5);
            expect(ship3.getAttribute("shield_capacity")).toBe(5);

            ship1.moveTo(30, 0);

            expect(ship1.getAttribute("shield_capacity")).toBe(5);
            expect(ship2.getAttribute("shield_capacity")).toBe(0);
            expect(ship3.getAttribute("shield_capacity")).toBe(5);

            ship1.moveTo(50, 0);

            expect(ship1.getAttribute("shield_capacity")).toBe(5);
            expect(ship2.getAttribute("shield_capacity")).toBe(0);
            expect(ship3.getAttribute("shield_capacity")).toBe(0);

            ship2.moveTo(40, 0);

            expect(ship1.getAttribute("shield_capacity")).toBe(5);
            expect(ship2.getAttribute("shield_capacity")).toBe(5);
            expect(ship3.getAttribute("shield_capacity")).toBe(0);
        });

        it("sets and logs death state", function () {
            var fleet = new Fleet();
            var battle = new Battle(fleet);
            var ship = new Ship(fleet);

            expect(ship.alive).toBe(true);

            ship.values.hull.set(10);
            battle.log.clear();
            ship.addDamage(5, 0);

            expect(ship.alive).toBe(true);
            expect(battle.log.events.length).toBe(2);
            expect(battle.log.events[0].code).toEqual("value");
            expect(battle.log.events[1].code).toEqual("damage");

            battle.log.clear();
            ship.addDamage(5, 0);

            expect(ship.alive).toBe(false);
            expect(battle.log.events.length).toBe(3);
            expect(battle.log.events[0].code).toEqual("value");
            expect(battle.log.events[1].code).toEqual("damage");
            expect(battle.log.events[2].code).toEqual("death");
        });

        it("checks if a ship is able to play", function () {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            expect(ship.isAbleToPlay()).toBe(false);
            expect(ship.isAbleToPlay(false)).toBe(true);

            ship.values.power.set(5);

            expect(ship.isAbleToPlay()).toBe(true);
            expect(ship.isAbleToPlay(false)).toBe(true);

            ship.values.hull.set(10);
            ship.addDamage(8, 0);

            expect(ship.isAbleToPlay()).toBe(true);
            expect(ship.isAbleToPlay(false)).toBe(true);

            ship.addDamage(8, 0);

            expect(ship.isAbleToPlay()).toBe(false);
            expect(ship.isAbleToPlay(false)).toBe(false);
        });

        it("counts attached equipment", function () {
            var ship = new Ship();

            expect(ship.getEquipmentCount()).toBe(0);

            ship.addSlot(SlotType.Hull).attach(new Equipment(SlotType.Hull));
            ship.addSlot(SlotType.Shield);
            ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));

            expect(ship.getEquipmentCount()).toBe(2);
        });

        it("can pick a random attached equipment", function () {
            var ship = new Ship();

            expect(ship.getRandomEquipment()).toBe(null);

            ship.addSlot(SlotType.Hull).attach(new Equipment(SlotType.Hull));
            ship.addSlot(SlotType.Shield);
            ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));

            var random = new SkewedRandomGenerator([0.2]);
            var picked = ship.getRandomEquipment(random);
            expect(picked).not.toBeNull();
            expect(picked).toBe(ship.slots[0].attached);

            random = new SkewedRandomGenerator([0.999999]);
            picked = ship.getRandomEquipment(random);
            expect(picked).not.toBeNull();
            expect(picked).toBe(ship.slots[2].attached);
        });

        it("recover action points at end of turn", function () {
            var ship = new Ship();

            let power_generator = new Equipment(SlotType.Power);
            power_generator.effects = [
                new AttributeEffect("power_capacity", 8),
                new AttributeEffect("power_generation", 3),
            ]
            ship.addSlot(SlotType.Power).attach(power_generator);

            expect(ship.values.power.get()).toBe(0);
            ship.initializeActionPoints();
            expect(ship.values.power.get()).toBe(8);
            ship.values.power.set(3);
            expect(ship.values.power.get()).toBe(3);
            ship.recoverActionPoints();
            expect(ship.values.power.get()).toBe(6);
            ship.recoverActionPoints();
            expect(ship.values.power.get()).toBe(8);
        });

        it("checks if a ship is inside a given circle", function () {
            let ship = new Ship();
            ship.arena_x = 5;
            ship.arena_y = 8;

            expect(ship.isInCircle(5, 8, 0)).toBe(true);
            expect(ship.isInCircle(5, 8, 1)).toBe(true);
            expect(ship.isInCircle(5, 7, 1)).toBe(true);
            expect(ship.isInCircle(6, 9, 1.7)).toBe(true);
            expect(ship.isInCircle(5, 8.1, 0)).toBe(false);
            expect(ship.isInCircle(5, 7, 0.9)).toBe(false);
            expect(ship.isInCircle(12, -4, 5)).toBe(false);
        });

        it("stores items in cargo space", function () {
            let ship = new Ship();
            let equipment1 = new Equipment();
            let equipment2 = new Equipment();

            let result = ship.addCargo(equipment1);
            expect(result).toBe(false);
            expect(ship.cargo).toEqual([]);
            expect(ship.getFreeCargoSpace()).toBe(0);

            ship.setCargoSpace(1);
            expect(ship.getFreeCargoSpace()).toBe(1);

            result = ship.addCargo(equipment1);
            expect(result).toBe(true);
            expect(ship.cargo).toEqual([equipment1]);
            expect(ship.getFreeCargoSpace()).toBe(0);

            result = ship.addCargo(equipment1);
            expect(result).toBe(false);
            expect(ship.cargo).toEqual([equipment1]);

            result = ship.addCargo(equipment2);
            expect(result).toBe(false);
            expect(ship.cargo).toEqual([equipment1]);

            ship.setCargoSpace(2);
            expect(ship.getFreeCargoSpace()).toBe(1);

            result = ship.addCargo(equipment2);
            expect(result).toBe(true);
            expect(ship.cargo).toEqual([equipment1, equipment2]);
            expect(ship.getFreeCargoSpace()).toBe(0);

            ship.setCargoSpace(1);
            expect(ship.cargo).toEqual([equipment1]);
            expect(ship.getFreeCargoSpace()).toBe(0);

            ship.setCargoSpace(2);
            expect(ship.cargo).toEqual([equipment1]);
            expect(ship.getFreeCargoSpace()).toBe(1);
        });

        it("equips items from cargo", function () {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Weapon);
            let slot = ship.addSlot(SlotType.Weapon);
            expect(ship.listEquipment()).toEqual([]);

            let result = ship.equip(equipment);
            expect(result).toBe(false);
            expect(ship.listEquipment()).toEqual([]);

            ship.setCargoSpace(1);
            ship.addCargo(equipment);

            result = ship.equip(equipment);
            expect(result).toBe(true);
            expect(ship.listEquipment(SlotType.Weapon)).toEqual([equipment]);
            expect(equipment.attached_to).toEqual(slot);
        });

        it("removes equipped items", function () {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Weapon);
            let slot = ship.addSlot(SlotType.Weapon);
            slot.attach(equipment);

            expect(ship.listEquipment()).toEqual([equipment]);
            expect(slot.attached).toBe(equipment);
            expect(equipment.attached_to).toBe(slot);

            let result = ship.unequip(equipment);
            expect(result).toBe(false);
            expect(ship.listEquipment()).toEqual([equipment]);
            expect(ship.cargo).toEqual([]);

            ship.setCargoSpace(10);

            result = ship.unequip(equipment);
            expect(result).toBe(true);
            expect(ship.listEquipment()).toEqual([]);
            expect(ship.cargo).toEqual([equipment]);
            expect(slot.attached).toBe(null);
            expect(equipment.attached_to).toBe(null);

            result = ship.unequip(equipment);
            expect(result).toBe(false);
            expect(ship.listEquipment()).toEqual([]);
            expect(ship.cargo).toEqual([equipment]);
        });

        it("checks equipment requirements", function () {
            let ship = new Ship();
            let equipment = new Equipment(SlotType.Hull);
            expect(ship.canEquip(equipment)).toBe(null);

            ship.addSlot(SlotType.Engine);
            expect(ship.canEquip(equipment)).toBe(null);

            let slot = ship.addSlot(SlotType.Hull);
            expect(ship.canEquip(equipment)).toBe(slot);

            equipment.requirements["skill_photons"] = 2;
            expect(ship.canEquip(equipment)).toBe(null);

            ship.upgradeSkill("skill_photons");
            expect(ship.canEquip(equipment)).toBe(null);

            ship.upgradeSkill("skill_photons");
            expect(ship.canEquip(equipment)).toBe(slot);

            slot.attach(new Equipment(SlotType.Hull));
            expect(ship.canEquip(equipment)).toBe(null);
        });

        it("allow skills upgrading from current level", function () {
            let ship = new Ship();
            expect(ship.level.get()).toBe(1);
            expect(ship.getAvailableUpgradePoints()).toBe(10);

            ship.level.forceLevel(2);
            expect(ship.level.get()).toBe(2);
            expect(ship.getAvailableUpgradePoints()).toBe(15);

            expect(ship.getAttribute("skill_photons")).toBe(0);
            ship.upgradeSkill("skill_photons");
            expect(ship.getAttribute("skill_photons")).toBe(1);

            range(50).forEach(() => ship.upgradeSkill("skill_gravity"));
            expect(ship.getAttribute("skill_photons")).toBe(1);
            expect(ship.getAttribute("skill_gravity")).toBe(14);
            expect(ship.getAvailableUpgradePoints()).toBe(0);

            ship.updateAttributes();
            expect(ship.getAttribute("skill_photons")).toBe(1);
            expect(ship.getAttribute("skill_gravity")).toBe(14);
        });

        it("restores as new at the end of battle", function () {
            let ship = new Ship();
            TestTools.setShipHP(ship, 10, 20);
            TestTools.setShipAP(ship, 5, 0);
            ship.addDamage(5, 5);
            ship.addStickyEffect(new StickyEffect(new DamageEffect(10), 8));
            ship.addStickyEffect(new StickyEffect(new AttributeLimitEffect("power_capacity", 3), 12));
            ship.updateAttributes();

            expect(ship.getValue("hull")).toEqual(5);
            expect(ship.getValue("shield")).toEqual(15);
            expect(ship.getValue("power")).toEqual(3);
            expect(ship.sticky_effects.length).toEqual(2);
            expect(ship.getAttribute("power_capacity")).toEqual(3);

            ship.endBattle(1);

            expect(ship.getValue("hull")).toEqual(10);
            expect(ship.getValue("shield")).toEqual(20);
            expect(ship.getValue("power")).toEqual(5);
            expect(ship.sticky_effects.length).toEqual(0);
            expect(ship.getAttribute("power_capacity")).toEqual(5);
        });

        it("lists active effects", function () {
            let ship = new Ship();
            expect(imaterialize(ship.ieffects())).toEqual([]);

            let equipment = ship.addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine));
            expect(imaterialize(ship.ieffects())).toEqual([]);

            equipment.effects.push(new AttributeEffect("precision", 4));
            expect(imaterialize(ship.ieffects())).toEqual([
                new AttributeEffect("precision", 4)
            ]);

            ship.addStickyEffect(new StickyEffect(new AttributeLimitEffect("precision", 2), 4));
            expect(imaterialize(ship.ieffects())).toEqual([
                new AttributeEffect("precision", 4),
                new AttributeLimitEffect("precision", 2)
            ]);
        });

        it("gets a textual description of an attribute", function () {
            let ship = new Ship();
            expect(ship.getAttributeDescription("skill_photons")).toEqual("Forces of light, and electromagnetic radiation");

            let equipment = new Equipment(SlotType.Engine);
            equipment.effects = [new AttributeEffect("skill_photons", 4)];
            equipment.name = "Photonic engine";
            ship.addSlot(SlotType.Engine).attach(equipment);
            expect(ship.getAttribute("skill_photons")).toBe(4);
            expect(ship.getAttributeDescription("skill_photons")).toEqual("Forces of light, and electromagnetic radiation\n\nPhotonic engine Mk1: +4");

            ship.level.forceLevelUp();
            ship.upgradeSkill("skill_photons");
            ship.upgradeSkill("skill_photons");
            expect(ship.getAttributeDescription("skill_photons")).toEqual("Forces of light, and electromagnetic radiation\n\nLevelled up: +2\nPhotonic engine Mk1: +4");

            ship.addStickyEffect(new StickyEffect(new AttributeLimitEffect("skill_photons", 3)));
            expect(ship.getAttributeDescription("skill_photons")).toEqual("Forces of light, and electromagnetic radiation\n\nLevelled up: +2\nPhotonic engine Mk1: +4\n???: limit to 3");
        });
    });
}
