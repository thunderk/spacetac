/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelBreeze extends BaseModel {
        constructor() {
            super("breeze", "Breeze");
        }

        getDescription(): string {
            return "A swift piece of maneuvrability, able to go deep behind enemy lines, and come back without a scratch.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 300,
                    safety_distance: 100,
                    maneuvrability_factor: 60
                });
                engine.configureCooldown(2, 1);

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(35, 20)],
                    power: 2,
                    range: 200,
                    aim: 30, evasion: 10, luck: 20
                }, "gatlinggun");
                gatling.configureCooldown(3, 1);

                let shield_steal = new TriggerAction("Shield Steal", {
                    effects: [new ValueTransferEffect("shield", -40)],
                    power: 1,
                    blast: 300
                }, "shieldtransfer");
                shield_steal.configureCooldown(1, 2);

                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 3),
                            new AttributeEffect("maneuvrability", 12),
                            new AttributeEffect("hull_capacity", 30),
                            new AttributeEffect("shield_capacity", 50),
                            new AttributeEffect("power_capacity", 7),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Gatling Gun",
                        actions: [gatling]
                    },
                    {
                        code: "Shield Steal",
                        actions: [shield_steal]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
