module SpaceTac.Game.Specs {
    "use strict";

    describe("EffectTemplate", () => {
        it("interpolates between weak and strong effects", () => {
            var base_effect = new AttributeMaxEffect(AttributeCode.Hull, 6);
            var template = new EffectTemplate(base_effect);

            template.addModifier("value", new Range(2, 8));

            var effect = <AttributeMaxEffect>template.generateFixed(0.0);
            expect(effect.code).toEqual("attrmax");
            expect(effect.value).toEqual(2);

            effect = <AttributeMaxEffect>template.generateFixed(1.0);
            expect(effect.code).toEqual("attrmax");
            expect(effect.value).toEqual(8);

            effect = <AttributeMaxEffect>template.generateFixed(0.5);
            expect(effect.code).toEqual("attrmax");
            expect(effect.value).toEqual(5);
        });
    });
}
