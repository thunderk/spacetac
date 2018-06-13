/// <reference path="../common/RObject.ts" />

module TK.SpaceTac {
    /**
     * A single ship in a fleet
     */
    export class Ship extends RObject {
        // Ship model
        model: ShipModel

        // Fleet this ship is a member of
        fleet: Fleet

        // Level of this ship
        level = new ShipLevel()

        // Name of the ship, null if unimportant
        name: string | null

        // Flag indicating if the ship is alive
        alive: boolean

        // Flag indicating that the ship is mission critical (escorted ship)
        critical = false

        // Position in the arena
        arena_x: number
        arena_y: number

        // Facing direction in the arena
        arena_angle: number

        // Available actions
        actions = new ActionList()

        // Active effects (sticky, self or area)
        active_effects = new RObjectContainer<BaseEffect>()

        // Ship attributes
        attributes = new ShipAttributes()

        // Ship values
        values = new ShipValues()

        // Personality
        personality = new Personality()

        // Boolean set to true if the ship is currently playing its turn
        playing = false

        // Priority in current battle's play_order (used as sort key)
        play_priority = 0

        // Create a new ship inside a fleet
        constructor(fleet: Fleet | null = null, name: string | null = null, model = new ShipModel()) {
            super();

            this.fleet = fleet || new Fleet();
            this.name = name;
            this.alive = true;

            this.arena_x = 0;
            this.arena_y = 0;
            this.arena_angle = 0;

            this.model = model;

            this.updateAttributes();
            this.actions.updateFromShip(this);

            this.fleet.addShip(this);
        }

        /**
         * Return the current location and angle of this ship
         */
        get location(): ArenaLocationAngle {
            return new ArenaLocationAngle(this.arena_x, this.arena_y, this.arena_angle);
        }

        /**
         * Returns the name of this ship
         */
        getName(level = true): string {
            let name = this.name || this.model.name;
            return level ? `Level ${this.level.get()} ${name}` : name;
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
            return this.getName();
        }

        // Make an initiative throw, to resolve play order in a battle
        throwInitiative(gen: RandomGenerator): void {
            this.play_priority = gen.random() * this.attributes.initiative.get();
        }

        /**
         * Return the player that plays this ship
         */
        getPlayer(): Player {
            return this.fleet.player;
        }

        /**
         * Check if a player is playing this ship
         */
        isPlayedBy(player: Player): boolean {
            return player.is(this.fleet.player);
        }

        /**
         * Get the battle this ship is currently engaged in
         */
        getBattle(): Battle | null {
            return this.fleet.battle;
        }

        /**
         * Get the list of activated upgrades
         */
        getUpgrades(): ShipUpgrade[] {
            return this.model.getActivatedUpgrades(this.level.get(), this.level.getUpgrades());
        }

        /**
         * Refresh the actions and attributes from the bound model
         */
        refreshFromModel(): void {
            this.updateAttributes();
            this.actions.updateFromShip(this);
        }

        /**
         * Change the ship model
         */
        setModel(model: ShipModel): void {
            this.model = model;
            this.level.clearUpgrades();
            this.refreshFromModel();
        }

        /**
         * Toggle an upgrade
         */
        activateUpgrade(upgrade: ShipUpgrade, on: boolean): void {
            if (on && (upgrade.cost || 0) > this.getAvailableUpgradePoints()) {
                return;
            }
            this.level.activateUpgrade(upgrade, on);
            this.refreshFromModel();
        }

        /** 
         * Get the number of upgrade points available
         */
        getAvailableUpgradePoints(): number {
            let upgrades = this.getUpgrades();
            return this.level.getUpgradePoints() - sum(upgrades.map(upgrade => upgrade.cost || 0));
        }

        /**
         * Add an event to the battle log, if any
         */
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

        /**
         * Initialize the action points counter
         * This should be called once at the start of a battle
         * If no value is provided, the attribute power_capacity will be used
         */
        private initializePower(value: number | null = null): void {
            if (value === null) {
                value = this.getAttribute("power_capacity");
            }
            this.setValue("power", value);
        }

        /**
         * Method called at the start of battle, to restore a pristine condition on the ship
         */
        restoreInitialState() {
            this.alive = true;

            this.actions.updateFromShip(this);
            this.active_effects = new RObjectContainer();

            this.updateAttributes();
            this.restoreHealth();
            this.initializePower();
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

            // Remove active effects
            this.active_effects.list().forEach(effect => {
                if (!(effect instanceof StickyEffect)) {
                    result.push(new ShipEffectRemovedDiff(this, effect));
                }
                result = result.concat(effect.getOffDiffs(this));
            });

            // Deactivate toggle actions
            this.getToggleActions(true).forEach(action => {
                result = result.concat(action.getSpecificDiffs(this, battle, Target.newFromShip(this)));
            });

            // Put all values to 0
            keys(SHIP_VALUES).forEach(value => {
                result = result.concat(this.getValueDiffs(value, 0));
            });

            // Mark as dead
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
         * Update attributes, taking into account model's permanent effects and active effects
         */
        updateAttributes(): void {
            // Reset attributes
            keys(this.attributes).forEach(attr => this.attributes[attr].reset());

            // Apply attribute effects
            this.getEffects().forEach(effect => {
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
         * Get actions from the ship model
         */
        getModelActions(): BaseAction[] {
            return this.model.getActions(this.level.get(), this.level.getUpgrades());
        }

        /**
         * Get permanent effects from the ship model
         */
        getModelEffects(): BaseEffect[] {
            return this.model.getEffects(this.level.get(), this.level.getUpgrades());
        }

        /**
         * Iterator over all effects active for this ship.
         * 
         * This combines the permanent effects from ship model, with sticky and area effects.
         */
        getEffects(): BaseEffect[] {
            return this.getModelEffects().concat(
                this.active_effects.list().map(effect => (effect instanceof StickyEffect) ? effect.base : effect)
            );
        }

        /**
         * Iterator over toggle actions
         */
        getToggleActions(only_active = false): ToggleAction[] {
            let result = cfilter(this.actions.listAll(), ToggleAction);
            if (only_active) {
                result = result.filter(action => this.actions.isToggled(action));
            }
            return result;
        }

        /**
         * Get the effects that this ship has on another ship (which may be herself)
         */
        getAreaEffects(ship: Ship): BaseEffect[] {
            let toggled = this.getToggleActions(true);
            let effects = toggled.map(action => {
                if (bool(action.filterImpactedShips(this, this.location, Target.newFromShip(ship), [ship]))) {
                    return action.effects;
                } else {
                    return [];
                }
            });
            return flatten(effects);
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

            this.getUpgrades().forEach(upgrade => {
                if (upgrade.effects) {
                    upgrade.effects.forEach(effect => addEffect(upgrade.code, effect));
                }
            });

            this.active_effects.list().forEach(effect => {
                if (effect instanceof StickyEffect) {
                    addEffect("Sticky effect", effect.base);
                } else {
                    addEffect("Active effect", effect);
                }
            });

            let sources = diffs.concat(limits).join("\n");
            return sources ? (result + "\n\n" + sources) : result;
        }
    }
}
