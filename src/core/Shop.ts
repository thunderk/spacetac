module TS.SpaceTac {
    /**
     * A shop is a place to buy/sell equipments
     */
    export class Shop {
        // Equipment in stock
        stock: Equipment[] = [];

        /**
         * Generate a random stock
         */
        generateStock(items: number) {
            // TODO other levels
            let generator = new LootGenerator();
            this.stock = nna(range(items).map(i => generator.generate(1)));

            this.sortStock();
        }

        /**
         * Sort the stock by equipment level, then by value
         */
        sortStock() {
            // TODO
        }

        /**
         * Get the buy/sell price for an equipment
         */
        getPrice(equipment: Equipment): number {
            // TODO
            return 100;
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
                fleet.credits += price;
                return true;
            } else {
                return false;
            }
        }
    }
}