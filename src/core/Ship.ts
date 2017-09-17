module TS.SpaceTac {
    /**
     * A single ship in a fleet
     */
    export class Ship {
        // Fleet this ship is a member of
        fleet: Fleet

        // Level of this ship
        level = new ShipLevel()
        skills = new ShipSkills()

        // Name of the ship
        name: string

        // Code of the ShipModel used to create it
        model: ShipModel

        // Flag indicating if the ship is alive
        alive: boolean

        // Flag indicating that the ship is mission critical (escorted ship)
        critical = false

        // Position in the arena
        arena_x: number
        arena_y: number

        // Facing direction in the arena
        arena_angle: number

        // Sticky effects that applies a given number of times
        sticky_effects: StickyEffect[]

        // List of slots, able to contain equipment
        slots: Slot[]

        // Cargo
        cargo_space: number = 0
        cargo: Equipment[] = []

        // Ship attributes
        attributes = new ShipAttributes()

        // Ship values
        values = new ShipValues()

        // Boolean set to true if the ship is currently playing its turn
        playing = false

        // Priority in play_order
        play_priority = 0;

        // Create a new ship inside a fleet
        constructor(fleet: Fleet | null = null, name = "unnamed", model = new ShipModel("default", "Default", 1, 0, false, 0)) {
            this.fleet = fleet || new Fleet();
            this.name = name;
            this.alive = true;
            this.sticky_effects = [];
            this.slots = [];

            this.arena_x = 0;
            this.arena_y = 0;
            this.arena_angle = 0;

            this.fleet.addShip(this);

            this.model = model;
            this.setCargoSpace(model.cargo);
            model.slots.forEach(slot => this.addSlot(slot));
        }

        /**
         * Return the current location and angle of this ship
         */
        get location(): ArenaLocationAngle {
            return new ArenaLocationAngle(this.arena_x, this.arena_y, this.arena_angle);
        }

        /**
         * Returns the full name of this ship
         */
        getFullName(owner = true): string {
            let result = `Level ${this.level.get()} ${this.name}`;
            return owner ? `${this.fleet.player.name}'s ${result}` : result;
        }

        // Returns true if the ship is able to play
        //  If *check_ap* is true, ap_current=0 will make this function return false
        isAbleToPlay(check_ap: boolean = true): boolean {
            var ap_checked = !check_ap || this.values.power.get() > 0;
            return this.alive && ap_checked;
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
            this.play_priority = gen.random() * this.attributes.maneuvrability.get();
        }

        // Return the player owning this ship
        getPlayer(): Player {
            return this.fleet.player;
        }

        // get the current battle this ship is engaged in
        getBattle(): Battle | null {
            return this.fleet.battle;
        }

        // Get the list of actions available
        //  This list does not filter out actions unavailable due to insufficient AP, it only filters out
        //  actions that are not allowed/available at all on the ship
        getAvailableActions(): BaseAction[] {
            var actions: BaseAction[] = [];

            if (this.alive) {
                this.slots.forEach((slot: Slot) => {
                    if (slot.attached && slot.attached.action && slot.attached.action.code != "nothing") {
                        actions.push(slot.attached.action);
                    }
                });
            }

            actions.push(new EndTurnAction());
            return actions;
        }

        /**
         * Get the number of upgrade points available to improve skills
         */
        getAvailableUpgradePoints(): number {
            let used = keys(SHIP_SKILLS).map(skill => this.skills[skill].get()).reduce((a, b) => a + b, 0);
            return this.level.getSkillPoints() - used;
        }

        /**
         * Try to upgrade a skill by 1 point or more
         */
        upgradeSkill(skill: keyof ShipSkills, points = 1) {
            if (this.getAvailableUpgradePoints() >= points) {
                this.skills[skill].add(points);
                this.updateAttributes();
            }
        }

        // Add an event to the battle log, if any
        addBattleEvent(event: BaseBattleEvent): void {
            var battle = this.getBattle();
            if (battle && battle.log) {
                battle.log.add(event);
            }
        }

        /**
         * Get a ship value
         */
        getValue(name: keyof ShipValues): number {
            if (!this.values.hasOwnProperty(name)) {
                console.error(`No such ship value: ${name}`);
                return 0;
            }
            return this.values[name].get();
        }

        /**
         * Set a ship value
         * 
         * If *offset* is true, the value will be added to current value.
         * If *log* is true, an attribute event will be added to the battle log
         * 
         * Returns true if the value changed.
         */
        setValue(name: keyof ShipValues, value: number, offset = false, log = true): boolean {
            let diff = 0;
            let val = this.values[name];

            if (offset) {
                diff = val.add(value);
            } else {
                diff = val.set(value);
            }

            if (log && diff != 0 && this.alive) {
                this.addBattleEvent(new ValueChangeEvent(this, val, diff));
            }

            return diff != 0;
        }

        /**
         * Set a value's maximal capacity
         */
        setValueCapacity(name: keyof ShipValues, maximal: number, log = true): void {
            if (this.getValue(name) > maximal) {
                this.setValue(name, maximal, false, log);
            }
            this.values[name].setMaximal(maximal);
        }

        /**
         * Get a ship attribute's current value
         */
        getAttribute(name: keyof ShipAttributes): number {
            if (!this.attributes.hasOwnProperty(name)) {
                console.error(`No such ship attribute: ${name}`);
                return 0;
            }
            return this.attributes[name].get();
        }

        /**
         * Set a ship attribute
         * 
         * If *log* is true, an attribute event will be added to the battle log
         * 
         * Returns true if the value changed.
         */
        setAttribute(name: keyof ShipAttributes, value: number, log = true): boolean {
            let attr = this.attributes[name];
            let diff = attr.set(value);

            // TODO more generic
            if (name == "power_capacity") {
                this.setValueCapacity("power", attr.get());
            } else if (name == "shield_capacity") {
                this.setValueCapacity("shield", attr.get());
            } else if (name == "hull_capacity") {
                this.setValueCapacity("hull", attr.get());
            }

            if (log && diff != 0 && this.alive) {
                this.addBattleEvent(new ValueChangeEvent(this, attr, diff));
            }

            return diff != 0;
        }

        // Initialize the action points counter
        //  This should be called once at the start of a battle
        //  If no value is provided, the attribute ap_initial will be used
        initializeActionPoints(value: number | null = null): void {
            if (value === null) {
                value = this.attributes.power_capacity.get();
            }
            this.setValue("power", value);
        }

        // Recover action points
        //  This should be called once at the end of a turn
        //  If no value is provided, the current attribute ap_recovery will be used
        recoverActionPoints(value: number | null = null): void {
            if (this.alive) {
                if (value === null) {
                    value = this.attributes.power_generation.get();
                }
                this.setValue("power", value, true);
            }
        }

        /**
         * Consumes action points
         * 
         * Return true if it was possible, false if there wasn't enough points.
         */
        useActionPoints(value: number): boolean {
            if (this.getValue("power") >= value) {
                this.setValue("power", -value, true);
                return true;
            } else {
                return false;
            }
        }

        /**
         * Method called at the start of battle
         */
        startBattle() {
            this.alive = true;
            this.sticky_effects = [];
            this.updateAttributes();
            this.restoreHealth();
            this.initializeActionPoints();
            this.listEquipment().forEach(equipment => equipment.cooldown.reset());
        }

        /**
         * Method called at the end of battle
         */
        endBattle(turncount: number) {
            // Restore as pristine
            this.startBattle();

            // Wear down equipment
            this.listEquipment().forEach(equipment => {
                equipment.addWear(turncount);
            });
        }

        // Method called at the start of this ship turn
        startTurn(): void {
            if (this.playing) {
                console.error("startTurn called twice", this);
                return;
            }
            this.playing = true;

            if (this.alive) {
                // Recompute attributes
                this.updateAttributes();

                // Apply sticky effects
                this.sticky_effects.forEach(effect => effect.startTurn(this));
                this.cleanStickyEffects();

                // Reset toggle actions state
                this.listEquipment().forEach(equipment => {
                    if (equipment.action instanceof ToggleAction && equipment.action.activated) {
                        equipment.action.apply(this, null);
                    }
                });
            }
        }

        // Method called at the end of this ship turn
        endTurn(): void {
            if (!this.playing) {
                console.error("endTurn called before startTurn", this);
                return;
            }
            this.playing = false;

            if (this.alive) {
                // Recover action points for next turn
                this.updateAttributes();
                this.recoverActionPoints();

                // Apply sticky effects
                this.sticky_effects.forEach(effect => effect.endTurn(this));
                this.cleanStickyEffects();

                // Cool down equipment
                this.listEquipment().forEach(equipment => equipment.cooldown.cool());
            }
        }

        /**
         * Register a sticky effect
         * 
         * Pay attention to pass a copy, not the original equipment effect, because it will be modified
         */
        addStickyEffect(effect: StickyEffect, log = true): void {
            if (this.alive) {
                this.sticky_effects.push(effect);
                if (log) {
                    this.setActiveEffectsChanged();
                }
            }
        }

        /**
         * Clean sticky effects that are no longer active
         */
        cleanStickyEffects() {
            let [active, ended] = binpartition(this.sticky_effects, effect => this.alive && effect.duration > 0);
            this.sticky_effects = active;
            if (ended.length) {
                this.setActiveEffectsChanged();
            }
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

        /**
         * Get the distance to another ship
         */
        getDistanceTo(other: Ship): number {
            return Target.newFromShip(this).getDistanceTo(Target.newFromShip(other));
        }

        /**
         * Rotate the ship in place to face a direction
         */
        rotate(angle: number, engine: Equipment | null = null, log = true) {
            if (angle != this.arena_angle) {
                let start = copy(this.location);
                this.setArenaFacingAngle(angle);

                if (log) {
                    this.addBattleEvent(new MoveEvent(this, start, copy(this.location), engine));
                }
            }
        }

        /**
         * Move the ship to another location
         * 
         * This does not check or consume action points, but will update area effects (for this ship and the others).
         * 
         * If *engine* is specified, the facing angle will be updated to simulate an engine maneuver.
         */
        moveTo(x: number, y: number, engine: Equipment | null = null, log = true): void {
            let dx = x - this.arena_x;
            let dy = y - this.arena_y;
            if (dx != 0 || dy != 0) {
                let start = copy(this.location);

                let area_effects = imaterialize(this.iToggleActions(true));
                let old_impacted_ships = area_effects.map(action => action.getAffectedShips(this));
                let old_area_effects = this.getActiveEffects().area;

                if (engine) {
                    let angle = Math.atan2(dy, dx);
                    this.setArenaFacingAngle(angle);
                }

                this.setArenaPosition(x, y);

                if (log) {
                    this.addBattleEvent(new MoveEvent(this, start, copy(this.location), engine));
                }

                let new_impacted_ships = area_effects.map(action => action.getAffectedShips(this));
                let diff_impacted_ships = flatten(zip(old_impacted_ships, new_impacted_ships).map(([a, b]) => disjunctunion(a, b)));
                let new_area_effects = this.getActiveEffects().area;
                if (disjunctunion(old_area_effects, new_area_effects).length > 0) {
                    diff_impacted_ships.push(this);
                }
                unique(diff_impacted_ships).forEach(ship => ship.setActiveEffectsChanged());
            }
        }

        /**
         * Set the death status on this ship
         */
        setDead(log: boolean = true): void {
            this.alive = false;
            this.values.hull.set(0);
            this.values.shield.set(0);
            this.values.power.set(0);

            this.sticky_effects = [];
            this.setActiveEffectsChanged();

            if (log) {
                this.addBattleEvent(new DeathEvent(this));
            }
        }

        /**
         * Apply damages to hull and/or shield
         * 
         * Also apply wear to impacted equipment
         */
        addDamage(hull: number, shield: number, log: boolean = true): void {
            if (shield > 0) {
                this.setValue("shield", -shield, true, log);
            }

            if (hull > 0) {
                this.setValue("hull", -hull, true, log);
            }

            if (log) {
                this.addBattleEvent(new DamageEvent(this, hull, shield));
            }

            if (this.values.hull.get() === 0) {
                // Ship is dead
                this.setDead(log);
            }
        }

        /**
         * Get cargo space not occupied by items
         */
        getFreeCargoSpace(): number {
            return this.cargo_space - this.cargo.length;
        }

        /**
         * Set the available cargo space.
         */
        setCargoSpace(cargo: number) {
            this.cargo_space = cargo;
            this.cargo.splice(this.cargo_space);
        }

        /**
         * Add an equipment to cargo space
         * 
         * Returns true if successful
         */
        addCargo(item: Equipment): boolean {
            if (this.cargo.length < this.cargo_space) {
                return add(this.cargo, item);
            } else {
                return false;
            }
        }

        /**
         * Remove an item from cargo space
         * 
         * Returns true if successful
         */
        removeCargo(item: Equipment): boolean {
            return remove(this.cargo, item);
        }

        /**
         * Equip an item from cargo to the first available slot
         * 
         * Returns true if successful
         */
        equip(item: Equipment, from_cargo = true): boolean {
            let free_slot = this.canEquip(item);

            if (free_slot && (!from_cargo || remove(this.cargo, item))) {
                free_slot.attach(item);
                if (item.attached_to == free_slot && free_slot.attached == item) {
                    this.updateAttributes();
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        /**
         * Check if a ship is able to equip en item, and return the slot it may fit in, or null
         */
        canEquip(item: Equipment): Slot | null {
            let free_slot = first(this.slots, slot => slot.type == item.slot_type && !slot.attached);
            if (free_slot) {
                if (item.canBeEquipped(this.attributes)) {
                    return free_slot;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        /**
         * Remove an equipped item, returning it to cargo
         * 
         * Returns true if successful
         */
        unequip(item: Equipment, to_cargo = true): boolean {
            if (item.attached_to && item.attached_to.attached == item && (!to_cargo || this.cargo.length < this.cargo_space)) {
                item.detach();
                if (to_cargo) {
                    add(this.cargo, item);
                }

                this.updateAttributes();

                return true;
            } else {
                return false;
            }
        }

        /**
         * Add an empty equipment slot of the given type
         */
        addSlot(type: SlotType): Slot {
            var result = new Slot(this, type);
            this.slots.push(result);
            return result;
        }

        /**
         * List all equipments attached to slots of a given type (any slot type if null)
         */
        listEquipment(slottype: SlotType | null = null): Equipment[] {
            return nna(this.slots.filter(slot => slot.attached && (slottype == null || slot.type == slottype)).map(slot => slot.attached));
        }

        /**
         * Get the first free slot of a given type, null if none is available
         */
        getFreeSlot(type: SlotType): Slot | null {
            return first(this.slots, slot => slot.type == type && slot.attached == null);
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
        getRandomEquipment(random = RandomGenerator.global): Equipment | null {
            var count = this.getEquipmentCount();
            if (count === 0) {
                return null;
            } else {
                var picked = random.randInt(0, count - 1);
                var result: Equipment | null = null;
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
            let new_attrs = new ShipAttributes();

            if (this.alive) {
                // TODO better typing for iteritems

                // Apply base skills
                iteritems(<any>this.skills, (key: keyof ShipAttributes, skill: ShipAttribute) => {
                    new_attrs[key].add(skill.get());
                });

                // Sum all attribute effects
                this.collectEffects("attr").forEach((effect: AttributeEffect) => {
                    new_attrs[effect.attrcode].add(effect.value);
                });

                // Apply limit attributes
                this.collectEffects("attrlimit").forEach((effect: AttributeLimitEffect) => {
                    new_attrs[effect.attrcode].setMaximal(effect.value);
                });
            }

            // Set final attributes
            iteritems(<any>new_attrs, (key, value) => {
                this.setAttribute(<keyof ShipAttributes>key, (<ShipAttribute>value).get());
            });
        }

        // Fully restore hull and shield
        restoreHealth(): void {
            if (this.alive) {
                this.values.hull.set(this.attributes.hull_capacity.get());
                this.values.shield.set(this.attributes.shield_capacity.get());
            }
        }

        /**
         * Get the list of all effects applied on this ship
         * 
         * This includes:
         *  - Permanent equipment effects
         *  - Sticky effects
         *  - Area effects at current location
         */
        getActiveEffects(): ActiveEffectsEvent {
            let result = new ActiveEffectsEvent(this);
            if (this.alive) {
                result.equipment = flatten(this.slots.map(slot => slot.attached ? slot.attached.effects : []));
                result.sticky = this.sticky_effects;
                let battle = this.getBattle();
                result.area = battle ? imaterialize(battle.iAreaEffects(this.arena_x, this.arena_y)) : [];
            }
            return result;
        }

        /**
         * Indicate a change in active effects to the log
         */
        setActiveEffectsChanged(): void {
            this.addBattleEvent(this.getActiveEffects());
            this.updateAttributes();
        }

        /**
         * Iterator over all effects active for this ship.
         */
        ieffects(): Iterator<BaseEffect> {
            let battle = this.getBattle();
            let area_effects = battle ? battle.iAreaEffects(this.arena_x, this.arena_y) : IEMPTY;
            return ichain(
                ichainit(imap(iarray(this.slots), slot => slot.attached ? iarray(slot.attached.effects) : IEMPTY)),
                imap(iarray(this.sticky_effects), effect => effect.base),
                area_effects
            );
        }

        /**
         * Iterator over toggle actions
         */
        iToggleActions(only_active = false): Iterator<ToggleAction> {
            return <Iterator<ToggleAction>>ifilter(iarray(this.getAvailableActions()), action => {
                return (action instanceof ToggleAction && (action.activated || !only_active));
            });
        }

        /**
         * Iterator over area effects from this ship impacting a location
         */
        iAreaEffects(x: number, y: number): Iterator<BaseEffect> {
            let distance = Target.newFromShip(this).getDistanceTo({ x: x, y: y });
            return ichainit(imap(this.iToggleActions(true), action => {
                if (distance <= action.radius) {
                    return iarray(action.effects);
                } else {
                    return IEMPTY;
                }
            }));
        }

        // Collect all effects to apply for updateAttributes
        private collectEffects(code: string): BaseEffect[] {
            return imaterialize(ifilter(this.ieffects(), effect => effect.code == code));
        }

        /**
         * Get a textual description of an attribute, and the origin of its value
         */
        getAttributeDescription(attribute: keyof ShipAttributes): string {
            let result = this.attributes[attribute].description;

            let diffs: string[] = [];
            let limits: string[] = [];

            function addEffect(base: string, effect: BaseEffect) {
                if (effect instanceof AttributeEffect && effect.attrcode == attribute) {
                    diffs.push(`${base}: ${effect.value > 0 ? "+" + effect.value.toString() : effect.value}`);
                } else if (effect instanceof AttributeLimitEffect && effect.attrcode == attribute) {
                    limits.push(`${base}: limit to ${effect.value}`);
                }
            }

            if (attribute in this.skills) {
                let skill = this.skills[<keyof ShipSkills>attribute];
                if (skill.get()) {
                    diffs.push(`Levelled up: +${skill.get()}`);
                }
            }

            this.slots.forEach(slot => {
                if (slot.attached) {
                    let equipment = slot.attached;
                    equipment.effects.forEach(effect => addEffect(equipment.getFullName(), effect));
                }
            });

            this.sticky_effects.forEach(effect => addEffect("???", effect.base));

            let sources = diffs.concat(limits).join("\n");
            return sources ? (result + "\n\n" + sources) : result;
        }
    }
}
