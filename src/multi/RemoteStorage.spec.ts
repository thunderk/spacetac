module TS.SpaceTac.Multi.Specs {
    describe("FakeRemoteStorage", function () {
        async_it("can fetch a single record", async function () {
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

        async_it("inserts or updates objects", async function () {
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
            expect(result.sort((a: any, b: any) => cmp(a.text, b.text))).toEqual([{ key: 5, text: "other thingy" }, { key: 5, text: "things" }]);
        });
    });
}