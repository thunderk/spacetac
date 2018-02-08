module TK.SpaceTac {
    /**
     * Cheat helpers for current battle
     * 
     * May be used from the console to help development
     */
    export class BattleCheats {
        battle: Battle
        player: Player

        constructor(battle: Battle, player: Player) {
            this.battle = battle;
            this.player = player;
        }

        /**
         * Make player win the current battle
         */
        win(): void {
            iforeach(this.battle.iships(), ship => {
                if (!this.player.is(ship.fleet.player)) {
                    ship.setDead();
                }
            });
            this.battle.endBattle(this.player.fleet);
        }

        /**
         * Make player lose the current battle
         */
        lose(): void {
            iforeach(this.battle.iships(), ship => {
                if (this.player.is(ship.fleet.player)) {
                    ship.setDead();
                }
            });
            this.battle.endBattle(first(this.battle.fleets, fleet => !this.player.is(fleet.player)));
        }
    }
}
