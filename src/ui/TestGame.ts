/// <reference path="../common/Testing.ts" />

module TK.SpaceTac.UI.Specs {
    /**
     * Class to hold references to test objects (used as singleton in "testing" blocks)
     * 
     * Attributes should only be accessed from inside corresponding "test.case" blocks (they are initialized by the setup).
     */
    export class TestGame<T extends Phaser.Scene> {
        check!: TestContext
        ui!: MainUI
        view!: T
        multistorage!: Multi.FakeRemoteStorage
        clock: FakeClock
        time = 0

        constructor(test: TestSuite) {
            this.clock = test.clock();
        }

        /**
         * Advance the time in the view and fake testing clock
         */
        clockForward(milliseconds: number) {
            this.time += milliseconds;
            this.clock.forward(milliseconds);
            this.ui.headlessStep(this.time, milliseconds);
        }
    }

    /**
     * Setup a headless test UI, with a single view started.
     */
    export function setupSingleView<T extends Phaser.Scene & { create: Function }>(test: TestSuite, buildView: () => [T, object]) {
        let testgame = new TestGame<T>(test);

        test.asetup(() => new Promise((resolve, reject) => {
            let check = new TestContext();  // TODO Should be taken from test suite
            check.patch(console, "log", null);
            check.patch(console, "warn", null);

            testgame.ui = new MainUI(true);
            testgame.check = check;

            let [scene, scenedata] = buildView();

            if (scene instanceof BaseView) {
                testgame.multistorage = new Multi.FakeRemoteStorage();
                let connection = new Multi.Connection(RandomGenerator.global.id(12), testgame.multistorage);
                check.patch(scene as BaseView, "getConnection", () => connection);
            }

            let orig_create = bound(scene, "create");
            check.patch(scene, "create", () => {
                orig_create();
                resolve();
            });

            testgame.ui.scene.add("test", scene, true, scenedata);

            testgame.view = scene;
        }), () => new Promise((resolve) => {
            testgame.ui.events.on("destroy", () => resolve());
            testgame.ui.destroy(true);
        }));

        return testgame;
    }

    /**
     * Test setup of an empty BaseView
     */
    export function setupEmptyView(test: TestSuite): TestGame<BaseView> {
        return setupSingleView(test, () => {
            return [new BaseView({}), {}];
        });
    }

    /**
     * Test setup of a battleview bound to a battle, to be called inside a "describe" block.
     */
    export function setupBattleview(test: TestSuite): TestGame<BattleView> {
        return setupSingleView(test, () => {
            let view = new BattleView({});
            view.splash = false;

            let battle = Battle.newQuickRandom();
            let player = new Player();
            nn(battle.playing_ship).fleet.setPlayer(player);

            return [view, { player, battle }];
        });
    }

    /**
     * Test setup of a mapview bound to a universe, to be called inside a "describe" block.
     */
    export function setupMapview(test: TestSuite): TestGame<UniverseMapView> {
        return setupSingleView(test, () => {
            let mapview = new UniverseMapView({});
            let session = new GameSession();
            session.startNewGame();

            return [mapview, { universe: session.universe, player: session.player }];
        });
    }

    /**
     * Crawn through the children of a node
     */
    export function crawlChildren(node: UIContainer, recursive: boolean, callback: (child: any) => void): void {
        node.list.forEach(child => {
            callback(child);
            if (recursive && child instanceof UIContainer) {
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
            if (child instanceof UIImage) {
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
            if (child instanceof UIText) {
                result.push(child.text || null);
            }
        });
        return result;
    }

    /**
     * Check a given text node
     */
    export function checkText(check: TestContext, node: any, content: string): void {
        if (check.instance(node, UIText, "node should be an UIText")) {
            check.equals(node.text, content);
        }
    }

    /**
     * Check a simulation of a tweened property
     */
    export function checkTween<T, P extends keyof T>(game: TestGame<any>, obj: T, property: P, expected: number[]): void {
        let tweendata = game.view.animations.simulate(obj, property, expected.length);
        game.check.equals(tweendata.length, expected.length, "number of points");
        expected.forEach((value, idx) => {
            game.check.nears(tweendata[idx], value, undefined, `point ${idx}`);
        });
    }

    /**
     * Simulate a click on a button
     */
    export function testClick(button: UIButton): void {
        button.emit("pointerdown");
        button.emit("pointerup");
    }
}
