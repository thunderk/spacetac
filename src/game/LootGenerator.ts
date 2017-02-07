module TS.SpaceTac.Game {
    // Equipment generator from loot templates
    export class LootGenerator {
        // List of available templates
        templates: LootTemplate[];

        // Random generator that will be used
        random: RandomGenerator;

        // Construct a basic loot generator
        //  The list of templates will be automatically populated
        constructor(random: RandomGenerator = new RandomGenerator(), populate: boolean = true) {
            this.templates = [];
            this.random = random;

            if (populate) {
                this.populate();
            }
        }

        // Fill the list of templates
        populate(): void {
            var templates: LootTemplate[] = [];
            for (var template_name in TS.SpaceTac.Game.Equipments) {
                if (template_name && template_name.indexOf("Abstract") != 0) {
                    var template_class = TS.SpaceTac.Game.Equipments[template_name];
                    var template: LootTemplate = new template_class();
                    templates.push(template);
                }
            }
            this.templates = templates;
        }

        // Generate a random equipment
        //  If slot is specified, it will generate an equipment for this slot type specifically
        //  If level is specified, it will generate an equipment with level requirement inside this range
        //  If no equipment could be generated from available templates, null is returned
        generate(level: IntegerRange = null, slot: SlotType = null): Equipment {
            // Generate equipments matching conditions, with each template
            var equipments: Equipment[] = [];
            this.templates.forEach((template: LootTemplate) => {
                if (slot !== null && slot !== template.slot) {
                    return;
                }

                var equipment: Equipment;
                if (level === null) {
                    equipment = template.generate(this.random);
                } else {
                    equipment = template.generateInLevelRange(level, this.random);
                }

                if (equipment !== null) {
                    equipments.push(equipment);
                }
            });

            // No equipment could be generated with given conditions
            if (equipments.length === 0) {
                return null;
            }

            // Pick a random equipment
            return this.random.choice(equipments);
        }
    }
}
