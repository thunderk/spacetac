module TK.SpaceTac.UI.Specs {
    testing("CharacterSheet", test => {

        testing("in UI", test => {
            let testgame = setupEmptyView(test);

            test.case("displays fleet and ship information", check => {
                let view = testgame.view;
                check.patch(view, "getWidth", () => 1240);
                let sheet = new CharacterSheet(view, CharacterSheetMode.DISPLAY);

                check.equals(sheet.x, -1240);

                let fleet = new Fleet();
                let ship1 = fleet.addShip();
                ship1.name = "Ship 1";
                let ship2 = fleet.addShip();
                ship2.name = "Ship 2";

                sheet.show(ship1, false);

                check.equals(sheet.x, 0);
                check.equals(sheet.group_portraits.length, 2);

                check.equals(sheet.text_name && sheet.text_name.text, "Ship 1");

                let portrait = as(Phaser.Button, sheet.group_portraits.getChildAt(1));
                portrait.onInputUp.dispatch();

                check.equals(sheet.text_name && sheet.text_name.text, "Ship 2");
            });

            test.case("controls global interactivity state", check => {
                let sheet = new CharacterSheet(testgame.view, CharacterSheetMode.EDITION);
                check.equals(sheet.isInteractive(), false, "no ship");

                let ship = new Ship();
                ship.critical = true;
                sheet.show(ship);
                check.equals(sheet.isInteractive(), false, "critical ship");

                ship.critical = false;
                sheet.show(ship);
                check.equals(sheet.isInteractive(), true, "normal ship");

                sheet = new CharacterSheet(testgame.view, CharacterSheetMode.DISPLAY);
                sheet.show(ship);
                check.equals(sheet.isInteractive(), false, "interactivity disabled");

                sheet.show(ship);
                check.equals(sheet.isInteractive(), false, "interactivity stays disabled");
            });
        });
    });
}
