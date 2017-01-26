/// <reference path="BaseLogEvent.ts"/>

module TS.SpaceTac.Game {
    // Event logged when a sticky effect is added to a ship
    export class EffectDurationChangedEvent extends BaseLogEvent {
        // Pointer to the effect
        effect: StickyEffect;

        // Previous duration
        previous: number;

        constructor(ship: Ship, effect: StickyEffect, previous: number) {
            super("effectduration", ship);

            this.effect = effect;
            this.previous = previous;
        }
    }
}
