module TK.SpaceTac {
    /**
     * AI processing, either in the current process or in a web worker
     */
    export class AIWorker {
        private battle: Battle;
        private ship: Ship;
        private debug: boolean;

        constructor(battle: Battle, debug = false) {
            this.battle = battle;
            this.ship = nn(battle.playing_ship);
            this.debug = debug;
        }

        /**
         * Process the current playing ship with an AI
         * 
         * This should be done on the real battle state
         */
        static async process(battle: Battle, debug = false): Promise<void> {
            let processing = new AIWorker(battle, debug);
            await processing.processAuto(maneuver => maneuver.apply(battle));
        }

        /**
         * Process AI in a webworker if possible, else do the work in the render thread
         */
        async processAuto(feedback: AIFeedback): Promise<void> {
            if (!this.debug && (<any>window).Worker) {
                await this.processInWorker(feedback);
            } else {
                await this.processHere(feedback);
            }
        }

        /**
         * Process AI in a webworker
         */
        async processInWorker(feedback: AIFeedback): Promise<void> {
            let worker = new Worker('aiworker.js');  // TODO not hard-coded
            let serializer = new Serializer(TK.SpaceTac);
            let promise = new Promise((resolve, reject) => {
                worker.onerror = (error) => {
                    worker.terminate();
                    reject(error);
                };
                worker.onmessage = (message) => {
                    let maneuver = serializer.unserialize(message.data);
                    if (maneuver instanceof Maneuver) {
                        if (this.debug) {
                            console.log("Received from AI worker", maneuver);
                        }
                        let result = maneuver.apply(this.battle);
                        if (!result) {
                            resolve();
                        }
                    } else {
                        worker.terminate();
                        reject("Received something that is not a Maneuver");
                    }
                };
            });
            worker.postMessage(serializer.serialize(this.battle));
            await promise;
        }

        /**
         * Process AI in current thread
         */
        async processHere(feedback: AIFeedback): Promise<void> {
            let ai = new TacticalAI(this.ship, feedback, this.debug);
            await ai.play();
        }
    }
}
