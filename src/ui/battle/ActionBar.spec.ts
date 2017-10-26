/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ActionBar", test => {
        let testgame = setupBattleview();

        test.case("lists available actions for selected ship", check => {
            var bar = testgame.view.action_bar;

            // Ship not owned by current battleview player
            var ship = new Ship();
            bar.setShip(ship);
            check.equals(bar.action_icons.length, 0);

            // Ship with no equipment (only endturn action)
            testgame.view.player = ship.getPlayer();
            bar.setShip(ship);
            check.equals(bar.action_icons.length, 1);
            check.equals(bar.action_icons[0].action.code, "endturn");

            // Add an engine, with move action
            TestTools.addEngine(ship, 50);
            bar.setShip(ship);
            check.equals(bar.action_icons.length, 2);
            check.equals(bar.action_icons[0].action.code, "move");

            // Add a weapon, with fire action
            TestTools.addWeapon(ship, 10, 1, 100);
            bar.setShip(ship);
            check.equals(bar.action_icons.length, 3);
            check.equals(bar.action_icons[1].action.code, "fire-equipment");
        });

        test.case("updates power points display", check => {
            let bar = testgame.view.action_bar;

            function checkpoints(available = 0, using = 0, used = 0) {
                check.same(bar.power_icons.children.length, available + using + used);
                bar.power_icons.children.forEach((child, idx) => {
                    let img = <Phaser.Image>child;
                    if (idx < available) {
                        check.equals(img.name, "battle-actionbar-power-available");
                    } else if (idx < available + using) {
                        check.equals(img.name, "battle-actionbar-power-move");
                    } else {
                        check.equals(img.name, "battle-actionbar-power-used");
                    }
                });
            }

            // not owned ship
            let ship = new Ship();
            TestTools.setShipAP(ship, 8);
            bar.setShip(ship);
            checkpoints();

            // owned ship
            ship.fleet = testgame.view.player.fleet;
            bar.setShip(ship);
            checkpoints(8);

            // used points
            ship.setValue("power", 6);
            testgame.view.log_processor.jumpToEnd();
            checkpoints(6, 0, 2);

            // using points
            bar.updatePower(5);
            checkpoints(1, 5, 2);

            // decrease
            ship.setAttribute("power_capacity", 3);
            testgame.view.log_processor.jumpToEnd();
            checkpoints(3);
        });
    });
}
