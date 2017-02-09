/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a sticky effect is added to a ship
    export class EffectAddedEvent extends BaseLogEvent {
        // Pointer to the effect
        effect: StickyEffect;

        constructor(ship: Ship, effect: StickyEffect) {
            super("effectadd", ship);

            this.effect = effect;
        }
    }
}
