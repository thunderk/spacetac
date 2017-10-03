/// <reference path="../LootTemplate.ts"/>

module TK.SpaceTac.Equipments {
    export class IronHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Iron Hull", "Protective hull, based on layered iron alloys");

            this.setSkillsRequirements({ "skill_materials": leveled(1, 1) });
            this.addAttributeEffect("hull_capacity", leveled(100));
        }
    }

    export class HardCoatedHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Hard Coated Hull", "Hardened hull, with titanium coating", 124);

            this.setSkillsRequirements({ "skill_materials": leveled(2, 3) });
            this.addAttributeEffect("hull_capacity", leveled(130));
            this.addAttributeEffect("maneuvrability", leveled(-2, -1));
        }
    }

    export class FractalHull extends LootTemplate {
        constructor() {
            super(SlotType.Hull, "Fractal Hull", "Hull composed of recursively bound quantum patches", 250);

            this.setSkillsRequirements({ "skill_quantum": leveled(1, 2) });
            this.addAttributeEffect("hull_capacity", leveled(60));
            this.addAttributeEffect("precision", leveled(2));
            this.addTriggerAction(leveled(1, 0.1), [
                new EffectTemplate(new ValueEffect("hull"), { value: leveled(60) })
            ])
            this.setCooldown(irepeat(1), irepeat(4));
        }
    }
}
