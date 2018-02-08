/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ActionBar", test => {
        let testgame = setupBattleview(test);

        test.case("lists available actions for selected ship", check => {
            var bar = testgame.view.action_bar;

            // Ship not owned by current battleview player
            var ship = new Ship();
            bar.setShip(ship);
            check.equals(bar.action_icons.length, 0);

            // Ship with no equipment (only endturn action)
            let player = new Player();
            ship.fleet.setPlayer(player);
            testgame.view.player = player;
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
            check.equals(bar.action_icons[1].action.code, "weapon");
        });

        test.case("updates power points display", check => {
            let bar = testgame.view.action_bar;

            function checkpoints(desc: string, available = 0, using = 0, used = 0) {
                check.in(desc, check => {
                    check.same(bar.power_icons.children.length, available + using + used, "icon count");
                    bar.power_icons.children.forEach((child, idx) => {
                        let img = <Phaser.Image>child;
                        if (idx < available) {
                            check.equals(img.name, "battle-actionbar-power-available", `icon ${idx}`);
                        } else if (idx < available + using) {
                            check.equals(img.name, "battle-actionbar-power-move", `icon ${idx}`);
                        } else {
                            check.equals(img.name, "battle-actionbar-power-used", `icon ${idx}`);
                        }
                    });
                });
            }

            // not owned ship
            let ship = new Ship();
            TestTools.setShipModel(ship, 100, 0, 8);
            bar.setShip(ship);
            checkpoints("not owned ship");

            // owned ship
            testgame.view.player.fleet.addShip(ship);
            testgame.view.battle.ships.add(duplicate(ship, TK.SpaceTac));
            testgame.view.actual_battle.ships.add(ship);
            bar.setShip(ship);
            checkpoints("owned ship", 8);

            // used points
            testgame.view.actual_battle.applyDiffs(ship.getValueDiffs("power", 6));
            testgame.view.log_processor.processPending();
            checkpoints("2 points used", 6, 0, 2);

            // using points
            bar.updatePower(5);
            checkpoints("5 points in targetting", 1, 5, 2);

            // decrease
            testgame.view.actual_battle.applyDiffs([new ShipAttributeDiff(ship, "power_capacity", { limit: 3 }, {})]);
            testgame.view.log_processor.processPending();
            checkpoints("limit to 3", 3);
        });
    });
}
