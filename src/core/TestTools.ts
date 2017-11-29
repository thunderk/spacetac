module TK.SpaceTac {
    // unit testing utilities
    export class TestTools {

        // Create a battle between two fleets, with a fixed play order (owned ships, then enemy ships)
        static createBattle(own_ships = 1, enemy_ships = 0): Battle {
            var fleet1 = new Fleet();
            var fleet2 = new Fleet();

            while (own_ships--) {
                fleet1.addShip(new Ship());
            }
            while (enemy_ships--) {
                fleet2.addShip(new Ship());
            }

            var battle = new Battle(fleet1, fleet2);
            battle.ships.list().forEach(ship => TestTools.setShipHP(ship, 1, 0));
            battle.play_order = fleet1.ships.concat(fleet2.ships);
            battle.setPlayingShip(battle.play_order[0]);
            return battle;
        }

        // Get or add an equipment of a given slot type
        static getOrGenEquipment(ship: Ship, slot: SlotType, template: LootTemplate, force_generate = false): Equipment {
            var equipped = ship.listEquipment(slot);
            var equipment: Equipment;
            if (force_generate || equipped.length === 0) {
                equipment = template.generate(1);
                equipment.requirements = {};
                ship.addSlot(slot).attach(equipment);
            } else {
                equipment = equipped[0];
            }

            return equipment;
        }

        /**
         * Add an engine, allowing a ship to move *distance*, for each action points
         */
        static addEngine(ship: Ship, distance: number): Equipment {
            let equipment = ship.addSlot(SlotType.Engine).attach(new Equipment(SlotType.Engine));
            equipment.action = new MoveAction(equipment, distance);
            return equipment;
        }

        /**
         * Add a weapon to a ship
         */
        static addWeapon(ship: Ship, damage = 100, power_usage = 1, max_distance = 100, blast = 0, angle = 0): Equipment {
            var equipment = ship.addSlot(SlotType.Weapon).attach(new Equipment(SlotType.Weapon));
            equipment.action = new TriggerAction(equipment, [new DamageEffect(damage)], power_usage, max_distance, blast, angle);
            return equipment;
        }

        // Set the current playing ship
        static setShipPlaying(battle: Battle, ship: Ship): void {
            add(battle.play_order, ship);
            battle.play_index = battle.play_order.indexOf(ship);
            ship.playing = true;
        }

        // Set a ship action points, adding/updating an equipment if needed
        static setShipAP(ship: Ship, points: number, recovery: number = 0): Equipment {
            var equipment = this.getOrGenEquipment(ship, SlotType.Power, new Equipments.NuclearReactor());

            equipment.effects.forEach(effect => {
                if (effect instanceof AttributeEffect) {
                    if (effect.attrcode === "power_capacity") {
                        effect.value = points;
                    } else if (effect.attrcode === "power_generation") {
                        effect.value = recovery;
                    }
                }
            });

            ship.updateAttributes();
            ship.setValue("power", points);

            return equipment;
        }

        // Set a ship hull and shield points, adding/updating an equipment if needed
        static setShipHP(ship: Ship, hull_points: number, shield_points: number): [Equipment, Equipment] {
            var hull = TestTools.getOrGenEquipment(ship, SlotType.Hull, new Equipments.IronHull());
            var shield = TestTools.getOrGenEquipment(ship, SlotType.Shield, new Equipments.ForceField());

            hull.effects.forEach(effect => {
                if (effect instanceof AttributeEffect) {
                    if (effect.attrcode === "hull_capacity") {
                        effect.value = hull_points;
                    }
                }
            });
            shield.effects.forEach((effect: BaseEffect) => {
                if (effect instanceof AttributeEffect) {
                    if (effect.attrcode === "shield_capacity") {
                        effect.value = shield_points;
                    }
                }
            });

            ship.updateAttributes();
            ship.restoreHealth();

            return [hull, shield];
        }

        /**
         * Force a ship attribute to a given value
         */
        static setAttribute(ship: Ship, name: keyof ShipAttributes, value: number): void {
            let attr = ship.attributes[name];
            attr.reset();
            attr.addModifier(value);
        }

        /**
         * Check a diff chain on a given battle
         * 
         * This will apply all diffs, then reverts them, checking at each step the battle state
         */
        static diffChain(check: TestContext, battle: Battle, diffs: BaseBattleDiff[], checks: ((check: TestContext) => void)[]): void {
            checks[0](check.sub("initial state"));

            for (let i = 0; i < diffs.length; i++) {
                diffs[i].apply(battle);
                checks[i + 1](check.sub(`after diff ${i + 1} applied`));
            }

            for (let i = diffs.length - 1; i >= 0; i--) {
                diffs[i].revert(battle);
                checks[i](check.sub(`after diff ${i + 1} reverted`));
            }
        }

        /**
         * Check an action chain on a given battle
         * 
         * This will apply all actions, then reverts them, checking at each step the battle state
         */
        static actionChain(check: TestContext, battle: Battle, actions: [Ship, BaseAction, Target | undefined][], checks: ((check: TestContext) => void)[]): void {
            checks[0](check.sub("initial state"));

            for (let i = 0; i < actions.length; i++) {
                let [ship, action, target] = actions[i];
                battle.setPlayingShip(ship);
                let result = battle.applyOneAction(action, target);
                check.equals(result, true, `action ${i + 1} successfully applied`);
                checks[i + 1](check.sub(`after action ${i + 1} applied`));
            }

            for (let i = actions.length - 1; i >= 0; i--) {
                battle.revertOneAction();
                checks[i](check.sub(`after action ${i + 1} reverted`));
            }
        }
    }
}
