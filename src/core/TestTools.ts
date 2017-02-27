module TS.SpaceTac {
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
        static getOrGenEquipment(ship: Ship, slot: SlotType, template: LootTemplate, force_generate = false): Equipment {
            var equipped = ship.listEquipment(slot);
            var equipment: Equipment;
            if (force_generate || equipped.length === 0) {
                equipment = template.generateFixed(0);
                ship.addSlot(slot).attach(equipment);
            } else {
                equipment = equipped[0];
            }

            return equipment;
        }

        // Add an engine, allowing a ship to move *distance*, for each action points
        static addEngine(ship: Ship, distance: number): Equipment {
            var equipment = this.getOrGenEquipment(ship, SlotType.Engine, new Equipments.ConventionalEngine(), true);
            equipment.ap_usage = 1;
            equipment.distance = distance;
            return equipment;
        }

        /**
         * Add a weapon to a ship
         */
        static addWeapon(ship: Ship, damage = 100, power_usage = 1, max_distance = 100, blast = 0): Equipment {
            var equipment = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            equipment.action = new FireWeaponAction(equipment, blast != 0, "Test Weapon");
            equipment.ap_usage = power_usage;
            equipment.blast = blast;
            equipment.distance = max_distance;
            equipment.target_effects.push(new DamageEffect(damage));
            return equipment;
        }

        // Set a ship action points, adding/updating an equipment if needed
        static setShipAP(ship: Ship, points: number, recovery: number = 0): void {
            var equipment = this.getOrGenEquipment(ship, SlotType.Power, new Equipments.BasicPowerCore());

            equipment.permanent_effects.forEach(effect => {
                if (effect instanceof AttributeEffect) {
                    if (effect.attrcode === "power_capacity") {
                        effect.value = points;
                    } else if (effect.attrcode === "power_recovery") {
                        effect.value = recovery;
                    }
                }
            });

            ship.updateAttributes();
            ship.setValue("power", points);
        }

        // Set a ship hull and shield points, adding/updating an equipment if needed
        static setShipHP(ship: Ship, hull_points: number, shield_points: number): void {
            var armor = TestTools.getOrGenEquipment(ship, SlotType.Armor, new Equipments.IronHull());
            var shield = TestTools.getOrGenEquipment(ship, SlotType.Shield, new Equipments.BasicForceField());

            armor.permanent_effects.forEach(effect => {
                if (effect instanceof AttributeEffect) {
                    if (effect.attrcode === "hull_capacity") {
                        effect.value = hull_points;
                    }
                }
            });
            shield.permanent_effects.forEach((effect: BaseEffect) => {
                if (effect instanceof AttributeEffect) {
                    if (effect.attrcode === "shield_capacity") {
                        effect.value = shield_points;
                    }
                }
            });

            ship.updateAttributes();
            ship.restoreHealth();
        }
    }
}
