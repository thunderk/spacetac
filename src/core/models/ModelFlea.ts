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
                let engine = new MoveAction("Main Engine", {
                    distance_per_power: 420,
                });

                let depleter = new TriggerAction("Power Depleter", {
                    effects: [new StickyEffect(new AttributeLimitEffect("power_capacity", 3))],
                    power: 2,
                    range: 450,
                }, "powerdepleter");
                depleter.configureCooldown(1, 1);

                let shield_basher = new TriggerAction("Shield Basher", {
                    effects: [new DamageEffect(2, DamageEffectMode.SHIELD_ONLY, false)],
                    power: 3,
                    range: 300,
                }, "shieldbash");
                shield_basher.configureCooldown(2, 1);

                let engine_hijack = new TriggerAction("Engine Hijacking", {
                    effects: [new StickyEffect(new PinnedEffect(), 2)],
                    power: 2,
                    range: 400,
                }, "pin");
                engine_hijack.configureCooldown(1, 2);

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
                        code: engine.name,
                        actions: [engine]
                    },
                    {
                        code: depleter.name,
                        actions: [depleter]
                    },
                    {
                        code: shield_basher.name,
                        actions: [shield_basher]
                    },
                    {
                        code: engine_hijack.name,
                        actions: [engine_hijack]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
