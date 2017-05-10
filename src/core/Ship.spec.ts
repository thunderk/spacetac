module TS.SpaceTac.Specs {
    describe("Ship", function () {
        it("moves and computes facing angle", function () {
            var ship = new Ship(null, "Test");
            ship.setArenaFacingAngle(0);
            ship.setArenaPosition(50, 50);

            expect(ship.arena_x).toEqual(50);
            expect(ship.arena_y).toEqual(50);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(51, 50);
            expect(ship.arena_x).toEqual(51);
            expect(ship.arena_y).toEqual(50);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(50, 50);
            expect(ship.arena_angle).toBeCloseTo(3.14159265, 0.00001);

            ship.moveTo(51, 51);
            expect(ship.arena_angle).toBeCloseTo(0.785398, 0.00001);

            ship.moveTo(51, 52);
            expect(ship.arena_angle).toBeCloseTo(1.5707963, 0.00001);

            ship.moveTo(52, 52);
            expect(ship.arena_x).toEqual(52);
            expect(ship.arena_y).toEqual(52);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(52, 50);
            expect(ship.arena_angle).toBeCloseTo(-1.5707963, 0.00001);

            ship.moveTo(50, 50);
            expect(ship.arena_angle).toBeCloseTo(3.14159265, 0.00001);
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
            equipment = new Equipment();
            equipment.slot_type = slot.type;
            equipment.action = new MoveAction(equipment);
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Weapon);
            equipment = new Equipment();
            equipment.slot_type = slot.type;
            slot.attach(equipment);

            actions = ship.getAvailableActions();
            expect(actions.length).toBe(2);
            expect(actions[0].code).toEqual("move");
            expect(actions[1].code).toEqual("endturn");
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
                new EffectAddedEvent(ship, new StickyEffect(new BaseEffect("test"), 2, false, true))
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            expect(ship.sticky_effects).toEqual([new StickyEffect(new BaseEffect("test"), 1, false, true)]);
            expect(battle.log.events).toEqual([
                new EffectDurationChangedEvent(ship, new StickyEffect(new BaseEffect("test"), 1, false, true), 2)
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            expect(ship.sticky_effects).toEqual([]);
            expect(battle.log.events).toEqual([
                new EffectDurationChangedEvent(ship, new StickyEffect(new BaseEffect("test"), 0, false, true), 1),
                new EffectRemovedEvent(ship, new StickyEffect(new BaseEffect("test"), 0, false, true))
            ]);

            ship.startTurn();
            battle.log.clear();
            ship.endTurn();

            expect(ship.sticky_effects).toEqual([]);
            expect(battle.log.events).toEqual([]);
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
            var ship = new Ship();

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
                new AttributeEffect("power_recovery", 3),
                new AttributeEffect("power_initial", 4)
            ]
            ship.addSlot(SlotType.Power).attach(power_generator);

            expect(ship.values.power.get()).toBe(0);
            ship.initializeActionPoints();
            expect(ship.values.power.get()).toBe(4);
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

        it("broadcasts to drones", function () {
            let battle = new Battle();
            let fleet = new Fleet();
            fleet.setBattle(battle);
            let ship = new Ship(fleet);
            let drone = new Drone(ship);

            let onTurnStart = spyOn(drone, "onTurnStart");
            let onTurnEnd = spyOn(drone, "onTurnEnd");
            let onShipMove = spyOn(drone, "onShipMove");

            battle.addDrone(drone);

            expect(onTurnStart).toHaveBeenCalledTimes(0);
            expect(onTurnEnd).toHaveBeenCalledTimes(0);
            expect(onShipMove).toHaveBeenCalledTimes(0);

            ship.startTurn();

            expect(onTurnStart).toHaveBeenCalledTimes(1);
            expect(onTurnStart).toHaveBeenCalledWith(ship);
            expect(onTurnEnd).toHaveBeenCalledTimes(0);
            expect(onShipMove).toHaveBeenCalledTimes(0);

            ship.moveTo(10, 10);

            expect(onTurnStart).toHaveBeenCalledTimes(1);
            expect(onTurnEnd).toHaveBeenCalledTimes(0);
            expect(onShipMove).toHaveBeenCalledTimes(1);
            expect(onShipMove).toHaveBeenCalledWith(ship);

            ship.endTurn();

            expect(onTurnStart).toHaveBeenCalledTimes(1);
            expect(onTurnEnd).toHaveBeenCalledTimes(1);
            expect(onTurnEnd).toHaveBeenCalledWith(ship);
            expect(onShipMove).toHaveBeenCalledTimes(1);

            ship.setDead();
            ship.startTurn();
            ship.endTurn();

            expect(onTurnStart).toHaveBeenCalledTimes(2);
            expect(onTurnEnd).toHaveBeenCalledTimes(2);
            expect(onShipMove).toHaveBeenCalledTimes(1);
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

            equipment.requirements["skill_energy"] = 2;
            expect(ship.canEquip(equipment)).toBe(null);

            ship.upgradeSkill("skill_energy");
            expect(ship.canEquip(equipment)).toBe(null);

            ship.upgradeSkill("skill_energy");
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

            expect(ship.getAttribute("skill_energy")).toBe(0);
            ship.upgradeSkill("skill_energy");
            expect(ship.getAttribute("skill_energy")).toBe(1);

            range(50).forEach(() => ship.upgradeSkill("skill_gravity"));
            expect(ship.getAttribute("skill_energy")).toBe(1);
            expect(ship.getAttribute("skill_gravity")).toBe(14);
            expect(ship.getAvailableUpgradePoints()).toBe(0);

            ship.updateAttributes();
            expect(ship.getAttribute("skill_energy")).toBe(1);
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
    });
}
