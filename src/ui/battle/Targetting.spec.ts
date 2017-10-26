module TK.SpaceTac.UI.Specs {
    testing("Targetting", test => {
        let testgame = setupBattleview();

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
            targetting.setAction(weapon.action);

            let drawvector = spyOn(targetting, "drawVector").and.stub();

            let part = {
                action: nn(weapon.action),
                target: new Target(50, 30),
                ap: 5,
                possible: true
            };
            targetting.drawPart(part, true, null);
            expect(drawvector).toHaveBeenCalledTimes(1);
            expect(drawvector).toHaveBeenCalledWith(0xdc6441, 10, 20, 50, 30, 0);

            targetting.drawPart(part, false, null);
            expect(drawvector).toHaveBeenCalledTimes(2);
            expect(drawvector).toHaveBeenCalledWith(0x8e8e8e, 10, 20, 50, 30, 0);

            targetting.action = engine.action;
            part.action = nn(engine.action);
            targetting.drawPart(part, true, null);
            expect(drawvector).toHaveBeenCalledTimes(3);
            expect(drawvector).toHaveBeenCalledWith(0xe09c47, 10, 20, 50, 30, 12);
        })

        test.case("updates impact indicators on ships inside the blast radius", check => {
            let targetting = newTargetting();
            let ship = nn(testgame.view.battle.playing_ship);
            let impacts = targetting.impact_indicators;
            let action = new TriggerAction(new Equipment(), [], 1, 0, 50);

            let collect = spyOn(action, "getImpactedShips").and.returnValues(
                [new Ship(), new Ship(), new Ship()],
                [new Ship(), new Ship()],
                []);
            targetting.updateImpactIndicators(impacts, ship, action, new Target(20, 10));

            expect(collect).toHaveBeenCalledTimes(1);
            expect(collect).toHaveBeenCalledWith(ship, new Target(20, 10), ship.location);
            check.equals(targetting.impact_indicators.children.length, 3);
            check.equals(targetting.impact_indicators.visible, true);

            targetting.updateImpactIndicators(impacts, ship, action, new Target(20, 11));

            expect(collect).toHaveBeenCalledTimes(2);
            expect(collect).toHaveBeenCalledWith(ship, new Target(20, 11), ship.location);
            check.equals(targetting.impact_indicators.children.length, 2);
            check.equals(targetting.impact_indicators.visible, true);

            targetting.updateImpactIndicators(impacts, ship, action, new Target(20, 12));

            expect(collect).toHaveBeenCalledTimes(3);
            expect(collect).toHaveBeenCalledWith(ship, new Target(20, 12), ship.location);
            check.equals(targetting.impact_indicators.visible, false);
        })

        test.case("updates graphics from simulation", check => {
            let targetting = newTargetting();
            let ship = nn(testgame.view.battle.playing_ship);

            let engine = TestTools.addEngine(ship, 8000);
            let weapon = TestTools.addWeapon(ship, 30, 5, 100, 50);
            targetting.setAction(weapon.action);
            targetting.setTarget(Target.newFromLocation(156, 65));

            spyOn(targetting, "simulate").and.callFake(() => {
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
                    { action: nn(engine.action), target: Target.newFromLocation(80, 20), ap: 1, possible: true },
                    { action: nn(weapon.action), target: Target.newFromLocation(156, 65), ap: 5, possible: true }
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
            let action = TestTools.addWeapon(playing_ship).action;

            let ship1 = testgame.view.battle.play_order[1];
            let ship2 = testgame.view.battle.play_order[2];
            ship1.setArenaPosition(8000, 50);
            ship2.setArenaPosition(8000, 230);

            targetting.setAction(action, ActionTargettingMode.SPACE);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromLocation(8000, 60), "space");

            targetting.setAction(action, ActionTargettingMode.SHIP);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromShip(ship1), "ship 1");
            targetting.setTargetFromLocation({ x: 8100, y: 200 });
            check.equals(targetting.target, Target.newFromShip(ship2), "ship 2");

            targetting.setAction(action, ActionTargettingMode.SURROUNDINGS);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromLocation(8000, 60), "surroundings 1");
            targetting.setTargetFromLocation({ x: playing_ship.arena_x + 10, y: playing_ship.arena_y - 20 });
            check.equals(targetting.target, Target.newFromShip(playing_ship), "surroundings 2");

            targetting.setAction(action, ActionTargettingMode.SELF);
            targetting.setTargetFromLocation({ x: 8000, y: 60 });
            check.equals(targetting.target, Target.newFromShip(playing_ship), "self 1");
            targetting.setTargetFromLocation({ x: 0, y: 0 });
            check.equals(targetting.target, Target.newFromShip(playing_ship), "self 2");
        })

        test.case("updates the range hint display", check => {
            let targetting = newTargetting();
            let ship = nn(testgame.view.battle.playing_ship);
            ship.setArenaPosition(0, 0);
            ship.listEquipment(SlotType.Engine).forEach(engine => engine.detach());
            TestTools.setShipAP(ship, 8);
            let move = TestTools.addEngine(ship, 100).action;
            let fire = TestTools.addWeapon(ship, 50, 2, 300, 100).action;
            let last_call: any = null;
            spyOn(targetting.range_hint, "clear").and.callFake(() => last_call = null);
            spyOn(targetting.range_hint, "update").and.callFake((ship: Ship, action: BaseAction, radius: number) => last_call = [ship, action, radius]);

            // move action
            targetting.setAction(move);
            targetting.setTargetFromLocation({ x: 200, y: 0 });
            check.equals(last_call, [ship, move, 800]);

            // fire action
            targetting.setAction(fire);
            targetting.setTargetFromLocation({ x: 200, y: 0 });
            check.equals(last_call, [ship, fire, undefined]);

            // move+fire
            targetting.setAction(fire);
            targetting.setTargetFromLocation({ x: 400, y: 0 });
            check.equals(last_call, [ship, move, 600]);
        });
    });
}
