module TS.SpaceTac.UI.Specs {
    describe("WeaponEffect", () => {
        inbattleview_it("displays shield hit effect", (battleview) => {
            let effect = new WeaponEffect(battleview.arena, new Target(0, 0), new Target(0, 0), new Equipment());
            effect.shieldImpactEffect({ x: 10, y: 10 }, { x: 20, y: 15 }, 1000, 3000);

            let layer = battleview.arena.layer_weapon_effects;
            expect(layer.children.length).toBe(2);

            expect(layer.children[0] instanceof Phaser.Image).toBe(true);
            expect(layer.children[0].rotation).toBeCloseTo(-2.677945044588987, 10);
            expect(layer.children[0].position).toEqual(jasmine.objectContaining({ x: 20, y: 15 }));

            expect(layer.children[1] instanceof Phaser.Particles.Arcade.Emitter).toBe(true);
        });

        inbattleview_it("displays gatling gun effect", (battleview) => {
            let ship = new Ship();
            ship.setArenaPosition(50, 30);
            TestTools.setShipHP(ship, 10, 0);
            let effect = new WeaponEffect(battleview.arena, new Target(10, 0), Target.newFromShip(ship), new Equipment());

            let mock_shield_impact = spyOn(effect, "shieldImpactEffect").and.stub();
            let mock_hull_impact = spyOn(effect, "hullImpactEffect").and.stub();

            effect.gunEffect();

            let layer = battleview.arena.layer_weapon_effects;
            expect(layer.children.length).toBe(1);

            expect(layer.children[0] instanceof Phaser.Particles.Arcade.Emitter).toBe(true);
            expect(mock_shield_impact).toHaveBeenCalledTimes(0);
            expect(mock_hull_impact).toHaveBeenCalledTimes(1);
            expect(mock_hull_impact).toHaveBeenCalledWith(jasmine.objectContaining({ x: 10, y: 0 }), jasmine.objectContaining({ x: 50, y: 30 }), 100, 800);

            TestTools.setShipHP(ship, 10, 10);
            effect.gunEffect();
            expect(mock_shield_impact).toHaveBeenCalledTimes(1);
            expect(mock_shield_impact).toHaveBeenCalledWith(jasmine.objectContaining({ x: 10, y: 0 }), jasmine.objectContaining({ x: 50, y: 30 }), 100, 800);
            expect(mock_hull_impact).toHaveBeenCalledTimes(1);
        });
    });
}
