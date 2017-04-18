/// <reference path="../TestGame.ts"/>

module TS.SpaceTac.UI.Specs {
    describe("ActionBar", function () {
        let testgame = setupBattleview();

        it("lists available actions for selected ship", function () {
            var bar = testgame.battleview.action_bar;

            // Ship not owned by current battleview player
            var ship = new Ship();
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(0);

            // Ship with no equipment (only endturn action)
            testgame.battleview.player = ship.getPlayer();
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(1);
            expect(bar.action_icons[0].action.code).toEqual("endturn");

            // Add an engine, with move action
            TestTools.addEngine(ship, 50);
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(2);
            expect(bar.action_icons[0].action.code).toEqual("move");

            // Add a weapon, with fire action
            TestTools.addWeapon(ship, 10, 1, 100);
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(3);
            expect(bar.action_icons[1].action.code).toEqual("fire-equipment");
        });

        it("mark actions that would become unavailable after use", function () {
            let battleview = testgame.battleview;
            var bar = battleview.action_bar;
            var ship = new Ship();
            ship.arena_x = 1;
            ship.arena_y = 8;
            var engine = TestTools.addEngine(ship, 0.5);
            var weapon1 = TestTools.addWeapon(ship, 100, 3);
            var weapon2 = TestTools.addWeapon(ship, 100, 5);
            battleview.battle.playing_ship = ship;
            battleview.player = ship.getPlayer();

            ship.setAttribute("power_capacity", 10);
            ship.setValue("power", 9);
            bar.setShip(ship);

            expect(bar.action_icons.length).toBe(4);

            var checkFading = (fading: number[], available: number[]) => {
                fading.forEach((index: number) => {
                    var icon = bar.action_icons[index];
                    expect(icon.fading || !icon.active).toBe(true);
                });
                available.forEach((index: number) => {
                    var icon = bar.action_icons[index];
                    expect(icon.fading).toBe(false);
                });
            };

            // Weapon 1 leaves all choices open
            bar.action_icons[1].processClick();
            checkFading([], [0, 1, 2, 3]);
            bar.actionEnded();

            // Weapon 2 can't be fired twice
            bar.action_icons[2].processClick();
            checkFading([2], [0, 1, 3]);
            bar.actionEnded();

            // Not enough AP for both weapons
            ship.setValue("power", 7);
            bar.action_icons[2].processClick();
            checkFading([1, 2], [0, 3]);
            bar.actionEnded();

            // Not enough AP to move
            ship.setValue("power", 3);
            bar.action_icons[1].processClick();
            checkFading([0, 1, 2], [3]);
            bar.actionEnded();

            // Dynamic AP usage for move actions
            ship.setValue("power", 6);
            bar.action_icons[0].processClick();
            checkFading([], [0, 1, 2, 3]);
            bar.action_icons[0].processHover(Target.newFromLocation(2, 8));
            checkFading([2], [0, 1, 3]);
            bar.action_icons[0].processHover(Target.newFromLocation(3, 8));
            checkFading([1, 2], [0, 3]);
            bar.action_icons[0].processHover(Target.newFromLocation(4, 8));
            checkFading([0, 1, 2], [3]);
            bar.action_icons[0].processHover(Target.newFromLocation(5, 8));
            checkFading([0, 1, 2], [3]);
            bar.actionEnded();
        });

        it("updates power points display", function () {
            let bar = testgame.battleview.action_bar;

            function check(available = 0, using = 0, used = 0) {
                expect(bar.power.children.length).toBe(available + using + used);
                bar.power.children.forEach((child, idx) => {
                    let img = <Phaser.Image>child;
                    if (idx < available) {
                        expect(img.name).toEqual("battle-power-available");
                    } else if (idx < available + using) {
                        expect(img.name).toEqual("battle-power-using");
                    } else {
                        expect(img.name).toEqual("battle-power-used");
                    }
                });
            }

            // not owned ship
            let ship = new Ship();
            TestTools.setShipAP(ship, 8);
            bar.setShip(ship);
            check();

            // owned ship
            ship.fleet = testgame.battleview.player.fleet;
            bar.setShip(ship);
            check(8);

            // used points
            ship.setValue("power", 6);
            check(6, 0, 2);

            // using points
            bar.updatePower(5);
            check(1, 5, 2);

            // decrease
            ship.setAttribute("power_capacity", 3);
            check(3);
        });
    });
}
