module TK.SpaceTac.Specs {
    testing("ShipGenerator", test => {
        test.case("can use ship model", check => {
            var gen = new ShipGenerator();
            var model = new BaseModel("test", "Test");
            var ship = gen.generate(3, model, false);
            check.same(ship.model, model);
            check.same(ship.level.get(), 3);
        });
    });
}
