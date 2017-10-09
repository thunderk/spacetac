module TK.SpaceTac.UI.Specs {
    describe("WeaponEffect", function () {
        let testgame = setupBattleview();

        function checkEmitters(step: string, expected: number) {
            expect(testgame.view.arena.layer_weapon_effects.children.length).toBe(expected, `${step} - layer children`);
            expect(keys(testgame.view.game.particles.emitters).length).toBe(expected, `${step} - registered emitters`);
        }

        function fastForward(milliseconds: number) {
            jasmine.clock().tick(milliseconds);
            testgame.ui.updateLogic(milliseconds);
        }

        it("displays shield hit effect", function () {
            let battleview = testgame.view;
            battleview.timer = new Timer();

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
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let ship = nn(battleview.battle.playing_ship);
            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromShip(ship), new Equipment());
            effect.gunEffect();

            let layer = battleview.arena.layer_weapon_effects;
            expect(layer.children.length).toBe(1);
            expect(layer.children[0] instanceof Phaser.Particles.Arcade.Emitter).toBe(true);
        });

        it("displays shield and hull effect on impacted ships", function () {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let ship = nn(battleview.battle.playing_ship);
            let sprite = nn(battleview.arena.findShipSprite(ship));
            ship.setArenaPosition(50, 30);
            sprite.position.set(50, 30);
            sprite.hull_bar.setValue(10, 10);
            sprite.shield_bar.setValue(0, 10);

            let weapon = new Equipment();
            weapon.action = new TriggerAction(weapon, [new DamageEffect()], 1, 500);
            spyOn(weapon.action, "getImpactedShips").and.returnValue([ship]);

            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromShip(ship), weapon);
            spyOn(effect, "getEffectForWeapon").and.returnValue(() => 100);

            let mock_shield_impact = spyOn(effect, "shieldImpactEffect").and.stub();
            let mock_hull_impact = spyOn(effect, "hullImpactEffect").and.stub();

            effect.start();
            expect(mock_shield_impact).toHaveBeenCalledTimes(0);
            expect(mock_hull_impact).toHaveBeenCalledTimes(1);
            expect(mock_hull_impact).toHaveBeenCalledWith(jasmine.objectContaining({ x: 0, y: 0 }), jasmine.objectContaining({ x: 50, y: 30 }), 40, 400);

            sprite.shield_bar.setValue(10, 10);
            effect.start();
            expect(mock_shield_impact).toHaveBeenCalledTimes(1);
            expect(mock_shield_impact).toHaveBeenCalledWith(jasmine.objectContaining({ x: 0, y: 0 }), jasmine.objectContaining({ x: 50, y: 30 }), 40, 800, false);
            expect(mock_hull_impact).toHaveBeenCalledTimes(1);
        });

        it("removes particle emitters when done", function () {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromLocation(50, 50), new Equipment());

            effect.gunEffect();
            checkEmitters("gun effect started", 1);
            fastForward(6000);
            checkEmitters("gun effect ended", 0);

            effect.hullImpactEffect({ x: 0, y: 0 }, { x: 50, y: 50 }, 1000, 2000);
            checkEmitters("hull effect started", 1);
            fastForward(8500);
            checkEmitters("hull effect ended", 0);
        });

        it("adds a laser effect", function () {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromLocation(31, 49), new Equipment());

            let result = effect.angularLaser({ x: 20, y: 30 }, 300, Math.PI / 4, -Math.PI / 2, 5);
            expect(result).toBe(200);

            let layer = battleview.arena.layer_weapon_effects;
            expect(layer.children.length).toBe(1);
            expect(layer.children[0] instanceof Phaser.Image).toBe(true, "is image");
            let image = <Phaser.Image>layer.children[0];
            expect(image.name).toEqual("battle-effects-laser");
            //expect(image.width).toBe(300);
            expect(image.x).toEqual(20);
            expect(image.y).toEqual(30);
            expect(image.rotation).toBeCloseTo(Math.PI / 4, 0.000001);

            let values = battleview.animations.simulate(image, "rotation", 4, result);
            expect(values[0]).toBeCloseTo(Math.PI / 4, 0.000001);
            expect(values[1]).toBeCloseTo(0, 0.000001);
            expect(values[2]).toBeCloseTo(-Math.PI / 4, 0.000001);
            expect(values[3]).toBeCloseTo(-Math.PI / 2, 0.000001);
        });
    });
}
