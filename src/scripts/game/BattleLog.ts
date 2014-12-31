module SpaceTac.Game {
    // Log of a battle
    //  This keeps track of all events in a battle
    //  It also allows to register a callback to receive these events
    export class BattleLog {
        // Full list of battle events
        events: Events.BaseLogEvent[];

        // Create an initially empty log
        constructor() {
            this.events = [];
        }

        // Add a battle event to the log
        add(event: Events.BaseLogEvent) {
            this.events.push(event);
        }
    }
}