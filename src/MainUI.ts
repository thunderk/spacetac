/// <reference path="lib/phaser.d.ts"/>

if (typeof window != "undefined") {
    (<any>window).describe = (<any>window).describe || function () { };
}

module TK.SpaceTac {
    // Router between game views
    export class MainUI extends Phaser.Game {
        // Current game session
        session: GameSession
        session_token: string | null

        // Audio manager
        audio: UI.Audio

        // Game options
        options: UI.GameOptions

        // Storage used
        storage: Storage

        // Headless mode
        headless: boolean

        constructor(headless: boolean = false) {
            super(1920, 1080, headless ? Phaser.HEADLESS : Phaser.AUTO, '-space-tac');

            this.headless = headless;

            this.audio = new UI.Audio(this);
            this.storage = localStorage;

            this.session = new GameSession();
            this.session_token = null;

            if (!headless) {
                this.state.onStateChange.add((state: string) => console.log(`View change: ${state}`));

                this.state.add('boot', UI.Boot);
                this.state.add('preload', UI.Preload);
                this.state.add('mainmenu', UI.MainMenu);
                this.state.add('router', UI.Router);
                this.state.add('battle', UI.BattleView);
                this.state.add('intro', UI.IntroView);
                this.state.add('universe', UI.UniverseMapView);

                this.state.start('boot');
            }
        }

        boot() {
            if (this.renderType == Phaser.HEADLESS) {
                this.headless = true;
            }

            super.boot();

            if (!this.headless) {
                this.plugins.add((<any>Phaser.Plugin).SceneGraph);
            }

            this.audio = new UI.Audio(this);
            this.options = new UI.GameOptions(this);
        }

        /**
         * Display a popup message in current view
         */
        displayMessage(message: string) {
            let state = <UI.BaseView>this.state.getCurrentState();
            if (state) {
                state.messages.addMessage(message);
            }
        }

        /**
         * Quit the current session, and go back to mainmenu
         */
        quitGame() {
            this.session = new GameSession();
            this.session_token = null;
            this.state.start('router');
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
            this.state.start("router");
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
            return this.scale.isFullScreen;
        }

        /**
         * Toggle fullscreen mode.
         * 
         * Returns true if the result is fullscreen
         */
        toggleFullscreen(active: boolean | null = null): boolean {
            if (active === false || (active !== true && this.isFullscreen())) {
                this.scale.stopFullScreen();
                return false;
            } else {
                this.scale.startFullScreen(true);
                return true;
            }
        }
    }
}
