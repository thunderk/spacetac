module TS.SpaceTac.Game.Specs {
    describe("EffectTemplate", () => {
        it("interpolates between weak and strong effects", () => {
            var base_effect = new AttributeEffect("hull_capacity", 6);
            var template = new EffectTemplate(base_effect);

            template.addModifier("value", new Range(2, 8));

            var effect = <AttributeEffect>template.generateFixed(0.0);
            expect(effect.code).toEqual("attr");
            expect(effect.value).toEqual(2);

            effect = <AttributeEffect>template.generateFixed(1.0);
            expect(effect.code).toEqual("attr");
            expect(effect.value).toEqual(8);

            effect = <AttributeEffect>template.generateFixed(0.5);
            expect(effect.code).toEqual("attr");
            expect(effect.value).toEqual(5);
        });
    });
}
