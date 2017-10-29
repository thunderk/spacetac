/// <reference path="TestGame.ts" />

module TK.SpaceTac.UI.Specs {
    testing("AssetLoading", test => {
        let testgame = setupSingleView(test, () => [new AssetLoading(), []]);

        test.case("loads correctly", check => {
            check.equals(testgame.ui.state.current, "test");
            // TODO test asset loading
        });

        test.case("builds cache keys from path", check => {
            check.equals(AssetLoading.getKey("dir/file-path"), "dir-file-path");
            check.equals(AssetLoading.getKey("dir/file-path.ext"), "dir-file-path");
            check.equals(AssetLoading.getKey("dir/file-path.mp3"), "dir-file-path");
        });
    });
}
