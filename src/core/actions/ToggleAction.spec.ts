module TK.SpaceTac {
    describe("ToggleAction", function () {
        it("returns correct targetting mode", function () {
            let action = new ToggleAction(new Equipment(), 1, 0, []);
            expect(action.getTargettingMode(new Ship())).toBe(ActionTargettingMode.SELF_CONFIRM);

            action.activated = true;
            expect(action.getTargettingMode(new Ship())).toBe(ActionTargettingMode.SELF_CONFIRM);

            action = new ToggleAction(new Equipment(), 1, 50, []);
            expect(action.getTargettingMode(new Ship())).toBe(ActionTargettingMode.SURROUNDINGS);

            action.activated = true;
            expect(action.getTargettingMode(new Ship())).toBe(ActionTargettingMode.SELF_CONFIRM);
        })

        it("collects impacted ships", function () {
            let action = new ToggleAction(new Equipment(), 1, 50, []);
            let battle = new Battle();
            let ship1 = battle.fleets[0].addShip();
            ship1.setArenaPosition(0, 0);
            let ship2 = battle.fleets[0].addShip();
            ship2.setArenaPosition(0, 30);
            let ship3 = battle.fleets[0].addShip();
            ship3.setArenaPosition(0, 60);

            let result = action.getImpactedShips(ship1, Target.newFromShip(ship1));
            expect(result).toEqual([ship1, ship2]);
        });
    })
}
