/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelCommodore extends ShipModel {
        constructor() {
            super("commodore", "Commodore");
        }

        getDescription(): string {
            return "A devil whirlwind, very dangerous to surround.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 120,
                });

                let laser = new TriggerAction("Wingspan Laser", {
                    effects: [new DamageEffect(3, DamageEffectMode.SHIELD_THEN_HULL)],
                    power: 4,
                    range: 250, angle: 140,
                }, "prokhorovlaser");
                laser.configureCooldown(3, 1);

                let interceptors = new VigilanceAction("Interceptors Field", { radius: 200, power: 3, filter: ActionTargettingFilter.ENEMIES }, {
                    intruder_count: 1,
                    intruder_effects: [new DamageEffect(4, DamageEffectMode.SHIELD_THEN_HULL)]
                }, "interceptors");

                let power_steal = new TriggerAction("Power Thief", {
                    effects: [new ValueTransferEffect("power", -1)],
                    power: 1,
                    blast: 250
                }, "powerdepleter");
                power_steal.configureCooldown(1, 1);

                return [
                    {
                        code: "Commodore Base",
                        effects: [
                            new AttributeEffect("initiative", 2),
                            new AttributeEffect("hull_capacity", 2),
                            new AttributeEffect("shield_capacity", 3),
                            new AttributeEffect("power_capacity", 5),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Wingspan Laser",
                        actions: [laser]
                    },
                    {
                        code: "Power Thief",
                        actions: [power_steal]
                    },
                    {
                        code: "Interceptors Field",
                        actions: [interceptors]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
