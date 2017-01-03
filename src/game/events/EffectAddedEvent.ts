/// <reference path="BaseLogEvent.ts"/>

module SpaceTac.Game {
    // Event logged when a TemporaryEffect is added to a ship
    export class EffectAddedEvent extends BaseLogEvent {
        // Pointer to the effect
        effect: TemporaryEffect;

        constructor(ship: Ship, effect: TemporaryEffect) {
            super("effectadd", ship);

            this.effect = effect;
        }
    }
}
