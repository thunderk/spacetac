module TK {
    /**
     * Timing utility.
     * 
     * This extends the standard setTimeout feature.
     */
    export class Timer {
        // Global timer shared by the whole project
        static global = new Timer();

        // Global synchronous timer for unit tests
        static synchronous = new Timer(true);

        private sync = false;

        private locked = false;

        private scheduled: any[] = [];

        constructor(sync = false) {
            this.sync = sync;
        }

        /**
         * Get the current timestamp in milliseconds
         */
        static nowMs(): number {
            return (new Date()).getTime();
        }

        /**
         * Get the elapsed time in milliseconds since a previous timestamp
         */
        static fromMs(previous: number): number {
            return this.nowMs() - previous;
        }

        /**
         * Return true if the timer is synchronous
         */
        isSynchronous() {
            return this.sync;
        }

        /**
         * Cancel all scheduled calls.
         * 
         * If lock=true, no further scheduling will be allowed.
         */
        cancelAll(lock = false) {
            this.locked = lock;

            let scheduled = this.scheduled;
            this.scheduled = [];

            scheduled.forEach(handle => clearTimeout(handle));
        }

        /**
         * Cancel a scheduled callback.
         */
        cancel(scheduled: any) {
            if (remove(this.scheduled, scheduled)) {
                clearTimeout(scheduled);
            }
        }

        /**
         * Schedule a callback to be called later (time is in milliseconds).
         */
        schedule(delay: number, callback: Function): any {
            if (this.locked) {
                return null;
            } else if (this.sync || delay <= 0) {
                callback();
                return null;
            } else {
                let handle = setTimeout(() => {
                    remove(this.scheduled, handle);
                    callback();
                }, delay);
                add(this.scheduled, handle);
                return handle;
            }
        }

        /**
         * Asynchronously sleep a given time.
         */
        async sleep(ms: number): Promise<any> {
            return new Promise(resolve => {
                this.schedule(ms, resolve);
            });
        }

        postUnserialize() {
            this.scheduled = [];
        }
    }
}
