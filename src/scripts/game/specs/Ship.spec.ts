/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game {
    "use strict";

    describe("Ship", function () {
        it("limits movement range by action points", function () {
            var ship = new Ship(null, "Test");
            ship.ap_current.setMaximal(20);
            ship.ap_current.set(8);
            ship.movement_cost = 3;
            ship.setArenaPosition(50, 50);

            var point = ship.getLongestMove(51, 52);
            expect(point).toEqual([51, 52]);

            point = ship.getLongestMove(60, 55);
            expect(point[0]).toBeCloseTo(52.385139, 0.0001);
            expect(point[1]).toBeCloseTo(51.19256, 0.0001);
        });

        it("moves and consumes action points", function () {
            var ship = new Ship(null, "Test");
            ship.ap_current.setMaximal(20);
            ship.ap_current.set(8);
            ship.movement_cost = 3;
            ship.setArenaPosition(50, 50);

            ship.moveTo(51, 50);
            expect(ship.ap_current.current).toEqual(5);
            expect(ship.arena_x).toEqual(51);
            expect(ship.arena_y).toEqual(50);

            ship.moveTo(53, 50);
            expect(ship.ap_current.current).toBe(0);
            expect(ship.arena_x).toBeCloseTo(52.333333, 0.00001);
            expect(ship.arena_y).toEqual(50);
        });

        it("computes facing angle", function () {
            var ship = new Ship(null, "Test");
            ship.ap_current.setMaximal(20);
            ship.ap_current.set(20);
            ship.movement_cost = 3;
            ship.arena_angle = 0;
            ship.setArenaPosition(50, 50);

            ship.moveTo(50, 50);
            expect(ship.arena_angle).toEqual(0);

            ship.moveTo(51, 51);
            expect(ship.arena_angle).toBeCloseTo(0.785398, 0.00001);

            ship.moveTo(51, 52);
            expect(ship.arena_angle).toBeCloseTo(1.5707963, 0.00001);

            ship.moveTo(52, 52);
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
            equipment.action = new MoveAction();
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
            equipment.permanent_effects.push(new AttributeMaxEffect(AttributeCode.AP, 4));
            slot.attach(equipment);

            slot = ship.addSlot(SlotType.Power);
            equipment = new Equipment();
            equipment.permanent_effects.push(new AttributeMaxEffect(AttributeCode.AP, 5));
            slot.attach(equipment);

            ship.updateAttributes();
            expect(ship.ap_current.maximal).toBe(9);
        });
    });
}
