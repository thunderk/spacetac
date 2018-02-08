/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelFlea extends BaseModel {
        constructor() {
            super("flea", "Flea");
        }

        getDescription(): string {
            return "An agile but weak ship, specialized in disruptive technologies.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 400,
                });

                let depleter = new TriggerAction("Power Depleter", {
                    effects: [new StickyEffect(new AttributeLimitEffect("power_capacity", 3))],
                    power: 2,
                    range: 450,
                }, "powerdepleter");
                depleter.configureCooldown(1, 1);

                let gatling = new TriggerAction("Gatling Gun", {
                    effects: [new DamageEffect(5, 30)],
                }, "gatlinggun");
                gatling.configureCooldown(2, 1);

                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 0),
                            new AttributeEffect("maneuvrability", 15),
                            new AttributeEffect("hull_capacity", 25),
                            new AttributeEffect("shield_capacity", 45),
                            new AttributeEffect("power_capacity", 8),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Power Depleter",
                        actions: [depleter]
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
