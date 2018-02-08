/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelAvenger extends BaseModel {
        constructor() {
            super("avenger", "Avenger");
        }

        getDescription(): string {
            return "A heavy ship, dedicated to firing high precision charged shots across great distances.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            let engine = new MoveAction("Engine", {
                distance_per_power: 50,
                safety_distance: 250,
            });
            engine.configureCooldown(1, 1);

            // TODO Weapons should be less efficient in short range

            let charged_shot = new TriggerAction("Charged Shot", {
                effects: [new DamageEffect(30, 20)],
                power: 3,
                range: 900,
                aim: 90, evasion: 40, luck: 20
            }, "gatlinggun");
            charged_shot.configureCooldown(2, 2);

            let long_range_missile = new TriggerAction("Long Range Missile", {
                effects: [new DamageEffect(15, 25)],
                power: 4,
                range: 700, blast: 120,
                aim: 70, evasion: 20, luck: 50
            }, "submunitionmissile");
            long_range_missile.configureCooldown(1, 2);

            let shield_booster = new TriggerAction("Shield Booster", {
                effects: [
                    new StickyEffect(new AttributeEffect("shield_capacity", 50), 2),
                    new ValueEffect("shield", 70),
                ],
                power: 2
            }, "forcefield");
            shield_booster.configureCooldown(1, 4);

            if (level == 1) {
                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 8),
                            new AttributeEffect("maneuvrability", 0),
                            new AttributeEffect("hull_capacity", 80),
                            new AttributeEffect("shield_capacity", 20),
                            new AttributeEffect("power_capacity", 8),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Charged Shot",
                        actions: [charged_shot]
                    },
                    {
                        code: "Long Range Missile",
                        actions: [long_range_missile]
                    },
                ];
            } else if (level == 2) {
                return [
                    {
                        code: "Laser Targetting",
                        cost: 1,
                        effects: [new AttributeEffect("precision", 2)]
                    },
                    {
                        code: "Basic Countermeasures",
                        cost: 1,
                        effects: [new AttributeEffect("maneuvrability", 2)]
                    },
                    {
                        code: "Targetting Assist",
                        cost: 3,
                        actions: [new ToggleAction("Targetting Assist", {
                            power: 3,
                            radius: 300,
                            effects: [new AttributeEffect("precision", 2)]
                        }, "precisionboost")]
                    },
                ];
            } else if (level == 3) {
                return [
                    {
                        code: "Gyroscopic Stabilizers",
                        cost: 1,
                        effects: [
                            new AttributeEffect("precision", 3),
                            new AttributeEffect("maneuvrability", -2)
                        ]
                    },
                    {
                        code: "Shield Booster",
                        cost: 3,
                        actions: [shield_booster]
                    },
                    {
                        code: "Hard Coated Hull",
                        cost: 2,
                        effects: [new AttributeEffect("hull_capacity", 10)]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
