module TK.SpaceTac.UI.Specs {
    testing("ShipList", test => {
        let testgame = setupEmptyView(test);

        function createList(): ShipList {
            let view = testgame.view;
            let battle = new Battle();
            let player = new Player();
            battle.fleets[0].setPlayer(player);
            let tactical_mode = new Toggle();
            let ship_buttons = {
                cursorOnShip: nop,
                cursorOffShip: nop,
                cursorClicked: nop,
            };
            let list = new ShipList(view, battle, player, tactical_mode, ship_buttons);
            return list;
        }

        test.case("handles play position of ships", check => {
            let list = createList();
            let battle = list.battle;
            check.in("initial", check => {
                check.equals(list.items.length, 0, "no item at first");
            });

            let ship = battle.fleets[0].addShip();
            TestTools.setShipModel(ship, 10, 0);
            list.setShipsFromBattle(battle, false);
            check.in("one ship added but not in play order", check => {
                check.equals(list.items.length, 1, "item count");
                check.equals(list.items[0].visible, false, "ship card not visible");
            });

            battle.throwInitiative();
            list.refresh(0);
            check.in("ship now in play order", check => {
                check.equals(list.items[0].visible, true, "ship card visible");
            });

            ship = battle.fleets[1].addShip();
            TestTools.setShipModel(ship, 10, 0);
            battle.throwInitiative();
            list.setShipsFromBattle(battle, false);
            check.in("ship added in the other fleet", check => {
                check.equals(list.items.length, 2, "item count");
                check.equals(nn(list.findItem(battle.play_order[0])).location, { x: 2, y: 843 }, "first ship position");
                check.equals(nn(list.findItem(battle.play_order[1])).location, { x: 2, y: 744 }, "second ship position");
            });

            battle.setPlayingShip(battle.play_order[0]);
            list.refresh(0);
            check.in("started", check => {
                check.equals(nn(list.findItem(battle.play_order[0])).location, { x: -14, y: 962 }, "first ship position");
                check.equals(nn(list.findItem(battle.play_order[1])).location, { x: 2, y: 843 }, "second ship position");
            });

            battle.advanceToNextShip();
            list.refresh(0);
            check.in("end turn", check => {
                check.equals(nn(list.findItem(battle.play_order[0])).location, { x: 2, y: 843 }, "first ship position");
                check.equals(nn(list.findItem(battle.play_order[1])).location, { x: -14, y: 962 }, "second ship position");
            });

            ship = battle.fleets[1].addShip();
            TestTools.setShipModel(ship, 10, 0);
            battle.throwInitiative();
            battle.setPlayingShip(battle.play_order[0]);
            list.setShipsFromBattle(battle, false);
            check.in("third ship added", check => {
                check.equals(list.items.length, 3, "item count");
                check.equals(nn(list.findItem(battle.play_order[0])).location, { x: -14, y: 962 }, "first ship position");
                check.equals(nn(list.findItem(battle.play_order[1])).location, { x: 2, y: 843 }, "second ship position");
                check.equals(nn(list.findItem(battle.play_order[2])).location, { x: 2, y: 744 }, "third ship position");
            });

            let dead = battle.play_order[1];
            dead.setDead();
            list.refresh(0);
            check.in("ship dead", check => {
                check.equals(list.items.length, 3, "item count");
                check.equals(nn(list.findItem(battle.play_order[0])).location, { x: -14, y: 962 }, "first ship position");
                check.equals(nn(list.findItem(dead)).location, { x: 200, y: 843 }, "dead ship position");
                check.equals(nn(list.findItem(battle.play_order[1])).location, { x: 2, y: 843 }, "second ship position");
            });
        });
    });
}
