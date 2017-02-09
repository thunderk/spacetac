/// <reference path="../typings/index.d.ts"/>

if (typeof window != "undefined") {
    (<any>window).describe = (<any>window).describe || function () { };
}

module TS.SpaceTac {
    // Router between game views
    export class MainUI extends Phaser.Game {
        // Current game session
        session: GameSession;

        // Current focused star system
        star: Star;

        // Audio manager
        audio: UI.Audio;

        constructor(headless: boolean = false) {
            super(1920, 1080, headless ? Phaser.HEADLESS : Phaser.AUTO, '-space-tac');

            this.audio = new UI.Audio(this);

            this.session = new GameSession();
            this.star = null;

            this.state.add('boot', UI.Boot);
            this.state.add('preload', UI.Preload);
            this.state.add('mainmenu', UI.MainMenu);
            this.state.add('router', UI.Router);
            this.state.add('battle', UI.BattleView);
            this.state.add('universe', UI.UniverseMapView);

            this.state.start('boot');
        }

        // Save current game in local browser storage
        saveGame(): boolean {
            if (typeof (Storage) !== "undefined") {
                localStorage.setItem("spacetac-savegame", this.session.saveToString());
                (<UI.BaseView>this.state.getCurrentState()).messages.addMessage("Game saved");
                return true;
            } else {
                (<UI.BaseView>this.state.getCurrentState()).messages.addMessage("Your browser does not support saving");
                return false;
            }
        }

        // Load current game from local browser storage
        loadGame(): boolean {
            if (typeof (Storage) !== "undefined") {
                var loaded = localStorage.getItem("spacetac-savegame");
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

        // Get the focuses star system
        getFocusedStar(): Star {
            if (this.star && this.star.universe === this.session.universe) {
                return this.star;
            } else {
                return null;
            }
        }
    }
}
