module TS.SpaceTac {
    /**
     * Function called to inform subscribers of new events.
     */
    export type LogSubscriber = (event: BaseLogEvent) => any;

    // Log of a battle
    //  This keeps track of all events in a battle
    //  It also allows to register a callback to receive these events
    export class BattleLog {
        // Full list of battle events
        events: BaseLogEvent[];

        // List of subscribers
        private subscribers: LogSubscriber[];

        // List of event codes to ignore
        private filters: string[];

        // Create an initially empty log
        constructor() {
            this.events = [];
            this.subscribers = [];
            this.filters = [];
        }

        postUnserialize(): void {
            this.subscribers = [];
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

            this.subscribers.forEach(subscriber => {
                subscriber(event);
            });
        }

        // Filter out a type of event
        addFilter(event_code: string): void {
            this.filters.push(event_code);
        }

        // Subscribe a callback to receive further events
        subscribe(callback: LogSubscriber): LogSubscriber {
            this.subscribers.push(callback);
            return callback;
        }

        // Unsubscribe a callback
        //  Pass the value returned by 'subscribe' as argument
        unsubscribe(callback: LogSubscriber): void {
            var index = this.subscribers.indexOf(callback);
            if (index >= 0) {
                this.subscribers.splice(index, 1);
            }
        }
    }
}
