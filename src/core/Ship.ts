/// <reference path="../common/RObject.ts" />

module TK.SpaceTac {
    /**
     * A single ship in a fleet
     */
    export class Ship extends RObject {
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

        // Active effects (sticky or area)
        active_effects = new RObjectContainer<BaseEffect>()

        // List of slots, able to contain equipment
        slots: Slot[]

        // Cargo
        cargo_space: number = 0
        cargo: Equipment[] = []

        // Ship attributes
        attributes = new ShipAttributes()

        // Ship values
        values = new ShipValues()

        // Personality
        personality = new Personality()

        // Boolean set to true if the ship is currently playing its turn
        playing = false

        // Priority in play_order
        play_priority = 0;

        // Create a new ship inside a fleet
        constructor(fleet: Fleet | null = null, name = "unnamed", model = new ShipModel("default", "Default", 1, 0, false, 0)) {
            super();

            this.fleet = fleet || new Fleet();
            this.name = name;
            this.alive = true;
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
            var ap_checked = !check_ap || this.getValue("power") > 0;
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

        /**
         * Check if a player is playing this ship
         */
        isPlayedBy(player: Player): boolean {
            return this.getPlayer().is(player);
        }

        // get the current battle this ship is engaged in
        getBattle(): Battle | null {
            return this.fleet.battle;
        }

        /**
         * Get the list of actions available
         * 
         * This list does not filter out actions unavailable due to insufficient AP, it only filters out actions that
         * are not allowed/available at all on the ship
         */
        getAvailableActions(): BaseAction[] {
            var actions: BaseAction[] = [];

            if (this.alive) {
                let slots = [SlotType.Engine, SlotType.Power, SlotType.Hull, SlotType.Shield, SlotType.Weapon];
                slots.forEach(slot => {
                    this.listEquipment(slot).forEach(equipment => {
                        if (equipment.action) {
                            actions.push(equipment.action)
                        }
                    });
                });
            }

            actions.push(EndTurnAction.SINGLETON);
            return actions;
        }

        /**
         * Get an available action by its ID
         */
        getAction(action_id: RObjectId): BaseAction | null {
            return first(this.getAvailableActions(), action => action.is(action_id));
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
            if (this.getBattle()) {
                console.error("Cannot upgrade skill during battle");
            } else if (this.getAvailableUpgradePoints() >= points) {
                this.skills[skill].addModifier(points);
                this.updateAttributes();
            }
        }

        // Add an event to the battle log, if any
        addBattleEvent(event: BaseBattleDiff): void {
            var battle = this.getBattle();
            if (battle && battle.log) {
                battle.log.add(event);
            }
        }

        /**
         * Get a ship value
         */
        getValue(name: keyof ShipValues): number {
            return this.values[name];
        }

        /**
         * Set a ship value
         */
        setValue(name: keyof ShipValues, value: number, relative = false): void {
            if (relative) {
                value += this.values[name];
            }
            this.values[name] = value;
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

        // Initialize the action points counter
        //  This should be called once at the start of a battle
        //  If no value is provided, the attribute power_capacity will be used
        private initializePower(value: number | null = null): void {
            if (value === null) {
                value = this.getAttribute("power_capacity");
            }
            this.setValue("power", value);
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
         * Method called at the start of battle, to restore a pristine condition on the ship
         */
        restoreInitialState() {
            this.alive = true;
            this.active_effects = new RObjectContainer();
            this.updateAttributes();
            this.restoreHealth();
            this.initializePower();
            this.listEquipment().forEach(equipment => equipment.cooldown.reset());
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
         * Get the diffs needed to apply changes to a ship value
         */
        getValueDiffs(name: keyof ShipValues, value: number, relative = false): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];
            let current = this.values[name];

            if (relative) {
                value += current;
            }

            // TODO apply range limitations

            if (current != value) {
                result.push(new ShipValueDiff(this, name, value - current));
            }

            return result;
        }

        /**
         * Produce diffs needed to put the ship in emergency stasis
         */
        getDeathDiffs(battle: Battle): BaseBattleDiff[] {
            let result: BaseBattleDiff[] = [];

            keys(SHIP_VALUES).forEach(value => {
                result = result.concat(this.getValueDiffs(value, 0));
            });

            // TODO Remove sticky effects

            result.push(new ShipDeathDiff(battle, this));

            return result;
        }

        /**
         * Set the death status on this ship
         */
        setDead(): void {
            let battle = this.getBattle();
            if (battle) {
                let events = this.getDeathDiffs(battle);
                battle.applyDiffs(events);
            } else {
                console.error("Cannot set ship dead outside of battle", this);
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

        /**
         * Get the list of equipped items
         */
        listEquipments(): Equipment[] {
            return nna(this.slots.map(slot => slot.attached));
        }

        /**
         * Get an equipment by its ID
         */
        getEquipment(id: RObjectId): Equipment | null {
            return first(this.listEquipments(), equipment => equipment.id === id);
        }

        /**
         * Update attributes, taking into account attached equipment and active effects
         */
        updateAttributes(): void {
            // Reset attributes
            keys(this.attributes).forEach(attr => this.attributes[attr].reset());

            // Apply base skills
            keys(this.skills).forEach(skill => this.attributes[skill].addModifier(this.skills[skill].get()));

            // Apply attribute effects
            iforeach(this.ieffects(), effect => {
                if (effect instanceof AttributeEffect) {
                    this.attributes[effect.attrcode].addModifier(effect.value);
                } else if (effect instanceof AttributeMultiplyEffect) {
                    this.attributes[effect.attrcode].addModifier(undefined, effect.value);
                } else if (effect instanceof AttributeLimitEffect) {
                    this.attributes[effect.attrcode].addModifier(undefined, undefined, effect.value);
                }
            });
        }

        /**
         * Fully restore hull and shield, at their maximal capacity
         */
        restoreHealth(): void {
            if (this.alive) {
                this.setValue("hull", this.getAttribute("hull_capacity"));
                this.setValue("shield", this.getAttribute("shield_capacity"));
            }
        }

        /**
         * Iterator over all effects active for this ship.
         * 
         * This combines the permanent effects from equipment, with sticky and area effects.
         */
        ieffects(): Iterator<BaseEffect> {
            return ichain(
                ichainit(imap(iarray(this.slots), slot => slot.attached ? iarray(slot.attached.effects) : IEMPTY)),
                imap(this.active_effects.iterator(), effect => (effect instanceof StickyEffect) ? effect.base : effect)
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

        /**
         * Get a textual description of an attribute, and the origin of its value
         */
        getAttributeDescription(attribute: keyof ShipAttributes): string {
            let result = SHIP_VALUES_DESCRIPTIONS[attribute];

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

            this.active_effects.list().forEach(effect => {
                addEffect("???", (effect instanceof StickyEffect) ? effect.base : effect)
            });

            let sources = diffs.concat(limits).join("\n");
            return sources ? (result + "\n\n" + sources) : result;
        }
    }
}
