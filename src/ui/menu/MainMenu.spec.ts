/// <reference path="../TestGame.ts" />
/// <reference path="MainMenu.ts" />

module TS.SpaceTac.UI.Specs {
    describe("MainMenu", () => {
        let testgame = setupSingleView(testgame => [new MainMenu(), []]);

        it("adds moving stars, a title and three buttons", function () {
            let view = <MainMenu>testgame.ui.state.getCurrentState();

            expect(view.layer_stars.children.length).toBe(300);
            expect(view.layer_title.children.length).toBe(6);
            expect(view.layer_title.children[0] instanceof Phaser.Button).toBe(true);
            expect(view.layer_title.children[1] instanceof Phaser.Button).toBe(true);
            expect(view.layer_title.children[2] instanceof Phaser.Button).toBe(true);
            expect(view.layer_title.children[3] instanceof Phaser.Image).toBe(true);
            expect(view.layer_title.children[5] instanceof LoadDialog).toBe(true);
        });
    });
}
