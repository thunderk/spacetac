/// <reference path="../TestGame.ts" />
/// <reference path="MainMenu.ts" />

module TK.SpaceTac.UI.Specs {
    testing("MainMenu", test => {
        let testgame = setupSingleView(() => [new MainMenu(), []]);

        test.case("adds moving stars, a title and three buttons", check => {
            let view = <MainMenu>testgame.ui.state.getCurrentState();

            check.equals(view.layer_stars.children.length, 300);
            check.equals(view.layer_title.children.length, 6);
            check.equals(view.layer_title.children[0] instanceof Phaser.Button, true);
            check.equals(view.layer_title.children[1] instanceof Phaser.Button, true);
            check.equals(view.layer_title.children[2] instanceof Phaser.Button, true);
            check.equals(view.layer_title.children[3] instanceof Phaser.Image, true);
        });
    });
}
