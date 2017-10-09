/// <reference path="TestGame.ts" />
/// <reference path="Boot.ts" />

module TK.SpaceTac.UI.Specs {
    describe("Boot", () => {
        let testgame = setupSingleView(() => [new Boot(), []]);

        it("places empty loading background", function () {
            expect(testgame.ui.world.children.length).toBe(1);
            expect(testgame.ui.world.children[0] instanceof Phaser.Image).toBe(true);
        });
    });
}
