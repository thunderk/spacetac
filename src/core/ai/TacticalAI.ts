/// <reference path="AbstractAI.ts"/>
/// <reference path="Maneuver.ts"/>
module TS.SpaceTac {

    type TacticalProducer = () => Maneuver | null;
    type TacticalEvaluator = (Maneuver) => number;

    /**
     * AI that applies a set of tactical rules
     * 
     * It uses a set of producers (to propose new maneuvers), and evaluators (to choose the best maneuver).
     */
    export class TacticalAI extends AbstractAI {
        producers: TacticalProducer[] = []
        evaluators: TacticalEvaluator[] = []

        best: Maneuver | null = null;
        best_score = -Infinity;

        protected initWork(): void {
            this.addWorkItem(() => this.unitWork());
        }

        /**
         * Evaluate a single maneuver
         */
        evaluate(maneuver: Maneuver) {
            return sum(this.evaluators.map(evaluator => evaluator(maneuver)));
        }

        /**
         * Single unit of work => produce a single maneuver and evaluate it
         */
        private unitWork() {
            if (this.producers.length == 0) {
                return;
            }

            // Produce a maneuver
            let producer = this.producers.shift();
            let maneuver = producer();

            if (maneuver) {
                this.producers.push(producer);

                // Evaluate the maneuver
                let score = this.evaluate(maneuver);
                if (score > this.best_score) {
                    this.best = maneuver;
                    this.best_score = score;
                }
            }

            // Continue or stop ?
            if (this.producers.length > 0) {
                this.addWorkItem(() => this.unitWork());
            } else if (this.best) {
                // TODO Also apply after a certain time of not finding better
                this.best.apply();
            }
        }
    }
}
