module TK.SpaceTac.UI {
    /**
     * Router to other views
     * 
     * It will go to the expected view, by examining the current game session.
     * 
     * If needed, it will go back to the asset loading state.
     */
    export class Router extends BaseView {
        create() {
            super.create();

            let session = this.session;

            if (session.getBattle()) {
                // A battle is raging, go to it
                this.goToState("battle", AssetLoadingRange.BATTLE, { player: session.player, battle: session.getBattle() });
            } else if (session.hasUniverse()) {
                // Campaign mode
                if (session.isFleetCreated()) {
                    // Go to the universe map
                    this.goToState("universe", AssetLoadingRange.CAMPAIGN, { player: session.player, universe: session.universe });
                } else if (session.isIntroViewed()) {
                    // Build initial fleet
                    this.goToState("creation", AssetLoadingRange.CAMPAIGN);
                } else {
                    // Show intro
                    this.goToState("intro", AssetLoadingRange.CAMPAIGN);
                }
            } else {
                // No battle, no campaign, go back to menu to decide what to do
                this.goToState("mainmenu", AssetLoadingRange.MENU);
            }
        }

        goToState(name: string, asset_range: AssetLoadingRange, data?: object) {
            if (AssetLoading.isRangeLoaded(this.game, asset_range)) {
                this.scene.start(name, data);
            } else {
                this.scene.start("loading", { range: asset_range });
            }
        }
    }
}
