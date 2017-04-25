module TS.SpaceTac {
    /**
     * A shop is a place to buy/sell equipments
     */
    export class Shop {
        // Equipment in stock
        stock: Equipment[] = [];

        /**
         * Generate a random stock
         * 
         * *level* is the preferential level, but equipment around it may be generated
         */
        generateStock(items: number, level: number, random = RandomGenerator.global) {
            let generator = new LootGenerator(random);

            this.stock = nna(range(items).map(() => {
                let equlevel = random.weighted(range(level + 3).map(i => i + 1).map(i => (i > level) ? 1 : i)) + 1;
                let quality = random.weighted([1, 7, 2]);
                return generator.generate(equlevel, quality);
            }));

            this.sortStock();
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
    }
}