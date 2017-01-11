/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    // Code to identify
    export enum AttributeCode {
        // Initiative level
        Initiative,

        // Hull points (similar to health points in other games)
        Hull,

        // Damage the shield can take
        Shield,

        // Current level of action points
        AP,

        // Action points recovered by turn
        AP_Recovery,

        // Starting action points in a battle
        AP_Initial,

        // Capability level in materials
        Cap_Material,

        // Capability level in energy
        Cap_Energy,

        // Capability level in electronics
        Cap_Electronics,

        // Capability level in human things
        Cap_Human,

        // Capability level in time manipulation
        Cap_Time,

        // Capability level in gravity manipulation
        Cap_Gravity,

        // Miscellaneous attribute
        Misc
    }

    // Value computed from equipment
    //  This value can be altered by effects
    //  Example attributes are health points, action points recovery...
    export class Attribute extends Serializable {
        // Identifying code of this attribute
        code: AttributeCode;

        // Maximal attribute value
        maximal: number;

        // Current attribute value
        current: number;

        // Create an attribute
        constructor(code: AttributeCode = AttributeCode.Misc, current: number = 0, maximal: number = null) {
            super();

            this.code = code;
            this.maximal = maximal;
            this.current = current;
        }

        // Iterator over each code
        static forEachCode(callback: (code: AttributeCode) => void) {
            for (var val in AttributeCode) {
                var parsed = parseInt(val, 10);
                if (!isNaN(parsed)) {
                    callback(<AttributeCode>parsed);
                }
            }
        }

        // Set the maximal value
        setMaximal(value: number): void {
            this.maximal = value;
            this.fix();
        }

        // Get current value
        getValue(): number {
            return Math.floor(this.current);
        }

        // Set an absolute value
        //  Returns true if the value changed
        set(value: number): boolean {
            var old_value = this.current;
            this.current = value;
            this.fix();
            return this.current !== old_value;
        }

        // Add an offset to current value
        //  Returns true if the value changed
        add(value: number): boolean {
            var old_value = this.current;
            this.current += value;
            this.fix();
            return this.current !== old_value;
        }

        // Fix the value to remain lower than maximal, and positive
        private fix(): void {
            if (this.maximal !== null && this.current > this.maximal) {
                this.current = this.maximal;
            }
            if (this.current < 0.0001) {
                this.current = 0;
            }
        }
    }
}
