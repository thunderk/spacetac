module TS.SpaceTac.UI.Specs {
    describe("WeaponEffect", function () {
        let testgame = setupBattleview();

        it("displays shield hit effect", function () {
            let battleview = testgame.battleview;
            let effect = new WeaponEffect(battleview.arena, new Ship(), new Target(0, 0), new Equipment());
            effect.shieldImpactEffect({ x: 10, y: 10 }, { x: 20, y: 15 }, 1000, 3000, true);

            let layer = battleview.arena.layer_weapon_effects;
            expect(layer.children.length).toBe(2);

            expect(layer.children[0] instanceof Phaser.Image).toBe(true);
            expect(layer.children[0].rotation).toBeCloseTo(-2.677945044588987, 10);
            expect(layer.children[0].position).toEqual(jasmine.objectContaining({ x: 20, y: 15 }));

            expect(layer.children[1] instanceof Phaser.Particles.Arcade.Emitter).toBe(true);
        });

        it("displays gatling gun effect", function () {
            let battleview = testgame.battleview;
            let ship = nn(battleview.battle.playing_ship);
            let sprite = nn(battleview.arena.findShipSprite(ship));
            ship.setArenaPosition(50, 30);
            sprite.position.set(50, 30);
            sprite.hull.setValue(10, 10);
            sprite.shield.setValue(0, 10);
            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromShip(ship), new Equipment());

            let mock_shield_impact = spyOn(effect, "shieldImpactEffect").and.stub();
            let mock_hull_impact = spyOn(effect, "hullImpactEffect").and.stub();

            effect.gunEffect();

            let layer = battleview.arena.layer_weapon_effects;
            expect(layer.children.length).toBe(1);

            expect(layer.children[0] instanceof Phaser.Particles.Arcade.Emitter).toBe(true);
            expect(mock_shield_impact).toHaveBeenCalledTimes(0);
            expect(mock_hull_impact).toHaveBeenCalledTimes(1);
            expect(mock_hull_impact).toHaveBeenCalledWith(jasmine.objectContaining({ x: 0, y: 0 }), jasmine.objectContaining({ x: 50, y: 30 }), 100, 800);

            sprite.shield.setValue(10, 10);
            effect.gunEffect();
            expect(mock_shield_impact).toHaveBeenCalledTimes(1);
            expect(mock_shield_impact).toHaveBeenCalledWith(jasmine.objectContaining({ x: 0, y: 0 }), jasmine.objectContaining({ x: 50, y: 30 }), 100, 800, true);
            expect(mock_hull_impact).toHaveBeenCalledTimes(1);
        });
    });
}
