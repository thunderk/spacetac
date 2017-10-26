module TK.SpaceTac.Multi.Specs {
    testing("Exchange", test => {
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

        test.acase("says hello on start", async check => {
            let [storage, peer1, peer2] = newExchange("abc");
            spyOn(peer1, "getNextId").and.returnValues("1A", "1B", "1C");
            spyOn(peer2, "getNextId").and.returnValues("2A", "2B", "2C");

            check.equals(peer1.next, "hello");
            check.equals(peer2.next, "hello");
            check.equals(peer1.remotepeer, null);
            check.equals(peer2.remotepeer, null);
            check.equals(peer1.writing, true);
            check.equals(peer2.writing, false);
            check.equals(peer1.count, 0);
            check.equals(peer2.count, 0);

            await Promise.all([peer1.start(), peer2.start()]);

            check.equals(storage.collections["exchange"], [
                { peer: "peer1", current: "hello", next: "1A", count: 0, token: "abc", over: true, data: null },
                { peer: "peer2", current: "1A", next: "2A", count: 1, token: "abc", over: true, data: null },
            ]);

            check.equals(peer1.next, "2A");
            check.equals(peer2.next, "2A");
            check.equals(peer1.remotepeer, "peer2");
            check.equals(peer2.remotepeer, "peer1");
            check.equals(peer1.writing, true);
            check.equals(peer2.writing, false);
            check.equals(peer1.count, 2);
            check.equals(peer2.count, 2);

            // same peers, new message chain
            [storage, peer1, peer2] = newExchange("abc", storage);
            spyOn(peer1, "getNextId").and.returnValues("1R", "1S", "1T");
            spyOn(peer2, "getNextId").and.returnValues("2R", "2S", "2T");

            await Promise.all([peer1.start(), peer2.start()]);

            check.equals(storage.collections["exchange"], [
                { peer: "peer1", current: "hello", next: "1R", count: 0, token: "abc", over: true, data: null },
                { peer: "peer2", current: "1A", next: "2A", count: 1, token: "abc", over: true, data: null },
                { peer: "peer2", current: "1R", next: "2R", count: 1, token: "abc", over: true, data: null },
            ]);
        })
    })
}