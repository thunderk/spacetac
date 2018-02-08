/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelRhino extends BaseModel {
        constructor() {
            super("rhino", "Rhino");
        }

        getDescription(): string {
            return "A sturdy ship, able to sustain massive damage.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 140,
                });

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(30, 20)],
                    power: 3,
                    range: 400,
                }, "gatlinggun");
                gatling.configureCooldown(2, 2);

                let laser = new TriggerAction("Prokhorov Laser", {
                    effects: [new DamageEffect(25, 25)],
                    power: 4,
                    range: 250, angle: 60,
                    aim: 30, evasion: 45, luck: 30,
                }, "prokhorovlaser");

                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 4),
                            new AttributeEffect("maneuvrability", 3),
                            new AttributeEffect("hull_capacity", 100),
                            new AttributeEffect("shield_capacity", 20),
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
