module TK.SpaceTac.Specs {
    describe("RepelEffect", function () {
        it("shows a textual description", function () {
            expect(new RepelEffect(34).getDescription()).toEqual("repel ships 34km away");
        })
            
        it("repel other ships from a central point", function () {
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            ship1a.setArenaPosition(100, 100);
            let ship1b = battle.fleets[0].addShip();
            ship1b.setArenaPosition(250, 100);
            let ship2a = battle.fleets[1].addShip();
            ship2a.setArenaPosition(100, 280);

            let effect = new RepelEffect(12);
            effect.applyOnShip(ship1a, ship1a);
            effect.applyOnShip(ship1b, ship1a);
            effect.applyOnShip(ship2a, ship1a);

            expect(ship1a.location).toEqual(new ArenaLocationAngle(100, 100));
            expect(ship1b.location).toEqual(new ArenaLocationAngle(262, 100));
            expect(ship2a.location).toEqual(new ArenaLocationAngle(100, 292));
        })

        it("does not push a ship inside a hard exclusion area", function () {
            let battle = new Battle();
            let ship1a = battle.fleets[0].addShip();
            ship1a.setArenaPosition(100, 100);
            let ship2a = battle.fleets[1].addShip();
            ship2a.setArenaPosition(100, 200);
            let ship2b = battle.fleets[1].addShip();
            ship2b.setArenaPosition(100, 350);

            let effect = new RepelEffect(85);
            effect.applyOnShip(ship2a, ship1a);
            expect(ship2a.location).toEqual(new ArenaLocationAngle(100, 250));
        })
    })
}
