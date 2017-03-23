module TS.SpaceTac.Specs {
    describe("Shop", () => {
        it("generates a stock", () => {
            let shop = new Shop();
            expect(shop.stock.length).toBe(0);

            shop.generateStock(8);
            expect(shop.stock.length).toBe(8);
        });

        it("buys and sells items", function () {
            let shop = new Shop();
            let equ1 = new Equipment(SlotType.Shield, "shield");
            let equ2 = new Equipment(SlotType.Hull, "hull");
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
            expect(shop.stock).toEqual([equ2, equ1]);
            expect(fleet.credits).toEqual(1000);
        });
    });
}
