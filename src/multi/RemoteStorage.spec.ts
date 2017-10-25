module TK.SpaceTac.Multi.Specs {
    testing("FakeRemoteStorage", test => {
        test.acase("can fetch a single record", async function () {
            let storage = new FakeRemoteStorage();

            let result = await storage.find("test", { key: 5 });
            expect(result).toBeNull();

            await storage.upsert("test", { key: 5 }, { text: "thingy" });

            result = await storage.find("test", { key: 5 });
            expect(result).toEqual({ key: 5, text: "thingy" });

            result = await storage.find("test", { key: 6 });
            expect(result).toBeNull();

            result = await storage.find("test", { key: 5, text: "thingy" });
            expect(result).toEqual({ key: 5, text: "thingy" });

            result = await storage.find("notest", { key: 5 });
            expect(result).toBeNull();
        });

        test.acase("inserts or updates objects", async function () {
            let storage = new FakeRemoteStorage();

            let result = await storage.search("test", { key: 5 });
            expect(result).toEqual([]);

            await storage.upsert("test", { key: 5 }, {});

            result = await storage.search("test", { key: 5 });
            expect(result).toEqual([{ key: 5 }]);

            await storage.upsert("test", { key: 5 }, { text: "thingy" });

            result = await storage.search("test", { key: 5 });
            expect(result).toEqual([{ key: 5, text: "thingy" }]);

            await storage.upsert("test", { key: 5 }, { text: "other thingy" });

            result = await storage.search("test", { key: 5 });
            expect(result).toEqual([{ key: 5, text: "other thingy" }]);

            await storage.upsert("test", { key: 5, text: "things" }, {});

            result = await storage.search("test", { key: 5 });
            expect(sortedBy(result, (x: any) => x.text)).toEqual([{ key: 5, text: "other thingy" }, { key: 5, text: "things" }]);
        });
    });
}