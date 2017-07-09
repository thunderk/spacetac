module TS.SpaceTac {
    /**
     * A shop is a place to buy/sell equipments
     */
    export class Shop {
        // Average level of equipment
        private level: number

        // Approximative number of equipments
        private count: number

        // Equipment in stock
        private stock: Equipment[]

        // Random generator
        private random: RandomGenerator

        // Available missions
        private missions: Mission[] = []

        constructor(level = 1, stock: Equipment[] = [], count = 40) {
            this.level = level;
            this.stock = stock;
            this.count = count;
            this.random = new RandomGenerator();
        }

        /**
         * Get available stock to display
         */
        getStock() {
            if (this.stock.length < this.count * 0.5) {
                let count = this.random.randInt(Math.floor(this.count * 0.8), Math.ceil(this.count * 1.2));
                this.stock = this.stock.concat(this.generateStock(count - this.stock.length, this.level, this.random));
                this.sortStock();
            }

            return this.stock;
        }

        /**
         * Generate a random stock
         * 
         * *level* is the preferential level, but equipment around it may be generated
         */
        private generateStock(items: number, level: number, random = RandomGenerator.global): Equipment[] {
            let generator = new LootGenerator(random);

            return nna(range(items).map(() => {
                let equlevel = random.weighted(range(level + 3).map(i => i + 1).map(i => (i > level) ? 1 : i)) + 1;
                let quality = random.weighted([1, 7, 2]);
                return generator.generate(equlevel, quality);
            }));
        }

        /**
         * Sort the stock by equipment level, then by value
         */
        sortStock() {
            this.stock.sort((a, b) => (a.level == b.level) ? cmp(a.getPrice(), b.getPrice()) : cmp(a.level, b.level));
        }

        /**
         * Get the buy/sell price for an equipment
         */
        getPrice(equipment: Equipment): number {
            return equipment.getPrice();
        }

        /**
         * A fleet buys an item
         * 
         * This does not put the item anywhere on the fleet, only remove the item from stock, and make the payment
         */
        sellToFleet(equipment: Equipment, fleet: Fleet) {
            let price = this.getPrice(equipment);
            if (price <= fleet.credits) {
                if (remove(this.stock, equipment)) {
                    fleet.credits -= price;
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        /**
         * A fleet sells an item
         * 
         * This does not check if the item is anywhere on the fleet, only add the item to the shop stock, and make the payment
         */
        buyFromFleet(equipment: Equipment, fleet: Fleet) {
            let price = this.getPrice(equipment);
            if (add(this.stock, equipment)) {
                this.sortStock();
                fleet.credits += price;
                return true;
            } else {
                return false;
            }
        }

        /**
         * Get a list of available secondary missions
         */
        getMissions(around: StarLocation, max_count = 3): Mission[] {
            while (this.missions.length < max_count) {
                let generator = new MissionGenerator(around.star.universe, around.star.level, around, this.random);
                let mission = generator.generate();
                this.missions.push(mission);
            }

            return this.missions;
        }

        /**
         * Assign a mission to a fleet
         * 
         * Returns true on success
         */
        acceptMission(mission: Mission, player: Player): boolean {
            if (contains(this.missions, mission)) {
                if (player.missions.addSecondary(mission, player.fleet)) {
                    remove(this.missions, mission);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }
}