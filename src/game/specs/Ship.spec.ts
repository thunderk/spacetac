module SpaceTac.Game.Specs {
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
            equipment.permanent_effects.push(new AttributeMaxEffect(AttributeCode.AP, 4));
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Power);
            equipment = new Equipment();
            equipment.slot = slot.type;
            equipment.permanent_effects.push(new AttributeMaxEffect(AttributeCode.AP, 5));
            slot.attach(equipment);

            ship.updateAttributes();
            expect(ship.ap_current.maximal).toBe(9);
        });

        it("repairs hull and recharges shield", function () {
            var ship = new Ship(null, "Test");

            ship.hull.setMaximal(120);
            ship.shield.setMaximal(150);

            expect(ship.hull.current).toEqual(0);
            expect(ship.shield.current).toEqual(0);

            ship.restoreHealth();

            expect(ship.hull.current).toEqual(120);
            expect(ship.shield.current).toEqual(150);
        });

        it("applies and logs hull and shield damage", function () {
            var fleet = new Fleet();
            var battle = new Battle(fleet);
            var ship = new Ship(fleet);

            ship.hull.setMaximal(50);
            ship.shield.setMaximal(100);
            ship.restoreHealth();
            battle.log.clear();

            ship.addDamage(10, 20);
            expect(ship.hull.current).toEqual(40);
            expect(ship.shield.current).toEqual(80);
            expect(battle.log.events.length).toBe(3);
            expect(battle.log.events[0]).toEqual(new AttributeChangeEvent(ship, ship.shield));
            expect(battle.log.events[1]).toEqual(new AttributeChangeEvent(ship, ship.hull));
            expect(battle.log.events[2]).toEqual(new DamageEvent(ship, 10, 20));

            battle.log.clear();

            ship.addDamage(15, 25, false);
            expect(ship.hull.current).toEqual(25);
            expect(ship.shield.current).toEqual(55);
            expect(battle.log.events.length).toBe(0);
        });

        it("sets and logs temporary effects", function () {
            var ship = new Ship();
            var battle = new Battle(ship.fleet);

            var effect = new TemporaryEffect("test", 2);

            ship.addTemporaryEffect(effect);

            expect(ship.temporary_effects).toEqual([effect]);
            expect(battle.log.events).toEqual([
                new EffectAddedEvent(ship, effect)
            ]);

            battle.log.clear();
            ship.endTurn();

            expect(ship.temporary_effects).toEqual([new TemporaryEffect("test", 1)]);
            expect(battle.log.events).toEqual([
                new EffectDurationChangedEvent(ship, new TemporaryEffect("test", 1), 2)
            ]);

            battle.log.clear();
            ship.endTurn();

            expect(ship.temporary_effects).toEqual([]);
            expect(battle.log.events).toEqual([
                new EffectRemovedEvent(ship, new TemporaryEffect("test", 1))
            ]);

            battle.log.clear();
            ship.endTurn();

            expect(ship.temporary_effects).toEqual([]);
            expect(battle.log.events).toEqual([]);
        });

        it("sets and logs death state", function () {
            var fleet = new Fleet();
            var battle = new Battle(fleet);
            var ship = new Ship(fleet);

            expect(ship.alive).toBe(true);

            ship.hull.set(10);
            battle.log.clear();
            ship.addDamage(5, 0);

            expect(ship.alive).toBe(true);
            expect(battle.log.events.length).toBe(2);
            expect(battle.log.events[0].code).toEqual("attr");
            expect(battle.log.events[1].code).toEqual("damage");

            battle.log.clear();
            ship.addDamage(5, 0);

            expect(ship.alive).toBe(false);
            expect(battle.log.events.length).toBe(3);
            expect(battle.log.events[0].code).toEqual("attr");
            expect(battle.log.events[1].code).toEqual("damage");
            expect(battle.log.events[2].code).toEqual("death");
        });

        it("checks if a ship is able to play", function () {
            var ship = new Ship();

            expect(ship.isAbleToPlay()).toBe(false);
            expect(ship.isAbleToPlay(false)).toBe(true);

            ship.ap_current.set(5);

            expect(ship.isAbleToPlay()).toBe(true);
            expect(ship.isAbleToPlay(false)).toBe(true);

            ship.hull.set(10);
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

            var random = new RandomGenerator(0.2);
            var picked = ship.getRandomEquipment(random);
            expect(picked).not.toBeNull();
            expect(picked).toBe(ship.slots[0].attached);

            random.forceNextValue(1);
            picked = ship.getRandomEquipment(random);
            expect(picked).not.toBeNull();
            expect(picked).toBe(ship.slots[2].attached);
        });
    });
}
