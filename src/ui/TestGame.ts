/// <reference path="battle/BattleView.ts"/>
/// <reference path="map/UniverseMapView.ts"/>

module TS.SpaceTac.UI.Specs {
    /**
     * Class to hold references to test objects (used as singleton in "describe" blocks)
     * 
     * Attributes should only be accessed from inside corresponding "it" blocks (they are initialized by the setup).
     */
    export class TestGame {
        ui: MainUI;
        baseview: BaseView;
        battleview: BattleView;
        mapview: UniverseMapView;
    }

    /**
     * Setup a headless test UI, with a single view started.
     */
    export function setupSingleView(buildView: (testgame: TestGame) => [Phaser.State, any[]]) {
        let testgame = new TestGame();

        beforeEach(function (done) {
            spyOn(console, "log").and.stub();
            spyOn(console, "warn").and.stub();

            jasmine.clock().install();

            testgame.ui = new MainUI(true);

            if (testgame.ui.load) {
                spyOn(testgame.ui.load, 'image').and.stub();
                spyOn(testgame.ui.load, 'audio').and.stub();
            }

            let [state, stateargs] = buildView(testgame);

            let orig_create = bound(state, "create");
            spyOn(state, "create").and.callFake(() => {
                orig_create();
                done();
            });

            testgame.ui.state.add("test", state);
            testgame.ui.state.start("test", true, false, ...stateargs);
        });

        afterEach(function () {
            let ui = testgame.ui;
            window.requestAnimationFrame(() => {
                if (ui) {
                    ui.destroy();
                }
            });

            jasmine.clock().uninstall();
        });

        return testgame;
    }

    /**
     * Test setup of an empty BaseView
     */
    export function setupEmptyView(): TestGame {
        return setupSingleView(testgame => {
            testgame.baseview = new BaseView();
            return [testgame.baseview, []];
        });
    }

    /**
     * Test setup of a battleview bound to a battle, to be called inside a "describe" block.
     */
    export function setupBattleview(): TestGame {
        return setupSingleView(testgame => {
            testgame.battleview = new BattleView();

            let battle = Battle.newQuickRandom();
            let player = battle.playing_ship ? battle.playing_ship.getPlayer() : new Player();

            return [testgame.battleview, [player, battle]];
        });
    }

    /**
     * Test setup of a mapview bound to a universe, to be called inside a "describe" block.
     */
    export function setupMapview(): TestGame {
        return setupSingleView(testgame => {
            testgame.mapview = new UniverseMapView();

            let mapview = new UniverseMapView();
            let session = new GameSession();
            session.startNewGame();

            return [testgame.mapview, [session.universe, session.player]];
        });
    }
}
