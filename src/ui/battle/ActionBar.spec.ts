/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    describe("ActionBar", function () {
        let testgame = setupBattleview();

        it("lists available actions for selected ship", function () {
            var bar = testgame.view.action_bar;

            // Ship not owned by current battleview player
            var ship = new Ship();
            bar.setShip(ship);
            expect(bar.action_icons.length).toBe(0);

            // Ship with no equipment (only endturn action)
            testgame.view.player = ship.getPlayer();
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

        it("updates power points display", function () {
            let bar = testgame.view.action_bar;

            function check(available = 0, using = 0, used = 0) {
                expect(bar.power_icons.children.length).toBe(available + using + used);
                bar.power_icons.children.forEach((child, idx) => {
                    let img = <Phaser.Image>child;
                    if (idx < available) {
                        expect(img.name).toEqual("battle-actionbar-power-available");
                    } else if (idx < available + using) {
                        expect(img.name).toEqual("battle-actionbar-power-move");
                    } else {
                        expect(img.name).toEqual("battle-actionbar-power-used");
                    }
                });
            }

            // not owned ship
            let ship = new Ship();
            TestTools.setShipAP(ship, 8);
            bar.setShip(ship);
            check();

            // owned ship
            ship.fleet = testgame.view.player.fleet;
            bar.setShip(ship);
            check(8);

            // used points
            ship.setValue("power", 6);
            testgame.view.log_processor.jumpToEnd();
            check(6, 0, 2);

            // using points
            bar.updatePower(5);
            check(1, 5, 2);

            // decrease
            ship.setAttribute("power_capacity", 3);
            testgame.view.log_processor.jumpToEnd();
            check(3);
        });
    });
}
