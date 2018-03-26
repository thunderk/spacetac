/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelAvenger extends ShipModel {
        constructor() {
            super("avenger", "Avenger");
        }

        getDescription(): string {
            return "A heavy ship, dedicated to firing high precision charged shots across great distances.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            let engine = new MoveAction("Engine", {
                distance_per_power: 50,
                safety_distance: 250,
            });
            engine.configureCooldown(1, 1);

            // TODO Weapons should be less efficient in short range

            let charged_shot = new TriggerAction("Charged Shot", {
                effects: [new DamageEffect(3)],
                power: 4,
                range: 900,
            }, "gatlinggun");
            charged_shot.configureCooldown(2, 2);

            let long_range_missile = new TriggerAction("Long Range Missile", {
                effects: [new DamageEffect(2)],
                power: 4,
                range: 700, blast: 120,
            }, "submunitionmissile");
            long_range_missile.configureCooldown(1, 2);

            if (level == 1) {
                return [
                    {
                        code: "Avenger Base",
                        effects: [
                            new AttributeEffect("hull_capacity", 2),
                            new AttributeEffect("shield_capacity", 1),
                            new AttributeEffect("power_capacity", 8),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Charged Shot",
                        actions: [charged_shot]
                    },
                    {
                        code: "Long Range Missile",
                        actions: [long_range_missile]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
