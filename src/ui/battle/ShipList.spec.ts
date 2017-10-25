/// <reference path="../TestGame.ts"/>

module TK.SpaceTac.UI.Specs {
    testing("ShipList", test => {
        let testgame = setupEmptyView();

        function createList(): ShipList {
            let view = testgame.view;
            let battle = new Battle();
            let tactical_mode = new Toggle();
            let ship_buttons = jasmine.createSpyObj("ship_buttons", ["cursorOnShip", "cursorOffShip", "cursorClicked"]);
            let list = new ShipList(view, battle, battle.fleets[0].player, tactical_mode, ship_buttons);
            return list;
        }

        test.case("handles play position of ships", check => {
            let list = createList();
            let battle = list.battle;
            check.equals(list.items.length, 0, "no item at first");

            battle.fleets[0].addShip();
            list.setShipsFromBattle(battle, false);
            check.equals(list.items.length, 1, "one ship added but not in play order");
            check.equals(list.items[0].visible, false, "one ship added but not in play order");

            battle.throwInitiative();
            list.refresh(false);
            check.equals(list.items[0].visible, true, "ship now in play order");

            battle.fleets[1].addShip();
            battle.throwInitiative();
            list.setShipsFromBattle(battle, false);
            check.equals(list.items.length, 2, "ship added in the other fleet");
            check.equals(nn(list.findItem(battle.play_order[0])).position, new Phaser.Point(2, 843));
            check.equals(nn(list.findItem(battle.play_order[1])).position, new Phaser.Point(2, 744));

            battle.advanceToNextShip();
            list.refresh(false);
            check.equals(nn(list.findItem(battle.play_order[0])).position, new Phaser.Point(-18, 962));
            check.equals(nn(list.findItem(battle.play_order[1])).position, new Phaser.Point(2, 843));

            battle.advanceToNextShip();
            list.refresh(false);
            check.equals(nn(list.findItem(battle.play_order[0])).position, new Phaser.Point(2, 843));
            check.equals(nn(list.findItem(battle.play_order[1])).position, new Phaser.Point(-18, 962));
            
            battle.fleets[1].addShip();
            battle.throwInitiative();
            battle.advanceToNextShip();
            list.setShipsFromBattle(battle, false);
            check.equals(list.items.length, 3, "three ships");
            check.equals(nn(list.findItem(battle.play_order[0])).position, new Phaser.Point(-18, 962));
            check.equals(nn(list.findItem(battle.play_order[1])).position, new Phaser.Point(2, 843));
            check.equals(nn(list.findItem(battle.play_order[2])).position, new Phaser.Point(2, 744));

            let dead = battle.play_order[1];
            dead.setDead();
            list.refresh(false);
            check.equals(list.items.length, 3, "dead ship");
            check.equals(nn(list.findItem(battle.play_order[0])).position, new Phaser.Point(-18, 962));
            check.equals(nn(list.findItem(dead)).position, new Phaser.Point(200, 843));
            check.equals(nn(list.findItem(battle.play_order[1])).position, new Phaser.Point(2, 843));
        });
    });
}
