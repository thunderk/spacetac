/// <reference path="CharacterLootSlot.ts" />

module TK.SpaceTac.UI {
    /**
     * Display a shop slot
     */
    export class CharacterShopSlot extends CharacterLootSlot {
        addEquipment(equipment: CharacterEquipment, source: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let shop = this.sheet.shop;
            if (shop && !contains(shop.getStock(), equipment.item)) {
                let price = shop.getPrice(equipment.item);
                let info = `sell for ${price} zotys`;
                if (test) {
                    return { success: true, info: info };
                } else {
                    let success = shop.buyFromFleet(equipment.item, this.sheet.fleet);
                    return { success: success, info: info };
                }
            } else {
                return { success: false, info: "sell equipment", error: "it's already mine!" };
            }
        }

        removeEquipment(equipment: CharacterEquipment, destination: CharacterEquipmentContainer | null, test: boolean): CharacterEquipmentTransfer {
            let shop = this.sheet.shop;
            if (shop && contains(shop.getStock(), equipment.item)) {
                let price = shop.getPrice(equipment.item);
                let info = `buy for ${price} zotys`;
                if (destination) {
                    if (price > this.sheet.fleet.credits) {
                        return { success: false, info: info, error: "not enough zotys" };
                    } else if (test) {
                        return { success: true, info: info };
                    } else {
                        let success = shop.sellToFleet(equipment.item, this.sheet.fleet);
                        return { success: success, info: info };
                    }
                } else {
                    return { success: test, info: info };
                }
            } else {
                return { success: false, info: "buy equipment", error: "it's not mine to sell!" };
            }
        }
    }
}
