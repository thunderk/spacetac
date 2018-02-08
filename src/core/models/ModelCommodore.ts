/// <reference path="BaseModel.ts" />

module TK.SpaceTac {
    export class ModelCommodore extends BaseModel {
        constructor() {
            super("commodore", "Commodore");
        }

        getDescription(): string {
            return "A devil whirlwind, very dangerous to surround.";
        }

        getLevelUpgrades(level: number): ModelUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 150,
                });

                let laser = new TriggerAction("Wingspan Laser", {
                    effects: [new DamageEffect(25, 25)],
                    power: 4,
                    range: 250, angle: 140,
                    aim: 30, evasion: 45, luck: 30,
                }, "prokhorovlaser");
                laser.configureCooldown(3, 1);

                let power_steal = new TriggerAction("Power Thief", {
                    effects: [new ValueTransferEffect("power", -1)],
                    power: 1,
                    blast: 250
                }, "powerdepleter");
                power_steal.configureCooldown(1, 1);

                return [
                    {
                        code: "Base Attributes",
                        effects: [
                            new AttributeEffect("precision", 5),
                            new AttributeEffect("maneuvrability", 6),
                            new AttributeEffect("hull_capacity", 70),
                            new AttributeEffect("shield_capacity", 40),
                            new AttributeEffect("power_capacity", 8),
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
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
