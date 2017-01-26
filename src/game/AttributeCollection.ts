/// <reference path="Serializable.ts"/>

module TS.SpaceTac.Game {
    // Collection of several attributes
    export class AttributeCollection extends Serializable {
        // Attributes
        private attributes: Attribute[];

        // Base constructor
        constructor() {
            super();

            this.attributes = [];
        }

        // Get or create an attribute by its code
        getRawAttr(code: AttributeCode): Attribute {
            var attr = this.attributes[code];
            if (!attr) {
                attr = new Attribute(code);
                this.attributes[code] = attr;
            }
            return attr;
        }

        // Get an attribute value
        getValue(attrcode: AttributeCode): number {
            var attr = this.getRawAttr(attrcode);
            return attr.current;
        }

        // Set an attribute value
        setValue(attrcode: AttributeCode, value: number): number {
            var attr = this.getRawAttr(attrcode);
            attr.set(value);
            return attr.current;
        }

        // Add an offset to an attribute value
        addValue(attrcode: AttributeCode, offset: number): number {
            var attr = this.getRawAttr(attrcode);
            attr.add(offset);
            return attr.current;
        }

        // Get an attribute maximum
        getMaximum(attrcode: AttributeCode): number {
            var attr = this.getRawAttr(attrcode);
            return attr.maximal;
        }

        // Set an attribute maximum
        setMaximum(attrcode: AttributeCode, value: number): number {
            var attr = this.getRawAttr(attrcode);
            attr.setMaximal(value);
            return attr.maximal;
        }
    }
}
