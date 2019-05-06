module TK {
    /**
     * Client for Toggle object, allowing to manipulate it
     * 
     * *state* may be:
     *   - a boolean to require on or off
     *   - a number to require on for the duration in milliseconds
     *   - undefined to switch between on and off (based on the client state, not the toggle state)
     * 
     * The function returns the actual state after applying the requirement
     */
    export type ToggleClient = (state?: boolean | number) => boolean

    /**
     * A toggle between two states (on and off).
     * 
     * A toggle will be on if at least one ToggleClient requires it to be on.
     */
    export class Toggle {
        private on: Function
        private off: Function
        private status = false
        private clients: string[] = []
        private scheduled: { [client: string]: any } = {}
        private timer = Timer.global

        constructor(on: Function = () => null, off: Function = () => null) {
            this.on = on;
            this.off = off;
        }

        /**
         * Check if the current state is on
         */
        isOn(): boolean {
            return this.status;
        }

        /**
         * Register a client to manipulate the toggle's state
         */
        manipulate(client: string): ToggleClient {
            return state => {
                if (this.scheduled[client]) {
                    this.timer.cancel(this.scheduled[client]);
                    this.scheduled[client] = null;
                }

                if (typeof state == "undefined") {
                    if (contains(this.clients, client)) {
                        this.stop(client);
                    } else {
                        this.start(client);
                    }
                } else if (typeof state == "number") {
                    if (state > 0) {
                        this.start(client);
                        this.scheduled[client] = this.timer.schedule(state, () => this.stop(client));
                    } else {
                        this.stop(client);
                    }
                } else if (!state) {
                    this.stop(client);
                } else {
                    this.start(client);
                }
                return this.status;
            }
        }

        /**
         * Start the toggle for a client (set the status *on*)
         */
        private start(client: string) {
            add(this.clients, client);
            if (!this.status) {
                this.status = true;
                this.on();
            }
        }

        /**
         * Stop the toggle (set the status *off*)
         */
        private stop(client: string) {
            remove(this.clients, client);
            if (this.status && this.clients.length == 0) {
                this.status = false;
                this.off();
            }
        }
    }
}
