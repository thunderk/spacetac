module TK.SpaceTac.Specs {
    testing("ShipModel", test => {
        test.case("picks random models from default collection", check => {
            spyOn(console, "error").and.stub();
            spyOn(ShipModel, "getDefaultCollection").and.returnValues(
                [new ShipModel("a")],
                [],
                [new ShipModel("a"), new ShipModel("b")],
                [new ShipModel("a")],
                [],
            );

            check.equals(ShipModel.getRandomModel(), new ShipModel("a"), "pick from a one-item list");
            check.equals(ShipModel.getRandomModel(), new ShipModel(), "pick from an empty list");

            check.equals(sorted(ShipModel.getRandomModels(2), (a, b) => cmp(a.code, b.code)), [new ShipModel("a"), new ShipModel("b")], "sample from good-sized list");
            check.equals(ShipModel.getRandomModels(2), [new ShipModel("a"), new ShipModel("a")], "sample from too small list");
            check.equals(ShipModel.getRandomModels(2), [new ShipModel(), new ShipModel()], "sample from empty list");
        });
    });
}
