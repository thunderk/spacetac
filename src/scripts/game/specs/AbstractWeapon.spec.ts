/// <reference path="../../definitions/jasmine.d.ts"/>

module SpaceTac.Game.Specs {
    "use strict";

    describe("AbstractWeapon", function () {
        it("has fire action, and damage effects on target", function () {
            var weapon = new Equipments.AbstractWeapon("Super Fire Weapon", 50, 60);

            var equipment = weapon.generateFixed(0.1);
            expect(equipment.target_effects.length).toBe(1);

            var effect = <DamageEffect>equipment.target_effects[0];
            expect(effect.code).toEqual("damage");
            expect(effect.value).toEqual(51);

            var action = equipment.action;
            expect(action.code).toEqual("fire");
            expect(action.needs_target).toBe(true);
        });
    });
}
