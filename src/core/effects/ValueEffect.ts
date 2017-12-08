/// <reference path="BaseEffect.ts"/>

module TK.SpaceTac {
    function strval(value: number) {
        return `${value > 0 ? "+" : "-"}${Math.abs(value)}`;
    }

    /**
     * Effect to add (or subtract if negative) an amount to a ship value.
     * 
     * The effect is immediate and permanent.
     */
    export class ValueEffect extends BaseEffect {
        // Affected value
        valuetype: keyof ShipValues

        // Value to add (or subtract if negative), when the effect is applied to a ship
        value_on: number

        // Value to add (or subtract if negative), when the effect is removed from a ship
        value_off: number

        // Value to add (or subtract if negative), when the effect is active on a ship starting its turn
        value_start: number

        // Value to add (or subtract if negative), when the effect is active on a ship ending its turn
        value_end: number

        constructor(valuetype: keyof ShipValues, value_on = 0, value_off = 0, value_start = 0, value_end = 0) {
            super("value");

            this.valuetype = valuetype;
            this.value_on = value_on;
            this.value_off = value_off;
            this.value_start = value_start;
            this.value_end = value_end;
        }

        getOnDiffs(ship: Ship, source: Ship | Drone, success: number): BaseBattleDiff[] {
            if (this.value_on) {
                return ship.getValueDiffs(this.valuetype, this.value_on, true);
            } else {
                return [];
            }
        }

        getOffDiffs(ship: Ship): BaseBattleDiff[] {
            if (this.value_off) {
                return ship.getValueDiffs(this.valuetype, this.value_off, true);
            } else {
                return [];
            }
        }

        getTurnStartDiffs(ship: Ship): BaseBattleDiff[] {
            if (this.value_start) {
                return ship.getValueDiffs(this.valuetype, this.value_start, true);
            } else {
                return [];
            }
        }

        getTurnEndDiffs(ship: Ship): BaseBattleDiff[] {
            if (this.value_end) {
                return ship.getValueDiffs(this.valuetype, this.value_end, true);
            } else {
                return [];
            }
        }

        isBeneficial(): boolean {
            if (this.value_off < -this.value_on || this.value_end < -this.value_start) {
                // after value is lower than before
                return false;
            } else if ((this.value_off && this.value_off == -this.value_on) || (this.value_end && this.value_end == -this.value_start)) {
                return this.value_on > 0 || this.value_start > 0;
            } else {
                return this.value_on > 0 || this.value_off > 0 || this.value_start > 0 || this.value_end > 0;
            }
        }

        getFullCode(): string {
            return `${this.code}-${this.valuetype}`;
        }

        getDescription(): string {
            let attrname = SHIP_VALUES_NAMES[this.valuetype];

            let parts: string[] = [];

            if (this.value_on) {
                if (this.value_off == -this.value_on) {
                    parts.push(`${strval(this.value_on)} while active`);
                } else {
                    if (this.value_off) {
                        parts.push(`${strval(this.value_on)} on`);
                        parts.push(`${strval(this.value_off)} off`);
                    } else {
                        parts.push(strval(this.value_on));
                    }
                }
            }

            if (this.value_start) {
                if (this.value_end == -this.value_start) {
                    parts.push(`${strval(this.value_start)} during turn`);
                } else {
                    parts.push(`${strval(this.value_start)} on turn start`);
                    if (this.value_end) {
                        parts.push(`${strval(this.value_end)} on turn end`);
                    }
                }
            } else if (this.value_end) {
                parts.push(`${strval(this.value_end)} on turn end`);
            }

            if (this.value_off && !this.value_on) {
                parts.push(`${strval(this.value_off)} when removed`);
            }

            if (parts.length) {
                return `${attrname} ${parts.join(', ')}`;
            } else {
                return "no effect";
            }
        }
    }
}
