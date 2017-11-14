/// <reference path="../../common/Testing.ts" />

module TK.SpaceTac.Specs {
    testing("ShipAttributeDiff", test => {
        test.case("applies and reverts", check => {
            let battle = new Battle();
            let ship = battle.fleets[0].addShip();

            TestTools.diffChain(check, battle, [
                new ShipAttributeDiff(ship, "precision", { cumulative: 5 }, {}),
                new ShipAttributeDiff(ship, "maneuvrability", { cumulative: 8 }, {}),
                new ShipAttributeDiff(ship, "precision", { cumulative: 2 }, {}),
                new ShipAttributeDiff(ship, "precision", { cumulative: 4 }, { cumulative: 5 }),
                new ShipAttributeDiff(ship, "maneuvrability", { multiplier: 50 }, {}),
                new ShipAttributeDiff(ship, "maneuvrability", { limit: 2 }, {}),
                new ShipAttributeDiff(ship, "maneuvrability", {}, { multiplier: 50, limit: 2 }),
            ], [
                    check => {
                        check.equals(ship.getAttribute("precision"), 0, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 0, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 5, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 0, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 5, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 8, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 7, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 8, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 6, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 8, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 6, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 12, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 6, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 2, "maneuvrability value");
                    },
                    check => {
                        check.equals(ship.getAttribute("precision"), 6, "precision value");
                        check.equals(ship.getAttribute("maneuvrability"), 8, "maneuvrability value");
                    },
                ])
        });
    });
}