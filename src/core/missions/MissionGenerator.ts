module TK.SpaceTac {
    const POOL_SHIP_NAMES = [
        "Zert",
        "Ob'tec",
        "Paayk",
        "Fen_amr",
        "TempZst",
        "croNt",
        "Appn",
        "Vertix",
        "Opan-vel",
        "Yz-aol",
        "Arkant",
        "PNX",
    ]

    /**
     * Random generator of secondary missions that can be taken from 
     */
    export class MissionGenerator {
        universe: Universe
        around: StarLocation
        random: RandomGenerator
        equipment_generator: LootGenerator

        constructor(universe: Universe, around: StarLocation, random = RandomGenerator.global) {
            this.universe = universe;
            this.around = around;
            this.random = random;
            this.equipment_generator = new LootGenerator(this.random);
        }

        /**
         * Generate a single mission
         */
        generate(): Mission {
            let generators = [
                bound(this, "generateEscort"),
                bound(this, "generateCleanLocation"),
            ];

            let generator = this.random.choice(generators);
            let result = generator();
            if (result.value) {
                result.reward = this.generateReward(result.value);
            }
            return result;
        }

        /**
         * Generate a new ship that may be used in a mission
         */
        generateShip(level: number) {
            let generator = new ShipGenerator(this.random);
            let result = generator.generate(level, null, true);
            result.name = `${this.random.choice(POOL_SHIP_NAMES)}-${this.random.randInt(10, 999)}`;
            return result;
        }

        /**
         * Try to generate an equipment of given value
         */
        tryGenerateEquipmentReward(value: number): Equipment | null {
            let minvalue = value * 0.8;
            let maxvalue = value * 1.2;
            let qualities = [EquipmentQuality.FINE, EquipmentQuality.PREMIUM, EquipmentQuality.LEGENDARY];

            let candidates: Equipment[] = [];
            for (let pass = 0; pass < 10; pass++) {
                let equipment: Equipment | null;
                let level = 1;
                do {
                    let quality = qualities[this.random.weighted([15, 12, 2])];
                    equipment = this.equipment_generator.generate(level, quality);
                    if (equipment && equipment.getPrice() >= minvalue && equipment.getPrice() <= maxvalue) {
                        candidates.push(equipment);
                    }
                    level += 1;
                } while (equipment && equipment.getPrice() < maxvalue * 1.5 && level < 20);
            }

            if (candidates.length > 0) {
                return this.random.choice(candidates);
            } else {
                return null;
            }
        }

        /**
         * Generate a reward
         */
        generateReward(value: number): MissionReward {
            if (this.random.bool()) {
                let equipment = this.tryGenerateEquipmentReward(value);
                if (equipment) {
                    return equipment;
                } else {
                    return value;
                }
            } else {
                return value;
            }
        }

        /**
         * Helper to set the difficulty of a mission
         */
        setDifficulty(mission: Mission, base_value: number, fight_level: number) {
            let level_diff = fight_level - this.around.star.level;
            let code = (level_diff > 0) ? MissionDifficulty.hard : (level_diff < 0 ? MissionDifficulty.easy : MissionDifficulty.normal);
            let value = fight_level * (base_value + base_value * 0.1 * clamp(level_diff, -5, 5));
            mission.setDifficulty(code, Math.round(value));
        }

        /**
         * Generate an escort mission
         */
        generateEscort(): Mission {
            let mission = new Mission(this.universe);

            let dest_star = this.random.choice(this.around.star.getNeighbors());
            let destination = this.random.choice(dest_star.locations);
            let ship = this.generateShip(dest_star.level);

            mission.title = `Escort a ship to a level ${dest_star.level} system`;
            this.setDifficulty(mission, 1000, dest_star.level);

            let conversation = new MissionPartConversation(mission, [ship]);
            conversation.addPiece(ship, this.random.choice([
                "I'm very grateful you accepted to escort me! These systems are not safe to travel anymore.",
                "Thank you for bringing me along, I'm afraid not to be up to the dangers ahead.",
                "Always a pleasure to travel with battle-ready companions, it is not a triviality these days!",
            ]));
            mission.addPart(conversation);

            mission.addPart(new MissionPartEscort(mission, destination, ship));

            conversation = new MissionPartConversation(mission, [ship]);
            conversation.addPiece(ship, this.random.choice([
                "Thank you! Have your reward, you deserved it.",
                "Never could have made it safely without your help, take this as a token of my gratitude.",
                "Thanks so much... May we meet again in the future. For now, please accept this small reward.",
            ]));
            mission.addPart(conversation);

            return mission;
        }

        /**
         * Generate a clean location mission
         */
        generateCleanLocation(): Mission {
            let mission = new Mission(this.universe);

            let dest_star = this.random.choice(this.around.star.getNeighbors().concat([this.around.star]));
            let here = (dest_star == this.around.star);
            let choices = dest_star.locations;
            if (here) {
                choices = choices.filter(loc => loc != this.around);
            }
            let destination = this.random.choice(choices);
            let ship = this.generateShip(1);

            mission.title = `Defeat a level ${destination.star.level} fleet in ${here ? "this" : "a nearby"} system`;
            this.setDifficulty(mission, here ? 300 : 500, dest_star.level);

            let conversation = new MissionPartConversation(mission, [ship]);
            conversation.addPiece(ship, this.random.choice([
                `We need you to clean a ${capitalize(StarLocationType[destination.type].toLowerCase())} for us. It is of vital importance.`,
                "It would be very kind of you to remove these pesky rogues from the location we pointed on your map. Have no mercy!",
                "One of those uninvited fleets is blocking a strategic point for our supplies. Send them back to hell.",
            ]));
            mission.addPart(conversation);

            mission.addPart(new MissionPartCleanLocation(mission, destination));

            mission.addPart(new MissionPartGoTo(mission, this.around, "Go back to collect your reward"));

            conversation = new MissionPartConversation(mission, [ship]);
            conversation.addPiece(ship, this.random.choice([
                "You really are efficient! Feel free to have a look at our other jobs, while we load your reward.",
                "We know it will be a temporary respite, but thank you nonetheless.",
                "A job well done, is a job well paid! Looking forward to working with you again.",
            ]));
            mission.addPart(conversation);

            return mission;
        }
    }
}
