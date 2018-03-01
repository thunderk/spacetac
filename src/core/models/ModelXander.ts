/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelXander extends BaseModel {
        constructor() {
            super("xander", "Xander");
        }

        getDescription(): string {
            return "A ship with impressive survival capabilities.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 150,
                });

                let laser = new TriggerAction("Prokhorov Laser", {
                    effects: [new DamageEffect(20, 40)],
                    power: 3,
                    range: 250, angle: 80,
                    aim: 30, evasion: 45, luck: 30,
                });

                let hull = new TriggerAction("Hull Shedding", {
                    effects: [new ValueEffect("hull", 120)],
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
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 8),
                            new AttributeEffect("maneuvrability", 5),
                            new AttributeEffect("hull_capacity", 80),
                            new AttributeEffect("shield_capacity", 15),
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
