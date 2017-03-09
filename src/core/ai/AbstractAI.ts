module TS.SpaceTac {
    // Base class for all Artificial Intelligence interaction
    export class AbstractAI {
        // Name of the AI
        name: string;

        // Current ship being played
        ship: Ship;

        // Time at which work as started
        started: number;

        // Random generator, if needed
        random: RandomGenerator;

        // Timer for scheduled calls
        timer: Timer;

        // Queue of work items to process
        //  Work items will be called successively, leaving time for other processing between them.
        //  So work items should always be as short as possible.
        //  When the queue is empty, the ship will end its turn.
        private workqueue: Function[];

        constructor(ship: Ship, timer = Timer.global, name?: string) {
            this.name = name || classname(this);
            this.ship = ship;
            this.workqueue = [];
            this.random = RandomGenerator.global;
            this.timer = timer;
        }

        toString = () => this.name;

        // Play a ship turn
        //  This will start asynchronous work. The AI will then call action methods, then advanceToNextShip to
        //  indicate it has finished.
        play(): void {
            this.workqueue = [];
            this.started = (new Date()).getTime();

            if (!this.ship.playing) {
                console.error(`${this.name} tries to play a ship out of turn`);
            } else {
                this.initWork();
                if (this.workqueue.length > 0) {
                    this.processNextWorkItem();
                } else {
                    this.endTurn();
                }
            }
        }

        // Add a work item to the work queue
        addWorkItem(item: Function | null, delay = 100): void {
            if (this.timer.isSynchronous()) {
                if (item) {
                    item();
                }
            } else {
                var wrapped = () => {
                    if (item) {
                        item();
                    }
                    this.processNextWorkItem();
                };
                this.workqueue.push(() => this.timer.schedule(delay, wrapped));
            }
        }

        // Initially fill the work queue.
        //  Subclasses MUST reimplement this and call addWorkItem to add work to do.
        protected initWork(): void {
            // Abstract method
        }

        /**
         * Get the time spent thinking by the AI.
         */
        protected getDuration() {
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
                    if (item) {
                        item();
                    }
                }
            } else {
                this.endTurn();
            }
        }

        /**
         * Effectively end the current ship's turn
         */
        private effectiveEndTurn() {
            if (this.workqueue.length > 0) {
                console.error(`${this.name} ends turn, but there is pending work`);
            }

            if (this.ship.playing) {
                let battle = this.ship.getBattle();
                this.ship.endTurn();
                if (battle) {
                    battle.advanceToNextShip();
                }
            } else {
                console.error(`${this.name} tries to end turn of another ship`);
            }
        }

        /**
         * Called when we want the AI decides to end the ship turn
         */
        private endTurn(): void {
            // Delay, as to make the AI not too fast to play
            this.timer.schedule(2000 - this.getDuration(), () => this.effectiveEndTurn());
        }
    }
}
