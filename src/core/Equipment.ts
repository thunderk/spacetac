module TS.SpaceTac {
    // Piece of equipment to attach in slots
    export class Equipment {
        // Type of slot this equipment can fit in
        slot_type: SlotType | null;

        // Actual slot this equipment is attached to
        attached_to: Slot | null = null;

        // Identifiable equipment code (may be used by UI to customize visual effects)
        code: string;

        // Equipment name
        name: string;

        // Minimum skills to be able to equip this
        requirements: { [key: string]: number };

        // Permanent effects on the ship that equips this
        effects: BaseEffect[];

        // Action available when equipped
        action: BaseAction;

        // Usage made of this equipment (will lower the sell price)
        usage: number;

        // Basic constructor
        constructor(slot: SlotType | null = null, code = "equipment") {
            this.slot_type = slot;
            this.code = code;
            this.name = code;
            this.requirements = {};
            this.effects = [];
            this.action = new BaseAction("nothing", "Do nothing", false);
        }

        jasmineToString() {
            return this.attached_to ? `${this.attached_to.ship.name} - ${this.name}` : this.name;
        }

        /**
         * Get the minimum level at which the requirements in skill may be fulfilled.
         * 
         * This is informative and is not directly enforced. It will only be enforced by skills requirements.
         */
        getMinimumLevel(): number {
            let points = sum(values(this.requirements));
            return ShipLevel.getLevelForPoints(points);
        }

        /**
         * Returns true if the equipment can be equipped on a ship.
         * 
         * This checks *requirements* against the ship skills.
         * 
         * This does not check where the equipment currently is (except if is it already attached and should be detached first).
         */
        canBeEquipped(ship: Ship): boolean {
            if (this.attached_to) {
                return false;
            } else {
                var able = true;
                iteritems(this.requirements, (attr, minvalue) => {
                    if (ship.getAttribute(<keyof ShipAttributes>attr) < minvalue) {
                        able = false;
                    }
                });
                return able;
            }
        }

        /**
         * Detach from the slot it is attached to
         */
        detach(): void {
            if (this.attached_to) {
                this.attached_to.attached = null;
                this.attached_to = null;
            }
        }

        /**
         * Get a human readable description of the effects of this equipment
         */
        getActionDescription(): string {
            let parts: string[] = [];

            this.effects.forEach(effect => {
                parts.push(`- Equip: ${effect.getDescription()}`);
            });

            this.action.getEffectsDescription().forEach(desc => {
                parts.push(`- ${this.action.name}: ${desc}`);
            });

            return parts.length > 0 ? parts.join("\n") : "does nothing";
        }
    }
}
