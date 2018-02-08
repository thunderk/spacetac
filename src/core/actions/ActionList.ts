module TK.SpaceTac {
    /**
     * List of actions, that may be used by a ship to keep track of available actions
     * 
     * This manages usage count, toggles and cooldown ...
     */
    export class ActionList {
        // Available actions
        private from_model: BaseAction[] = []
        private custom: BaseAction[] = []

        // Toggled actions
        private toggled = new RObjectContainer<BaseAction>()

        // Active cooldowns
        private cooldowns: { [action: number]: Cooldown } = {}

        /**
         * Add a custom action
         */
        addCustom<T extends BaseAction>(action: T): T {
            add(this.custom, action);
            return action;
        }

        /** 
         * List all actions
         */
        listAll(): BaseAction[] {
            return this.from_model.concat(this.custom).concat([EndTurnAction.SINGLETON]);
        }

        /**
         * List all currently toggled actions
         */
        listToggled(): ToggleAction[] {
            let result: ToggleAction[] = [];

            this.listAll().forEach(action => {
                if (action instanceof ToggleAction && this.isToggled(action)) {
                    result.push(action);
                }
            });

            return result;
        }

        /**
         * List all currently overheated actions
         */
        listOverheated(): BaseAction[] {
            return this.listAll().filter(action => this.getCooldown(action).heat > 0);
        }

        /**
         * Get an action by its ID
         */
        getById(action_id: RObjectId): BaseAction | null {
            return first(this.listAll(), action => action.is(action_id));
        }

        /**
         * Check if a toggle action is currently active
         */
        isToggled(action: ToggleAction): boolean {
            return this.toggled.get(action.id) != null;
        }

        /**
         * Toggle the status of an action
         */
        toggle(action: ToggleAction, active: boolean): boolean {
            if (this.getById(action.id)) {
                if (active) {
                    this.toggled.add(action);
                } else {
                    this.toggled.remove(action);
                }
            }

            return this.toggled.get(action.id) != null;
        }

        /**
         * Get the cooldown associated with an action
         */
        getCooldown(action: BaseAction): Cooldown {
            if (this.getById(action.id)) {
                if (typeof this.cooldowns[action.id] == "undefined") {
                    this.cooldowns[action.id] = copy(action.getCooldown());
                }
                return this.cooldowns[action.id];
            } else {
                console.warn("Action not found, fake cooldown returned", action, this);
                return new Cooldown();
            }
        }

        /**
         * Store an usage count for an action
         */
        storeUsage(action: BaseAction, usage = 1): void {
            this.getCooldown(action).use(usage);
        }

        /**
         * Check if an action may be used (in regards to cooldown)
         * 
         * This does not take power into account
         */
        isUsable(action: BaseAction): boolean {
            if (this.getById(action.id)) {
                return this.getCooldown(action).canUse();
            } else {
                return false;
            }
        }

        /**
         * Update the actions from a ship.
         * 
         * Beware that this will change the actions IDs. It should typically be done at a battle start.
         * This will reset cooldown, toggles and custom actions.
         */
        updateFromShip(ship: Ship) {
            this.from_model = ship.getModelActions();
            this.toggled = new RObjectContainer<BaseAction>();
            this.cooldowns = {};
            this.custom = [];
        }
    }
}
