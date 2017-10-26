module TK.SpaceTac.Multi.Specs {
    testing("FakeRemoteStorage", test => {
        test.acase("can fetch a single record", async check => {
            let storage = new FakeRemoteStorage();

            let result = await storage.find("test", { key: 5 });
            check.equals(result, null);

            await storage.upsert("test", { key: 5 }, { text: "thingy" });

            result = await storage.find("test", { key: 5 });
            check.equals(result, { key: 5, text: "thingy" });

            result = await storage.find("test", { key: 6 });
            check.equals(result, null);

            result = await storage.find("test", { key: 5, text: "thingy" });
            check.equals(result, { key: 5, text: "thingy" });

            result = await storage.find("notest", { key: 5 });
            check.equals(result, null);
        });

        test.acase("inserts or updates objects", async check => {
            let storage = new FakeRemoteStorage();

            let result = await storage.search("test", { key: 5 });
            check.equals(result, []);

            await storage.upsert("test", { key: 5 }, {});

            result = await storage.search("test", { key: 5 });
            check.equals(result, [{ key: 5 }]);

            await storage.upsert("test", { key: 5 }, { text: "thingy" });

            result = await storage.search("test", { key: 5 });
            check.equals(result, [{ key: 5, text: "thingy" }]);

            await storage.upsert("test", { key: 5 }, { text: "other thingy" });

            result = await storage.search("test", { key: 5 });
            check.equals(result, [{ key: 5, text: "other thingy" }]);

            await storage.upsert("test", { key: 5, text: "things" }, {});

            result = await storage.search("test", { key: 5 });
            check.equals(sortedBy(result, (x: any) => x.text), [{ key: 5, text: "other thingy" }, { key: 5, text: "things" }]);
        });
    });
}