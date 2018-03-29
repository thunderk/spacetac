module TK.SpaceTac.Multi.Specs {
    testing("Connection", test => {
        test.acase("finds an unused token", async check => {
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let token = await connection.getUnusedToken(5);
            check.equals(token.length, 5);

            await storage.upsert("sessioninfo", { token: token }, {});

            check.patch(connection, "generateToken", nnf("", iterator([token, "123456"])));

            let other = await connection.getUnusedToken(5);
            check.equals(other, "123456");
        });

        test.acase("loads a session by its id", async check => {
            let session = new GameSession();
            let serializer = new Serializer(TK.SpaceTac);
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let result = await connection.loadById("abc");
            check.equals(result, null);

            await storage.upsert("session", { ref: "abc" }, { data: serializer.serialize(session) });

            result = await connection.loadById("abc");
            check.equals(result, session);
            result = await connection.loadById("abcd");
            check.equals(result, null);

            // even from another device
            let other = new Connection("notest", storage);
            result = await other.loadById("abc");
            check.equals(result, session);

            // do not load if it is not a GameSession
            await storage.upsert("session", { ref: "abcd" }, { data: serializer.serialize(new Player()) });
            result = await connection.loadById("abcd");
            check.equals(result, null);
        });

        test.acase("lists saves from a device", async check => {
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let result = await connection.listSaves();
            check.equals(result, {});

            await storage.upsert("sessioninfo", { device: "test", ref: "abc" }, { info: "ABC" });
            await storage.upsert("sessioninfo", { device: "other", ref: "abcd" }, { info: "ABCD" });
            await storage.upsert("sessioninfo", { device: "test", ref: "cba" }, { info: "CBA" });

            result = await connection.listSaves();
            check.equals(result, { abc: "ABC", cba: "CBA" });
        });

        test.acase("publishes saves and retrieves them by token", async check => {
            let session = new GameSession();
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let saves = await connection.listSaves();
            check.equals(items(saves).length, 0);

            let token = await connection.publish(session, "TEST");

            saves = await connection.listSaves();
            check.equals(items(saves).length, 1);

            let loaded = await connection.loadByToken(token);
            check.equals(loaded, session);

            let newtoken = await connection.publish(nn(loaded), "TEST");
            check.equals(token, newtoken);

            loaded = await connection.loadByToken(token);
            check.equals(loaded, session);

            saves = await connection.listSaves();
            check.equals(items(saves).length, 1);
        });
    });
}
