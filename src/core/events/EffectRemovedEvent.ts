/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac {
    // Event logged when a sticky effect is removed from a ship
    export class EffectRemovedEvent extends BaseLogEvent {
        // Pointer to the effect
        effect: StickyEffect;

        constructor(ship: Ship, effect: StickyEffect) {
            super("effectdel", ship);

            this.effect = effect;
        }
    }
}
