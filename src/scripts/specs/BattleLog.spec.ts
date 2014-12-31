module SpaceTac.Specs {

    // Check a single game log event
    function checkEvent(got: Game.Events.BaseLogEvent, ship: Game.Ship, code: string,
                        target_ship: Game.Ship = null, target_x: number = null, target_y: number = null): void {
        if (target_ship) {
            if (target_x === null) {
                target_x = target_ship.arena_x;
            }
            if (target_y === null) {
                target_y = target_ship.arena_y;
            }
        }

        expect(got.ship).toBe(ship);
        expect(got.code).toEqual(code);
        expect(got.target.ship).toBe(target_ship);
        if (target_x === null) {
            expect(got.target.x).toBeNull();
        } else {
            expect(got.target.x).toBeCloseTo(target_x, 0.000001);
        }
        if (target_y === null) {
            expect(got.target.y).toBeNull();
        } else {
            expect(got.target.y).toBeCloseTo(target_y, 0.000001);
        }
    }

    describe("BattleLog", function () {
        it("logs ship change events", function () {
            var battle = Game.Battle.newQuickRandom();
            expect(battle.log.events.length).toBe(0);

            battle.advanceToNextShip();
            expect(battle.log.events.length).toBe(1);
            checkEvent(battle.log.events[0], battle.play_order[0], "ship_change", battle.play_order[1]);
        });
    });
}