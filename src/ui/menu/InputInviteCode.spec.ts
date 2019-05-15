module TK.SpaceTac.UI.Specs {
    testing("InputInviteCode", test => {
        let testgame = setupEmptyView(test);

        test.acase("joins remote sessions as spectator", async check => {
            return new Promise((resolve, reject) => {
                let view = testgame.view;
                let session = new GameSession();
                check.equals(session.primary, true);
                check.equals(session.spectator, false);
                view.getConnection().publish(session, "Test").then(token => {
                    let dialog = new InputInviteCode(view, new UIBuilder(view), 0, 0);
                    dialog.token_input.setContent(token);

                    check.patch(view.gameui, "setSession", (joined: GameSession) => {
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
