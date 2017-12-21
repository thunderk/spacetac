/// <reference path="AbstractAI.ts"/>
/// <reference path="Maneuver.ts"/>
module TK.SpaceTac {

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

        protected initWork(): void {
            this.best = null;
            this.best_score = -Infinity;

            this.producers = this.getDefaultProducers();
            this.evaluators = this.getDefaultEvaluators();

            if (this.debug) {
                console.log("AI started", this.name, this.ship.name);
            }
        }

        protected doWorkUnit(): boolean {
            if (this.producers.length > 0 && this.getDuration() < 8000) {
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

                return true;
            } else if (this.best) {
                // Choose the best maneuver so far
                let best_maneuver = this.best;
                if (this.debug) {
                    console.log("AI maneuver", this.name, this.ship.name, best_maneuver, this.best_score);
                }

                if (this.best.action instanceof EndTurnAction) {
                    return false;
                }

                let success = this.feedback(best_maneuver);
                if (success) {
                    // Try to play another maneuver
                    this.initWork();
                    return true;
                } else {
                    return false;
                }
            } else {
                // No maneuver produced
                return false;
            }
        }

        /**
         * Evaluate a single maneuver
         */
        evaluate(maneuver: Maneuver) {
            return sum(this.evaluators.map(evaluator => evaluator(maneuver)));
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
            type EvaluatorHelper = (ship: Ship, battle: Battle, maneuver: Maneuver) => number;

            function scaled(evaluator: EvaluatorHelper, factor: number): EvaluatorHelper {
                return (ship: Ship, battle: Battle, maneuver: Maneuver) => factor * evaluator(ship, battle, maneuver);
            }

            let evaluators: EvaluatorHelper[] = [
                scaled(TacticalAIHelpers.evaluateTurnCost, 1),
                scaled(TacticalAIHelpers.evaluateOverheat, 10),
                scaled(TacticalAIHelpers.evaluateEnemyHealth, 500),
                scaled(TacticalAIHelpers.evaluateAllyHealth, 800),
                scaled(TacticalAIHelpers.evaluateClustering, 3),
                scaled(TacticalAIHelpers.evaluatePosition, 1),
                scaled(TacticalAIHelpers.evaluateIdling, 1),
            ]

            let battle = nn(this.ship.getBattle());
            return evaluators.map(evaluator => ((maneuver: Maneuver) => evaluator(this.ship, battle, maneuver)));
        }
    }
}
