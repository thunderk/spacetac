module TK.SpaceTac {
    type ShipValuesMapping = {
        [P in (keyof ShipValues | keyof ShipAttributes)]: string
    }

    export const SHIP_VALUES_DESCRIPTIONS: ShipValuesMapping = {
        "hull": "Physical structure of the ship",
        "shield": "Shield around the ship that may absorb damage",
        "power": "Power available to supply the equipments",
        "hull_capacity": "Maximal Hull value before the ship risks collapsing",
        "shield_capacity": "Maximal Shield value to protect the hull from damage",
        "power_capacity": "Maximal Power value to use equipment",
        "maneuvrability": "Ability to move first, fast and to evade weapons",
        "precision": "Ability to target far and aim good",
    }

    export const SHIP_VALUES_NAMES: ShipValuesMapping = {
        "hull": "hull",
        "shield": "shield",
        "power": "power",
        "hull_capacity": "hull capacity",
        "shield_capacity": "shield capacity",
        "power_capacity": "power capacity",
        "maneuvrability": "maneuvrability",
        "precision": "precision",
    }

    /**
     * A ship attribute is a number resulting of a list of modifiers.
     */
    export class ShipAttribute {
        // Current value
        private current = 0

        // Modifiers
        private cumulatives: number[] = []
        private multipliers: number[] = []
        private limits: number[] = []

        /**
         * Get the current value
         */
        get(): number {
            return this.current;
        }

        /**
         * Get the maximal value enforced by limit modifiers, Infinity for unlimited
         */
        getMaximal(): number {
            if (this.limits.length > 0) {
                return min(this.limits);
            } else {
                return Infinity;
            }
        }

        /**
         * Reset all modifiers
         */
        reset(): void {
            this.cumulatives = [];
            this.multipliers = [];
            this.limits = [];
            this.update();
        }

        /**
         * Add a modifier
         */
        addModifier(cumulative?: number, multiplier?: number, limit?: number): void {
            if (typeof cumulative != "undefined") {
                this.cumulatives.push(cumulative);
            }
            if (typeof multiplier != "undefined") {
                this.multipliers.push(multiplier);
            }
            if (typeof limit != "undefined") {
                this.limits.push(limit);
            }
            this.update();
        }

        /**
         * Remove a modifier
         */
        removeModifier(cumulative?: number, multiplier?: number, limit?: number): void {
            if (typeof cumulative != "undefined") {
                remove(this.cumulatives, cumulative);
            }
            if (typeof multiplier != "undefined") {
                remove(this.multipliers, multiplier);
            }
            if (typeof limit != "undefined") {
                remove(this.limits, limit);
            }
            this.update();
        }

        /**
         * Update the current value
         */
        private update(): void {
            let value = sum(this.cumulatives);
            if (this.multipliers.length) {
                value = Math.round(value * (1 + sum(this.multipliers) / 100));
            }
            if (this.limits.length) {
                value = Math.min(value, min(this.limits));
            }
            this.current = value;
        }
    }

    /**
     * Set of ShipAttribute for a ship
     */
    export class ShipAttributes {
        // Maximal hull value
        hull_capacity = new ShipAttribute()
        // Maximal shield value
        shield_capacity = new ShipAttribute()
        // Maximal power value
        power_capacity = new ShipAttribute()
        // Ability to move first and fast
        maneuvrability = new ShipAttribute()
        // Ability to fire far and good
        precision = new ShipAttribute()
    }

    /**
     * Set of simple values for a ship
     */
    export class ShipValues {
        hull = 0
        shield = 0
        power = 0
    }

    /**
     * Static attributes and values object for property queries
     */
    export const SHIP_ATTRIBUTES = new ShipAttributes();
    export const SHIP_VALUES = new ShipValues();

    /**
     * Type guards
     */
    export function isShipValue(key: string): key is keyof ShipValues {
        return SHIP_VALUES.hasOwnProperty(key);
    }
    export function isShipAttribute(key: string): key is keyof ShipAttributes {
        return SHIP_ATTRIBUTES.hasOwnProperty(key);
    }
}
