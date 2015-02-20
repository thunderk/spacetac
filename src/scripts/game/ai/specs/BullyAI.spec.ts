/// <reference path="../../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.AI.Specs {
    "use strict";

    describe("BullyAI", function () {
        it("lists enemies", function () {
            var battle = new Battle();
            battle.fleets[0].addShip(new Ship(null, "0-0"));
            battle.fleets[1].addShip(new Ship(null, "1-0"));
            battle.fleets[1].addShip(new Ship(null, "1-1"));

            var random = new RandomGenerator(0, 0.5, 1);
            battle.throwInitiative(random);

            var ai = new BullyAI(battle.fleets[0]);
            ai.ship = battle.fleets[0].ships[0];

            var result = ai.listAllEnemies();
            expect(result).toEqual([battle.fleets[1].ships[1], battle.fleets[1].ships[0]]);
        });

        it("lists weapons", function () {
            var ship = new Ship();

            var ai = new BullyAI(ship.fleet);
            ai.ship = ship;

            var result = ai.listAllWeapons();
            expect(result.length).toBe(0);

            var weapon1 = new Equipment(SlotType.Weapon);
            ai.ship.addSlot(SlotType.Weapon).attach(weapon1);
            var weapon2 = new Equipment(SlotType.Weapon);
            ai.ship.addSlot(SlotType.Weapon).attach(weapon2);
            ai.ship.addSlot(SlotType.Shield).attach(new Equipment(SlotType.Shield));

            result = ai.listAllWeapons();
            expect(result.length).toBe(2);
            expect(result[0]).toBe(weapon1);
            expect(result[1]).toBe(weapon2);
        });

        it("checks a firing possibility", function () {
            var ship = new Ship();
            var engine = new Equipment(SlotType.Engine);
            engine.ap_usage = 3;
            engine.distance = 1;
            ship.addSlot(SlotType.Engine).attach(engine);
            ship.ap_current.setMaximal(10);
            ship.ap_current.set(8);
            var enemy = new Ship();
            var ai = new BullyAI(ship.fleet);
            ai.ship = ship;
            ai.move_margin = 0;
            var weapon = new Equipment(SlotType.Weapon);
            weapon.ap_usage = 2;
            weapon.distance = 3;

            // enemy in range, the ship can fire without moving
            ship.ap_current.set(8);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 3;
            enemy.arena_y = 0;
            var result = ai.checkBullyMove(enemy, weapon);
            expect(result.move_to).toBeNull();
            expect(result.target).toBe(enemy);
            expect(result.weapon).toBe(weapon);

            // enemy out of range, but moving can bring it in range
            ship.ap_current.set(8);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 6;
            enemy.arena_y = 0;
            result = ai.checkBullyMove(enemy, weapon);
            expect(result.move_to).toEqual(Target.newFromLocation(3, 0));
            expect(result.target).toBe(enemy);
            expect(result.weapon).toBe(weapon);

            // enemy out of range, but moving can bring it in range, except for the safety margin
            ai.move_margin = 0.1;
            ship.ap_current.set(8);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 6;
            enemy.arena_y = 0;
            result = ai.checkBullyMove(enemy, weapon);
            expect(result).toBeNull();
            ai.move_margin = 0;

            // enemy totally out of range
            ship.ap_current.set(8);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 30;
            enemy.arena_y = 0;
            result = ai.checkBullyMove(enemy, weapon);
            expect(result).toBeNull();

            // enemy in range but not enough AP to fire
            ship.ap_current.set(1);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 3;
            enemy.arena_y = 0;
            result = ai.checkBullyMove(enemy, weapon);
            expect(result).toBeNull();

            // can move in range of enemy, but not enough AP to fire
            ship.ap_current.set(7);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 6;
            enemy.arena_y = 0;
            result = ai.checkBullyMove(enemy, weapon);
            expect(result).toBeNull();

            // no engine, can't move
            ship.slots[0].attached.detach();
            ship.ap_current.set(8);
            ship.arena_x = 1;
            ship.arena_y = 0;
            enemy.arena_x = 6;
            enemy.arena_y = 0;
            result = ai.checkBullyMove(enemy, weapon);
            expect(result).toBeNull();
        });

        it("lists available firing actions", function () {
            var battle = new Battle();
            var ship1 = new Ship();
            ship1.setArenaPosition(3, 2);
            battle.fleets[0].addShip(ship1);
            var ship2 = new Ship();
            ship2.setArenaPosition(5, 3);
            battle.fleets[1].addShip(ship2);
            var ship3 = new Ship();
            ship3.setArenaPosition(11, 15);
            battle.fleets[1].addShip(ship3);
            battle.throwInitiative(new RandomGenerator(1, 0.5, 0));

            var ai = new BullyAI(ship1.fleet);
            ai.ship = ship1;

            var result = ai.listAllMoves();
            expect(result.length).toBe(0);

            var weapon1 = new Equipment(SlotType.Weapon);
            weapon1.distance = 50;
            weapon1.ap_usage = 1;
            ai.ship.addSlot(SlotType.Weapon).attach(weapon1);
            var weapon2 = new Equipment(SlotType.Weapon);
            weapon2.distance = 10;
            weapon2.ap_usage = 1;
            ai.ship.addSlot(SlotType.Weapon).attach(weapon2);

            ai.ship.ap_current.setMaximal(10);
            ai.ship.ap_current.set(8);

            result = ai.listAllMoves();
            expect(result.length).toBe(3);
        });

        it("applies the chosen move", function () {
            var battle = new Battle();
            var ship1 = new Ship();
            ship1.setArenaPosition(0, 0);
            battle.fleets[0].addShip(ship1);
            var ship2 = new Ship();
            ship2.setArenaPosition(8, 0);
            battle.fleets[1].addShip(ship2);

            var ai = new BullyAI(ship1.fleet);
            ai.move_margin = 0;
            ai.async = false;
            ai.ship = ship1;

            var engine = new Equipment(SlotType.Engine);
            engine.distance = 1;
            engine.ap_usage = 2;
            engine.action = new MoveAction(engine);
            ai.ship.addSlot(SlotType.Engine).attach(engine);

            var weapon = new Equipment(SlotType.Weapon);
            weapon.distance = 6;
            weapon.ap_usage = 1;
            weapon.target_effects.push(new DamageEffect(20));
            weapon.action = new FireWeaponAction(weapon);
            ai.ship.addSlot(SlotType.Weapon).attach(weapon);

            ai.ship.ap_current.setMaximal(10);
            ai.ship.ap_current.set(6);

            ship2.hull.set(15);
            ship2.shield.set(10);

            var move = ai.checkBullyMove(ship2, weapon);
            expect(move).not.toBeNull();

            battle.log.clear();
            ai.applyMove(move);

            expect(battle.log.events.length).toBe(7);

            expect(battle.log.events[0]).toEqual(new MoveEvent(ship1, 2, 0));
            expect(battle.log.events[1]).toEqual(new AttributeChangeEvent(ship1,
                new Attribute(AttributeCode.AP, 2, 10)));

            expect(battle.log.events[2]).toEqual(new FireEvent(ship1, weapon, Target.newFromShip(ship2)));
            expect(battle.log.events[3]).toEqual(new AttributeChangeEvent(ship2,
                new Attribute(AttributeCode.Shield, 0)));
            expect(battle.log.events[4]).toEqual(new AttributeChangeEvent(ship2,
                new Attribute(AttributeCode.Hull, 5)));
            expect(battle.log.events[5]).toEqual(new DamageEvent(ship2, 10, 10));
            expect(battle.log.events[6]).toEqual(new AttributeChangeEvent(ship1,
                new Attribute(AttributeCode.AP, 1, 10)));
        });
    });
}
