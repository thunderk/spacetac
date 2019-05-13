/// <reference path="../node_modules/phaser/types/phaser.d.ts"/>

declare var global: any;
declare var module: any;

if (typeof window != "undefined") {
    // If jasmine is not present, ignore describe
    (<any>window).describe = (<any>window).describe || function () { };
} else {
    if (typeof global != "undefined") {
        // In node, does not extend Phaser classes
        var handler = {
            get(target: any, name: any): any {
                return new Proxy({}, handler);
            }
        }
        global.Phaser = new Proxy({}, handler);
    }

    if (typeof module != "undefined") {
        module.exports = { TK };
    }
}

module TK.SpaceTac {
    // Router between game views
    export class MainUI extends Phaser.Game {
        // Current game session
        session: GameSession
        session_token: string | null

        // Game options
        options!: UI.GameOptions

        // Storage used
        storage: Storage

        // Debug mode
        debug = false

        // Current scaling
        scaling = 1

        constructor(private testmode = false) {
            super({
                width: 1920,
                height: 1080,
                type: Phaser.AUTO,  // cannot really use HEADLESS because of bugs
                backgroundColor: '#000000',
                parent: '-space-tac',
                disableContextMenu: true,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                },
            });

            this.storage = localStorage;

            this.session = new GameSession();
            this.session_token = null;

            if (!testmode) {
                this.events.on("blur", () => {
                    this.scene.scenes.forEach(scene => this.scene.pause(scene));
                });
                this.events.on("focus", () => {
                    this.scene.scenes.forEach(scene => this.scene.resume(scene));
                });

                this.scene.add('boot', UI.Boot);
                this.scene.add('loading', UI.AssetLoading);
                this.scene.add('mainmenu', UI.MainMenu);
                this.scene.add('router', UI.Router);
                this.scene.add('battle', UI.BattleView);
                this.scene.add('intro', UI.IntroView);
                this.scene.add('creation', UI.FleetCreationView);
                this.scene.add('universe', UI.UniverseMapView);

                this.goToScene('boot');
            }
        }

        boot() {
            super.boot();
            this.options = new UI.GameOptions(this);
        }

        get isTesting(): boolean {
            return this.testmode;
        }

        /**
         * Get the audio manager for current scene
         */
        get audio(): UI.Audio {
            let scene = this.getActiveScene();
            if (scene) {
                return scene.audio;
            } else {
                return new UI.Audio(null);
            }
        }

        /**
         * Get the currently active scene
         */
        getActiveScene(): UI.BaseView | null {
            let active = first(<string[]>keys(this.scene.scenes), key => this.scene.isActive(key));
            if (active) {
                let scene = this.scene.getScene(active);
                return (scene instanceof UI.BaseView) ? scene : null;
            } else if (this.isTesting) {
                return this.scene.scenes[0];
            } else {
                return null;
            }
        }

        /**
         * Reset the game session
         */
        resetSession(): void {
            this.session = new GameSession();
            this.session_token = null;
        }

        /**
         * Display a popup message in current view
         */
        displayMessage(message: string) {
            iteritems(<any>this.scene.keys, (key: string, scene: UI.BaseView) => {
                if (scene.messages && this.scene.isVisible(key)) {
                    scene.messages.addMessage(message);
                }
            });
        }

        /**
         * Change the active scene
         */
        goToScene(name: string): void {
            keys(this.scene.keys).forEach(key => {
                if (this.scene.isActive(key) || this.scene.isVisible(key)) {
                    this.scene.stop(key);
                }
            });
            this.scene.start(name);
        }

        /**
         * Quit the current session, and go back to mainmenu
         */
        quitGame() {
            this.resetSession();
            this.goToScene('router');
        }

        /**
         * Save current game in local browser storage
         */
        saveGame(name = "spacetac-savegame"): boolean {
            if (typeof this.storage != "undefined") {
                this.storage.setItem(name, this.session.saveToString());
                this.displayMessage("Game saved");
                return true;
            } else {
                this.displayMessage("Your browser does not support saving");
                return false;
            }
        }

        /**
         * Set the current game session, and redirect to view router
         */
        setSession(session: GameSession, token?: string): void {
            this.session = session;
            this.session_token = token || null;
            this.goToScene("router");
        }

        /**
         * Load current game from local browser storage
         */
        loadGame(name = "spacetac-savegame"): boolean {
            if (typeof this.storage != "undefined") {
                var loaded = this.storage.getItem(name);
                if (loaded) {
                    this.session = GameSession.loadFromString(loaded);
                    this.session_token = null;
                    console.log("Game loaded");
                    return true;
                } else {
                    console.warn("No saved game found");
                    return false;
                }
            } else {
                console.error("localStorage not available");
                return false;
            }
        }

        /**
         * Get an hopefully unique device identifier
         */
        getDeviceId(): string | null {
            if (this.storage) {
                const key = "spacetac-device-id";
                let stored = this.storage.getItem(key);
                if (stored) {
                    return stored;
                } else {
                    let generated = RandomGenerator.global.id(20);
                    this.storage.setItem(key, generated);
                    return generated;
                }
            } else {
                return null;
            }
        }

        /**
         * Check if the game is currently fullscreen
         */
        isFullscreen(): boolean {
            return this.scale.isFullscreen;
        }

        /**
         * Toggle fullscreen mode.
         * 
         * Returns true if the result is fullscreen
         */
        toggleFullscreen(active: boolean | null = null): boolean {
            if (active === false || (active !== true && this.isFullscreen())) {
                this.scale.stopFullscreen();
                return false;
            } else {
                this.scale.startFullscreen();
                return true;
            }
        }
    }
}
