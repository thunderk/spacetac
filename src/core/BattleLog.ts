module TK.SpaceTac {
    /**
     * Function called to inform subscribers of new events.
     */
    export type LogSubscriber = (event: BaseBattleEvent) => any;

    // Log of a battle
    //  This keeps track of all events in a battle
    //  It also allows to register a callback to receive these events
    export class BattleLog {
        // Full list of battle events
        events: BaseBattleEvent[]

        // List of subscribers
        private subscribers: LogSubscriber[]

        // List of event codes to ignore
        private filters: string[]

        // Indicator that the battle has ended
        private ended = false

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
            this.ended = false;
            this.events = [];
        }

        // Add a battle event to the log
        add(event: BaseBattleEvent): void {
            // Apply filters
            var filtered = false;
            this.filters.forEach(code => {
                if (event.code === code) {
                    filtered = true;
                }
            });
            if (filtered || this.ended) {
                return;
            }

            this.events.push(event);

            this.subscribers.forEach(subscriber => {
                subscriber(event);
            });

            if (event instanceof EndBattleEvent) {
                this.ended = true;
            }
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
