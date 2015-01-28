module SpaceTac.Game {
    "use strict";

    // Piece of equipment to attach in slots
    export class Equipment {
        // Type of slot this equipment will fit in
        slot: SlotType;

        // Equipment name
        name: string;

        // Distance to target
        distance: number;

        // Effect area's radius
        blast: number;

        // Duration
        duration: number;

        // Action Points usage
        ap_usage: number;

        // Level requirement
        min_level: number;

        // Action associated with this equipment
        action: BaseAction;

        // Permanent effects
        permanent_effects: BaseEffect[];

        // Effects on target
        target_effects: BaseEffect[];

        // Basic constructor
        constructor() {
            this.permanent_effects = [];
            this.target_effects = [];
        }
    }
}
