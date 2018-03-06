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
                effects: [new DamageEffect(30, 20)],
                power: 3,
                range: 900,
                aim: 90, evasion: 40, luck: 20
            }, "gatlinggun");
            charged_shot.configureCooldown(2, 2);

            let long_range_missile = new TriggerAction("Long Range Missile", {
                effects: [new DamageEffect(15, 25)],
                power: 4,
                range: 700, blast: 120,
                aim: 70, evasion: 20, luck: 50
            }, "submunitionmissile");
            long_range_missile.configureCooldown(1, 2);

            if (level == 1) {
                return [
                    {
                        code: "Avenger Base",
                        effects: [
                            new AttributeEffect("precision", 8),
                            new AttributeEffect("maneuvrability", 0),
                            new AttributeEffect("hull_capacity", 80),
                            new AttributeEffect("shield_capacity", 20),
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
            } else if (level == 2) {
                return [
                    {
                        code: "Laser Targetting",
                        description: "Improved targetting, using fine-grained laser sensors",
                        cost: 1,
                        effects: [new AttributeEffect("precision", 2)],
                    },
                    {
                        code: "Basic Countermeasures",
                        description: "Chaffs and lures to divert enemy fire",
                        cost: 1,
                        effects: [new AttributeEffect("maneuvrability", 2)],
                    },
                    {
                        code: "Targetting Assist",
                        description: "Share your targetting subnetwork with nearby ships",
                        cost: 3,
                        actions: [new ToggleAction("Targetting Assist", {
                            power: 3,
                            radius: 300,
                            effects: [new AttributeEffect("precision", 2)]
                        }, "precisionboost")],
                    },
                ];
            } else if (level == 3) {
                let shield_booster = new TriggerAction("Shield Booster", {
                    effects: [
                        new StickyEffect(new AttributeEffect("shield_capacity", 50), 2),
                        new ValueEffect("shield", 70),
                    ],
                    power: 2
                }, "forcefield");
                shield_booster.configureCooldown(1, 4);

                return [
                    {
                        code: "Gyroscopic Stabilizers",
                        description: "Heavy mercury gyroscopes, used to stabilize the whole ship while firing",
                        cost: 1,
                        effects: [
                            new AttributeEffect("precision", 3),
                            new AttributeEffect("maneuvrability", -2)
                        ]
                    },
                    {
                        code: "Shield Booster",
                        description: "Temporary power surge directed toward the shield mainframe, to boost its output",
                        cost: 3,
                        actions: [shield_booster]
                    },
                    {
                        code: "Hard Coated Hull",
                        description: "Improved metal coating of outer hull layers, making them more damage resistant",
                        cost: 2,
                        effects: [new AttributeEffect("hull_capacity", 10)]
                    },
                ];
            } else {
                return this.getStandardUpgrades(level);
            }
        }
    }
}
