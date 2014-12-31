module SpaceTac.Game {
    // Log of a battle
    //  This keeps track of all events in a battle
    //  It also allows to register a callback to receive these events
    export class BattleLog {
        // Full list of battle events
        events: BaseLogEvent[];

        // List of subscribers
        private subscribers: Function[];

        // Create an initially empty log
        constructor() {
            this.events = [];
            this.subscribers = [];
        }

        // Add a battle event to the log
        add(event: BaseLogEvent) {
            this.events.push(event);

            this.subscribers.forEach((subscriber) => {
                subscriber(event);
            });
        }

        // Subscribe a callback to receive further events
        subscribe(callback: (event: BaseLogEvent) => void): Function {
            this.subscribers.push(callback);
            return callback;
        }

        // Unsubscribe a callback
        //  Pass the value returned by 'subscribe' as argument
        unsubscribe(callback: Function): void {
            var index = this.subscribers.indexOf(callback);
            if (index >= 0) {
                this.subscribers.splice(index, 1);
            }
        }
    }
}