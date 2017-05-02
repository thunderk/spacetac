if (typeof window != "undefined") {
    (<any>window).describe = (<any>window).describe || function () { };
}

module TS.SpaceTac.Specs {
    class FakeStorage {
        data: any = {}
        getItem(name: string) {
            return this.data[name];
        }
        setItem(name: string, value: string) {
            this.data[name] = value;
        }
    }

    describe("MainUI", () => {
        beforeEach(function () {
            spyOn(console, "log").and.stub();
            spyOn(console, "warn").and.stub();
            spyOn(console, "error").and.stub();
        });

        it("saves games in local browser storage", function () {
            let ui = new MainUI(true);
            ui.storage = <any>new FakeStorage();

            let result = ui.loadGame("spacetac-test-save");
            expect(result).toBe(false);

            ui.session.startNewGame();
            let systems = ui.session.universe.stars.length;
            let links = ui.session.universe.starlinks.length;

            result = ui.saveGame("spacetac-test-save");
            expect(result).toBe(true);
            expect(ui.storage.getItem("spacetac-test-save")).toBeTruthy();

            ui.session = new GameSession();
            expect(ui.session.universe.stars.length).not.toBe(systems);

            result = ui.loadGame("spacetac-test-save");
            expect(result).toBe(true);
            expect(ui.session.universe.stars.length).toBe(systems);
            expect(ui.session.universe.starlinks.length).toBe(links);
        });
    });
}
