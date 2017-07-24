/// <reference path="CharacterLootSlot.ts" />

module TS.SpaceTac.UI {
    /**
     * Display a shop slot
     */
    export class CharacterShopSlot extends CharacterLootSlot {
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): boolean {
            let shop = this.sheet.shop;
            if (shop && !contains(shop.getStock(), equipment.item)) {
                if (test) {
                    return true;
                } else {
                    return shop.buyFromFleet(equipment.item, this.sheet.fleet);
                }
            } else {
                return false;
            }
        }

        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): boolean {
            let shop = this.sheet.shop;
            if (shop && contains(shop.getStock(), equipment.item)) {
                if (destination) {
                    let price = shop.getPrice(equipment.item);
                    if (test) {
                        return price <= this.sheet.fleet.credits;
                    } else {
                        return shop.sellToFleet(equipment.item, this.sheet.fleet);
                    }
                } else {
                    return test;
                }
            } else {
                return false;
            }
        }
    }
}
