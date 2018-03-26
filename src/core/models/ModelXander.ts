/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelXander extends ShipModel {
        constructor() {
            super("xander", "Xander");
        }

        getDescription(): string {
            return "A ship with impressive survival capabilities.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 150,
                });

                let laser = new TriggerAction("Prokhorov Laser", {
                    effects: [new DamageEffect(2, DamageEffectMode.SHIELD_THEN_HULL)],
                    power: 3,
                    range: 250, angle: 80,
                });

                let hull = new TriggerAction("Hull Shedding", {
                    effects: [new ValueEffect("hull", 2)],
                    power: 1
                }, "fractalhull");
                hull.configureCooldown(1, 4);

                let disengage = new MoveAction("Disengage", {
                    distance_per_power: 1000,
                    safety_distance: 200,
                }, "ionthruster");
                disengage.configureCooldown(1, 3);

                return [
                    {
                        code: "Xander Base",
                        effects: [
                            new AttributeEffect("initiative", 1),
                            new AttributeEffect("evasion", 1),
                            new AttributeEffect("hull_capacity", 2),
                            new AttributeEffect("shield_capacity", 1),
                            new AttributeEffect("power_capacity", 7),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Prokhorov Laser",
                        actions: [laser]
                    },
                    {
                        code: "Fractal Hull",
                        actions: [hull]
                    },
                    {
                        code: "Disengage",
                        actions: [disengage]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
