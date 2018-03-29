module TK.SpaceTac.Specs {
    testing("ShipModel", test => {
        test.case("picks random models from default collection", check => {
            check.patch(console, "error", null);
            check.patch(ShipModel, "getDefaultCollection", nnf([], iterator([
                [new ShipModel("a")],
                [],
                [new ShipModel("a"), new ShipModel("b")],
                [new ShipModel("a")],
            ])));

            check.equals(ShipModel.getRandomModel(), new ShipModel("a"), "pick from a one-item list");
            check.equals(ShipModel.getRandomModel(), new ShipModel(), "pick from an empty list");

            check.equals(sorted(ShipModel.getRandomModels(2), (a, b) => cmp(a.code, b.code)), [new ShipModel("a"), new ShipModel("b")], "sample from good-sized list");
            check.equals(ShipModel.getRandomModels(2), [new ShipModel("a"), new ShipModel("a")], "sample from too small list");
            check.equals(ShipModel.getRandomModels(2), [new ShipModel(), new ShipModel()], "sample from empty list");
        });

        test.case("makes upgrades available by level", check => {
            let model = new ShipModel();

            function verify(desc: string, level: number, specific: string[], available: string[], activated: string[], chosen: string[] = []) {
                check.in(`${desc} level ${level}`, check => {
                    check.equals(model.getLevelUpgrades(level).map(u => u.code), specific, "specific");
                    check.equals(model.getAvailableUpgrades(level).map(u => u.code), available, "available");
                    check.equals(model.getActivatedUpgrades(level, chosen).map(u => u.code), activated, "activated");
                });
            }

            verify("initial", 1, [], [], []);

            check.patch(model, "getLevelUpgrades", (level: number): ShipUpgrade[] => {
                if (level == 1) {
                    return [
                        { code: "l1" },
                    ];
                } else if (level == 2) {
                    return [
                        { code: "l2a" },
                        { code: "l2b" }
                    ];
                } else {
                    return [];
                }
            });

            verify("standard", 0, [], [], []);
            verify("standard", 1, ["l1"], ["l1"], ["l1"]);
            verify("standard", 2, ["l2a", "l2b"], ["l1", "l2a", "l2b"], ["l1"]);
            verify("standard", 3, [], ["l1", "l2a", "l2b"], ["l1"]);

            verify("with actives", 1, ["l1"], ["l1"], ["l1"], ["l2a", "l666"]);
            verify("with actives", 2, ["l2a", "l2b"], ["l1", "l2a", "l2b"], ["l1", "l2a"], ["l2a", "l666"]);
            verify("with actives", 3, [], ["l1", "l2a", "l2b"], ["l1", "l2a"], ["l2a", "l666"]);
        });
    });
}
