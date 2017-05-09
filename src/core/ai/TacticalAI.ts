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
        producers: TacticalProducer[] = []
        evaluators: TacticalEvaluator[] = []

        best: Maneuver | null
        best_score: number

        protected initWork(): void {
            this.best = null;
            this.best_score = -Infinity;

            if (this.producers.length == 0) {
                this.setupDefaultProducers();
            }

            if (this.evaluators.length == 0) {
                this.setupDefaultEvaluators();
            }

            this.addWorkItem(() => this.unitWork());
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
                    //console.log(maneuver, score);
                    if ((Math.abs(score - this.best_score) < 0.0001 && this.random.bool()) || score > this.best_score) {
                        this.best = maneuver;
                        this.best_score = score;
                    }
                }

                done += 1;
            }

            // Continue or stop
            if (this.producers.length > 0 && this.getDuration() < 3000) {
                this.addWorkItem(() => this.unitWork());
            } else if (this.best) {
                this.best.apply();
            }
        }

        /**
         * Setup the default set of maneuver producers
         */
        private setupDefaultProducers() {
            let producers = [
                TacticalAIHelpers.produceDirectShots,
                TacticalAIHelpers.produceBlastShots,
                TacticalAIHelpers.produceDroneDeployments,
                TacticalAIHelpers.produceRandomMoves,
            ]
            producers.forEach(producer => this.producers.push(producer(this.ship, this.ship.getBattle() || new Battle())));
        }

        /**
         * Setup the default set of maneuver evaluators
         */
        private setupDefaultEvaluators() {
            let scaled = (evaluator: (...args: any[]) => number, factor: number) => (...args: any[]) => factor * evaluator(...args);
            let evaluators = [
                scaled(TacticalAIHelpers.evaluateTurnCost, 1),
                scaled(TacticalAIHelpers.evaluateDamageToEnemy, 30),
                scaled(TacticalAIHelpers.evaluateClustering, 8),
                scaled(TacticalAIHelpers.evaluatePosition, 1),
                scaled(TacticalAIHelpers.evaluateIdling, 5),
            ]
            // TODO evaluator typing is lost
            evaluators.forEach(evaluator => this.evaluators.push((maneuver: Maneuver) => evaluator(this.ship, this.ship.getBattle(), maneuver)));
        }
    }
}
