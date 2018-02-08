/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelFalcon extends BaseModel {
        constructor() {
            super("falcon", "Falcon");
        }

        getDescription(): string {
            return "A ship with an efficient targetting system, allowing to hit multiple foes.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 130,
                });

                let missile = new TriggerAction("SubMunition Missile", {
                    effects: [new DamageEffect(10, 10)],
                    power: 2,
                    range: 250, blast: 150,
                }, "submunitionmissile");
                missile.configureCooldown(2, 2);

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(10, 10)],
                    power: 1,
                    range: 350,
                }, "gatlinggun");
                gatling.configureCooldown(3, 2);

                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 8),
                            new AttributeEffect("maneuvrability", 4),
                            new AttributeEffect("hull_capacity", 50),
                            new AttributeEffect("shield_capacity", 50),
                            new AttributeEffect("power_capacity", 9),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Submunition Missile",
                        actions: [missile]
                    },
                    {
                        code: "Gatling Gun",
                        actions: [gatling]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
