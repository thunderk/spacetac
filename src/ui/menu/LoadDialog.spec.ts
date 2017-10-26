/// <reference path="../TestGame.ts" />
/// <reference path="MainMenu.ts" />

module TK.SpaceTac.UI.Specs {
    testing("LoadDialog", test => {
        let testgame = setupSingleView(() => [new MainMenu(), []]);

        test.acase("joins remote sessions as spectator", async check => {
            return new Promise((resolve, reject) => {
                let view = <MainMenu>testgame.ui.state.getCurrentState();

                let session = new GameSession();
                check.equals(session.primary, true);
                check.equals(session.spectator, false);
                view.getConnection().publish(session, "Test").then(token => {
                    let dialog = new LoadDialog(view);
                    dialog.token_input.setContent(token);

                    spyOn(view.gameui, "setSession").and.callFake((joined: GameSession) => {
                        test.check.equals(joined.id, session.id);
                        check.equals(joined.primary, false);
                        check.equals(joined.spectator, true);
                        resolve();
                    });

                    dialog.join();
                });
            });
        });
    });
}
