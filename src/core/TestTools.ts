module TK.SpaceTac {
    // unit testing utilities
    export class TestTools {

        // Create a battle between two fleets, with a fixed play order (owned ships, then enemy ships)
        static createBattle(own_ships = 1, enemy_ships = 1): Battle {
            var fleet1 = new Fleet(new Player("Attacker"));
            var fleet2 = new Fleet(new Player("Defender"));

            while (own_ships--) {
                fleet1.addShip();
            }
            while (enemy_ships--) {
                fleet2.addShip();
            }

            var battle = new Battle(fleet1, fleet2);
            battle.ships.list().forEach(ship => TestTools.setShipModel(ship, 1, 0));
            battle.play_order = fleet1.ships.concat(fleet2.ships);
            battle.setPlayingShip(battle.play_order[0]);
            return battle;
        }

        /**
         * Add an engine, allowing a ship to move *distance*, for each action points
         */
        static addEngine(ship: Ship, distance: number): MoveAction {
            let action = new MoveAction("Engine", { distance_per_power: distance });
            ship.actions.addCustom(action);
            return action;
        }

        /**
         * Add a weapon to a ship
         */
        static addWeapon(ship: Ship, damage = 100, power_usage = 1, max_distance = 100, blast = 0, angle = 0): TriggerAction {
            let action = new TriggerAction("Weapon", {
                effects: [new DamageEffect(damage, DamageEffectMode.SHIELD_THEN_HULL)],
                power: power_usage,
                range: max_distance,
                blast: blast,
                angle: angle,
            });
            ship.actions.addCustom(action);
            return action;
        }

        /**
         * Force the current playing ship
         */
        static setShipPlaying(battle: Battle, ship: Ship): void {
            add(battle.play_order, ship);
            battle.play_index = battle.play_order.indexOf(ship);
            ship.playing = true;
        }

        /**
         * Set a ship attributes (by changing its model)
         */
        static setShipModel(ship: Ship, hull: number, shield = 0, power = 0, level = 1, actions: BaseAction[] = [], effects: BaseEffect[] = []) {
            let model = new ShipModel();
            ship.level.forceLevel(level);
            ship.model = model;

            // TODO Use a BaseModel subclass would be prettier
            model.getActions = () => actions;
            model.getEffects = () => effects.concat([
                new AttributeEffect("hull_capacity", hull),
                new AttributeEffect("shield_capacity", shield),
                new AttributeEffect("power_capacity", power),
            ]);

            ship.actions.updateFromShip(ship);

            ship.updateAttributes();
            ship.restoreHealth();
            ship.setValue("power", power);
        }

        /**
         * Force a ship attribute to a given value
         * 
         * Beware that a call to ship.updateAttributes() may cancel this
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
                let result = battle.applyOneAction(action.id, target);
                check.equals(result, true, `action ${i + 1} successfully applied`);
                checks[i + 1](check.sub(`after action ${i + 1} applied`));
            }

            for (let i = actions.length - 1; i >= 0; i--) {
                battle.revertOneAction();
                checks[i](check.sub(`after action ${i + 1} reverted`));
            }
        }
    }

    function strip<T>(obj: T, attr: keyof T): any {
        let result: any = {};
        copyfields(obj, result);
        delete result[attr];
        return result;
    }

    function strip_id(effect: RObject): any {
        if (effect instanceof StickyEffect) {
            let result = strip(effect, "id");
            result.base = strip_id(result.base);
            return result;
        } else {
            return strip(effect, "id");
        }
    }

    export function compare_effects(check: TestContext, effects1: BaseEffect[], effects2: BaseEffect[]): void {
        check.equals(effects1.map(strip_id), effects2.map(strip_id), "effects");
    }

    export function compare_action(check: TestContext, action1: BaseAction | null, action2: BaseAction | null): void {
        if (action1 === null || action2 === null) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(action1), strip_id(action2), "action");
        }
    }

    export function compare_trigger_action(check: TestContext, action1: BaseAction | null, action2: TriggerAction | null): void {
        if (action1 === null || action2 === null || !(action1 instanceof TriggerAction)) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(strip(action1, "effects")), strip_id(strip(action2, "effects")), "action");
            compare_effects(check, action1.effects, action2.effects);
        }
    }

    export function compare_toggle_action(check: TestContext, action1: BaseAction | null, action2: ToggleAction | null): void {
        if (action1 === null || action2 === null || !(action1 instanceof ToggleAction)) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(strip(action1, "effects")), strip_id(strip(action2, "effects")), "action");
            compare_effects(check, action1.effects, action2.effects);
        }
    }

    export function compare_drone_action(check: TestContext, action1: BaseAction | null, action2: DeployDroneAction | null): void {
        if (action1 === null || action2 === null || !(action1 instanceof DeployDroneAction)) {
            check.equals(action1, action2, "action");
        } else {
            check.equals(strip_id(strip(action1, "drone_effects")), strip_id(strip(action2, "drone_effects")), "action");
            compare_effects(check, action1.drone_effects, action2.drone_effects);
        }
    }
}
