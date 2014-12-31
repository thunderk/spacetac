module SpaceTac.View {
    // Targetting system
    //  Allows to pick a target for a capability
    export class Targetting {
        // Access to the parent battle view
        private battleview: BattleView;

        constructor(battleview: BattleView) {
            this.battleview = battleview;
        }
    }
}