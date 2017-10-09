module TK.SpaceTac.Specs {
    describe("ShipModel", () => {
        it("picks random models from default collection", function () {
            spyOn(console, "error").and.stub();
            spyOn(ShipModel, "getDefaultCollection").and.returnValues(
                [new ShipModel("a")],
                [],
                [new ShipModel("a"), new ShipModel("b")],
                [new ShipModel("a")],
                [],
            );

            expect(ShipModel.getRandomModel()).toEqual(new ShipModel("a"), "pick from a one-item list");
            expect(ShipModel.getRandomModel()).toEqual(new ShipModel(), "pick from an empty list");

            expect(sorted(ShipModel.getRandomModels(2), (a, b) => cmp(a.code, b.code))).toEqual([new ShipModel("a"), new ShipModel("b")], "sample from good-sized list");
            expect(ShipModel.getRandomModels(2)).toEqual([new ShipModel("a"), new ShipModel("a")], "sample from too small list");
            expect(ShipModel.getRandomModels(2)).toEqual([new ShipModel(), new ShipModel()], "sample from empty list");
        });
    });
}
