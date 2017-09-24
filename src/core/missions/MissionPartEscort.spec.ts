module TK.SpaceTac.Specs {
    describe("MissionPartEscort", () => {
        it("completes when the fleet is at location, with its escort", function () {
            let destination = new StarLocation(new Star(null, 0, 0, "Atanax"));
            destination.encounter_random = new SkewedRandomGenerator([0], true);

            let universe = new Universe();
            let fleet = new Fleet();
            let ship = new Ship(null, "Zybux");
            let part = new MissionPartEscort(new Mission(universe, fleet), destination, ship);

            expect(fleet.ships).not.toContain(ship);
            expect(part.title).toEqual("Escort Zybux to Atanax system");
            expect(part.checkCompleted()).toBe(false, "Init location");

            part.onStarted();
            expect(fleet.ships).toContain(ship);

            fleet.setLocation(destination, true);
            expect(part.checkCompleted()).toBe(false, "Encounter not clear");

            destination.clearEncounter();
            expect(part.checkCompleted()).toBe(true, "Encouter cleared");

            fleet.setLocation(new StarLocation(), true);
            expect(part.checkCompleted()).toBe(false, "Went to another system");

            fleet.setLocation(destination, true);
            expect(part.checkCompleted()).toBe(true, "Back at destination");
            expect(fleet.ships).toContain(ship);

            part.onEnded();
            expect(fleet.ships).not.toContain(ship);
        })

        it("sets the escorted ship as critical in battles", function () {
            let universe = new Universe();
            let fleet = new Fleet();
            let ship1 = fleet.addShip();
            let ship2 = fleet.addShip();
            let ship = new Ship();
            let destination = new StarLocation(new Star());
            let part = new MissionPartEscort(new Mission(universe, fleet), destination, ship);

            part.onStarted();
            expect(fleet.ships).toContain(ship);

            let enemy = new Fleet();
            enemy.addShip();
            let battle = new Battle(fleet, enemy);
            battle.start();
            battle.checkEndBattle();
            expect(battle.ended).toBe(false);

            // if a fleet member dies, it is not over
            ship1.setDead();
            battle.checkEndBattle();
            expect(battle.ended).toBe(false);

            // if the critical ship dies, it is defeat
            ship.setDead();
            battle.checkEndBattle();
            expect(battle.ended).toBe(true);
            expect(battle.outcome.winner).not.toBe(fleet);
        })
    })
}
