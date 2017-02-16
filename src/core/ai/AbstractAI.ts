module TS.SpaceTac {
    // Base class for all Artificial Intelligence interaction
    export class AbstractAI {
        // The fleet controlled by this AI
        fleet: Fleet;

        // Current ship being played
        ship: Ship;

        // Set this to false to force synchronous behavior (playShip will block until finished)
        async: boolean;

        // Time at which work as started
        started: number;

        // Random generator, if needed
        random: RandomGenerator;

        // Timer for scheduled calls
        timer = Timer.global;

        // Queue of work items to process
        //  Work items will be called successively, leaving time for other processing between them.
        //  So work items should always be as short as possible.
        //  When the queue is empty, the ship will end its turn.
        private workqueue: Function[];

        constructor(fleet: Fleet) {
            this.fleet = fleet;
            this.async = true;
            this.workqueue = [];
            this.random = new RandomGenerator();
        }

        // Play a ship turn
        //  This will start asynchronous work. The AI will then call action methods, then advanceToNextShip to
        //  indicate it has finished.
        playShip(ship: Ship, timer: Timer | null = null): void {
            this.ship = ship;
            this.workqueue = [];
            this.started = (new Date()).getTime();
            if (timer) {
                this.timer = timer;
            }
            this.initWork();
            if (this.workqueue.length > 0) {
                this.processNextWorkItem();
            }
        }

        // Add a work item to the work queue
        addWorkItem(item: Function, delay = 100): void {
            if (!this.async) {
                if (item) {
                    item();
                }
                return;
            }

            var wrapped = () => {
                if (item) {
                    item();
                }
                this.processNextWorkItem();
            };
            this.workqueue.push(() => this.timer.schedule(delay, wrapped));
        }

        // Initially fill the work queue.
        //  Subclasses MUST reimplement this and call addWorkItem to add work to do.
        protected initWork(): void {
            // Abstract method
        }

        /**
         * Get the time spent thinking by the AI.
         */
        private getDuration() {
            return (new Date()).getTime() - this.started;
        }

        // Process the next work item
        private processNextWorkItem(): void {
            if (this.workqueue.length > 0) {
                if (this.getDuration() >= 10000) {
                    console.warn("AI take too long to play, forcing turn end");
                    this.effectiveEndTurn();
                } else {
                    // Take the first item
                    var item = this.workqueue.shift();
                    item();
                }
            } else {
                this.endTurn();
            }
        }

        /**
         * Effectively end the current ship's turn
         */
        private effectiveEndTurn() {
            this.ship.endTurn();
            this.ship = null;
            this.fleet.battle.advanceToNextShip();
        }

        /**
         * Called when we want the AI decides to end the ship turn
         */
        private endTurn(): void {
            if (this.async) {
                var duration = this.getDuration();
                if (duration < 2000) {
                    // Delay, as to make the AI not too fast to play
                    this.timer.schedule(2000 - duration, () => this.effectiveEndTurn());
                    return;
                }
            }
            this.effectiveEndTurn();
        }
    }
}
