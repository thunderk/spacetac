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

            var checkFading = (fading: number[], available: number[], message: string) => {
                fading.forEach((index: number) => {
                    var icon = bar.action_icons[index];
                    expect(icon.fading || !icon.active).toBe(true, `${message} - ${index} should be fading`);
                });
                available.forEach((index: number) => {
                    var icon = bar.action_icons[index];
                    expect(icon.fading).toBe(false, `${message} - ${index} should be available`);
                });
            };

            bar.updateSelectedActionPower(3, 0, bar.action_icons[1].action);
            checkFading([], [0, 1, 2, 3], "Weapon 1 leaves all choices open");
            bar.actionEnded();

            bar.updateSelectedActionPower(5, 0, bar.action_icons[2].action);
            checkFading([2], [0, 1, 3], "Weapon 2 can't be fired twice");
            bar.actionEnded();

            ship.setValue("power", 7);
            bar.updateSelectedActionPower(5, 0, bar.action_icons[2].action);
            checkFading([1, 2], [0, 3], "Not enough AP for both weapons");
            bar.actionEnded();

            ship.setValue("power", 3);
            bar.updateSelectedActionPower(3, 0, bar.action_icons[1].action);
            checkFading([0, 1, 2], [3], "Not enough AP to move");
            bar.actionEnded();

            // Dynamic AP usage for move actions
            ship.setValue("power", 6);
            bar.updateSelectedActionPower(2, 0, bar.action_icons[0].action);
            checkFading([2], [0, 1, 3], "2 move power used");
            bar.updateSelectedActionPower(4, 0, bar.action_icons[0].action);
            checkFading([1, 2], [0, 3], "4 move power used");
            bar.updateSelectedActionPower(6, 0, bar.action_icons[0].action);
            checkFading([0, 1, 2], [3], "6 move power used");
            bar.updateSelectedActionPower(8, 0, bar.action_icons[0].action);
            checkFading([0, 1, 2], [3], "8 move power used");
            bar.actionEnded();
        });

        it("updates power points display", function () {
            let bar = testgame.battleview.action_bar;

            function check(available = 0, using = 0, used = 0) {
                expect(bar.power.children.length).toBe(available + using + used);
                bar.power.children.forEach((child, idx) => {
                    let img = <Phaser.Image>child;
                    if (idx < available) {
                        expect(img.data.frame).toEqual(0);
                    } else if (idx < available + using) {
                        expect(img.data.frame).toEqual(2);
                    } else {
                        expect(img.data.frame).toEqual(1);
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
            testgame.battleview.log_processor.jumpToEnd();
            check(6, 0, 2);

            // using points
            bar.updatePower(5);
            check(1, 5, 2);

            // decrease
            ship.setAttribute("power_capacity", 3);
            testgame.battleview.log_processor.jumpToEnd();
            check(3);
        });
    });
}
