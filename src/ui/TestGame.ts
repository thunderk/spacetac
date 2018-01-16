/// <reference path="../common/Testing.ts" />

module TK.SpaceTac.UI.Specs {
    let test_ui: MainUI;

    /**
     * Class to hold references to test objects (used as singleton in "describe" blocks)
     * 
     * Attributes should only be accessed from inside corresponding "it" blocks (they are initialized by the setup).
     */
    export class TestGame<T extends Phaser.State> {
        ui: MainUI;
        view: T;
        multistorage: Multi.FakeRemoteStorage;
        state: string;
        clock: FakeClock;
    }

    /**
     * Setup a headless test UI, with a single view started.
     */
    export function setupSingleView<T extends Phaser.State>(test: TestSuite, buildView: () => [T, any[]]) {
        let testgame = new TestGame<T>();

        test.asetup(() => new Promise((resolve, reject) => {
            let check = new TestContext();  // TODO Should be taken from test suite
            check.patch(console, "log", null);
            check.patch(console, "warn", null);

            if (!test_ui) {
                test_ui = new MainUI(true);

                if (test_ui.load) {
                    check.patch(test_ui.load, 'image', null);
                    check.patch(test_ui.load, 'audio', null);
                }
            }

            testgame.ui = test_ui;
            testgame.ui.resetSession();

            let [state, stateargs] = buildView();

            if (state instanceof BaseView) {
                testgame.multistorage = new Multi.FakeRemoteStorage();
                let connection = new Multi.Connection(RandomGenerator.global.id(12), testgame.multistorage);
                check.patch(state, "getConnection", () => connection);
            }

            let orig_create = bound(state, "create");
            check.patch(state, "create", () => {
                orig_create();
                resolve();
            });

            testgame.ui.state.add("test", state);
            testgame.ui.state.start("test", true, false, ...stateargs);

            testgame.state = "test_initial";
            check.patch(testgame.ui.state, "start", (name: string) => {
                testgame.state = name;
            });

            if (!testgame.ui.isBooted) {
                testgame.ui.device.canvas = true;
                testgame.ui.boot();
            }

            testgame.view = state;
        }));

        return testgame;
    }

    /**
     * Test setup of an empty BaseView
     */
    export function setupEmptyView(test: TestSuite): TestGame<BaseView> {
        return setupSingleView(test, () => {
            return [new BaseView(), []];
        });
    }

    /**
     * Test setup of a battleview bound to a battle, to be called inside a "describe" block.
     */
    export function setupBattleview(test: TestSuite): TestGame<BattleView> {
        return setupSingleView(test, () => {
            let view = new BattleView();
            view.splash = false;

            let battle = Battle.newQuickRandom();
            let player = new Player();
            nn(battle.playing_ship).fleet.setPlayer(player);

            return [view, [player, battle]];
        });
    }

    /**
     * Test setup of a mapview bound to a universe, to be called inside a "describe" block.
     */
    export function setupMapview(test: TestSuite): TestGame<UniverseMapView> {
        return setupSingleView(test, () => {
            let mapview = new UniverseMapView();
            let session = new GameSession();
            session.startNewGame();

            return [mapview, [session.universe, session.player]];
        });
    }

    /**
     * Crawn through the children of a node
     */
    export function crawlChildren(node: UIContainer, recursive: boolean, callback: (child: any) => void): void {
        node.children.forEach(child => {
            callback(child);
            if (recursive && (child instanceof Phaser.Group || child instanceof Phaser.Image)) {
                crawlChildren(child, true, callback);
            }
        });
    }

    /**
     * Collect all image codes in a node
     */
    export function collectImages(node: UIContainer, recursive = true): (string | null)[] {
        let result: (string | null)[] = [];
        crawlChildren(node, recursive, child => {
            if (child instanceof Phaser.Image) {
                result.push(child.name || null);
            }
        });
        return result;
    }

    /**
     * Collect all texts in a node
     */
    export function collectTexts(node: UIContainer, recursive = true): (string | null)[] {
        let result: (string | null)[] = [];
        crawlChildren(node, recursive, child => {
            if (child instanceof Phaser.Text) {
                result.push(child.text || null);
            }
        });
        return result;
    }

    /**
     * Check a given text node
     */
    export function checkText(check: TestContext, node: any, content: string): void {
        check.equals(node instanceof Phaser.Text, true);

        let tnode = <Phaser.Text>node;
        check.equals(tnode.text, content);
    }

    /**
     * Check that a layer contains the given component at a given index
     */
    export function checkComponentInLayer(check: TestContext, layer: Phaser.Group, index: number, component: UIComponent) {
        if (index >= layer.children.length) {
            check.fail(`Not enough children in group ${layer.name} for ${component} at index ${index}`);
        } else {
            let child = layer.children[index];
            if (child !== (<any>component).container) {
                check.fail(`${component} is not at index ${index} in ${layer.name}`);
            }
        }
    }

    /**
     * Simulate a click on a button
     */
    export function testClick(button: Phaser.Button): void {
        button.onInputDown.dispatch();
        button.onInputUp.dispatch();
    }
}
