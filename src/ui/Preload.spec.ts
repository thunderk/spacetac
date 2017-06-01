/// <reference path="TestGame.ts" />
/// <reference path="Preload.ts" />

module TS.SpaceTac.UI.Specs {
    describe("Preload", () => {
        let testgame = setupSingleView(testgame => [new Preload(), []]);

        it("loads correctly", function () {
            expect(testgame.ui.state.current).toEqual("test");
            // TODO test asset loading
        });

        it("builds cache keys from path", function () {
            expect(Preload.getKey("dir/file-path")).toEqual("dir-file-path");
            expect(Preload.getKey("dir/file-path.ext")).toEqual("dir-file-path");
            expect(Preload.getKey("dir/file-path.mp3")).toEqual("dir-file-path");
        });
    });
}
