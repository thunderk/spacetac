/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelFalcon extends ShipModel {
        constructor() {
            super("falcon", "Falcon");
        }

        getDescription(): string {
            return "A ship with an efficient targetting system, allowing to hit multiple foes.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 130,
                });

                let missile = new TriggerAction("SubMunition Missile", {
                    effects: [new DamageEffect(3)],
                    power: 3,
                    range: 250, blast: 150,
                }, "submunitionmissile");
                missile.configureCooldown(2, 2);

                let gatling = new TriggerAction("Multi-head Gatling", {
                    effects: [new DamageEffect(2)],
                    power: 2,
                    range: 350, blast: 150,
                }, "gatlinggun");
                gatling.configureCooldown(3, 2);

                return [
                    {
                        code: "Falcon Base",
                        effects: [
                            new AttributeEffect("hull_capacity", 3),
                            new AttributeEffect("shield_capacity", 2),
                            new AttributeEffect("power_capacity", 4),
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
