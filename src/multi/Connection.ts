/// <reference path="Parse.d.ts" />

module TS.SpaceTac.Multi {
    /**
     * Multiplayer connection to a Parse server
     */
    export class Connection {
        ui: MainUI
        serializer = new Serializer(TS.SpaceTac)
        model_session = Parse.Object.extend("SpaceTacSession")
        token_chars = "abcdefghjkmnpqrstuvwxyz123456789"

        constructor(ui: MainUI) {
            this.ui = ui;

            Parse.initialize("thunderk.net");
            Parse.serverURL = 'https://rs.thunderk.net/parse';
        }

        /**
         * Find an unused session token
         */
        getUnusedToken(length = 5): string {
            let token = range(length).map(() => RandomGenerator.global.choice(<any>this.token_chars)).join("");
            // TODO check if it is unused on server
            return token;
        }

        /**
         * Publish current session to remote server, and return a session token
         */
        publish(): string {
            let session = new this.model_session();
            let token = this.getUnusedToken();

            session.set("token", token);
            session.set("data", this.serializer.serialize(this.ui.session));

            session.save();

            return token;
        }

        /**
         * Load a session from a remote server, by its token
         */
        load(token: string): void {
            let query = new Parse.Query(this.model_session);
            query.equalTo("token", token);
            query.find({
                success: (results: any) => {
                    if (results.length == 1) {
                        let data = results[0].get("data");
                        let session = this.serializer.unserialize(data);
                        if (session instanceof GameSession) {
                            this.ui.session = session;
                            this.ui.state.start('router');
                        }
                    }
                }
            });
        }
    }
}
