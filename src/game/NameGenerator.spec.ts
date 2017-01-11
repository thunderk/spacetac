module SpaceTac.Game.Specs {
    describe("NameGenerator", () => {
        it("generates unique names", () => {
            var random = new RandomGenerator(0.48, 0.9, 0.1);
            var gen = new NameGenerator(["a", "b", "c"], random);

            expect(gen.getName()).toEqual("b");
            expect(gen.getName()).toEqual("c");
            expect(gen.getName()).toEqual("a");
            expect(gen.getName()).toBeNull();
        });
    });
}
