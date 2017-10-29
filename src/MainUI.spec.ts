/// <reference path="ui/TestGame.ts" />

module TK.SpaceTac.UI.Specs {
    class FakeStorage {
        data: any = {}
        getItem(name: string) {
            return this.data[name];
        }
        setItem(name: string, value: string) {
            this.data[name] = value;
        }
    }

    testing("MainUI", test => {
        let testgame = setupEmptyView(test);

        test.case("saves games in local browser storage", check => {
            let ui = testgame.ui;
            ui.storage = <any>new FakeStorage();

            let result = ui.loadGame("spacetac-test-save");
            check.equals(result, false);

            ui.session.startNewGame();
            let systems = ui.session.universe.stars.length;
            let links = ui.session.universe.starlinks.length;

            result = ui.saveGame("spacetac-test-save");
            check.equals(result, true);
            check.equals(bool(ui.storage.getItem("spacetac-test-save")), true);

            ui.session = new GameSession();
            check.notsame(ui.session.universe.stars.length, systems);

            result = ui.loadGame("spacetac-test-save");
            check.equals(result, true);
            check.same(ui.session.universe.stars.length, systems);
            check.same(ui.session.universe.starlinks.length, links);
        });
    });
}
