module SpaceTac.Game {
    "use strict";

    // Piece of equipment to attach in slots
    export class Equipment {
        // Actual slot this equipment is attached to
        attached_to: Slot;

        // Type of slot this equipment can fit in
        slot: SlotType;

        // Equipment name
        name: string;

        // Maximal distance allowed to target
        distance: number;

        // Effect area's radius
        blast: number;

        // Duration
        duration: number;

        // Action Points usage
        ap_usage: number;

        // Level requirement
        min_level: number;

        // Minimal attribute to be able to equip this equipment
        requirements: Attribute[];

        // Action associated with this equipment
        action: BaseAction;

        // Permanent effects on the ship that equips the equipment
        permanent_effects: BaseEffect[];

        // Effects on target
        target_effects: BaseEffect[];

        // Basic constructor
        constructor(slot: SlotType = null, name: string = null) {
            this.slot = slot;
            this.name = name;
            this.requirements = [];
            this.permanent_effects = [];
            this.target_effects = [];
        }

        // Returns true if the equipment can be equipped on a ship
        //  This checks *requirements* against the ship capabilities
        canBeEquipped(ship: Ship): boolean {
            if (this.attached_to) {
                return false;
            } else {
                var able = true;
                this.requirements.forEach((cap: Attribute) => {
                    if (ship.attributes.getValue(cap.code) < cap.current) {
                        able = false;
                    }
                });
                return able;
            }
        }

        // Detach from the slot it is attached to
        detach(): void {
            if (this.attached_to) {
                this.attached_to.attached = null;
                this.attached_to = null;
            }
        }
    }
}
