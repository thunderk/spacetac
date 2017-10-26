module TK.SpaceTac.Specs {
    testing("MissionPartConversation", test => {
        test.case("advances through conversation", check => {
            let universe = new Universe();
            let fleet = new Fleet();
            let ship1 = new Ship(null, "Tim");
            let ship2 = new Ship(null, "Ben");
            let part = new MissionPartConversation(new Mission(universe, fleet), [ship1, ship2], "Talk to Tim");

            check.equals(part.title, "Talk to Tim");
            check.same(part.checkCompleted(), true, "No dialog piece");

            part.addPiece(ship1, "Hi !");
            part.addPiece(ship2, "Indeed, hi !");
            part.addPiece(null, "Hum, hello.");
            check.same(part.checkCompleted(), false, "Dialog pieces added");
            check.equals(part.getCurrent(), { interlocutor: ship1, message: "Hi !" });

            part.next();
            check.same(part.checkCompleted(), false, "Second piece");
            check.equals(part.getCurrent(), { interlocutor: ship2, message: "Indeed, hi !" });

            part.next();
            check.same(part.checkCompleted(), false, "Last piece");
            check.equals(part.getCurrent(), { interlocutor: null, message: "Hum, hello." });

            let ship = fleet.addShip();
            check.equals(part.getCurrent(), { interlocutor: ship, message: "Hum, hello." });

            part.next();
            check.same(part.checkCompleted(), true, "Dialog ended");
            check.equals(part.getCurrent(), { interlocutor: null, message: "" });
        })

        test.case("force completes", check => {
            let universe = new Universe();
            let fleet = new Fleet();
            let ship = new Ship(null, "Tim");
            let part = new MissionPartConversation(new Mission(universe, fleet), [ship]);
            part.addPiece(null, "Hello !");
            part.addPiece(ship, "Hiya !");

            check.equals(part.title, "Speak with Tim");
            check.equals(part.checkCompleted(), false);
            check.equals(part.getCurrent(), { interlocutor: null, message: "Hello !" });

            part.forceComplete();
            check.equals(part.checkCompleted(), true);
            check.equals(part.getCurrent(), { interlocutor: null, message: "" });
        });
    })
}
