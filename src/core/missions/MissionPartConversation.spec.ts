module TK.SpaceTac.Specs {
    describe("MissionPartConversation", () => {
        it("advances through conversation", function () {
            let universe = new Universe();
            let fleet = new Fleet();
            let ship1 = new Ship(null, "Tim");
            let ship2 = new Ship(null, "Ben");
            let part = new MissionPartConversation(new Mission(universe, fleet), [ship1, ship2], "Talk to Tim");

            expect(part.title).toEqual("Talk to Tim");
            expect(part.checkCompleted()).toBe(true, "No dialog piece");

            part.addPiece(ship1, "Hi !");
            part.addPiece(ship2, "Indeed, hi !");
            part.addPiece(null, "Hum, hello.");
            expect(part.checkCompleted()).toBe(false, "Dialog pieces added");
            expect(part.getCurrent()).toEqual({ interlocutor: ship1, message: "Hi !" });

            part.next();
            expect(part.checkCompleted()).toBe(false, "Second piece");
            expect(part.getCurrent()).toEqual({ interlocutor: ship2, message: "Indeed, hi !" });

            part.next();
            expect(part.checkCompleted()).toBe(false, "Last piece");
            expect(part.getCurrent()).toEqual({ interlocutor: null, message: "Hum, hello." });

            let ship = fleet.addShip();
            expect(part.getCurrent()).toEqual({ interlocutor: ship, message: "Hum, hello." });

            part.next();
            expect(part.checkCompleted()).toBe(true, "Dialog ended");
            expect(part.getCurrent()).toEqual({ interlocutor: null, message: "" });
        })

        it("force completes", function () {
            let universe = new Universe();
            let fleet = new Fleet();
            let ship = new Ship(null, "Tim");
            let part = new MissionPartConversation(new Mission(universe, fleet), [ship]);
            part.addPiece(null, "Hello !");
            part.addPiece(ship, "Hiya !");

            expect(part.title).toEqual("Speak with Tim");
            expect(part.checkCompleted()).toBe(false);
            expect(part.getCurrent()).toEqual({ interlocutor: null, message: "Hello !" });

            part.forceComplete();
            expect(part.checkCompleted()).toBe(true);
            expect(part.getCurrent()).toEqual({ interlocutor: null, message: "" });
        });
    })
}
