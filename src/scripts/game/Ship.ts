module SpaceTac.Game {
    "use strict";

    // A single ship in a Fleet
    export class Ship {
        // Fleet this ship is a member of
        fleet: Fleet;

        // Name of the ship
        name: string;

        // Current level
        level: number;

        // Position in the arena
        arena_x: number;
        arena_y: number;

        // Facing direction in the arena
        arena_angle: number;

        // Initiative (high numbers will allow this ship to play sooner)
        initiative: Attribute;

        // Current number of action points
        ap_current: Attribute;

        // Initial number of action points, at the start of a battle
        ap_initial: Attribute;

        // Number of action points recovered by turn
        ap_recover: Attribute;

        // Number of hull points (once it reaches 0, the ship is dead)
        hull: Attribute;

        // Number of shield points (a shield wan absorb some damage to protect the hull)
        shield: Attribute;

        // Number of action points used to make a 1.0 move
        movement_cost: number;

        // List of slots, able to contain equipment
        slots: Slot[];

        // Collection of available attributes
        attributes: AttributeCollection;

        // Create a new ship inside a fleet
        constructor(fleet: Fleet = null, name: string = null) {
            this.attributes = new AttributeCollection();
            this.fleet = fleet;
            this.name = name;
            this.initiative = this.newAttribute(AttributeCode.Initiative);
            this.initiative.setMaximal(1);
            this.ap_current = this.newAttribute(AttributeCode.AP);
            this.ap_initial = this.newAttribute(AttributeCode.AP_Initial);
            this.ap_recover = this.newAttribute(AttributeCode.AP_Recovery);
            this.hull = this.newAttribute(AttributeCode.Hull);
            this.shield = this.newAttribute(AttributeCode.Shield);
            this.movement_cost = 0.1;
            this.slots = [];

            this.arena_x = 0;
            this.arena_y = 0;

            if (fleet) {
                fleet.addShip(this);
            }
        }

        // Create and register an attribute
        newAttribute(code: AttributeCode): Attribute {
            return this.attributes.getRawAttr(code);
        }

        // Set position in the arena
        //  This does not consumes action points
        setArenaPosition(x: number, y: number) {
            this.arena_x = x;
            this.arena_y = y;
        }

        // Set facing angle in the arena
        setArenaFacingAngle(angle: number) {
            this.arena_angle = angle;
        }

        // String repr
        jasmineToString(): string {
            return "Ship " + this.name;
        }

        // Make an initiative throw, to resolve play order in a battle
        throwInitiative(gen: RandomGenerator): void {
            this.initiative.set(gen.throw(this.initiative.maximal));
        }

        // Return the player owning this ship
        getPlayer(): Player {
            if (this.fleet) {
                return this.fleet.player;
            } else {
                return null;
            }
        }

        // get the current battle this ship is engaged in
        getBattle(): Battle {
            if (this.fleet) {
                return this.fleet.battle;
            } else {
                return null;
            }
        }

        // Get the list of actions available
        //  This list does not filter out actions unavailable due to insufficient AP, it only filters out
        //  actions that are not allowed/available at all on the ship
        getAvailableActions(): BaseAction[] {
            var actions: BaseAction[] = [];

            this.slots.forEach((slot: Slot) => {
                if (slot.attached && slot.attached.action) {
                    actions.push(slot.attached.action);
                }
            });

            actions.push(new EndTurnAction());
            return actions;
        }

        // Set an attribute value
        //  If offset is true, the value will be added to current value
        //  If log is true, an attribute event will be added to the battle log
        setAttribute(attr: Attribute, value: number, offset: boolean = false, log: boolean = true) {
            var changed: boolean;

            if (offset) {
                changed = attr.add(value);
            } else {
                changed = attr.set(value);
            }

            if (changed && log) {
                var battle = this.getBattle();
                if (battle) {
                    battle.log.add(new AttributeChangeEvent(this, attr));
                }
            }
        }

        // Initialize the action points counter
        //  This should be called once at the start of a battle
        //  If no value is provided, the attribute ap_initial will be used
        initializeActionPoints(value: number = null): void {
            if (value === null) {
                value = this.ap_initial.current;
            }
            this.setAttribute(this.ap_current, value);
        }

        // Recover action points
        //  This should be called once at the start of a turn
        //  If no value is provided, the current attribute ap_recovery will be used
        recoverActionPoints(value: number = null): void {
            if (value === null) {
                value = this.ap_recover.current;
            }
            this.setAttribute(this.ap_current, value, true);
        }

        // Consumes action points
        useActionPoints(value: number): void {
            this.setAttribute(this.ap_current, -value, true);
        }

        // Method called at the start of this ship turn
        startTurn(first: boolean): void {
            // Recompute attributes
            this.updateAttributes();

            // Manage action points
            if (first) {
                this.initializeActionPoints();
            } else {
                this.recoverActionPoints();
            }
        }

        // Get the maximal position reachable in the arena with current action points
        getLongestMove(x: number, y: number): number[] {
            var dx = x - this.arena_x;
            var dy = y - this.arena_y;
            var length = Math.sqrt(dx * dx + dy * dy);
            var max_length = this.ap_current.current / this.movement_cost;
            if (max_length >= length) {
                return [x, y];
            } else {
                var factor = max_length / length;
                return [this.arena_x + dx * factor, this.arena_y + dy * factor];
            }
        }

        // Move toward a location, consuming action points
        moveTo(x: number, y: number): void {
            var dest = this.getLongestMove(x, y);
            var dx = dest[0] - this.arena_x;
            var dy = dest[1] - this.arena_y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var cost = distance * this.movement_cost;
            var angle = Math.atan2(y - this.arena_y, x - this.arena_x);

            this.setArenaPosition(this.arena_x + dx, this.arena_y + dy);
            this.setArenaFacingAngle(angle);
            this.useActionPoints(cost);
        }

        // Add an empty equipment slot of the given type
        addSlot(type: SlotType): Slot {
            var result = new Slot(this, type);
            this.slots.push(result);
            return result;
        }

        // Update attributes, taking into account attached equipment and active effects
        updateAttributes(): void {
            // TODO Something more generic

            // Compute new maximal values for attributes
            var new_attrs = new AttributeCollection();
            this.collectEffects("attrmax").forEach((effect: AttributeMaxEffect) => {
                new_attrs.addValue(effect.attrcode, effect.value);
            });
            this.initiative.setMaximal(new_attrs.getValue(AttributeCode.Initiative));
            this.ap_current.setMaximal(new_attrs.getValue(AttributeCode.AP));
            this.hull.setMaximal(new_attrs.getValue(AttributeCode.Hull));
            this.shield.setMaximal(new_attrs.getValue(AttributeCode.Shield));

            // Compute new current values for attributes
            new_attrs = new AttributeCollection();
            this.collectEffects("attr").forEach((effect: AttributeMaxEffect) => {
                new_attrs.addValue(effect.attrcode, effect.value);
            });
            this.ap_initial.set(new_attrs.getValue(AttributeCode.AP_Initial));
            this.ap_recover.set(new_attrs.getValue(AttributeCode.AP_Recovery));
        }

        // Fully restore hull and shield
        restoreHealth(): void {
            this.hull.set(this.hull.maximal);
            this.shield.set(this.shield.maximal);
        }

        // Collect all effects to apply for updateAttributes
        private collectEffects(code: string = null): BaseEffect[] {
            var result: BaseEffect[] = [];

            this.slots.forEach((slot: Slot) => {
                if (slot.attached) {
                    slot.attached.permanent_effects.forEach((effect: BaseEffect) => {
                        if (effect.code === code) {
                            result.push(effect);
                        }
                    });
                }
            });

            return result;
        }
    }
}
