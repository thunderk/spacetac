/// <reference path="Serializable.ts"/>

module SpaceTac.Game {
    // Piece of equipment to attach in slots
    export class Equipment extends Serializable {
        // Actual slot this equipment is attached to
        attached_to: Slot;

        // Type of slot this equipment can fit in
        slot: SlotType;

        // Identifiable equipment code (may be used by UI to customize visual effects)
        code: string;

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
        constructor(slot: SlotType = null, code: string = null) {
            super();

            this.slot = slot;
            this.code = code;
            this.name = code;
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

        // Get a human readable description of the effects of this equipment
        getActionDescription(): string {
            if (this.permanent_effects.length == 0 && this.target_effects.length == 0) {
                return "does nothing";
            } else {
                var result: string[] = [];
                this.target_effects.forEach(effect => {
                    let suffix = this.blast ? `on all ships in ${this.blast}km of impact` : "on target";
                    if (effect instanceof StickyEffect) {
                        suffix = `for ${effect.duration} turn${effect.duration > 1 ? "s" : ""} ${suffix}`;
                    }
                    result.push("- " + effect.getDescription() + " " + suffix);
                });
                return result.join("\n");
            }
        }
    }
}
