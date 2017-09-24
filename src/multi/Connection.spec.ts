module TK.SpaceTac.Multi.Specs {
    describe("Connection", function () {
        async_it("finds an unused token", async function () {
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let token = await connection.getUnusedToken(5);
            expect(token.length).toBe(5);

            await storage.upsert("sessioninfo", { token: token }, {});

            spyOn(connection, "generateToken").and.returnValues(token, "123456");

            let other = await connection.getUnusedToken(5);
            expect(other).toEqual("123456");
        });

        async_it("loads a session by its id", async function () {
            let session = new GameSession();
            let serializer = new Serializer(TK.SpaceTac);
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let result = await connection.loadById("abc");
            expect(result).toBeNull();

            await storage.upsert("session", { ref: "abc" }, { data: serializer.serialize(session) });

            result = await connection.loadById("abc");
            expect(result).toEqual(session);
            result = await connection.loadById("abcd");
            expect(result).toBeNull();

            // even from another device
            let other = new Connection("notest", storage);
            result = await other.loadById("abc");
            expect(result).toEqual(session);

            // do not load if it is not a GameSession
            await storage.upsert("session", { ref: "abcd" }, { data: serializer.serialize(new Player()) });
            result = await connection.loadById("abcd");
            expect(result).toBeNull();
        });

        async_it("lists saves from a device", async function () {
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let result = await connection.listSaves();
            expect(result).toEqual({});

            await storage.upsert("sessioninfo", { device: "test", ref: "abc" }, { info: "ABC" });
            await storage.upsert("sessioninfo", { device: "other", ref: "abcd" }, { info: "ABCD" });
            await storage.upsert("sessioninfo", { device: "test", ref: "cba" }, { info: "CBA" });

            result = await connection.listSaves();
            expect(result).toEqual({ abc: "ABC", cba: "CBA" });
        });

        async_it("publishes saves and retrieves them by token", async function () {
            let session = new GameSession();
            let storage = new FakeRemoteStorage();
            let connection = new Connection("test", storage);

            let saves = await connection.listSaves();
            expect(items(saves).length).toEqual(0);

            let token = await connection.publish(session, "TEST");

            saves = await connection.listSaves();
            expect(items(saves).length).toEqual(1);

            let loaded = await connection.loadByToken(token);
            expect(loaded).toEqual(session);

            let newtoken = await connection.publish(nn(loaded), "TEST");
            expect(token).toEqual(newtoken);

            loaded = await connection.loadByToken(token);
            expect(loaded).toEqual(session);

            saves = await connection.listSaves();
            expect(items(saves).length).toEqual(1);
        });
    });
}
