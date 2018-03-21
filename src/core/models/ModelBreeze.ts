/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelBreeze extends ShipModel {
        constructor() {
            super("breeze", "Breeze");
        }

        getDescription(): string {
            return "A swift piece of maneuvrability, able to go deep behind enemy lines, and come back without a scratch.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 300,
                    safety_distance: 100
                });
                engine.configureCooldown(2, 1);

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(2)],
                    power: 2,
                    range: 200,
                }, "gatlinggun");
                gatling.configureCooldown(3, 1);

                let shield_steal = new TriggerAction("Shield Steal", {
                    effects: [new ValueTransferEffect("shield", -1)],
                    power: 1,
                    blast: 300
                }, "shieldtransfer");
                shield_steal.configureCooldown(1, 2);

                return [
                    {
                        code: "Breeze Base",
                        effects: [
                            new AttributeEffect("precision", 3),
                            new AttributeEffect("maneuvrability", 12),
                            new AttributeEffect("hull_capacity", 1),
                            new AttributeEffect("shield_capacity", 2),
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
