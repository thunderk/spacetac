module SpaceTac.Game {
    "use strict";

    // unit testing utilities
    export class TestTools {
        // Set a ship action points, adding/updating an equipment if needed
        static setShipAP(ship: Ship, points: number, recovery: number) {
            var powers = ship.listEquipment(SlotType.Power);
            var equipment: Equipment;
            if (powers.length === 0) {
                equipment = (new Equipments.BasicPowerCore()).generateFixed(0);
                ship.addSlot(SlotType.Power).attach(equipment);
            } else {
                equipment = powers[0];
            }

            equipment.permanent_effects.forEach((effect: BaseEffect) => {
                if (effect.code === "attrmax") {
                    var meffect = <AttributeMaxEffect>effect;
                    if (meffect.attrcode === AttributeCode.AP) {
                        meffect.value = points;
                    }
                } else if (effect.code === "attr") {
                    var veffect = <AttributeValueEffect>effect;
                    if (veffect.attrcode === AttributeCode.AP_Recovery) {
                        veffect.value = recovery;
                    }
                }
            });

            ship.ap_current.setMaximal(points);
            ship.ap_current.set(points);
            ship.ap_recover.set(recovery);
        }
    }
}
