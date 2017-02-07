/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    // A single ship in a Fleet
    export class Ship extends Serializable {
        // Fleet this ship is a member of
        fleet: Fleet;

        // Level of this ship
        level: number;

        // Name of the ship
        name: string;

        // Code of the ShipModel used to create it
        model: string;

        // Flag indicating if the ship is alive
        alive: boolean;

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

        // Number of shield points (a shield can absorb some damage to protect the hull)
        shield: Attribute;

        // Sticky effects that applies a given number of times
        sticky_effects: StickyEffect[];

        // Capabilities level
        cap_material: Attribute;
        cap_energy: Attribute;
        cap_electronics: Attribute;
        cap_human: Attribute;
        cap_time: Attribute;
        cap_gravity: Attribute;

        // List of slots, able to contain equipment
        slots: Slot[];

        // Collection of available attributes
        attributes: AttributeCollection;

        // Boolean set to true if the ship is currently playing its turn
        playing = false;

        // Create a new ship inside a fleet
        constructor(fleet: Fleet = null, name: string = null) {
            super();

            this.attributes = new AttributeCollection();
            this.fleet = fleet || new Fleet();
            this.level = 1;
            this.name = name;
            this.model = "default";
            this.alive = true;
            this.initiative = this.newAttribute(AttributeCode.Initiative);
            this.initiative.setMaximal(1);
            this.ap_current = this.newAttribute(AttributeCode.Power);
            this.ap_initial = this.newAttribute(AttributeCode.Power_Initial);
            this.ap_recover = this.newAttribute(AttributeCode.Power_Recovery);
            this.hull = this.newAttribute(AttributeCode.Hull);
            this.shield = this.newAttribute(AttributeCode.Shield);
            this.cap_material = this.newAttribute(AttributeCode.Cap_Material);
            this.cap_energy = this.newAttribute(AttributeCode.Cap_Energy);
            this.cap_electronics = this.newAttribute(AttributeCode.Cap_Electronics);
            this.cap_human = this.newAttribute(AttributeCode.Cap_Human);
            this.cap_time = this.newAttribute(AttributeCode.Cap_Time);
            this.cap_gravity = this.newAttribute(AttributeCode.Cap_Gravity);
            this.sticky_effects = [];
            this.slots = [];

            this.arena_x = 0;
            this.arena_y = 0;
            this.arena_angle = 0;

            if (fleet) {
                fleet.addShip(this);
            }
        }

        // Returns true if the ship is able to play
        //  If *check_ap* is true, ap_current=0 will make this function return false
        isAbleToPlay(check_ap: boolean = true): boolean {
            var ap_checked = !check_ap || this.ap_current.current > 0;
            return this.alive && ap_checked;
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

        // Add an event to the battle log, if any
        addBattleEvent(event: BaseLogEvent): void {
            var battle = this.getBattle();
            if (battle && battle.log) {
                battle.log.add(event);
            }
        }

        /**
         * Set an attribute value
         * 
         * If *offset* is true, the value will be added to current value.
         * If *log* is true, an attribute event will be added to the battle log
         * 
         * Returns true if the attribute changed.
         */
        setAttribute(attr: Attribute | AttributeCode, value: number, offset = false, log = true): boolean {
            if (!(attr instanceof Attribute)) {
                attr = this.attributes.getRawAttr(attr);
            }

            var changed: boolean;

            if (offset) {
                changed = attr.add(value);
            } else {
                changed = attr.set(value);
            }

            if (changed && log) {
                this.addBattleEvent(new AttributeChangeEvent(this, attr));
            }

            return changed;
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
        //  This should be called once at the end of a turn
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

        // Method called at the start of battle
        startBattle() {
            this.updateAttributes();
            this.restoreHealth();
            this.initializeActionPoints();
        }


        // Method called at the start of this ship turn
        startTurn(): void {
            if (this.playing) {
                console.error("startTurn called twice", this);
                return;
            }
            this.playing = true;

            // Recompute attributes
            this.updateAttributes();

            // Apply sticky effects
            this.sticky_effects.forEach(effect => effect.startTurn(this));
            this.cleanStickyEffects();
        }

        // Method called at the end of this ship turn
        endTurn(): void {
            if (!this.playing) {
                console.error("endTurn called before startTurn", this);
                return;
            }
            this.playing = false;

            // Recover action points for next turn
            this.recoverActionPoints();

            // Apply sticky effects
            this.sticky_effects.forEach(effect => effect.endTurn(this));
            this.cleanStickyEffects();
        }

        /**
         * Register a sticky effect
         * 
         * Pay attention to pass a copy, not the original equipment effect, because it will be modified
         */
        addStickyEffect(effect: StickyEffect, log = true): void {
            this.sticky_effects.push(effect);
            if (log) {
                this.addBattleEvent(new EffectAddedEvent(this, effect));
            }
        }

        /**
         * Clean sticky effects that are no longer active
         */
        cleanStickyEffects() {
            let [active, ended] = binpartition(this.sticky_effects, effect => effect.duration > 0);
            this.sticky_effects = active;
            ended.forEach(effect => this.addBattleEvent(new EffectRemovedEvent(this, effect)));
        }

        /**
         * Check if the ship is inside a given circular area
         */
        isInCircle(x: number, y: number, radius: number): boolean {
            let dx = this.arena_x - x;
            let dy = this.arena_y - y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= radius;
        }

        // Move toward a location
        //  This does not check or consume action points
        moveTo(x: number, y: number, log: boolean = true): void {
            var angle = Math.atan2(y - this.arena_y, x - this.arena_x);
            this.setArenaFacingAngle(angle);

            this.setArenaPosition(x, y);

            if (log) {
                this.addBattleEvent(new MoveEvent(this, x, y));
            }
        }

        // Set the death status on this ship
        setDead(log: boolean = true): void {
            this.alive = false;
            if (log) {
                this.addBattleEvent(new DeathEvent(this));
            }
        }

        // Apply damages to hull and/or shield
        addDamage(hull: number, shield: number, log: boolean = true): void {
            this.setAttribute(this.shield, -shield, true, log);
            this.setAttribute(this.hull, -hull, true, log);

            if (log) {
                this.addBattleEvent(new DamageEvent(this, hull, shield));
            }

            if (this.hull.current === 0) {
                // Ship is dead
                this.setDead(log);
            }
        }

        // Add an empty equipment slot of the given type
        addSlot(type: SlotType): Slot {
            var result = new Slot(this, type);
            this.slots.push(result);
            return result;
        }

        // List all attached equipments of a given type (all types if null)
        listEquipment(slottype: SlotType = null): Equipment[] {
            var result: Equipment[] = [];

            this.slots.forEach((slot: Slot) => {
                if (slot.type === slottype && slot.attached) {
                    result.push(slot.attached);
                }
            });

            return result;
        }

        // Get the number of attached equipments
        getEquipmentCount(): number {
            var result = 0;
            this.slots.forEach((slot: Slot) => {
                if (slot.attached) {
                    result++;
                }
            });
            return result;
        }

        // Get a random attached equipment, null if no equipment is attached
        getRandomEquipment(random: RandomGenerator = new RandomGenerator()): Equipment {
            var count = this.getEquipmentCount();
            if (count === 0) {
                return null;
            } else {
                var picked = random.throwInt(0, count - 1);
                var result: Equipment = null;
                var index = 0;
                this.slots.forEach((slot: Slot) => {
                    if (slot.attached) {
                        if (index === picked) {
                            result = slot.attached;
                        }
                        index++;
                    }
                });
                return result;
            }
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
            this.ap_current.setMaximal(new_attrs.getValue(AttributeCode.Power));
            this.hull.setMaximal(new_attrs.getValue(AttributeCode.Hull));
            this.shield.setMaximal(new_attrs.getValue(AttributeCode.Shield));

            // Compute new current values for attributes
            new_attrs = new AttributeCollection();
            this.collectEffects("attr").forEach((effect: AttributeMaxEffect) => {
                new_attrs.addValue(effect.attrcode, effect.value);
            });
            this.ap_initial.set(new_attrs.getValue(AttributeCode.Power_Initial));
            this.ap_recover.set(new_attrs.getValue(AttributeCode.Power_Recovery));
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
