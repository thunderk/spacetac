module TK.SpaceTac.UI.Specs {
    testing("WeaponEffect", test => {
        let testgame = setupBattleview(test);

        function checkEmitters(step: string, expected: number) {
            test.check.same(testgame.view.arena.layer_weapon_effects.length, expected, `${step} - layer children`);
            //test.check.same(keys(testgame.view.particles.emitters).length, expected, `${step} - registered emitters`);
        }

        test.case("displays shield hit effect", check => {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let effect = new WeaponEffect(battleview.arena, new Ship(), new Target(0, 0), new TriggerAction("weapon"));
            effect.shieldImpactEffect({ x: 10, y: 10 }, { x: 20, y: 15 }, 1, true);

            let layer = battleview.arena.layer_weapon_effects;
            check.equals(layer.length, 2);

            check.instance(layer.list[0], Phaser.GameObjects.Particles.ParticleEmitterManager, "first child is an emitter");

            let child = layer.list[1];
            if (check.instance(child, UIImage, "second child is an image")) {
                check.nears(child.rotation, -2.677945044588987, 10);
                check.equals(child.x, 20, "x");
                check.equals(child.y, 15, "y");
            }
        });

        test.case("displays gatling gun effect", check => {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let ship = nn(battleview.battle.playing_ship);
            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromShip(ship), new TriggerAction("weapon"));
            effect.bulletsExecutor(1);

            let layer = battleview.arena.layer_weapon_effects;
            check.equals(layer.length, 1);
            check.instance(layer.list[0], Phaser.GameObjects.Particles.ParticleEmitterManager, "first child is an emitter");
        });

        test.acase("displays shield and hull effect on impacted ships", async check => {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let ship = nn(battleview.battle.playing_ship);
            ship.setArenaPosition(50, 30);

            let weapon = new TriggerAction("weapon", { effects: [new DamageEffect(1)], range: 500 });
            check.patch(weapon, "getImpactedShips", () => [ship]);

            let dest = new Ship();
            let effect = new WeaponEffect(battleview.arena, dest, Target.newFromShip(dest), weapon);
            check.patch(effect, "getEffectForWeapon", () => {
                return {
                    execution: () => Promise.resolve(),
                    delay: () => 0
                };
            });

            let mock_shield_impact = check.patch(effect, "shieldImpactEffect", null);
            let mock_hull_impact = check.patch(effect, "hullImpactEffect", null);

            ship.setValue("shield", 0);
            await effect.start(1);
            check.called(mock_shield_impact, 0);
            check.called(mock_hull_impact, [
                [Target.newFromShip(dest), ship.location, 1]
            ]);

            ship.setValue("shield", 10);
            await effect.start(2);
            check.called(mock_shield_impact, [
                [Target.newFromShip(dest), ship.location, 2, false]
            ]);
            check.called(mock_hull_impact, 0);
        });

        test.case("removes particle emitters when done", check => {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromLocation(50, 50), new TriggerAction("weapon"));

            effect.bulletsExecutor(1);
            checkEmitters("gun effect started", 1);
            testgame.clockForward(6000);
            checkEmitters("gun effect ended", 0);

            effect.hullImpactEffect({ x: 0, y: 0 }, { x: 50, y: 50 }, 1);
            checkEmitters("hull effect started", 1);
            testgame.clockForward(8500);
            checkEmitters("hull effect ended", 0);
        });

        test.case("adds a laser effect", check => {
            let battleview = testgame.view;
            battleview.timer = new Timer();

            let effect = new WeaponEffect(battleview.arena, new Ship(), Target.newFromLocation(31, 49), new TriggerAction("weapon"));
            effect.source = { x: 20, y: 30 };
            effect.action.angle = 90;
            effect.action.range = 300;
            effect.laserExecutor(5);

            let layer = battleview.arena.layer_weapon_effects;
            check.equals(layer.length, 1);
            let image = layer.list[0];
            if (check.instance(image, UIImage, "first child is an image")) {
                check.equals(image.name, "battle-effects-laser");
                //check.equals(image.width, 300);
                check.equals(image.x, 20);
                check.equals(image.y, 30);
                check.nears(image.rotation, 0.2606023917473408);

                checkTween(testgame, image, "rotation", [
                    0.2606023917473408,
                    1.8313987185422373,
                ]);
            }
        });
    });
}
