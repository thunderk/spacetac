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

        postUnserialize(): void {
            this.workqueue = [];
        }

        // Play a ship turn
        //  This will start asynchronous work. The AI will then call action methods, then advanceToNextShip to
        //  indicate it has finished.
        playShip(ship: Ship): void {
            this.ship = ship;
            this.workqueue = [];
            this.started = (new Date()).getTime();
            this.initWork();
            this.processNextWorkItem();
        }

        // Add a work item to the work queue
        addWorkItem(item: Function, delay: number = null): void {
            if (!this.async) {
                if (item) {
                    item();
                }
                return;
            }

            if (!delay) {
                delay = 100;
            }

            var wrapped = () => {
                if (item) {
                    item();
                }
                this.processNextWorkItem();
            };
            this.workqueue.push(() => {
                setTimeout(wrapped, delay);
            });
        }

        // Initially fill the work queue.
        //  Subclasses MUST reimplement this and call addWorkItem to add work to do.
        protected initWork(): void {
            // Abstract method
        }

        // Process the next work item
        private processNextWorkItem(): void {
            if (this.workqueue.length > 0) {
                // Take the first item
                var item = this.workqueue.shift();
                item();
            } else {
                this.endTurn();
            }
        }

        // Called when we want to end the ship turn
        private endTurn(): void {
            if (this.async) {
                var duration = (new Date()).getTime() - this.started;
                if (duration < 2000) {
                    // Delay, as to make the AI not too fast to play
                    setTimeout(() => {
                        this.endTurn();
                    }, 2000 - duration);
                    return;
                }
            }
            this.ship.endTurn();
            this.ship = null;
            this.fleet.battle.advanceToNextShip();
        }
    }
}
