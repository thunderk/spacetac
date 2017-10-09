/// <reference path="TestGame.ts" />

module TK.SpaceTac.UI.Specs {
    describe("AssetLoading", () => {
        let testgame = setupSingleView(() => [new AssetLoading(), []]);

        it("loads correctly", function () {
            expect(testgame.ui.state.current).toEqual("test");
            // TODO test asset loading
        });

        it("builds cache keys from path", function () {
            expect(AssetLoading.getKey("dir/file-path")).toEqual("dir-file-path");
            expect(AssetLoading.getKey("dir/file-path.ext")).toEqual("dir-file-path");
            expect(AssetLoading.getKey("dir/file-path.mp3")).toEqual("dir-file-path");
        });
    });
}
