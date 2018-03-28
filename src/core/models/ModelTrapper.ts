/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelTrapper extends ShipModel {
        constructor() {
            super("trapper", "Trapper");
        }

        getDescription(): string {
            return "A mostly defensive ship, used to protect allies from enemy fire.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 220,
                });
                engine.configureCooldown(1, 1);

                let protector = new ToggleAction("Damage Protector", {
                    power: 3,
                    radius: 300,
                    effects: [new AttributeEffect("evasion", 1)]
                });

                let depleter = new TriggerAction("Power Depleter", {
                    effects: [new StickyEffect(new AttributeLimitEffect("power_capacity", 3))],
                    power: 2,
                    range: 200,
                }, "powerdepleter");
                depleter.configureCooldown(1, 1);

                let missile = new TriggerAction("Defense Missiles", {
                    effects: [new DamageEffect(3, DamageEffectMode.SHIELD_THEN_HULL)],
                    power: 3,
                    range: 200, blast: 180,
                }, "submunitionmissile");

                return [
                    {
                        code: "Trapper Base",
                        effects: [
                            new AttributeEffect("evasion", 1),
                            new AttributeEffect("hull_capacity", 1),
                            new AttributeEffect("shield_capacity", 2),
                            new AttributeEffect("power_capacity", 6),
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
