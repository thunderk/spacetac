/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelFlea extends ShipModel {
        constructor() {
            super("flea", "Flea");
        }

        getDescription(): string {
            return "An agile but weak ship, specialized in disruptive technologies.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 420,
                });

                let depleter = new TriggerAction("Power Depleter", {
                    effects: [new StickyEffect(new AttributeLimitEffect("power_capacity", 3))],
                    power: 2,
                    range: 450,
                }, "powerdepleter");
                depleter.configureCooldown(1, 1);

                let gatling = new TriggerAction("Shield Basher", {
                    effects: [new DamageEffect(2, DamageEffectMode.SHIELD_ONLY, false)],
                    power: 3,
                    range: 300,
                }, "submunitionmissile");
                gatling.configureCooldown(2, 1);

                return [
                    {
                        code: "Flea Base",
                        effects: [
                            new AttributeEffect("initiative", 2),
                            new AttributeEffect("evasion", 1),
                            new AttributeEffect("hull_capacity", 1),
                            new AttributeEffect("shield_capacity", 2),
                            new AttributeEffect("power_capacity", 6),
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
