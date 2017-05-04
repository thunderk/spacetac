module TS.SpaceTac.Multi {
    /**
     * Multiplayer connection to a Parse server
     */
    export class Connection {
        device_id: string
        serializer = new Serializer(TS.SpaceTac)
        token_chars = "abcdefghjkmnpqrstuvwxyz123456789"
        storage: IRemoteStorage

        constructor(device_id: string, storage: IRemoteStorage) {
            this.device_id = device_id;
            this.storage = storage;
        }

        /**
         * Generate a random token
         */
        generateToken(length: number): string {
            return range(length).map(() => RandomGenerator.global.choice(<any>this.token_chars)).join("");
        }

        /**
         * Find an unused session token
         */
        async getUnusedToken(length = 5): Promise<string> {
            let token = this.generateToken(length);
            let existing = await this.storage.search("sessioninfo", { token: token });
            if (existing.length > 0) {
                token = await this.getUnusedToken(length + 1);
            }
            return token;
        }

        /**
         * Publish a session to remote server, and return an invitation token
         */
        async publish(session: GameSession, description: string): Promise<string> {
            await this.storage.upsert("session", { ref: session.id }, { data: this.serializer.serialize(session) });

            let now = new Date();
            let date = now.toISOString().substr(0, 10) + " " + now.toTimeString().substr(0, 5);
            let info = `${date}\n${description}`;

            let sessinfo = await this.storage.find("sessioninfo", { ref: session.id, device: this.device_id });
            let token: string = sessinfo ? sessinfo.token : "";
            if (token.length == 0) {
                token = await this.getUnusedToken();
            }
            await this.storage.upsert("sessioninfo", { ref: session.id, device: this.device_id, token: token }, { info: info });

            return token;
        }

        /**
         * Load a session from a remote server, by its token
         */
        async loadByToken(token: string): Promise<GameSession | null> {
            let info = await this.storage.find("sessioninfo", { token: token });
            if (info) {
                return this.loadById(info.ref);
            } else {
                return null;
            }
        }

        /**
         * Load a session from a remote server, by its id
         */
        async loadById(id: string): Promise<GameSession | null> {
            let session = await this.storage.find("session", { ref: id });
            if (session) {
                let loaded = this.serializer.unserialize(session.data);
                if (loaded instanceof GameSession) {
                    return loaded;
                }
            }
            return null;
        }

        /**
         * List cloud saves, associated with current device
         */
        async listSaves(): Promise<{ [id: string]: string }> {
            let results = await this.storage.search("sessioninfo", { device: this.device_id });
            return dict(results.map(obj => <[string, string]>[obj.ref, obj.info]));
        }
    }
}
