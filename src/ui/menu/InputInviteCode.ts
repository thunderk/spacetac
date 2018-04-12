module TK.SpaceTac.UI {
    /**
     * Input to display available save games, and load one
     */
    export class InputInviteCode {
        token_input: UITextInput

        constructor(private view: BaseView, private builder: UIBuilder, x: number, y: number) {
            this.token_input = new UITextInput(builder, "menu-input", x, y, 8, "Invite code");
        }

        /**
         * Join an online game
         */
        join(): void {
            let token = this.token_input.getContent();
            let connection = this.view.getConnection();

            connection.loadByToken(token).then(session => {
                if (session) {
                    // For now, we will only spectate
                    session.primary = false;
                    session.spectator = true;

                    this.view.gameui.setSession(session, token);
                }
            });
        }
    }
}
