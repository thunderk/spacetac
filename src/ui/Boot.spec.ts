/// <reference path="TestGame.ts" />
/// <reference path="Boot.ts" />

module TK.SpaceTac.UI.Specs {
    testing("Boot", test => {
        let testgame = setupSingleView(test, () => [new Boot({}), {}]);

        test.case("places empty loading background", check => {
            check.equals(testgame.view.children.length, 1);
            check.equals(testgame.view.children.list[0] instanceof Phaser.GameObjects.Image, true);
        });
    });
}
