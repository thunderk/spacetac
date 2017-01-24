/// <reference path="BaseEffect.ts"/>

module SpaceTac.Game {
    /**
     * Wrapper around another effect, to make it stick to a ship.
     * 
     * The "effect" is to stick the wrapped effect to the ship, that will be applied in time.
     */
    export class StickyEffect extends BaseEffect {
        // Wrapped effect
        base: BaseEffect;

        // Duration, in number of turns
        duration: number;

        // Apply the effect on stick (doesn't count against duration)
        on_stick: boolean;

        // Apply the effect on turn start instead of end
        on_turn_end: boolean;

        // Base constructor
        constructor(base: BaseEffect, duration = 0, on_stick = false, on_turn_end = false) {
            super(base.code);

            this.base = base;
            this.duration = duration;
            this.on_stick = on_stick;
            this.on_turn_end = on_turn_end;
        }

        getModifiedCopy(modifiers: EffectTemplateModifier[], power: number): BaseEffect {
            let [current, base] = Tools.binpartition(modifiers, modifier => modifier.name == "duration");
            let result = <StickyEffect>super.getModifiedCopy(current, power);
            result.base = result.base.getModifiedCopy(base, power);
            return result;
        }

        applyOnShip(ship: Ship): boolean {
            ship.addStickyEffect(new StickyEffect(this.base, this.duration, this.on_stick, this.on_turn_end));
            if (this.on_stick) {
                this.base.applyOnShip(ship);
            }
            return true;
        }

        private applyOnce(ship: Ship) {
            if (this.duration > 0) {
                this.base.applyOnShip(ship);
                this.duration--;
                ship.addBattleEvent(new EffectDurationChangedEvent(ship, this, this.duration + 1));
            }
        }

        /**
         * Apply the effect at the beginning of the turn, for the ship this effect is sticked to.
         */
        startTurn(ship: Ship) {
            if (!this.on_turn_end) {
                this.applyOnce(ship);
            }
        }

        /**
         * Apply the effect at the end of the turn, for the ship this effect is sticked to.
         */
        endTurn(ship: Ship) {
            if (this.on_turn_end) {
                this.applyOnce(ship);
            }
        }

        isBeneficial(): boolean {
            return this.base.isBeneficial();
        }

        getFullCode(): string {
            return this.base.getFullCode();
        }

        getDescription(): string {
            return this.base.getDescription();
        }
    }
}
