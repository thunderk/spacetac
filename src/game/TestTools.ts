module TS.SpaceTac.Game {
    // unit testing utilities
    export class TestTools {

        // Create a battle between two fleets, with a fixed play order (owned ships, then enemy ships)
        static createBattle(own_ships: number, enemy_ships: number): Battle {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            while (own_ships--) {
                fleet1.addShip(new Ship());
            }
            while (enemy_ships--) {
                fleet2.addShip(new Ship());
            }

            var battle = new Battle(fleet1, fleet2);
            battle.play_order = fleet1.ships.concat(fleet2.ships);
            battle.advanceToNextShip();
            return battle;
        }

        // Get or add an equipment of a given slot type
        static getOrGenEquipment(ship: Ship, slot: SlotType, template: LootTemplate): Equipment {
            var equipped = ship.listEquipment(slot);
            var equipment: Equipment;
            if (equipped.length === 0) {
                equipment = template.generateFixed(0);
                ship.addSlot(slot).attach(equipment);
            } else {
                equipment = equipped[0];
            }

            return equipment;
        }

        // Add an engine, allowing a ship to move *distance*, for each action points
        static addEngine(ship: Ship, distance: number): Equipment {
            var equipment = this.getOrGenEquipment(ship, SlotType.Engine, new Equipments.ConventionalEngine());
            equipment.ap_usage = 1;
            equipment.distance = distance;
            return equipment;
        }

        // Set a ship action points, adding/updating an equipment if needed
        static setShipAP(ship: Ship, points: number, recovery: number = 0): void {
            var equipment = this.getOrGenEquipment(ship, SlotType.Power, new Equipments.BasicPowerCore());

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

        // Set a ship hull and shield points, adding/updating an equipment if needed
        static setShipHP(ship: Ship, hull_points: number, shield_points: number): void {
            var armor = TestTools.getOrGenEquipment(ship, SlotType.Armor, new Equipments.IronHull());
            var shield = TestTools.getOrGenEquipment(ship, SlotType.Shield, new Equipments.BasicForceField());

            armor.permanent_effects.forEach((effect: BaseEffect) => {
                if (effect.code === "attrmax") {
                    var meffect = <AttributeMaxEffect>effect;
                    if (meffect.attrcode === AttributeCode.Hull) {
                        meffect.value = hull_points;
                    }
                }
            });
            shield.permanent_effects.forEach((effect: BaseEffect) => {
                if (effect.code === "attrmax") {
                    var meffect = <AttributeMaxEffect>effect;
                    if (meffect.attrcode === AttributeCode.Shield) {
                        meffect.value = shield_points;
                    }
                }
            });

            ship.updateAttributes();
            ship.restoreHealth();
        }
    }
}
