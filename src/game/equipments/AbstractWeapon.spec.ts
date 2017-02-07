module TS.SpaceTac.Game.Specs {
    describe("AbstractWeapon", function () {
        it("has fire action, and damage effects on target", function () {
            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 50, 60);

            var equipment = weapon.generateFixed(0.1);
            expect(equipment.target_effects.length).toBe(1);

            var effect = <DamageEffect>equipment.target_effects[0];
            expect(effect.code).toEqual("damage");
            expect(effect.value).toEqual(51);

            var action = equipment.action;
            expect(action.code).toEqual("fire-superfireweapon");
            expect(action.needs_target).toBe(true);
        });

        it("controls ability to target emptiness", function () {
            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 50, 60);
            weapon.setRange(10, 20, true);

            var equipment = weapon.generateFixed(20);
            var action = <FireWeaponAction>equipment.action;
            expect(action.can_target_space).toBe(true);

            weapon.setRange(10, 20, false);

            equipment = weapon.generateFixed(20);
            action = <FireWeaponAction>equipment.action;
            expect(action.can_target_space).toBe(false);
        });

        it("can't fire without sufficient AP", function () {
            var ship = new Ship();
            ship.values.power.set(3);

            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 50);

            weapon.ap_usage = new Range(2);
            var equipment = weapon.generateFixed(0);
            expect(equipment.action.canBeUsed(null, ship)).toBe(true);

            weapon.ap_usage = new Range(3);
            equipment = weapon.generateFixed(0);
            expect(equipment.action.canBeUsed(null, ship)).toBe(true);

            weapon.ap_usage = new Range(4);
            equipment = weapon.generateFixed(0);
            expect(equipment.action.canBeUsed(null, ship)).toBe(false);
        });

        it("can't friendly fire", function () {
            var fleet1 = new Fleet(new Player());
            var fleet2 = new Fleet(new Player());
            var ship1a = new Ship(fleet1);
            var ship1b = new Ship(fleet1);
            var ship2a = new Ship(fleet2);

            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 50, 60);
            weapon.setRange(10, 10);
            var equipment = weapon.generateFixed(0);

            expect(equipment.action.checkShipTarget(null, ship1a, Target.newFromShip(ship2a))).toEqual(
                Target.newFromShip(ship2a));
            expect(equipment.action.checkShipTarget(null, ship1a, Target.newFromShip(ship1b))).toBeNull();
        });

        it("can't fire farther than its range", function () {
            var fleet1 = new Fleet(new Player());
            var fleet2 = new Fleet(new Player());

            var ship = new Ship(fleet1);
            ship.setArenaPosition(10, 10);

            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 50);
            weapon.setRange(10, 10, true);

            var equipment = weapon.generateFixed(0);
            expect(equipment.distance).toEqual(10);

            expect(equipment.action.checkLocationTarget(null, ship, Target.newFromLocation(15, 10))).toEqual(
                Target.newFromLocation(15, 10));
            expect(equipment.action.checkLocationTarget(null, ship, Target.newFromLocation(30, 10))).toEqual(
                Target.newFromLocation(20, 10));

            // Ship targetting
            var ship2 = new Ship(fleet2);

            ship2.setArenaPosition(10, 15);
            expect(equipment.action.checkShipTarget(null, ship, Target.newFromShip(ship2))).toEqual(
                Target.newFromShip(ship2));

            ship2.setArenaPosition(10, 25);
            expect(equipment.action.checkShipTarget(null, ship, Target.newFromShip(ship2))).toBeNull();

            // Forbid targetting in space
            weapon.setRange(10, 10, false);
            equipment = weapon.generateFixed(0);
            expect(equipment.action.checkLocationTarget(null, ship, Target.newFromLocation(15, 10))).toBeNull();
        });

        it("can target an enemy ship and damage it", function () {
            var fleet1 = new Fleet(new Player());
            var fleet2 = new Fleet(new Player());

            var ship1 = new Ship(fleet1);
            ship1.values.power.set(50);

            var ship2 = new Ship(fleet2);
            ship2.setAttribute("hull_capacity", 100);
            ship2.setAttribute("shield_capacity", 30);
            ship2.restoreHealth();

            expect(ship2.values.hull.get()).toEqual(100);
            expect(ship2.values.shield.get()).toEqual(30);

            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 20);
            weapon.ap_usage = new IntegerRange(1, 1);

            var equipment = weapon.generateFixed(0);

            equipment.action.apply(null, ship1, Target.newFromShip(ship2));
            expect(ship2.values.hull.get()).toEqual(100);
            expect(ship2.values.shield.get()).toEqual(10);
            expect(ship1.values.power.get()).toEqual(49);

            equipment.action.apply(null, ship1, Target.newFromShip(ship2));
            expect(ship2.values.hull.get()).toEqual(90);
            expect(ship2.values.shield.get()).toEqual(0);
            expect(ship1.values.power.get()).toEqual(48);

            equipment.action.apply(null, ship1, Target.newFromShip(ship2));
            expect(ship2.values.hull.get()).toEqual(70);
            expect(ship2.values.shield.get()).toEqual(0);
            expect(ship1.values.power.get()).toEqual(47);
        });
    });
}
