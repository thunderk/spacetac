/// <reference path="ShipModel.ts" />

module TK.SpaceTac {
    export class ModelTomahawk extends ShipModel {
        constructor() {
            super("tomahawk", "Tomahawk");
        }

        getDescription(): string {
            return "A ship compensating its somewhat weak equipments with high power and usability.";
        }

        getLevelUpgrades(level: number): ShipUpgrade[] {
            if (level == 1) {
                let engine = new MoveAction("Engine", {
                    distance_per_power: 120,
                });

                let gatling1 = new TriggerAction("Primary Gatling", {
                    effects: [new DamageEffect(3)],
                    power: 2, range: 400
                }, "gatlinggun");
                gatling1.configureCooldown(1, 2);

                let gatling2 = new TriggerAction("Secondary Gatling", {
                    effects: [new DamageEffect(2)],
                    power: 1, range: 200
                }, "gatlinggun");
                gatling2.configureCooldown(1, 2);

                let missile = new TriggerAction("Diffuse Missiles", {
                    effects: [new DamageEffect(2)],
                    power: 2,
                    range: 200, blast: 100,
                }, "submunitionmissile");
                missile.configureCooldown(1, 2);

                let cooler = new TriggerAction("Circuits Cooler", {
                    effects: [new CooldownEffect(1, 1)],
                    power: 1,
                }, "kelvingenerator");

                return [
                    {
                        code: "Tomahawk Base",
                        effects: [
                            new AttributeEffect("initiative", 2),
                            new AttributeEffect("hull_capacity", 2),
                            new AttributeEffect("shield_capacity", 1),
                            new AttributeEffect("power_capacity", 5),
                        ]
                    },
                    {
                        code: "Main Engine",
                        actions: [engine]
                    },
                    {
                        code: "Primary Gatling",
                        actions: [gatling1]
                    },
                    {
                        code: "Secondary Gatling",
                        actions: [gatling2]
                    },
                    {
                        code: "SubMunition Missile",
                        actions: [missile]
                    },
                    {
                        code: "Cooler",
                        actions: [cooler]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
