/// <reference path="AbstractAI.ts"/>
/// <reference path="Maneuver.ts"/>
module TS.SpaceTac {

    export type TacticalProducer = Iterator<Maneuver>;
    export type TacticalEvaluator = (maneuver: Maneuver) => number;

    /**
     * AI that applies a set of tactical rules
     * 
     * It uses a set of producers (to propose new maneuvers), and evaluators (to choose the best maneuver).
     * 
     * As much work as possible is done using iterators, without materializing every possibilities.
     */
    export class TacticalAI extends AbstractAI {
        private producers: TacticalProducer[] = []
        private evaluators: TacticalEvaluator[] = []

        private best: Maneuver | null
        private best_score: number

        protected initWork(delay?: number): void {
            this.best = null;
            this.best_score = -Infinity;

            this.producers = this.getDefaultProducers();
            this.evaluators = this.getDefaultEvaluators();

            this.addWorkItem(() => this.unitWork(), delay);
        }

        /**
         * Evaluate a single maneuver
         */
        evaluate(maneuver: Maneuver) {
            return sum(this.evaluators.map(evaluator => evaluator(maneuver)));
        }

        /**
         * Single unit of work => produce a batch of maneuvers and evaluate them
         * 
         * The best produced maneuver (highest evaluation score) is kept to be played.
         * If two maneuvers have nearly the same score, the best one is randomly chosen.
         */
        private unitWork() {
            let done = 0;

            while (done < 1000 && this.producers.length > 0) {
                // Produce a maneuver
                let maneuver: Maneuver | null = null;
                let producer = this.producers.shift();
                if (producer) {
                    [maneuver, producer] = producer();
                }

                if (maneuver) {
                    if (producer) {
                        this.producers.push(producer);
                    }

                    // Evaluate the maneuver
                    let score = this.evaluate(maneuver);
                    //console.debug("AI evaluation", maneuver, score);
                    if ((Math.abs(score - this.best_score) < 0.0001 && this.random.bool()) || score > this.best_score) {
                        this.best = maneuver;
                        this.best_score = score;
                    }
                }

                done += 1;
            }

            // Continue or stop
            if (this.producers.length > 0 && this.getDuration() < 8000) {
                this.addWorkItem(() => this.unitWork());
            } else if (this.best) {
                console.log("AI maneuver", this.best, this.best_score);
                this.best.apply();
                if (this.ship.playing) {
                    this.initWork(2000);
                }
            }
        }

        /**
         * Get the default set of maneuver producers
         */
        getDefaultProducers() {
            let producers = [
                TacticalAIHelpers.produceEndTurn,
                TacticalAIHelpers.produceDirectShots,
                TacticalAIHelpers.produceBlastShots,
                TacticalAIHelpers.produceDroneDeployments,
                TacticalAIHelpers.produceRandomMoves,
            ]
            return producers.map(producer => producer(this.ship, this.ship.getBattle() || new Battle()));
        }

        /**
         * Get the default set of maneuver evaluators
         */
        getDefaultEvaluators() {
            let scaled = (evaluator: (...args: any[]) => number, factor: number) => (...args: any[]) => factor * evaluator(...args);
            let evaluators = [
                scaled(TacticalAIHelpers.evaluateTurnCost, 3),
                scaled(TacticalAIHelpers.evaluateDamageToEnemy, 20),
                scaled(TacticalAIHelpers.evaluateClustering, 8),
                scaled(TacticalAIHelpers.evaluatePosition, 1),
                scaled(TacticalAIHelpers.evaluateIdling, 5),
            ]

            // TODO evaluator typing is lost
            return evaluators.map(evaluator => ((maneuver: Maneuver) => evaluator(this.ship, this.ship.getBattle(), maneuver)));
        }
    }
}
