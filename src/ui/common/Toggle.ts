module TS.SpaceTac {
    /**
     * A toggle between two states (on and off), with timing features.
     */
    export class Toggle {
        private on: Function
        private off: Function
        private status = false
        private hard = false
        private timer = Timer.global;

        constructor(on: Function, off: Function) {
            this.on = on;
            this.off = off;
        }

        /**
         * Start the toggle (set the status *on*)
         * 
         * If *duration* is set, stop() will automatically be called after these milliseconds.
         * 
         * If *hard* is true, it can only be stopped by a hard stop.
         */
        start(duration = 0, hard = false) {
            if (hard) {
                this.hard = true;
            }
            if (!this.status) {
                this.status = true;
                this.on();
            }
            if (duration) {
                this.timer.schedule(duration, () => this.stop(hard));
            }
        }

        /**
         * Stop the toggle (set the status *off*)
         */
        stop(hard = false) {
            if (this.status) {
                if (hard || !this.hard) {
                    this.status = false;
                    this.hard = false;
                    this.off();
                }
            }
        }

        /**
         * Switch between on and off status
         */
        switch(duration = 0, hard = false) {
            if (this.status) {
                this.stop(hard);
            } else {
                this.start(duration, hard);
            }
        }
    }
}
