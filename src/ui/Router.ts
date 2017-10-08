module TK.SpaceTac.UI {
    /**
     * Router to other views
     * 
     * It will go to the expected view, by examining the current game session.
     * 
     * If needed, it will go back to the asset loading state.
     */
    export class Router extends Phaser.State {
        create() {
            var ui = <MainUI>this.game;
            var session = ui.session;

            if (!session) {
                // No session, go back to main menu
                this.goToState("mainmenu", AssetLoadingRange.MENU);
            } else if (session.getBattle()) {
                // A battle is raging, go to it
                this.goToState("battle", AssetLoadingRange.BATTLE, session.player, session.getBattle());
            } else if (session.hasUniverse()) {
                if (session.isFleetCreated()) {
                    // Go to the universe map
                    this.goToState("universe", AssetLoadingRange.CAMPAIGN, session.universe, session.player);
                } else {
                    this.goToState("intro", AssetLoadingRange.CAMPAIGN);
                }
            } else {
                // No battle, no universe, go back to menu
                this.goToState("mainmenu", AssetLoadingRange.MENU);
            }
        }

        goToState(name: string, asset_range: AssetLoadingRange, ...args: any[]) {
            if (AssetLoading.isRangeLoaded(this.game, asset_range)) {
                this.game.state.start(name, true, false, ...args);
            } else {
                this.game.state.start("loading", true, false, asset_range);
            }
        }
    }
}
