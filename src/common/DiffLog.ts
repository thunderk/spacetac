/**
 * Framework to maintain a state from a log of changes
 * 
 * This allows for repeatable, serializable and revertable state modifications.
 */
module TK {
    /**
     * Base class for a single diff.
     * 
     * This represents an atomic change of the state, that can be applied, or reverted.
     */
    export class Diff<T> {
        /**
         * Apply the diff on a given state
         * 
         * By default it does nothing
         */
        apply(state: T): void {
        }

        /**
         * Reverts the diff from a given state
         * 
         * By default it applies the reverse event
         */
        revert(state: T): void {
            this.getReverse().apply(state);
        }

        /**
         * Get the reverse event
         * 
         * By default it returns a stub event that does nothing
         */
        protected getReverse(): Diff<T> {
            return new Diff<T>();
        }
    }

    /**
     * Collection of sequential diffs
     */
    export class DiffLog<T> {
        private diffs: Diff<T>[] = []

        /**
         * Add a single diff at the end of the log
         */
        add(diff: Diff<T>): void {
            this.diffs.push(diff);
        }

        /**
         * Get the diff at a specific index
         */
        get(idx: number): Diff<T> | null {
            return this.diffs[idx] || null;
        }

        /**
         * Return the total count of diffs
         */
        count(): number {
            return this.diffs.length;
        }

        /**
         * Clean all stored diffs, starting at a given index
         * 
         * The caller should be sure that no log client is beyond the cut index.
         */
        clear(start = 0): void {
            this.diffs = this.diffs.slice(0, start);
        }
    }

    /**
     * Client for a DiffLog, able to go forward or backward in the log, applying diffs as needed
     */
    export class DiffLogClient<T> {
        private state: T
        private log: DiffLog<T>
        private cursor = -1
        private playing = false
        private stopping = false
        private paused = false
        private timer = Timer.global

        constructor(state: T, log: DiffLog<T>) {
            this.state = state;
            this.log = log;
            this.cursor = log.count() - 1;
        }

        /**
         * Returns true if the log is currently playing
         */
        isPlaying(): boolean {
            return this.playing && !this.paused && !this.stopping;
        }

        /**
         * Get the current diff pointed at
         */
        getCurrent(): Diff<T> | null {
            return this.log.get(this.cursor);
        }

        /**
         * Push a diff to the underlying log, applying it immediately if required
         */
        add(diff: Diff<T>, apply = true): void {
            this.log.add(diff);
            if (apply) {
                this.jumpToEnd();
            }
        }

        /**
         * Apply the underlying log continuously, until *stop* is called
         * 
         * If *after_apply* is provided, it will be called after each diff is applied, and waited upon before resuming
         */
        async play(after_apply?: (diff: Diff<T>) => Promise<void>): Promise<void> {
            if (this.playing) {
                console.error("DiffLogClient already playing", this);
                return;
            }

            this.playing = true;
            this.stopping = false;

            while (this.playing) {
                if (!this.paused) {
                    let diff = this.forward();
                    if (diff && after_apply) {
                        await after_apply(diff);
                    }
                }

                if (this.atEnd()) {
                    if (this.stopping) {
                        break;
                    } else {
                        await this.timer.sleep(50);
                    }
                }
            }
        }

        /**
         * Stop the previous *play*
         */
        stop(immediate = true): void {
            if (!this.playing) {
                console.error("DiffLogClient not playing", this);
                return;
            }

            if (immediate) {
                this.playing = false;
            }
            this.stopping = true;
        }

        /**
         * Make a step backward in time (revert one diff)
         */
        backward(): Diff<T> | null {
            if (!this.atStart()) {
                this.cursor -= 1;
                this.paused = true;

                let diff = this.log.get(this.cursor + 1);
                if (diff) {
                    diff.revert(this.state);
                }
                return diff;
            } else {
                return null;
            }
        }

        /**
         * Make a step forward in time (apply one diff)
         */
        forward(): Diff<T> | null {
            if (!this.atEnd()) {
                this.cursor += 1;
                if (this.atEnd()) {
                    this.paused = false;
                }

                let diff = this.log.get(this.cursor);
                if (diff) {
                    diff.apply(this.state);
                }
                return diff;
            } else {
                return null;
            }
        }

        /**
         * Jump to the start of the log
         * 
         * This will rewind all applied event
         */
        jumpToStart() {
            while (!this.atStart()) {
                this.backward();
            }
        }

        /**
         * Jump to the end of the log
         * 
         * This will apply all remaining event
         */
        jumpToEnd() {
            while (!this.atEnd()) {
                this.forward();
            }
        }

        /**
         * Check if we are currently at the start of the log
         */
        atStart(): boolean {
            return this.cursor < 0;
        }

        /**
         * Check if we are currently at the end of the log
         */
        atEnd(): boolean {
            return this.cursor >= this.log.count() - 1;
        }

        /**
         * Truncate all diffs after the current position
         * 
         * This is useful when using the log to "undo" something
         */
        truncate(): void {
            this.log.clear(this.cursor + 1);
        }
    }
}
