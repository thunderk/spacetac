module TK.SpaceTac.UI.Specs {
    testing("Targetting", test => {
        let testgame = setupBattleview(test);

        function newTargetting(): Targetting {
            return new Targetting(testgame.view,
                testgame.view.action_bar,
                testgame.view.toggle_tactical_mode,
                testgame.view.arena.range_hint);
        }

        test.case("draws simulation parts", check => {
            let targetting = newTargetting();

            let ship = nn(testgame.view.battle.playing_ship);
            ship.setArenaPosition(10, 20);
            let weapon = TestTools.addWeapon(ship);
            let engine = TestTools.addEngine(ship, 12);
            targetting.setAction(ship, weapon);

            let drawvector = check.patch(targetting, "drawVector", null);

            let part = {
                action: <BaseAction>weapon,
                target: new Target(50, 30),
                ap: 5,
                possible: true
            };
            targetting.drawPart(part, true, null);
            check.called(drawvector, [
                [0xdc6441, 10, 20, 50, 30, 0]
            ]);

            targetting.drawPart(part, false, null);
            check.called(drawvector, [
                [0x8e8e8e, 10, 20, 50, 30, 0]
            ]);

            targetting.action = engine;
            part.action = engine;
            targetting.drawPart(part, true, null);
            check.called(drawvector, [
                [0xe09c47, 10, 20, 50, 30, 12]
            ]);
        })

        test.case("updates impact indicators on ships inside the blast radius", check => {
            let targetting = newTargetting();
            let ship = nn(testgame.view.battle.playing_ship);
            let impacts = targetting.impact_indicators;
            let action = new TriggerAction("weapon", { range: 50 });

            let collect = check.patch(action, "getImpactedShips", iterator([
                [new Ship(), new Ship(), new Ship()],
                [new Ship(), new Ship()],
                []
            ]));
            targetting.updateImpactIndicators(impacts, ship, action, new Target(20, 10));

            check.called(collect, [
                [ship, new Target(20, 10), ship.location]
            ])
            check.equals(targetting.impact_indicators.children.length, 3);
            check.equals(targetting.impact_indicators.visible, true);

            targetting.updateImpactIndicators(impacts, ship, action, new Target(20, 11));

            check.called(collect, [
                [ship, new Target(20, 11), ship.location]
            ])
            check.equals(targetting.impact_indicators.children.length, 2);
            check.equals(targetting.impact_indicators.visible, true);

            targetting.updateImpactIndicators(impacts, ship, action, new Target(20, 12));

            check.called(collect, [
                [ship, new Target(20, 12), ship.location]
            ])
            check.equals(targetting.impact_indicators.visible, false);
        })

        test.case("updates graphics from simulation", check => {
            let targetting = newTargetting();
            let ship = nn(testgame.view.battle.playing_ship);

            let engine = TestTools.addEngine(ship, 8000);
            let weapon = TestTools.addWeapon(ship, 30, 5, 100, 50);
            targetting.setAction(ship, weapon);
            targetting.setTarget(Target.newFromLocation(156, 65));

            check.patch(targetting, "simulate", () => {
                let result = new MoveFireResult();
                result.success = true;
                result.complete = true;
                result.need_move = true;
                result.move_location = Target.newFromLocation(80, 20);
                result.can_move = true;
                result.can_end_move = true;
                result.need_fire = true;
                result.can_fire = true;
                result.parts = [
                    { action: engine, target: Target.newFromLocation(80, 20), ap: 1, possible: true },
                    { action: weapon, target: Target.newFromLocation(156, 65), ap: 5, possible: true }
                ]
                targetting.simulation = result;
            });
            targetting.update();

            check.equals(targetting.container.visible, true);
            check.equals(targetting.drawn_info.visible, true);
            check.equals(targetting.fire_arrow.visible, true);
            check.containing(targetting.fire_arrow.position, { x: 156, y: 65 });
            check.nears(targetting.fire_arrow.rotation, 0.534594, 5);
            check.equals(targetting.impact_area.visible, true);
            check.containing(targetting.impact_area.position, { x: 156, y: 65 });
            check.equals(targetting.move_ghost.visible, true);
            check.containing(targetting.move_ghost.position, { x: 80, y: 20 });
            check.nears(targetting.move_ghost.rotation, 0.534594, 5);
        })

        test.case("snaps on ships according to targetting mode", check => {
            let targetting = newTargetting();
            let playing_ship = nn(testgame.view.battle.playing_ship);
            let action = TestTools.addWeapon(playing_ship);

            let ship1 = testgame.view.battle.play_order[1];
            let ship2 = testgame.view.battle.play_order[2];
            ship1.setArenaPosition(8000, 50);
            ship2.setArenaPosition(8000, 230);

            targetting.setAction(playing_ship, action, ActionTargettingMode.SPACE);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromLocation(8000, 60), "space");

            targetting.setAction(playing_ship, action, ActionTargettingMode.SHIP);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromShip(ship1), "ship 1");
            targetting.setTargetFromLocation({ x: 8100, y: 200 });
            check.equals(targetting.target, Target.newFromShip(ship2), "ship 2");

            targetting.setAction(playing_ship, action, ActionTargettingMode.SURROUNDINGS);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, new Target(8000, 60, playing_ship), "surroundings 1");
            targetting.setTargetFromLocation({ x: playing_ship.arena_x + 10, y: playing_ship.arena_y - 20 });
            check.equals(targetting.target, Target.newFromShip(playing_ship), "surroundings 2");

            targetting.setAction(playing_ship, action, ActionTargettingMode.SELF);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromShip(playing_ship), "self 1");
            targetting.setTargetFromLocation({ x: 0, y: 0 });
            check.equals(targetting.target, Target.newFromShip(playing_ship), "self 2");
        })

        test.case("updates the range hint display", check => {
            let targetting = newTargetting();
            let ship = nn(testgame.view.battle.playing_ship);
            ship.setArenaPosition(0, 0);
            TestTools.setShipModel(ship, 100, 0, 8);
            let move = TestTools.addEngine(ship, 100);
            let fire = TestTools.addWeapon(ship, 50, 2, 300, 100);
            let last_call: any = null;
            check.patch(targetting.range_hint, "clear", () => last_call = null);
            check.patch(targetting.range_hint, "update", (ship: Ship, action: BaseAction, radius: number) => last_call = [ship, action, radius]);

            // move action
            targetting.setAction(ship, move);
            targetting.setTargetFromLocation({ x: 200, y: 0 });
            check.equals(last_call, [ship, move, 800]);

            // fire action
            targetting.setAction(ship, fire);
            targetting.setTargetFromLocation({ x: 200, y: 0 });
            check.equals(last_call, [ship, fire, undefined]);

            // move+fire
            targetting.setAction(ship, fire);
            targetting.setTargetFromLocation({ x: 400, y: 0 });
            check.equals(last_call, [ship, move, 600]);
        });
    });
}
