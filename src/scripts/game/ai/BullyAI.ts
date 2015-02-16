/// <reference path="AbstractAI.ts"/>
module SpaceTac.Game.AI {
    "use strict";

    // Basic Artificial Intelligence, with a tendency to move forward and shoot the nearest enemy
    export class BullyAI extends AbstractAI {
        constructor(fleet: Fleet) {
            super(fleet);
        }
    }
}
