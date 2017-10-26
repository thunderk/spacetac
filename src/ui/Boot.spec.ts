/// <reference path="TestGame.ts" />
/// <reference path="Boot.ts" />

module TK.SpaceTac.UI.Specs {
    testing("Boot", test => {
        let testgame = setupSingleView(() => [new Boot(), []]);

        test.case("places empty loading background", check => {
            check.equals(testgame.ui.world.children.length, 1);
            check.equals(testgame.ui.world.children[0] instanceof Phaser.Image, true);
        });
    });
}
