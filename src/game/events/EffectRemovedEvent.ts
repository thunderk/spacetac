/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    // Event logged when a TemporaryEffect is removed from a ship
    export class EffectRemovedEvent extends BaseLogEvent {
        // Pointer to the effect
        effect: TemporaryEffect;

        constructor(ship: Ship, effect: TemporaryEffect) {
            super("effectdel", ship);

            this.effect = effect;
        }
    }
}
