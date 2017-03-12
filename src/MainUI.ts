/// <reference path="../typings/index.d.ts"/>

if (typeof window != "undefined") {
    (<any>window).describe = (<any>window).describe || function () { };
}

module TS.SpaceTac {
    // Router between game views
    export class MainUI extends Phaser.Game {
        // Current game session
        session: GameSession;

        // Audio manager
        audio: UI.Audio;

        // Storage used
        storage: Storage;

        // Headless mode
        headless: boolean;

        constructor(headless: boolean = false) {
            super(1920, 1080, headless ? Phaser.HEADLESS : Phaser.AUTO, '-space-tac');

            this.headless = headless;

            this.audio = new UI.Audio(this);

            this.storage = localStorage;

            this.session = new GameSession();

            if (!headless) {
                this.state.add('boot', UI.Boot);
                this.state.add('preload', UI.Preload);
                this.state.add('mainmenu', UI.MainMenu);
                this.state.add('router', UI.Router);
                this.state.add('battle', UI.BattleView);
                this.state.add('universe', UI.UniverseMapView);

                this.state.start('boot');
            }
        }

        boot() {
            if (!this.headless) {
                super.boot();
            }
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
         * Load current game from local browser storage
         */
        loadGame(name = "spacetac-savegame"): boolean {
            if (typeof this.storage != "undefined") {
                var loaded = this.storage.getItem(name);
                if (loaded) {
                    this.session = GameSession.loadFromString(loaded);
                    console.log("Game loaded");
                    return true;
                } else {
                    console.error("No saved game found");
                    return false;
                }
            } else {
                console.error("localStorage not available");
                return false;
            }
        }
    }
}
