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
            equipment.slot = slot.type;
            equipment.action = new MoveAction(equipment);
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
            equipment.slot = slot.type;
            equipment.permanent_effects.push(new AttributeEffect("power_capacity", 4));
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Power);
            equipment = new Equipment();
            equipment.slot = slot.type;
            equipment.permanent_effects.push(new AttributeEffect("power_capacity", 5));
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

            ship.setAttribute("hull_capacity", 50);
            ship.setAttribute("shield_capacity", 100);
            ship.restoreHealth();
            battle.log.clear();

            ship.addDamage(10, 20);
            expect(ship.values.hull.get()).toEqual(40);
            expect(ship.values.shield.get()).toEqual(80);
            expect(battle.log.events.length).toBe(3);
            expect(battle.log.events[0]).toEqual(new ValueChangeEvent(ship, ship.values.shield, -20));
            expect(battle.log.events[1]).toEqual(new ValueChangeEvent(ship, ship.values.hull, -10));
            expect(battle.log.events[2]).toEqual(new DamageEvent(ship, 10, 20));

            battle.log.clear();

            ship.addDamage(15, 25, false);
            expect(ship.values.hull.get()).toEqual(25);
            expect(ship.values.shield.get()).toEqual(55);
            expect(battle.log.events.length).toBe(0);
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

            ship.addSlot(SlotType.Armor).attach(new Equipment(SlotType.Armor));
            ship.addSlot(SlotType.Shield);
            ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));

            expect(ship.getEquipmentCount()).toBe(2);
        });

        it("can pick a random attached equipment", function () {
            var ship = new Ship();

            expect(ship.getRandomEquipment()).toBe(null);

            ship.addSlot(SlotType.Armor).attach(new Equipment(SlotType.Armor));
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

            var power_core_template = new Equipments.BasicPowerCore();
            ship.addSlot(SlotType.Power).attach(power_core_template.generateFixed(0));
            ship.updateAttributes();

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
        });
    });
}
