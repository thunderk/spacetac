module TK.SpaceTac.Specs {
    describe("BattleCheats", function () {
        it("wins a battle", function () {
            let battle = Battle.newQuickRandom();

            battle.cheats.win();
            expect(battle.ended).toBe(true, "ended");
            expect(battle.outcome.winner).toBe(battle.fleets[0], "winner");
            expect(battle.log.events.filter(event => event instanceof DeathEvent).map(event => event.ship)).toEqual(battle.fleets[1].ships, "all mark dead");
            expect(any(battle.fleets[1].ships, ship => !ship.alive)).toBe(false, "all restored");
        })

        it("loses a battle", function () {
            let battle = Battle.newQuickRandom();

            battle.cheats.lose();
            expect(battle.ended).toBe(true, "ended");
            expect(battle.outcome.winner).toBe(battle.fleets[1], "winner");
            expect(battle.log.events.filter(event => event instanceof DeathEvent).map(event => event.ship)).toEqual(battle.fleets[0].ships, "all mark dead");
            expect(any(battle.fleets[0].ships, ship => !ship.alive)).toBe(false, "all restored");
        })

        it("adds an equipment", function () {
            let battle = new Battle();
            battle.playing_ship = new Ship();
            battle.playing_ship.upgradeSkill("skill_materials");

            expect(battle.playing_ship.listEquipment()).toEqual([]);
            battle.cheats.equip("Iron Hull");
            expect(battle.playing_ship.listEquipment()).toEqual([<any>jasmine.objectContaining({name: "Iron Hull", level: 1})]);
        })
    })
}
