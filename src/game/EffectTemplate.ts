module SpaceTac.Game {
    // Modifier for a value of a BaseEffect subclass
    export class EffectTemplateModifier {
        // Value name
        name: string;

        // Range of values (similar to ranges in LootTemplate)
        range: Range;

        // Basic constructor
        constructor(name: string, range: Range) {
            this.name = name;
            this.range = range;
        }
    }

    // Template used to generate a BaseEffect
    export class EffectTemplate {
        // Basic instance of the effect
        effect: BaseEffect;

        // Effect value modifiers
        modifiers: EffectTemplateModifier[];

        // Basic constructor
        constructor(effect: BaseEffect) {
            this.effect = effect;
            this.modifiers = [];
        }

        // Add a value modifier for the effect
        addModifier(name: string, range: Range) {
            this.modifiers.push(new EffectTemplateModifier(name, range));
        }

        // Generate an effect with a given power
        generateFixed(power: number): BaseEffect {
            return this.effect.getModifiedCopy(this.modifiers, power);
        }
    }
}
