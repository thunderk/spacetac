/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelTrapper extends BaseModel {
        constructor() {
            super("trapper", "Trapper");
        }

        getDescription(): string {
            return "A mostly defensive ship, used to protect allies from enemy fire.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 220,
                });
                engine.configureCooldown(1, 1);

                let protector = new ToggleAction("Damage Protector", {
                    power: 4,
                    radius: 300,
                    effects: [new DamageModifierEffect(-35)]
                });

                let depleter = new TriggerAction("Power Depleter", {
                    effects: [new StickyEffect(new AttributeLimitEffect("power_capacity", 3))],
                    power: 2,
                    range: 200,
                }, "powerdepleter");
                depleter.configureCooldown(1, 1);

                let missile = new TriggerAction("Defense Missiles", {
                    effects: [new DamageEffect(25, 30)],
                    power: 3,
                    range: 200, blast: 200,
                }, "submunitionmissile");

                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 3),
                            new AttributeEffect("maneuvrability", 2),
                            new AttributeEffect("hull_capacity", 40),
                            new AttributeEffect("shield_capacity", 70),
                            new AttributeEffect("power_capacity", 8),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Damage Protector",
                        actions: [protector]
                    },
                    {
                        code: "Power Depleter",
                        actions: [depleter]
                    },
                    {
                        code: "SubMunition Missile",
                        actions: [missile]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
