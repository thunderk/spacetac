module TK.SpaceTac {
    /**
     * Result of an ended battle
     * 
     * This stores the winner, and the retrievable loot
     */
    export class BattleOutcome {
        // Indicates if the battle is a draw (no winner)
        draw: boolean

        // Victorious fleet
        winner: Fleet | null

        constructor(winner: Fleet | null) {
            this.winner = winner;
            this.draw = winner ? false : true;
        }

        /**
         * Grant experience to participating fleets
         */
        grantExperience(fleets: Fleet[]) {
            fleets.forEach(fleet => {
                let winfactor = (fleet == this.winner) ? 0.03 : (this.draw ? 0.01 : 0.005);
                let enemies = flatten(fleets.filter(f => f !== fleet).map(f => f.ships));
                let difficulty = sum(enemies.map(enemy => 100 + enemy.level.getExperience()));
                fleet.ships.forEach(ship => {
                    ship.level.addExperience(Math.floor(difficulty * winfactor));
                    ship.level.checkLevelUp();
                });
            });
        }
    }
}
