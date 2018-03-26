/// <reference path="../../common/Testing.ts" />

module TK.SpaceTac.Specs {
    testing("ShipAttributeDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            TestTools.diffChain(check, battle, [
                new ShipAttributeDiff(ship, "power_capacity", { cumulative: 5 }, {}),
                new ShipAttributeDiff(ship, "evasion", { cumulative: 8 }, {}),
                new ShipAttributeDiff(ship, "power_capacity", { cumulative: 2 }, {}),
                new ShipAttributeDiff(ship, "power_capacity", { cumulative: 4 }, { cumulative: 5 }),
                new ShipAttributeDiff(ship, "evasion", { multiplier: 50 }, {}),
                new ShipAttributeDiff(ship, "evasion", { limit: 2 }, {}),
                new ShipAttributeDiff(ship, "evasion", {}, { multiplier: 50, limit: 2 }),
            ], [
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 0, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 0, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 5, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 0, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 5, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 8, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 7, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 8, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 6, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 8, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 6, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 12, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 6, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 2, "evasion value");
                    },
                    check => {
                        check.equals(ship.getAttribute("power_capacity"), 6, "power capacity value");
                        check.equals(ship.getAttribute("evasion"), 8, "evasion value");
                    },
                ])
        });
    });
}