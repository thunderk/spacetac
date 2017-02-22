/// <reference path="AbstractAI.ts"/>
/// <reference path="Maneuver.ts"/>
module TS.SpaceTac {

    type TacticalProducer = () => Maneuver | null;
    type TacticalEvaluator = (Maneuver) => number;

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

        best: Maneuver | null = null
        best_score = -Infinity

        protected initWork(): void {
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
                // TODO If not in range for action, make an approach move
                this.best.apply();
            }
        }

        /**
         * Setup the default set of maneuver producers
         */
        private setupDefaultProducers() {
            this.producers.push(produceDirectWeapon(this.ship, this.ship.getBattle()));
        }

        /**
         * Setup the default set of maneuver evaluators
         */
        private setupDefaultEvaluators() {
        }
    }

    /**
     * Produce all "direct hit" weapon shots.
     */
    export function produceDirectWeapon(ship: Ship, battle: Battle): TacticalProducer {
        let enemies = ifilter(battle.iships(), iship => iship.getPlayer() != ship.getPlayer());
        let weapons = iarray(ship.listEquipment(SlotType.Weapon));
        return imap(icombine(enemies, weapons), ([enemy, weapon]) => new Maneuver(ship, weapon, Target.newFromShip(enemy)));
    }
}
