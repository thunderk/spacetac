module TK.SpaceTac.Specs {
    describe("Shop", () => {
        it("generates a stock", () => {
            let shop = new Shop();
            expect((<any>shop).stock.length).toBe(0);
            expect(shop.getStock().length).toBeGreaterThan(20);
        });

        it("buys and sells items", function () {
            let shop = <any>new Shop();
            let equ1 = new Equipment(SlotType.Shield, "shield");
            equ1.price = 50;
            let equ2 = new Equipment(SlotType.Hull, "hull");
            equ2.price = 150;
            shop.stock = [equ1, equ2];
            let fleet = new Fleet();
            fleet.credits = 1000;
            spyOn(shop, "getPrice").and.returnValue(800);

            let result = shop.sellToFleet(equ1, fleet);
            expect(result).toBe(true);
            expect(shop.stock).toEqual([equ2]);
            expect(fleet.credits).toEqual(200);
            result = shop.sellToFleet(equ2, fleet);
            expect(result).toBe(false);
            expect(shop.stock).toEqual([equ2]);
            expect(fleet.credits).toEqual(200);

            result = shop.buyFromFleet(equ1, fleet);
            expect(result).toBe(true);
            expect(shop.stock).toEqual([equ1, equ2]);
            expect(fleet.credits).toEqual(1000);
        });

        it("generates secondary missions", function () {
            let universe = new Universe();
            universe.generate(4);
            let start = universe.getStartLocation();

            let shop = new Shop();
            expect((<any>shop).missions.length).toBe(0);

            let result = shop.getMissions(start, 4);
            expect(result.length).toBe(4);
            expect((<any>shop).missions.length).toBe(4);

            let oresult = shop.getMissions(start, 4);
            expect(oresult).toEqual(result);

            result.forEach(mission => {
                expect(mission.main).toBe(false);
            });
        });

        it("assigns missions to a fleet", function () {
            let shop = new Shop();
            let player = new Player();
            let mission = new Mission(new Universe());
            (<any>shop).missions = [mission];

            expect(shop.getMissions(new StarLocation(), 1)).toEqual([mission]);
            expect(player.missions.secondary).toEqual([]);

            shop.acceptMission(mission, player);

            expect((<any>shop).missions).toEqual([]);
            expect(player.missions.secondary).toEqual([mission]);
            expect(mission.fleet).toBe(player.fleet);
        });
    });
}
