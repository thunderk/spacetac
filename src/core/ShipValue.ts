module TS.SpaceTac {
    const SHIP_VALUES_DESCRIPTIONS: { [name: string]: string } = {
        "materials skill": "Usage of physical materials such as bullets, shells...",
        "photons skill": "Forces of light, and electromagnetic radiation",
        "antimatter skill": "Manipulation of matter and antimatter particles",
        "quantum skill": "Application of quantum uncertainty principle",
        "gravity skill": "Interaction with gravitational forces",
        "time skill": "Control of relativity's time properties",
        "hull capacity": "Maximal Hull value before the ship risks collapsing",
        "shield capacity": "Maximal Shield value to protect the hull from damage",
        "power capacity": "Maximal Power value to use equipment",
        "power generation": "Power generated at the end of the ship's turn",
        "maneuvrability": "Ability to move first and fast",
        "precision": "Ability to target far and good",
    }

    /**
     * A ship value is a number that may vary and be constrained in a given range.
     */
    export class ShipValue {
        // Name of the value
        name: string

        // Current value
        private current: number

        // Upper bound
        private maximal: number | null

        constructor(code: string, current = 0, maximal: number | null = null) {
            this.name = code;
            this.current = current;
            this.maximal = maximal;
        }

        get description(): string {
            return SHIP_VALUES_DESCRIPTIONS[this.name];
        }

        /**
         * Get the current value
         */
        get(): number {
            return this.current;
        }

        /**
         * Get the maximal value
         */
        getMaximal(): number | null {
            return this.maximal;
        }

        /**
         * Set the upper bound the value must not cross
         */
        setMaximal(value: number): void {
            this.maximal = value;
            this.fix();
        }

        /**
         * Set an absolute value
         * 
         * Returns the variation in value
         */
        set(value: number): number {
            var old_value = this.current;
            this.current = value;
            this.fix();
            return this.current - old_value;
        }

        /** 
         * Add an offset to current value
         * 
         * Returns true if the value changed
         */
        add(value: number): number {
            var old_value = this.current;
            this.current += value;
            this.fix();
            return this.current - old_value;
        }

        /**
         * Fix the value to be positive and lower than maximal
         */
        private fix(): void {
            if (this.maximal !== null && this.current > this.maximal) {
                this.current = this.maximal;
            }
            if (this.current < 0) {
                this.current = 0;
            }
        }
    }

    /**
     * A ship attribute is a value computed by a sum of contributions from equipments and sticky effects.
     * 
     * A value may be limited by other effects.
     */
    export class ShipAttribute extends ShipValue {
        // Raw contributions value (without limits)
        private raw = 0

        // Temporary limits
        private limits: number[] = []
    }

    /**
     * Set of upgradable skills for a ship
     */
    export class ShipSkills {
        // Skills
        skill_materials = new ShipAttribute("materials skill")
        skill_photons = new ShipAttribute("photons skill")
        skill_antimatter = new ShipAttribute("antimatter skill")
        skill_quantum = new ShipAttribute("quantum skill")
        skill_gravity = new ShipAttribute("gravity skill")
        skill_time = new ShipAttribute("time skill")
    }

    /**
     * Set of ShipAttribute for a ship
     */
    export class ShipAttributes extends ShipSkills {
        // Maximal hull value
        hull_capacity = new ShipAttribute("hull capacity")
        // Maximal shield value
        shield_capacity = new ShipAttribute("shield capacity")
        // Maximal power value
        power_capacity = new ShipAttribute("power capacity")
        // Power value recovered each turn
        power_generation = new ShipAttribute("power generation")
        // Ability to move first and fast
        maneuvrability = new ShipAttribute("maneuvrability")
        // Ability to fire far and good
        precision = new ShipAttribute("precision")
    }

    /**
     * Set of ShipValue for a ship
     */
    export class ShipValues {
        hull = new ShipValue("hull")
        shield = new ShipValue("shield")
        power = new ShipValue("power")
    }

    /**
     * Static attributes and values object for name queries
     */
    export const SHIP_SKILLS = new ShipSkills();
    export const SHIP_ATTRIBUTES = new ShipAttributes();
    export const SHIP_VALUES = new ShipValues();
}
