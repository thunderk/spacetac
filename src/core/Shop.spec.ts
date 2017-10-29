module TK.SpaceTac.Specs {
    testing("Shop", test => {
        test.case("generates a stock", check => {
            let shop = new Shop();
            check.equals((<any>shop).stock.length, 0);
            check.greater(shop.getStock().length, 20);
        });

        test.case("buys and sells items", check => {
            let equ1 = new Equipment(SlotType.Shield, "shield");
            equ1.price = 50;
            let equ2 = new Equipment(SlotType.Hull, "hull");
            equ2.price = 150;
            let shop = new Shop(1, [equ1, equ2], 0);
            let fleet = new Fleet();
            fleet.credits = 1000;
            check.patch(shop, "getPrice", () => 800);

            let result = shop.sellToFleet(equ1, fleet);
            check.equals(result, true);
            check.equals(shop.getStock(), [equ2]);
            check.equals(fleet.credits, 200);
            result = shop.sellToFleet(equ2, fleet);
            check.equals(result, false);
            check.equals(shop.getStock(), [equ2]);
            check.equals(fleet.credits, 200);

            result = shop.buyFromFleet(equ1, fleet);
            check.equals(result, true);
            check.equals(shop.getStock(), [equ1, equ2]);
            check.equals(fleet.credits, 1000);
        });

        test.case("generates secondary missions", check => {
            let universe = new Universe();
            universe.generate(4);
            let start = universe.getStartLocation();

            let shop = new Shop();
            check.equals((<any>shop).missions.length, 0);

            let result = shop.getMissions(start, 4);
            check.equals(result.length, 4);
            check.equals((<any>shop).missions.length, 4);

            let oresult = shop.getMissions(start, 4);
            check.equals(oresult, result);

            result.forEach(mission => {
                check.equals(mission.main, false);
            });
        });

        test.case("assigns missions to a fleet", check => {
            let shop = new Shop();
            let player = new Player();
            let mission = new Mission(new Universe());
            (<any>shop).missions = [mission];

            check.equals(shop.getMissions(new StarLocation(), 1), [mission]);
            check.equals(player.missions.secondary, []);

            shop.acceptMission(mission, player);

            check.equals((<any>shop).missions, []);
            check.equals(player.missions.secondary, [mission]);
            check.same(mission.fleet, player.fleet);
        });
    });
}
