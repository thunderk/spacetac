module TS.SpaceTac.UI.Specs {
    describe("Targetting", function () {
        let testgame = setupBattleview();

        it("draws simulation parts", function () {
            let targetting = new Targetting(testgame.battleview, testgame.battleview.action_bar);

            let ship = nn(testgame.battleview.battle.playing_ship);
            ship.setArenaPosition(10, 20);
            let weapon = TestTools.addWeapon(ship);
            let engine = TestTools.addEngine(ship, 12);
            targetting.setAction(weapon.action);

            let drawvector = spyOn(targetting, "drawVector").and.stub();

            let part = {
                action: weapon.action,
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

            targetting.setAction(engine.action);
            part.action = engine.action;
            targetting.drawPart(part, true, null);
            expect(drawvector).toHaveBeenCalledTimes(3);
            expect(drawvector).toHaveBeenCalledWith(0xe09c47, 10, 20, 50, 30, 12);
        });

        it("updates impact indicators on ships inside the blast radius", function () {
            let targetting = new Targetting(testgame.battleview, testgame.battleview.action_bar);
            let ship = nn(testgame.battleview.battle.playing_ship);

            let collect = spyOn(testgame.battleview.battle, "collectShipsInCircle").and.returnValues(
                [new Ship(), new Ship(), new Ship()],
                [new Ship(), new Ship()],
                []);
            targetting.updateImpactIndicators(ship, new Target(20, 10), 50);

            expect(collect).toHaveBeenCalledTimes(1);
            expect(collect).toHaveBeenCalledWith(new Target(20, 10), 50, true);
            expect(targetting.fire_impact.children.length).toBe(3);
            expect(targetting.fire_impact.visible).toBe(true);

            targetting.updateImpactIndicators(ship, new Target(20, 11), 50);

            expect(collect).toHaveBeenCalledTimes(2);
            expect(collect).toHaveBeenCalledWith(new Target(20, 11), 50, true);
            expect(targetting.fire_impact.children.length).toBe(2);
            expect(targetting.fire_impact.visible).toBe(true);

            let target = Target.newFromShip(new Ship());
            targetting.updateImpactIndicators(ship, target, 0);

            expect(collect).toHaveBeenCalledTimes(2);
            expect(targetting.fire_impact.children.length).toBe(1);
            expect(targetting.fire_impact.visible).toBe(true);

            targetting.updateImpactIndicators(ship, new Target(20, 12), 50);

            expect(collect).toHaveBeenCalledTimes(3);
            expect(collect).toHaveBeenCalledWith(new Target(20, 12), 50, true);
            expect(targetting.fire_impact.visible).toBe(false);
        });

        it("updates graphics from simulation", function () {
            let targetting = new Targetting(testgame.battleview, testgame.battleview.action_bar);
            let ship = nn(testgame.battleview.battle.playing_ship);

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
                    { action: engine.action, target: Target.newFromLocation(80, 20), ap: 1, possible: true },
                    { action: weapon.action, target: Target.newFromLocation(156, 65), ap: 5, possible: true }
                ]
                targetting.simulation = result;
            });
            targetting.update();

            expect(targetting.container.visible).toBe(true);
            expect(targetting.drawn_info.visible).toBe(true);
            expect(targetting.fire_arrow.visible).toBe(true);
            expect(targetting.fire_arrow.position).toEqual(jasmine.objectContaining({ x: 156, y: 65 }));
            expect(targetting.fire_arrow.rotation).toBeCloseTo(0.534594, 5);
            expect(targetting.fire_blast.visible).toBe(true);
            expect(targetting.fire_blast.position).toEqual(jasmine.objectContaining({ x: 156, y: 65 }));
            expect(targetting.move_ghost.visible).toBe(true);
            expect(targetting.move_ghost.position).toEqual(jasmine.objectContaining({ x: 80, y: 20 }));
            expect(targetting.move_ghost.rotation).toBeCloseTo(0.534594, 5);
        });
    });
}
