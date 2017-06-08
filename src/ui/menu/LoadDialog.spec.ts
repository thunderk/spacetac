/// <reference path="../TestGame.ts" />
/// <reference path="MainMenu.ts" />

module TS.SpaceTac.UI.Specs {
    describe("LoadDialog", () => {
        let testgame = setupSingleView(testgame => [new MainMenu(), []]);

        it("joins remote sessions as spectator", function (done) {
            let view = <MainMenu>testgame.ui.state.getCurrentState();

            let session = new GameSession();
            expect(session.primary).toBe(true);
            expect(session.spectator).toBe(false);
            view.getConnection().publish(session, "Test").then(token => {
                let dialog = new LoadDialog(view);
                dialog.token_input.setContent(token);

                spyOn(view.gameui, "setSession").and.callFake((joined: GameSession) => {
                    expect(joined.id).toEqual(session.id);
                    expect(joined.primary).toBe(false);
                    expect(joined.spectator).toBe(true);
                    done();
                });

                dialog.join();
            });
        });
    });
}
