/// <reference path="TestGame.ts" />
/// <reference path="MainMenu.ts" />

module TS.SpaceTac.UI.Specs {
    function inview_it(desc: string, func: (view: MainMenu) => void) {
        var view = new MainMenu();
        ingame_it(desc, (game: Phaser.Game, state: Phaser.State) => {
            func(view);
        }, view);
    }

    describe("MainMenu", () => {
        inview_it("adds moving stars, a title and three buttons", function (view) {
            expect(view.world.children.length).toBe(301);

            let group = <Phaser.Group>view.world.children[300];
            expect(group instanceof Phaser.Group).toBe(true);

            expect(group.children.length).toBe(4);
            expect(group.children[0] instanceof Phaser.Button).toBe(true);
            expect(group.children[1] instanceof Phaser.Button).toBe(true);
            expect(group.children[2] instanceof Phaser.Button).toBe(true);
            expect(group.children[3] instanceof Phaser.Image).toBe(true);
        });
    });
}
