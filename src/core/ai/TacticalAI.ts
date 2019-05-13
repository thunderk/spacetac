/// <reference path="AbstractAI.ts"/>
/// <reference path="Maneuver.ts"/>
module TK.SpaceTac {

    export type TacticalProducer = Iterable<Maneuver>;
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
        private work: Iterator<Maneuver> = IATEND
        private evaluators: TacticalEvaluator[] = []

        private best: Maneuver | null = null
        private best_score = 0
        private produced = 0
        private evaluated = 0

        protected initWork(): void {
            this.best = null;
            this.best_score = -Infinity;

            this.producers = this.getDefaultProducers();
            this.work = ialternate(this.producers)[Symbol.iterator]();
            this.evaluators = this.getDefaultEvaluators();
            this.produced = 0;
            this.evaluated = 0;

            if (this.debug) {
                console.log("AI started", this.name, this.ship.name);
            }
        }

        protected doWorkUnit(): boolean {
            let state = this.work.next();

            if (!state.done && this.getDuration() < 8000) {
                let maneuver = state.value;
                this.produced++;
                if (maneuver.isPossible()) {
                    // Evaluate the maneuver
                    let score = this.evaluate(maneuver);
                    this.evaluated++;
                    if (this.debug) {
                        console.debug("AI evaluation", maneuver, score);
                    }
                    if ((Math.abs(score - this.best_score) < 0.0001 && this.random.bool()) || score > this.best_score) {
                        this.best = maneuver;
                        this.best_score = score;
                    }
                }

                return true;
            } else if (this.best) {
                if (!state.done) {
                    console.warn(`AI did not analyze every possible maneuver (${this.produced} produced, ${this.evaluated} evaluated)`);
                }

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
                TacticalAIHelpers.produceToggleActions,
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
                scaled(TacticalAIHelpers.evaluateOverheat, 3),
                scaled(TacticalAIHelpers.evaluateEnemyHealth, 5),
                scaled(TacticalAIHelpers.evaluateAllyHealth, 20),
                scaled(TacticalAIHelpers.evaluateActiveEffects, 3),
                scaled(TacticalAIHelpers.evaluateClustering, 4),
                scaled(TacticalAIHelpers.evaluatePosition, 0.5),
                scaled(TacticalAIHelpers.evaluateIdling, 2),
            ]

            let battle = nn(this.ship.getBattle());
            return evaluators.map(evaluator => ((maneuver: Maneuver) => evaluator(this.ship, battle, maneuver)));
        }
    }
}
