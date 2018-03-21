/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelRhino extends ShipModel {
        constructor() {
            super("rhino", "Rhino");
        }

        getDescription(): string {
            return "A sturdy ship, able to sustain massive damage.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 140,
                });

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(2)],
                    power: 3,
                    range: 400,
                }, "gatlinggun");
                gatling.configureCooldown(2, 2);

                let laser = new TriggerAction("Prokhorov Laser", {
                    effects: [new DamageEffect(2)],
                    power: 4,
                    range: 250, angle: 60,
                }, "prokhorovlaser");

                return [
                    {
                        code: "Rhino Base",
                        effects: [
                            new AttributeEffect("precision", 4),
                            new AttributeEffect("maneuvrability", 3),
                            new AttributeEffect("hull_capacity", 3),
                            new AttributeEffect("shield_capacity", 1),
                            new AttributeEffect("power_capacity", 9),
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
                        code: "Prokhorov Laser",
                        actions: [laser]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
