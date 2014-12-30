/// <reference path="../definitions/jasmine.d.ts"/>

module SpaceTac.Specs {
    describe("Battle", function(){
        it("defines play order by initiative throws", function(){
            var fleet1 = new Game.Fleet(null);
            var fleet2 = new Game.Fleet(null);

            var ship1 = new Game.Ship(fleet1, "F1S1");
            ship1.initiative_level = 2;
            var ship2 = new Game.Ship(fleet1, "F1S2");
            ship2.initiative_level = 4;
            var ship3 = new Game.Ship(fleet1, "F1S3");
            ship3.initiative_level = 1;
            var ship4 = new Game.Ship(fleet2, "F2S1");
            ship4.initiative_level = 8;
            var ship5 = new Game.Ship(fleet2, "F2S2");
            ship5.initiative_level = 2;

            var battle = new Game.Battle(fleet1, fleet2);
            expect(battle.play_order.length).toBe(0);

            var gen = new Game.RandomGenerator(1.0, 0.1, 1.0, 0.2, 0.6);
            battle.throwInitiative(gen);

            expect(battle.play_order.length).toBe(5);
            expect(battle.play_order).toEqual([ship1, ship4, ship5, ship3, ship2]);
        });
    });
}
