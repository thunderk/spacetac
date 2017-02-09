module TS.SpaceTac {
    // Log of a battle
    //  This keeps track of all events in a battle
    //  It also allows to register a callback to receive these events
    export class BattleLog {
        // Full list of battle events
        events: BaseLogEvent[];

        // List of subscribers
        private subscribers: Function[];

        // List of event codes to ignore
        private filters: string[];

        // Create an initially empty log
        constructor() {
            this.events = [];
            this.subscribers = [];
            this.filters = [];
        }

        postSerialize(fields: any): void {
            fields.subscribers = [];
        }

        // Clear the stored events
        clear(): void {
            this.events = [];
        }

        // Add a battle event to the log
        add(event: BaseLogEvent): void {
            // Apply filters
            var filtered = false;
            this.filters.forEach((code: string) => {
                if (event.code === code) {
                    filtered = true;
                }
            });
            if (filtered) {
                return;
            }

            this.events.push(event);

            this.subscribers.forEach((subscriber: Function) => {
                subscriber(event);
            });
        }

        // Filter out a type of event
        addFilter(event_code: string): void {
            this.filters.push(event_code);
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
