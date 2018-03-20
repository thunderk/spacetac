/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelCreeper extends ShipModel {
        constructor() {
            super("creeper", "Creeper");
        }

        getDescription(): string {
            return "A fast ship, with low firepower but extensive support modules.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 220,
                });

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(20)],
                    power: 2,
                    range: 200,
                }, "gatlinggun");
                gatling.configureCooldown(1, 1);

                let repulse = new TriggerAction("Repulser", {
                    effects: [new RepelEffect(150)],
                    power: 2,
                    blast: 350,
                }, "gravitshield");
                repulse.configureCooldown(1, 1);

                let repairdrone = new DeployDroneAction("Repair Drone", { power: 3 }, {
                    deploy_distance: 300,
                    drone_radius: 150,
                    drone_effects: [
                        new ValueEffect("hull", undefined, undefined, undefined, 30)
                    ]
                }, "repairdrone");

                return [
                    {
                        code: "Creeper Base",
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
                        code: "Repulser",
                        actions: [repulse]
                    },
                    {
                        code: "Repair Drone",
                        actions: [repairdrone]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
