module TS.SpaceTac.Multi.Specs {
    describe("Exchange", function () {
        function newExchange(token: string, storage = new FakeRemoteStorage()): [FakeRemoteStorage, Exchange, Exchange] {
            let connection = new Connection("test", storage);

            let peer1 = new Exchange(connection, token, true, "peer1");
            let peer2 = new Exchange(connection, token, false, "peer2");
            peer1.timer = new Timer(true);
            peer2.timer = new Timer(true);
            /*peer1.debug = true;
            peer2.debug = true;*/

            return [storage, peer1, peer2];
        }

        beforeEach(function () {
            spyOn(console, "log").and.stub();
        });

        async_it("says hello on start", async function () {
            let [storage, peer1, peer2] = newExchange("abc");
            spyOn(peer1, "getNextId").and.returnValues("1A", "1B", "1C");
            spyOn(peer2, "getNextId").and.returnValues("2A", "2B", "2C");

            expect(peer1.next).toEqual("hello");
            expect(peer2.next).toEqual("hello");
            expect(peer1.remotepeer).toBeNull();
            expect(peer2.remotepeer).toBeNull();
            expect(peer1.writing).toBe(true);
            expect(peer2.writing).toBe(false);
            expect(peer1.count).toBe(0);
            expect(peer2.count).toBe(0);

            await Promise.all([peer1.start(), peer2.start()]);

            expect(storage.collections["exchange"]).toEqual([
                { peer: "peer1", current: "hello", next: "1A", count: 0, token: "abc", over: true, data: null },
                { peer: "peer2", current: "1A", next: "2A", count: 1, token: "abc", over: true, data: null },
            ]);

            expect(peer1.next).toEqual("2A");
            expect(peer2.next).toEqual("2A");
            expect(peer1.remotepeer).toBe("peer2");
            expect(peer2.remotepeer).toBe("peer1");
            expect(peer1.writing).toBe(true);
            expect(peer2.writing).toBe(false);
            expect(peer1.count).toBe(2);
            expect(peer2.count).toBe(2);

            // same peers, new message chain
            [storage, peer1, peer2] = newExchange("abc", storage);
            spyOn(peer1, "getNextId").and.returnValues("1R", "1S", "1T");
            spyOn(peer2, "getNextId").and.returnValues("2R", "2S", "2T");

            await Promise.all([peer1.start(), peer2.start()]);

            expect(storage.collections["exchange"]).toEqual([
                { peer: "peer1", current: "hello", next: "1R", count: 0, token: "abc", over: true, data: null },
                { peer: "peer2", current: "1A", next: "2A", count: 1, token: "abc", over: true, data: null },
                { peer: "peer2", current: "1R", next: "2R", count: 1, token: "abc", over: true, data: null },
            ]);
        })
    })
}